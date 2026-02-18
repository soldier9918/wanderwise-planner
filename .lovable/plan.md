
## Fix: SPA / Fitness — Grey Out When Nothing Within 5 Miles

### The Problem

The current `spa` `useMemo` always returns a value: it falls back to the nearest overall entry (`all[0]`) even when nothing is within the 5-mile radius. This means the greyed-out tile never appears.

The requirement is: **if no spa/gym exists within 5 miles, grey the tile out entirely** (no fallback to a distant entry).

---

### What Changes

**`src/components/NearbyPOIs.tsx`** — two small edits:

**1. Change the `spa` useMemo to return `null` when nothing is within radius**

Current logic:
```
const nearby = all.filter((p) => p.distance <= RADIUS_KM);
return nearby.length > 0 ? nearby[0] : all[0]; // ← always returns something
```

New logic:
```
const nearby = all.filter((p) => p.distance <= RADIUS_KM);
return nearby.length > 0 ? nearby[0] : null; // ← returns null if none nearby
```

**2. Change the render call to use `renderFixedOrDisabled` instead of `renderFixed`**

Current render (line ~338):
```tsx
{renderFixed(spa, "SPA / Fitness", <Dumbbell ... />)}
```

New render — conditionally greyed out when `spa` is `null`:
```tsx
{spa
  ? renderFixed(spa, "SPA / Fitness", <Dumbbell className="w-4 h-4 text-primary" />)
  : renderDisabled("SPA / Fitness", <Dumbbell className="w-4 h-4 text-primary" />)}
```

The `renderDisabled` helper already exists in the component (used for transport/restaurants), so no new code is needed beyond these two targeted changes.

---

### Files to Edit

| File | Change |
|---|---|
| `src/components/NearbyPOIs.tsx` | 1. `spa` useMemo returns `null` instead of `all[0]` as fallback; 2. Render uses conditional greyed-out tile |

---

### Technical Notes

- `renderDisabled` already renders `opacity-50 cursor-not-allowed` with "No results within 5 miles" — no new helper needed.
- The `spa` state type will change from `POILocation` to `POILocation | null`, which TypeScript already supports since `renderFixed` accepts `POILocation`.
- This is a two-line change — no risk of side effects on other POI categories.
