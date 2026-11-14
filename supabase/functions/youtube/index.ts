import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";

// Direct YouTube publishing: OAuth connect (callback lands here), status, disconnect, publish latest export.
const BUCKET = "video-assets";
const CLIENT_ID = Deno.env.get("GOOGLE_YOUTUBE_CLIENT_ID") ?? "";
const CLIENT_SECRET = Deno.env.get("GOOGLE_YOUTUBE_CLIENT_SECRET") ?? "";
const STATE_SECRET = Deno.env.get("YOUTUBE_STATE_SECRET") ?? "";
const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/youtube`;
const SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly";
const ALLOWED_ORIGINS = ["https://vydora.ai", "https://www.vydora.ai", "https://story-scene-voice-maker.lovable.app"];

const b64url = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(STATE_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))));
}
function safeReturn(url: string) {
  try {
    const u = new URL(url);
    const ok = ALLOWED_ORIGINS.includes(u.origin) || u.hostname.endsWith(".lovable.app") || u.hostname.endsWith(".lovableproject.com") || u.hostname === "localhost";
    return ok ? u.toString() : "https://vydora.ai/dashboard";
  } catch { return "https://vydora.ai/dashboard"; }
}
function back(ret: string, status: string) {
  const u = new URL(ret); u.searchParams.set("youtube", status);
  return new Response(null, { status: 302, headers: { Location: u.toString() } });
}

async function freshToken(db: ReturnType<typeof adminClient>, uid: string) {
  const { data: c } = await db.from("youtube_connections").select("*").eq("user_id", uid).maybeSingle();
  if (!c) return null;
  if (new Date(c.expires_at).getTime() - 60_000 > Date.now()) return c.access_token as string;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, refresh_token: c.refresh_token, grant_type: "refresh_token" }),
  });
  const t = await res.json();
  if (!res.ok || !t.access_token) {
    if (t.error === "invalid_grant") await db.from("youtube_connections").delete().eq("user_id", uid);
    return null;
  }
  await db.from("youtube_connections").update({ access_token: t.access_token, expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString() }).eq("user_id", uid);
  return t.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const db = adminClient();

  // OAuth callback from Google.
  if (req.method === "GET") {
    const url = new URL(req.url);
    const state = url.searchParams.get("state") ?? "";
    const [payload, sig] = state.split(".");
    let ret = "https://vydora.ai/dashboard";
    try {
      if (!payload || !sig || sig !== await hmac(payload)) return new Response("Invalid request", { status: 400 });
      const { uid, ts, r } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      ret = safeReturn(r);
      if (Date.now() - ts > 15 * 60_000) return back(ret, "expired");
      const code = url.searchParams.get("code");
      if (!code) return back(ret, "cancelled");
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: "authorization_code" }),
      });
      const t = await res.json();
      if (!res.ok || !t.access_token) return back(ret, "error");
      const ch = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json());
      const item = ch.items?.[0];
      if (!item) return back(ret, "nochannel");
      const { data: existing } = await db.from("youtube_connections").select("refresh_token").eq("user_id", uid).maybeSingle();
      const refresh = t.refresh_token ?? existing?.refresh_token;
      if (!refresh) return back(ret, "error");
      await db.from("youtube_connections").upsert({
        user_id: uid, channel_id: item.id, channel_title: item.snippet?.title ?? "", channel_thumbnail: item.snippet?.thumbnails?.default?.url ?? null,
        access_token: t.access_token, refresh_token: refresh, expires_at: new Date(Date.now() + t.expires_in * 1000).toISOString(), connected_at: new Date().toISOString(),
      });
      return back(ret, "connected");
    } catch (e) {
      console.error("youtube callback", e);
      return back(ret, "error");
    }
  }

  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const uid = auth.user.id;
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "status") {
      const { data: c } = await db.from("youtube_connections").select("channel_id, channel_title, channel_thumbnail").eq("user_id", uid).maybeSingle();
      return json({ configured: !!(CLIENT_ID && CLIENT_SECRET), connection: c ?? null });
    }

    if (action === "auth_url") {
      if (!CLIENT_ID || !CLIENT_SECRET) return json({ error: "YouTube publishing isn't set up yet." }, 503);
      const r = safeReturn(typeof body.returnTo === "string" ? body.returnTo : "");
      const payload = b64url(new TextEncoder().encode(JSON.stringify({ uid, ts: Date.now(), r })));
      const state = `${payload}.${await hmac(payload)}`;
      const p = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: "code", scope: SCOPES, access_type: "offline", prompt: "consent", include_granted_scopes: "true", state });
      return json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${p}` });
    }

    if (action === "disconnect") {
      const { data: c } = await db.from("youtube_connections").select("refresh_token").eq("user_id", uid).maybeSingle();
      if (c) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(c.refresh_token)}`, { method: "POST" }).catch(() => {});
      await db.from("youtube_connections").delete().eq("user_id", uid);
      return json({ ok: true });
    }

    if (action === "publish") {
      const videoId = typeof body.videoId === "string" ? body.videoId : "";
      const title = String(body.title ?? "").trim().slice(0, 100);
      const description = String(body.description ?? "").slice(0, 5000).replace(/[<>]/g, "");
      const tags = Array.isArray(body.tags) ? body.tags.map((t: unknown) => String(t).slice(0, 60)).slice(0, 30) : [];
      const privacy = ["public", "unlisted", "private"].includes(body.privacy) ? body.privacy : "private";
      const synthetic = body.synthetic !== false;
      const kids = body.madeForKids === true;
      let publishAt: string | null = null;
      if (body.publishAt) {
        const t = new Date(String(body.publishAt)).getTime();
        if (!Number.isFinite(t) || t < Date.now() + 5 * 60_000 || t > Date.now() + 180 * 86400_000) return json({ error: "Pick a release time at least 5 minutes ahead and within 6 months." }, 400);
        publishAt = new Date(t).toISOString();
      }
      if (!title) return json({ error: "Please add a title." }, 400);
      const { data: video } = await auth.client.from("videos").select("id, thumbnail_path").eq("id", videoId).maybeSingle();
      if (!video) return json({ error: "Video not found." }, 404);
      const { data: exp } = await db.from("video_exports").select("path, content_type, size_bytes").eq("video_id", videoId).eq("user_id", uid).eq("status", "completed").order("completed_at", { ascending: false }).limit(1).maybeSingle();
      if (!exp?.path) return json({ error: "Your video isn't rendered yet — please try publishing again." }, 400);
      const token = await freshToken(db, uid);
      if (!token) return json({ error: "Please connect your YouTube channel again.", reconnect: true }, 401);

      const { data: row } = await db.from("youtube_uploads").insert({ user_id: uid, video_id: videoId, privacy: publishAt ? "scheduled" : privacy, publish_at: publishAt, title }).select("id").single();
      const fail = async (msg: string, status = 502) => { await db.from("youtube_uploads").update({ status: "failed", error: msg }).eq("id", row!.id); return json({ error: msg }, status); };

      const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Upload-Content-Type": exp.content_type ?? "video/mp4", "X-Upload-Content-Length": String(exp.size_bytes ?? 0) },
        body: JSON.stringify({
          snippet: { title, description, tags, categoryId: "22" },
          status: { privacyStatus: publishAt ? "private" : privacy, ...(publishAt ? { publishAt } : {}), selfDeclaredMadeForKids: kids, containsSyntheticMedia: synthetic },
        }),
      });
      if (!init.ok) {
        const e = await init.json().catch(() => ({}));
        const reason = e?.error?.errors?.[0]?.reason;
        console.error("youtube init", init.status, JSON.stringify(e));
        if (reason === "quotaExceeded" || reason === "uploadLimitExceeded") return fail("YouTube's daily upload limit has been reached. Please try again tomorrow.", 429);
        return fail(e?.error?.message ?? "YouTube refused the upload.");
      }
      const uploadUrl = init.headers.get("Location")!;
      const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(exp.path, 600);
      const file = await fetch(signed!.signedUrl);
      if (!file.ok || !file.body) return fail("Couldn't read your exported video.");
      const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": exp.content_type ?? "video/mp4", "Content-Length": String(exp.size_bytes ?? file.headers.get("content-length") ?? "") }, body: file.body });
      const out = await put.json().catch(() => ({}));
      if (!put.ok || !out.id) { console.error("youtube put", put.status, JSON.stringify(out)); return fail(out?.error?.message ?? "Upload to YouTube failed."); }
      await db.from("youtube_uploads").update({ status: "uploaded", youtube_video_id: out.id }).eq("id", row!.id);
      // Best-effort: set the saved Vydora thumbnail (YouTube limit 2 MB; channel must be verified for custom thumbnails).
      let thumbnail: "set" | "none" | "too_large" | "not_allowed" | "failed" = "none";
      const tp = (video as { thumbnail_path?: string | null }).thumbnail_path;
      if (tp && tp.startsWith(`${uid}/`)) {
        try {
          const { data: blob } = await db.storage.from(BUCKET).download(tp);
          if (!blob) thumbnail = "failed";
          else if (blob.size > 2 * 1024 * 1024) thumbnail = "too_large";
          else {
            const type = blob.type && blob.type.startsWith("image/") ? blob.type : (tp.endsWith(".jpg") || tp.endsWith(".jpeg") ? "image/jpeg" : "image/png");
            const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${out.id}&uploadType=media`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": type }, body: blob });
            if (t.ok) thumbnail = "set";
            else { const e = await t.json().catch(() => ({})); console.error("youtube thumb", t.status, JSON.stringify(e)); thumbnail = t.status === 403 ? "not_allowed" : "failed"; }
          }
        } catch (e) { console.error("youtube thumb", e); thumbnail = "failed"; }
      }
      return json({ thumbnail, youtubeId: out.id, url: `https://youtu.be/${out.id}`, studioUrl: `https://studio.youtube.com/video/${out.id}/edit` });
    }

    return json({ error: "Invalid request." }, 400);
  } catch (e) {
    console.error("youtube", e);
    return json({ error: "Something went wrong with YouTube." }, 500);
  }
});
