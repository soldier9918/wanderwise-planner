import { describe, it, expect } from "vitest";
import { clampCardSeconds, isActive, DEFAULT_CARDS } from "./brandCards";

describe("brand cards", () => {
  it("clamps card length to 2–8 seconds", () => {
    expect(clampCardSeconds(1)).toBe(2);
    expect(clampCardSeconds(20)).toBe(8);
    expect(clampCardSeconds(5)).toBe(5);
  });
  it("is not attached when switched off", () => {
    expect(isActive({ ...DEFAULT_CARDS.outro, enabled: false })).toBe(false);
  });
  it("clip cards need a chosen clip", () => {
    expect(isActive({ ...DEFAULT_CARDS.intro, enabled: true, mode: "clip", clipPath: null })).toBe(false);
    expect(isActive({ ...DEFAULT_CARDS.intro, enabled: true, mode: "clip", clipPath: "u/library/a.mp4" })).toBe(true);
  });
});
