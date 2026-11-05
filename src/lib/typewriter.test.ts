import { describe, it, expect } from "vitest";
import { typedLine, typedPair, typedWords, wrapByChars } from "./typewriter";

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
  it("types one letter at a time", () => {
    expect(typedLine(lines, 0.01)).toBe("T");
    expect(typedLine(["Hello world"], 0.25)).toBe("Hel");
  });
  it("only ever shows the start of one line", () => {
    for (let i = 0; i <= 40; i++) {
      const shown = typedLine(lines, i / 40);
      expect(lines.some((l) => l.startsWith(shown))).toBe(true);
    }
  });
  it("drops the finished line instead of stacking it up", () => {
    const two = ["Hello world", "goodbye moon"];
    expect(typedLine(two, 0.95)).toMatch(/^goodbye/);
  });
  it("handles no lines at all", () => expect(typedLine([], 0.5)).toBe(""));
  it("handles blank narration", () => expect(typedLine(["", "  "], 0.5)).toBe(""));
});

describe("typedWords", () => {
  const lines = ["The octopus", "has three", "hearts and", "blue blood"];

  it("shows nothing before the narrator starts", () => expect(typedWords(lines, 0)).toEqual([]));

  it("shows one line at a time, replacing it when full", () => {
    expect(typedWords(lines, 0.01)).toEqual(["The"]);
    for (let i = 0; i <= 20; i++) expect(typedWords(lines, i / 20).length).toBeLessThanOrEqual(1);
    expect(typedWords(lines, 0.95).join(" ")).not.toContain("The");
  });

  it("ends with the last line complete", () => expect(typedWords(lines, 1)).toEqual(["blue blood"]));

  it("never shows half a word", () => {
    for (let i = 0; i <= 20; i++) {
      const flat = lines.join(" ").split(" ");
      const shown = typedWords(lines, i / 20).join(" ").split(" ").filter(Boolean);
      shown.forEach((w) => expect(flat).toContain(w));
    }
  });
});

describe("typedPair", () => {
  const lines = ["The octopus", "has three", "hearts and", "blue blood"];

  it("shows nothing before the narrator starts", () => expect(typedPair(lines, 0)).toEqual([]));

  it("never shows more than two lines", () => {
    for (let i = 0; i <= 40; i++) expect(typedPair(lines, i / 40).length).toBeLessThanOrEqual(2);
  });

  it("shows the first two lines whole as soon as narration starts", () =>
    expect(typedPair(lines, 0.3)).toEqual(["The octopus", "has three"]));

  it("swaps to the next two lines once the narrator reaches them", () =>
    expect(typedPair(lines, 0.7)).toEqual(["hearts and", "blue blood"]));

  it("ends with the last two lines complete", () =>
    expect(typedPair(lines, 1)).toEqual(["hearts and", "blue blood"]));

  it("shows the whole first page at the very start", () =>
    expect(typedPair(lines, 0.01)).toEqual(["The octopus", "has three"]));

  it("handles a single line", () => expect(typedPair(["Only line"], 1)).toEqual(["Only line"]));
});
