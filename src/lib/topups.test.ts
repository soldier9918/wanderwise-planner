import { describe, expect, it } from "vitest";
import { autoTopUpSchema, gbpAmount, TOP_UP_AMOUNTS } from "./topups";

describe("pay-as-you-go top-ups", () => {
  it("offers the six requested GBP amounts", () => {
    expect(TOP_UP_AMOUNTS).toEqual([5, 10, 50, 100, 1000, 5000]);
  });
  it("requires a minimum £5 custom purchase", () => {
    expect(gbpAmount.safeParse(4.99).success).toBe(false);
    expect(gbpAmount.safeParse(5).success).toBe(true);
  });
  it("requires a minimum £5 automatic purchase", () => {
    const draft = { enabled: true, threshold: 20, amount: 4, limitEnabled: false, monthlyLimit: 50 };
    expect(autoTopUpSchema.safeParse(draft).success).toBe(false);
    expect(autoTopUpSchema.safeParse({ ...draft, amount: 5 }).success).toBe(true);
  });
  it("validates the user-entered credit threshold", () => {
    expect(autoTopUpSchema.safeParse({ enabled: true, threshold: 0, amount: 10, limitEnabled: false, monthlyLimit: 50 }).success).toBe(false);
  });
  it("a monthly limit must cover one automatic purchase", () => {
    const draft = { enabled: true, threshold: 20, amount: 10, limitEnabled: true, monthlyLimit: 5 };
    expect(autoTopUpSchema.safeParse(draft).success).toBe(false);
    expect(autoTopUpSchema.safeParse({ ...draft, monthlyLimit: 10 }).success).toBe(true);
    expect(autoTopUpSchema.safeParse({ ...draft, limitEnabled: false }).success).toBe(true);
  });
});