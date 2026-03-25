

# Plan: Fix Hero Slide Issues (Index Page)

## Issues & Solutions

### 1. Consistent image sizing
The Ken Burns animation starts different slides at different scales (e.g. `scale: [1, 1.15]` vs `scale: [1.05, 1.18]`). This causes visible size differences between slides. Fix: normalize all Ken Burns starting scales to `1` so every slide begins at the same visual size.

**File:** `src/components/HeroBannerSlider.tsx`
- Update all `kenBurnsVariants` to start at `scale: 1` (keep varied end scales and x/y movements for visual interest)

### 2. Slide 1 — TravelZentra branding
Change slide 1 (index 0) text to show the brand name and slogan:
- `topLine`: "TRAVELZENTRA"
- `mainText`: "Your Journey, Our Passion"
- `subText`: "Compare flights, hotels & packages — save up to 40%"

**File:** `src/pages/Index.tsx` — update slide at index 0

### 3. Slide 7 — "Maldives Dream" text to green
Change `topLineClass` on slide index 6 from `text-pink-300` to `text-emerald-300`.

**File:** `src/pages/Index.tsx` — update slide at index 6

### 4. Slides 3 & 9 — ensure different backgrounds
Currently slide 3 uses `patternFloral` and slide 9 uses `patternRoses` — these are different files but may look similar. Swap slide 9's background to `patternBotanical` (currently used on slide 12). Then give slide 12 `patternRoses` instead, so no adjacent pattern slides share an image.

**File:** `src/pages/Index.tsx` — swap backgrounds on indices 8 and 11

### 5. Slide 10 — "From £249pp" in pink, non-italic, bold
Change the `mainTextClass` on slide index 9 from `text-accent italic` to `text-pink-300` with no italic, keeping `font-black`.

**File:** `src/pages/Index.tsx` — update slide at index 9

### 6. Textured/flag-fill text effects on select slides
Add new CSS utility classes for texture-filled text using `background-clip: text`:
- `.text-texture-tropical` — uses the tropical floral pattern as fill
- `.text-texture-geometric` — uses the geometric pattern as fill
- `.text-texture-watercolor` — uses the watercolor pattern as fill
- `.text-texture-roses` — uses the roses pattern as fill

Apply these to 3-4 slides where it makes creative sense (e.g. "Bali from £499" with tropical texture, "Once in a Lifetime" with watercolor texture).

**File:** `src/index.css` — add texture text utilities
**File:** `src/pages/Index.tsx` — apply texture classes to select slides

### 7. Slide 20 — change pink to textured font
Change slide index 19 ("Book Now, Save Big") from `text-pink-300` to use `.text-texture-roses` for a textured fill effect.

**File:** `src/pages/Index.tsx` — update slide at index 19

## Files to Modify
1. `src/components/HeroBannerSlider.tsx` — normalize Ken Burns start scales
2. `src/index.css` — add texture-fill text utilities
3. `src/pages/Index.tsx` — all slide content changes (items 2-7)

