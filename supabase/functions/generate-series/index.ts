import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText } from "npm:ai@6";
import { corsHeaders, GATEWAY_URL, json, getUserClient } from "../_shared/common.ts";

const schema = {
  type: "object", additionalProperties: false, required: ["title", "logline", "visualMotif", "episodes"],
  properties: {
    title: { type: "string" }, logline: { type: "string" }, visualMotif: { type: "string" },
    episodes: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "hook", "synopsis"],
      properties: { title: { type: "string" }, hook: { type: "string" }, synopsis: { type: "string" } } } },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const body = await req.json().catch(() => ({}));
    const topic = typeof body.topic === "string" ? body.topic.trim().slice(0, 300) : "";
    const parts = body.parts === 5 ? 5 : 3;
    const tone = typeof body.tone === "string" ? body.tone.slice(0, 40) : "engaging";
    const style = typeof body.style === "string" ? body.style.slice(0, 40) : "Documentary";
    if (topic.length < 3) return json({ error: "Enter a topic for your series." }, 400);
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "AI is not configured." }, 500);
    const provider = createOpenAI({ baseURL: `${GATEWAY_URL}/v1`, apiKey, headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" } });
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system: `You plan YouTube video series for faceless channels. Produce exactly ${parts} episodes that tell one continuous arc in logical order, with no overlap. Each episode: a punchy title (no "Part N" prefix), a one-sentence hook, and a 2-3 sentence synopsis. Tone: ${tone}. Visual style: ${style}. visualMotif: one sentence describing recurring visuals, palette and framing that keep every episode consistent. Reply with ONLY JSON matching this schema: ${JSON.stringify(schema)}`,
      messages: [{ role: "user", content: `Series topic: ${topic}` }],
      abortSignal: req.signal,
      providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto" } },
    });
    let text = "";
    for await (const c of result.textStream) text += c;
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return json({ error: "The AI didn't return a series plan — try again." }, 502);
    const plan = JSON.parse(m[0]);
    if (!Array.isArray(plan.episodes) || !plan.episodes.length) return json({ error: "The AI didn't return episodes — try again." }, 502);
    plan.episodes = plan.episodes.slice(0, parts);
    return json({ plan });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
