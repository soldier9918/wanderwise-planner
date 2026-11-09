import { describe, it, expect } from "vitest";
import { needsWatermark, balanceOf, STARTER_CREDITS, REFERRAL_BONUS } from "./account";
const r = (amount: number, reason: string) => ({ amount, reason, created_at: new Date().toISOString() });
describe("account rules", () => {
  it("new signups get 30 starter credits", () => expect(STARTER_CREDITS).toBe(30));
  it("referrals give 50 credits", () => expect(REFERRAL_BONUS).toBe(50));
  it("free accounts get the watermark", () => expect(needsWatermark([r(30, "starter"), r(50, "referral_joined")])).toBe(true));
  it("paid accounts export without watermark", () => expect(needsWatermark([r(30, "starter"), r(500, "topup")])).toBe(false));
  it("balance sums the ledger", () => expect(balanceOf([r(30, "starter"), r(-12, "video")])).toBe(18));
});
