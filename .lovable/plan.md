

# Plan: Border-only text for "Package Holiday"

## Change

**File:** `src/pages/Index.tsx` (line 70)

Replace the solid coral background span with a border-only style:

```jsx
// Before
<span className="inline-block bg-primary/90 text-primary-foreground px-4 py-1 rounded-lg mt-2">Package Holiday</span>

// After
<span className="inline-block border-4 border-white text-white px-4 py-1 rounded-lg mt-2">Package Holiday</span>
```

This removes the filled coral background and adds a white border outline around the text instead.

