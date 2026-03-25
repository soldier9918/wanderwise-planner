

# Plan: Update Slide 1 and Slide 10 on Index Page

## Changes (in `src/pages/Index.tsx`)

### Slide 1 (index 0) — Match reference image style with red scheme
The reference image shows a bold, italic heading split across two lines: "Find Your Perfect" / "Package Holiday" with "Package Holiday" highlighted with a green background pill. Below is a subtitle in italic white.

Adapt this layout to TravelZentra's red brand:
- `topLine`: "Find Your Perfect" (bold, italic, white)
- `mainText`: "Package Holiday" (bold, italic, white with a red/accent background highlight — achieved via existing markup or a new `highlightMain` flag)
- `subText`: "Search hotels & flights across all your favourite brands — all in one place." (italic, white)
- Remove `showLogo: true`, remove `hidden` classes
- Use large consistent sizing (`text-6xl md:text-8xl lg:text-9xl` for main)

To achieve the highlight/pill effect on "Package Holiday", add an optional `highlightClass` property to `HeroSlide` interface. When set, wrap `mainText` in a `<span>` with that class (e.g. `bg-accent px-4 py-1 inline-block`).

**Files:** `src/components/HeroBannerSlider.tsx` (add `highlightClass` support), `src/pages/Index.tsx` (update slide 0)

### Slide 10 (index 9) — Bold white text for "From £249pp"
- Change `mainTextClass` from `text-texture-watercolor text-stroke-dark` to plain `text-white`
- Keep `font-black` and `font-playfair`, remove any italic

## Files to Modify
1. `src/components/HeroBannerSlider.tsx` — add optional `highlightClass` to interface, wrap mainText in highlighted span when set
2. `src/pages/Index.tsx` — update slides at indices 0 and 9

