import { describe, it, expect } from "vitest";
import { resolvePaidTier, sceneChangeAllowed, subscriptionUnlocksPaid } from "../../supabase/functions/_shared/tiers";

const paid = (status: string, tier: string) => resolvePaidTier(subscriptionUnlocksPaid(status, tier), false);

describe("edit-scenes tier limits", () => {
  it("free users can grow to 6 scenes", () => expect(sceneChangeAllowed(4, 6, resolvePaidTier(false, false))).toBe(true));
  it("free users cannot grow to 7 scenes", () => expect(sceneChangeAllowed(6, 7, resolvePaidTier(false, false))).toBe(false));
  it("free users cannot jump to 20 scenes", () => expect(sceneChangeAllowed(4, 20, resolvePaidTier(false, false))).toBe(false));
  it("active Creator can grow to 50 scenes", () => expect(sceneChangeAllowed(6, 50, paid("active", "creator"))).toBe(true));
  it("active Pro can grow to 50 scenes", () => expect(sceneChangeAllowed(6, 50, paid("active", "pro"))).toBe(true));
  it("overdue (past_due) Pro is capped at 6", () => expect(sceneChangeAllowed(6, 7, paid("past_due", "pro"))).toBe(false));
  it("unpaid Creator is capped at 6", () => expect(sceneChangeAllowed(6, 7, paid("unpaid", "creator"))).toBe(false));
  it("cancelled Pro is capped at 6", () => expect(sceneChangeAllowed(6, 7, paid("canceled", "pro"))).toBe(false));
  it("a client-sent truthy string can't unlock paid", () => expect(resolvePaidTier("true", "true")).toBe(false));
  it("free users can still shrink an over-limit video", () => expect(sceneChangeAllowed(10, 8, false)).toBe(true));
});
