
# Flight Results Page — 4 Fixes

## What's Being Changed

### Fix 1 — Auto-open calendar when no date is entered on Search
**Problem:** The `handleSearch` function in `SearchForm.tsx` currently does nothing when `checkIn` (depart date) is missing — it just builds a URL with an empty `depart` param, which navigates to the results page and triggers "Search failed" because the API call gets no date.

**Fix:** In `handleSearch`, before navigating, add validation: if `!checkIn`, call `openCalendar(departBtnRef)` to programmatically open the date picker and show a form error message. The user stays on the search form and the calendar pops open automatically.

**File:** `src/components/SearchForm.tsx`

---

### Fix 2 — Remove blank space: push content left, pull scrollbar right
**Reference (image-49.png):** The red circle on the left indicates empty space to the left of the Filters sidebar. The green circle on the right indicates the scrollbar is too far inside the content area.

**Root cause:** The `max-w-screen-xl` container uses `mx-auto` centering. On wide screens, if the content doesn't fill the full xl width, there's empty space on both sides. The filter sidebar starts too far from the left edge.

**Fix:**
- Change the outer container from `max-w-screen-xl mx-auto px-4` to `max-w-[1400px] mx-auto px-2` so the layout stretches closer to screen edges.
- In both the sort bar and the body, reduce the spacer `div` width from `w-56` to `w-52` to bring content closer to the left.
- The sidebar width stays `w-56` but the outer container padding reduces, naturally pushing it left.

**File:** `src/pages/FlightResults.tsx`

---

### Fix 3 — Route pill (LHR → ATL) opens inline search editor instead of navigating away
**Reference (image-50.png):** On Skyscanner, clicking the route in the sticky bar reveals an inline edit panel over the results (with a blurred background) that lets users change From/To/Dates/Travellers without leaving the page.

**Current behaviour:** Clicking the route pill does `navigate(-1)` which goes back to the Flights page.

**New behaviour:**
1. Add `editSearchOpen` state (boolean) to `FlightResults`.
2. When the route pill is clicked, set `editSearchOpen = true` — this shows a fixed overlay with a blurred backdrop (`backdrop-blur-sm bg-black/40`) covering the results.
3. In the overlay, render a compact inline edit form with:
   - Two `AirportAutocompleteInput` fields (From / To), pre-populated with the current `from`/`to` params.
   - Two date buttons that open the `RangeDatePickerCalendar` portal (reuse the same pattern already in `SearchForm`).
   - Adults count +/- counter.
   - A "Search" button that builds new URL params and calls `setSearchParams(...)` to refresh results in place.
   - A close (×) button to dismiss.
4. The route pill button changes from `onClick={() => navigate(-1)}` to `onClick={() => setEditSearchOpen(true)}`.

**File:** `src/pages/FlightResults.tsx`

---

### Fix 4 — Cheapest / Fastest / Fewest stops tab style + position (image-52.png)
**Reference:** The green highlight shows these tabs should look like rounded pill-style buttons, not underline tabs. The red highlight shows they should sit to the right of the filter sidebar spacer, inside the content column — matching the screenshot exactly.

**Current:** The tabs are underlined tab-style buttons inside a border-bottom bar.

**New:**
- Style each sort button as a rounded pill: `rounded-xl border border-border px-5 py-2.5 text-sm font-semibold`. When active: `bg-primary/10 border-primary text-primary`. When inactive: `bg-card hover:bg-secondary text-foreground`.
- Move the entire "Cheapest / Fastest / Fewest stops" row out of the full-width bar and INTO the results column (inside the `flex-1` results div), above the results count. This way it sits right-aligned with the cards, not spanning the full page width including the sidebar.
- Remove the separate `<div className="bg-card border-b border-border">` sort bar wrapper entirely — the sort pills live above the `<p>{sorted.length} results</p>` line inside the results div.

**File:** `src/pages/FlightResults.tsx`

---

## Technical Summary

```text
SearchForm.tsx
└── handleSearch: validate checkIn before navigate; if missing,
    call openCalendar(departBtnRef) + set formError

FlightResults.tsx
├── Container: reduce padding/max-width to push content left
├── Sort bar: remove full-width bar, move pills into results column
│   └── Style: rounded-xl pill buttons (active = primary, inactive = ghost)
├── Route pill: onClick → setEditSearchOpen(true) not navigate(-1)
└── New: editSearchOpen overlay
    ├── Fixed backdrop (backdrop-blur-sm bg-black/40 z-50)
    └── Compact inline edit card with:
        ├── AirportAutocompleteInput (From, To)
        ├── Date pickers (portal-based RangeDatePickerCalendar)
        ├── Adults counter
        └── Search button → setSearchParams(new params)
```

No new dependencies. No database changes. No edge function changes.
