import { describe, it, expect } from "vitest";
import { resolveStripeConfig, billingBlockReason, plansFor, TEST_CREATOR, TEST_PRO } from "../../supabase/functions/_shared/stripeConfig";
import { reversalFor } from "../../supabase/functions/_shared/refunds";

const LIVE_ENV = {
  STRIPE_MODE: "live",
  STRIPE_LIVE_SECRET_KEY: "sk_live_abc123",
  STRIPE_LIVE_WEBHOOK_SECRET: "whsec_abc123",
  STRIPE_LIVE_PRICE_CREATOR: "price_liveCreator",
  STRIPE_LIVE_PRICE_PRO: "price_livePro",
};

describe("Live activation", () => {
  it("stays in Sandbox when only the Live secret key is added", () => {
    expect(resolveStripeConfig({ STRIPE_LIVE_SECRET_KEY: "sk_live_abc123" }).mode).toBe("test");
  });
  it("goes Live only with STRIPE_MODE=live and all four settings", () => {
    expect(resolveStripeConfig(LIVE_ENV).mode).toBe("live");
  });
  for (const k of ["STRIPE_LIVE_SECRET_KEY", "STRIPE_LIVE_WEBHOOK_SECRET", "STRIPE_LIVE_PRICE_CREATOR", "STRIPE_LIVE_PRICE_PRO"]) {
    it(`fails safe when ${k} is missing`, () => {
      expect(resolveStripeConfig({ ...LIVE_ENV, [k]: undefined }).mode).toBe("misconfigured");
    });
  }
  it("rejects a test key used as the Live key", () => {
    expect(resolveStripeConfig({ ...LIVE_ENV, STRIPE_LIVE_SECRET_KEY: "sk_test_abc" }).mode).toBe("misconfigured");
  });
  it("rejects Sandbox prices as Live prices", () => {
    expect(resolveStripeConfig({ ...LIVE_ENV, STRIPE_LIVE_PRICE_PRO: TEST_PRO }).mode).toBe("misconfigured");
  });
  it("never puts secret values in the problem list", () => {
    const cfg = resolveStripeConfig({ ...LIVE_ENV, STRIPE_LIVE_SECRET_KEY: "sk_test_SECRETVALUE" });
    expect(JSON.stringify(cfg)).not.toContain("SECRETVALUE");
  });
  it("blocks billing when incomplete, or when the database switch disagrees", () => {
    expect(billingBlockReason(resolveStripeConfig({ ...LIVE_ENV, STRIPE_LIVE_PRICE_PRO: "" }), true)).not.toBeNull();
    expect(billingBlockReason(resolveStripeConfig(LIVE_ENV), false)).not.toBeNull();
    expect(billingBlockReason(resolveStripeConfig({}), true)).not.toBeNull();
    expect(billingBlockReason(resolveStripeConfig(LIVE_ENV), true)).toBeNull();
    expect(billingBlockReason(resolveStripeConfig({}), false)).toBeNull();
  });
});

describe("Sandbox prices never unlock Live plans", () => {
  const live = plansFor(resolveStripeConfig(LIVE_ENV));
  it("Sandbox Pro and Creator prices map to nothing in Live", () => {
    expect(live[TEST_PRO]).toBeUndefined();
    expect(live[TEST_CREATOR]).toBeUndefined();
  });
  it("genuine Live Pro gives Pro with 2,000 credits; Creator 600", () => {
    expect(live.price_livePro).toEqual({ tier: "pro", credits: 2000 });
    expect(live.price_liveCreator).toEqual({ tier: "creator", credits: 600 });
  });
  it("misconfigured Live maps no prices at all", () => {
    expect(plansFor(resolveStripeConfig({ ...LIVE_ENV, STRIPE_LIVE_SECRET_KEY: "" }))).toEqual({});
  });
});

describe("refund and dispute reversals", () => {
  it("full £5 top-up refund removes all 125 credits", () => {
    expect(reversalFor({ granted: 125, paid: 500, returned: 500, alreadyReversed: 0, balance: 200 })).toEqual({ reverse: 125, shortfall: 0 });
  });
  it("half refund removes half the credits", () => {
    expect(reversalFor({ granted: 125, paid: 500, returned: 250, alreadyReversed: 0, balance: 200 }).reverse).toBe(62);
  });
  it("a second partial refund only removes the difference", () => {
    expect(reversalFor({ granted: 125, paid: 500, returned: 500, alreadyReversed: 62, balance: 200 }).reverse).toBe(63);
  });
  it("a replayed refund removes nothing more", () => {
    expect(reversalFor({ granted: 125, paid: 500, returned: 500, alreadyReversed: 125, balance: 200 }).reverse).toBe(0);
  });
  it("never takes the balance below zero; reports the shortfall", () => {
    expect(reversalFor({ granted: 2000, paid: 4900, returned: 4900, alreadyReversed: 0, balance: 300 })).toEqual({ reverse: 300, shortfall: 1700 });
    expect(reversalFor({ granted: 2000, paid: 4900, returned: 4900, alreadyReversed: 0, balance: -5 }).reverse).toBe(0);
  });
  it("can never remove more than was granted", () => {
    expect(reversalFor({ granted: 125, paid: 500, returned: 9999, alreadyReversed: 0, balance: 9999 }).reverse).toBe(125);
  });
});
