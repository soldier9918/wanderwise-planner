import { charge, refund, COSTS } from "../_shared/credits.ts";
import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient, gatewayError } from "../_shared/common.ts";

const VIDEO_MODEL = "google/gemini-omni-1.1-flash";

function toB64(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { sceneId, action, seconds } = await req.json();
    const clipSecs = Math.min(10, Math.max(3, Math.ceil(typeof seconds === "number" && isFinite(seconds) ? seconds : 6)));
    if (typeof sceneId !== "string" || (action !== "start" && action !== "status")) return json({ error: "Invalid request." }, 400);

    const { data: scene, error } = await auth.client
      .from("video_scenes")
      .select("id, video_id, narration, visual_prompt, image_path, clip_job_id, videos(aspect_ratio)")
      .eq("id", sceneId).maybeSingle();
    if (error) throw error;
    if (!scene) return json({ error: "Scene not found." }, 404);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    const admin = adminClient();

    if (action === "start") {
      if (!scene.image_path) return json({ error: "Make or upload an image for this scene first." }, 400);
      if (scene.clip_job_id) return json({ error: "This scene is already being animated." }, 409);
      const denied = await charge(auth.user.id, COSTS.animate, "animate_scene");
      if (denied) return denied;
      let charged: number = COSTS.animate;
      try {
      const { data: file, error: dlErr } = await admin.storage.from("video-assets").download(scene.image_path);
      if (dlErr || !file) return json({ error: "Couldn't read this scene's image." }, 500);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mime = file.type && file.type.startsWith("image/") ? file.type : "image/png";
      // deno-lint-ignore no-explicit-any
      const ratio = (scene as any).videos?.aspect_ratio ?? "16:9";
      const aspect = ["9:16", "4:5"].includes(ratio) ? "9:16" : "16:9";
      const prompt = `<FIRST_FRAME> Bring this still image to life in a single continuous shot, no scene cuts. ` +
        `Animate the subject naturally and add living environmental motion that fits the scene (for example water currents, drifting particles, swaying plants, moving clouds, flickering light). ` +
        `Scene context: ${scene.visual_prompt}. Gentle slow camera push-in. The motion must keep evolving for the full ${clipSecs} seconds and never repeat or loop. ` +
        `Keep the subject's look, the composition, art style and colours unchanged. Consider micro-detail and natural physics. ` +
        `No on-screen text, no captions. Audio: no music, no dialogue, no sound.`;
      const res = await fetch(`${GATEWAY_URL}/v1/videos`, {
        method: "POST", headers,
        body: JSON.stringify({
          model: VIDEO_MODEL,
          input: [{ type: "image", data: toB64(bytes), mime_type: mime }, { type: "text", text: prompt }],
          response_format: { type: "video", resolution: "720p", duration: `${clipSecs}s`, aspect_ratio: aspect },
        }),
      });
      if (!res.ok) return gatewayError(res);
      const job = await res.json();
      if (!job?.id) return json({ error: "The animation could not start. Please try again." }, 502);
      await auth.client.from("video_scenes").update({ clip_job_id: job.id }).eq("id", scene.id);
      charged = 0;
      return json({ jobId: job.id, status: job.status ?? "queued" });
      } finally {
        if (charged) await refund(auth.user.id, charged, "refund_animate");
      }
    }

    // status
    if (!scene.clip_job_id) return json({ status: "none" });
    const res = await fetch(`${GATEWAY_URL}/v1/videos/${scene.clip_job_id}`, { headers });
    if (!res.ok) return gatewayError(res);
    const job = await res.json();
    if (job.status === "failed") {
      // Refund once: only the poll that clears the job id gives credits back.
      const { data: cleared } = await auth.client.from("video_scenes").update({ clip_job_id: null }).eq("id", scene.id).eq("clip_job_id", scene.clip_job_id).select("id");
      if (cleared?.length) await refund(auth.user.id, COSTS.animate, "refund_animate");
      const blocked = job.error?.code === "moderation_blocked" || job.error?.code === "invalid_request";
      return json({ status: "failed", error: blocked ? "The animation was blocked — this image may be the cause. Try a different image." : (job.error?.message ?? "Animation failed.") });
    }
    if (job.status !== "completed") return json({ status: job.status, progress: job.progress ?? null });
    const vid = await fetch(`${GATEWAY_URL}/v1/videos/${scene.clip_job_id}/content`, { headers });
    if (!vid.ok) return gatewayError(vid);
    const mp4 = new Uint8Array(await vid.arrayBuffer());
    const path = `${auth.user.id}/${scene.video_id}/${scene.id}-clip-${Date.now()}.mp4`;
    const { error: upErr } = await admin.storage.from("video-assets").upload(path, mp4, { contentType: "video/mp4", upsert: true });
    if (upErr) throw upErr;
    await auth.client.from("video_scenes").update({ clip_path: path, clip_credit: null, clip_job_id: null }).eq("id", scene.id);
    return json({ status: "completed", path });
  } catch (e) {
    console.error("animate-scene error", e);
    return json({ error: "Something went wrong animating this scene." }, 500);
  }
});
