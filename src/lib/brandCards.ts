/** Saved intro/outro cards that attach to every export. Stored per user on this device. */
export type BrandCard = { enabled: boolean; mode: "card" | "clip"; title: string; subtitle: string; clipPath: string | null; seconds: number };
export type BrandCards = { intro: BrandCard; outro: BrandCard };

export const CARD_MIN_SECS = 2;
export const CARD_MAX_SECS = 8;
export const clampCardSeconds = (s: number) => Math.min(CARD_MAX_SECS, Math.max(CARD_MIN_SECS, Math.round(Number(s) || 3)));

export const DEFAULT_CARDS: BrandCards = {
  intro: { enabled: false, mode: "card", title: "Welcome back", subtitle: "Let's get into it", clipPath: null, seconds: 3 },
  outro: { enabled: false, mode: "card", title: "Like & Subscribe", subtitle: "New videos every week", clipPath: null, seconds: 4 },
};

const key = (userId: string) => `vydora:brand-cards:${userId}`;

export function loadCards(userId: string | undefined): BrandCards {
  if (!userId || typeof localStorage === "undefined") return DEFAULT_CARDS;
  try {
    const raw = JSON.parse(localStorage.getItem(key(userId)) ?? "null");
    if (!raw) return DEFAULT_CARDS;
    return { intro: { ...DEFAULT_CARDS.intro, ...raw.intro }, outro: { ...DEFAULT_CARDS.outro, ...raw.outro } };
  } catch { return DEFAULT_CARDS; }
}

export function saveCards(userId: string, cards: BrandCards) {
  const fix = (c: BrandCard): BrandCard => ({ ...c, seconds: clampCardSeconds(c.seconds), title: c.title.slice(0, 60), subtitle: c.subtitle.slice(0, 80) });
  localStorage.setItem(key(userId), JSON.stringify({ intro: fix(cards.intro), outro: fix(cards.outro) }));
}

/** A card is only attached when switched on and it has something to show. */
export function isActive(c: BrandCard) {
  if (!c.enabled) return false;
  return c.mode === "clip" ? !!c.clipPath : !!(c.title.trim() || c.subtitle.trim());
}
