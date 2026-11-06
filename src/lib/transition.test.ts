import { describe, expect, it } from "vitest";
import { TRANSITION_TYPES, transitionAt } from "./transition";

describe("transitions", () => {
  it("off, first scene, or finished means a hard cut", () => {
    expect(transitionAt("crossfade", 1, 0.5, false)).toBeNull();
    expect(transitionAt("crossfade", 0, 0.5)).toBeNull();
    expect(transitionAt("crossfade", 1, 1)).toBeNull();
  });
  it("every style ends fully on the new scene", () => {
    for (const { value } of TRANSITION_TYPES) {
      const t = transitionAt(value, 2, 0.999)!;
      expect(t.next.a).toBeGreaterThan(0.99);
      expect(Math.abs(t.next.x)).toBeLessThan(0.01);
      expect(t.overlay?.a ?? 0).toBeLessThan(0.05);
    }
  });
});
