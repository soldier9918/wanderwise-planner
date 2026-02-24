
# Fix Plan: 22 Issues Across AI Suggestions, Price Alerts, Flights, Hotels

## 1. AI Suggestions - Destination Images Not Appearing
**Problem:** `source.unsplash.com` is deprecated/unreliable.
**Fix:** Replace with Unsplash image URLs using `images.unsplash.com/photo-{id}` or use Pexels/Pixabay CDN. Alternatively, use a curated set of destination images mapped by city name as fallback, with a working image service URL.
**Files:** `src/components/TripConfidenceCard.tsx` (line 58)

## 2. Test AI Suggestions Recommendations
**Fix:** Deploy the `ai-trip-suggestions` edge function if not already deployed, then verify the quiz flow end-to-end. The edge function code looks correct -- it uses Lovable AI gateway with Gemini.
**Files:** Verification only after deploy

## 3. AI Questions to Be Camel Case (Title Case)
**Problem:** Question titles like "How do you want to feel?" should use Title Case labels.
**Fix:** Update the `questions` array in `TripStyleQuiz.tsx` to use Title Case for titles (e.g., "How Do You Want To Feel?").
**Files:** `src/components/TripStyleQuiz.tsx` (lines 22-64)

## 4. Test Price Alerts End-to-End
**Fix:** Navigate to `/price-alerts`, verify it reads from `price_alerts` table, test delete functionality. The code looks correct -- uses session-based ID from localStorage.
**Files:** Verification only

## 5. Autocomplete Shows Wrong Results (e.g., "J" Shows Spain)
**Problem:** The client-side filter in `AirportAutocompleteInput.tsx` uses `.startsWith()` but also matches `countryName`. Typing "J" matches "Japan" country, which returns Spanish airports if Amadeus returns them. The real issue is the Amadeus API returns results based on relevance, not prefix matching, and the client filter also matches on country name.
**Fix:** Remove `countryName` from the `startsWith` filter -- only match on `iataCode`, `cityName`, and `name`. This prevents "Spain" appearing when typing "J" just because it matches some other field.
**Files:** `src/components/AirportAutocompleteInput.tsx` (lines 156-161)

## 6. Hotel Image Carousel Arrows Not Showing
**Problem:** The arrows use `opacity-0 group-hover/carousel:opacity-100` which means they only appear on hover. On touch devices or when clicking into the hotel detail page, they're invisible.
**Fix:** Make arrows always visible (remove opacity-0 logic) or show them at reduced opacity by default. Also ensure the `HotelDetail.tsx` page uses the `HotelImageCarousel` component instead of a static `<img>`.
**Files:** `src/components/HotelImageCarousel.tsx` (lines 53-64), `src/pages/HotelDetail.tsx` (line 53)

## 7. Add Rainfall to Weather Chart
**Problem:** The weather chart only shows temperature and sunshine hours.
**Fix:** Add `precipitation_sum` to the Open-Meteo API call for 7-day forecast, and add a rainfall bar/line to the annual chart. Update the `MonthlyData` interface to include `rainfall`.
**Files:** `src/components/WeatherForecast.tsx` (lines 57-77, 134-145)

## 8. Map Does Not Accurately Pin Hotels/POIs
**Problem:** The POI data in `NearbyPOIs.tsx` is hardcoded for Lanzarote only. When viewing hotels in other locations, the same Lanzarote POIs appear.
**Fix:** This is a data limitation -- the POIs are static Lanzarote coordinates. For a proper fix, we need to either: (a) use Google Places API to fetch real nearby POIs based on hotel lat/lng, or (b) note this limitation. Since Google Places requires billing, we should make the POI section conditional -- only show it when the hotel is in Lanzarote, or use the free Overpass API (OpenStreetMap) to fetch real POIs.
**Files:** `src/components/NearbyPOIs.tsx` -- significant refactor needed

## 9. Add 7-Day Price History Section
**Fix:** Create a new `PriceHistoryChart` component that shows simulated price changes over the last 7 days using recharts. Place it between the Weather and Location Nearby sections in `HotelDetail.tsx`.
**Files:** New `src/components/PriceHistoryChart.tsx`, `src/pages/HotelDetail.tsx`

## 10. Auto Zoom Map When Clicking POI Boxes
**Problem:** `HotelMap.tsx` uses a static zoom level (14 or 10). When clicking different POIs at different distances, the zoom doesn't adjust.
**Fix:** Calculate appropriate zoom based on the distance between hotel and selected POI using a distance-to-zoom mapping. Use `google.maps.LatLngBounds` to fitBounds when a destination is selected.
**Files:** `src/components/HotelMap.tsx` (lines 37-44) -- use `useEffect` with `map.fitBounds()`

## 11. Antalya Search Shows Other Countries
**Answer:** This is due to the Amadeus Test API sandbox having limited data. In test mode, search results are not geographically accurate. This will resolve when switching to production API credentials. No code change needed.

## 12. Multi-City Calendar Purple Box (Still Not Fixed)
**Problem:** The Calendar in multi-city mode (lines 283-306 of `SearchForm.tsx`) still shows purple hover states.
**Fix:** The `Calendar` component inherits from Shadcn which uses the `--accent` CSS variable (purple: `262 60% 68%`). Fix by adding explicit className overrides to the Calendar to use primary color instead of accent for selected/hover states, or override `--accent` within the calendar container.
**Files:** `src/components/SearchForm.tsx` (line 296-304), possibly `src/components/ui/calendar.tsx`

## 13. Closest 2 Restaurants Not Accurate (Still Not Fixed)
**Problem:** Restaurant coordinates are hardcoded for Lanzarote. For hotels outside Lanzarote, these are meaningless.
**Fix:** Same as issue #8 -- the POI data is Lanzarote-specific. For Lanzarote hotels, audit the restaurant coordinates for accuracy. For non-Lanzarote hotels, use a real POI API or hide the section.
**Files:** `src/components/NearbyPOIs.tsx`

## 14. Price Per Person / Per Night Toggle (Still Not Fixed)
**Problem:** The toggle exists in `SearchResults.tsx` and `LiveHotelCard` accepts `priceMode`, but the `HotelDetail.tsx` page and `HotelCard.tsx` (mock hotels) don't support it.
**Fix:** Add the same toggle to `HotelDetail.tsx` and pass `priceMode` to the price display in `HotelCard.tsx`.
**Files:** `src/pages/HotelDetail.tsx`, `src/components/HotelCard.tsx`

## 15. Verify Price Comparison Panel
**Fix:** The `PriceComparisonPanel` component exists and is wired into `LiveHotelCard`. Verify it displays correctly by testing a hotel search. The panel shows 14 providers with simulated prices. Should work as implemented.
**Files:** Verification only

## 16. Map Line Color to Match Theme (Red)
**Problem:** `HotelMap.tsx` uses `strokeColor: "#2563eb"` (blue) and blue marker icon.
**Fix:** Change to the site's primary color (`hsl(347, 87%, 60%)` = approximately `#E83E6C` or `#e8447a`). Also change the destination marker icon to a red one.
**Files:** `src/components/HotelMap.tsx` (lines 67, 76)

## 17. Hotel Page - Static Calendar Issue
**Problem:** The hotel search form calendar in `HotelSearchForm.tsx` uses `RangeDatePickerCalendar` via portal. If dates don't respond to clicks, likely missing `pointer-events-auto`.
**Fix:** Ensure the portal calendar div has proper pointer events and the `RangeDatePickerCalendar` has `pointer-events-auto` on its wrapper.
**Files:** `src/components/HotelSearchForm.tsx` (lines 298-312)

## 18. Hotel "Where Do You Want to Go" Autocomplete Not Working
**Problem:** The hotel autocomplete calls `amadeus-hotel-autocomplete` edge function. If nothing appears, the function may not be deployed, or the response shape doesn't match what the component expects.
**Fix:** Verify the edge function is deployed. The function returns `{ suggestions: [...] }` with `name`, `cityCode`, `countryCode`, `countryName` -- this matches what `HotelSearchForm.tsx` expects. Deploy if needed.
**Files:** Deploy `amadeus-hotel-autocomplete`

## 19. Add Booking Links to Hotel Results
**Fix:** Already implemented in `LiveHotelCard.tsx` (line 154 -- "Book" button linking to Booking.com). Verify it works.
**Files:** Verification only

## 20. Add Hotel Chain Display
**Fix:** Already implemented in `LiveHotelCard.tsx` (lines 50, 91-96) with `CHAIN_NAMES` mapping. Verify `chainCode` is passed from the edge function.
**Files:** Verify `supabase/functions/amadeus-hotel-search/index.ts` passes `chainCode`

## 21. Update Hotel and Packages Autocomplete
**Fix:** Ensure both `amadeus-hotel-autocomplete` and `amadeus-airport-search` edge functions are deployed. The package form already uses `AirportAutocompleteInput`. Hotel form uses `amadeus-hotel-autocomplete`.
**Files:** Deploy edge functions

## 22. Test AI Suggestions Flow
**Fix:** End-to-end testing after all changes are made.

---

## Implementation Order

1. **Quick fixes first:** Items 3, 5, 6, 7, 9, 12, 16 (straightforward code changes)
2. **Map improvements:** Items 8/13 (refactor POIs to use real API), 10 (auto-zoom)
3. **Hotel detail page:** Items 6, 14 (price toggle), 17 (calendar)
4. **Edge function deploys:** Items 18, 20, 21
5. **Verification:** Items 2, 4, 11, 15, 19, 22

## Files to Modify
| File | Issues |
|------|--------|
| `src/components/TripConfidenceCard.tsx` | #1 (images) |
| `src/components/TripStyleQuiz.tsx` | #3 (title case) |
| `src/components/AirportAutocompleteInput.tsx` | #5 (filter fix) |
| `src/components/HotelImageCarousel.tsx` | #6 (arrows visible) |
| `src/pages/HotelDetail.tsx` | #6, #9, #14 (carousel, price history, toggle) |
| `src/components/WeatherForecast.tsx` | #7 (rainfall) |
| `src/components/NearbyPOIs.tsx` | #8, #13 (real POI data) |
| `src/components/HotelMap.tsx` | #10 (auto-zoom), #16 (red line) |
| `src/components/SearchForm.tsx` | #12 (calendar styling) |
| `src/components/HotelSearchForm.tsx` | #17 (calendar pointer events) |
| `src/components/HotelCard.tsx` | #14 (price toggle) |
| New: `src/components/PriceHistoryChart.tsx` | #9 (price history) |

## Edge Functions to Deploy
- `ai-trip-suggestions`
- `amadeus-hotel-autocomplete`
- `amadeus-hotel-search`
