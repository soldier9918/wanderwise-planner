import { useEffect, useState } from "react";
import { CreditCard, Save, Ticket, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TOP_UP_AMOUNTS, autoTopUpSchema, gbpAmount } from "@/lib/topups";

const initial = { enabled: false, threshold: "20", amount: "10", limitEnabled: false, monthlyLimit: "50" };
const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);

export default function TopUpSettings() {
  const { user } = useAuth();
  const storageKey = `vydora:topup-draft:${user?.id ?? "guest"}`;
  const [selected, setSelected] = useState("5");
  const [custom, setCustom] = useState("");
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const purchase = gbpAmount.safeParse(selected === "custom" ? custom : selected);

  useEffect(() => {
    setDraft(initial);
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? autoTopUpSchema.safeParse(JSON.parse(raw)) : null;
      if (parsed?.success) setDraft({ enabled: parsed.data.enabled === true, limitEnabled: parsed.data.limitEnabled === true, threshold: String(parsed.data.threshold), amount: String(parsed.data.amount), monthlyLimit: String(parsed.data.monthlyLimit) });
    } catch { /* A missing or unavailable local draft is safe to ignore. */ }
  }, [storageKey]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const result = autoTopUpSchema.safeParse(draft);
    if (!result.success) { setError(result.error.issues[0]?.message ?? "Check your amounts."); return; }
    try {
      localStorage.setItem(storageKey, JSON.stringify(result.data));
      setError("");
      toast.success("Draft saved on this device. Automatic payments are not active.");
    } catch { setError("Couldn't save on this device. Please try again."); }
  };

  return (
    <section id="top-ups" className="mt-12 scroll-mt-24 border-t border-border pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-bold"><Wallet className="h-6 w-6 text-primary" />Pay as you go</h2>
        <span className="text-sm font-semibold text-accent">No subscription required</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Payments are not connected yet. Credit amounts per £ will be confirmed before purchases become available.</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="text-xl font-bold">One-time top-up</h3>
          <div role="group" aria-label="Top-up amount" className="mt-4 grid grid-cols-3 gap-2">
            {TOP_UP_AMOUNTS.map((amount) => (
              <Button key={amount} variant={selected === String(amount) ? "default" : "outline"} aria-pressed={selected === String(amount)} onClick={() => setSelected(String(amount))}>
                {money(amount).replace(".00", "")}
              </Button>
            ))}
            <Button className="col-span-3" variant={selected === "custom" ? "default" : "outline"} aria-pressed={selected === "custom"} onClick={() => setSelected("custom")}>Custom amount</Button>
          </div>
          {selected === "custom" && <div className="mt-4 grid gap-2">
            <Label htmlFor="custom-topup">Custom top-up (£) — minimum £5</Label>
            <Input id="custom-topup" type="number" min={5} step="0.01" value={custom} onChange={(e) => setCustom(e.target.value)} aria-invalid={!purchase.success} />
            {!purchase.success && <p role="alert" className="text-sm text-destructive">{purchase.error.issues[0]?.message}</p>}
          </div>}
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span>Top-up total</span><strong className="text-xl text-primary">{purchase.success ? money(purchase.data) : "—"}</strong></div>
          <Button disabled className="mt-4 w-full"><CreditCard className="h-4 w-4" />Top up — available after Stripe setup</Button>
        </div>
        <form onSubmit={save} className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="auto-topup" className="text-xl font-bold">Auto top-up</Label>
            <Switch id="auto-topup" checked={draft.enabled} onCheckedChange={(enabled) => setDraft({ ...draft, enabled })} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Draft only · No card saved · No automatic charges</p>
          <div className="mt-5 grid gap-4">
            <div className="grid gap-2"><Label htmlFor="topup-threshold">When credit balance goes below (credits)</Label><Input id="topup-threshold" type="number" min={1} step={1} disabled={!draft.enabled} value={draft.threshold} onChange={(e) => setDraft({ ...draft, threshold: e.target.value })} /></div>
            <div className="grid gap-2"><Label htmlFor="auto-amount">Automatically top up (£) — minimum £5</Label><Input id="auto-amount" type="number" min={5} step="0.01" disabled={!draft.enabled} value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} /></div>
            <div className="flex items-center justify-between gap-3"><Label htmlFor="monthly-limit-toggle">Set a monthly auto top-up limit</Label><Switch id="monthly-limit-toggle" disabled={!draft.enabled} checked={draft.limitEnabled} onCheckedChange={(limitEnabled) => setDraft({ ...draft, limitEnabled })} /></div>
            {draft.limitEnabled && <div className="grid gap-2"><Label htmlFor="monthly-limit">Monthly spending limit (£)</Label><Input id="monthly-limit" type="number" min={5} step="0.01" disabled={!draft.enabled} value={draft.monthlyLimit} onChange={(e) => setDraft({ ...draft, monthlyLimit: e.target.value })} /></div>}
          </div>
          {draft.enabled && <p className="mt-4 text-sm text-muted-foreground">Planned: £{draft.amount || "—"} when balance falls below {draft.threshold || "—"} credits{draft.limitEnabled ? `, capped at £${draft.monthlyLimit || "—"} per month` : ""}.</p>}
          {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="outline" className="mt-5 w-full"><Save className="h-4 w-4" />Save draft settings</Button>
        </form>
      </div>
      <div className="mt-8 border-t border-border pt-6">
        <h3 className="flex items-center gap-2 text-xl font-bold"><Ticket className="h-5 w-5 text-primary" />Redeem coupon</h3>
        <p id="coupon-status" className="mt-2 text-sm text-muted-foreground">Coupon redemption is coming soon. No credits will be added until coupon rewards are configured.</p>
        <div className="mt-4 grid max-w-xl gap-2">
          <Label htmlFor="coupon-code">Coupon code</Label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input id="coupon-code" placeholder="Enter coupon code" maxLength={100} autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby="coupon-status" className="min-w-0 flex-1" />
            <Button type="button" disabled><Ticket className="h-4 w-4" />Redeem</Button>
          </div>
        </div>
      </div>
    </section>
  );
}