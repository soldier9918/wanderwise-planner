import { describe, it, expect, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { SHORTS_LOOK, shortsTitle } from "./shorts";

describe("shorts cut", () => {
  it("is vertical 9:16", () => expect(SHORTS_LOOK.aspect_ratio).toBe("9:16"));
  it("labels the copy once", () => {
    expect(shortsTitle("Octopus")).toBe("Octopus (Shorts cut)");
    expect(shortsTitle("Octopus (Shorts cut)")).toBe("Octopus (Shorts cut)");
  });
});
