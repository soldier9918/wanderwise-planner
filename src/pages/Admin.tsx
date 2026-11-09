import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SiteHeader from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ADMIN_EMAIL = "samyhussain123@gmail.com";
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");

type Overview = Record<string, number> & { signups_by_day: { day: string; n: number }[] };

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
}

export default function Admin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [adjust, setAdjust] = useState<Record<string, string>>({});

  const allowed = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const role = useQuery({
    queryKey: ["admin-role", user?.id], enabled: allowed,
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" })).data === true,
  });
  const ok = allowed && role.data === true;
  const overview = useQuery({ queryKey: ["admin-overview"], enabled: ok, queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_overview"); if (error) throw error; return data as unknown as Overview; } });
  const users = useQuery({ queryKey: ["admin-users"], enabled: ok, queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_users"); if (error) throw error; return data ?? []; } });
  const videos = useQuery({ queryKey: ["admin-videos"], enabled: ok, queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_videos", { _limit: 200 }); if (error) throw error; return data ?? []; } });
  const ledger = useQuery({ queryKey: ["admin-ledger"], enabled: ok, queryFn: async () => {
    const { data, error } = await supabase.rpc("admin_ledger", { _limit: 300 }); if (error) throw error; return data ?? []; } });

  const filtered = useMemo(() => (users.data ?? []).filter((u) =>
    (!q || u.email?.toLowerCase().includes(q.toLowerCase()) || u.user_id.includes(q) || u.referral_code?.includes(q.toUpperCase())) &&
    (planFilter === "all" || (planFilter === "paid" ? u.paid_total > 0 : u.paid_total === 0))), [users.data, q, planFilter]);

  if (!allowed) return <Navigate to="/" replace />;
  if (role.isLoading) return <div className="min-h-screen bg-background" />;
  if (!ok) return <Navigate to="/" replace />;

  const o = overview.data;
  const maxDay = Math.max(1, ...(o?.signups_by_day ?? []).map((d) => d.n));
  const revenueCredits = (users.data ?? []).reduce((n, u) => n + Number(u.paid_total), 0);

  const doAdjust = async (id: string) => {
    const amt = parseInt(adjust[id] ?? "", 10);
    if (!amt) return toast.error("Enter a non-zero number of credits");
    const { error } = await supabase.rpc("admin_adjust_credits", { _user: id, _amount: amt, _note: "admin" });
    if (error) return toast.error(error.message);
    toast.success(`${amt > 0 ? "Added" : "Removed"} ${Math.abs(amt)} credits`);
    setAdjust((a) => ({ ...a, [id]: "" }));
    qc.invalidateQueries({ queryKey: ["admin-users"] }); qc.invalidateQueries({ queryKey: ["admin-ledger"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const download = (name: string, rows: Record<string, unknown>[]) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" })); a.download = name; a.click();
  };
  const refresh = () => qc.invalidateQueries({ predicate: (x) => String(x.queryKey[0]).startsWith("admin-") });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container max-w-7xl py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Admin</p>
            <h1 className="font-display text-3xl font-bold">Vydora control room</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user?.email}. Your account has no watermark or limits.</p>
          </div>
          <Button variant="outline" onClick={refresh}>Refresh</Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Users" value={o?.users ?? "…"} sub={`+${o?.users_7d ?? 0} this week · +${o?.users_30d ?? 0} in 30 days`} />
          <Stat label="Active this week" value={o?.active_7d ?? "…"} sub="signed in last 7 days" />
          <Stat label="Paying users" value={o?.paying_users ?? "…"} sub={`${revenueCredits} paid credits`} />
          <Stat label="Referrals" value={o?.referrals ?? "…"} sub="friends joined by invite" />
          <Stat label="Videos" value={o?.videos ?? "…"} sub={`+${o?.videos_7d ?? 0} this week`} />
          <Stat label="Scenes" value={o?.scenes ?? "…"} sub={`${o?.animated ?? 0} AI-animated`} />
          <Stat label="Credits issued" value={o?.credits_issued ?? "…"} />
          <Stat label="Credits spent" value={o?.credits_spent ?? "…"} />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Sign-ups, last 30 days</p>
          <div className="mt-3 flex h-28 items-end gap-1">
            {(o?.signups_by_day ?? []).map((d) => (
              <div key={d.day} title={`${d.day}: ${d.n}`} className="flex-1 rounded-t bg-primary" style={{ height: `${(d.n / maxDay) * 100}%` }} />
            ))}
            {!o?.signups_by_day?.length && <p className="text-sm text-muted-foreground">No sign-ups yet.</p>}
          </div>
        </div>

        <Tabs defaultValue="users" className="mt-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="ledger">Credit activity</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="mb-3 flex flex-wrap gap-2">
              <Input placeholder="Search email, ID or invite code" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
              <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All users</option><option value="paid">Paid</option><option value="free">Free</option>
              </select>
              <Button variant="secondary" onClick={() => download("vydora-users.csv", filtered)}>Export CSV</Button>
              <span className="self-center text-sm text-muted-foreground">{filtered.length} shown</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>{["Email", "Signed up", "Last sign-in", "Login", "Package", "Paid credits", "Balance", "Videos", "Invites", "Invited by", "Adjust credits"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.user_id} className="border-t border-border align-top">
                      <td className="px-3 py-2">
                        <p className="font-medium">{u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.referral_code} {u.is_admin && <span className="text-accent">· admin</span>} {!u.confirmed && <span className="text-destructive">· unconfirmed</span>}</p>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmt(u.created_at)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmt(u.last_sign_in_at)}</td>
                      <td className="px-3 py-2 capitalize">{u.provider}</td>
                      <td className="px-3 py-2 capitalize">{u.plan}</td>
                      <td className="px-3 py-2">{u.paid_total}</td>
                      <td className="px-3 py-2 font-semibold">{u.balance}</td>
                      <td className="px-3 py-2">{u.videos}</td>
                      <td className="px-3 py-2">{u.invites}</td>
                      <td className="px-3 py-2 text-xs">{u.referred_by_email ?? "—"}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <Input className="h-8 w-20" placeholder="+50" value={adjust[u.user_id] ?? ""} onChange={(e) => setAdjust((a) => ({ ...a, [u.user_id]: e.target.value }))} />
                          <Button size="sm" onClick={() => doAdjust(u.user_id)}>Apply</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <Button variant="secondary" className="mb-3" onClick={() => download("vydora-videos.csv", videos.data ?? [])}>Export CSV</Button>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>{["Title", "Creator", "Style", "Voice", "Format", "Quality", "Scenes", "Created"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(videos.data ?? []).map((v) => (
                    <tr key={v.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{v.title}</td><td className="px-3 py-2">{v.email}</td><td className="px-3 py-2">{v.style}</td>
                      <td className="px-3 py-2">{v.voice}</td><td className="px-3 py-2">{v.aspect_ratio}</td><td className="px-3 py-2">{v.quality}</td>
                      <td className="px-3 py-2">{v.scenes}</td><td className="px-3 py-2 whitespace-nowrap">{fmt(v.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="ledger">
            <Button variant="secondary" className="mb-3" onClick={() => download("vydora-credits.csv", ledger.data ?? [])}>Export CSV</Button>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>{["When", "User", "Reason", "Credits"].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(ledger.data ?? []).map((l) => (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">{fmt(l.created_at)}</td><td className="px-3 py-2">{l.email}</td>
                      <td className="px-3 py-2">{l.reason.replace(/_/g, " ")}</td>
                      <td className={`px-3 py-2 font-semibold ${l.amount < 0 ? "text-destructive" : "text-accent"}`}>{l.amount > 0 ? "+" : ""}{l.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No payments yet. Once Stripe is connected, every purchase, package and invoice will show here and in the Users tab.
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
