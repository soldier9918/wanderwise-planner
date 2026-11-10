import { describe, expect, it } from "vitest";
import { autoTopUpSchema, creditsFor, CREDITS_PER_GBP, gbp, gbpAmount, gbpValueOf, TOP_UP_AMOUNTS } from "./topups";

describe("pay-as-you-go top-ups", () => {
  it("offers the six requested GBP amounts", () => {
    expect(TOP_UP_AMOUNTS).toEqual([5, 10, 50, 100, 1000, 5000]);
  });
  it("buys 25 credits per £1", () => {
    expect(CREDITS_PER_GBP).toBe(25);
    expect(creditsFor(5)).toBe(125);
    expect(creditsFor(10)).toBe(250);
    expect(creditsFor(100)).toBe(2500);
    expect(creditsFor(7.5)).toBe(187);
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

describe("money shown next to credit lines", () => {
  it("values a credit line at £1 = 25 credits", () => {
    expect(gbpValueOf(-2)).toBe(0.08);
    expect(gbpValueOf(3)).toBe(0.12);
    expect(gbpValueOf(-600)).toBe(24);
  });
  it("formats money in pounds with two decimals", () => {
    expect(gbp(4.8)).toBe("£4.80");
    expect(gbp(0)).toBe("£0.00");
    expect(gbp(19)).toBe("£19.00");
  });
});
