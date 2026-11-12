-- Credits bought through Stripe belong to the Stripe mode that paid for them.
UPDATE public.credit_ledger SET livemode = false WHERE livemode IS NULL AND stripe_invoice_id IS NOT NULL;

-- Spendable balance for the running Stripe mode: mode-neutral rows (starter, monthly, referral, coupon, spends) plus this mode's Stripe rows.
CREATE OR REPLACE FUNCTION public.credit_balance(_user uuid)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS
$$ SELECT COALESCE(SUM(amount),0)::bigint FROM public.credit_ledger
   WHERE user_id = _user AND (livemode IS NULL OR livemode = public.stripe_livemode()) $$;
REVOKE ALL ON FUNCTION public.credit_balance(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_balance(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.spend_credits(_user uuid, _amount integer, _reason text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF public.has_role(_user, 'admin') THEN RETURN 'admin'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('credits:' || _user::text));
  IF public.credit_balance(_user) < _amount THEN RETURN 'insufficient'; END IF;
  INSERT INTO credit_ledger(user_id, amount, reason) VALUES (_user, -_amount, _reason);
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.spend_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text) TO service_role;

CREATE OR REPLACE FUNCTION public.can_mutate_project(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (public.has_role(_user_id, 'admin')
    OR public.has_active_subscription(_user_id) OR public.credit_balance(_user_id) > 0) $$;
REVOKE ALL ON FUNCTION public.can_mutate_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_mutate_project(uuid) TO authenticated, service_role;

-- One-time Live switch. Opening Live balance = non-Sandbox balance, floored at 0 and never above today's total,
-- written as a Live-only adjustment row so history is untouched and Sandbox spending can't push genuine credits negative.
CREATE OR REPLACE FUNCTION public.activate_live_billing()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record; opening bigint; n integer := 0;
BEGIN
  IF (SELECT live FROM billing_config WHERE id) THEN RETURN 0; END IF;
  FOR r IN SELECT user_id,
      SUM(amount) FILTER (WHERE livemode IS NULL) AS neutral, SUM(amount) AS total
    FROM credit_ledger GROUP BY user_id LOOP
    opening := LEAST(GREATEST(r.neutral, 0), GREATEST(r.total, 0));
    IF opening <> r.neutral AND NOT EXISTS (SELECT 1 FROM credit_ledger WHERE user_id = r.user_id AND reason = 'live_opening_adjustment') THEN
      INSERT INTO credit_ledger(user_id, amount, reason, livemode) VALUES (r.user_id, opening - r.neutral, 'live_opening_adjustment', true);
      n := n + 1;
    END IF;
  END LOOP;
  UPDATE billing_config SET live = true, updated_at = now() WHERE id;
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.activate_live_billing() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_live_billing() TO service_role;
