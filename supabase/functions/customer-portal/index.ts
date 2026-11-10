import { corsHeaders, json, getUserClient, adminClient } from "../_shared/common.ts";
import { stripe, returnOrigin } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = await getUserClient(req);
    if (!auth) return json({ error: "Please sign in first." }, 401);
    const { data: sub } = await adminClient().from("user_subscriptions").select("stripe_customer_id").eq("user_id", auth.user.id).maybeSingle();
    if (!sub?.stripe_customer_id) return json({ error: "No subscription found." }, 404);
    const portal = await stripe.billingPortal.sessions.create({ customer: sub.stripe_customer_id, return_url: `${returnOrigin(req)}/billing` });
    return json({ url: portal.url });
  } catch (e) {
    console.error("customer-portal", e);
    return json({ error: "Couldn't open subscription management." }, 500);
  }
});
