import { describe, it, expect } from "vitest";
import { narrationTotalCharLimit, narrationTotalCharMin, CHARS_PER_SECOND } from "./tiers";

describe("narrationTotalCharLimit", () => {
  it("a 2-minute video never runs past 2:20", () => {
    const lim = narrationTotalCharLimit(120, "free")!;
    expect(lim / CHARS_PER_SECOND).toBe(140);
  });
  it("free tier counts as 2 minutes even if a longer length is stored", () => {
    expect(narrationTotalCharLimit(600, "free")).toBe(2100);
  });
  it("an 8-minute video allows up to 8:20", () => {
    expect(narrationTotalCharLimit(480, "creator")! / CHARS_PER_SECOND).toBe(500);
  });
  it("creator 10-minute video allows up to 10:20", () => {
    expect(narrationTotalCharLimit(600, "creator")! / CHARS_PER_SECOND).toBe(620);
  });
  it("admins have no limit", () => {
    expect(narrationTotalCharLimit(120, "pro", true)).toBeNull();
  });
});

describe("narrationTotalCharMin", () => {
  it("a 2-minute video must be at least 1:50", () => {
    expect(narrationTotalCharMin(120, "free")! / CHARS_PER_SECOND).toBe(110);
  });
  it("an 8-minute video must be at least 7:50", () => {
    expect(narrationTotalCharMin(480, "creator")! / CHARS_PER_SECOND).toBe(470);
  });
});
