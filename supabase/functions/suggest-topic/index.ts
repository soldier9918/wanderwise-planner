import { createOpenAI } from "npm:@ai-sdk/openai@3";
import { streamText } from "npm:ai@6";
import { corsHeaders, GATEWAY_URL, json, getUserClient } from "../_shared/common.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);

    const { hint } = await req.json().catch(() => ({}));
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
        "You suggest one engaging YouTube video idea for a faceless channel. Reply with ONLY the idea itself — one or two sentences, under 140 characters, no quotes, no preamble, no hashtags.",
      messages: [
        {
          role: "user",
          content: typeof hint === "string" && hint.trim()
            ? `Suggest a fresh video idea related to: ${hint.trim().slice(0, 200)}`
            : "Suggest a fresh, surprising video idea. Pick a random fascinating topic — science, history, nature, psychology, space, food, money, or the human body.",
        },
      ],
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
        },
      },
    });

    let idea = "";
    for await (const chunk of result.textStream) idea += chunk;
    idea = idea.trim().replace(/^["']|["']$/g, "");
    if (!idea) return json({ error: "The AI did not suggest anything — try again." }, 502);
    return json({ idea });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
