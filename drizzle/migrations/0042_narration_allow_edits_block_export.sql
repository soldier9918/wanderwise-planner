CREATE OR REPLACE FUNCTION public.enforce_narration_length()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim int; others int; room int; cut text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.initial_narration IS NULL THEN NEW.initial_narration := NEW.narration; END IF;
  IF TG_OP = 'UPDATE' AND NEW.narration IS NOT DISTINCT FROM OLD.narration THEN RETURN NEW; END IF;
  -- Users may save any edit; length is enforced at download/export. Only AI/server writes are trimmed.
  IF auth.uid() IS NOT NULL THEN RETURN NEW; END IF;
  lim := public.narration_total_char_limit(NEW.video_id);
  IF lim IS NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(sum(char_length(narration)),0) INTO others FROM public.video_scenes WHERE video_id = NEW.video_id AND id <> NEW.id;
  room := lim - others;
  IF char_length(COALESCE(NEW.narration,'')) > room THEN
    cut := left(NEW.narration, GREATEST(room, 0));
    IF position('.' in reverse(cut)) BETWEEN 1 AND char_length(cut)/2 THEN cut := left(cut, char_length(cut) - position('.' in reverse(cut)) + 1); END IF;
    NEW.narration := cut;
  END IF;
  RETURN NEW;
END $$;