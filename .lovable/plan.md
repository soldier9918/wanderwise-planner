
## IATA Airport Autocomplete for Flight Search Form

### What We're Building

The From and To fields in `SearchForm.tsx` currently accept raw free-text and naively slice the first 3 characters to produce an IATA code. This often produces wrong codes (e.g. typing "London" sends "LON" instead of "LHR" or "LGW"). We'll replace them with a live airport/city autocomplete backed by the Amadeus Airport & City Search API, matching the pattern already built for hotel destination search.

### How It Works

```
User types "Lon..."
      |
      v
SearchForm (debounce 300ms, min 2 chars)
      |
      v
New Edge Function: amadeus-airport-search
      |
      v
Amadeus API: GET /v1/reference-data/locations?subType=CITY,AIRPORT&keyword=Lon
      |
      v
Returns: [{ name: "London Heathrow", iataCode: "LHR", ... }, { name: "London Gatwick", iataCode: "LGW", ... }, ...]
      |
      v
Dropdown under the input — user selects "London Heathrow (LHR)"
      |
      v
iataCode "LHR" stored — passed to /flight-results?from=LHR&...
```

### Files to Create / Edit

**1. New Edge Function — `supabase/functions/amadeus-airport-search/index.ts`**
- Reuses the exact same Amadeus token-caching pattern as `amadeus-flight-search`
- Calls `GET https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY,AIRPORT&keyword={keyword}&page[limit]=8&view=LIGHT`
- Maps each result to `{ name, iataCode, cityName, countryCode }` — enough to display a rich label and store the code
- Handles CORS identically to existing functions (no new secrets required)

**2. Create `src/components/AirportAutocompleteInput.tsx`** — a reusable component
- Props: `label`, `placeholder`, `value` (display string), `onChange`, `onSelect(iataCode, displayLabel)`
- Internal state: `suggestions`, `showDropdown`, `isLoading`
- 300ms debounced fetch to the new edge function on every keystroke (≥2 chars)
- Closes on outside click via a `useRef` + `mousedown` listener
- Dropdown rows show: **City/airport name** (bold) + IATA code chip (e.g. `LHR`) + country — matching the hotel autocomplete style with a `Plane` icon
- Loading spinner and "No results" empty state
- `onMouseDown` with `e.preventDefault()` on suggestion buttons to prevent blur-before-click (same pattern as hotel autocomplete)
- Extracted as its own component so it works for both the standard From/To fields AND the multi-city leg fields without duplicating logic

**3. Edit `src/components/SearchForm.tsx`**

State changes:
- Replace `departureCity: string` (raw text) with `departureCity: string` (display label) + `fromIata: string` (stored code)
- Replace `destination: string` with `destination: string` (display) + `toIata: string` (stored code)
- For multi-city legs, add `fromIata` and `toIata` fields to the `FlightLeg` interface alongside the existing `from`/`to` display strings
- Update `swapCities()` to swap both display labels and IATA codes

Search handler changes:
- Remove the current `departureCity.trim().toUpperCase().slice(0, 3)` hack
- Use `fromIata` and `toIata` directly when building the `/flight-results` URL params
- Multi-city search will similarly use each leg's stored `fromIata`/`toIata`

UI changes:
- Replace the plain `<input>` for From with `<AirportAutocompleteInput>` in the standard (Return/One-way) layout
- Replace the plain `<input>` for To with `<AirportAutocompleteInput>` in the standard layout
- Replace the From and To `<input>` elements inside each multi-city leg row with `<AirportAutocompleteInput>`
- The swap button will be wired to swap both display strings and IATA codes

### Autocomplete Dropdown Design

Each suggestion row displays:
- ✈ Plane icon (primary colour, matching MapPin in hotel autocomplete)
- **Airport/city name** in bold foreground text
- IATA code as a small badge/chip (e.g. `LHR` in muted style)
- City + country in muted smaller text on a second line (e.g. "London, United Kingdom")
- Hover: `bg-primary/5` tint, same as hotel autocomplete

### Technical Details

- No new secrets needed — reuses `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET` already configured
- The `AirportAutocompleteInput` component is self-contained: it owns its own debounce ref, suggestions state and click-outside listener, keeping `SearchForm.tsx` clean
- The `FlightLeg` interface gets two new optional fields (`fromIata?: string`, `toIata?: string`) so multi-city legs can track codes without breaking existing structure
- The existing `handleSearch` currently does `.trim().toUpperCase().slice(0, 3)` as a workaround — this will be replaced with the stored IATA code; if no suggestion was selected (user typed a raw 3-letter code), the raw input is used as a fallback so the form still works
- `view=LIGHT` parameter on the Amadeus API call returns a compact response with only essential fields, reducing payload size
- The edge function will be deployed automatically on save
