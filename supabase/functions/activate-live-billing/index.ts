import Stripe from "npm:stripe@17.7.0";
import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { resolveStripeConfig } from "../_shared/stripeConfig.ts";
import { PERMISSIONS, EXPECTED_PRICES, priceProblem, confirmationOk } from "../_shared/liveActivation.ts";

// Admin-only, one-time Live switch. POST {action:"check"} is read-only; {action:"activate", confirm:"ACTIVATE LIVE"} flips the DB switch.
// It never changes STRIPE_MODE (a server setting the owner sets) and never charges, creates or deletes anything in Stripe.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const db = adminClient();
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: auth.user.id, _role: "admin" });
    if (isAdmin !== true) return json({ error: "Admins only." }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body?.action === "activate" ? "activate" : "check";

    const { data: ready, error: rErr } = await db.rpc("live_activation_ready");
    if (rErr) throw rErr;
    const env = Deno.env.toObject();
    const cfg = resolveStripeConfig(env);
    const report = {
      admin: true,
      isolation: ready.isolation === true,
      db_live: ready.db_live === true,
      audit: ready.audit ?? null,
      stripe_mode_live: (env.STRIPE_MODE ?? "").trim().toLowerCase() === "live",
      secrets_ok: cfg.mode === "live",
      config_problems: cfg.mode === "misconfigured" ? cfg.problems : [],
      permissions: [] as { name: string; ok: boolean; grant: string }[],
      prices: { creator: null as string | null, pro: null as string | null },
      problems: [] as string[],
    };
    if (report.db_live) return json({ ...report, done: true });

    // Live key checks run whenever the four Live settings are present, even before STRIPE_MODE=live.
    const probe = resolveStripeConfig({ ...env, STRIPE_MODE: "live" });
    if (probe.mode !== "live") report.problems.push(...probe.problems);
    else {
      const s = new Stripe(probe.secretKey, { apiVersion: "2024-11-20.acacia" });
      // Read-only list calls: a restricted key with the right access passes; missing access returns 403.
      const calls: Record<string, () => Promise<unknown>> = {
        customers: () => s.customers.list({ limit: 1 }),
        checkout: () => s.checkout.sessions.list({ limit: 1 }),
        prices: () => s.prices.list({ limit: 1 }),
        subscriptions: () => s.subscriptions.list({ limit: 1 }),
        invoices: () => s.invoices.list({ limit: 1 }),
        portal: () => s.billingPortal.configurations.list({ limit: 1 }),
      };
      for (const p of PERMISSIONS) {
        let ok = true;
        try { await calls[p.name](); } catch (e) { ok = false; console.error("perm", p.name, (e as any)?.statusCode ?? ""); }
        report.permissions.push({ name: p.name, ok, grant: p.grant });
        if (!ok) report.problems.push(`Live key needs "${p.grant}"`);
      }
      const get = async (id: string) => { try { return await s.prices.retrieve(id); } catch { return null; } };
      const [c, pr] = await Promise.all([get(probe.creatorPrice), get(probe.proPrice)]);
      report.prices.creator = c?.unit_amount != null ? `${c.currency.toUpperCase()} ${(c.unit_amount / 100).toFixed(2)}/${c.recurring?.interval}` : null;
      report.prices.pro = pr?.unit_amount != null ? `${pr.currency.toUpperCase()} ${(pr.unit_amount / 100).toFixed(2)}/${pr.recurring?.interval}` : null;
      for (const x of [priceProblem("Creator", c, EXPECTED_PRICES.creator), priceProblem("Pro", pr, EXPECTED_PRICES.pro)]) if (x) report.problems.push(x);
    }
    if (!report.isolation) report.problems.push("Credit isolation update is not installed");
    if (!report.stripe_mode_live) report.problems.push("Server setting STRIPE_MODE is not set to live yet");
    const canActivate = report.problems.length === 0;

    if (action === "check") return json({ ...report, can_activate: canActivate });
    if (!confirmationOk(body?.confirm)) return json({ ...report, error: "Type ACTIVATE LIVE to confirm." }, 400);
    if (!canActivate) return json({ ...report, error: "Not ready: " + report.problems.join("; ") }, 409);

    const { data: n, error } = await db.rpc("activate_live_billing_audited", {
      _admin: auth.user.id,
      _details: { prices: report.prices, permissions: report.permissions.map((p) => p.name) },
    });
    if (error) {
      if (String(error.message).includes("already_live")) return json({ ...report, done: true });
      throw error;
    }
    return json({ ...report, db_live: true, done: true, adjustments: n });
  } catch (e) {
    console.error("activate-live-billing", e);
    return json({ error: "Activation check failed. Nothing was changed." }, 500);
  }
});
