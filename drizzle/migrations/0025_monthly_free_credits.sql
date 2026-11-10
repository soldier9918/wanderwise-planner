CREATE OR REPLACE FUNCTION public.claim_monthly_free_credits()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE me uuid := auth.uid(); last_grant timestamptz;
BEGIN
  IF me IS NULL OR public.has_active_subscription(me) OR public.has_role(me,'admin') THEN RETURN 0; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('credits:' || me::text));
  SELECT max(created_at) INTO last_grant FROM credit_ledger WHERE user_id = me AND reason IN ('starter','monthly_free');
  IF last_grant IS NULL OR last_grant > now() - interval '1 month' THEN RETURN 0; END IF;
  INSERT INTO credit_ledger(user_id, amount, reason) VALUES (me, 30, 'monthly_free');
  RETURN 30;
END $$;
REVOKE ALL ON FUNCTION public.claim_monthly_free_credits() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_monthly_free_credits() TO authenticated;