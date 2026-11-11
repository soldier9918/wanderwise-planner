import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { requireMutable } from "../_shared/credits.ts";

// Free stock footage from Pixabay (royalty-free). Searches are cached to stay well under the API rate limit.
type PxFile = { url: string; width: number; height: number; size: number; thumbnail?: string };
type PxVideo = { id: number; duration: number; user: string; videos: Record<string, PxFile> };

const pickFile = (v: PxVideo) => {
  const files = ["medium", "large", "small", "tiny"].map((k) => v.videos?.[k]).filter((f): f is PxFile => !!f?.url);
  return files.sort((a, b) => Math.abs(Math.max(a.width, a.height) - 1280) - Math.abs(Math.max(b.width, b.height) - 1280))[0];
};
const thumbOf = (v: PxVideo) => v.videos?.medium?.thumbnail || v.videos?.small?.thumbnail || v.videos?.tiny?.thumbnail || "";

const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 15 * 60 * 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const key = Deno.env.get("PIXABAY_API_KEY");
    if (!key) return json({ error: "Stock footage isn't set up yet." }, 500);
    const { action, query, orientation, sceneId, pexelsId, clipId } = await req.json();
    const base = `https://pixabay.com/api/videos/?key=${encodeURIComponent(key)}&safesearch=true`;

    if (action === "search") {
      const q = String(query ?? "").trim().slice(0, 100);
      if (q.length < 2) return json({ error: "Type what footage you're looking for." }, 400);
      const o = ["landscape", "portrait", "square"].includes(orientation) ? orientation : "landscape";
      const ck = `${q.toLowerCase()}|${o}`;
      const hit = cache.get(ck);
      if (hit && Date.now() - hit.at < TTL) return json(hit.data);
      const res = await fetch(`${base}&q=${encodeURIComponent(q)}&per_page=30`);
      if (res.status === 429) return json({ error: "Lots of people are searching right now — try again in a minute." }, 429);
      if (!res.ok) { console.error("pixabay search", res.status, await res.text()); return json({ error: "Couldn't search stock footage right now." }, 502); }
      const body = await res.json();
      const all = ((body.hits ?? []) as PxVideo[]).map((v) => { const f = pickFile(v); return { id: v.id, thumb: thumbOf(v), duration: v.duration, author: v.user || "Pixabay", preview: f?.url ?? null, w: f?.width ?? 16, h: f?.height ?? 9 }; }).filter((r) => r.preview);
      const want = (r: { w: number; h: number }) => o === "portrait" ? r.h > r.w : o === "square" ? Math.abs(r.w - r.h) < r.w * 0.2 : r.w > r.h;
      const results = [...all.filter(want), ...all.filter((r) => !want(r))].slice(0, 12).map(({ w: _w, h: _h, ...r }) => r);
      const data = { results };
      cache.set(ck, { at: Date.now(), data });
      if (cache.size > 500) cache.delete(cache.keys().next().value!);
      return json(data);
    }

    if (action === "use") {
      const id = Number(clipId ?? pexelsId);
      if (!sceneId || !Number.isInteger(id)) return json({ error: "Invalid request." }, 400);
      const { data: scene, error } = await auth.client.from("video_scenes").select("id, video_id").eq("id", sceneId).maybeSingle();
      if (error) throw error;
      if (!scene) return json({ error: "Scene not found." }, 404);
      const locked = await requireMutable(auth.user.id);
      if (locked) return locked;
      const res = await fetch(`${base}&id=${id}`);
      if (!res.ok) return json({ error: "That clip is no longer available." }, 502);
      const v = ((await res.json()).hits ?? [])[0] as PxVideo | undefined;
      const file = v && pickFile(v);
      if (!v || !file) return json({ error: "That clip has no usable video file." }, 422);
      const dl = await fetch(file.url);
      if (!dl.ok) return json({ error: "Couldn't download that clip." }, 502);
      const bytes = new Uint8Array(await dl.arrayBuffer());
      if (bytes.length > 45 * 1024 * 1024) return json({ error: "That clip is too large — pick a shorter one." }, 413);
      const path = `${auth.user.id}/${scene.video_id}/${scene.id}-broll-${Date.now()}.mp4`;
      const { error: upErr } = await adminClient().storage.from("video-assets").upload(path, bytes, { contentType: "video/mp4", upsert: true });
      if (upErr) throw upErr;
      const credit = `Video by ${v.user || "Pixabay"} on Pixabay`;
      const { error: uErr } = await adminClient().from("video_scenes").update({ clip_path: path, clip_credit: credit, clip_job_id: null }).eq("id", scene.id);
      if (uErr) throw uErr;
      return json({ path, credit });
    }
    return json({ error: "Invalid request." }, 400);
  } catch (e) {
    console.error("stock-broll error", e);
    return json({ error: "Something went wrong with stock footage." }, 500);
  }
});
