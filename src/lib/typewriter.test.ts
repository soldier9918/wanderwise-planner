import { describe, it, expect } from "vitest";
import { typedLine, wrapByChars } from "./typewriter";

describe("wrapByChars", () => {
  it("keeps every line within the character limit", () => {
    const lines = wrapByChars("The octopus has three hearts and blue blood", 12);
    expect(lines).toEqual(["The octopus", "has three", "hearts and", "blue blood"]);
    expect(lines.every((l) => l.length <= 12)).toBe(true);
  });

  it("breaks a word that cannot fit on a line of its own", () => {
    const lines = wrapByChars("supercalifragilistic", 8);
    expect(lines.join("")).toBe("supercalifragilistic");
    expect(lines.every((l) => l.length <= 8)).toBe(true);
  });

  it("returns nothing for empty narration", () => expect(wrapByChars("   ", 20)).toEqual([]));
});

describe("typedLine", () => {
  const lines = ["The octopus", "has three", "hearts and", "blue blood"];

  it("shows nothing before the narrator starts", () => expect(typedLine(lines, 0)).toBe(""));

  it("ends with the last line complete", () => expect(typedLine(lines, 1)).toBe("blue blood"));

  it("only ever shows one line, typed part way through", () => {
    for (const f of [0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9]) {
      const shown = typedLine(lines, f);
      expect(shown.length).toBeLessThanOrEqual(11);
      expect(lines.some((l) => l.startsWith(shown))).toBe(true);
    }
  });

  it("drops the finished line instead of stacking it up", () => {
    const two = ["Hello world", "goodbye moon"];
    expect(typedLine(two, 0.25)).toBe("Hello ");
    const late = typedLine(two, 0.9);
    expect(late.startsWith("goodbye")).toBe(true);
    expect(late.includes("Hello")).toBe(false);
  });

  it("handles a single short line", () => expect(typedLine(["Hello world"], 0.5)).toBe("Hello "));

  it("handles no lines at all", () => expect(typedLine([], 0.5)).toBe(""));
});
