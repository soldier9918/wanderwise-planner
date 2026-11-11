import { describe, it, expect } from "vitest";
import { canMutateProject } from "../../supabase/functions/_shared/tiers";
import { isReadOnlyAccount } from "./account";

describe("zero-credit read-only projects", () => {
  it("locks Free accounts with 0 credits", () => expect(canMutateProject(false, false, 0)).toBe(false));
  it("locks Free accounts with a negative balance", () => expect(canMutateProject(false, false, -3)).toBe(false));
  it("allows Free accounts holding credits", () => expect(canMutateProject(false, false, 1)).toBe(true));
  it("allows active subscribers with 0 credits (incl. scheduled cancellation)", () => expect(canMutateProject(false, true, 0)).toBe(true));
  it("allows admins", () => expect(canMutateProject(true, false, 0)).toBe(true));
  it("ignores non-boolean client values", () => expect(canMutateProject("true", "true", 0)).toBe(false));
  it("UI shows read-only only for Free 0-credit accounts", () => {
    expect(isReadOnlyAccount({ pro: false, balance: 0 })).toBe(true);
    expect(isReadOnlyAccount({ pro: true, balance: 0 })).toBe(false);
    expect(isReadOnlyAccount({ pro: false, balance: 5 })).toBe(false);
  });
});
