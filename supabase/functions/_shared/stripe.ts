import Stripe from "npm:stripe@17.7.0";

// TEST mode only: uses the restricted test key. Live keys are not wired up yet.
export const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SECRET_KEY")!, { apiVersion: "2024-11-20.acacia" });

/** Vydora's own Stripe prices -> plan tier and monthly credits. Anything else is ignored. */
export const PLANS: Record<string, { tier: "creator" | "pro"; credits: number }> = {
  price_1UaDVw9wksHmZlqMObItDTFY: { tier: "creator", credits: 600 },
  price_1UaDWp9wksHmZlqMSo0QbIH6: { tier: "pro", credits: 2000 },
};
export const TIER_PRICE: Record<string, string> = {
  creator: "price_1UaDVw9wksHmZlqMObItDTFY",
  pro: "price_1UaDWp9wksHmZlqMSo0QbIH6",
};

const ALLOWED = ["https://vydora.ai", "https://www.vydora.ai", "https://story-scene-voice-maker.lovable.app", "http://localhost:8080"];
export function returnOrigin(req: Request) {
  const o = req.headers.get("Origin") ?? "";
  if (ALLOWED.includes(o) || /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(o)) return o;
  return "https://vydora.ai";
}
