

# Fix Plan: Navbar, Hotels, AI Suggestions, and Price Alerts

## NAVBAR

### 1. Active state highlighting for all nav items
**Problem:** Line 58 of `Navbar.tsx` has `&& item.label === "Flights + Hotels"` which restricts the pink highlight to only the home page link.
**Fix:** Remove the `item.label === "Flights + Hotels"` condition so the active style applies when `location.pathname === item.path` for any nav item.
**File:** `src/components/Navbar.tsx` (line 58)

### 2. Search box rounded edges consistency
**Problem:** The Hotels page (`HotelSearchForm.tsx`) wraps its search row in `bg-card rounded-xl p-6` inside the navy container. The Flights+Hotels page (`PackageSearchForm.tsx` line 92) uses `rounded-xl` on the row but lacks the inner `bg-card rounded-xl p-6` wrapper. The Flights page (`SearchForm.tsx` line 182) has `bg-card rounded-xl p-6`.
**Fix:** Add the same inner `bg-card rounded-xl p-6` wrapper to `PackageSearchForm.tsx` to match the Hotels page style. The Flights page already has it. Ensure all three use the same structure.
**File:** `src/components/PackageSearchForm.tsx` (line 91-92)

---

## HOTELS PAGE

### 3. POIs showing "No results" despite map showing markers
**Problem:** The Overpass API query for restaurants uses `node["amenity"="restaurant"]` which only finds OSM nodes, but many restaurants are mapped as `way` (building outlines). The map shows POI markers from the raw API data, but the restaurant/shopping/transport lists filter by `RADIUS_KM` which is correct -- the issue is that `way` elements don't have direct `lat`/`lon` on them in Overpass unless you request `out center`.
**Fix:** Update the Overpass queries in `NearbyPOIs.tsx` to include `way` type for restaurants, shopping, hospitals, and spa. Also change the output format from `out body` to `out center` so that way elements return center coordinates. Update the parsing to use `el.center?.lat || el.lat` and `el.center?.lon || el.lon`.
**File:** `src/components/NearbyPOIs.tsx` (lines 59-86, 107-124)

### 4. Price History section placement
**Problem:** In `HotelDetail.tsx`, Price History appears after Weather (line 99). User wants it above everything else.
**Fix:** Move the Price History section above the Weather section in the layout order.
**File:** `src/pages/HotelDetail.tsx` (lines 92-102)

### 5. Hotel images not displaying (carousel shows no images)
**Problem:** `HotelImageCarousel.tsx` (line 38) uses `source.unsplash.com` which is deprecated and no longer serves images. The carousel arrows work but images fail to load.
**Fix:** Replace with curated Unsplash photo IDs similar to `TripConfidenceCard.tsx`. Create a set of generic hotel image IDs and use `images.unsplash.com/photo-{id}?w=600&h=400&fit=crop` URLs.
**File:** `src/components/HotelImageCarousel.tsx` (lines 11, 38, 45)

### 6. Price toggle not working on search results
**Problem:** In `SearchResults.tsx`, the `priceMode` state exists and is passed to `LiveHotelCard`. However, looking at the code, the toggle and `LiveHotelCard` component both look correct. The issue may be that on the mock hotel path, `HotelCard.tsx` (line 107) hardcodes "per person" and doesn't accept a `priceMode` prop.
**Fix:** Add `priceMode` prop to `HotelCard` and use it for price display. Also verify the toggle is visible and functional for both live and mock hotel views.
**File:** `src/components/HotelCard.tsx` (lines 7-11, 99-107)

### 7. Star rating and review filters not updating results
**Problem:** The filters in `SearchFilters.tsx` call `onFilterChange` immediately via the `update` function (line 37-41), which triggers `setFilters` in `SearchResults.tsx`. The filtering logic in `SearchResults.tsx` already uses these filters. The issue is likely that the star filter uses `filters.minStars` and the live hotel filtering (line 80) checks `h.stars < filters.minStars`, but the Amadeus API sometimes returns `stars: 0` for unrated hotels, which would be filtered out when any star filter is selected. This is working as designed. The `minRating` filter checks `h.rating`, but many Amadeus hotels have `rating: 0`. No "Apply" button is needed since filters apply instantly -- this is standard UX.
**Fix:** Clarify: filters already work instantly on change. For star ratings, change filter to `h.stars > 0 && h.stars < filters.minStars` so unrated hotels still show when a star filter is active. Same for minRating. No "Search" button needed as filters are live.
**File:** `src/pages/SearchResults.tsx` (lines 78-84)

### 8. Hotel calendar not responding to clicks
**Problem:** The `HotelSearchForm.tsx` calendar uses a portal-based `RangeDatePickerCalendar`. The portal div (line 301) has `pointer-events-auto` but may need it propagated. Looking at the code, it seems correct. The issue may be that the portal div's `zIndex: 99999` is correct but the `pointer-events-auto` class might not be enough if a parent blocks events.
**Fix:** Ensure the portal div wrapping the calendar has explicit `pointer-events: auto` on both the outer div and inner calendar. Add a transparent backdrop to prevent click-through issues.
**File:** `src/components/HotelSearchForm.tsx` (lines 298-314)

### 9. Hotel autocomplete not showing results
**Problem:** The `HotelSearchForm.tsx` uses `amadeus-hotel-autocomplete` edge function. The debounce condition (line 149) has `if (destination.length < 1 || selectedCityCode)` which prevents fetching when `selectedCityCode` is set. But on fresh typing, `selectedCityCode` is empty. The real issue might be that the edge function is not deployed or returning wrong format.
**Fix:** Ensure the edge function is deployed. Verify the response shape matches what the component expects. Also check that the `onFocus` handler (line 263) correctly triggers suggestions.
**File:** Deploy `amadeus-hotel-autocomplete` edge function

### 10. Booking links on hotel results
**Already implemented** in `LiveHotelCard.tsx` (line 154) with a "Book" button linking to Booking.com. This is working.

### 11. Hotel chain display
**Already implemented** in `LiveHotelCard.tsx` (lines 50, 91-96) with `CHAIN_NAMES` mapping. Verify edge function passes `chainCode`.

### 12. Hotel autocomplete improvements
**Fix:** The autocomplete works but may need the edge function deployed. No code changes needed beyond deployment.

---

## AI SUGGESTIONS PAGE

### 13. All destinations showing the same image
**Problem:** `TripConfidenceCard.tsx` (line 97) looks up `DESTINATION_PHOTOS` by `rec.destination.toLowerCase()`. If the AI returns destinations not in the curated map, they all fall back to the same default photo ID `1507525428034-b723cf961d3e`.
**Fix:** Expand the `DESTINATION_PHOTOS` map with more destinations, and also use the AI's `imageQuery` field to generate varied fallback images. Use the destination name as a seed to pick from a pool of diverse travel images so that even unmapped destinations get different images.
**File:** `src/components/TripConfidenceCard.tsx` (lines 6-42, 97)

### 14. AI suggestions accuracy
The edge function (`ai-trip-suggestions`) looks correct -- it uses Gemini via Lovable AI gateway with proper system/user prompts. Accuracy depends on the AI model. The implementation is sound. Will deploy and test.

### 15. Quiz title casing
**Problem:** The heading "Tell us how you want to feel" on the AI Suggestions page (line 74 of `AISuggestions.tsx`) should be Title Case.
**Fix:** Change to "Tell Us How You Want To Feel".
**File:** `src/pages/AISuggestions.tsx` (line 74)

---

## PRICE ALERTS

### 16. Price alert not appearing on dashboard
**Problem:** `PriceAlertButton.tsx` (line 19) uses localStorage key `"price_alert_session_id"` while `PriceAlerts.tsx` (line 24) uses `"ff_session_id"`. These are different keys, so alerts saved with one session ID are queried with a different session ID, returning no results.
**Fix:** Align both to use the same localStorage key. Change `PriceAlerts.tsx` to use `"price_alert_session_id"` (matching the button component).
**File:** `src/pages/PriceAlerts.tsx` (line 24)

---

## Summary of Files to Modify

| File | Issues |
|------|--------|
| `src/components/Navbar.tsx` | #1 (active state) |
| `src/components/PackageSearchForm.tsx` | #2 (rounded edges) |
| `src/components/NearbyPOIs.tsx` | #3 (POI accuracy -- add `way` + `out center`) |
| `src/pages/HotelDetail.tsx` | #4 (reorder Price History above Weather) |
| `src/components/HotelImageCarousel.tsx` | #5 (fix broken Unsplash URLs) |
| `src/components/HotelCard.tsx` | #6 (add priceMode prop) |
| `src/pages/SearchResults.tsx` | #7 (star filter logic for unrated hotels) |
| `src/components/HotelSearchForm.tsx` | #8 (calendar pointer events) |
| `src/components/TripConfidenceCard.tsx` | #13 (varied fallback images) |
| `src/pages/AISuggestions.tsx` | #15 (title case heading) |
| `src/pages/PriceAlerts.tsx` | #16 (session ID mismatch -- critical bug) |

## Edge Functions to Deploy
- `amadeus-hotel-autocomplete`
- `ai-trip-suggestions`
- `amadeus-hotel-search`

