import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";

// Free stock footage from Pexels (royalty-free, attribution appreciated).
type PexelsFile = { link: string; width: number; height: number; quality: string; file_type: string };
type PexelsVideo = { id: number; image: string; duration: number; url: string; user: { name: string }; video_files: PexelsFile[] };

const pickFile = (v: PexelsVideo) =>
  v.video_files
    .filter((f) => f.file_type === "video/mp4" && f.link)
    .sort((a, b) => Math.abs(Math.max(a.width, a.height) - 1280) - Math.abs(Math.max(b.width, b.height) - 1280))[0];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const key = Deno.env.get("PEXELS_API_KEY");
    if (!key) return json({ error: "Stock footage isn't set up yet." }, 500);
    const { action, query, orientation, sceneId, pexelsId } = await req.json();

    if (action === "search") {
      const q = String(query ?? "").trim().slice(0, 100);
      if (q.length < 2) return json({ error: "Type what footage you're looking for." }, 400);
      const o = ["landscape", "portrait", "square"].includes(orientation) ? orientation : "landscape";
      const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=12&orientation=${o}`, { headers: { Authorization: key } });
      if (!res.ok) { console.error("pexels search", res.status, await res.text()); return json({ error: "Couldn't search stock footage right now." }, 502); }
      const body = await res.json();
      const results = ((body.videos ?? []) as PexelsVideo[]).map((v) => ({ id: v.id, thumb: v.image, duration: v.duration, author: v.user?.name ?? "Pexels", preview: pickFile(v)?.link ?? null })).filter((r) => r.preview);
      return json({ results });
    }

    if (action === "use") {
      if (!sceneId || !Number.isInteger(Number(pexelsId))) return json({ error: "Invalid request." }, 400);
      const { data: scene, error } = await auth.client.from("video_scenes").select("id, video_id").eq("id", sceneId).maybeSingle();
      if (error) throw error;
      if (!scene) return json({ error: "Scene not found." }, 404);
      const res = await fetch(`https://api.pexels.com/videos/videos/${Number(pexelsId)}`, { headers: { Authorization: key } });
      if (!res.ok) return json({ error: "That clip is no longer available." }, 502);
      const v = (await res.json()) as PexelsVideo;
      const file = pickFile(v);
      if (!file) return json({ error: "That clip has no usable video file." }, 422);
      const dl = await fetch(file.link);
      if (!dl.ok) return json({ error: "Couldn't download that clip." }, 502);
      const bytes = new Uint8Array(await dl.arrayBuffer());
      if (bytes.length > 45 * 1024 * 1024) return json({ error: "That clip is too large — pick a shorter one." }, 413);
      const path = `${auth.user.id}/${scene.video_id}/${scene.id}-broll-${Date.now()}.mp4`;
      const { error: upErr } = await adminClient().storage.from("video-assets").upload(path, bytes, { contentType: "video/mp4", upsert: true });
      if (upErr) throw upErr;
      const credit = `Video by ${v.user?.name ?? "Pexels"} on Pexels`;
      const { error: uErr } = await auth.client.from("video_scenes").update({ clip_path: path, clip_credit: credit, clip_job_id: null }).eq("id", scene.id);
      if (uErr) throw uErr;
      return json({ path, credit });
    }
    return json({ error: "Invalid request." }, 400);
  } catch (e) {
    console.error("stock-broll error", e);
    return json({ error: "Something went wrong with stock footage." }, 500);
  }
});
