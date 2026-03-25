

# Plan: Bold Hero Text + Floral Patterns + Correct Red Shade

## 1. Adjust Red Shade to Match Attachment
**File:** `src/index.css`

The attachment shows a **warm pink-red** (not pure red). The shade is approximately `hsl(348, 83%, 58%)` — a vibrant coral-pink matching the "Package Holiday" text and nav buttons in the screenshot. Update `--primary`, `--accent`, `--coral`, `--ring`, `--gold`, and gradient references from `0 84% 60%` to `348 83% 58%`.

## 2. Bold Hero Text + Floral/Pattern Slide Backgrounds
**Files:** `src/pages/Index.tsx`, `src/pages/Flights.tsx`, `src/pages/Hotels.tsx`

- Ensure every slide's `mainTextClass` uses at minimum `font-extrabold` or `font-black` — no `font-light` or `font-medium` on main headings
- Replace 4-5 destination photo slides per page with **floral/pattern/abstract Unsplash images** (e.g., tropical leaves, floral wallpaper, geometric patterns, watercolor textures) to add visual variety
- Keep text large and impactful — minimum `text-5xl md:text-7xl` on all main text
- Vary the text colors between white and accent (the pink-red) for contrast against patterns

### Example pattern image URLs (Unsplash):
- Tropical leaves: `https://images.unsplash.com/photo-1507525428034-b723cf961d3e`
- Floral: `https://images.unsplash.com/photo-1490750967868-88aa4f44baee`
- Abstract watercolor: `https://images.unsplash.com/photo-1557672172-298e090bd0f1`
- Geometric pattern: `https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d`
- Botanical: `https://images.unsplash.com/photo-1470756544705-1848092fbe5f`

## Files to Modify
1. `src/index.css` — red shade adjustment
2. `src/pages/Index.tsx` — bold text + pattern slides
3. `src/pages/Flights.tsx` — bold text + pattern slides
4. `src/pages/Hotels.tsx` — bold text + pattern slides

