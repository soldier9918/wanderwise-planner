import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CREDITS_PER_GBP, gbpValueOf } from "@/lib/topups";

export type BillingRecord = {
  id: string; kind: "invoice" | "receipt"; number: string | null; created: number; description: string;
  amount: number; currency: string; status: string; view_url: string | null; pdf_url: string | null;
  /** Stripe ids this payment can be matched to in credit_ledger.stripe_invoice_id. */
  ledger_keys?: string[];
};

/** The signed-in customer's own Stripe invoices and top-up receipts, newest first. */
export function useBillingRecords() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["billing-history", user?.id],
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("billing-history", { body: {} });
      if (error) throw error;
      return (data?.records ?? []) as BillingRecord[];
    },
  });
}

/**
 * stripe id -> the money actually paid for that payment. Only verified, paid records count;
 * unpaid, void or refunded ones must never be shown as money spent.
 */
export function paidByLedgerKey(records: BillingRecord[]) {
  const map = new Map<string, { amount: number; currency: string }>();
  for (const r of records) {
    if (r.status !== "paid") continue;
    for (const k of r.ledger_keys ?? []) if (!map.has(k)) map.set(k, { amount: r.amount, currency: r.currency });
  }
  return map;
}

/** What a plan month costs, keyed by the credits it grants. Only a stand-in until the Stripe record loads. */
export const PLAN_MONTH_GBP: Record<number, number> = { 600: 19, 2000: 49 };

export type MoneyLine = { sign: 1 | -1; pence: number; currency: string };

/**
 * Money for one credit line: "-" for credits spent, "+" for money paid.
 * Payments use the amount Stripe confirms was paid; a top-up not yet loaded falls back to
 * the exact £1 = 25 credits rate, a plan month to its published price. Free credits have no money.
 */
export function moneyOfLedgerRow(
  row: { amount: number; reason: string; stripe_invoice_id?: string | null },
  paid: Map<string, { amount: number; currency: string }>,
): MoneyLine | null {
  if (row.amount < 0) return { sign: -1, pence: Math.round(gbpValueOf(row.amount) * 100), currency: "gbp" };
  const matched = row.stripe_invoice_id ? paid.get(row.stripe_invoice_id) : undefined;
  if (matched) return { sign: 1, pence: matched.amount, currency: matched.currency };
  if (row.reason === "topup") return { sign: 1, pence: Math.round((row.amount / CREDITS_PER_GBP) * 100), currency: "gbp" };
  if (row.reason === "subscription" && PLAN_MONTH_GBP[row.amount]) {
    return { sign: 1, pence: PLAN_MONTH_GBP[row.amount] * 100, currency: "gbp" };
  }
  return null;
}

const PAID_REASONS = new Set(["topup", "subscription", "purchase"]);

/**
 * How many credits of each spend came from paid credits. Free credits (starter, referral,
 * coupon, admin) are used first, so spending them costs the customer no money.
 * Takes the ledger newest first; returns paid credits per row, same order.
 */
export function paidCreditsPerRow(ledger: { amount: number; reason: string }[]): number[] {
  const out = new Array(ledger.length).fill(0);
  let free = 0, paid = 0;
  for (let i = ledger.length - 1; i >= 0; i--) {
    const r = ledger[i];
    if (r.amount > 0) { if (PAID_REASONS.has(r.reason)) paid += r.amount; else free += r.amount; continue; }
    let need = -r.amount;
    const fromFree = Math.min(free, need); free -= fromFree; need -= fromFree;
    const fromPaid = Math.min(paid, need); paid -= fromPaid;
    out[i] = fromPaid;
  }
  return out;
}
