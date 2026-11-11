import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { stripe, returnOrigin, TIER_PRICE } from "../_shared/stripe.ts";

// Bump when the settings below change so a fresh Vydora-only portal configuration is created.
const CONFIG_VERSION = "3";
let cachedConfigId: string | null = null;

/** Vydora's own portal settings (other apps on this Stripe account keep their default portal). */
async function vydoraPortalConfig(): Promise<string> {
  if (cachedConfigId) return cachedConfigId;
  const list = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const found = list.data.find((c) => c.metadata?.app === "vydora" && c.metadata?.version === CONFIG_VERSION);
  if (found) return (cachedConfigId = found.id);

  const prices = await Promise.all(Object.values(TIER_PRICE).map((id) => stripe.prices.retrieve(id)));
  const byProduct = new Map<string, string[]>();
  for (const p of prices) {
    const prod = typeof p.product === "string" ? p.product : p.product.id;
    byProduct.set(prod, [...(byProduct.get(prod) ?? []), p.id]);
  }
  const cfg = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Manage your Vydora plan" },
    features: {
      invoice_history: { enabled: true },
      // Customers can add their name, billing address and VAT/tax ID for invoices.
      customer_update: { enabled: true, allowed_updates: ["name", "address", "tax_id"] },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        proration_behavior: "always_invoice", // upgrades: charged and applied immediately
        products: [...byProduct].map(([product, prices]) => ({ product, prices })),
        // Downgrades (cheaper price): scheduled for the end of the current billing period.
        schedule_at_period_end: { conditions: [{ type: "decreasing_item_amount" }] },
      },
    } as any,
    metadata: { app: "vydora", version: CONFIG_VERSION },
  });
  // Retire older Vydora configurations.
  for (const c of list.data) if (c.metadata?.app === "vydora") await stripe.billingPortal.configurations.update(c.id, { active: false });
  return (cachedConfigId = cfg.id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { data: sub } = await adminClient().from("user_subscriptions").select("stripe_customer_id").eq("user_id", auth.user.id).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found." }, 404);
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      configuration: await vydoraPortalConfig(),
      return_url: `${returnOrigin(req)}/billing`,
    });
    return json({ url: portal.url });
  } catch (e) {
    console.error("customer-portal", e);
    return json({ error: "Couldn't open subscription management." }, 500);
  }
});
