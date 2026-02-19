
## Hotel Destination Autocomplete

### What We're Building

The "Where do you want to go?" field in `HotelSearchForm` currently accepts free-text with no suggestions. We'll upgrade it to a live autocomplete that queries the **Amadeus Hotel & City Search API** as the user types, showing a dropdown of matching cities/hotels with their country — and storing the selected city code to pass along when searching.

### How It Works

```text
User types "Par..."
       |
       v
HotelSearchForm (debounce 300ms)
       |
       v
Edge Function: amadeus-hotel-autocomplete
       |
       v
Amadeus API: GET /v1/reference-data/locations/hotel-cities?keyword=Par
       |
       v
Returns: [{ name: "Paris", countryCode: "FR", iataCode: "PAR" }, ...]
       |
       v
Dropdown shown under input — user selects "Paris, France"
       |
       v
cityCode "PAR" stored, passes to /results?cityCode=PAR&...
```

### Files to Create / Edit

**1. New Edge Function — `supabase/functions/amadeus-hotel-autocomplete/index.ts`**
- Reuses the same Amadeus token-fetching pattern as the existing flight search function
- Calls `GET https://test.api.amadeus.com/v1/reference-data/locations/hotel-cities?keyword={keyword}&max=8`
- Returns an array of `{ name, countryCode, cityCode }` objects
- Handles CORS identically to the existing function

**2. Edit `src/components/HotelSearchForm.tsx`**
- Add state: `suggestions`, `showSuggestions`, `selectedCityCode`, `isLoading`
- Add a `useEffect` with 300ms debounce on the `destination` input that calls the new edge function
- Replace the plain `<input>` with a container that also renders a dropdown list below it
- On suggestion click: set `destination` display text (e.g. "Paris, France") and store `cityCode` separately
- Close dropdown on blur / after selection
- Pass `cityCode` (not raw text) in the navigate URL: `/results?cityCode=PAR&...`

### Autocomplete Dropdown Design

- Appears directly below the destination input, full-width, with a subtle card shadow
- Each row shows: **City name** (bold) + country (muted), with a map-pin icon
- Highlights on hover with the primary/5 bg tint (matching the rest of the form)
- Loading spinner replaces dropdown when fetching
- "No results found" empty state when API returns nothing

### Technical Details

- Debounce: 300ms to avoid hammering the API on every keystroke
- Minimum 2 characters before a request fires
- Z-index set high enough to overlap the date/guest fields
- Keyboard accessible: clicking outside closes the dropdown
- If user clears the input, `selectedCityCode` is reset so a fresh search is required
- The edge function uses the same `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` secrets already configured — no new secrets needed
