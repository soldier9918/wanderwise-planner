CREATE OR REPLACE FUNCTION public.narration_total_char_limit(_video uuid)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid; tgt int; tier_max int;
BEGIN
  SELECT user_id, COALESCE(target_seconds, 120) INTO owner, tgt FROM public.videos WHERE id = _video;
  IF owner IS NULL OR public.has_role(owner,'admin') THEN RETURN NULL; END IF;
  IF public.has_active_subscription(owner) THEN
    SELECT CASE WHEN plan_tier = 'pro' THEN 3600 ELSE 1200 END INTO tier_max FROM public.user_subscriptions WHERE user_id = owner AND livemode = public.stripe_livemode();
  ELSE tier_max := 120; END IF;
  -- chosen length plus a fixed 20-second buffer; ~15 characters per spoken second
  RETURN ((LEAST(tgt, COALESCE(tier_max,120)) + 20) * 15)::int;
END $$;