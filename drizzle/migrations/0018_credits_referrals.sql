CREATE TABLE public.credit_accounts (
  user_id uuid PRIMARY KEY,
  referral_code text NOT NULL UNIQUE,
  referred_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.credit_accounts TO authenticated;
GRANT ALL ON public.credit_accounts TO service_role;
ALTER TABLE public.credit_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own account select" ON public.credit_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_ledger_user_idx ON public.credit_ledger(user_id, created_at DESC);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ledger select" ON public.credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.new_referral_code() RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'VYD-' || upper(substr(md5(gen_random_uuid()::text), 1, 6))
$$;

CREATE OR REPLACE FUNCTION public.handle_new_credit_account() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.credit_accounts(user_id, referral_code) VALUES (NEW.id, public.new_referral_code())
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.credit_ledger(user_id, amount, reason) VALUES (NEW.id, 30, 'starter');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created_credits AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_credit_account();

INSERT INTO public.credit_accounts(user_id, referral_code)
SELECT id, public.new_referral_code() FROM auth.users ON CONFLICT DO NOTHING;
INSERT INTO public.credit_ledger(user_id, amount, reason)
SELECT u.id, 30, 'starter' FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.credit_ledger l WHERE l.user_id = u.id AND l.reason = 'starter');

CREATE OR REPLACE FUNCTION public.claim_referral(_code text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); acct public.credit_accounts; ref uuid;
BEGIN
  IF me IS NULL THEN RETURN 'not_signed_in'; END IF;
  SELECT * INTO acct FROM public.credit_accounts WHERE user_id = me;
  IF acct IS NULL THEN RETURN 'no_account'; END IF;
  IF acct.referred_by IS NOT NULL THEN RETURN 'already_claimed'; END IF;
  IF acct.created_at < now() - interval '7 days' THEN RETURN 'too_late'; END IF;
  SELECT user_id INTO ref FROM public.credit_accounts WHERE referral_code = upper(trim(_code));
  IF ref IS NULL THEN RETURN 'invalid'; END IF;
  IF ref = me THEN RETURN 'own_code'; END IF;
  UPDATE public.credit_accounts SET referred_by = ref WHERE user_id = me;
  INSERT INTO public.credit_ledger(user_id, amount, reason) VALUES (me, 50, 'referral_joined'), (ref, 50, 'referral_invite');
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.claim_referral(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;