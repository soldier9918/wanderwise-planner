import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { answers, whatIf } = await req.json();

    const systemPrompt = `You are a travel recommendation AI for FareFinder. Given a user's preferences, suggest exactly 3 destinations with detailed reasoning.

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "recommendations": [
    {
      "destination": "City Name",
      "country": "Country Name",
      "confidence": 87,
      "scores": { "budget": 92, "weather": 88, "crowds": 85, "flightComfort": 90 },
      "reasoning": "2-3 sentences explaining why this destination fits their preferences",
      "whyNotAlternative": "1 sentence comparing to a similar but less suitable destination",
      "imageQuery": "search query for an image of this destination"
    }
  ]
}

Consider these factors:
- Budget ranges map to realistic destinations
- Flight duration from UK airports
- Seasonal weather patterns
- Tourist density levels
- The user's mood/vibe preference

If "What if?" adjustments are provided, factor them in:
- dayShift: positive means flying later, negative earlier (affects price)
- acceptStops: if true, consider destinations requiring connections (usually cheaper)
- monthShift: shift travel month (affects weather and prices)`;

    const userPrompt = `User preferences:
- Mood: ${answers.mood}
- Budget: ${answers.budget}
- Max flight duration: ${answers.flightDuration}
- Crowd preference: ${answers.crowds}
- Climate: ${answers.climate}
- Travel dates: ${answers.dates}
- Flying from: ${answers.origin}
- Exclude: ${answers.exclusions || "None"}
${whatIf ? `\nWhat-if adjustments:
- Day shift: ${whatIf.dayShift} days
- Accept stops: ${whatIf.acceptStops}
- Month shift: ${whatIf.monthShift} months` : ""}

Suggest 3 destinations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown code fences if present)
    let parsed;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI recommendations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("ai-trip-suggestions error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
