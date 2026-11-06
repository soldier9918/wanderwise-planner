import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai@6";
import { z } from "npm:zod@3";
import { corsHeaders, GATEWAY_URL, json, getUserClient } from "../_shared/common.ts";
import { TONES, toneOf } from "../_shared/tones.ts";

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

    const { topic, style = "Documentary", voice = "Kore", sceneCount = 6, captionStyle = "typewriter", aspectRatio = "16:9", quality = "720p", targetSeconds, useFacts, tone: toneIn } = await req.json();
    const tone = typeof toneIn === "string" && TONES[toneIn] ? toneIn : "engaging";
    const qual = ["720p", "1080p"].includes(quality) ? quality : "720p";
    const caption = ["typewriter", "pop", "sentence", "full", "none"].includes(captionStyle) ? captionStyle : "typewriter";
    const ratio = ["16:9", "9:16", "1:1", "4:5", "21:9"].includes(aspectRatio) ? aspectRatio : "16:9";
    const framing = ({
      "16:9": "wide 16:9 landscape",
      "9:16": "tall 9:16 vertical, phone-first with the subject centred",
      "1:1": "square 1:1",
      "4:5": "tall 4:5 vertical",
      "21:9": "ultra-wide 21:9 cinematic",
    } as Record<string, string>)[ratio];
    if (typeof topic !== "string" || topic.trim().length < 3) return json({ error: "Please describe your video idea." }, 400);
    const count = Math.min(22, Math.max(3, Number(sceneCount) || 6));

    const total = Math.min(600, Math.max(30, Math.round(Number(targetSeconds)) || 0)) || null;
    const per = total ? Math.round(total / count) : 12;
    const words = Math.max(5, Math.round(per * 2.6));
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    let research = "";
    let sources: { title: string; url: string }[] | null = null;
    if (useFacts === true) {
      const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!fcKey) return json({ error: "Fact search is not set up." }, 500);
      const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": fcKey },
        body: JSON.stringify({ query: topic.trim().slice(0, 300), limit: 5, scrapeOptions: { formats: ["markdown"], onlyMainContent: true } }),
      });
      if (!res.ok) {
        console.error("firecrawl search failed", res.status, await res.text());
        return json({ error: "Couldn't search the web for facts right now. Try again, or turn off \"Use real facts\"." }, 502);
      }
      const body = await res.json();
      const items = ((body?.data?.web ?? body?.data ?? []) as { url?: string; title?: string; description?: string; markdown?: string }[]).filter((r) => r.url);
      if (!items.length) return json({ error: "No web sources found for this idea. Try rewording it." }, 422);
      sources = items.map((r) => ({ title: (r.title ?? r.url!).slice(0, 200), url: r.url! }));
      research = items.map((r, i) => `[Source ${i + 1}] ${r.title ?? ""} (${r.url})\n${(r.markdown || r.description || "").slice(0, 6000)}`).join("\n\n");
    }

    const factRules = research
      ? ` FACT MODE: Base every factual claim ONLY on the research sources provided. Never invent quotes, names, numbers, dates or events. If something is unknown or disputed, say so plainly instead of guessing. Do not present theories as fact.`
      : "";

    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        `You are a YouTube scriptwriter. Write faceless-channel scripts in ${toneOf(tone).script}. Open with a strong hook in scene 1 and end with a call to subscribe. Each scene's narration lasts about ${per} seconds spoken aloud — roughly ${words} words, never far off that. Each visual_prompt describes one striking cinematic ${framing} still image for that scene, with no text or letters in the image. The title is a click-worthy YouTube title under 70 characters; description is a 2-3 sentence YouTube description.${factRules}`,
      messages: [
        { role: "user", content: `Video idea: ${topic.trim()}\nVisual style: ${style}\nNumber of scenes: exactly ${count}${research ? `\n\nResearch sources:\n${research}` : ""}` },
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
      .insert({ user_id: user.id, title: output.title.slice(0, 120), description: output.description, topic: topic.trim(), style, voice, tone, caption_style: caption, aspect_ratio: ratio, quality: qual, target_seconds: total, sources })
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
