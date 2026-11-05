import { describe, it, expect } from "vitest";
import { typedText } from "./typewriter";

describe("typedText", () => {
  it("shows nothing before the narrator starts", () => expect(typedText("Hello world", 0)).toBe(""));
  it("shows half the words halfway through the narration", () => expect(typedText("abcdefghij", 0.5)).toBe("abcde"));
  it("shows the full caption when narration ends", () => expect(typedText("Hello world", 1)).toBe("Hello world"));
});
