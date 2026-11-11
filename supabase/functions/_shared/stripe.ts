import Stripe from "npm:stripe@17.7.0";

// Live mode turns on only once STRIPE_LIVE_SECRET_KEY is saved; until then everything stays in TEST mode.
const LIVE_KEY = Deno.env.get("STRIPE_LIVE_SECRET_KEY");
export const LIVE = !!LIVE_KEY;
export const stripe = new Stripe((LIVE_KEY ?? Deno.env.get("STRIPE_TEST_SECRET_KEY"))!, { apiVersion: "2024-11-20.acacia" });
export const WEBHOOK_SECRET = LIVE ? Deno.env.get("STRIPE_LIVE_WEBHOOK_SECRET") : Deno.env.get("STRIPE_WEBHOOK_SECRET");

const TEST_CREATOR = "price_1UaDVw9wksHmZlqMObItDTFY";
const TEST_PRO = "price_1UaDWp9wksHmZlqMSo0QbIH6";
const LIVE_CREATOR = Deno.env.get("STRIPE_LIVE_PRICE_CREATOR");
const LIVE_PRO = Deno.env.get("STRIPE_LIVE_PRICE_PRO");

/** Vydora's own Stripe prices -> plan tier and monthly credits. Anything else is ignored. */
export const PLANS: Record<string, { tier: "creator" | "pro"; credits: number }> = {
  [TEST_CREATOR]: { tier: "creator", credits: 600 },
  [TEST_PRO]: { tier: "pro", credits: 2000 },
  ...(LIVE_CREATOR ? { [LIVE_CREATOR]: { tier: "creator" as const, credits: 600 } } : {}),
  ...(LIVE_PRO ? { [LIVE_PRO]: { tier: "pro" as const, credits: 2000 } } : {}),
};
export const TIER_PRICE: Record<string, string> = {
  creator: LIVE ? LIVE_CREATOR! : TEST_CREATOR,
  pro: LIVE ? LIVE_PRO! : TEST_PRO,
};

/** One-time top-ups: credits granted per £1 paid. */
export const TOPUP_CREDITS_PER_GBP = 25;

const ALLOWED = ["https://vydora.ai", "https://www.vydora.ai", "https://story-scene-voice-maker.lovable.app", "http://localhost:8080"];
export function returnOrigin(req: Request) {
  const o = req.headers.get("Origin") ?? "";
  if (ALLOWED.includes(o) || /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(o)) return o;
  return "https://vydora.ai";
}
