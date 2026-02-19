
## 'Book Now' Deep-Link Flow for Flight Results

### What We're Building

When a user clicks **Select** on a flight result card, instead of doing nothing, the app will:

1. Build a deep-link URL to **Skyscanner** (primary, affiliate-ready) using the real search parameters already on the page — origin, destination, departure date, return date, passenger count and cabin class.
2. Open that link in a new tab immediately on click — no extra modal needed for the primary action.
3. Optionally show a small **"Where to book" popover/sheet** directly on the card with 2–3 alternative booking options (Kiwi, Google Flights, direct airline) so users can compare.

This is a pure front-end change — no new edge functions or database tables required.

### How the Deep-Links Work

**Skyscanner** has a public deep-link format:
```
https://www.skyscanner.net/transport/flights/{from}/{to}/{departDate}/{returnDate}/
  ?adults={n}&children={n}&cabinclass={cabin}&currency={currency}
```
- Date format: `YYMMDD` (e.g. 26th March 2026 → `260326`)
- Cabin values: `economy`, `premiumeconomy`, `business`, `first`
- No affiliate key required for basic links; an affiliate ID can be appended later as `&associateid=…`

**Kiwi.com** (formerly Skypicker) supports:
```
https://www.kiwi.com/en/search/results/{FromCity}/{ToCity}/{departDate}/{returnDate}
```
- Date format: `DD/MM/YYYY` (e.g. `26/03/2026`)
- Adults/children as query params: `?adults={n}&children={n}`

**Google Flights**:
```
https://www.google.com/travel/flights/search?tfs=CBwQARo…
```
Google Flights uses a base64-encoded protobuf payload which is not easily hand-crafted. Instead we'll use:
```
https://www.google.com/travel/flights?q=Flights+to+{to}+from+{from}+on+{date}
```
This opens a pre-filled search that's good enough as a fallback option.

**Direct airline** deep-links per carrier code (best-effort):
- `FR` (Ryanair): `https://www.ryanair.com/gb/en/trip/flights/select?ADT={n}&...`
- `U2` (easyJet): `https://www.easyjet.com/en/`
- `BA` (British Airways): `https://www.britishairways.com/travel/book/public/en_gb`
- All others: fall through to Skyscanner as the universal booking agent

### Files to Change — One File Only

**Edit `src/pages/FlightResults.tsx`**

All the logic lives inside this one self-contained page. Changes:

1. **Add a `buildBookingLinks` helper** near the top of the component (outside JSX) that takes the search params and carrier code and returns an array of `{ label, url, logo }` objects:
   ```ts
   interface BookingLink {
     label: string;
     sublabel: string;
     url: string;
     icon: "skyscanner" | "kiwi" | "google" | "airline";
   }
   ```

2. **Add `selectedOfferId` state** — tracks which flight card's popover is open (`string | null`).

3. **On the Select button**: instead of a plain `<button>` doing nothing, it now:
   - Opens Skyscanner directly in a new tab (primary action — `window.open`)
   - Toggles a small inline "Also available on" panel below the card row

4. **"Also available on" expanded panel** (below each card, `AnimatePresence`-animated):
   - Shows 2–3 alternative booking options with branded labels
   - Each is an `<a target="_blank">` link
   - Closes when the user clicks Select on a different card or clicks "Close"

### Detailed Link-Building Logic

```ts
function toSkyscannerDate(isoDate: string): string {
  // "2026-03-26" → "260326"
  const [y, m, d] = isoDate.split("-");
  return y.slice(2) + m + d;
}

function toKiwiDate(isoDate: string): string {
  // "2026-03-26" → "26/03/2026"
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

const cabinSkyscanner: Record<string, string> = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premiumeconomy",
  BUSINESS: "business",
  FIRST: "first",
};

function buildBookingLinks(
  from: string, to: string,
  depart: string, returnDate: string,
  adults: number, children: number,
  cabin: string, carrierCode: string
): BookingLink[] {
  const depSS = toSkyscannerDate(depart);
  const retSS = returnDate ? toSkyscannerDate(returnDate) : "";
  const depKiwi = toKiwiDate(depart);
  const retKiwi = returnDate ? toKiwiDate(returnDate) : "";
  const cabinSS = cabinSkyscanner[cabin.toUpperCase()] || "economy";

  const ssBase = returnDate
    ? `https://www.skyscanner.net/transport/flights/${from}/${to}/${depSS}/${retSS}/`
    : `https://www.skyscanner.net/transport/flights/${from}/${to}/${depSS}/`;
  const ssUrl = `${ssBase}?adults=${adults}&children=${children}&cabinclass=${cabinSS}`;

  const kiwiBase = returnDate
    ? `https://www.kiwi.com/en/search/results/${from}/${to}/${depKiwi}/${retKiwi}`
    : `https://www.kiwi.com/en/search/results/${from}/${to}/${depKiwi}`;
  const kiwiUrl = `${kiwiBase}?adults=${adults}&children=${children}`;

  const googleUrl = `https://www.google.com/travel/flights?q=Flights+from+${from}+to+${to}`;

  const links: BookingLink[] = [
    { label: "Skyscanner", sublabel: "Compare & book", url: ssUrl, icon: "skyscanner" },
    { label: "Kiwi.com", sublabel: "Best fare finder", url: kiwiUrl, icon: "kiwi" },
    { label: "Google Flights", sublabel: "Price overview", url: googleUrl, icon: "google" },
  ];

  // Prepend direct airline link for known carriers
  const directUrls: Record<string, string> = {
    FR: `https://www.ryanair.com/gb/en/trip/flights/select`,
    U2: `https://www.easyjet.com/en/`,
    BA: `https://www.britishairways.com/travel/book/public/en_gb`,
    KL: `https://www.klm.com/en/`,
    AF: `https://www.airfrance.co.uk/`,
    LH: `https://www.lufthansa.com/gb/en/homepage`,
    IB: `https://www.iberia.com/`,
    VY: `https://www.vueling.com/en`,
    TK: `https://www.turkishairlines.com/`,
    QR: `https://www.qatarairways.com/`,
  };

  if (directUrls[carrierCode]) {
    links.unshift({
      label: airlineNames[carrierCode] || carrierCode,
      sublabel: "Book direct with airline",
      url: directUrls[carrierCode],
      icon: "airline",
    });
  }

  return links;
}
```

### Updated Flight Card UI

The card currently has:
```jsx
<button className="...">Select <ArrowRight /></button>
```

This becomes two elements:

**1. The Select button** — primary booking action:
```jsx
<a
  href={buildBookingLinks(..., carrierCode)[0].url}  // Skyscanner or direct airline
  target="_blank"
  rel="noopener noreferrer"
  onClick={() => setSelectedOfferId(prev => prev === offer.id ? null : offer.id)}
  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5"
>
  Select <ArrowRight className="w-3.5 h-3.5" />
</a>
```

**2. A "More options" chevron button** next to Select that toggles the expanded panel:
```jsx
<button
  onClick={() => setSelectedOfferId(prev => prev === offer.id ? null : offer.id)}
  className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
  aria-label="See all booking options"
>
  <ChevronDown className={`w-4 h-4 transition-transform ${selectedOfferId === offer.id ? "rotate-180" : ""}`} />
</button>
```

**3. Animated expanded "Where to book" panel** (below the card row, inside the same `motion.div`):
```jsx
<AnimatePresence>
  {selectedOfferId === offer.id && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-border mt-4 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {bookingLinks.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-secondary hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          {/* Icon / logo */}
          <BookingIcon type={link.icon} />
          <span className="text-xs font-semibold text-foreground group-hover:text-primary">{link.label}</span>
          <span className="text-[10px] text-muted-foreground text-center">{link.sublabel}</span>
        </a>
      ))}
    </motion.div>
  )}
</AnimatePresence>
```

**BookingIcon** — small inline component using SVG emoji or Lucide icons as branded stand-ins (since we can't import third-party brand SVGs):
- Skyscanner → `<Globe>` icon (teal)
- Kiwi.com → `<Sparkles>` icon (green)
- Google Flights → `<Search>` icon (blue)
- Airline → `<Plane>` icon (primary)

### "Only X seats left" behaviour

The existing low-seats warning is preserved. If `numberOfBookableSeats <= 5`, the warning stays above the button row — it becomes an extra incentive to click Select immediately.

### What Does NOT Change

- No new route, page, modal, or database change
- The existing sort/filter bar, loading, error, and empty states are unchanged
- The mock data fallback in `SearchResults.tsx` (hotels) is unchanged
- No new dependencies required — uses only existing `framer-motion`, `lucide-react`, and browser `window.open`

### Technical Notes

- The Select `<a>` tag opens the **top-ranked link** (direct airline if known, otherwise Skyscanner) in `_blank` immediately — no extra click needed
- `setSelectedOfferId` is called in `onClick` on the `<a>` so the panel expands simultaneously with the tab opening
- Clicking Select on a different card collapses the previous panel automatically (only one `selectedOfferId` at a time)
- All external links use `rel="noopener noreferrer"` for security
- The booking links are computed at render time via `useMemo` on the sorted list — no perf concern for 20–30 flights
- Skyscanner affiliate ID can be appended later by adding `&associateid=XXXXX` to the `ssUrl` string — zero code change needed
