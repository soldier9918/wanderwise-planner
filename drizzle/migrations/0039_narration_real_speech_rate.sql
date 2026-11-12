-- Recalibrate to the voice's measured pace: ~11.5 spoken characters per second.
CREATE OR REPLACE FUNCTION public.narration_total_char_limit(_video uuid)
RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE owner uuid; tgt int; tier_max int;
BEGIN
  SELECT user_id, COALESCE(target_seconds, 120) INTO owner, tgt FROM public.videos WHERE id = _video;
  IF owner IS NULL OR public.has_role(owner,'admin') THEN RETURN NULL; END IF;
  IF public.has_active_subscription(owner) THEN
    SELECT CASE WHEN plan_tier = 'pro' THEN 3600 ELSE 1200 END INTO tier_max FROM public.user_subscriptions WHERE user_id = owner AND livemode = public.stripe_livemode();
  ELSE tier_max := 120; END IF;
  RETURN floor((LEAST(tgt, COALESCE(tier_max,120)) + 20) * 11.5)::int;
END $$;
-- minimum uses the same 11.5 chars/second pace
CREATE OR REPLACE FUNCTION public.enforce_narration_length()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim int; minc int; others int; room int; cut text;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.narration IS NOT DISTINCT FROM OLD.narration THEN RETURN NEW; END IF;
  lim := public.narration_total_char_limit(NEW.video_id);
  IF lim IS NULL THEN RETURN NEW; END IF;
  minc := GREATEST(lim - 345, 12); -- limit is (length + 20s); minimum is (length - 10s)
  SELECT COALESCE(sum(char_length(narration)),0) INTO others FROM public.video_scenes WHERE video_id = NEW.video_id AND id <> NEW.id;
  room := lim - others;
  IF char_length(COALESCE(NEW.narration,'')) > room THEN
    IF auth.uid() IS NULL THEN
      cut := left(NEW.narration, GREATEST(room, 0));
      IF position('.' in reverse(cut)) BETWEEN 1 AND char_length(cut)/2 THEN cut := left(cut, char_length(cut) - position('.' in reverse(cut)) + 1); END IF;
      NEW.narration := cut; RETURN NEW;
    END IF;
    RAISE EXCEPTION 'This video''s narration is too long by about % characters. Please reduce the characters so the video fits its length.', char_length(NEW.narration) - room USING ERRCODE = 'check_violation';
  END IF;
  IF TG_OP = 'UPDATE' AND auth.uid() IS NOT NULL AND others + char_length(COALESCE(NEW.narration,'')) < minc
     AND char_length(COALESCE(NEW.narration,'')) < char_length(COALESCE(OLD.narration,'')) THEN
    RAISE EXCEPTION 'This video''s narration is too short by about % characters. Please add more so the video fits its length.', minc - others - char_length(COALESCE(NEW.narration,'')) USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;