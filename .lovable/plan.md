

# Plan: Purple & Gold Theme + Bold Typography + New Logo

## 1. Update Color Theme to Purple & Gold
**File:** `src/index.css`

Replace all CSS variables with a Purple & Gold palette:
- **Primary:** `270 60% 50%` (rich purple #7c3aed)
- **Accent:** `45 93% 58%` (warm gold #eab308)
- **Background:** `270 20% 98%` (faint purple-white)
- **Foreground:** `270 30% 12%` (deep purple-black)
- **Navy (navbar/dark areas):** `270 35% 12%` (deep purple)
- **Navy-light/lighter:** purple-dark variants
- **Coral → purple, Gold → gold** custom tokens
- **Gradients:** hero → deep purple gradient, accent gradient → purple-to-gold
- **Secondary/muted:** soft lavender tones
- **Ring/sidebar:** match new purple primary

```
--primary: 270 60% 50%;           /* #7c3aed purple */
--accent: 45 93% 58%;             /* #eab308 gold */
--background: 270 20% 98%;
--foreground: 270 30% 12%;
--navy: 270 35% 12%;
--navy-light: 270 30% 16%;
--navy-lighter: 270 25% 22%;
--coral: 270 60% 50%;
--coral-light: 270 50% 62%;
--gold: 45 93% 58%;
--gradient-hero: linear-gradient(135deg, hsl(270 35% 8%), hsl(270 40% 14%), hsl(280 30% 10%));
--gradient-coral: linear-gradient(135deg, hsl(270 60% 50%), hsl(45 93% 58%));
```

## 2. Bold & Large Typography
**File:** `src/pages/Index.tsx`

Hero heading is already `text-6xl md:text-8xl lg:text-[7rem] font-extrabold` — keep this. Update the highlight block from `bg-primary/90` to use a gold accent instead for contrast:
```
<span className="inline-block bg-[hsl(45,93%,58%)] text-foreground px-4 py-1 rounded-lg mt-2">
```

**File:** `src/components/HowItWorks.tsx`
- Bump section heading to `text-4xl md:text-5xl font-extrabold`

## 3. New Logo Design
**File:** `src/components/TravelZentraLogo.tsx`

Replace with a new SVG — a stylized globe with a "Z" path, using purple fill and gold accent ring:
- Purple rounded-rect background
- White "Z" letterform
- Gold compass/clock accent circle

## Files to Modify
1. `src/index.css` — full color variable swap
2. `src/pages/Index.tsx` — gold highlight on hero text
3. `src/components/TravelZentraLogo.tsx` — new logo design
4. `src/components/HowItWorks.tsx` — bolder heading

