import { useEffect, useState } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAccount, STARTER_CREDITS } from "@/lib/account";
import { FREE_VOICES, FREE_MAX_SECONDS, FREE_MAX_SCENES } from "@/lib/tiers";

const FREE_MINUTES = FREE_MAX_SECONDS / 60;

const PLANS = [
  {
    name: "Free",
    price: "£0",
    credits: `${STARTER_CREDITS} credits / month`,
    perks: [
      `${FREE_VOICES.length} narrators`,
      `Videos up to ${FREE_MINUTES} minutes · ${FREE_MAX_SCENES} scenes`,
      "720p HD · music, SFX & captions free",
      "Free downloads · no watermark",
    ],
  },
  { name: "Creator", tier: "creator", price: "£19", credits: "600 credits / month", perks: ["All narrators unlocked", "Videos up to 20 minutes · 720p HD", "Up to 22 scenes", "Free downloads · no watermark"] },
  { name: "Pro", tier: "pro", price: "£49", credits: "2,000 credits / month", perks: ["Everything in Creator", "Videos up to 60 minutes · 50 scenes", "1080p Full HD exports", "3× more credits"], featured: true },
];

export default function SubscriptionPlans() {
  const { data: acct } = useAccount();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const sub = acct?.subscription;
  const active = sub && (sub.status === "active" || sub.status === "trialing" || sub.status === "past_due") ? sub : null;
  const current = active ? (active.plan_tier === "pro" ? "Pro" : "Creator") : "Free";
  // Scheduled plan changes are read live from Stripe's subscription schedule.
  const { data: status } = useQuery({
    queryKey: ["subscription-status", active?.plan_tier, active?.current_period_end],
    enabled: !!active,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      type Status = { cancel_at: string | null; pending: { tier: string; effective_at: string } | null };
      // Send a fresh sign-in token; if it had just expired (401), refresh once and retry.
      const call = async (token?: string) =>
        supabase.functions.invoke("subscription-status", { body: {}, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      const { data: { session } } = await supabase.auth.getSession();
      let res = await call(session?.access_token);
      if ((res.error as { context?: Response } | null)?.context?.status === 401) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        res = await call(refreshed.session?.access_token);
      }
      // Pending-change details are optional: never break the page if they can't load.
      if (res.error) return { cancel_at: null, pending: null } as Status;
      return res.data as Status;
    },
  });
  const pending = active ? status?.pending ?? null : null;
  const cancelAt = active ? status?.cancel_at ?? null : null;
  const pendingName = pending ? (pending.tier === "pro" ? "Pro" : "Creator") : null;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("checkout");
    if (q) {
      params.delete("checkout");
      const rest = params.toString();
      window.history.replaceState(window.history.state, "", window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash);
    }
    if (q === "success") {
      toast.success("Payment received. Your plan and credits will appear in a moment.");
      const t = setInterval(() => qc.invalidateQueries({ queryKey: ["account"] }), 3000);
      setTimeout(() => clearInterval(t), 30000);
      return () => clearInterval(t);
    }
    if (q === "cancelled") toast("Checkout cancelled — you weren't charged.");
  }, [qc]);

  // Reset spinners when the browser restores this page from cache (e.g. Back from Stripe).
  useEffect(() => {
    const reset = (e: PageTransitionEvent) => { if (e.persisted) { setBusy(null); qc.invalidateQueries({ queryKey: ["account"] }); qc.invalidateQueries({ queryKey: ["subscription-status"] }); } };
    const onVisible = () => { if (document.visibilityState === "visible") setBusy(null); };
    window.addEventListener("pageshow", reset);
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.removeEventListener("pageshow", reset); document.removeEventListener("visibilitychange", onVisible); };
  }, [qc]);

  const go = async (fn: "create-checkout" | "customer-portal", key: string, body?: object) => {
    setBusy(key);
    const { data, error } = await supabase.functions.invoke(fn, { body: body ?? {} });
    if (error || !data?.url) {
      let msg = "Something went wrong. Please try again.";
      try { msg = (await (error as { context?: Response })?.context?.json())?.error ?? data?.error ?? msg; } catch { /* keep default */ }
      toast.error(msg); setBusy(null); return;
    }
    window.location.href = data.url;
  };
  return (
    <section id="subscriptions" className="mt-10 scroll-mt-24 border-t border-border pt-8">
      <h2 className="flex items-center gap-2 text-2xl font-bold"><Crown className="h-6 w-6 text-primary" />Subscriptions</h2>
      <p className="mt-2 text-sm text-muted-foreground">Current plan: <span className="font-semibold text-foreground">{current}</span>
        {active?.current_period_end && <> · {active.cancel_at_period_end ? "ends" : "renews"} {fmtDate(active.current_period_end)}</>}
        {active?.status === "past_due" && <span className="text-primary"> · payment overdue</span>}</p>
      {cancelAt && <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium">
        Cancellation scheduled — {fmtDate(cancelAt)}.
        <span className="block font-normal text-muted-foreground">You keep {current} features and all your credits until then. Plan changes are paused while cancellation is pending.</span>
        <Button size="sm" className="mt-3" disabled={!!busy} onClick={() => go("customer-portal", "reverse")}>{busy === "reverse" && <Loader2 className="h-4 w-4 animate-spin" />}Reverse cancellation</Button></div>}
      {pending && <p className="mt-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-medium">
        Scheduled downgrade: {current} → {pendingName} on {fmtDate(pending.effective_at)}.
        <span className="block font-normal text-muted-foreground">You keep {current} features and all your credits until then.</span></p>}
      {active && <Button className="mt-4" variant="outline" disabled={!!busy} onClick={() => go("customer-portal", "portal")}>{busy === "portal" && <Loader2 className="h-4 w-4 animate-spin" />}Manage subscription & invoices</Button>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`flex flex-col rounded-xl border bg-card p-6 ${p.featured ? "border-primary" : "border-border"}`}>
            <p className="font-semibold text-muted-foreground">{p.name}</p>
            <p className="mt-2 font-display text-3xl font-extrabold">{p.price}<span className="text-base font-semibold text-muted-foreground">{p.name === "Free" ? "" : "/mo"}</span></p>
            <p className="mt-1 font-semibold text-primary">{p.credits}</p>
            <ul className="mt-4 mb-5 grid flex-1 content-start gap-2 text-sm">
              {p.perks.map((k) => <li key={k} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{k}</li>)}
            </ul>
            {p.name === "Free" ? (
              <Button className="mt-auto w-full" variant="outline" disabled>{active ? "Free tier" : "Current plan"}</Button>
            ) : (
              current === p.name ? <Button className="mt-auto w-full" variant="outline" disabled>Current plan</Button>
              : cancelAt ? <Button className="mt-auto w-full" variant="outline" disabled>Cancellation scheduled</Button>
              : pendingName === p.name ? <Button className="mt-auto w-full" variant="outline" disabled>Downgrade scheduled</Button>
              : <Button className="mt-auto w-full" variant={p.featured ? "default" : "outline"} disabled={!!busy}
                  onClick={() => active ? go("customer-portal", "portal") : go("create-checkout", p.tier!, { plan: p.tier })}>
                  {busy === p.tier && <Loader2 className="h-4 w-4 animate-spin" />}{active ? `Switch to ${p.name}` : `Subscribe to ${p.name}`}</Button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
