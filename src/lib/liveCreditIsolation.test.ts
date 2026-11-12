import { describe, it, expect } from "vitest";
import { rowsForMode, balanceOf } from "./account";

const rows = [
  { amount: 30, reason: "starter", created_at: "", livemode: null },
  { amount: 2000, reason: "subscription", created_at: "", livemode: false },
  { amount: 125, reason: "topup", created_at: "", livemode: false },
  { amount: -10, reason: "scene_image", created_at: "", livemode: null },
];
describe("Sandbox credits never spend in Live", () => {
  it("Live balance ignores Sandbox subscription and top-up credits", () => {
    expect(balanceOf(rowsForMode(rows, true))).toBe(20);
  });
  it("Sandbox still sees its own credits", () => {
    expect(balanceOf(rowsForMode(rows, false))).toBe(2145);
  });
  it("a genuine Live top-up counts in Live only", () => {
    const withLive = [...rows, { amount: 125, reason: "topup", created_at: "", livemode: true }];
    expect(balanceOf(rowsForMode(withLive, true))).toBe(145);
    expect(balanceOf(rowsForMode(withLive, false))).toBe(2145);
  });
});
