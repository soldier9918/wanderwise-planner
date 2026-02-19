
# Flight Results Page — 6 Fixes

## Issues to Fix

### 1. Autocomplete showing irrelevant results (e.g. typing "i" returns airports not starting with "i")
**Root cause:** The Amadeus API uses keyword matching across the full name, city, country, and IATA code — not just the prefix. So "I" might match "Madrid International" or "Ibiza" via the country field. The fix is to client-side filter the returned suggestions, keeping only those where the airport name, city name, IATA code, or country name **starts with** the typed keyword (case-insensitive).

**Files:** `src/components/AirportAutocompleteInput.tsx`

---

### 2. Reduce result box sizes to match Skyscanner
**Reference:** The screenshots show compact cards with less vertical padding. Times are large but the surrounding padding is tighter. The right price column is narrower (~140px). The airline logo is smaller.

**Changes:**
- Reduce `p-5` to `p-3 px-4` on left flight info section
- Reduce `space-y-4` to `space-y-2` between outbound/inbound rows  
- Make times slightly smaller (`text-xl` instead of `text-2xl`)
- Narrow the right price column from `w-44` to `w-36`
- Tighten airline logo size from `w-9 h-9` to `w-8 h-8`

**Files:** `src/pages/FlightResults.tsx` — `FlightCard` and `ItineraryRow`

---

### 3. Filter sidebar: sticky and scrollable with the page
**Root cause:** The sidebar uses `sticky top-36` but the filter sections expand/collapse inside a fixed-height container, so the filter panel itself doesn't scroll. 

**Fix:** Make the sidebar `sticky top-20` (just below the fixed navbar+sort bar), give it `max-h-[calc(100vh-5rem)] overflow-y-auto` so it scrolls independently within the viewport, keeping filters visible as the user scrolls through results.

**Files:** `src/pages/FlightResults.tsx` — sidebar `<aside>` element

---

### 4. Larger, more accessible text
**Reference image 47** shows large bold departure/arrival times, clear airline names, and prominent pricing. Changes:
- Times: keep `text-2xl` but make them `font-black`
- IATA codes below times: increase from `text-xs` to `text-sm font-bold`
- Duration/stops label in the middle: increase from `text-xs` to `text-sm`
- Price: increase from `text-3xl` to `text-3xl font-black`
- "per person" label: increase from `text-xs` to `text-sm`
- Sort bar labels (Cheapest/Fastest): increase from `text-xs` to `text-sm font-semibold`

**Files:** `src/pages/FlightResults.tsx`

---

### 5. Luggage icons on flight cards
**Reference image 47** shows small luggage icons between the arrival time and the price column: a personal item bag icon, a crossed-out checked bag icon (not included), and a suitcase icon.

Implementation:
- Add three small SVG/lucide icons in a row: `Briefcase` (personal item), `Luggage` (cabin bag), `Package` (checked bag)
- These appear to the right of the arrival IATA, before the price divider
- Show them as grey (not included) or coloured (included) based on Amadeus `fareDetailsBySegment.includedCheckedBags` data if available, otherwise show standard economy defaults (cabin bag ✓, no checked bag ✗)

**Files:** `src/pages/FlightResults.tsx` — `ItineraryRow` or `FlightCard`

---

### 6. Results and sort bar alignment — reduce left space
**Root cause:** The sort bar (`max-w-screen-xl`) is full-width but the results column starts after the 240px sidebar, creating misalignment. The sort tabs should align with the results, not span the full width including sidebar space.

**Fix:**
- Wrap the sort bar content in the same `flex gap-4` layout as the body, with a matching `w-60 shrink-0` spacer div on the left (desktop only), so the "Cheapest / Fastest / Fewest stops" tabs line up exactly with the result cards.
- Reduce overall sidebar width from `w-60` to `w-56` to save space for ad reservations on the right.

**Files:** `src/pages/FlightResults.tsx` — sort bar and body layout

---

## Technical Summary

```text
FlightResults.tsx changes:
├── ItineraryRow: larger accessible text, luggage icons, tighter padding
├── FlightCard: compact layout, narrower price column
├── FilterSidebar <aside>: sticky + max-height + overflow-y-auto
├── Sort bar: add left spacer to align with results
└── Body layout: sidebar w-56, results flex-1

AirportAutocompleteInput.tsx:
└── Client-side filter: keep only suggestions where name/city/IATA
    starts with the typed keyword (case-insensitive)
```

All changes are contained to two files. No new dependencies needed. No database changes.
