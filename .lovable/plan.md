
# Implementation Plan: FareFinder Multi-Feature Update

This is a large set of changes spanning the Flights+Hotels page, Hotels page, Hotel Detail page, and two new pages (Price Alerts Dashboard, AI Suggestions). The work is broken into 5 phases.

---

## Phase 1: Flights+Hotels Page Fixes

### 1.1 Multi-city Calendar Styling
The multi-city date picker in `SearchForm.tsx` (line 283-306) uses Shadcn's `Calendar` inside a `Popover`. This renders a standard white calendar -- not a "purple box." If it appears purple, the issue is likely the Popover background inheriting from the dark parent. Fix: ensure `PopoverContent` and `Calendar` use `bg-card` explicitly and `pointer-events-auto`.

**Files:** `src/components/SearchForm.tsx`

### 1.2 Hospital -- 5-mile Radius Only
Currently the hospital tile always shows regardless of distance. Update `NearbyPOIs.tsx` to apply the same 5-mile radius filter: if `hospital.distance > RADIUS_KM`, render the disabled/greyed-out tile with "No results within 5 miles".

**Files:** `src/components/NearbyPOIs.tsx`

### 1.3 Airports -- Closest 2 (Already Done)
This is already implemented (line 186-188 in `NearbyPOIs.tsx`): `.slice(0, 2)`. No change needed.

### 1.4 Restaurants -- Fix Accuracy
The current restaurant data is hardcoded for Lanzarote only. The sorting uses `withDistance()` which sorts by Haversine distance. Verify the coordinates are correct and ensure the 2-closest logic works for any hotel lat/lng. The fix is to audit/correct the coordinates of the restaurant entries to match their real-world locations.

**Files:** `src/components/NearbyPOIs.tsx`

### 1.5 Shopping -- 5-mile Radius with Disabled Fallback (Already Done)
Already implemented via `renderDropdownOrDisabled`. No change needed.

### 1.6 Nearest Beach -- 5-mile Radius (Already Done)
Already implemented. No change needed.

### 1.7 Public Transport -- 5-mile Radius (Already Done)
Already implemented via `renderDropdownOrDisabled`. No change needed.

### 1.8 Hotel Image Carousel
Replace the single hotel image in `LiveHotelCard.tsx` and `HotelDetail.tsx` with a scrollable image carousel. Since the Amadeus API does not return hotel images, use multiple Unsplash queries (e.g., "hotel room", "hotel lobby", "hotel pool") as placeholder images. Add left/right arrow buttons using `embla-carousel-react` (already installed).

**Files:** `src/components/LiveHotelCard.tsx`, `src/pages/HotelDetail.tsx`, new `src/components/HotelImageCarousel.tsx`

### 1.9 Price Per Person / Per Night Toggle
Add a toggle switch to the hotel results page (`SearchResults.tsx`) and hotel detail page that lets users switch between "per person" and "per night" pricing display. Store the toggle state and pass it to `LiveHotelCard` and `HotelCard`.

**Files:** `src/pages/SearchResults.tsx`, `src/components/LiveHotelCard.tsx`, `src/components/HotelCard.tsx`

### 1.10 Price Comparison Panel (Multi-Provider)
Add a price comparison section to `LiveHotelCard` showing simulated prices from: lastminute.com, booking.com, loveholidays.com, travala.com, agoda.com, vio.com, onthebeach.com, expedia.com, hotels.com, prestigia.com, algotels.com, destinia.com, direct.com, trip.com, and others. Since real affiliate APIs are not available, generate realistic price variations (+-5-15%) from the Amadeus base price and link to each provider's search page.

**Files:** `src/components/LiveHotelCard.tsx`, `src/pages/HotelDetail.tsx`

### 1.11 Weather Forecast Section
Add a new section to `HotelDetail.tsx` with:
- **7-day forecast**: Use a free weather API (Open-Meteo, no API key needed) to show temperature, conditions, and icons for the next 7 days.
- **Annual weather guide**: A static/semi-static monthly chart (using recharts) showing average temperatures and sunshine hours to help users pick the best month.

Create a new backend function `amadeus-weather` (or use Open-Meteo directly from the client since it requires no key).

**Files:** `src/pages/HotelDetail.tsx`, new `src/components/WeatherForecast.tsx`, new `src/components/AnnualWeatherGuide.tsx`

---

## Phase 2: Hotels Page Enhancements

### 2.1 Booking Links on Hotel Results
Add deep-link booking buttons to `LiveHotelCard.tsx` that link to the hotel on external booking sites (constructed URLs using hotel name + city).

**Files:** `src/components/LiveHotelCard.tsx`

### 2.2 Hotel Chain Display
The Amadeus Hotel List API returns a `chainCode` field. Pass this through the edge function response and display the hotel chain name (e.g., "Marriott", "Hilton") on the card using a chainCode-to-name mapping.

**Files:** `supabase/functions/amadeus-hotel-search/index.ts`, `src/types/liveHotel.ts`, `src/components/LiveHotelCard.tsx`

### 2.3 Update Hotel & Packages Autocomplete
Improve the `HotelSearchForm.tsx` autocomplete to show hotel-level suggestions (not just cities). Update `amadeus-hotel-autocomplete` edge function to also include individual hotel names when available. For the Package search form, ensure the same autocomplete improvements apply.

**Files:** `src/components/HotelSearchForm.tsx`, `supabase/functions/amadeus-hotel-autocomplete/index.ts`

---

## Phase 3: Price Alerts Dashboard (New Page)

### 3.1 New Route & Page
Create `/price-alerts` page accessible from the Navbar. Display all saved price alerts from the `price_alerts` database table, grouped by route. Show current price, target price, and status. Allow users to delete alerts.

### 3.2 Navbar Update
Add "Price Alerts" to the navbar items array.

**Files:** new `src/pages/PriceAlerts.tsx`, `src/components/Navbar.tsx`, `src/App.tsx`

---

## Phase 4: AI Suggestions Page (New Page)

### 4.1 Trip Style Quiz
Create `/ai-suggestions` page with a 5-7 question interactive quiz:
- Mood (Relaxed / Adventure / Cultural / Party)
- Budget range
- Flight duration preference
- Crowd tolerance
- Climate preference
- Travel dates flexibility
- Previous destinations to exclude

### 4.2 AI Destination Reasoning
Wire the quiz answers to a Lovable AI backend function that:
1. Converts vague preferences into structured constraints
2. Generates top 3 destination recommendations with reasoning
3. Returns "Trip Confidence Score" breakdown (Budget fit, Weather fit, Crowds, Flight comfort)

Use Google Gemini (available via Lovable AI -- no API key needed) for the reasoning engine.

### 4.3 Results Display
Show AI recommendations as cards with:
- Destination name + image
- Confidence score (e.g., "87% Match")
- Score breakdown (Budget: 92%, Weather: 88%, etc.)
- "Why this destination" explanation
- "Why not X?" comparison
- Link to search flights/hotels for that destination

### 4.4 "What if?" Sliders
Add interactive sliders that re-rank results:
- "What if I fly a day earlier?"
- "What if I accept 1 stop?"
- "What if I go in late May instead?"

Each adjustment triggers an AI re-evaluation with updated reasoning.

### 4.5 Navbar Update
Add "AI Suggestions" to the navbar.

**Files:** new `src/pages/AISuggestions.tsx`, new `src/components/TripStyleQuiz.tsx`, new `src/components/TripConfidenceCard.tsx`, new `src/components/WhatIfSliders.tsx`, new `supabase/functions/ai-trip-suggestions/index.ts`, `src/components/Navbar.tsx`, `src/App.tsx`

---

## Phase 5: Verification

- Test multi-city calendar appearance on the Flights page
- Test hospital, restaurants, shopping, beach, transport POI tiles with radius logic
- Test hotel image carousel scrolling
- Test price toggle (per person vs per night)
- Test price comparison panel with multiple providers
- Test weather forecast section loads data
- Test booking links on hotel results
- Test hotel chain display
- Test autocomplete improvements
- Test Price Alerts dashboard CRUD
- Test AI Suggestions quiz flow end-to-end
- Test "What if?" sliders re-ranking

---

## Technical Details

### New Files to Create
| File | Purpose |
|------|---------|
| `src/pages/PriceAlerts.tsx` | Price alerts dashboard |
| `src/pages/AISuggestions.tsx` | AI trip decision engine page |
| `src/components/HotelImageCarousel.tsx` | Scrollable hotel image gallery |
| `src/components/WeatherForecast.tsx` | 7-day weather using Open-Meteo |
| `src/components/AnnualWeatherGuide.tsx` | Monthly weather chart (recharts) |
| `src/components/TripStyleQuiz.tsx` | Interactive quiz component |
| `src/components/TripConfidenceCard.tsx` | AI recommendation card with scores |
| `src/components/WhatIfSliders.tsx` | Interactive constraint sliders |
| `supabase/functions/ai-trip-suggestions/index.ts` | AI reasoning via Lovable AI (Gemini) |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add routes for `/price-alerts` and `/ai-suggestions` |
| `src/components/Navbar.tsx` | Add "Price Alerts" and "AI Suggestions" nav items |
| `src/components/NearbyPOIs.tsx` | Hospital 5-mile radius, restaurant coordinate audit |
| `src/components/SearchForm.tsx` | Fix multi-city calendar bg |
| `src/components/LiveHotelCard.tsx` | Image carousel, chain display, booking links, price comparison |
| `src/components/HotelCard.tsx` | Price toggle support |
| `src/pages/HotelDetail.tsx` | Image carousel, weather section, price toggle |
| `src/pages/SearchResults.tsx` | Price toggle state |
| `src/types/liveHotel.ts` | Add `chainCode` field |
| `supabase/functions/amadeus-hotel-search/index.ts` | Pass `chainCode` |
| `supabase/functions/amadeus-hotel-autocomplete/index.ts` | Hotel-level suggestions |
| `src/components/HotelSearchForm.tsx` | Improved autocomplete display |

### Dependencies
- `embla-carousel-react` (already installed) for image carousels
- `recharts` (already installed) for weather charts
- Open-Meteo API (free, no key) for weather data
- Lovable AI (Gemini) for trip suggestions (no API key needed)

### Database
- Existing `price_alerts` table is sufficient for the dashboard
- No new tables needed
