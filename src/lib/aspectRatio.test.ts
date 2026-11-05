import { describe, expect, it } from "vitest";
import { ASPECT_RATIOS, captionWrapPx, isRatio, previewMaxPx, ratioOf, shapeOf } from "./aspectRatio";

describe("aspectRatio", () => {
  it("offers the common video formats", () => {
    expect(ASPECT_RATIOS.map((r) => r.value)).toEqual(["16:9", "9:16", "1:1", "4:5", "21:9"]);
  });

  it("keeps every canvas the shape it claims", () => {
    for (const r of ASPECT_RATIOS) {
      const [w, h] = r.value.split(":").map(Number);
      expect(r.w / r.h).toBeCloseTo(w / h, 2);
    }
  });

  it("falls back to landscape for unknown or missing values", () => {
    expect(ratioOf(undefined).value).toBe("16:9");
    expect(ratioOf("3:2").value).toBe("16:9");
    expect(ratioOf("9:16").value).toBe("9:16");
  });

  it("only accepts listed ratios", () => {
    expect(isRatio("1:1")).toBe(true);
    expect(isRatio("16x9")).toBe(false);
  });

  it("sizes caption lines from the canvas width", () => {
    expect(captionWrapPx("16:9")).toBe(1088);
    expect(captionWrapPx("9:16")).toBe(612);
    expect(captionWrapPx(null)).toBe(1088);
  });

  it("caps portrait previews but not landscape ones", () => {
    expect(previewMaxPx("9:16")).toBe(420);
    expect(previewMaxPx("4:5")).toBe(420);
    expect(previewMaxPx("16:9")).toBeUndefined();
    expect(previewMaxPx("1:1")).toBeUndefined();
  });

  it("draws menu shapes in the right orientation", () => {
    expect(shapeOf("16:9").w).toBeGreaterThan(shapeOf("16:9").h);
    expect(shapeOf("9:16").h).toBeGreaterThan(shapeOf("9:16").w);
    expect(shapeOf("1:1").w).toBe(shapeOf("1:1").h);
  });
});
