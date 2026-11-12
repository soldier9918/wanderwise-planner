CREATE TABLE public.billing_config (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  live boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.billing_config TO service_role;
ALTER TABLE public.billing_config ENABLE ROW LEVEL SECURITY;
INSERT INTO public.billing_config (id, live) VALUES (true, false);

CREATE OR REPLACE FUNCTION public.stripe_livemode()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT COALESCE((SELECT live FROM public.billing_config WHERE id), false) $$;
GRANT EXECUTE ON FUNCTION public.stripe_livemode() TO authenticated, service_role;

ALTER TABLE public.user_subscriptions ADD COLUMN livemode boolean NOT NULL DEFAULT false;
ALTER TABLE public.user_subscriptions DROP CONSTRAINT user_subscriptions_pkey;
ALTER TABLE public.user_subscriptions ADD PRIMARY KEY (user_id, livemode);

ALTER TABLE public.credit_ledger ADD COLUMN livemode boolean;

CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = _user_id
   AND livemode = public.stripe_livemode()
   AND status IN ('active','trialing') AND plan_tier IN ('creator','pro')) $$;

CREATE OR REPLACE FUNCTION public.enforce_free_video_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); tier text;
BEGIN
  IF me IS NULL OR public.has_role(me,'admin') THEN RETURN NEW; END IF;
  IF public.has_active_subscription(me) THEN
    SELECT CASE WHEN plan_tier = 'pro' THEN 'pro' ELSE 'creator' END INTO tier FROM public.user_subscriptions WHERE user_id = me AND livemode = public.stripe_livemode();
  ELSE tier := 'free'; END IF;
  IF tier = 'pro' THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'videos' THEN
    IF COALESCE(NEW.target_seconds, 0) > (CASE WHEN tier = 'creator' THEN 1200 ELSE 120 END) AND (TG_OP = 'INSERT' OR NEW.target_seconds IS DISTINCT FROM OLD.target_seconds) THEN
      RAISE EXCEPTION '%', CASE WHEN tier = 'creator' THEN 'Creator videos can be up to 20 minutes.' ELSE 'Free plan videos can be up to 2 minutes.' END USING ERRCODE = 'check_violation'; END IF;
    IF NEW.quality = '1080p' AND (TG_OP = 'INSERT' OR NEW.quality IS DISTINCT FROM OLD.quality) THEN RAISE EXCEPTION '1080p needs the Pro plan.' USING ERRCODE = 'check_violation'; END IF;
  ELSIF tier = 'free' AND (TG_OP = 'INSERT' OR NEW.position IS DISTINCT FROM OLD.position) THEN
    IF NEW.position >= 6 OR (SELECT count(*) FROM public.video_scenes WHERE video_id = NEW.video_id AND id <> NEW.id) >= 6 THEN
      RAISE EXCEPTION 'Free plan videos can have up to 6 scenes.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;