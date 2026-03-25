

# Plan: Legible Hero Text + Animated Backgrounds + Compact Hero Size

## 1. Compact Hero Height + Search Form Overlap
**File:** `src/components/HeroBannerSlider.tsx`

Reduce hero from `min-h-[90vh]` to `min-h-[520px] md:min-h-[560px]` so the search form sits at the midpoint (like the lastminute.com attachment). Adjust bottom padding and controls positioning. The search form overlaps the bottom ~50% of the hero.

## 2. Animated Ken Burns Effect on Background Images
**File:** `src/components/HeroBannerSlider.tsx`

Add a slow zoom + pan animation to each slide's background image using framer-motion. Each slide slowly scales from 1.0 to 1.15 and slightly translates over 10 seconds, creating a cinematic "Ken Burns" effect.

## 3. Stronger Text Legibility
**File:** `src/components/HeroBannerSlider.tsx`

- Apply heavier `textShadow` on all text elements: `0 4px 30px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)`
- Add a subtle dark gradient backdrop behind text area for guaranteed contrast
- Support an optional `style` prop on slides for inline styles (gradients on text, etc.)

## 4. Text Texture/Gradient Styles via CSS
**File:** `src/index.css`

Add utility classes for textured/gradient text effects:
- `.text-gradient-gold` — gold shimmer gradient on text via `background-clip: text`
- `.text-gradient-fire` — red-to-orange gradient
- `.text-stroke-white` — white text stroke/outline for dark backgrounds
- `.text-stroke-dark` — dark outline for light pattern backgrounds

## 5. Update Slide Data with Enhanced Legibility
**Files:** `src/pages/Index.tsx`, `src/pages/Flights.tsx`, `src/pages/Hotels.tsx`

- Add stronger `textShadow` inline styles or use new CSS utility classes on slides where text was hard to read (especially pattern backgrounds)
- Use `.text-stroke-white` on pattern slides for guaranteed readability
- Apply gradient text effects on select slides for creative variety
- Ensure overlay classes on pattern slides use darker overlays (`bg-black/50` or `bg-navy/60`)

## Files to Modify
1. `src/components/HeroBannerSlider.tsx` — compact height, Ken Burns animation, stronger shadows
2. `src/index.css` — text texture/gradient utility classes
3. `src/pages/Index.tsx` — enhanced overlay/text classes
4. `src/pages/Flights.tsx` — enhanced overlay/text classes
5. `src/pages/Hotels.tsx` — enhanced overlay/text classes

