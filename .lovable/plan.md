

# Fix Plan: Flight Booking Logos, Duplicates & Package Price Toggle

## Issue 1: Partner logos not appearing (Kiwi, Farefare, MyTrip, etc.)

**Root cause:** The `PartnerLogo` component uses `faviconUrl` (e.g. `https://www.kiwi.com/favicon.ico`, `https://www.aviasales.com/favicon.ico`). Many sites block cross-origin favicon requests or return non-image responses, causing `onError` to fire and showing a generic sparkle icon instead of the brand logo.

**Fix:** Replace favicon URLs with proper brand logo URLs that are reliably accessible. Use known CDN-hosted or direct logo image URLs:
- Kiwi.com → `https://images.kiwi.com/common/favicon.ico` or use their logo asset
- Aviasales → use Google's favicon proxy `https://www.google.com/s2/favicons?domain=aviasales.com&sz=64`
- Google Flights → `https://www.google.com/s2/favicons?domain=google.com&sz=64`

Use Google's favicon service (`https://www.google.com/s2/favicons?domain=DOMAIN&sz=64`) universally for all partners — it's reliable and returns proper images.

**File:** `src/pages/FlightResults.tsx` — update `buildBookingLinks` (lines 94-124) to use `https://www.google.com/s2/favicons?domain=...&sz=64` for all `faviconUrl` values.

## Issue 2: Duplicate brands (e.g. Kiwi appearing twice)

**Root cause:** The Travelpayouts `gate` field can return "Kiwi.com" as the gate name, so `buildBookingLinks` adds it as an Aviasales-type link. Then Kiwi.com is also always added as a hardcoded link (line 120). This creates two Kiwi entries.

**Fix:** After building the links array, deduplicate by normalizing label names. Before returning, filter out any hardcoded link whose label matches the `gate` value (case-insensitive). Also use `link.url` or normalized label as the `key` in the React map to avoid key collisions.

**File:** `src/pages/FlightResults.tsx` — add deduplication logic at end of `buildBookingLinks` (before return on line 123), and update the `key` prop in the booking links grid (line 316).

## Issue 3: Flights+Hotels per night / per person toggle

**Status:** Already working correctly. The Flights+Hotels page (`PackageSearchForm.tsx`) navigates to `/results` which renders `SearchResults.tsx`. That page has a working per night/per person toggle (line 118-123) that passes `priceMode` to both `LiveHotelCard` and `HotelCard`. Since hotel search is now mock-only, `HotelCard` handles price mode via the `priceMode` prop (multiplying by 0.7 for per-night). No changes needed here.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/FlightResults.tsx` | Use Google favicon proxy for all partner logos; deduplicate booking links by normalized label |

## Technical Details

In `buildBookingLinks`:
```
faviconUrl: `https://www.google.com/s2/favicons?domain=kiwi.com&sz=64`
```

Deduplication:
```typescript
const seen = new Set<string>();
return links.filter(l => {
  const key = l.label.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
```

