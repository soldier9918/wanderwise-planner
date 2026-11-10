-- Reconcile verified paid Stripe TEST invoice in_1UaFRF9wksHmZlqMv28wklT7 (Creator £19) missed by the webhook.
UPDATE public.user_subscriptions
SET status = 'active', plan_tier = 'creator', price_id = 'price_1UaDVw9wksHmZlqMObItDTFY',
    current_period_end = to_timestamp(1796910617), updated_at = now()
WHERE user_id = '2c65cfae-98f2-4724-9f53-0d4ffe271e0d' AND stripe_subscription_id = 'sub_1UaFRF9wksHmZlqMrl4DAYmE';

INSERT INTO public.credit_ledger (user_id, amount, reason, stripe_invoice_id)
SELECT '2c65cfae-98f2-4724-9f53-0d4ffe271e0d', 600, 'subscription', 'in_1UaFRF9wksHmZlqMv28wklT7'
WHERE NOT EXISTS (SELECT 1 FROM public.credit_ledger WHERE stripe_invoice_id = 'in_1UaFRF9wksHmZlqMv28wklT7');
