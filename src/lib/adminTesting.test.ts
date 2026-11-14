import { describe, expect, it } from "vitest";
import { parseEffectiveAccount, validCreditAdjustment } from "./adminTesting";
import { isReadOnlyAccount } from "./account";
import { lengthAllowedForPlan, qualityAllowedForPlan, voiceAllowed } from "./tiers";

const account = (tier: "free" | "creator" | "pro", balance = 30) => parseEffectiveAccount({ tier, balance, testMode: tier, adminAccess: true, isAdmin: false, pro: tier !== "free" });
describe("admin subscription testing", () => {
  it("Free testing retains admin access but applies Free restrictions", () => {
    const a = account("free", 0);
    expect(a.adminAccess).toBe(true); expect(a.isAdmin).toBe(false);
    expect(isReadOnlyAccount(a)).toBe(true); expect(lengthAllowedForPlan(121, a.tier)).toBe(false);
    expect(voiceAllowed("Fenrir", a.pro)).toBe(false);
  });
  it("Creator testing uses Creator limits, not admin Pro", () => {
    const a = account("creator");
    expect(lengthAllowedForPlan(1200, a.tier)).toBe(true); expect(lengthAllowedForPlan(1201, a.tier)).toBe(false);
    expect(qualityAllowedForPlan("1080p", a.tier)).toBe(false);
  });
  it("Pro testing allows 1080p but is not unlimited admin", () => {
    const a = account("pro"); expect(a.isAdmin).toBe(false);
    expect(qualityAllowedForPlan("1080p", a.tier)).toBe(true); expect(lengthAllowedForPlan(3601, a.tier)).toBe(false);
  });
  it("ADMIN restores unlimited status without removing access", () => {
    const a = parseEffectiveAccount({ tier: "pro", balance: 30, testMode: null, isAdmin: true, adminAccess: true, pro: true });
    expect(a.isAdmin).toBe(true); expect(a.testMode).toBeNull(); expect(isReadOnlyAccount(a)).toBe(false);
  });
  it("allows adding and subtracting whole test credits only", () => {
    expect(validCreditAdjustment("30")).toBe(true); expect(validCreditAdjustment("-30")).toBe(true);
    expect(validCreditAdjustment("0")).toBe(false); expect(validCreditAdjustment("1.5")).toBe(false); expect(validCreditAdjustment("no")).toBe(false);
  });
});