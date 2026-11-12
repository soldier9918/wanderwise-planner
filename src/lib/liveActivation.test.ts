import { describe, it, expect } from "vitest";
import { priceProblem, confirmationOk, EXPECTED_PRICES } from "../../supabase/functions/_shared/liveActivation";
import { resolveStripeConfig, billingBlockReason } from "../../supabase/functions/_shared/stripeConfig";

const live = { livemode: true, active: true, currency: "gbp", recurring: { interval: "month", interval_count: 1 } };
const env = { STRIPE_MODE: "live", STRIPE_LIVE_SECRET_KEY: "rk_live_abc", STRIPE_LIVE_WEBHOOK_SECRET: "whsec_abc", STRIPE_LIVE_PRICE_CREATOR: "price_c", STRIPE_LIVE_PRICE_PRO: "price_p" };

describe("Live activation rules", () => {
  it("Creator must be £19/month and Pro £49/month", () => {
    expect(priceProblem("Creator", { ...live, unit_amount: 1900 }, EXPECTED_PRICES.creator)).toBeNull();
    expect(priceProblem("Pro", { ...live, unit_amount: 4900 }, EXPECTED_PRICES.pro)).toBeNull();
    expect(priceProblem("Pro", { ...live, unit_amount: 4800 }, EXPECTED_PRICES.pro)).not.toBeNull();
  });
  it("rejects Sandbox or non-GBP prices", () => {
    expect(priceProblem("Creator", { ...live, unit_amount: 1900, livemode: false }, 1900)).not.toBeNull();
    expect(priceProblem("Creator", { ...live, unit_amount: 1900, currency: "usd" }, 1900)).not.toBeNull();
  });
  it("requires the exact typed confirmation", () => {
    expect(confirmationOk("ACTIVATE LIVE")).toBe(true);
    expect(confirmationOk("activate live")).toBe(false);
    expect(confirmationOk(undefined)).toBe(false);
  });
  it("accepts restricted rk_live_ keys", () => {
    expect(resolveStripeConfig(env).mode).toBe("live");
  });
  it("blocks payments when STRIPE_MODE and the database switch disagree", () => {
    expect(billingBlockReason(resolveStripeConfig(env), false)).not.toBeNull();
    expect(billingBlockReason(resolveStripeConfig({ ...env, STRIPE_MODE: "test" }), true)).not.toBeNull();
    expect(billingBlockReason(resolveStripeConfig(env), true)).toBeNull();
  });
});
