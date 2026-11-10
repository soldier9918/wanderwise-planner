import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { stripe, PLANS } from "../_shared/stripe.ts";

// Reads the signed-in user's own subscription live from Stripe (read-only) and reports
// any scheduled plan change from its subscription schedule. Never modifies Stripe.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { data: row } = await adminClient().from("user_subscriptions").select("stripe_subscription_id").eq("user_id", auth.user.id).maybeSingle();
    if (!row?.stripe_subscription_id) return json({ pending: null });
    const sub = await stripe.subscriptions.retrieve(row.stripe_subscription_id, { expand: ["schedule"] });
    const item = sub.items.data[0] as any;
    const current = PLANS[item?.price?.id ?? ""];
    let pending: { tier: string; effective_at: string } | null = null;
    const sched = sub.schedule as any;
    if (sched && typeof sched === "object" && ["active", "not_started"].includes(sched.status)) {
      const now = Math.floor(Date.now() / 1000);
      const next = (sched.phases ?? []).find((p: any) => p.start_date > now);
      const price = next?.items?.[0]?.price;
      const plan = PLANS[typeof price === "string" ? price : price?.id ?? ""];
      if (plan && current && plan.tier !== current.tier) pending = { tier: plan.tier, effective_at: new Date(next.start_date * 1000).toISOString() };
    }
    return json({ current_tier: current?.tier ?? null, cancel_at_period_end: sub.cancel_at_period_end, pending });
  } catch (e) {
    console.error("subscription-status", e);
    return json({ error: "Couldn't load subscription details." }, 500);
  }
});
