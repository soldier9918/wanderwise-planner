

# Plan: Fresh Lime & White Theme — Bold & Modern Design

## Overview
Transform the entire color scheme from Rose + Slate to **Fresh Lime (#84cc16) + White** with a bold, modern design direction — larger typography, stronger color blocks, and more dramatic visual hierarchy.

## 1. Update CSS Theme Variables
**File:** `src/index.css`

Replace all color tokens:
- **Primary:** `347 87% 60%` (rose) → `84 81% 44%` (lime-600 #84cc16)
- **Primary-foreground:** keep white
- **Accent:** `262 60% 68%` (purple) → `85 78% 55%` (lime-500 #a3e635)
- **Background:** `240 20% 97%` → `80 60% 98%` (very faint lime-white)
- **Foreground/navy:** `226 30% 14%` → `120 25% 12%` (deep forest green)
- **Muted/secondary:** shift from slate to soft sage tones
- **Ring:** match new primary
- **Custom tokens:** rename `--coral` → lime values, `--navy` → deep green, `--teal/gold` → complementary greens
- **Gradients:** hero gradient → deep forest green, coral gradient → lime gradient

## 2. Update Tailwind Config Custom Colors
**File:** `tailwind.config.ts`

Rename `coral` color group to `lime` (or keep semantic names pointing to new values). Update `navy` to deep green equivalents. All references remain via CSS variables so this is mostly automatic.

## 3. Update Navbar & Footer
**Files:** `src/components/Navbar.tsx`, `src/components/Footer.tsx`

- Navbar background: `bg-navy` → deep forest green (via updated CSS var)
- Logo accent: `text-primary` already uses the variable, will auto-update
- Border colors: `border-navy-lighter` → updated var

## 4. Bold & Modern Typography Enhancements
**File:** `src/pages/Index.tsx`

- Hero heading: increase to `text-6xl md:text-8xl lg:text-[7rem]` with bolder weight
- Subtitle: bump to `text-xl md:text-2xl`
- Add a lime-colored highlight block behind "Package Holiday" text

**File:** `src/index.css`
- Update `.text-gradient-coral` to `.text-gradient-lime` using lime gradient
- Add stronger heading letter-spacing for bold feel

## 5. Update Logo Colors
**File:** `src/components/TravelZentraLogo.tsx`

The logo uses `fill-primary` / `fill-primary-foreground` classes which auto-update with the new theme. No changes needed unless we want a different shape.

## 6. Component-Level Color References
Several components hardcode `text-coral`, `bg-coral`, `bg-navy` etc. These all reference CSS variables, so they auto-update. Any literal hex values or HSL strings in JSX will be searched and replaced:

**Files to check/update (inline color strings):**
- `src/pages/FlightResults.tsx` — background overlay opacity references
- `src/pages/Index.tsx` — hero overlay colors
- `src/components/FeaturedDestinations.tsx`, `src/components/FlightDeals.tsx` — card accents
- Any file with hardcoded `hsl(347...` or `hsl(226...` strings

## 7. Memory Update
Update the style/theme memory to reflect "Fresh Lime + White (Bold & Modern)" instead of "Rose + Slate".

---

## Technical Details

New CSS variable values (key changes):
```
--primary: 84 81% 44%;          /* #84cc16 lime-600 */
--accent: 85 78% 55%;           /* #a3e635 lime-500 */
--background: 80 40% 98%;       /* near-white with lime tint */
--foreground: 140 25% 12%;      /* deep forest green */
--coral: 84 81% 44%;            /* reuse as lime */
--navy: 140 25% 12%;            /* deep green */
--navy-light: 140 22% 16%;
--navy-lighter: 140 18% 22%;
--gradient-hero: linear-gradient(135deg, hsl(140 25% 8%), hsl(140 30% 14%), hsl(150 22% 10%));
--gradient-coral: linear-gradient(135deg, hsl(84 81% 44%), hsl(100 70% 40%));
```

**Files to modify:** ~5-6 files (index.css, tailwind.config.ts, Index.tsx, plus search for any hardcoded color strings)

