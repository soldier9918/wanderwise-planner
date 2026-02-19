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

interface AmadeusHotelListItem {
  hotelId: string;
  name: string;
  cityCode: string;
  countryCode: string;
  iataCode?: string;
  geoCode?: { latitude: number; longitude: number };
}

interface AmadeusOffer {
  id: string;
  room?: { typeEstimated?: { category?: string; bedType?: string } };
  boardType?: string;
  price?: { total?: string; currency?: string; base?: string };
  policies?: { cancellation?: { deadline?: string } };
}

interface AmadeusHotelOfferResult {
  hotel: {
    hotelId: string;
    name: string;
    cityCode?: string;
    countryCode?: string;
    rating?: string;
    latitude?: number;
    longitude?: number;
  };
  offers?: AmadeusOffer[];
  available?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cityCode = url.searchParams.get("cityCode");
    const checkInDate = url.searchParams.get("checkInDate");
    const checkOutDate = url.searchParams.get("checkOutDate");
    const adults = url.searchParams.get("adults") || "2";
    const roomQuantity = url.searchParams.get("roomQuantity") || "1";

    if (!cityCode) {
      return new Response(
        JSON.stringify({ error: "cityCode is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await getAmadeusToken();

    // Step 1: Get hotel IDs for the city
    const cityParams = new URLSearchParams({
      cityCode: cityCode.toUpperCase(),
      radius: "5",
      radiusUnit: "KM",
      hotelSource: "ALL",
    });

    const cityRes = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?${cityParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const cityData = await cityRes.json();

    if (!cityRes.ok) {
      console.error("hotels/by-city error:", cityData);
      return new Response(
        JSON.stringify({ error: cityData.errors?.[0]?.detail || "Failed to fetch hotel list", hotels: [], source: "live" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hotelList: AmadeusHotelListItem[] = cityData.data || [];
    if (hotelList.length === 0) {
      return new Response(
        JSON.stringify({ hotels: [], source: "live" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Take up to 50 hotel IDs
    const hotelIds = hotelList.slice(0, 50).map((h) => h.hotelId);

    // Default dates: today + 7 days, today + 10 days
    const today = new Date();
    const defaultCheckIn = new Date(today);
    defaultCheckIn.setDate(today.getDate() + 7);
    const defaultCheckOut = new Date(today);
    defaultCheckOut.setDate(today.getDate() + 10);

    const toISO = (d: Date) => d.toISOString().split("T")[0];

    const finalCheckIn = checkInDate || toISO(defaultCheckIn);
    const finalCheckOut = checkOutDate || toISO(defaultCheckOut);

    // Step 2: Fetch live offers
    const offerParams = new URLSearchParams({
      hotelIds: hotelIds.join(","),
      checkInDate: finalCheckIn,
      checkOutDate: finalCheckOut,
      adults,
      roomQuantity,
      bestRateOnly: "true",
      currency: "GBP",
    });

    const offersRes = await fetch(
      `https://test.api.amadeus.com/v3/shopping/hotel-offers?${offerParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const offersData = await offersRes.json();

    // Build a lookup map for hotel metadata from Step 1
    const hotelMeta = new Map<string, AmadeusHotelListItem>();
    hotelList.forEach((h) => hotelMeta.set(h.hotelId, h));

    // If offers call failed, return hotels from step 1 with no pricing
    if (!offersRes.ok || !offersData.data) {
      console.warn("hotel-offers returned no data, using step-1 metadata only");
      const fallbackHotels = hotelList.slice(0, 20).map((h) => ({
        hotelId: h.hotelId,
        name: h.name,
        cityCode: h.cityCode || cityCode,
        countryCode: h.countryCode || "",
        stars: 0,
        rating: 0,
        lat: h.geoCode?.latitude || 0,
        lng: h.geoCode?.longitude || 0,
        offers: [],
      }));
      return new Response(
        JSON.stringify({ hotels: fallbackHotels, source: "live" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: AmadeusHotelOfferResult[] = offersData.data || [];

    // GBP approximate conversion rates
    const gbpRates: Record<string, number> = {
      GBP: 1, EUR: 0.855, USD: 0.787, AED: 0.214, AUD: 0.516,
      CAD: 0.581, CHF: 0.893, JPY: 0.00525, THB: 0.0226, TRY: 0.026,
      INR: 0.00945, SEK: 0.0746,
    };

    const toGBP = (amount: number, currency: string): number => {
      const rate = gbpRates[currency] || 0.787;
      return Math.round(amount * rate * 100) / 100;
    };

    const normalizeRoomType = (offer: AmadeusOffer): string => {
      const cat = offer.room?.typeEstimated?.category || "";
      const bed = offer.room?.typeEstimated?.bedType || "";
      if (cat && bed) return `${cat.charAt(0) + cat.slice(1).toLowerCase()} · ${bed.charAt(0) + bed.slice(1).toLowerCase()} bed`;
      if (cat) return cat.charAt(0) + cat.slice(1).toLowerCase();
      return "Standard Room";
    };

    const normalizeBoardType = (bt?: string): string => {
      const map: Record<string, string> = {
        ROOM_ONLY: "Room Only",
        BREAKFAST: "Breakfast Included",
        HALF_BOARD: "Half Board",
        FULL_BOARD: "Full Board",
        ALL_INCLUSIVE: "All Inclusive",
      };
      return bt ? (map[bt] || bt) : "Room Only";
    };

    const hotels = results
      .filter((r) => r.available !== false)
      .map((r) => {
        const meta = hotelMeta.get(r.hotel.hotelId);
        const stars = r.hotel.rating ? parseInt(r.hotel.rating, 10) : 0;
        const lat = r.hotel.latitude || meta?.geoCode?.latitude || 0;
        const lng = r.hotel.longitude || meta?.geoCode?.longitude || 0;

        const offers = (r.offers || []).map((o) => {
          const priceRaw = parseFloat(o.price?.total || o.price?.base || "0");
          const currency = o.price?.currency || "GBP";
          const priceGBP = currency === "GBP" ? priceRaw : toGBP(priceRaw, currency);

          return {
            id: o.id,
            price: priceGBP,
            currency,
            roomType: normalizeRoomType(o),
            boardType: normalizeBoardType(o.boardType),
            cancellationDeadline: o.policies?.cancellation?.deadline || null,
          };
        });

        return {
          hotelId: r.hotel.hotelId,
          name: r.hotel.name,
          cityCode: r.hotel.cityCode || meta?.cityCode || cityCode,
          countryCode: r.hotel.countryCode || meta?.countryCode || "",
          stars,
          rating: stars, // Amadeus rating is 1-5 star scale
          lat,
          lng,
          offers,
        };
      });

    return new Response(
      JSON.stringify({ hotels, source: "live" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("amadeus-hotel-search error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error", hotels: [], source: "live" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
