import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { stripe } from "../_shared/stripe.ts";

// Lists the signed-in user's own Stripe invoices and top-up receipts. The customer id
// comes only from the server-side user_subscriptions row, never from the client.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { data: sub } = await adminClient().from("user_subscriptions").select("stripe_customer_id").eq("user_id", auth.user.id).maybeSingle();
    const customer = sub?.stripe_customer_id;
    if (!customer) return json({ records: [] });

    const records: Record<string, unknown>[] = [];
    for await (const inv of stripe.invoices.list({ customer, limit: 100 })) {
      if (inv.status === "draft") continue;
      const line = inv.lines?.data?.[0];
      records.push({
        id: inv.id, kind: "invoice", number: inv.number, created: inv.created,
        description: line?.description ?? inv.description ?? "Subscription",
        amount: inv.status === "paid" ? inv.amount_paid : inv.amount_due, currency: inv.currency,
        status: inv.status, view_url: inv.hosted_invoice_url ?? null, pdf_url: inv.invoice_pdf ?? null,
        ledger_keys: [inv.id],
      });
      if (records.length >= 300) break;
    }
    let n = 0;
    for await (const s of stripe.checkout.sessions.list({ customer, limit: 100, expand: ["data.payment_intent.latest_charge"] })) {
      if (++n > 300) break;
      if (s.mode !== "payment" || s.metadata?.app !== "vydora") continue;
      if (s.status !== "complete") continue;
      const pi = s.payment_intent as { latest_charge?: { receipt_url?: string; receipt_number?: string; refunded?: boolean } } | null;
      const ch = pi && typeof pi === "object" ? pi.latest_charge : undefined;
      const credits = s.metadata?.credits;
      const sessionInvoice = typeof s.invoice === "string" ? s.invoice : s.invoice?.id;
      records.push({
        id: s.id, kind: "receipt", number: ch?.receipt_number ?? null, created: s.created,
        description: `Credit top-up${credits ? ` · ${credits} credits` : ""}`,
        amount: s.amount_total ?? 0, currency: s.currency,
        status: ch?.refunded ? "refunded" : s.payment_status, view_url: ch?.receipt_url ?? null, pdf_url: null,
        // The ledger stores either the invoice id or, failing that, the session id for a top-up.
        ledger_keys: [s.id, ...(sessionInvoice ? [sessionInvoice] : [])],
      });
    }
    records.sort((a, b) => (b.created as number) - (a.created as number));
    return json({ records });
  } catch (e) {
    console.error("billing-history", e);
    return json({ error: "Couldn't load billing history." }, 500);
  }
});
