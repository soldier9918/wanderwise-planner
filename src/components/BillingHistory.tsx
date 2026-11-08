import { Download, Eye, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingHistory() {
  return (
    <section id="billing-history" className="mt-10 scroll-mt-24 border-t border-border pt-8" aria-labelledby="billing-history-title">
      <h2 id="billing-history-title" className="flex items-center gap-2 text-2xl font-bold">
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
    </section>
  );
}