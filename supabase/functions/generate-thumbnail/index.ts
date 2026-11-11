import { charge, refund, COSTS } from "../_shared/credits.ts";
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
    const { videoId, mode, text, textSize } = await req.json();
    const sizeWords = ["small and tucked into a corner, taking up about 10% of the image", "modest, taking up about 20% of the image", "large, taking up about 35% of the image", "very large, taking up about half of the image", "huge, filling most of the image"][Math.min(4, Math.max(0, Math.round(Number(textSize) || 3) - 1))];
    const custom = typeof text === "string" ? text.trim().slice(0, 80) : "";
    if (!videoId) return json({ error: "Invalid request." }, 400);

    // RLS ensures the video belongs to the caller.
    const { data: video, error } = await auth.client
      .from("videos")
      .select("id, title, topic, style, aspect_ratio, thumbnail_path")
      .eq("id", videoId)
      .maybeSingle();
    if (error) throw error;
    if (!video) return json({ error: "Video not found." }, 404);

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    if ((mode === "text" || custom) && !video.thumbnail_path) return json({ error: "Make a thumbnail first." }, 400);
    const COST = COSTS.thumbnail;
    const denied = await charge(auth.user.id, COST, "thumbnail");
    if (denied) return denied;
    let charged = COST;
    try {

    const size = ({ "16:9": "1536x1024", "21:9": "1536x1024", "9:16": "1024x1536", "4:5": "1024x1536", "1:1": "1024x1024" } as Record<string, string>)[video.aspect_ratio ?? "16:9"] ?? "1536x1024";
    const prompt =
      `A professional, viral-quality YouTube thumbnail for a video titled "${video.title}" (topic: ${video.topic}). ` +
      `Art direction: ${video.style}, rendered as a cinematic, ultra-detailed, polished key-art image like a top creator's thumbnail. ` +
      `One large, striking focal subject filling much of the frame, shallow depth of field, dramatic rim lighting, rich saturated colours, strong colour contrast between subject and background, subtle glow and atmosphere. ` +
      `Add a short punchy hook of 2 to 4 words taken from the title (not the whole title), in huge bold condensed all-caps lettering with a thick outline and drop shadow, placed in clear space so it never covers the subject. Spell it exactly. ` +
      `Clean composition readable at small size. No watermarks, no logos, no channel names, no extra words.`;

    const words = custom || video.title;
    let res: Response;
    if (mode === "text" || custom) {
      // Keep the picture, redo only the lettering.
      if (!video.thumbnail_path) return json({ error: "Make a thumbnail first." }, 400);
      const { data: file, error: dlErr } = await adminClient().storage.from("video-assets").download(video.thumbnail_path);
      if (dlErr || !file) throw dlErr ?? new Error("thumbnail missing");
      const looks = ["chunky 3D extruded letters", "brush-stroke hand-painted letters", "neon glowing tube letters", "condensed all-caps with thick outline", "grunge distressed stencil letters", "sleek metallic chrome letters", "comic-book pop letters with halftone", "elegant serif with drop shadow", "glitchy digital letters", "bold sticker-style letters with white border"];
      const colours = ["yellow and black", "red and white", "electric blue and white", "lime green and black", "hot pink and cyan", "orange and deep purple", "gold and dark brown", "white with a red glow"];
      const look = looks[Math.floor(Math.random() * looks.length)];
      const colour = colours[Math.floor(Math.random() * colours.length)];
      const editPrompt =
        `Remove all existing text and lettering from this YouTube thumbnail and keep the picture otherwise the same. ` +
        `Then add the text "${words}" in a completely new typography style: ${look}, in ${colour}, with a different placement from before. The text must be ${sizeWords}. ` +
        `Bold, easy to read, strong contrast. Spell the text exactly. No other words, no watermarks, no logos.`;
      const form = new FormData();
      form.append("model", IMAGE_MODEL);
      form.append("prompt", editPrompt);
      form.append("size", size);
      form.append("quality", "high");
      form.append("image", new File([await file.arrayBuffer()], "thumb.png", { type: "image/png" }));
      res = await fetch(`${GATEWAY_URL}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form });
    } else {
      res = await fetch(`${GATEWAY_URL}/v1/images/generations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: IMAGE_MODEL, prompt, size, quality: "high" }),
      });
    }
    if (!res.ok) return gatewayError(res);
    const body = await res.json();
    const b64 = body?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "No image was returned. Please try again." }, 502);

    const path = `${auth.user.id}/${video.id}/thumbnail-${Date.now()}.png`;
    const admin = adminClient();
    const { error: upErr } = await admin.storage.from("video-assets").upload(path, b64ToBytes(b64), { contentType: "image/png", upsert: true });
    if (upErr) throw upErr;

    const { error: updErr } = await adminClient().from("videos").update({ thumbnail_path: path }).eq("id", video.id);
    if (updErr) throw updErr;

    charged = 0;
    return json({ path });
    } finally {
      if (charged) await refund(auth.user.id, charged, "refund_thumbnail");
    }
  } catch (e) {
    console.error("generate-thumbnail error", e);
    return json({ error: "Something went wrong creating the thumbnail." }, 500);
  }
});
