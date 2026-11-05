import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai@6";
import { z } from "npm:zod@3";
import { corsHeaders, GATEWAY_URL, json, getUserClient } from "../_shared/common.ts";

const schema = z.object({
  title: z.string(),
  description: z.string(),
  scenes: z.array(
    z.object({
      heading: z.string(),
      narration: z.string(),
      visual_prompt: z.string(),
    }),
  ),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);

    const { topic, style = "Documentary", voice = "Kore", sceneCount = 6 } = await req.json();
    if (typeof topic !== "string" || topic.trim().length < 3) return json({ error: "Please describe your video idea." }, 400);
    const count = Math.min(10, Math.max(3, Number(sceneCount) || 6));

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "You are a YouTube scriptwriter. Write engaging, punchy faceless-channel scripts. Open with a strong hook in scene 1 and end with a call to subscribe. Each scene's narration is 2-4 spoken sentences (about 10-15 seconds). Each visual_prompt describes one striking cinematic 16:9 still image for that scene, with no text or letters in the image. The title is a click-worthy YouTube title under 70 characters; description is a 2-3 sentence YouTube description.",
      messages: [
        { role: "user", content: `Video idea: ${topic.trim()}\nVisual style: ${style}\nNumber of scenes: exactly ${count}` },
      ],
      output: Output.object({ schema }),
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    let output: z.infer<typeof schema>;
    try {
      output = await result.output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return json({ error: "The AI returned an unexpected script. Please try again." }, 502);
      const status = (e as { statusCode?: number })?.statusCode ?? 500;
      if (status === 402) return json({ error: "Your workspace is out of AI credits. Add credits in Settings → Plans & credits." }, 402);
      if (status === 429) return json({ error: "Too many requests right now — please wait a moment and try again." }, 429);
      throw e;
    }

    const scenes = output.scenes.slice(0, count).filter((s) => s.narration?.trim());
    if (!scenes.length) return json({ error: "No scenes were written. Please try again." }, 502);

    const { client, user } = auth;
    const { data: video, error: vErr } = await client
      .from("videos")
      .insert({ user_id: user.id, title: output.title.slice(0, 120), description: output.description, topic: topic.trim(), style, voice })
      .select("id")
      .single();
    if (vErr) throw vErr;

    const { error: sErr } = await client.from("video_scenes").insert(
      scenes.map((s, i) => ({
        video_id: video.id,
        user_id: user.id,
        position: i,
        heading: s.heading,
        narration: s.narration,
        visual_prompt: `${s.visual_prompt}. Style: ${style}.`,
      })),
    );
    if (sErr) throw sErr;

    return json({ videoId: video.id });
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return new Response(null, { status: 499, headers: corsHeaders });
    console.error("generate-script error", e);
    return json({ error: "Something went wrong writing your script." }, 500);
  }
});
