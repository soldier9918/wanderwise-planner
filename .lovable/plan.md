
# Flight Results Page — 7 Improvements

## Overview of Changes

All changes are confined to **`src/pages/FlightResults.tsx`** and **`src/components/Navbar.tsx`**. No new dependencies or database changes are needed.

---

## Fix 1 — SELECT button: show booking site logos + options count

**Current:** The SELECT button simply says "Select →".

**New (matching attachment image-56.png):**
- Show 3 small booking-site logo icons stacked horizontally (Kiwi, Google, and the direct airline if applicable). These use real-image logos: Kiwi from their CDN, Google from favicon, airline from gstatic.
- Show "+N options from" text above the price, where N = number of booking links available for that flight.
- The SELECT button remains full-width navy/dark below.

**Implementation:** In `FlightCard`, before the price, add a small row of circular favicon/icon images:
```tsx
// Booking partner logos (up to 3)
const optionCount = bookingLinks.length;
<div className="flex items-center gap-1 mb-1">
  {bookingLinks.slice(0,3).map(link => <PartnerLogo key={link.label} link={link} />)}
  <span className="text-xs text-primary font-semibold ml-1">+{optionCount} options from</span>
</div>
<p className="text-3xl font-black text-foreground">£{priceGBP.toFixed(0)}</p>
```

Partner logos will be small 20x20 rounded images:
- Kiwi.com: `https://www.kiwi.com/favicon.ico`
- Google Flights: `https://www.google.com/favicon.ico`
- Airline: use existing `airlineLogoUrl(code)` at 20px

---

## Fix 2 — Sunset Maldives beach background on results page

**Current:** `bg-background` (light blue-grey).

**New:** Use the existing `src/assets/hero-dest-maldives.jpg` as a fixed full-page background behind the results. A semi-transparent white overlay (~90% opacity) over the content areas keeps all white cards/boxes fully readable.

**Implementation:**
- Change the root `<div>` from `bg-background` to `relative`.
- Add a fixed `<div>` behind everything with `bg-[url(...)] bg-cover bg-center bg-fixed` using the imported Maldives image.
- Wrap the sticky bar, body, and footer in an `relative z-10` wrapper so cards remain white (`bg-card` = white by CSS var).
- The date price strip and filter sidebar are already `bg-card` (white), so they stay white automatically.
- The main content area gets a very light `bg-white/80 backdrop-blur-[1px]` panel behind the results for readability.

---

## Fix 3 — Filter sidebar scrolls fully to the bottom

**Current:** The sidebar uses `max-h-[calc(100vh-8.5rem)] overflow-y-auto`. The `FilterSidebar` inner div has `rounded-2xl overflow-hidden` which clips the scroll. When filter sections expand (using `AnimatePresence`/`motion.div`), the animated height expansion works but may not trigger re-scroll.

**Root cause:** The `overflow-hidden` on the outer `bg-card rounded-2xl` wrapper clips overflow. The `overflow-y-auto` is on the `<aside>` but the inner card clips content.

**Fix:**
- Remove `overflow-hidden` from the `FilterSidebar`'s outer `<div className="bg-card border ... rounded-2xl overflow-hidden">` — change to just `rounded-2xl`.
- Add `pb-4` to ensure the last filter section has padding at the bottom.
- The `<aside>` already has `overflow-y-auto` so scrolling to the bottom will work.

---

## Fix 4 — Date price strip: nicely boxed with white card background

**Current:** The strip uses `border-b border-border bg-background` — it blends into the page background.

**New:** Wrap the `DatePriceStrip` in a proper white card container:
- Outer wrapper: `bg-card border border-border rounded-xl shadow-sm mx-2 my-2`
- Remove the full-width `border-b` styling; the strip now sits as a standalone boxed element inside the sticky bar area.
- The individual date buttons inside the strip retain their `border-b-2` bottom accent.

---

## Fix 5 — Navbar text: ensure full white (not white/70)

**Current:** Nav items use `text-white/70 hover:text-white`. The active link uses `text-primary`.

**New:** Change all nav item text from `text-white/70` to `text-white` so they are fully bright white at all times. The hover state becomes `hover:text-white/80` to give subtle feedback. The active link retains `text-primary`.

**File:** `src/components/Navbar.tsx` — update the `className` on nav `<Link>` elements.

---

## Fix 6 — "See Whole Month" button with calendar + price chart dropdown

**New feature:** Add a "See Whole Month" button to the sticky bar, right of the date pills.

**When clicked:** Opens a dropdown panel (attached below the button) showing:
1. A **monthly calendar grid** (31 cells) where each day shows the date number + a price (cheapest from `flights` for that date if it matches, `—` otherwise). The selected date is highlighted in primary colour.
2. A **bar chart** below it (using `recharts` already installed) showing the 7 days in the `DatePriceStrip` range as bars, with price on the Y-axis and dates on the X-axis, allowing visual comparison of cheapest fares across dates.

**Implementation:**
- Add `showMonthView` boolean state.
- Add a `SeeWholeMonthPanel` sub-component rendered as a `motion.div` dropdown below the button.
- The calendar grid uses CSS Grid `grid-cols-7` with day-of-week headers.
- The `BarChart` from `recharts` uses the 7 `DatePriceStrip` dates as data (price from `flights` if depart matches, null otherwise).
- Clicking a date in the calendar calls `shiftDates()` to jump to that date.

---

## Fix 7 — Edit search modal: properly centred, not offset

**Current problem (image-57.png):** The modal appears shifted (not centred) — it's `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` but may be constrained by the parent container width.

**Fix:**
- Ensure the modal wrapper is `fixed inset-0 flex items-center justify-center z-[60]` (a flex centering container) rather than relying on translate hacks.
- The inner card becomes `w-full max-w-2xl mx-4 rounded-2xl bg-card shadow-2xl`.
- This guarantees true viewport-centred rendering regardless of scroll position or container widths.
- The calendar portal keeps its `position: fixed` with coordinates relative to the viewport, so it remains unaffected.

---

## Technical Summary

```text
src/pages/FlightResults.tsx:
├── Fix 1: FlightCard — add PartnerLogos row + "+N options from" above price
├── Fix 2: Root div — Maldives bg-fixed image + white content overlays
├── Fix 3: FilterSidebar — remove overflow-hidden from card wrapper
├── Fix 4: DatePriceStrip container — white card box with border/shadow
├── Fix 6: New SeeWholeMonthPanel — calendar grid + recharts BarChart
└── Fix 7: editSearchOpen modal — use flex centering container

src/components/Navbar.tsx:
└── Fix 5: nav link text-white/70 → text-white
```

No new packages needed (recharts already installed).
No database or edge function changes.
No new files needed.
