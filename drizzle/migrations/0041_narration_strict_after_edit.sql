ALTER TABLE public.video_scenes ADD COLUMN IF NOT EXISTS initial_narration text;
UPDATE public.video_scenes SET initial_narration = narration WHERE initial_narration IS NULL;

CREATE OR REPLACE FUNCTION public.enforce_narration_length()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE lim int; others int; room int; cut text; edited boolean;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.initial_narration IS NULL THEN NEW.initial_narration := NEW.narration; END IF;
  IF TG_OP = 'UPDATE' AND NEW.narration IS NOT DISTINCT FROM OLD.narration THEN RETURN NEW; END IF;
  lim := public.narration_total_char_limit(NEW.video_id);
  IF lim IS NULL THEN RETURN NEW; END IF;
  -- Hidden tolerance only while every scene still matches the AI-written text.
  edited := btrim(COALESCE(NEW.narration,'')) IS DISTINCT FROM btrim(COALESCE(NEW.initial_narration, NEW.narration))
    OR EXISTS (SELECT 1 FROM public.video_scenes WHERE video_id = NEW.video_id AND id <> NEW.id
               AND btrim(narration) IS DISTINCT FROM btrim(COALESCE(initial_narration, narration)));
  IF edited THEN lim := lim - 230; END IF; -- remove the 20s buffer (20 * 11.5)
  SELECT COALESCE(sum(char_length(narration)),0) INTO others FROM public.video_scenes WHERE video_id = NEW.video_id AND id <> NEW.id;
  room := lim - others;
  IF char_length(COALESCE(NEW.narration,'')) > room THEN
    IF auth.uid() IS NULL THEN
      cut := left(NEW.narration, GREATEST(room, 0));
      IF position('.' in reverse(cut)) BETWEEN 1 AND char_length(cut)/2 THEN cut := left(cut, char_length(cut) - position('.' in reverse(cut)) + 1); END IF;
      NEW.narration := cut; RETURN NEW;
    END IF;
    RAISE EXCEPTION 'This edit makes your video longer than your selected duration. Please shorten the narration in one or more scenes to continue.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;