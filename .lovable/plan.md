
## Plan: POI Display Logic Improvements in NearbyPOIs

### What's changing and why

The current component has several issues:
- **Airports:** All 17 airports are shown in the dropdown — needs to be capped at the 5 nearest.
- **Public Transports:** All 3 options always shown regardless of distance — needs an 8km (5 mile) radius filter, and if none qualify the tile should be greyed out and non-interactive.
- **Restaurants:** Same 5 hardcoded entries always shown — needs an 8km (5 mile) radius filter, greyed out if none.
- **Nearest Beach:** Single hardcoded `Playa de la Garita` regardless of hotel location — needs to be replaced with a list of real Lanzarote coastal beaches sorted by proximity to the hotel, showing the nearest one.
- **Hospital:** Single fixed hospital — this is fine, just ensure it computes distance dynamically (already done).
- **SPA / Fitness:** Single hardcoded entry — needs an 8km (5 mile) radius filter showing the nearest within range, otherwise the nearest regardless; greyed out if the data set has no entries at all.

---

### Technical approach

**1. Airport dropdown — cap at 5 nearest**

In the `useMemo` that builds `airports`, slice to the first 5 after sorting:
```
.sort((a, b) => a.distance - b.distance).slice(0, 5)
```

**2. Public Transports — 5-mile (8.047 km) radius filter**

After computing distances and sorting, filter to items where `distance <= 8.047`. If the filtered list is empty, mark the tile as disabled/greyed out.

**3. Restaurants — 5-mile radius filter**

Same logic. Filter to `distance <= 8.047`. If empty, grey out.

**4. Nearest Beach — accurate data**

Replace the single `rawBeach` constant with an array `rawBeaches` containing real Lanzarote coastal beaches with accurate GPS coordinates:

| Beach | Lat | Lng |
|---|---|---|
| Playa de los Pocillos | 28.9225 | −13.6535 |
| Playa Grande (Puerto del Carmen) | 28.9183 | −13.6622 |
| Playa de Matagorda | 28.9345 | −13.6327 |
| Playa de Famara | 29.1115 | −13.5636 |
| Playa Blanca | 28.8628 | −13.8284 |
| Playa de la Garita | 28.9640 | −13.4980 |
| Playa del Reducto (Arrecife) | 28.9564 | −13.5581 |
| Playa de Papagayo | 28.8436 | −13.7806 |
| Playa de Caletón Blanco | 29.1858 | −13.4375 |

The component picks the nearest one dynamically using `singleWithDistance` applied to the sorted-and-first result.

**5. SPA / Fitness — 5-mile radius, fallback to nearest, grey if empty**

Expand `rawSpaFitness` into a small `rawSpaFitnessList` array with a few spa/gym POIs across Lanzarote. Filter within 8km; if any exist, show the nearest. If none within radius, show the nearest from the full list (as a fallback). The current single-entry data set means it could never be greyed out — since there's always at least one entry in the list, greying out is not applicable but the logic is in place.

**6. Greyed-out tile rendering**

Add a `renderFixedDisabled` (or extend `renderFixed`) helper that, when `disabled={true}` is passed, renders the tile with:
- `opacity-50 cursor-not-allowed` classes
- No `onClick` handler
- A small "None nearby" sub-label

---

### Files to edit

**`src/components/NearbyPOIs.tsx`** — the only file that needs changing:

1. Slice `airports` to `.slice(0, 5)` in the `useMemo`.
2. Add `rawBeaches` array (9 real Lanzarote beach coordinates), replace `rawBeach` single constant.
3. Compute `beach` as the nearest from the new array using `withDistance(...)[0]`.
4. Add `rawSpaFitnessList` array (2–3 spas/gyms), compute nearest within 8km or fallback to nearest.
5. Apply 8km filter to `transport` and `restaurantList`.
6. Pass a `disabled` boolean to `renderFixed` for transport and restaurants, render greyed-out tile when list is empty.
7. Keep `renderDropdown` unchanged except transport/restaurant now conditionally renders greyed tile instead of dropdown when filtered list is empty.
