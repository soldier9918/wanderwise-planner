import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { charge, refund } from "../_shared/credits.ts";
import { planTierOf } from "../_shared/tiers.ts";
import { effectiveQuality, exportFormat, exportCost, maxExportBytes, versionHash, exportDecision, RENDER_TIMEOUT_MS } from "../_shared/exports.ts";

// Secure export flow: check → start (charge + signed upload) → browser renders & uploads → complete | fail (refund once).
const BUCKET = "video-assets";
const PAID_REASONS = ["purchase", "topup", "subscription"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const uid = auth.user.id;
    const db = adminClient();
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "fail" || action === "complete") {
      const exportId = typeof body.exportId === "string" ? body.exportId : "";
      const { data: row } = await db.from("video_exports").select("*").eq("id", exportId).eq("user_id", uid).maybeSingle();
      if (!row) return json({ error: "Export not found." }, 404);
      if (action === "fail") {
        const { data: won } = await db.from("video_exports").update({ status: "failed", refunded: true }).eq("id", row.id).eq("status", "rendering").eq("refunded", false).select("id");
        if (won?.length) {
          await refund(uid, row.credits_charged, "refund_export");
          await db.storage.from(BUCKET).remove([row.path]);
        }
        return json({ refunded: !!won?.length ? row.credits_charged : 0 });
      }
      if (row.status === "completed") return json({ url: await signed(db, row.path), contentType: row.content_type });
      if (row.status !== "rendering") return json({ error: "This export was cancelled. Please export again." }, 409);
      // The file must exist at the server-chosen path; client claims about completion are not trusted.
      const dir = row.path.slice(0, row.path.lastIndexOf("/"));
      const name = row.path.slice(row.path.lastIndexOf("/") + 1);
      const { data: files } = await db.storage.from(BUCKET).list(dir, { search: name });
      const file = files?.find((f) => f.name === name);
      if (!file) return json({ error: "The finished video wasn't uploaded." }, 400);
      const size = Number(file.metadata?.size ?? 0);
      const paid = await isPaid(db, uid);
      if (!size || size > maxExportBytes(paid)) {
        const { data: won } = await db.from("video_exports").update({ status: "failed", refunded: true }).eq("id", row.id).eq("status", "rendering").eq("refunded", false).select("id");
        await db.storage.from(BUCKET).remove([row.path]);
        if (won?.length) await refund(uid, row.credits_charged, "refund_export");
        return json({ error: "The exported file was empty or too large to store." }, 413);
      }
      const contentType = String(file.metadata?.mimetype ?? (row.format === "mp4" ? "video/mp4" : "video/webm"));
      const { data: done } = await db.from("video_exports").update({ status: "completed", size_bytes: size, content_type: contentType, completed_at: new Date().toISOString() }).eq("id", row.id).eq("status", "rendering").select("id");
      if (!done?.length) return json({ error: "This export was cancelled. Please export again." }, 409);
      // Keep only the newest completed export per project to bound storage.
      const { data: old } = await db.from("video_exports").select("id, path").eq("video_id", row.video_id).eq("status", "completed").neq("id", row.id);
      if (old?.length) {
        await db.storage.from(BUCKET).remove(old.map((o) => o.path).filter(Boolean));
        await db.from("video_exports").update({ status: "superseded", path: null }).in("id", old.map((o) => o.id));
      }
      return json({ url: await signed(db, row.path), contentType });
    }

    if (action !== "check" && action !== "start") return json({ error: "Invalid request." }, 400);
    const videoId = typeof body.videoId === "string" ? body.videoId : "";
    const { data: video } = await auth.client.from("videos").select("*").eq("id", videoId).maybeSingle();
    if (!video) return json({ error: "Video not found." }, 404);
    const [{ data: scenes }, { data: cardRow }, { data: isAdmin }, { data: sub }, { data: bal }, { data: paidRow }] = await Promise.all([
      db.from("video_scenes").select("id, position, narration, image_path, audio_path, clip_path").eq("video_id", video.id).order("position"),
      db.from("user_brand_cards").select("cards").eq("user_id", uid).maybeSingle(),
      db.rpc("has_role", { _user_id: uid, _role: "admin" }),
      db.rpc("has_active_subscription", { _user_id: uid }),
      db.from("credit_ledger").select("amount").eq("user_id", uid),
      db.from("credit_ledger").select("id").eq("user_id", uid).in("reason", PAID_REASONS).gt("amount", 0).limit(1),
    ]);
    const { data: subRow } = await db.from("user_subscriptions").select("plan_tier").eq("user_id", uid).eq("livemode", (await db.rpc("stripe_livemode")).data === true).maybeSingle();
    if (!scenes?.length || scenes.some((s) => !s.image_path)) return json({ error: "Every scene needs an image before exporting." }, 400);
    const admin = isAdmin === true, paid = admin || sub === true;
    // 1080p exports are Pro (or admin) only; Free and Creator always render 720p.
    const quality = effectiveQuality(video.quality, planTierOf(admin, sub, subRow?.plan_tier) === "pro");
    const format = exportFormat(body.format);
    const watermark = false; // no forced badge on any plan
    const hash = await versionHash(video, scenes, cardRow?.cards ?? null, { quality, format, watermark });
    const cost = exportCost(quality);
    const balance = (bal ?? []).reduce((n, r) => n + Number(r.amount), 0);

    await expireStale(db, video.id);
    const { data: hit } = await db.from("video_exports").select("id, path, content_type").eq("video_id", video.id).eq("version_hash", hash).eq("quality", quality).eq("format", format).eq("status", "completed").order("completed_at", { ascending: false }).limit(1);
    let completed = hit?.[0] ?? null;
    if (completed && !(await exists(db, completed.path))) {
      await db.from("video_exports").update({ status: "superseded", path: null }).eq("id", completed.id);
      completed = null;
    }
    const { data: inflight } = await db.from("video_exports").select("id").eq("video_id", video.id).eq("status", "rendering").limit(1);
    const decision = exportDecision({ hasCompleted: !!completed, rendering: !!inflight?.length, isAdmin: admin, balance, cost });

    if (action === "check") return json({ decision, cost: admin ? 0 : cost, quality, format, watermark });
    if (decision === "download") return json({ decision, url: await signed(db, completed!.path), contentType: completed!.content_type });
    if (decision === "busy") return json({ error: "An export of this video is already in progress.", decision }, 409);

    const denied = await charge(uid, cost, "video_export");
    if (denied) return denied;
    const charged = admin ? 0 : cost;
    const id = crypto.randomUUID();
    const path = `${uid}/${video.id}/exports/${id}.${format}`;
    const { error: insErr } = await db.from("video_exports").insert({ id, user_id: uid, video_id: video.id, version_hash: hash, quality, format, path, credits_charged: charged });
    if (insErr) {
      await refund(uid, charged, "refund_export");
      return json({ error: "An export of this video is already in progress.", decision: "busy" }, 409);
    }
    const { data: up, error: upErr } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (upErr || !up) {
      await db.from("video_exports").update({ status: "failed", refunded: true }).eq("id", id).eq("refunded", false);
      await refund(uid, charged, "refund_export");
      throw upErr ?? new Error("no upload url");
    }
    return json({ decision: "render", exportId: id, path, token: up.token, quality, format, watermark, charged, maxBytes: maxExportBytes(paid) });
  } catch (e) {
    console.error("video-export error", e);
    return json({ error: "Something went wrong with the export." }, 500);
  }
});

// deno-lint-ignore no-explicit-any
type Db = any;
async function signed(db: Db, path: string) {
  const { data } = await db.storage.from(BUCKET).createSignedUrl(path, 60 * 60, { download: true });
  return data?.signedUrl ?? null;
}
async function exists(db: Db, path: string | null) {
  if (!path) return false;
  const i = path.lastIndexOf("/");
  const { data } = await db.storage.from(BUCKET).list(path.slice(0, i), { search: path.slice(i + 1) });
  return !!data?.some((f: { name: string }) => f.name === path.slice(i + 1));
}
async function isPaid(db: Db, uid: string) {
  const [{ data: a }, { data: s }] = await Promise.all([db.rpc("has_role", { _user_id: uid, _role: "admin" }), db.rpc("has_active_subscription", { _user_id: uid })]);
  return a === true || s === true;
}
/** Abandoned renders are failed and refunded exactly once (atomic status flip). */
async function expireStale(db: Db, videoId: string) {
  const cutoff = new Date(Date.now() - RENDER_TIMEOUT_MS).toISOString();
  const { data: stale } = await db.from("video_exports").update({ status: "failed", refunded: true }).eq("video_id", videoId).eq("status", "rendering").eq("refunded", false).lt("created_at", cutoff).select("id, user_id, credits_charged, path");
  for (const s of stale ?? []) {
    await refund(s.user_id, s.credits_charged, "refund_export");
    if (s.path) await db.storage.from(BUCKET).remove([s.path]);
  }
}
