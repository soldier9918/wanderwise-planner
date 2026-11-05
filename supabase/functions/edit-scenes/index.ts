import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai@6";
import { z } from "npm:zod@3";
import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient } from "../_shared/common.ts";

const MIN_SCENES = 3;
const MAX_SCENES = 22;

const schema = z.object({
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

    const { videoId, sceneCount } = await req.json();
    if (typeof videoId !== "string" || !videoId) return json({ error: "Invalid request." }, 400);
    const target = Math.min(MAX_SCENES, Math.max(MIN_SCENES, Math.round(Number(sceneCount)) || MIN_SCENES));

    const { client, user } = auth;
    const { data: video, error: vErr } = await client
      .from("videos")
      .select("id, title, topic, style, voice, aspect_ratio, target_seconds")
      .eq("id", videoId)
      .maybeSingle();
    if (vErr) throw vErr;
    if (!video) return json({ error: "Video not found." }, 404);

    const { data: sceneRows, error: sErr } = await client
      .from("video_scenes")
      .select("id, position, heading, narration, image_path, audio_path")
      .eq("video_id", videoId)
      .order("position");
    if (sErr) throw sErr;
    const scenes = sceneRows ?? [];
    const current = scenes.length;

    // Nothing to do.
    if (target === current) return json({ count: current, added: 0, removed: 0 });

    // Shorter video: drop the last scenes and their files.
    if (target < current) {
      const drop = scenes.slice(target);
      const { error: dErr } = await client.from("video_scenes").delete().in("id", drop.map((s) => s.id));
      if (dErr) throw dErr;
      const paths = drop.flatMap((s) => [s.image_path, s.audio_path]).filter((p): p is string => !!p);
      if (paths.length) await adminClient().storage.from("video-assets").remove(paths);
      return json({ count: target, added: 0, removed: drop.length });
    }

    // Longer video: write the missing scenes and continue the story.
    const need = target - current;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const per = video.target_seconds && current ? Math.round(video.target_seconds / current) : 12;
    const words = Math.max(5, Math.round(per * 2.6));
    const framing = ({
      "16:9": "wide 16:9 landscape",
      "9:16": "tall 9:16 vertical, phone-first with the subject centred",
      "1:1": "square 1:1",
      "4:5": "tall 4:5 vertical",
      "21:9": "ultra-wide 21:9 cinematic",
    } as Record<string, string>)[video.aspect_ratio ?? "16:9"] ?? "wide 16:9 landscape";

    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const outline = scenes.map((s, i) => `Scene ${i + 1}: ${s.heading} — ${s.narration}`).join("\n");

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        `You are a YouTube scriptwriter continuing an existing faceless-channel script. Write engaging, punchy scenes that follow on from what has already been written. Each scene's narration lasts about ${per} seconds spoken aloud — roughly ${words} words. Each visual_prompt describes one striking cinematic ${framing} still image for that scene, with no text or letters in the image. Do not repeat anything already said. The final scene must end with a call to subscribe.`,
      messages: [
        {
          role: "user",
          content:
            `Video title: ${video.title}\nVideo idea: ${video.topic}\nVisual style: ${video.style}\n\nSo far the script covers:\n${outline}\n\nWrite exactly ${need} new scenes that continue this script from where it stops.`,
        },
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

    const extra = output.scenes.slice(0, need).filter((s) => s.narration?.trim());
    if (!extra.length) return json({ error: "No new scenes were written. Please try again." }, 502);

    const { error: iErr } = await client.from("video_scenes").insert(
      extra.map((s, i) => ({
        video_id: video.id,
        user_id: user.id,
        position: current + i,
        heading: s.heading,
        narration: s.narration,
        visual_prompt: `${s.visual_prompt}. Style: ${video.style}.`,
      })),
    );
    if (iErr) throw iErr;

    return json({ count: current + extra.length, added: extra.length, removed: 0 });
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return new Response(null, { status: 499, headers: corsHeaders });
    console.error("edit-scenes error", e);
    return json({ error: "Something went wrong changing the scene count." }, 500);
  }
});
