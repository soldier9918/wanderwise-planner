import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const STARTER_CREDITS = 30;
export const REFERRAL_BONUS = 50;
const PAID_REASONS = ["purchase", "topup", "subscription"];

export type LedgerRow = { amount: number; reason: string; created_at: string; stripe_invoice_id?: string | null };

/** Free accounts (never paid) get the "Made with Vydora" export badge. */
export const needsWatermark = (ledger: LedgerRow[]) => !ledger.some((l) => PAID_REASONS.includes(l.reason) && l.amount > 0);
export const isActiveStatus = (s?: string | null) => s === "active" || s === "trialing";
/** Pro features (all narrators, long videos, 1080p) need a subscription, not just a top-up. */
export const hasSubscription = (ledger: LedgerRow[]) => ledger.some((l) => l.reason === "subscription" && l.amount > 0);
export const balanceOf = (ledger: LedgerRow[]) => ledger.reduce((n, l) => n + l.amount, 0);
export const used30d = (ledger: LedgerRow[], now = Date.now()) =>
  ledger.filter((l) => l.amount < 0 && now - new Date(l.created_at).getTime() <= 30 * 864e5).reduce((n, l) => n - l.amount, 0);

export const REASON_LABEL: Record<string, string> = {
  starter: "Starter credits", monthly_free: "Monthly free credits", subscription: "Monthly plan credits", referral_joined: "Joined with an invite", referral_invite: "Friend joined with your invite", admin_adjustment: "Adjusted by Vydora",
  topup: "Credit top-up", coupon: "Coupon code", thumbnail: "Thumbnail", seo: "SEO title & tags", scene_voice: "Scene voiceover", scene_image: "Scene image", script: "Video script", animate: "Scene animation",
};

export function useAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["account", user?.id],
    enabled: !!user,
    // Plan and balance change from payment webhooks, so always re-read when the tab regains focus.
    staleTime: 0,
    refetchOnWindowFocus: "always",
    queryFn: async () => {
      // Free accounts get +30 credits each month; the server decides eligibility.
      await supabase.rpc("claim_monthly_free_credits");
      const [{ data: acct }, { data: ledger }, { data: admin }, { data: sub }] = await Promise.all([
        supabase.from("credit_accounts").select("referral_code, referred_by").eq("user_id", user!.id).maybeSingle(),
        supabase.from("credit_ledger").select("amount, reason, created_at, stripe_invoice_id").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" }),
        supabase.from("user_subscriptions").select("plan_tier, status, current_period_end, cancel_at_period_end").eq("user_id", user!.id).maybeSingle(),
      ]);
      const subscription = sub && isActiveStatus(sub.status) ? sub : null;
      const rows = (ledger ?? []) as LedgerRow[];
      return { code: acct?.referral_code ?? null, referred: !!acct?.referred_by, ledger: rows, balance: balanceOf(rows), isAdmin: !!admin, subscription: sub ?? null, pro: !!admin || !!subscription, watermark: !admin && needsWatermark(rows) };
    },
  });
}

const REF_KEY = "vydora_ref";

/** Remembers ?ref=CODE and claims it once the visitor is signed in. */
export function ReferralCatcher() {
  const { user } = useAuth();
  const qc = useQueryClient();
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem(REF_KEY, ref);
  }, []);
  useEffect(() => {
    const code = localStorage.getItem(REF_KEY);
    if (!user || !code) return;
    supabase.rpc("claim_referral", { _code: code }).then(({ data }) => {
      if (data && data !== "not_signed_in" && data !== "no_account") localStorage.removeItem(REF_KEY);
      if (data === "ok") qc.invalidateQueries({ queryKey: ["account"] });
    });
  }, [user, qc]);
  return null;
}

/** Copies a video and its scene rows (same media files, no credits). */
export async function duplicateVideo(videoId: string): Promise<string> {
  const { data: v, error } = await supabase.from("videos").select("*").eq("id", videoId).single();
  if (error || !v) throw new Error("Couldn't load the video");
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = v;
  const title = /\(Copy\)$/.test(v.title) ? v.title : `${v.title} (Copy)`;
  const { data: copy, error: e2 } = await supabase.from("videos").insert({ ...rest, title }).select("id").single();
  if (e2 || !copy) throw new Error("Couldn't duplicate the video");
  const { data: scenes } = await supabase.from("video_scenes").select("*").eq("video_id", videoId).order("position");
  if (scenes?.length) {
    const rows = scenes.map(({ id: _i, created_at: _ca, clip_job_id: _j, ...s }) => ({ ...s, video_id: copy.id }));
    const { error: e3 } = await supabase.from("video_scenes").insert(rows);
    if (e3) { await supabase.from("videos").delete().eq("id", copy.id); throw new Error("Couldn't copy the scenes"); }
  }
  return copy.id;
}
