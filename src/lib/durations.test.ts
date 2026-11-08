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

import { isLengthAllowed, secondsPerScene, wordsForSeconds, VIDEO_LENGTHS } from "./durations";

describe("video length", () => {
  it("4 scenes over 2 minutes is 30 seconds a scene", () => {
    expect(secondsPerScene(120, 4)).toBe(30);
  });
  it("30 seconds of narration is about 78 words", () => {
    expect(wordsForSeconds(30)).toBe(78);
  });
  it("greys out scenes shorter than 5s or longer than 90s", () => {
    expect(isLengthAllowed(30, 22)).toBe(false);
    expect(isLengthAllowed(600, 4)).toBe(false);
    expect(isLengthAllowed(120, 4)).toBe(true);
  });
  it("offers 15, 20 and 30 minutes beyond 10 minutes", () => {
    expect(VIDEO_LENGTHS).toContain(900);
    expect(VIDEO_LENGTHS).toContain(1200);
    expect(VIDEO_LENGTHS).toContain(1800);
    expect(VIDEO_LENGTHS[VIDEO_LENGTHS.length - 1]).toBe(3600);
  });
  it("lets long videos through only with enough scenes", () => {
    expect(isLengthAllowed(900, 10)).toBe(true);   // 15 min, 90s a scene
    expect(isLengthAllowed(900, 8)).toBe(false);   // would need 112s a scene
    expect(isLengthAllowed(1200, 14)).toBe(true);  // 20 min
    expect(isLengthAllowed(1200, 12)).toBe(false);
    expect(isLengthAllowed(1800, 22)).toBe(true);  // 30 min is the longest that fits 22 scenes
    expect(isLengthAllowed(1800, 20)).toBe(true);
    expect(isLengthAllowed(1800, 18)).toBe(false);
    expect(isLengthAllowed(2700, 30)).toBe(true);  // 45 min
    expect(isLengthAllowed(2700, 22)).toBe(false);
    expect(isLengthAllowed(3600, 40)).toBe(true);  // 60 min
    expect(isLengthAllowed(3600, 30)).toBe(false);
  });
});

import { locateTime } from "./durations";

describe("locateTime", () => {
  it("finds the scene and spot for a slider position", () => {
    expect(locateTime([10, 20], 5)).toEqual({ index: 0, progress: 0.5 });
    expect(locateTime([10, 20], 15)).toEqual({ index: 1, progress: 0.25 });
  });
  it("clamps past the end to the last scene", () => {
    expect(locateTime([10, 20], 99).index).toBe(1);
  });
});

import { clipRate, clipSecondsFor } from "./durations";
describe("scene animation length", () => {
  it("requests a clip as long as a 5s scene", () => expect(clipSecondsFor(5)).toBe(5));
  it("caps clips at 10s", () => expect(clipSecondsFor(18)).toBe(10));
  it("stretches a 10s clip over a 20s scene at half speed", () => expect(clipRate(10, 20)).toBe(0.5));
  it("plays a 5s clip at normal speed in a 5s scene", () => expect(clipRate(5, 5)).toBe(1));
});
