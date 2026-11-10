import { describe, it, expect } from "vitest";
import { needsWatermark, hasSubscription, balanceOf, STARTER_CREDITS, REFERRAL_BONUS } from "./account";
const r = (amount: number, reason: string) => ({ amount, reason, created_at: new Date().toISOString() });
describe("account rules", () => {
  it("new signups get 30 starter credits", () => expect(STARTER_CREDITS).toBe(30));
  it("referrals give 50 credits", () => expect(REFERRAL_BONUS).toBe(50));
  it("free accounts get the watermark", () => expect(needsWatermark([r(30, "starter"), r(50, "referral_joined")])).toBe(true));
  it("paid accounts export without watermark", () => expect(needsWatermark([r(30, "starter"), r(500, "topup")])).toBe(false));
  it("balance sums the ledger", () => expect(balanceOf([r(30, "starter"), r(-12, "video")])).toBe(18));
  it("a top-up alone does not unlock Pro", () => expect(hasSubscription([r(30, "starter"), r(500, "topup")])).toBe(false));
  it("a subscription unlocks Pro", () => expect(hasSubscription([r(30, "starter"), r(600, "subscription")])).toBe(true));
});

import { isActiveStatus } from "./account";
describe("subscription status", () => {
  it("active and trialing unlock Pro", () => { expect(isActiveStatus("active")).toBe(true); expect(isActiveStatus("trialing")).toBe(true); });
  it("cancelled or unpaid do not", () => { expect(isActiveStatus("canceled")).toBe(false); expect(isActiveStatus("past_due")).toBe(false); });
});
