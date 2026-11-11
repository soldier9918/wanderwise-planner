CREATE OR REPLACE FUNCTION public.enforce_free_video_limits()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE me uuid := auth.uid(); tier text;
BEGIN
  IF me IS NULL OR public.has_role(me,'admin') THEN RETURN NEW; END IF;
  IF public.has_active_subscription(me) THEN
    SELECT CASE WHEN plan_tier = 'pro' THEN 'pro' ELSE 'creator' END INTO tier FROM public.user_subscriptions WHERE user_id = me;
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
END $function$;