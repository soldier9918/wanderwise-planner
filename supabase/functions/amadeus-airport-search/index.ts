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
    const keyword = url.searchParams.get("keyword");

    if (!keyword || keyword.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "keyword must be at least 2 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await getAmadeusToken();

    const params = new URLSearchParams({
      keyword: keyword.trim(),
      subType: "CITY,AIRPORT",
      "page[limit]": "8",
      view: "LIGHT",
    });

    const searchRes = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?${params.toString()}`,
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

    // Map to simplified shape
    const suggestions = (searchData.data || []).map((item: {
      name: string;
      iataCode: string;
      subType: string;
      address?: { cityName?: string; countryName?: string; countryCode?: string };
    }) => ({
      name: item.name,
      iataCode: item.iataCode,
      subType: item.subType, // "CITY" or "AIRPORT"
      cityName: item.address?.cityName ?? "",
      countryName: item.address?.countryName ?? "",
      countryCode: item.address?.countryCode ?? "",
    }));

    return new Response(JSON.stringify({ suggestions }), {
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
