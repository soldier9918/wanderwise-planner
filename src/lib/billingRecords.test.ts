import { describe, expect, it } from "vitest";
import { paidByLedgerKey, type BillingRecord } from "./billingRecords";

const rec = (over: Partial<BillingRecord>): BillingRecord => ({
  id: "in_1", kind: "invoice", number: "X-1", created: 0, description: "Creator Plan",
  amount: 1900, currency: "gbp", status: "paid", view_url: null, pdf_url: null, ledger_keys: ["in_1"],
  ...over,
});

describe("matching payments to credit lines", () => {
  it("maps a paid invoice to the ledger key Vydora stored", () => {
    const map = paidByLedgerKey([rec({})]);
    expect(map.get("in_1")).toEqual({ amount: 1900, currency: "gbp" });
  });
  it("maps a top-up receipt by session id or invoice id", () => {
    const map = paidByLedgerKey([rec({ id: "cs_1", kind: "receipt", amount: 500, ledger_keys: ["cs_1", "in_2"] })]);
    expect(map.get("cs_1")?.amount).toBe(500);
    expect(map.get("in_2")?.amount).toBe(500);
  });
  it("never counts unpaid, void or refunded money as paid", () => {
    const map = paidByLedgerKey([
      rec({ status: "open" }), rec({ status: "void" }), rec({ status: "refunded" }), rec({ status: "uncollectible" }),
    ]);
    expect(map.size).toBe(0);
  });
});
