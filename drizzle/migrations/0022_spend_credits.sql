CREATE OR REPLACE FUNCTION public.spend_credits(_user uuid, _amount integer, _reason text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE bal bigint;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
  IF public.has_role(_user, 'admin') THEN RETURN 'admin'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext('credits:' || _user::text));
  SELECT COALESCE(SUM(amount),0) INTO bal FROM credit_ledger WHERE user_id = _user;
  IF bal < _amount THEN RETURN 'insufficient'; END IF;
  INSERT INTO credit_ledger(user_id, amount, reason) VALUES (_user, -_amount, _reason);
  RETURN 'ok';
END $$;

CREATE OR REPLACE FUNCTION public.refund_credits(_user uuid, _amount integer, _reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _amount <= 0 OR public.has_role(_user, 'admin') THEN RETURN; END IF;
  INSERT INTO credit_ledger(user_id, amount, reason) VALUES (_user, _amount, _reason);
END $$;

REVOKE ALL ON FUNCTION public.spend_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.refund_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer, text) TO service_role;