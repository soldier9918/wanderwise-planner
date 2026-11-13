import { describe, it, expect } from "vitest";
import { nextFittingLength } from "./tiers";
import { VIDEO_LENGTHS } from "./durations";
describe("nextFittingLength", () => {
  it("free 1 min video at 1:05 expands to 2 min", () => expect(nextFittingLength(60, 65, "free", VIDEO_LENGTHS)).toBe(120));
  it("free already at 2 min cannot expand", () => expect(nextFittingLength(120, 125, "free", VIDEO_LENGTHS)).toBeNull());
  it("creator at 2 min expands to 3 min", () => expect(nextFittingLength(120, 125, "creator", VIDEO_LENGTHS)).toBe(180));
  it("free 1 min video at 2:10 cannot expand", () => expect(nextFittingLength(60, 130, "free", VIDEO_LENGTHS)).toBeNull());
});
