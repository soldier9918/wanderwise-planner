import { describe, it, expect } from "vitest";
import { sfxFor, transitionTimes, SFX_TYPES } from "./sfx";

describe("transition sounds", () => {
  it("plays between scenes only, not before the first one", () => {
    expect(transitionTimes([4, 5, 3])).toEqual([4, 9]);
  });
  it("keeps the chosen sound for every transition", () => {
    expect(sfxFor("page", 0)).toBe("page");
    expect(sfxFor("page", 5)).toBe("page");
  });
  it("random mix picks a real sound, never 'random'", () => {
    for (let i = 0; i < 30; i++) expect(SFX_TYPES.some((s) => s.value === sfxFor("random", i) && s.value !== "random")).toBe(true);
  });
});
