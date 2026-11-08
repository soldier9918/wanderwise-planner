import { describe, it, expect } from "vitest";
import { speedOf, accentDirection, logoBox } from "./voiceStyle";
describe("voice style", () => {
  it("allows only 1, 1.15 and 1.25 speeds", () => {
    expect(speedOf(1.15)).toBe(1.15);
    expect(speedOf(1.25)).toBe(1.25);
    expect(speedOf(2)).toBe(1);
  });
  it("offers British, US, Australian and Scottish accents", () => {
    for (const a of ["british", "us", "australian", "scottish"]) expect(accentDirection(a)).not.toBe("");
    expect(accentDirection("none")).toBe("");
  });
  it("places the logo in the chosen corner", () => {
    const b = logoBox("bottom-right", 1280, 720, 100, 100);
    expect(b.x + b.w).toBeLessThan(1280);
    expect(b.x).toBeGreaterThan(640);
    expect(b.y).toBeGreaterThan(360);
    expect(logoBox("top-left", 1280, 720, 100, 100).x).toBeLessThan(100);
  });
});
