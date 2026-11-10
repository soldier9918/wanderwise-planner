CREATE TABLE public.user_subscriptions (
  user_id uuid PRIMARY KEY,
  stripe_customer_id text NOT NULL UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan_tier text,
  price_id text,
  status text NOT NULL DEFAULT 'incomplete',
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subscription select" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.processed_stripe_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.processed_stripe_events TO service_role;
ALTER TABLE public.processed_stripe_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.credit_ledger ADD COLUMN stripe_invoice_id text;
CREATE UNIQUE INDEX credit_ledger_stripe_invoice_uniq ON public.credit_ledger(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = _user_id AND status IN ('active','trialing') AND plan_tier IN ('creator','pro')) $$;