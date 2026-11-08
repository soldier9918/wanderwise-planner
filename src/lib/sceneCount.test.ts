import { describe, expect, it } from "vitest";
import { MAX_SCENES, MIN_SCENES, SCENE_COUNTS, clampSceneCount, planSceneChange, sceneCountOptions } from "./sceneCount";

describe("scene limits", () => {
  it("starts at 4 scenes, the same floor the New video form offers", () => {
    expect(MIN_SCENES).toBe(4);
    expect(Math.min(...SCENE_COUNTS)).toBe(MIN_SCENES);
    expect(sceneCountOptions(8)[0]).toBe(MIN_SCENES);
  });
});

describe("clampSceneCount", () => {
  it("keeps counts inside the range the writer can deliver", () => {
    expect(clampSceneCount(1)).toBe(MIN_SCENES);
    expect(clampSceneCount(999)).toBe(MAX_SCENES);
    expect(clampSceneCount(9.4)).toBe(9);
  });
});

describe("sceneCountOptions", () => {
  it("always offers the current count, even an odd one", () => {
    const options = sceneCountOptions(5);
    expect(options).toContain(5);
    expect(options).toContain(22);
    expect(new Set(options).size).toBe(options.length);
    expect(options).toEqual([...options].sort((a, b) => a - b));
  });

  it("always offers the shortest video, so a grown video can shrink back", () => {
    expect(sceneCountOptions(4)).toContain(MIN_SCENES);
    expect(sceneCountOptions(12)).toContain(MIN_SCENES);
  });
});

describe("planSceneChange", () => {
  it("adds scenes when the target is longer", () => {
    expect(planSceneChange(6, 10)).toEqual({ target: 10, add: 4, remove: 0 });
  });

  it("removes scenes when the target is shorter", () => {
    expect(planSceneChange(10, 6)).toEqual({ target: 6, add: 0, remove: 4 });
  });

  it("does nothing when the target matches", () => {
    expect(planSceneChange(8, 8)).toEqual({ target: 8, add: 0, remove: 0 });
  });

  it("never plans past the limits", () => {
    expect(planSceneChange(6, 500).target).toBe(MAX_SCENES);
    expect(planSceneChange(6, 0).target).toBe(MIN_SCENES);
  });
});
