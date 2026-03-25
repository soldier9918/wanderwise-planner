

# Plan: Rotating Hero Banners with Embedded Text (lastminute.com style)

## Concept
Replace the current static-text-over-rotating-images hero with a **lastminute.com-style banner carousel** where each slide has its own unique text, offer, and styling embedded directly onto the image. The search form remains static and overlays the bottom of the hero. Slides rotate every 10 seconds with crossfade. Navigation dots and pause/play controls included.

## Architecture

Create a shared `HeroBannerSlider` component used by all 3 pages. Each page passes its own array of slide data.

```text
┌─────────────────────────────────────┐
│  Navbar (static)                    │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │  Hero Image (crossfades)      │  │
│  │                               │  │
│  │  "SUMMER SALE"  (italic)      │  │
│  │  "£200 OFF"     (huge bold)   │  │
│  │  "Book now!"    (underline)   │  │
│  │                               │  │
│  │  ⏸  ‹ ●━━●●● ›               │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Search Form (static)         │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  Rest of page...                    │
└─────────────────────────────────────┘
```

## New Component
**File:** `src/components/HeroBannerSlider.tsx`

- Accepts `slides[]` prop — each slide has: `image`, `topLine`, `mainText`, `subText`, `textColor`, `textPosition`, `fontStyle` (italic/bold/etc), `overlayColor`
- 10-second auto-rotation with crossfade
- Pause/play button + dot navigation (like lastminute.com)
- Left/right arrow navigation
- Text animates in (fade + slide) on each slide change

## Slide Data (~20 slides per page)

**Index page (Flight+Hotel packages):** 20 slides with varied offers
- "SUMMER SALE / Save up to £300 / on package holidays"
- "EASTER GETAWAY / From £199pp / Flights + Hotel included"
- "LAST MINUTE DEALS / Up to 40% OFF / Book by midnight"
- "TROPICAL ESCAPES / Bali from £499 / All-inclusive packages"
- etc. — each with different font styling (italic headers, huge price text, underlined CTAs)

**Flights page:** 20 flight-specific slides
- "FLASH SALE / £50 OFF / all European flights"
- "FLY FOR LESS / Compare 500+ airlines / Best price guaranteed"
- etc.

**Hotels page:** 20 hotel-specific slides
- "HOTEL DEALS / Save 30% / on luxury stays"
- "CITY BREAKS / From £79/night / Top-rated hotels"
- etc.

Each slide uses a different combination of:
- Font weight (bold, extrabold, black)
- Font style (italic vs normal for taglines)
- Text size variations (huge prices, smaller subtitles)
- Text colors (white, gold accent, pink highlight)
- Text alignment (center, left-aligned)

## Page Updates

**Files:** `src/pages/Index.tsx`, `src/pages/Flights.tsx`, `src/pages/Hotels.tsx`

Replace the current hero section with `<HeroBannerSlider slides={packageSlides} />` followed by the static search form. The search form overlaps the bottom of the hero (positioned with negative margin or absolute positioning).

## Images

Reuse the existing ~11 hero images per page (already imported). For the 20 slides, images will be cycled/reused with different text overlays — each slide still feels unique because the text, styling, and overlay color differ.

## Technical Details

- Slide interface: `{ image: string; topLine: string; mainText: string; subText: string; topLineClass: string; mainTextClass: string; subTextClass: string; overlayClass: string }`
- Crossfade via framer-motion `AnimatePresence` with opacity transition (2s)
- Text entrance: fade-in + translateY with staggered delay
- Dot indicators: active = elongated bar (like lastminute.com), inactive = circle
- Pause/play toggle stops/resumes the interval
- Arrow buttons for manual navigation

**Files to create:** 1 (`HeroBannerSlider.tsx`)
**Files to modify:** 3 (`Index.tsx`, `Flights.tsx`, `Hotels.tsx`)

