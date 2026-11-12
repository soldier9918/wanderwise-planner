import { z } from "npm:zod@3";
import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { stripe, TIER_PRICE, returnOrigin, TOPUP_CREDITS_PER_GBP, LIVE, billingBlocked } from "../_shared/stripe.ts";

const Body = z.union([
  z.object({ plan: z.enum(["creator", "pro"]) }),
  z.object({
    amount_gbp: z.coerce
      .number()
      .finite()
      .min(5, "Minimum £5.")
      .max(10000, "Maximum £10,000.")
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Use no more than two decimal places."),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Choose a plan or enter a top-up amount." }, 400);
    const db = adminClient();
    const userId = auth.user.id;
    const blocked = await billingBlocked(db);
    if (blocked) { console.error("create-checkout blocked:", blocked); return json({ error: "Payments are temporarily unavailable." }, 503); }

    const { data: sub } = await db.from("user_subscriptions").select("*").eq("user_id", userId).eq("livemode", LIVE).maybeSingle();
    const isTopUp = "amount_gbp" in parsed.data;

    // Subscribers may still top up; only plan checkouts are blocked while a plan is live.
    if (!isTopUp && sub && ["active", "trialing", "past_due"].includes(sub.status)) {
      return json({ error: "You already have a subscription. Use Manage subscription to change plans." }, 409);
    }
    let customerId = sub?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const c = await stripe.customers.create({ email: auth.user.email, metadata: { app: "vydora", user_id: userId } });
      customerId = c.id;
      await db.from("user_subscriptions").insert({ user_id: userId, stripe_customer_id: customerId, status: "incomplete", livemode: LIVE });
    }
    const origin = returnOrigin(req);
    const urls = {
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
    };

    if (isTopUp) {
      const amount = parsed.data.amount_gbp;
      const credits = Math.floor(amount * TOPUP_CREDITS_PER_GBP);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        client_reference_id: userId,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(amount * 100),
            product_data: { name: "Vydora credit top-up", description: `${credits} credits` },
          },
        }],
        metadata: { app: "vydora", user_id: userId, kind: "topup", credits: String(credits) },
        invoice_creation: { enabled: true, invoice_data: { description: `Vydora credit top-up · ${credits} credits`, metadata: { app: "vydora", kind: "topup" } } },
        allow_promotion_codes: true,
        customer_update: { address: "auto", name: "auto" },
        tax_id_collection: { enabled: true },
        ...urls,
      });
      return json({ url: session.url, credits });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: TIER_PRICE[parsed.data.plan], quantity: 1 }],
      metadata: { app: "vydora", user_id: userId },
      subscription_data: { metadata: { app: "vydora", user_id: userId } },
      allow_promotion_codes: true,
      customer_update: { address: "auto", name: "auto" },
      tax_id_collection: { enabled: true },
      ...urls,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error("create-checkout", e);
    return json({ error: "Couldn't start checkout. Please try again." }, 500);
  }
});
