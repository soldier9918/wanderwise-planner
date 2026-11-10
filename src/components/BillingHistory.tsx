import { useState } from "react";
import { ChevronDown, ReceiptText, Wallet, Activity } from "lucide-react";
import InvoiceTable from "@/components/InvoiceTable";
import { REASON_LABEL, used30d, useAccount } from "@/lib/account";
import { gbp, gbpValueOf } from "@/lib/topups";
import { paidByLedgerKey, useBillingRecords } from "@/lib/billingRecords";

const money = (a: number, c: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: (c || "gbp").toUpperCase() }).format(a / 100);

export default function BillingHistory({ part = "history" }: { part?: "summary" | "history" }) {
  const { data: acct } = useAccount();
  const { data: records } = useBillingRecords();
  const [open, setOpen] = useState(false);
  const recent = (acct?.ledger ?? []).filter((l) => Date.now() - new Date(l.created_at).getTime() <= 30 * 864e5);
  // Bank-statement style: balance after each entry (ledger is newest first).
  const after: number[] = [];
  recent.reduce((bal, l) => { after.push(bal); return bal - l.amount; }, acct?.balance ?? 0);
  // Money actually paid, matched to ledger rows by Stripe id.
  const paidMap = paidByLedgerKey(records ?? []);
  const spentGBP = recent.reduce((n, l) => n + (l.amount < 0 ? gbpValueOf(l.amount) : 0), 0);
  return (
    <section id={part === "summary" ? "current-billing" : "billing-history"} className="mt-10 scroll-mt-24 border-t border-border pt-8">
      {part === "summary" ? <>
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Wallet className="h-6 w-6 text-primary" />Current billing</h2>
      <dl className="mt-5 grid gap-6 border-y border-border py-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-muted-foreground">Credits remaining</dt>
          <dd className="mt-2 font-display text-3xl font-bold text-primary">{acct ? acct.balance : "—"}</dd>
          <dd className="mt-2 text-xs text-muted-foreground">{acct?.ledger.some((l) => l.reason === "starter") ? "🎉 Includes your 30 starter credits" : "Credits on your account"}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Activity className="h-4 w-4" />Credits used · Last 30 days</dt>
          <dd className="mt-2 font-display text-3xl font-bold">{acct ? used30d(acct.ledger) : "—"}</dd>
          <dd className="mt-2 text-xs text-muted-foreground">Credits spent in the last 30 days · ≈ {gbp(spentGBP)} at £1 = 25 credits</dd>
        </div>
      </dl>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-6 flex w-full items-center justify-between text-left text-lg font-bold">
        <span>Usage · Last 30 days <span className="text-sm font-normal text-muted-foreground">({recent.length}) · {gbp(spentGBP)} spent</span></span>
        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-muted-foreground">
            <tr><th scope="col" className="px-4 py-3 font-semibold">Activity / Date</th><th scope="col" className="px-4 py-3 text-right font-semibold">Credits in / out</th><th scope="col" className="px-4 py-3 text-right font-semibold">Money</th><th scope="col" className="px-4 py-3 text-right font-semibold">Balance</th></tr>
          </thead>
          <tbody>{recent.length ? recent.map((l, i) => {
            const paid = l.stripe_invoice_id ? paidMap.get(l.stripe_invoice_id) : undefined;
            return (
              <tr key={i} className="border-b border-border last:border-0"><td className="px-4 py-3">{REASON_LABEL[l.reason] ?? l.reason.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())}<span className="block text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</span></td><td className={`px-4 py-3 text-right font-semibold ${l.amount > 0 ? "text-accent" : ""}`}>{l.amount > 0 ? `+${l.amount}` : l.amount}</td><td className={`px-4 py-3 text-right ${paid ? "text-accent" : l.amount < 0 ? "" : "text-muted-foreground"}`}>{paid ? `+${money(paid.amount, paid.currency)}` : l.amount < 0 ? gbp(gbpValueOf(l.amount)) : "—"}</td><td className="px-4 py-3 text-right text-muted-foreground">{after[i]}</td></tr>
            );
          }) : <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No credit activity in the last 30 days.</td></tr>}</tbody>
        </table>
      </div>}
      {open && <p className="mt-2 text-xs text-muted-foreground">Money lines marked with + are payments you actually made. Credit lines are valued at £1 = 25 credits (the top-up rate). Free credits have no money value, shown as —.</p>}
      </> : <>
      <h2 id="billing-history-title" className="mt-8 flex items-center gap-2 text-2xl font-bold">
        <ReceiptText className="h-6 w-6 text-primary" />Billing history
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">Your invoices and top-up receipts, newest first.</p>
      <InvoiceTable />
      </>}
    </section>
  );
}
