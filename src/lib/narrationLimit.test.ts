import { describe, it, expect } from "vitest";
import { narrationCharLimit, CHARS_PER_SECOND } from "./tiers";

describe("narrationCharLimit", () => {
  it("2-minute free video with 6 scenes stays under 3 minutes", () => {
    const lim = narrationCharLimit(120, 6, "free")!;
    expect(lim).toBe(450);
    expect((lim * 6) / CHARS_PER_SECOND).toBeLessThanOrEqual(180);
  });
  it("free tier caps at 2 minutes even if a longer length is stored", () => {
    expect(narrationCharLimit(600, 6, "free")).toBe(450);
  });
  it("creator keeps their chosen length", () => {
    expect(narrationCharLimit(600, 10, "creator")).toBe(1350);
  });
  it("admins have no limit", () => {
    expect(narrationCharLimit(120, 6, "pro", true)).toBeNull();
  });
});
