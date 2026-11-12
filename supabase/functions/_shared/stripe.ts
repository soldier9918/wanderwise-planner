import Stripe from "npm:stripe@17.7.0";
import { resolveStripeConfig, billingBlockReason, plansFor } from "./stripeConfig.ts";

// Live runs only when STRIPE_MODE=live, all four Live settings are valid, and the database switch is on.
export const CONFIG = resolveStripeConfig(Deno.env.toObject());
if (CONFIG.mode === "misconfigured") console.error("Stripe disabled:", CONFIG.problems.join("; ")); // names only, never values
export const LIVE = CONFIG.mode === "live";
const key = CONFIG.mode === "misconfigured" ? undefined : CONFIG.secretKey;
export const stripe = new Stripe(key ?? "sk_test_unconfigured", { apiVersion: "2024-11-20.acacia" });
export const WEBHOOK_SECRET = CONFIG.mode === "misconfigured" ? undefined : CONFIG.webhookSecret;

/** Vydora's own Stripe prices for the running mode -> plan tier and monthly credits. Anything else is ignored. */
export const PLANS = plansFor(CONFIG);
export const TIER_PRICE: Record<string, string> =
  CONFIG.mode === "misconfigured" ? {} : { creator: CONFIG.creatorPrice, pro: CONFIG.proPrice };

/** Returns why billing must not run right now, or null when it's safe. */
// deno-lint-ignore no-explicit-any
export async function billingBlocked(db: any): Promise<string | null> {
  const { data } = await db.rpc("stripe_livemode");
  return billingBlockReason(CONFIG, data === true);
}

/** One-time top-ups: credits granted per £1 paid. */
export const TOPUP_CREDITS_PER_GBP = 25;

const ALLOWED = ["https://vydora.ai", "https://www.vydora.ai", "https://story-scene-voice-maker.lovable.app", "http://localhost:8080"];
export function returnOrigin(req: Request) {
  const o = req.headers.get("Origin") ?? "";
  if (ALLOWED.includes(o) || /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(o)) return o;
  return "https://vydora.ai";
}
