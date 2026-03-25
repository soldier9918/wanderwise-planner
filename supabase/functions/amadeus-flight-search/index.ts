import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TravelpayoutsResult {
  origin: string;
  destination: string;
  origin_airport: string;
  destination_airport: string;
  price: number;
  airline: string;
  flight_number: string;
  departure_at: string;
  return_at?: string;
  transfers: number;
  return_transfers?: number;
  duration: number;
  duration_to: number;
  duration_back: number;
  link: string;
  gate: string;
}

function minutesToISO(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `PT${h}H${m}M`;
}

function toFlightOffer(r: TravelpayoutsResult, index: number, currency: string) {
  const outboundSegments = [{
    departure: { iataCode: r.origin_airport, at: r.departure_at },
    arrival: { iataCode: r.destination_airport, at: r.departure_at },
    carrierCode: r.airline,
    number: r.flight_number,
    duration: minutesToISO(r.duration_to),
  }];

  // Add placeholder stop segments for transfers
  if (r.transfers > 0) {
    for (let i = 0; i < r.transfers; i++) {
      outboundSegments.push({
        departure: { iataCode: "VIA", at: r.departure_at },
        arrival: { iataCode: r.destination_airport, at: r.departure_at },
        carrierCode: r.airline,
        number: r.flight_number,
        duration: minutesToISO(Math.floor(r.duration_to / (r.transfers + 1))),
      });
    }
  }

  const itineraries = [{
    duration: minutesToISO(r.duration_to),
    segments: outboundSegments,
  }];

  // Add return itinerary if present
  if (r.return_at && r.duration_back > 0) {
    const returnSegments = [{
      departure: { iataCode: r.destination_airport, at: r.return_at },
      arrival: { iataCode: r.origin_airport, at: r.return_at },
      carrierCode: r.airline,
      number: r.flight_number,
      duration: minutesToISO(r.duration_back),
    }];

    if ((r.return_transfers ?? 0) > 0) {
      for (let i = 0; i < (r.return_transfers ?? 0); i++) {
        returnSegments.push({
          departure: { iataCode: "VIA", at: r.return_at! },
          arrival: { iataCode: r.origin_airport, at: r.return_at! },
          carrierCode: r.airline,
          number: r.flight_number,
          duration: minutesToISO(Math.floor(r.duration_back / ((r.return_transfers ?? 0) + 1))),
        });
      }
    }

    itineraries.push({
      duration: minutesToISO(r.duration_back),
      segments: returnSegments,
    });
  }

  const priceStr = r.price.toFixed(2);

  return {
    id: `tp-${index}-${r.flight_number}-${r.departure_at}`,
    itineraries,
    price: {
      total: priceStr,
      currency: currency.toUpperCase(),
      grandTotal: priceStr,
    },
    numberOfBookableSeats: 9,
    validatingAirlineCodes: [r.airline],
    // Extra fields for booking
    travelpayoutsLink: r.link ? `https://www.aviasales.com${r.link}` : null,
    gate: r.gate,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults = 1,
      travelClass = "ECONOMY",
      nonStop = false,
      currencyCode = "GBP",
      max = 30,
    } = body;

    if (!originLocationCode || !destinationLocationCode || !departureDate) {
      return new Response(
        JSON.stringify({ error: "originLocationCode, destinationLocationCode, and departureDate are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = Deno.env.get("TRAVELPAYOUTS_TOKEN");
    if (!token) {
      throw new Error("TRAVELPAYOUTS_TOKEN not configured");
    }

    // Map travel class to trip_class (0=economy, 1=business, 2=first)
    const classMap: Record<string, string> = {
      ECONOMY: "0", PREMIUM_ECONOMY: "0", BUSINESS: "1", FIRST: "2",
    };
    const tripClass = classMap[travelClass] || "0";

    // Build URL for Travelpayouts v3 prices_for_dates
    const params = new URLSearchParams({
      origin: originLocationCode.toUpperCase(),
      destination: destinationLocationCode.toUpperCase(),
      departure_at: departureDate,
      currency: currencyCode.toLowerCase(),
      sorting: "price",
      direct: nonStop ? "true" : "false",
      limit: String(max),
      trip_class: tripClass,
      token,
    });

    if (returnDate) {
      params.set("return_at", returnDate);
    }

    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success) {
      return new Response(
        JSON.stringify({ error: data.error || "Travelpayouts search failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let results: TravelpayoutsResult[] = data.data || [];

    // Fallback: if specific date returned empty, retry with month-level query
    if (results.length === 0 && departureDate.length > 7) {
      const monthDate = departureDate.substring(0, 7); // "YYYY-MM"
      params.set("departure_at", monthDate);
      if (returnDate && returnDate.length > 7) {
        params.set("return_at", returnDate.substring(0, 7));
      }
      const fallbackUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`;
      const fallbackRes = await fetch(fallbackUrl);
      const fallbackData = await fallbackRes.json();
      if (fallbackData.success && fallbackData.data?.length > 0) {
        results = fallbackData.data;
      }
    }

    // Transform to FlightOffer format matching existing frontend
    const offers = results.map((r, i) => toFlightOffer(r, i, data.currency || currencyCode));

    return new Response(
      JSON.stringify({ data: offers }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Flight search error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
