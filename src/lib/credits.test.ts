import { describe, it, expect } from "vitest";
import { estimateCredits } from "./credits";

describe("credit estimates", () => {
  it("standard 6-scene video costs 32", () => expect(estimateCredits({ scenes: 6 })).toBe(32));
  it("fully animated 6-scene video costs 182", () => expect(estimateCredits({ scenes: 6, animated: 6 })).toBe(182));
  it("thumbnail + SEO adds 6", () => expect(estimateCredits({ scenes: 6, thumbnail: true, seo: true })).toBe(38));
});

describe("1080p surcharge", () => {
  it("720p adds nothing", () => expect(estimateCredits({ scenes: 6, quality: "720p" })).toBe(32));
  it("1080p adds 10 credits", () => expect(estimateCredits({ scenes: 6, quality: "1080p" })).toBe(42));
});
