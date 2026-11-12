CREATE OR REPLACE FUNCTION public.narration_char_limit(_video uuid)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid; tgt int; tier_max int; n int;
BEGIN
  SELECT user_id, COALESCE(target_seconds, 120) INTO owner, tgt FROM public.videos WHERE id = _video;
  IF owner IS NULL THEN RETURN NULL; END IF;
  IF public.has_role(owner,'admin') THEN RETURN NULL; END IF;
  IF public.has_active_subscription(owner) THEN
    SELECT CASE WHEN plan_tier = 'pro' THEN 3600 ELSE 1200 END INTO tier_max FROM public.user_subscriptions WHERE user_id = owner AND livemode = public.stripe_livemode();
  ELSE tier_max := 120; END IF;
  SELECT GREATEST(count(*),1) INTO n FROM public.video_scenes WHERE video_id = _video;
  -- whole video may run up to 1.5x the chosen length (e.g. 2 min -> under 3 min); ~15 characters per spoken second
  RETURN floor(LEAST(tgt, COALESCE(tier_max,120)) * 1.5 / n * 15)::int;
END $$;
GRANT EXECUTE ON FUNCTION public.narration_char_limit(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.enforce_narration_length()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim int; cut text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.narration IS NOT DISTINCT FROM OLD.narration THEN RETURN NEW; END IF;
  lim := public.narration_char_limit(NEW.video_id);
  IF lim IS NULL OR char_length(COALESCE(NEW.narration,'')) <= lim THEN RETURN NEW; END IF;
  IF auth.uid() IS NULL THEN
    cut := left(NEW.narration, lim);
    IF position('.' in reverse(cut)) BETWEEN 1 AND lim/2 THEN cut := left(cut, lim - position('.' in reverse(cut)) + 1); END IF;
    NEW.narration := cut; RETURN NEW;
  END IF;
  RAISE EXCEPTION 'Scene narration can be up to % characters for this video length.', lim USING ERRCODE = 'check_violation';
END $$;
DROP TRIGGER IF EXISTS enforce_narration_length ON public.video_scenes;
CREATE TRIGGER enforce_narration_length BEFORE INSERT OR UPDATE OF narration ON public.video_scenes
FOR EACH ROW EXECUTE FUNCTION public.enforce_narration_length();