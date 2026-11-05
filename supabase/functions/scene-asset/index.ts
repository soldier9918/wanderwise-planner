import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient, gatewayError } from "../_shared/common.ts";

const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";

function b64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { sceneId, kind } = await req.json();
    if (!sceneId || (kind !== "image" && kind !== "audio")) return json({ error: "Invalid request." }, 400);

    // RLS ensures the scene belongs to the caller.
    const { data: scene, error } = await auth.client
      .from("video_scenes")
      .select("id, video_id, narration, visual_prompt, videos(voice)")
      .eq("id", sceneId)
      .maybeSingle();
    if (error) throw error;
    if (!scene) return json({ error: "Scene not found." }, 404);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    let bytes: Uint8Array;
    let contentType: string;
    let ext: string;

    if (kind === "image") {
      const res = await fetch(`${GATEWAY_URL}/v1/images/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: IMAGE_MODEL, prompt: scene.visual_prompt, size: "1536x1024", quality: "low" }),
      });
      if (!res.ok) return gatewayError(res);
      const body = await res.json();
      const b64 = body?.data?.[0]?.b64_json;
      if (!b64) return json({ error: "No image was returned. Please try again." }, 502);
      bytes = b64ToBytes(b64);
      contentType = "image/png";
      ext = "png";
    } else {
      // deno-lint-ignore no-explicit-any
      const voice = (scene as any).videos?.voice ?? "Kore";
      const res = await fetch(`${GATEWAY_URL}/v1/audio/speech`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: SPEECH_MODEL,
          contents: [{ role: "user", parts: [{ text: `Narrate in an engaging YouTube voiceover tone: ${scene.narration}` }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
          stream_format: "audio",
        }),
      });
      if (!res.ok) return gatewayError(res);
      bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.length < 100) return json({ error: "No audio was returned. Please try again." }, 502);
      contentType = res.headers.get("Content-Type") ?? "audio/wav";
      ext = contentType.includes("mpeg") ? "mp3" : "wav";
    }

    const path = `${auth.user.id}/${scene.video_id}/${scene.id}-${kind}-${Date.now()}.${ext}`;
    const admin = adminClient();
    const { error: upErr } = await admin.storage.from("video-assets").upload(path, bytes, { contentType, upsert: true });
    if (upErr) throw upErr;

    const column = kind === "image" ? "image_path" : "audio_path";
    const { error: updErr } = await auth.client.from("video_scenes").update({ [column]: path }).eq("id", scene.id);
    if (updErr) throw updErr;

    return json({ path });
  } catch (e) {
    console.error("scene-asset error", e);
    return json({ error: "Something went wrong creating this scene." }, 500);
  }
});
