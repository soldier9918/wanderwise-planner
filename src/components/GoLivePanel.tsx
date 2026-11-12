import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Report = {
  isolation: boolean; db_live: boolean; stripe_mode_live: boolean; secrets_ok: boolean; done?: boolean; can_activate?: boolean;
  audit: { admin_id: string; activated_at: string; adjustments: number } | null;
  permissions: { name: string; ok: boolean; grant: string }[]; prices: { creator: string | null; pro: string | null };
  problems: string[]; adjustments?: number; error?: string;
};

async function call(body: object): Promise<Report> {
  const { data, error } = await supabase.functions.invoke("activate-live-billing", { body });
  if (error) {
    const ctx = await (error as any).context?.json?.().catch(() => null);
    if (ctx?.problems) return ctx;
    throw new Error(ctx?.error ?? error.message);
  }
  return data;
}

const Row = ({ ok, label }: { ok: boolean; label: string }) => (
  <li className="flex gap-2 text-sm"><span className={ok ? "text-accent" : "text-destructive"}>{ok ? "✓" : "✗"}</span>{label}</li>
);

export default function GoLivePanel() {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ["go-live"], queryFn: () => call({ action: "check" }) });
  const r = q.data;

  const activate = async () => {
    setBusy(true);
    try {
      const res = await call({ action: "activate", confirm: text });
      if (res.error) toast.error(res.error); else toast.success("Live billing is on.");
      qc.setQueryData(["go-live"], res);
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Checking Live readiness…</p>;
  if (q.error || !r) return <p className="text-sm text-destructive">{(q.error as Error)?.message ?? "Couldn't check."}</p>;

  if (r.db_live || r.done) return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-display text-lg font-bold text-accent">Live billing is active</p>
      {r.audit && <p className="text-sm text-muted-foreground">Activated {new Date(r.audit.activated_at).toLocaleString("en-GB")} · {r.audit.adjustments} balance adjustments</p>}
      <p className="mt-2 text-sm">This switch can't be used again.</p>
    </div>
  );

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <p className="font-display text-lg font-bold">Go Live</p>
      <ul className="space-y-1">
        <Row ok label="You are signed in as an admin" />
        <Row ok={r.isolation} label="Sandbox/Live credit separation installed" />
        <Row ok={r.secrets_ok || r.permissions.length > 0} label="Four Stripe Live settings saved" />
        {r.permissions.map((p) => <Row key={p.name} ok={p.ok} label={`Live key can use ${p.grant.split(":")[0]}`} />)}
        <Row ok={!r.problems.some((p) => p.startsWith("Creator"))} label={`Creator price: ${r.prices.creator ?? "not found"}`} />
        <Row ok={!r.problems.some((p) => p.startsWith("Pro"))} label={`Pro price: ${r.prices.pro ?? "not found"}`} />
        <Row ok={r.stripe_mode_live} label="Server set to Live (STRIPE_MODE=live)" />
      </ul>
      {r.problems.length > 0 && (
        <div className="rounded-md border border-destructive/40 p-3 text-sm">
          <p className="font-semibold">Fix before activating:</p>
          <ul className="list-disc pl-5">{r.problems.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" placeholder="Type ACTIVATE LIVE" value={text} onChange={(e) => setText(e.target.value)} disabled={!r.can_activate} />
        <Button onClick={activate} disabled={!r.can_activate || text.trim() !== "ACTIVATE LIVE" || busy}>{busy ? "Activating…" : "Activate Live billing"}</Button>
        <Button variant="secondary" onClick={() => q.refetch()} disabled={q.isFetching}>Re-check</Button>
      </div>
    </div>
  );
}
