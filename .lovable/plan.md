

# Plan: Revert Hero Size, Remove Text Shadows, Vary Fonts

## 1. Revert Hero Size to Full Height
**File:** `src/components/HeroBannerSlider.tsx`

- Change `min-h-[420px] md:min-h-[480px]` back to `min-h-[90vh]`
- Adjust padding from `pt-24 pb-40` back to `pt-32 pb-48` for proper vertical centering
- Move controls from `bottom-44` back to `bottom-32`
- Remove the `-mt-28` overlap on the children container, revert to `-mt-24` or similar full-height positioning

## 2. Remove Text Shadow from All Slide Text
**File:** `src/components/HeroBannerSlider.tsx`

- Remove the `heavyShadow` variable and all `style={{ textShadow: heavyShadow }}` from the three text elements (topLine, mainText, subText)
- Text legibility will rely on the overlay classes and text-stroke utilities already applied per-slide

## 3. Vary Font Families Across Slides
**Files:** `src/pages/Index.tsx`, `src/pages/Flights.tsx`, `src/pages/Hotels.tsx`

Import additional Google Fonts in `src/index.css` (e.g., Playfair Display, Bebas Neue, Outfit, Lora) and apply different `font-[family]` classes across slides so the majority of hero text uses distinct typefaces rather than one uniform font. Each slide's `mainTextClass` and `topLineClass` will reference varied fonts for creative diversity.

**File:** `src/index.css`
- Add Google Fonts import for: Playfair Display, Bebas Neue, Outfit, Lora
- Add Tailwind utility classes: `font-playfair`, `font-bebas`, `font-outfit`, `font-lora`

**File:** `tailwind.config.ts`
- Extend `fontFamily` with the new font names

## Files to Modify
1. `src/components/HeroBannerSlider.tsx` — revert height, remove text shadows
2. `src/index.css` — add Google Fonts import
3. `tailwind.config.ts` — extend font families
4. `src/pages/Index.tsx` — vary font classes on slides
5. `src/pages/Flights.tsx` — vary font classes on slides
6. `src/pages/Hotels.tsx` — vary font classes on slides

