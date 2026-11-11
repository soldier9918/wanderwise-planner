import { charge, refund, COSTS } from "../_shared/credits.ts";
import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient, gatewayError } from "../_shared/common.ts";
import { toneOf } from "../_shared/tones.ts";

const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
const SPEECH_MODEL = "google/gemini-3.1-flash-tts-preview";

const ACCENTS: Record<string, string> = {
  british: "a natural British (Received Pronunciation) accent",
  us: "a natural General American accent",
  australian: "a natural Australian accent",
  scottish: "a natural Scottish accent",
};
const accentLine = (a?: string) => (a && ACCENTS[a] ? `, with ${ACCENTS[a]}` : "");

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
      .select("id, video_id, narration, visual_prompt, videos(voice, aspect_ratio, tone, accent)")
      .eq("id", sceneId)
      .maybeSingle();
    if (error) throw error;
    if (!scene) return json({ error: "Scene not found." }, 404);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const COST = kind === "image" ? COSTS.image : COSTS.voice;
    const denied = await charge(auth.user.id, COST, kind === "image" ? "scene_image" : "scene_voice");
    if (denied) return denied;
    let charged = COST;
    try {

    let bytes: Uint8Array;
    let contentType: string;
    let ext: string;

    if (kind === "image") {
      // Match the picture to the video's shape (the generator only offers three sizes).
      // deno-lint-ignore no-explicit-any
      const ratio = (scene as any).videos?.aspect_ratio ?? "16:9";
      const size = ({ "16:9": "1536x1024", "21:9": "1536x1024", "9:16": "1024x1536", "4:5": "1024x1536", "1:1": "1024x1024" } as Record<string, string>)[ratio] ?? "1536x1024";
      const gen = (prompt: string) => fetch(`${GATEWAY_URL}/v1/images/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: IMAGE_MODEL, prompt, size, quality: "low" }),
      });
      const res = await gen(scene.visual_prompt);
      if (!res.ok && res.status === 400) {
        const text = await res.text();
        if (/safety|violation|moderation|content policy/i.test(text)) {
          return json({ error: "The image safety filter blocked this scene's picture. Please use Upload image to add your own picture for this scene. No credits were used." }, 422);
        }
        return json({ error: "The image service rejected this scene. Please try again." }, 400);
      }
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
          contents: [{ role: "user", parts: [{ // deno-lint-ignore no-explicit-any
          text: `${toneOf((scene as any).videos?.tone).voice}${accentLine((scene as any).videos?.accent)}: ${scene.narration}` }] }],
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
    const { error: updErr } = await adminClient().from("video_scenes").update(kind === "image" ? { image_path: path, clip_path: null, clip_credit: null } : { audio_path: path }).eq("id", scene.id);
    if (updErr) throw updErr;

    charged = 0;
    return json({ path });
    } finally {
      if (charged) await refund(auth.user.id, charged, "refund_scene_asset");
    }
  } catch (e) {
    console.error("scene-asset error", e);
    return json({ error: "Something went wrong creating this scene." }, 500);
  }
});
