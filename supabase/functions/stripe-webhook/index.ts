import type Stripe from "npm:stripe@17.7.0";
import { adminClient } from "../_shared/common.ts";
import { stripe, PLANS } from "../_shared/stripe.ts";

const db = adminClient();
const ok = (msg = "ok") => new Response(msg, { status: 200 });

async function userForCustomer(customerId: string, meta?: Stripe.Metadata | null) {
  const { data } = await db.from("user_subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle();
  if (data?.user_id) return data.user_id as string;
  return meta?.app === "vydora" && meta.user_id ? meta.user_id : null;
}

async function syncSubscription(sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id;
  const plan = priceId ? PLANS[priceId] : undefined;
  if (!plan) return; // not a Vydora price (e.g. another app on the same account)
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const userId = await userForCustomer(customerId, sub.metadata);
  if (!userId) return;
  const { error } = await db.from("user_subscriptions").upsert({
    user_id: userId, stripe_customer_id: customerId, stripe_subscription_id: sub.id,
    plan_tier: plan.tier, price_id: priceId, status: sub.status,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end, updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (error) throw error;
}

async function grantInvoiceCredits(inv: Stripe.Invoice) {
  if (inv.status !== "paid" || !inv.subscription) return;
  const line = inv.lines.data.find((l) => l.price?.id && PLANS[l.price.id]);
  if (!line?.price) return;
  const plan = PLANS[line.price.id];
  const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer!.id;
  const userId = await userForCustomer(customerId, inv.subscription_details?.metadata);
  if (!userId) throw new Error(`No Vydora user for customer ${customerId}`);
  // Unique index on stripe_invoice_id means each invoice credits at most once.
  const { error } = await db.from("credit_ledger").insert({ user_id: userId, amount: plan.credits, reason: "subscription", stripe_invoice_id: inv.id });
  if (error && error.code !== "23505") throw error;
}

/** One-time top-up: credits are granted from the amount recorded in the session metadata. */
async function grantTopUp(s: Stripe.Checkout.Session) {
  if (s.payment_status !== "paid") return; // only verified, completed payments earn credits
  const credits = parseInt(String(s.metadata?.credits ?? ""), 10);
  const userId = s.client_reference_id ?? (s.metadata?.app === "vydora" ? s.metadata?.user_id : undefined);
  if (!userId || !Number.isFinite(credits) || credits <= 0) throw new Error(`Bad top-up session ${s.id}`);
  const invoiceId = typeof s.invoice === "string" ? s.invoice : s.invoice?.id ?? s.id;
  // Unique index on stripe_invoice_id means each payment credits at most once.
  const { error } = await db.from("credit_ledger").insert({ user_id: userId, amount: credits, reason: "topup", stripe_invoice_id: invoiceId });
  if (error && error.code !== "23505") throw error;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !secret) return new Response("Missing signature", { status: 400 });
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await req.text(), sig, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (event.livemode) return ok("live events ignored");

  const { data: seen } = await db.from("processed_stripe_events").select("event_id").eq("event_id", event.id).maybeSingle();
  if (seen) return ok("duplicate");

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.app === "vydora" && s.subscription) {
          await syncSubscription(await stripe.subscriptions.retrieve(String(s.subscription)));
        } else if (s.metadata?.app === "vydora" && s.mode === "payment" && s.metadata?.kind === "topup") {
          await grantTopUp(s);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.app === "vydora" && s.mode === "payment" && s.metadata?.kind === "topup") await grantTopUp(s);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await grantInvoiceCredits(event.data.object as Stripe.Invoice);
        break;
    }
  } catch (e) {
    console.error("stripe-webhook", event.type, e);
    return new Response("Processing failed", { status: 500 }); // Stripe will retry
  }
  await db.from("processed_stripe_events").insert({ event_id: event.id, event_type: event.type });
  return ok();
});
