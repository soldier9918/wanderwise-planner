import { describe, it, expect } from "vitest";
import { narrationTotalCharLimit, CHARS_PER_SECOND } from "./tiers";

describe("narrationTotalCharLimit", () => {
  it("a 2-minute video never runs past 2:20", () => {
    const lim = narrationTotalCharLimit(120, "free")!;
    expect(lim / CHARS_PER_SECOND).toBe(140);
  });
  it("free tier counts as 2 minutes even if a longer length is stored", () => {
    expect(narrationTotalCharLimit(600, "free")).toBe(2100);
  });
  it("creator 10-minute video allows up to 11:40", () => {
    expect(narrationTotalCharLimit(600, "creator")! / CHARS_PER_SECOND).toBe(700);
  });
  it("admins have no limit", () => {
    expect(narrationTotalCharLimit(120, "pro", true)).toBeNull();
  });
});
