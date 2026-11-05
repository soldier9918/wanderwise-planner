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
  // 8 words across 4 lines: The octopus / has three / hearts and / blue blood
  const lines = ["The octopus", "has three", "hearts and", "blue blood"];

  /** True when `shown` is a run of whole words from the start of `line`. */
  const wholeWords = (line: string, shown: string) =>
    shown === "" || line === shown || line.startsWith(`${shown} `);

  it("shows nothing before the narrator starts", () => expect(typedLine(lines, 0)).toBe(""));

  it("ends with the last line complete", () => expect(typedLine(lines, 1)).toBe("blue blood"));

  it("shows the first word as soon as the narrator starts", () => {
    expect(typedLine(lines, 0.01)).toBe("The");
  });

  it("keeps ahead of the voiceover and finishes before the audio ends", () => {
    expect(typedLine(lines, 0.85)).toBe("blue blood");
    expect(typedLine(lines, 0.5)).not.toBe("has");
  });

  it("gives longer words more time than short ones", () => {
    // "a" is short, so "supercalifragilistic" appears soon after it starts.
    expect(typedLine(["a supercalifragilistic b"], 0.1)).toBe("a supercalifragilistic");
  });

  it("never shows half a word", () => {
    for (let i = 0; i <= 20; i++) {
      const shown = typedLine(lines, i / 20);
      expect(lines.some((l) => wholeWords(l, shown))).toBe(true);
    }
  });

  it("only ever shows one line", () => {
    for (let i = 0; i <= 20; i++) {
      const shown = typedLine(lines, i / 20);
      expect(lines.some((l) => wholeWords(l, shown))).toBe(true);
    }
  });

  it("drops the finished line instead of stacking it up", () => {
    const two = ["Hello world", "goodbye moon"];
    expect(typedLine(two, 0.01)).toBe("Hello");
    expect(typedLine(two, 0.8)).toBe("goodbye moon");
    expect(typedLine(two, 0.8).includes("Hello")).toBe(false);
  });

  it("handles a single short line", () => expect(typedLine(["Hello world"], 0.2)).toBe("Hello"));

  it("handles no lines at all", () => expect(typedLine([], 0.5)).toBe(""));

  it("handles blank narration", () => expect(typedLine(["", "  "], 0.5)).toBe(""));
});
