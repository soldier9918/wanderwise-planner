import { charge, refund, COSTS } from "../_shared/credits.ts";
import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai@6";
import { z } from "npm:zod@3";
import { corsHeaders, GATEWAY_URL, json, getUserClient } from "../_shared/common.ts";

const schema = z.object({
  titles: z.array(z.string()),
  description: z.string(),
  hashtags: z.array(z.string()),
  tags: z.array(z.string()),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { videoId } = await req.json().catch(() => ({}));
    if (typeof videoId !== "string" || !/^[0-9a-f-]{36}$/i.test(videoId)) return json({ error: "Invalid video." }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    const { client } = auth;
    const { data: video } = await client.from("videos").select("id,title,description,topic").eq("id", videoId).maybeSingle();
    if (!video) return json({ error: "Video not found." }, 404);
    const COST = COSTS.seo;
    const denied = await charge(auth.user.id, COST, "seo");
    if (denied) return denied;
    let charged = COST;
    try {
    const { data: scenes } = await client.from("video_scenes").select("heading,narration").eq("video_id", videoId).order("position");
    const script = (scenes ?? []).map((s, i) => `${i + 1}. ${s.heading}: ${s.narration}`).join("\n").slice(0, 12000);

    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        "You are a YouTube SEO expert. Given a video's script, write: exactly 3 high click-through titles (under 70 characters each, different angles: curiosity, benefit, bold claim — no clickbait lies); an SEO-friendly description (first 2 lines are a strong hook containing the main keyword, then a short summary paragraph, then a few bullet key points, then a call to like and subscribe; 120-250 words, no hashtags inside); 5-8 relevant hashtags each starting with #, no spaces; 15-25 search tags (keyword phrases people actually search, no # sign, total under 480 characters).",
      messages: [{ role: "user", content: `Topic: ${video.topic}\nCurrent title: ${video.title}\n\nScript:\n${script}` }],
      output: Output.object({ schema }),
      abortSignal: req.signal,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
    });

    let out: z.infer<typeof schema>;
    try {
      out = await result.output;
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return json({ error: "The AI returned something unexpected. Please try again." }, 502);
      const status = (e as { statusCode?: number })?.statusCode ?? 500;
      if (status === 402) return json({ error: "Your workspace is out of AI credits. Add credits in Settings → Plans & credits." }, 402);
      if (status === 429) return json({ error: "Too many requests right now — please wait a moment and try again." }, 429);
      throw e;
    }
    const seo = {
      titles: out.titles.slice(0, 3),
      description: out.description,
      hashtags: out.hashtags.map((h) => "#" + h.replace(/^#+/, "").replace(/\s+/g, "")).slice(0, 10),
      tags: out.tags.map((t) => t.replace(/^#/, "").trim()).filter(Boolean).slice(0, 30),
    };
    const { error } = await client.from("videos").update({ seo }).eq("id", videoId);
    if (error) throw error;
    charged = 0;
    return json({ seo });
    } finally {
      if (charged) await refund(auth.user.id, charged, "refund_seo");
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return new Response(null, { status: 499, headers: corsHeaders });
    console.error("generate-seo error", e);
    return json({ error: "Something went wrong writing your SEO." }, 500);
  }
});
