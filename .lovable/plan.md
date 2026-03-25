

# Plan: Consistent Hero Sizes, Varied Text Colors, Larger Text

## Problem Analysis
1. **Size inconsistency**: Main text sizes vary wildly across slides — some use `text-9xl`/`text-[9rem]`, others `text-8xl`/`text-[7rem]`. This causes layout jumps between slides.
2. **Too much red**: Many slides use `text-accent` (red) for main or top-line text. Need more color variety.
3. **Some text too small**: Top-line text varies from `text-sm` to `text-2xl`; sub-text inconsistent too.

## Changes

### 1. Standardize text sizes across all slides (all 3 pages)
Enforce consistent sizing so no slide causes a layout shift:
- **topLine**: always `text-lg md:text-xl` (never `text-sm` or `text-2xl`)
- **mainText**: always `text-6xl md:text-8xl lg:text-9xl` (remove all `text-[7rem]`, `text-[8rem]`, `text-[9rem]`, `text-5xl` variants)
- **subText**: always `text-lg md:text-2xl`

### 2. Diversify text colors beyond red
Replace many `text-accent` usages with a broader palette that stays legible:
- **White** (`text-white`) — on dark photo backgrounds
- **Gold gradient** (`text-gradient-gold`) — on dark overlays
- **Fire gradient** (`text-gradient-fire`) — on pattern slides
- **Cyan/Sky** (`text-sky-300`) — cool contrast on warm images
- **Amber/Yellow** (`text-amber-300`) — warm pop on dark scenes
- **Emerald** (`text-emerald-300`) — fresh accent on nature/tropical
- **Pink** (`text-pink-300`) — soft on dark backgrounds
- Keep `text-accent` (red) on only ~20% of slides for brand presence

### 3. Ensure all text is large and bold
- All `mainTextClass` entries will include `font-black` or `font-extrabold`
- All `topLineClass` entries will include `font-bold` or `font-black`
- All `subTextClass` entries will include `font-bold` or `font-semibold`

## Files to Modify
1. `src/pages/Index.tsx` — standardize sizes + diversify colors on all 20 slides
2. `src/pages/Flights.tsx` — same treatment on all 20 slides
3. `src/pages/Hotels.tsx` — same treatment on all 20 slides

