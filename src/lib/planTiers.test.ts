import { describe, it, expect } from "vitest";
import { planTierOf, lengthAllowedForPlan, qualityAllowedForPlan } from "../../supabase/functions/_shared/tiers";
import { effectiveQuality, exportCost } from "../../supabase/functions/_shared/exports";
import { CREDIT_COSTS, estimateCredits } from "./credits";

describe("plan tiers", () => {
  it("free: 2 min, 720p only", () => {
    const t = planTierOf(false, false, null);
    expect(t).toBe("free");
    expect(lengthAllowedForPlan(120, t)).toBe(true);
    expect(lengthAllowedForPlan(121, t)).toBe(false);
    expect(qualityAllowedForPlan("1080p", t)).toBe(false);
  });
  it("creator: 20 min, no 1080p", () => {
    const t = planTierOf(false, true, "creator");
    expect(lengthAllowedForPlan(1200, t)).toBe(true);
    expect(lengthAllowedForPlan(1201, t)).toBe(false);
    expect(qualityAllowedForPlan("1080p", t)).toBe(false);
    expect(qualityAllowedForPlan("720p", t)).toBe(true);
  });
  it("pro: 60 min and 1080p", () => {
    const t = planTierOf(false, true, "pro");
    expect(lengthAllowedForPlan(3600, t)).toBe(true);
    expect(lengthAllowedForPlan(3601, t)).toBe(false);
    expect(qualityAllowedForPlan("1080p", t)).toBe(true);
  });
  it("overdue pro (no active sub) falls back to free", () => {
    expect(planTierOf(false, false, "pro")).toBe("free");
  });
  it("admin counts as pro", () => expect(planTierOf(true, false, null)).toBe("pro"));
  it("exports: creator renders 720p for 2, pro 1080p for 5", () => {
    expect(exportCost(effectiveQuality("1080p", false))).toBe(2);
    expect(exportCost(effectiveQuality("1080p", true))).toBe(5);
  });
  it("no 10-credit Full HD fee at creation", () => {
    expect("fullHd" in CREDIT_COSTS).toBe(false);
    expect(estimateCredits({ scenes: 6, quality: "1080p" })).toBe(estimateCredits({ scenes: 6, quality: "720p" }));
  });
});
