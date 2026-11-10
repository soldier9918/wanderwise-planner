import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
