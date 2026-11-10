import { describe, expect, it } from "vitest";
import { moneyOfLedgerRow, paidByLedgerKey, type BillingRecord } from "./billingRecords";

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

describe("money line for each credit line", () => {
  const paid = paidByLedgerKey([
    rec({}),
    rec({ id: "cs_1", kind: "receipt", amount: 500, ledger_keys: ["cs_1"] }),
  ]);

  it("shows credits spent as a negative money line", () => {
    expect(moneyOfLedgerRow({ amount: -5, reason: "thumbnail", stripe_invoice_id: null }, paid))
      .toEqual({ sign: -1, pence: 20, currency: "gbp" });
  });
  it("shows a matched payment as positive money actually paid", () => {
    expect(moneyOfLedgerRow({ amount: 600, reason: "subscription", stripe_invoice_id: "in_1" }, paid))
      .toEqual({ sign: 1, pence: 1900, currency: "gbp" });
  });
  it("shows a top-up as positive money even before the receipt loads", () => {
    expect(moneyOfLedgerRow({ amount: 125, reason: "topup", stripe_invoice_id: "cs_missing" }, paid))
      .toEqual({ sign: 1, pence: 500, currency: "gbp" });
  });
  it("shows a plan month as positive money even before the invoice loads", () => {
    expect(moneyOfLedgerRow({ amount: 600, reason: "subscription", stripe_invoice_id: null }, paid))
      .toEqual({ sign: 1, pence: 1900, currency: "gbp" });
    expect(moneyOfLedgerRow({ amount: 2000, reason: "subscription", stripe_invoice_id: null }, paid))
      .toEqual({ sign: 1, pence: 4900, currency: "gbp" });
  });
  it("gives free credits no money line", () => {
    for (const reason of ["starter", "referral", "coupon", "admin"]) {
      expect(moneyOfLedgerRow({ amount: 30, reason, stripe_invoice_id: null }, paid)).toBeNull();
    }
  });
});
