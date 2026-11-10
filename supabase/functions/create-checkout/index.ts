import { z } from "npm:zod@3";
import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { stripe, TIER_PRICE, returnOrigin } from "../_shared/stripe.ts";

const Body = z.object({ plan: z.enum(["creator", "pro"]) });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: "Choose the Creator or Pro plan." }, 400);
    const db = adminClient();
    const userId = auth.user.id;

    const { data: sub } = await db.from("user_subscriptions").select("*").eq("user_id", userId).maybeSingle();
    if (sub && ["active", "trialing", "past_due"].includes(sub.status)) {
      return json({ error: "You already have a subscription. Use Manage subscription to change plans." }, 409);
    }
    let customerId = sub?.stripe_customer_id as string | undefined;
    if (!customerId) {
      const c = await stripe.customers.create({ email: auth.user.email, metadata: { app: "vydora", user_id: userId } });
      customerId = c.id;
      await db.from("user_subscriptions").insert({ user_id: userId, stripe_customer_id: customerId, status: "incomplete" });
    }
    const origin = returnOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: userId,
      line_items: [{ price: TIER_PRICE[parsed.data.plan], quantity: 1 }],
      metadata: { app: "vydora", user_id: userId },
      subscription_data: { metadata: { app: "vydora", user_id: userId } },
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
    });
    return json({ url: session.url });
  } catch (e) {
    console.error("create-checkout", e);
    return json({ error: "Couldn't start checkout. Please try again." }, 500);
  }
});
