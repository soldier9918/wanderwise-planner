
## Flight Price Calendar View

### What We're Building

A price calendar component that appears below the departure date picker in the flight search form. Once a user has selected an origin airport (via the autocomplete), the calendar fetches the cheapest available price for each day of the current/selected month from the **Amadeus Flight Inspiration Search API** — letting users instantly spot the cheapest travel days before locking in a date.

### How the Amadeus API Works

The endpoint used is:

```
GET /v1/shopping/flight-destinations?origin={IATA}&oneWay=false&nonStop=false&viewBy=DATE
```

This returns a list of destinations and dates with the cheapest price for each. Since the test environment has limited data, we'll call it with just the `origin` and filter client-side to pick the lowest price per departure date.

**Note**: The Amadeus test environment returns limited/sample data, so not every calendar day will have a price — days without data will show as grayed out.

### Architecture Overview

```
User selects "From" airport  →  fromIata = "LHR"
User clicks Depart field     →  Price calendar appears below date picker

FlightPriceCalendar component
  │
  ├── useEffect on `fromIata` + displayed month
  │
  └── Edge Function: amadeus-flight-inspiration
        │
        └── Amadeus API: GET /v1/shopping/flight-destinations?origin=LHR&viewBy=DATE
              │
              └── Returns: [{ departureDate, price.total }, ...]
                    │
                    └── Build a map: { "2026-03-05": 89.00, "2026-03-12": 112.50, ... }
                          │
                          └── Render calendar grid with price badges on each day
                                Cheapest day highlighted in green
                                Clicking a day → sets the depart date in SearchForm
```

### Files to Create / Edit

**1. New Edge Function — `supabase/functions/amadeus-flight-inspiration/index.ts`**
- Reuses the same Amadeus token-caching pattern
- Accepts query params: `origin` (required), `oneWay` (optional), `nonStop` (optional)
- Calls `GET https://test.api.amadeus.com/v1/shopping/flight-destinations?origin={origin}&viewBy=DATE`
- Returns `{ prices: { [date: string]: number } }` — a plain date-to-price map
- Handles CORS identically to all existing functions

**2. New Component — `src/components/FlightPriceCalendar.tsx`**
- Props: `origin: string` (the IATA code), `month: Date`, `onDaySelect: (date: Date) => void`, `selectedDate?: Date`
- Fetches from the edge function whenever `origin` or `month` changes
- Renders a clean monthly calendar grid (Mon–Sun header, 6-row grid)
- Each day cell shows:
  - Day number
  - Price badge below (e.g. `£89`) in green/amber based on relative cost
  - Cheapest day of the month gets a green `Best price` label
  - Days in the past are grayed/disabled
  - Days with no API data show no price but remain selectable
- Month navigation arrows (prev/next month) — disables going before current month
- Loading skeleton while fetching
- Empty state if no price data returned ("Price data unavailable for this route")

**3. Edit `src/components/SearchForm.tsx`**
- Add a `showPriceCalendar` state that becomes `true` when the Depart popover is opened AND `fromIata` is set
- Pass `fromIata`, the displayed `checkIn` month, and an `onDaySelect` callback into `<FlightPriceCalendar>`
- The price calendar renders inside the Depart `PopoverContent`, replacing or sitting below the standard DayPicker — the user can use either: clicking a price day sets the date and closes the popover

### Flight Price Calendar UI Design

```
  ← February 2026  →          (month nav)
  Mo  Tu  We  Th  Fr  Sa  Su
   2   3   4   5   6   7   8
  £45 £52     £39 £61 £88 £72
                ↑
            "Best price" chip (green)

   9  10  11  12  13  14  15
  £49     £55 £60 £38 £74 £91
                        ↑
                    no data = blank
```

- Each cell: rounded square, hover highlight, selected = primary bg
- Price text: `text-green-600` for cheapest, `text-amber-600` for mid-range, `text-muted-foreground` for expensive  
- "Best price" tag: tiny green pill on the cheapest day
- Full-width inside the popover, max-width constrained so it doesn't overflow

### Technical Details

- The edge function uses GET params (not POST body) — consistent with `amadeus-airport-search`
- No new secrets needed — uses existing `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET`
- Price colouring thresholds: cheapest 33% = green, middle 33% = amber, top 33% = default muted
- The price calendar only appears when `fromIata` is populated (the user has selected a From airport via autocomplete) — otherwise the normal DayPicker shows as before, so the form still works without an origin
- Month navigation updates a local `calendarMonth` state, and a new fetch fires for each month shown
- The component is self-contained — its own fetch, loading, and error state
- Edge function deployed automatically on save
