import { FEATURE_PAGES } from "./featurePages";
import { GUIDES } from "./guides";

export const SITE = "https://vydora.ai";

export const PUBLIC_PAGES: Record<string, { title: string; description: string }> = {
  "/": { title: "Vydora – AI YouTube Video Maker", description: "Type an idea and Vydora writes the script, creates the scenes and records the voiceover for your next YouTube video." },
  "/pricing": { title: "Pricing – Vydora AI Video Maker", description: "Free plan with 30 credits a month, Creator at £19/month and Pro at £49/month. Top up from £5." },
  "/privacy": { title: "Privacy Policy – Vydora", description: "What Vydora collects, how it is used and how your private video files are kept safe." },
  "/terms": { title: "Terms of Service – Vydora", description: "The agreement for using Vydora, the AI YouTube video maker." },
  "/cookies": { title: "Cookie Policy – Vydora", description: "The essential sign-in and preference storage Vydora uses. No advertising cookies." },
  "/refund": { title: "Refund Policy – Vydora", description: "When you can get a refund for Vydora subscriptions and credits." },
  "/disclaimer": { title: "Disclaimer – Vydora", description: "What Vydora's AI-generated videos do and do not promise." },
  "/acceptable-use": { title: "Acceptable Use Policy – Vydora", description: "What you must not create with Vydora." },
  "/guides": { title: "YouTube Creator Guides – Vydora", description: "Free guides on faceless niches, YouTube monetisation, Shorts hooks, repurposing blog posts and planning a series." },
  ...Object.fromEntries(GUIDES.map((g) => [`/guides/${g.slug}`, { title: g.title, description: g.description }])),
  ...Object.fromEntries(FEATURE_PAGES.map((p) => [`/${p.slug}`, { title: p.title, description: p.description }])),
};

export function seoFor(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const page = PUBLIC_PAGES[path];
  if (page) return { ...page, canonical: SITE + (path === "/" ? "/" : path), index: true };
  return { title: "Vydora", description: PUBLIC_PAGES["/"].description, canonical: null, index: false };
}
