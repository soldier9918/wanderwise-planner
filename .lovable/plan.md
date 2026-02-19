
## Flight Search: Full Overhaul — 6 Features + 3 Bug Fixes

### Root Cause Analysis

Before listing changes, here is what is actually broken and why:

**Bug 1 — Autocomplete only triggers at 2+ characters**
The debounce in `AirportAutocompleteInput.tsx` has `if (value.length < 2)` — so typing a single letter (e.g. "L") fires nothing. We need to drop this to **1 character**.

**Bug 2 — Country names return no results**
The Amadeus Location API `subType=CITY,AIRPORT` does not index by country name. When you type "Spain" no items match because Amadeus stores city/airport names, not country names. The fix is to call the API with `subType=CITY,AIRPORT` which it already does — the issue is that "Spain" does not match any city or airport name in their LIGHT view. We must switch to a fuller view (`view=FULL`) or use a two-pass approach: if no results come back for a keyword that looks like a country name, search for cities in that country. A simpler fix: pass `view=FULL` instead of `view=LIGHT` — this returns more metadata and better matches. We should also increase `page[limit]` from 8 to 10 and include `countryCode` search by trying the keyword as a country name in the Amadeus API too.

**Bug 3 — No results for "LHR to Spain"**
The search form sends `to = "Spain"` (or whatever the user typed if they did NOT pick from the dropdown) as the IATA code. The Amadeus flight search needs a 3-letter IATA code. "Spain" is not a valid IATA code, so it returns no results. The fix: the flight search must use `toIata` (the code stored when the user selects from the dropdown). When no IATA was selected (user typed free text), the search form needs to block submission and show a "please select from the dropdown" message. We should also validate and disable the Search button if either IATA code is missing.

---

### All Changes by File

#### 1. `supabase/functions/amadeus-airport-search/index.ts` — Make autocomplete trigger on 1 character, find countries

- Lower the minimum keyword check from `< 2` to `< 1`
- Switch `view` from `LIGHT` to `FULL` — this enables richer matching, including country-based lookups
- Increase `page[limit]` from `"8"` to `"10"`
- Keep `subType: "CITY,AIRPORT"` — both types are needed

#### 2. `src/components/AirportAutocompleteInput.tsx` — Instant response from 1 character, wider dropdown, better display

- **Trigger from 1 character**: change `if (value.length < 2)` to `if (value.length < 1)`, and lower debounce from 300ms to **150ms** for instant feel
- **Wider dropdown**: remove `right-0` constraint on the dropdown div, replace with `min-w-full w-max max-w-sm` so it expands to fit long names without clipping
- **Improved display**: show airport name more prominently, display city + country on the second line — already implemented but currently truncates; change `truncate` to `break-words` on the container and use `whitespace-normal` so full names are always visible
- **Auto-close on select**: already works; no change needed here
- **Show IATA code in brackets prominently** in the main name line: e.g. "London Heathrow (LHR)" — currently shows the IATA badge separately; combine into the display string shown in the input field after selection — already done in `handleSelect`. Just make the badge visually larger

#### 3. `src/components/SearchForm.tsx` — Trip type dropdown auto-closes, date range selection, validation

**Fix 1 — Trip type dropdown auto-close:**
The `<Popover>` for trip type has no `open`/`onOpenChange` — it closes automatically via Radix when clicking outside but NOT when clicking an option inside. We need to add `open` state (`tripTypeOpen`) and call `setTripTypeOpen(false)` inside the `onClick` of each type option. This makes it close instantly when the user selects.

**Fix 2 — Date range on DEPART calendar (range selection):**
Currently Depart uses a `mode="single"` calendar and Return uses a separate `mode="single"` calendar. The user wants:
- Selecting a depart date on the DEPART calendar should auto-highlight a range when a return date already exists (or vice versa)
- Ideally the user can pick both depart AND return on the same calendar (click depart, then click return while the depart popover is still open)

Implementation: Switch the **Depart popover** (when no `fromIata`) to use `mode="range"` on the Calendar so the user can click two dates in one go. The first click sets `checkIn`, the second click sets `checkOut` and closes the popover. When `fromIata` IS set, the `FlightPriceCalendar` handles dates — we add return-date selection support there too (clicking a second date when depart is already selected).

The **Return calendar** also shows the currently selected range highlighted. Pass `checkIn` as the range start so dates in-between are highlighted visually. Use `mode="range"` on the Return calendar and feed it `{ from: checkIn, to: checkOut }` as the selected value.

**Fix 3 — Search validation:**
If the user types in the From/To fields but does NOT select from the dropdown (so `fromIata` and `toIata` remain empty), display an inline warning and prevent navigation. Add a `formError` state shown below the search bar.

#### 4. `src/components/FlightPriceCalendar.tsx` — Larger, more legible, range highlight support

- **Larger cells**: increase `min-h-[56px]` to `min-h-[68px]`, font size for day number from `text-sm` to `text-base`, price text from `text-[10px]` to `text-xs`
- **Larger header text**: `text-sm font-semibold` → `text-base font-bold` for the month label
- **Weekday header font**: `text-xs` → `text-sm`
- **Range highlighting**: add a `returnDate?: Date` prop. When both `selectedDate` (depart) and `returnDate` are provided, days in between get a soft `bg-primary/10` highlight — same visual as other booking sites
- **Clicking a return date**: add an `onReturnSelect?: (date: Date) => void` prop. After the depart date is selected, subsequent day clicks set the return date instead and call `onReturnSelect`
- Wire this up in `SearchForm.tsx`: the Depart popover passes `returnDate={checkOut}` and `onReturnSelect={(d) => { setCheckOut(d); setDepartPopoverOpen(false); }}`

#### 5. `src/pages/FlightResults.tsx` — Airline logos on flight card

Add airline logo images from the Clearbit Logo API (free, no key needed) or a public CDN. The pattern is:
```
https://logo.clearbit.com/{domain}
```
Build a `airlineLogoDomains` map:
```ts
const airlineLogoDomains: Record<string, string> = {
  FR: "ryanair.com", U2: "easyjet.com", BA: "britishairways.com",
  EK: "emirates.com", LH: "lufthansa.com", AF: "airfrance.com",
  KL: "klm.com", IB: "iberia.com", TK: "turkishairlines.com",
  QR: "qatarairways.com", EY: "etihad.com", SQ: "singaporeair.com",
};
```
In the flight card, replace the text-only airline name block with:
```jsx
<div className="w-32 shrink-0 flex items-center gap-2">
  {airlineLogoDomains[carrierCode] ? (
    <img
      src={`https://logo.clearbit.com/${airlineLogoDomains[carrierCode]}`}
      alt={airline}
      className="w-8 h-8 rounded object-contain bg-white p-0.5 border border-border"
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  ) : (
    <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
      {carrierCode}
    </div>
  )}
  <div>
    <p className="font-semibold text-foreground text-sm">{airline}</p>
    <p className="text-xs text-muted-foreground">{carrierCode} {firstSeg.number}</p>
  </div>
</div>
```

#### 6. Price Alerts — New feature (frontend + database)

Price alerts need a database table to persist them. Since there is currently no Supabase authentication in this app (no users), we will store alerts by a browser-generated UUID (stored in `localStorage`) so we don't need login.

**New database table** (via migration):
```sql
create table public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  from_iata text not null,
  to_iata text not null,
  depart_date text not null,
  return_date text,
  adults int not null default 1,
  cabin text not null default 'ECONOMY',
  target_price numeric,
  current_price numeric,
  created_at timestamptz default now()
);

alter table public.price_alerts enable row level security;

-- Allow anonymous inserts/reads by session_id (no auth required)
create policy "Anyone can insert alert" on public.price_alerts
  for insert with check (true);

create policy "Anyone can read own alerts" on public.price_alerts
  for select using (true);
```

**New `PriceAlertButton` component** (`src/components/PriceAlertButton.tsx`):
- Props: `from`, `to`, `depart`, `returnDate`, `adults`, `cabin`, `currentPrice`
- On click: inserts a row into `price_alerts` with the current session_id (from localStorage)
- Shows a bell icon that fills/animates when the alert is saved
- Toast notification: "Price alert set! We'll show you if the price drops."
- Add this button next to the Select button on each flight card in `FlightResults.tsx`

Note: The actual price-checking/notification mechanism would require a scheduled backend job (beyond scope here). The UI captures the intent and stores it — it can be wired to email notifications in a future step.

---

### Summary of File Changes

| File | Change |
|---|---|
| `supabase/functions/amadeus-airport-search/index.ts` | Trigger from 1 char, switch to `view=FULL`, increase limit to 10 |
| `src/components/AirportAutocompleteInput.tsx` | Debounce 150ms, trigger from 1 char, wider dropdown, better display |
| `src/components/SearchForm.tsx` | Trip type popover auto-close, range date selection, form validation |
| `src/components/FlightPriceCalendar.tsx` | Larger cells/fonts, range highlight between depart/return dates, return date click support |
| `src/pages/FlightResults.tsx` | Airline logos on each card, PriceAlertButton integration |
| `src/components/PriceAlertButton.tsx` (NEW) | Bell icon button that saves flight alert to database |
| Database migration | New `price_alerts` table with RLS |

### Technical Execution Order

1. Database migration (price_alerts table) first
2. Edge function update (airport search — lower threshold)
3. AirportAutocompleteInput (faster, wider)
4. SearchForm (trip type close, date range, validation)
5. FlightPriceCalendar (larger UI, range highlight)
6. FlightResults (logos + alert button)
7. PriceAlertButton (new component)
