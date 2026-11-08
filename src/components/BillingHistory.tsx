import { Download, Eye, ReceiptText, Wallet, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingHistory({ part = "history" }: { part?: "summary" | "history" }) {
  return (
    <section id={part === "summary" ? "current-billing" : "billing-history"} className="mt-10 scroll-mt-24 border-t border-border pt-8">
      {part === "summary" ? <>
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Wallet className="h-6 w-6 text-primary" />Current billing</h2>
      <dl className="mt-5 grid gap-6 border-y border-border py-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-muted-foreground">Credits remaining</dt>
          <dd className="mt-2 font-display text-3xl font-bold text-primary" aria-label="Credit balance unavailable">—</dd>
          <dd className="mt-2 text-xs text-muted-foreground">Balance unavailable · Credit tracking not connected</dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Activity className="h-4 w-4" />Credits used · Last 30 days</dt>
          <dd className="mt-2 font-display text-3xl font-bold" aria-label="Thirty-day usage unavailable">—</dd>
          <dd className="mt-2 text-xs text-muted-foreground">Usage unavailable · Credit tracking not connected</dd>
        </div>
      </dl>
      <h3 className="mt-6 text-lg font-bold">Usage · Last 30 days</h3>
      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-muted-foreground">
            <tr><th scope="col" className="px-4 py-3 font-semibold">Activity / Date</th><th scope="col" className="px-4 py-3 text-right font-semibold">Credits used</th></tr>
          </thead>
          <tbody><tr><td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">Usage records will appear once credit tracking is connected.</td></tr></tbody>
        </table>
      </div>
      </> : <>
      <h2 id="billing-history-title" className="mt-8 flex items-center gap-2 text-2xl font-bold">
        <ReceiptText className="h-6 w-6 text-primary" />Billing history
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">Payments are not connected yet. Your purchases and invoices will appear here after Stripe setup.</p>
      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Description / Date</th>
              <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No billing records yet.</td></tr>
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-3" aria-describedby="invoice-status">
        <Button variant="outline" disabled><Eye className="h-4 w-4" />View invoice</Button>
        <Button variant="outline" disabled><Download className="h-4 w-4" />Download invoice</Button>
      </div>
      <p id="invoice-status" className="mt-2 text-xs text-muted-foreground">Invoice actions become available for completed purchases.</p>
      </>}
    </section>
  );
}