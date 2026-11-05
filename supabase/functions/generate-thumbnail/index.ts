import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient, gatewayError } from "../_shared/common.ts";

const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";

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
    const { videoId } = await req.json();
    if (!videoId) return json({ error: "Invalid request." }, 400);

    // RLS ensures the video belongs to the caller.
    const { data: video, error } = await auth.client
      .from("videos")
      .select("id, title, topic, style, aspect_ratio")
      .eq("id", videoId)
      .maybeSingle();
    if (error) throw error;
    if (!video) return json({ error: "Video not found." }, 404);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const size = ({ "16:9": "1536x1024", "21:9": "1536x1024", "9:16": "1024x1536", "4:5": "1024x1536", "1:1": "1024x1024" } as Record<string, string>)[video.aspect_ratio ?? "16:9"] ?? "1536x1024";
    const prompt =
      `A click-worthy YouTube thumbnail for a video titled "${video.title}". ` +
      `Topic: ${video.topic}. Visual style: ${video.style}. ` +
      `Bold, high-contrast, eye-catching composition with one striking focal subject. ` +
      `Include the title text "${video.title}" in large, bold, easy-to-read lettering with strong contrast against the background. ` +
      `Vibrant colours, dramatic lighting, no watermarks, no logos, no extra words beyond the title.`;

    const res = await fetch(`${GATEWAY_URL}/v1/images/generations`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: IMAGE_MODEL, prompt, size, quality: "medium" }),
    });
    if (!res.ok) return gatewayError(res);
    const body = await res.json();
    const b64 = body?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No image was returned. Please try again." }, 502);

    const path = `${auth.user.id}/${video.id}/thumbnail-${Date.now()}.png`;
    const admin = adminClient();
    const { error: upErr } = await admin.storage.from("video-assets").upload(path, b64ToBytes(b64), { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { error: updErr } = await auth.client.from("videos").update({ thumbnail_path: path }).eq("id", video.id);
    if (updErr) throw updErr;

    return json({ path });
  } catch (e) {
    console.error("generate-thumbnail error", e);
    return json({ error: "Something went wrong creating the thumbnail." }, 500);
  }
});
