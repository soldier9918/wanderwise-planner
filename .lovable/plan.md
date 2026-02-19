
# Flight Search — End-to-End Bug Fix

## Root Cause Identified

The "Edge Function returned a non-2xx status code" error has **one primary cause** and two secondary improvements needed:

### Bug 1 (PRIMARY — causes every search from homepage to fail)
`SearchForm.tsx` stores cabin class as human-readable strings: `"Economy"`, `"Premium Economy"`, `"Business"`, `"First"`. These are passed directly in the URL as the `cabin` param. `FlightResults.tsx` reads `cabin` and passes it directly as `travelClass` to the Amadeus API. Amadeus strictly requires: `"ECONOMY"`, `"PREMIUM_ECONOMY"`, `"BUSINESS"`, `"FIRST"`. Any mismatch returns a 400 error.

Confirmed by direct API test:
- `travelClass: "Economy"` → **400** "travelClass is not in the allowed enumeration"
- `travelClass: "ECONOMY"` → **200** with results ✓

### Bug 2 (SECONDARY — causes past-date searches to fail with generic message)
If the user selects a date that has already passed, Amadeus returns 400 "Date/Time is in the past". The frontend currently shows a generic "Search failed" message. It should show a human-readable explanation.

### Bug 3 (SECONDARY — better error reporting)
The `catch` block in `FlightResults.tsx` shows `err.message` which is often the raw Supabase function error string. When Amadeus returns a descriptive error (like the cabin class or date error), `data?.error` is already extracted from the JSON response — this is shown correctly. But `fnError.message` from Supabase wraps it in a less helpful string.

---

## Fixes

### Fix 1 — Normalize cabin class to uppercase before passing to URL
**File:** `src/components/SearchForm.tsx`

In `handleSearch`, when building URL params, convert `cabinClass` to the Amadeus-expected format:

```typescript
// Mapping from display label → Amadeus enum
const cabinAmadeusMap: Record<string, string> = {
  "Economy": "ECONOMY",
  "Premium Economy": "PREMIUM_ECONOMY",
  "Business": "BUSINESS",
  "First": "FIRST",
};

const params = new URLSearchParams({
  from: fromIata,
  to: toIata,
  depart: format(checkIn, "yyyy-MM-dd"),
  adults: String(adults),
  children: String(children),
  cabin: cabinAmadeusMap[cabinClass] || cabinClass.toUpperCase().replace(" ", "_"),
  direct: String(directFlights),
});
```

Also fix the multi-city leg search (if triggered it would also use the cabin state).

### Fix 2 — Normalize cabin in FlightResults too (defensive fix)
**File:** `src/pages/FlightResults.tsx`

Even if `SearchForm` is fixed, normalise the cabin param when reading it from the URL so old bookmarked links or direct URL edits also work:

```typescript
// Line 831 — replace:
const cabin = searchParams.get("cabin") || "ECONOMY";

// With:
const cabinRaw = searchParams.get("cabin") || "ECONOMY";
const cabin = cabinRaw.toUpperCase().replace(/\s+/g, "_");
```

This means `"Economy"` → `"ECONOMY"`, `"Premium Economy"` → `"PREMIUM_ECONOMY"` etc., matching the Amadeus API requirement.

### Fix 3 — Better error messages for common API errors
**File:** `src/pages/FlightResults.tsx`

In the `fetch_` async function, improve the error handling to detect and explain common API errors:

```typescript
if (fnError) throw new Error(fnError.message);
if (data?.error) {
  const msg = data.error as string;
  // Give human-friendly messages for known errors
  if (msg.includes("past")) throw new Error("The departure date is in the past. Please choose a future date.");
  if (msg.includes("travelClass")) throw new Error("Invalid cabin class selected. Please search again.");
  throw new Error(msg);
}
```

Also: on the error display UI, add a "Search Again" button that takes the user back to the search form (navigate(-1) or to /flights) so they don't get stuck.

---

## Summary of Files Changed

```text
src/components/SearchForm.tsx
└── handleSearch: convert cabinClass to Amadeus enum format before URL

src/pages/FlightResults.tsx
├── Line 831: normalize cabin from URL param to uppercase enum
└── Error handler: friendly messages for past-date and invalid-cabin errors
```

No new dependencies. No database changes. No edge function changes.
These are pure frontend fixes — 3 targeted line changes across 2 files.
