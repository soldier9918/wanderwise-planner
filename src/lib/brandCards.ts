import { supabase } from "@/integrations/supabase/client";
/** Saved intro/outro cards that attach to every export. Saved on the user's account (local copy kept as a cache). */
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

const merge = (raw: any): BrandCards => ({ intro: { ...DEFAULT_CARDS.intro, ...(raw?.intro ?? {}) }, outro: { ...DEFAULT_CARDS.outro, ...(raw?.outro ?? {}) } });

/** Load from the user's account; migrates any old device-only settings up once. */
export async function fetchCards(userId: string | undefined): Promise<BrandCards> {
  if (!userId) return DEFAULT_CARDS;
  const { data, error } = await supabase.from("user_brand_cards").select("cards").eq("user_id", userId).maybeSingle();
  if (error) return loadCards(userId);
  if (data) { const c = merge(data.cards); saveCards(userId, c); return c; }
  const local = typeof localStorage !== "undefined" ? localStorage.getItem(key(userId)) : null;
  if (local) { const c = loadCards(userId); await storeCards(userId, c); return c; }
  return DEFAULT_CARDS;
}

export async function storeCards(userId: string, cards: BrandCards) {
  saveCards(userId, cards);
  const c = loadCards(userId);
  const { error } = await supabase.from("user_brand_cards").upsert({ user_id: userId, cards: c as any, updated_at: new Date().toISOString() });
  if (error) throw error;
}
