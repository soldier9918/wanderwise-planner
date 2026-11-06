import { describe, expect, it } from "vitest";
import { MOTION_TYPES, motionAt, motionFor } from "./motion";

describe("motion", () => {
  it("disabled means a still image", () => {
    expect(motionAt("zoom-in", 0, 0.7, false)).toEqual({ scale: 1, x: 0, y: 0, rot: 0 });
  });
  it("zoom in grows and zoom out shrinks", () => {
    expect(motionAt("zoom-in", 0, 1).scale).toBeGreaterThan(motionAt("zoom-in", 0, 0).scale);
    expect(motionAt("zoom-out", 0, 1).scale).toBeLessThan(motionAt("zoom-out", 0, 0).scale);
  });
  it("never shows the image edges", () => {
    for (const { value } of MOTION_TYPES) for (let i = 0; i < 4; i++) for (let p = 0; p <= 1; p += 0.1) {
      const m = motionAt(value, i, p);
      expect(Math.abs(m.x)).toBeLessThanOrEqual((m.scale - 1) / 2 + 1e-9);
      expect(Math.abs(m.y)).toBeLessThanOrEqual((m.scale - 1) / 2 + 1e-9);
    }
  });
  it("alternate flips per scene", () => {
    expect(motionFor("alternate", 0)).toBe("zoom-in");
    expect(motionFor("alternate", 1)).toBe("zoom-out");
  });
});
