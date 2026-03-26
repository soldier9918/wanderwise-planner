

# Remove text shadow from hero heading

**File:** `src/pages/Index.tsx` (line 67)

Remove the `style={{ textShadow: '...' }}` from the `<h1>` tag. The text is already `font-bold`, so no change needed for boldness.

**Before:**
```jsx
<h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)' }}>
```

**After:**
```jsx
<h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight">
```

One line change, one file.

