
## Integrate Live Amadeus Hotel Search into the Results Page

### What We're Building

The `/results` page currently shows hard-coded mock hotels for "Lanzarote" regardless of what the user searches. We will replace this with a live Amadeus Hotel Search integration, so when a user picks a city via autocomplete (e.g. Paris → `PAR`) and hits Search, the results page fetches and displays real hotels with real pricing from Amadeus.

The Amadeus Hotel Search requires two API calls chained together:

1. **Get hotel IDs for the city** — `GET /v1/reference-data/locations/hotels/by-city?cityCode=PAR`
2. **Get live offers for those hotels** — `GET /v3/shopping/hotel-offers?hotelIds=...&checkInDate=...&checkOutDate=...&adults=...&roomQuantity=...`

Both calls will be made inside a single new edge function to keep credentials server-side, reduce round-trips, and avoid CORS issues.

### Architecture

```text
User searches "Paris" (cityCode=PAR, checkIn, checkOut, guests, rooms)
        |
        v
/results?cityCode=PAR&checkIn=2026-03-15&checkOut=2026-03-18&guests=2&rooms=1
        |
        v
SearchResults.tsx  →  useEffect on mount  →  calls edge function
        |
        v
amadeus-hotel-search edge function
  1. GET /v1/reference-data/locations/hotels/by-city?cityCode=PAR&radius=5&radiusUnit=KM
     → returns list of hotelIds (up to 50)
  2. GET /v3/shopping/hotel-offers?hotelIds=...&checkInDate=...&checkOutDate=...&adults=...
     → returns array of hotel offers with name, price, amenities, rating
        |
        v
Returns normalised array of LiveHotel objects to the frontend
        |
        v
SearchResults renders LiveHotelCard list (replaces mock HotelCard)
+ sidebar filters (stars, max price, sort)
+ same Google Map (adapted to accept either mock or live hotels)
```

### Files to Create / Edit

**1. New Edge Function — `supabase/functions/amadeus-hotel-search/index.ts`**

- Accepts GET query params: `cityCode`, `checkInDate`, `checkOutDate`, `adults`, `roomQuantity`
- Step 1: fetch hotel IDs for the city via `/v1/reference-data/locations/hotels/by-city`
  - Use `radius=5&radiusUnit=KM&hotelSource=ALL` for a focused city-centre list
  - Take up to 50 hotel IDs (Amadeus imposes a 250-id limit on step 2, but 50 keeps responses fast)
- Step 2: fetch live offers via `/v3/shopping/hotel-offers` for those IDs
  - If `checkInDate`/`checkOutDate` are missing, uses today + 7 days as defaults so the endpoint always returns data
- Maps each offer to a normalised `LiveHotel` shape:
  ```ts
  {
    hotelId, name, cityCode, countryCode,
    stars, rating, lat, lng,
    offers: [{ id, price, currency, roomType, boardType, cancellationDeadline }]
  }
  ```
- Returns `{ hotels: LiveHotel[], source: "live" }` — the `source` flag lets the frontend know data is real
- Handles CORS identically to all existing edge functions
- Falls back gracefully: if step 2 returns no offers (e.g. dates unavailable), returns what step 1 provided with `null` pricing so the UI can show a "no availability" state rather than an error

**2. New component — `src/components/LiveHotelCard.tsx`**

- A new card component shaped to display Amadeus live data (separate from the mock `HotelCard` so existing mock routes are untouched)
- Props: `hotel: LiveHotel`, `index: number`
- Displays:
  - Hotel name + star rating
  - City, country
  - Cheapest offer price with currency conversion via `useCurrency`
  - Room type and board type from the cheapest offer
  - "Book now" button linking to `https://amadeus.com` (or the hotel's booking URL if available) — opens in a new tab
  - Animated entrance (same framer-motion pattern as `HotelCard`)
  - "No availability" badge if `offers` is empty
- Unsplash fallback image using the city name as the query (since Amadeus test API doesn't return hotel photos)
- Skeleton variant for loading state

**3. Edit `src/pages/SearchResults.tsx`**

- Read `cityCode` from URL params (already navigated there by `HotelSearchForm`)
- Add state: `liveHotels`, `loading`, `error`
- `useEffect` on mount: call the new edge function via `supabase.functions.invoke` — but since it's a GET function, use a direct `fetch` call with the project URL + anon key (same pattern as `FlightPriceCalendar`)
- While loading: show a skeleton list (3–5 `LiveHotelCard` skeletons)
- When `cityCode` is present and data loads: render `LiveHotelCard` list instead of mock `HotelCard` list
- When `cityCode` is absent (user arrived without selecting from autocomplete): fall back to the existing mock data display so the page always works
- Page heading updates to "Hotels in Paris" using the `destination` param or a reverse-lookup of the city code
- Sidebar filters adapt: stars and max price sliders work against live data; board type / accommodation / flight filters are hidden when showing live data (those fields don't exist on Amadeus offers)
- Error state: if the API call fails, show a friendly message and fall back to mock data

**4. Edit `src/components/SearchResultsMap.tsx`**

- Make it accept both the existing `Hotel[]` (mock) shape and a new `LiveHotel[]` shape
- Add a union type / overload so the map can render price pins for both kinds of data
- When showing live hotels, centre the map on the city's geographic centre (derived from the lat/lng returned by Amadeus)

### Live Hotel Data Shape (returned from edge function)

```ts
interface LiveHotelOffer {
  id: string;
  price: number;       // converted to GBP on the edge function side for consistency
  currency: string;    // original currency from Amadeus
  roomType: string;    // e.g. "Standard Room", "Deluxe King"
  boardType: string;   // e.g. "Room Only", "Breakfast Included"
  cancellationDeadline?: string;
}

interface LiveHotel {
  hotelId: string;
  name: string;
  cityCode: string;
  countryCode: string;
  stars: number;       // from hotel rating field or 0 if absent
  rating: number;      // Amadeus hotel rating (1-5 scale mapped to 10-point display)
  lat: number;
  lng: number;
  offers: LiveHotelOffer[];
}
```

### LiveHotelCard UI Design

```
┌────────────────────────────────────────────────────────────┐
│  [City photo (Unsplash)]   │  Hotel Metropole Paris        │
│  [Board type badge]        │  ★★★★★  Paris, France         │
│                            │                               │
│                            │  Room Only · Superior Room    │
│                            │  Free cancellation by Mar 12  │
│                            │ ───────────────────────────── │
│                            │  from  £142 / night  [Book →] │
└────────────────────────────────────────────────────────────┘
```

- Board type badge in primary colour (top-left of image), same style as mock `HotelCard`
- Price displays in user's selected currency via `formatPrice()`
- "Book →" is an `<a target="_blank">` to prevent navigating away from the site

### Technical Notes

- No new secrets — uses existing `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET`
- The Amadeus test environment returns a limited but functional set of hotels; Paris (`PAR`), London (`LON`), Madrid (`MAD`), New York (`NYC`) tend to return good results
- Step 1 (`hotels/by-city`) may return hotels without lat/lng on the test API; in that case the map pins are omitted for those hotels
- `roomQuantity` param is passed through from the `rooms` URL param set by `HotelSearchForm`
- The mock data flow (`SearchResults` without `cityCode`) is completely preserved — existing `/results?destination=Lanzarote` links still show mock data
- A new `/hotel-results` route is **not** needed — the existing `/results` route is extended in-place
- Edge function auto-deploys on save
