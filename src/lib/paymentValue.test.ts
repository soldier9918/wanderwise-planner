import { describe, it, expect } from "vitest";
import { poundsFor } from "./paymentValue";
describe("poundsFor", () => {
  it("Creator 600 credits = £19", () => expect(poundsFor("subscription", 600)).toBe(19));
  it("Pro 2000 credits = £49", () => expect(poundsFor("subscription", 2000)).toBe(49));
  it("top-up 125 credits = £5", () => expect(poundsFor("topup", 125)).toBe(5));
  it("coupons are not money", () => expect(poundsFor("coupon", 100)).toBe(0));
});
