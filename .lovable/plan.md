

# Plan: Revert to Coral-Red Theme

Restore the previous coral-red + navy color scheme by updating CSS variables in `src/index.css` and the hero section in `src/pages/Index.tsx`.

## Changes

### 1. `src/index.css` — Revert all color variables

Replace current lime/green values with the original coral-red + navy palette:

| Variable | Current (Lime) | Restored (Coral-Red) |
|----------|---------------|---------------------|
| `--primary` | `84 81% 44%` | `348 83% 58%` |
| `--accent` | `85 78% 55%` | `262 60% 68%` |
| `--background` | `80 40% 98%` | `0 0% 98%` |
| `--foreground` | `140 25% 12%` | `215 30% 14%` |
| `--secondary` | `80 30% 92%` | `220 15% 92%` |
| `--muted` | `80 20% 90%` | `220 10% 90%` |
| `--border/input` | `80 18% 86%` | `220 13% 86%` |
| `--ring` | `84 81% 44%` | `348 83% 58%` |
| `--coral` | `84 81% 44%` | `348 83% 58%` |
| `--navy` | `140 25% 12%` | `215 30% 14%` |
| Gradients | Green-based | Coral/navy-based |

All sidebar, card-foreground, popover-foreground, muted-foreground, and custom tokens will be reverted accordingly.

### 2. `src/pages/Index.tsx` — Revert hero overlay colors

Change `bg-navy/35` back to the navy-based overlay and restore original hero text sizing if it was changed (keep bold styling).

### 3. No other files need changes

Since components reference CSS variables (`bg-navy`, `text-primary`, `bg-coral`, etc.), the Navbar, Footer, and all other components will automatically reflect the restored colors.

## Technical Details

Key restored values:
```css
--primary: 348 83% 58%;
--navy: 215 30% 14%;
--coral: 348 83% 58%;
--gradient-hero: linear-gradient(135deg, hsl(215 30% 8%), hsl(220 35% 14%), hsl(215 25% 10%));
--gradient-coral: linear-gradient(135deg, hsl(348 83% 58%), hsl(348 75% 48%));
```

