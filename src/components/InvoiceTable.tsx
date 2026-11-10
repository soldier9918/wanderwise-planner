import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type BillingRecord = {
  id: string; kind: "invoice" | "receipt"; number: string | null; created: number; description: string;
  amount: number; currency: string; status: string; view_url: string | null; pdf_url: string | null;
};
const PAGE = 10;
const money = (a: number, c: string) => new Intl.NumberFormat("en-GB", { style: "currency", currency: (c || "gbp").toUpperCase() }).format(a / 100);
const STATUS: Record<string, string> = { paid: "Paid", open: "Unpaid", void: "Void", uncollectible: "Failed", refunded: "Refunded", unpaid: "Unpaid" };

export default function InvoiceTable() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [portal, setPortal] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["billing-history", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("billing-history", { body: {} });
      if (error) throw error;
      return (data?.records ?? []) as BillingRecord[];
    },
  });
  const openPortal = async () => {
    setPortal(true);
    const { data, error } = await supabase.functions.invoke("customer-portal", { body: {} });
    if (error || !data?.url) { toast.error("Couldn't open invoice management."); setPortal(false); return; }
    window.location.href = data.url;
  };
  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);
  const action = (url: string | null, icon: JSX.Element, label: string) => url
    ? <Button asChild variant="outline" size="sm"><a href={url} target="_blank" rel="noopener noreferrer">{icon}{label}</a></Button>
    : <Button variant="outline" size="sm" onClick={openPortal} disabled={portal} title="Not available here — open billing portal">{icon}{label}</Button>;
  return (
    <>
      <div className="mt-5 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Description / Date</th>
              <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr>
            : error ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Couldn't load billing history. Please refresh.</td></tr>
            : shown.length ? shown.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs font-semibold">{r.kind === "invoice" ? "Invoice" : "Receipt"}</span>{r.description}
                  <span className="block text-xs text-muted-foreground">{new Date(r.created * 1000).toLocaleDateString("en-GB")}{r.number && ` · #${r.number}`}</span>
                </td>
                <td className="px-4 py-3 font-semibold">{money(r.amount, r.currency)}</td>
                <td className={`px-4 py-3 ${r.status === "paid" ? "text-accent" : "text-muted-foreground"}`}>{STATUS[r.status] ?? r.status}</td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2">
                  {action(r.view_url, <Eye className="h-4 w-4" />, r.kind === "invoice" ? "View invoice" : "View receipt")}
                  {r.kind === "invoice" && action(r.pdf_url, <Download className="h-4 w-4" />, "Download invoice")}
                </div></td>
              </tr>
            )) : <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No billing records yet.</td></tr>}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="mt-3 flex items-center justify-end gap-3 text-sm">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Newer</Button>
        <span className="text-muted-foreground">Page {page + 1} of {pages}</span>
        <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Older</Button>
      </div>}
    </>
  );
}
