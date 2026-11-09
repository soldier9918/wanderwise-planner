import { describe, it, expect } from "vitest";
import { voiceAllowed, lengthAllowedForTier, scenesAllowedForTier } from "./tiers";
describe("free vs pro tiers", () => {
  it("free users get Kore", () => expect(voiceAllowed("Kore", false)).toBe(true));
  it("free users can't use Algenib", () => expect(voiceAllowed("Algenib", false)).toBe(false));
  it("pro users can use Algenib", () => expect(voiceAllowed("Algenib", true)).toBe(true));
  it("free users can make 2 minutes", () => expect(lengthAllowedForTier(120, false)).toBe(true));
  it("free users can't make 3 minutes", () => expect(lengthAllowedForTier(180, false)).toBe(false));
  it("pro users can make 60 minutes", () => expect(lengthAllowedForTier(3600, true)).toBe(true));
  it("free users capped at 6 scenes", () => expect(scenesAllowedForTier(8, false)).toBe(false));
});
