

# Plan: Update 5 Slides on Index Page

## Changes (all in `src/pages/Index.tsx`)

### Slide 1 (index 0) — Simplify to just "TRAVELZENTRA" + logo
- Remove `topLine`, `mainText` subtitle, and `subText` content
- Set `mainText` to "TRAVELZENTRA" with smaller sizing (`text-4xl md:text-6xl lg:text-7xl`) and elegant tracking
- Set `topLine` and `subText` to empty strings (or use topLine for a subtle tagline-free space)
- To render the logo below the text, add a new optional `showLogo` boolean field to the `HeroSlide` interface in `HeroBannerSlider.tsx`, and render `<TravelZentraLogo>` centered below the main text when true

**Files:** `src/components/HeroBannerSlider.tsx` (add `showLogo` support + import logo), `src/pages/Index.tsx` (update slide 0)

### Slide 3 (index 2) — Remove texture, make text white
- Change `mainTextClass` from `text-texture-tropical text-stroke-dark` to plain `text-white`
- Keep font, size, and weight as-is

### Slide 6 (index 5) — Remove texture from text
- Change `mainTextClass` from `text-texture-geometric` to plain `text-white`
- Keep font, size, weight, and italic

### Slide 10 (index 9) — Change pink to light textured text
- Change `mainTextClass` from `text-pink-300` to `text-texture-watercolor` for a light textured fill
- Add `text-stroke-dark` for legibility against the Paris background

### Slide 20 (index 19) — Remove texture, make plain white
- Change `mainTextClass` from `text-texture-roses` to `text-white`
- Keep font, size, and tracking

## Files to Modify
1. `src/components/HeroBannerSlider.tsx` — add optional `showLogo` to interface, render logo component when set
2. `src/pages/Index.tsx` — update slides at indices 0, 2, 5, 9, 19

