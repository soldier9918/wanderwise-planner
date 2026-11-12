import { charge, refund, COSTS } from "../_shared/credits.ts";
import { voiceAllowed, scenesAllowedForTier, planTierOf, lengthAllowedForPlan, qualityAllowedForPlan } from "../_shared/tiers.ts";
import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText, Output, NoObjectGeneratedError } from "npm:ai@6";
import { z } from "npm:zod@3";
import { corsHeaders, GATEWAY_URL, json, getUserClient, adminClient } from "../_shared/common.ts";
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

// Counts words outside link/image-only lines so share bars don't look like content.
function proseWords(md: string): number {
  return md.split("\n")
    .map((l) => l.replace(/!?\[[^\]]*\]\([^)]*\)/g, " ").replace(/[#*>\-_`|]/g, " "))
    .join(" ").split(/\s+/).filter((w) => /[a-z]{2,}/i.test(w)).length;
}

// Fallback: fetch the page and pull readable text from the article body.
async function fetchArticleText(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; VydoraBot/1.0)" }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return "";
    let html = (await res.text()).slice(0, 2_000_000);
    html = html.replace(/<(script|style|noscript|nav|footer|header|aside|form)[\s\S]*?<\/\1>/gi, " ");
    const pick = html.match(/<article[\s\S]*?<\/article>/i)?.[0]
      ?? html.match(/<div[^>]+class="[^"]*(post-body|entry-content|article-body|post-content)[^"]*"[\s\S]*$/i)?.[0]
      ?? html;
    const text = pick
      .replace(/<\/(p|div|h[1-6]|li|br)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&quot;|&ldquo;|&rdquo;/g, '"')
      .split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter((l) => l.split(" ").length >= 6)
      .join("\n\n");
    return text;
  } catch { return ""; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);

    const { topic: topicIn, style = "Documentary", voice = "Kore", sceneCount = 6, captionStyle = "typewriter", aspectRatio = "16:9", quality = "720p", targetSeconds, useFacts, tone: toneIn, sourceUrl, narrationSpeed, accent: accentIn } = await req.json();
    const [{ data: sub }, { data: isAdmin }, { data: subRow }] = await Promise.all([
      auth.client.rpc("has_active_subscription", { _user_id: auth.user.id }),
      auth.client.rpc("has_role", { _user_id: auth.user.id, _role: "admin" }),
      adminClient().from("user_subscriptions").select("plan_tier").eq("user_id", auth.user.id).eq("livemode", (await adminClient().rpc("stripe_livemode")).data === true).maybeSingle(),
    ]);
    const pro = !!isAdmin || sub === true;
    const tier = planTierOf(isAdmin, sub, subRow?.plan_tier);
    if (!voiceAllowed(String(voice), pro)) return json({ error: "That narrator is on paid plans. Subscribe to unlock it." }, 403);
    if (!scenesAllowedForTier(Number(sceneCount) || 6, pro)) return json({ error: "Free plan videos can have up to 6 scenes. Subscribe to unlock more." }, 403);
    if (targetSeconds && !lengthAllowedForPlan(Number(targetSeconds), tier)) return json({ error: tier === "free" ? "Free plan videos can be up to 2 minutes. Subscribe to unlock longer videos." : "Creator videos can be up to 20 minutes. Upgrade to Pro for up to 60 minutes." }, 403);
    const tone = typeof toneIn === "string" && TONES[toneIn] ? toneIn : "engaging";
    if (!qualityAllowedForPlan(String(quality), tier)) return json({ error: "1080p Full HD is a Pro feature. Upgrade to Pro to unlock it." }, 403);
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
    const speed = [1, 1.15, 1.25].includes(Number(narrationSpeed)) ? Number(narrationSpeed) : 1;
    const accent = ["british", "us", "australian", "scottish"].includes(accentIn) ? accentIn : "none";
    let srcUrl: string | null = null;
    if (sourceUrl !== undefined && sourceUrl !== null && sourceUrl !== "") {
      try {
        const u = new URL(String(sourceUrl));
        if (!/^https?:$/.test(u.protocol)) throw new Error();
        srcUrl = u.toString();
      } catch { return json({ error: "Please paste a full web link starting with https://" }, 400); }
    }
    let topic = typeof topicIn === "string" ? topicIn : "";
    if (!srcUrl && topic.trim().length < 3) return json({ error: "Please describe your video idea." }, 400);
    const count = Math.min(50, Math.max(3, Number(sceneCount) || 6));
    {
      const t = Math.round(Number(targetSeconds)) || 0;
      // Sensible pacing: every scene must last 7–90 seconds (e.g. no 50 scenes in a 1-minute video).
      if (t && (t / count < 7 || t / count > 90)) return json({ error: `A ${t}s video needs between ${Math.ceil(t / 90)} and ${Math.floor(t / 7)} scenes.` }, 400);
    }
    const cost = COSTS.script + (useFacts || srcUrl ? COSTS.facts : 0);
    const denied = await charge(auth.user.id, cost, "video_script");
    if (denied) return denied;
    let charged = cost;
    try {

    const total = Math.min(3600, Math.max(30, Math.round(Number(targetSeconds)) || 0)) || null;
    const per = total ? Math.round(total / count) : 12;
    const words = Math.max(5, Math.round(per * 2.6));
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);

    let research = "";
    let sources: { title: string; url: string }[] | null = null;
    if (useFacts === true && !srcUrl) {
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

    if (srcUrl) {
      const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
      if (!fcKey) return json({ error: "Reading web pages is not set up." }, 500);
      const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-Connection-Api-Key": fcKey },
        body: JSON.stringify({ url: srcUrl, formats: ["markdown"], onlyMainContent: true }),
      });
      if (!res.ok) {
        console.error("firecrawl scrape failed", res.status, await res.text());
        return json({ error: "Couldn't read that page. Check the link is public and try again." }, 502);
      }
      const body = await res.json();
      let md: string = body?.data?.markdown ?? body?.markdown ?? "";
      const title: string = body?.data?.metadata?.title ?? body?.metadata?.title ?? srcUrl;
      if (proseWords(md) < 150) {
        const direct = await fetchArticleText(srcUrl);
        if (proseWords(direct) > proseWords(md)) md = direct;
      }
      if (proseWords(md) < 40) return json({ error: "That page doesn't have enough readable text to make a video from." }, 422);
      research = `[Article] ${title} (${srcUrl})\n${md.slice(0, 20000)}` + (research ? `\n\n${research}` : "");
      sources = [{ title: title.slice(0, 200), url: srcUrl }, ...(sources ?? [])];
      if (topic.trim().length < 3) topic = `Summarise this article as a video: ${title}`;
    }

    const factRules = research
      ? `${srcUrl ? " ARTICLE MODE: Summarise the provided article into the scenes, keeping its key points in order, in your own words. Always write the full number of scenes requested — never return an empty list or ask for more text; if the article is short, expand on its main points and the requested angle without inventing specific facts." : ""} FACT MODE: Base every factual claim ONLY on the research sources provided. Never invent quotes, names, numbers, dates or events. If something is unknown or disputed, say so plainly instead of guessing. Do not present theories as fact.`
      : "";

    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    // Keep every video unique: show the AI this account's recent titles and force a fresh pick for template placeholders.
    const { data: past } = await adminClient().from("videos").select("title").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(40);
    const pastTitles = [...new Set((past ?? []).map((p) => p.title).filter(Boolean))];
    const hasPlaceholder = /\[[^\]]+\]/.test(topic);
    const uniqueRule = `${hasPlaceholder ? "\n\nThe idea contains placeholders in [square brackets]. Replace each one with a specific, surprising subject of your own choosing — avoid the most obvious, overused examples." : ""}${pastTitles.length ? `\n\nThis creator has already made these videos. Your video must be on a clearly different subject with a different title — never repeat or lightly reword any of them:\n- ${pastTitles.join("\n- ")}` : ""}`;
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system:
        `You are a YouTube scriptwriter. Write faceless-channel scripts in ${toneOf(tone).script}. Open with a strong hook in scene 1 and end with a call to subscribe. Each scene's narration lasts about ${per} seconds spoken aloud — roughly ${words} words, never more than that. The whole video must not run over its target length. Each visual_prompt describes one striking cinematic ${framing} still image for that scene, with no text or letters in the image. The title is a click-worthy YouTube title under 70 characters; description is a 2-3 sentence YouTube description.${factRules}`,
      messages: [
        { role: "user", content: `Video idea: ${topic.trim()}\nVisual style: ${style}\nNumber of scenes: exactly ${count}${uniqueRule}${research ? `\n\nResearch sources:\n${research}` : ""}` },
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
    const { data: video, error: vErr } = await adminClient()
      .from("videos")
      .insert({ user_id: user.id, title: output.title.slice(0, 120), description: output.description, topic: topic.trim(), style, voice, tone, caption_style: caption, aspect_ratio: ratio, quality: qual, target_seconds: total, sources, source_url: srcUrl, narration_speed: speed, accent })
      .select("id")
      .single();
    if (vErr) throw vErr;

    const { error: sErr } = await adminClient().from("video_scenes").insert(
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

    charged = 0;
    return json({ videoId: video.id });
    } finally {
      if (charged) await refund(auth.user.id, charged, "refund_script");
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return new Response(null, { status: 499, headers: corsHeaders });
    console.error("generate-script error", e);
    return json({ error: "Something went wrong writing your script." }, 500);
  }
});
