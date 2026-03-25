

# Plan: Rebrand to TravelZentra + Logo + Fix Ad Sizing

## 1. Rename FareFinder → TravelZentra everywhere

Replace all instances of "FareFinder" and "Fare<span>Finder</span>" across **13 files**:

| File | Changes |
|------|---------|
| `index.html` | Title, og:title, meta description |
| `src/components/Navbar.tsx` | Logo text: `Travel<span>Zentra</span>` |
| `src/components/Footer.tsx` | Logo text + copyright |
| `src/components/FAQ.tsx` | All question/answer text |
| `src/components/HowItWorks.tsx` | Section heading |
| `src/pages/Help.tsx` | All references |
| `src/pages/WhoWeAre.tsx` | All references |
| `src/pages/TermsOfService.tsx` | All references |
| `src/pages/PrivacyPolicy.tsx` | All references |
| `src/pages/PrivacySettings.tsx` | All references |
| `src/pages/CookiePolicy.tsx` | All references |
| `src/pages/ContactUs.tsx` | Any references |
| `src/pages/FlightResults.tsx` | "Best fare finder" sublabel |

## 2. Design a logo

Generate an SVG logo for TravelZentra using the existing coral/primary color scheme. The logo will feature a stylized compass or globe mark integrated with a "Z" letterform, rendered as an inline SVG component replacing the current `<Plane>` icon in both Navbar and Footer. The logo will be clean, modern, and work at small sizes (32-40px).

**Approach:** Create a `src/components/TravelZentraLogo.tsx` component with an SVG mark, then import it in Navbar and Footer to replace the plane icon.

## 3. Fix inline advertisement size

The user's screenshot shows flight result cards are roughly 120-140px tall (two itinerary rows). The current inline ad placeholder is only `h-20` (80px). Change it to match the flight card height so it sits flush in the list.

**Change in `FlightResults.tsx`:** Update the inline ad div from `h-20` to approximately `h-[140px]` to match the flight card dimensions, and style it to feel more integrated.

## Technical Details

- Logo SVG: Simple geometric mark (compass rose / abstract Z) using `hsl(347 87% 60%)` (the primary coral color)
- All text replacements are straightforward find-and-replace of "FareFinder" → "TravelZentra" and "Fare<span...>Finder</span>" → "Travel<span...>Zentra</span>"
- Ad slot: remove fixed `h-20`, use padding-based height (~140px) to match card rhythm

