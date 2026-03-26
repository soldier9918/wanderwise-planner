

# Add Light Text Shadow to Hero Heading

**File:** `src/pages/Index.tsx` (line 67)

Add a subtle `textShadow` style to the `<h1>` tag for a light shadow behind each letter.

**Change:**
```jsx
// Before
<h1 className="font-display text-6xl md:text-8xl font-extrabold text-white mb-4 leading-none tracking-tight lg:text-9xl">

// After
<h1 className="font-display text-6xl md:text-8xl font-extrabold text-white mb-4 leading-none tracking-tight lg:text-9xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
```

This applies a soft, light shadow (30% opacity black, 8px blur, 2px vertical offset) behind every letter including the "Package Holiday" span, since text-shadow is inherited.

