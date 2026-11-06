import { describe, it, expect } from "vitest";
import { duckSchedule, DUCK_RATIO } from "./music";

describe("duckSchedule", () => {
  it("dips music while the narrator speaks and restores it in the gap", () => {
    const s = duckSchedule([5.4, 4], [5, 3.6], 40, true);
    expect(s[0]).toEqual({ t: 0, level: 0.4 * DUCK_RATIO });
    expect(s[1]).toEqual({ t: 5, level: 0.4 });
    expect(s[2]).toEqual({ t: 5.4, level: 0.4 * DUCK_RATIO });
  });
  it("keeps a steady volume when ducking is turned off", () => {
    expect(duckSchedule([5, 5], [4, 4], 40, false)).toEqual([{ t: 0, level: 0.4 }]);
  });
  it("does not dip scenes that have no voiceover", () => {
    expect(duckSchedule([4], [null], 50, true)).toEqual([{ t: 0, level: 0.5 }]);
  });
});
