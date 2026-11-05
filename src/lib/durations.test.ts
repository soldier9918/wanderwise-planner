import { describe, expect, it } from "vitest";
import { elapsedSeconds, estimateSeconds, formatSeconds, sceneSeconds } from "./durations";

describe("sceneSeconds", () => {
  it("is the voiceover length plus a short breath", () => {
    expect(sceneSeconds(8.2, "Whatever the narration says")).toBe(9);
    expect(sceneSeconds(2.6, "Whatever the narration says")).toBe(3);
  });

  it("falls back to a word-count estimate before the voiceover is measured", () => {
    const ten = "one two three four five six seven eight nine ten";
    expect(sceneSeconds(null, ten)).toBe(estimateSeconds(ten));
    expect(sceneSeconds(undefined, ten)).toBe(4);
  });

  it("is 4 seconds when there is no narration at all", () => {
    expect(sceneSeconds(null, "   ")).toBe(4);
  });
});

describe("elapsedSeconds", () => {
  it("adds up every earlier scene plus the part of the current one", () => {
    expect(elapsedSeconds([10, 10, 10], 0, 0.5)).toBe(5);
    expect(elapsedSeconds([10, 10, 10], 2, 0.5)).toBe(25);
  });

  it("is the full video length at the end of the last scene", () => {
    expect(elapsedSeconds([8, 12], 1, 1)).toBe(20);
  });

  it("stays inside the video for odd inputs", () => {
    expect(elapsedSeconds([], 0, 0.5)).toBe(0);
    expect(elapsedSeconds([6], -1, 0.5)).toBe(0);
    expect(elapsedSeconds([6], 9, 0.5)).toBe(3);
    expect(elapsedSeconds([6], 0, 3)).toBe(6);
  });
});

describe("formatSeconds", () => {
  it("uses plain seconds under a minute", () => {
    expect(formatSeconds(9)).toBe("9s");
    expect(formatSeconds(59.4)).toBe("59s");
  });

  it("switches to minutes and seconds once it reaches a minute", () => {
    expect(formatSeconds(59.6)).toBe("1:00");
    expect(formatSeconds(60)).toBe("1:00");
    expect(formatSeconds(75)).toBe("1:15");
  });
});
