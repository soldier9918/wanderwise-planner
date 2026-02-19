import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedToken.expiresAt - 60000) {
    return cachedToken.value;
  }

  const clientId = Deno.env.get("AMADEUS_CLIENT_ID");
  const clientSecret = Deno.env.get("AMADEUS_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Amadeus credentials not configured");
  }

  const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Amadeus auth failed: ${err}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return cachedToken.value;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const origin = url.searchParams.get("origin");

    if (!origin || origin.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "origin IATA code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await getAmadeusToken();

    const params = new URLSearchParams({
      origin: origin.trim().toUpperCase(),
      viewBy: "DATE",
    });

    const searchRes = await fetch(
      `https://test.api.amadeus.com/v1/shopping/flight-destinations?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      return new Response(
        JSON.stringify({ error: searchData.errors?.[0]?.detail || "Amadeus search failed", raw: searchData }),
        { status: searchRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a date → cheapest price map
    // Each item has: departureDate (YYYY-MM-DD) and price.total (string number)
    const priceMap: Record<string, number> = {};

    for (const item of (searchData.data || [])) {
      const date: string = item.departureDate;
      const price: number = parseFloat(item.price?.total ?? "0");
      if (date && price > 0) {
        // Keep the cheapest price if there are duplicates for the same date
        if (priceMap[date] === undefined || price < priceMap[date]) {
          priceMap[date] = price;
        }
      }
    }

    return new Response(JSON.stringify({ prices: priceMap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

