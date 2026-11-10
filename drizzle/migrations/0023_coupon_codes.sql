CREATE TABLE public.coupon_codes (
  code text NOT NULL PRIMARY KEY,
  credits integer NOT NULL,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.coupon_codes TO service_role;
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.coupon_redemptions (
  code text NOT NULL REFERENCES public.coupon_codes(code) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (code, user_id)
);
GRANT ALL ON public.coupon_redemptions TO service_role;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c record;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 'signed_out'; END IF;
  IF _code IS NULL OR length(trim(_code)) = 0 THEN RETURN 'not_found'; END IF;
  SELECT * INTO c FROM public.coupon_codes WHERE code = upper(trim(_code)) FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF NOT c.active THEN RETURN 'inactive'; END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN RETURN 'expired'; END IF;
  IF c.used_count >= c.max_uses THEN RETURN 'used_up'; END IF;
  BEGIN
    INSERT INTO public.coupon_redemptions (code, user_id) VALUES (c.code, auth.uid());
  EXCEPTION WHEN unique_violation THEN
    RETURN 'already_redeemed';
  END;
  UPDATE public.coupon_codes SET used_count = used_count + 1 WHERE code = c.code;
  INSERT INTO public.credit_ledger (user_id, amount, reason) VALUES (auth.uid(), c.credits, 'coupon');
  RETURN 'ok';
END $$;

REVOKE ALL ON FUNCTION public.redeem_coupon(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_coupon(_code text, _credits integer, _max_uses integer, _expires_at timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _code IS NULL OR upper(trim(_code)) !~ '^[A-Z0-9][A-Z0-9-]{2,39}$' THEN RAISE EXCEPTION 'Use 3-40 letters, numbers or dashes.'; END IF;
  IF _credits IS NULL OR _credits < 1 OR _credits > 100000 THEN RAISE EXCEPTION 'Credits must be between 1 and 100000.'; END IF;
  IF _max_uses IS NULL OR _max_uses < 1 OR _max_uses > 1000000 THEN RAISE EXCEPTION 'Uses must be between 1 and 1000000.'; END IF;
  INSERT INTO public.coupon_codes (code, credits, max_uses, expires_at) VALUES (upper(trim(_code)), _credits, _max_uses, _expires_at);
END $$;

CREATE OR REPLACE FUNCTION public.admin_coupons()
RETURNS TABLE(code text, credits integer, max_uses integer, used_count integer, expires_at timestamptz, active boolean, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT c.code, c.credits, c.max_uses, c.used_count, c.expires_at, c.active, c.created_at
    FROM public.coupon_codes c ORDER BY c.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_coupon_active(_code text, _active boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.coupon_codes SET active = _active WHERE code = upper(trim(_code));
END $$;

REVOKE ALL ON FUNCTION public.admin_create_coupon(text, integer, integer, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_coupons() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_set_coupon_active(text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_coupon(text, integer, integer, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_coupons() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_coupon_active(text, boolean) TO authenticated;