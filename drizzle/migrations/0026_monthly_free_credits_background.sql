CREATE OR REPLACE FUNCTION public.claim_monthly_free_credits()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE me uuid := auth.uid(); last_grant timestamptz;
BEGIN
  IF me IS NULL OR public.has_active_subscription(me) OR public.has_role(me,'admin') THEN RETURN 0; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('credits:' || me::text));
  SELECT max(created_at) INTO last_grant FROM credit_ledger WHERE user_id = me AND reason IN ('starter','monthly_free');
  IF last_grant IS NOT NULL AND last_grant > now() - interval '1 month' THEN RETURN 0; END IF;
  INSERT INTO credit_ledger(user_id, amount, reason) VALUES (me, 30, 'monthly_free');
  RETURN 30;
END $function$;

CREATE OR REPLACE FUNCTION public.grant_monthly_free_credits_all()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r record; n integer := 0; last_grant timestamptz;
BEGIN
  FOR r IN SELECT a.user_id FROM credit_accounts a
    WHERE NOT public.has_active_subscription(a.user_id) AND NOT public.has_role(a.user_id,'admin')
  LOOP
    PERFORM pg_advisory_xact_lock(hashtext('credits:' || r.user_id::text));
    SELECT max(created_at) INTO last_grant FROM credit_ledger WHERE user_id = r.user_id AND reason IN ('starter','monthly_free');
    IF last_grant IS NULL OR last_grant <= now() - interval '1 month' THEN
      INSERT INTO credit_ledger(user_id, amount, reason) VALUES (r.user_id, 30, 'monthly_free');
      n := n + 1;
    END IF;
  END LOOP;
  RETURN n;
END $function$;

REVOKE ALL ON FUNCTION public.grant_monthly_free_credits_all() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_monthly_free_credits_all() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('monthly-free-credits', '15 3 * * *', $$SELECT public.grant_monthly_free_credits_all();$$);