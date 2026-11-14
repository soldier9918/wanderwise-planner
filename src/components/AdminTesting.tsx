import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Minus, Plus, Shield } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/lib/account";
import { validCreditAdjustment } from "@/lib/adminTesting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminTesting() {
  const { data: account } = useAccount();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("30");
  const [busy, setBusy] = useState(false);
  if (!account?.adminAccess) return null;
  const update = async (mode?: string, delta?: number) => {
    setBusy(true);
    try {
      const { error } = mode !== undefined
        ? await supabase.rpc("admin_set_test_mode", { _mode: mode })
        : await supabase.rpc("admin_adjust_test_credits", { _amount: delta ?? 0 });
      if (error) throw error;
      await qc.invalidateQueries();
      toast.success(mode === "admin" ? "Unlimited admin access restored" : mode ? `Testing ${mode} plan` : "Test credits updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Couldn't update test settings"); }
    finally { setBusy(false); }
  };
  return <section aria-label="Subscription testing" className="border-t border-border bg-muted/30">
    <div className="container flex flex-wrap items-center gap-3 py-3">
      <Link to="/admin-kb20" className="inline-flex items-center gap-2 text-sm font-semibold"><Shield className="h-4 w-4 text-primary" />Admin testing</Link>
      <Select value={account.testMode ?? "admin"} onValueChange={(v) => void update(v)} disabled={busy}>
        <SelectTrigger aria-label="Test subscription" className="h-9 w-40"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="admin">ADMIN · Unlimited</SelectItem><SelectItem value="free">FREE</SelectItem><SelectItem value="creator">CREATOR</SelectItem><SelectItem value="pro">PRO</SelectItem></SelectContent>
      </Select>
      {account.testMode && <>
        <span className="text-sm font-semibold tabular-nums">{account.balance} test credits</span>
        <Label htmlFor="test-credit-amount" className="sr-only">Test credit amount</Label>
        <Input id="test-credit-amount" type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9 w-24" />
        <Button size="icon" variant="outline" className="h-9 w-9" aria-label="Add test credits" title="Add test credits" disabled={busy || !validCreditAdjustment(amount) || Number(amount) < 1} onClick={() => void update(undefined, Number(amount))}><Plus className="h-4 w-4" /></Button>
        <Button size="icon" variant="outline" className="h-9 w-9" aria-label="Subtract test credits" title="Subtract test credits" disabled={busy || !validCreditAdjustment(amount) || Number(amount) < 1 || Number(amount) > account.balance} onClick={() => void update(undefined, -Number(amount))}><Minus className="h-4 w-4" /></Button>
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => void update("admin")}><Shield className="mr-1 h-4 w-4" />Return to ADMIN</Button>
      </>}
      <p className="w-full text-xs text-muted-foreground">Test plans and credits only. Your real subscription, payments and credit history stay unchanged. AI generation still uses service resources.</p>
    </div>
  </section>;
}