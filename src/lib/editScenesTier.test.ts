import { describe, it, expect } from "vitest";
import { planTierOf, sceneChangeAllowed, subscriptionUnlocksPaid } from "../../supabase/functions/_shared/tiers";

const tierFor = (status: string, plan: string) => planTierOf(false, subscriptionUnlocksPaid(status, plan), plan);

describe("edit-scenes tier cap", () => {
  it("free users can grow to 6 scenes", () => expect(sceneChangeAllowed(4, 6, "free")).toBe(true));
  it("free users cannot grow to 7 scenes", () => expect(sceneChangeAllowed(6, 7, "free")).toBe(false));
  it("active Creator can grow to 22 scenes", () => expect(sceneChangeAllowed(6, 22, tierFor("active", "creator"))).toBe(true));
  it("active Creator cannot grow to 30 scenes", () => expect(sceneChangeAllowed(6, 30, tierFor("active", "creator"))).toBe(false));
  it("active Pro can grow to 50 scenes", () => expect(sceneChangeAllowed(6, 50, tierFor("active", "pro"))).toBe(true));
  it("overdue Pro is capped at 6", () => expect(sceneChangeAllowed(6, 7, tierFor("past_due", "pro"))).toBe(false));
  it("cancelled Pro is capped at 6", () => expect(sceneChangeAllowed(6, 7, tierFor("canceled", "pro"))).toBe(false));
  it("anyone can shrink an over-limit video", () => expect(sceneChangeAllowed(30, 8, "free")).toBe(true));
});
