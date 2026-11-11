-- Free accounts with no credits get read-only projects (view, download, delete only).
CREATE OR REPLACE FUNCTION public.can_mutate_project(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (
    public.has_role(_user_id, 'admin')
    OR public.has_active_subscription(_user_id)
    OR COALESCE((SELECT SUM(amount) FROM public.credit_ledger WHERE user_id = _user_id), 0) > 0)
$$;
REVOKE ALL ON FUNCTION public.can_mutate_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_mutate_project(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "own videos insert" ON public.videos;
DROP POLICY IF EXISTS "own videos update" ON public.videos;
CREATE POLICY "own videos insert" ON public.videos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.can_mutate_project(auth.uid()));
CREATE POLICY "own videos update" ON public.videos FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.can_mutate_project(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.can_mutate_project(auth.uid()));

DROP POLICY IF EXISTS "own scenes insert" ON public.video_scenes;
DROP POLICY IF EXISTS "own scenes update" ON public.video_scenes;
DROP POLICY IF EXISTS "own scenes delete" ON public.video_scenes;
CREATE POLICY "own scenes insert" ON public.video_scenes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.can_mutate_project(auth.uid()));
CREATE POLICY "own scenes update" ON public.video_scenes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND public.can_mutate_project(auth.uid()))
  WITH CHECK (auth.uid() = user_id AND public.can_mutate_project(auth.uid()));
CREATE POLICY "own scenes delete" ON public.video_scenes FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.can_mutate_project(auth.uid()));

DROP POLICY IF EXISTS "own assets insert" ON storage.objects;
DROP POLICY IF EXISTS "own assets update" ON storage.objects;
CREATE POLICY "own assets insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND public.can_mutate_project(auth.uid()));
CREATE POLICY "own assets update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND public.can_mutate_project(auth.uid()))
  WITH CHECK (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND public.can_mutate_project(auth.uid()));

-- Free tier caps (6 scenes, 2 minutes, 720p) for signed-in writes; server jobs (no auth.uid) already enforce them.
CREATE OR REPLACE FUNCTION public.enforce_free_video_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF me IS NULL OR public.has_role(me,'admin') OR public.has_active_subscription(me) THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'videos' THEN
    IF COALESCE(NEW.target_seconds, 0) > 120 AND (TG_OP = 'INSERT' OR NEW.target_seconds IS DISTINCT FROM OLD.target_seconds) THEN RAISE EXCEPTION 'Free plan videos can be up to 2 minutes.' USING ERRCODE = 'check_violation'; END IF;
    IF NEW.quality = '1080p' AND (TG_OP = 'INSERT' OR NEW.quality IS DISTINCT FROM OLD.quality) THEN RAISE EXCEPTION '1080p needs a paid plan.' USING ERRCODE = 'check_violation'; END IF;
  ELSIF TG_OP = 'INSERT' OR NEW.position IS DISTINCT FROM OLD.position THEN
    IF NEW.position >= 6 OR (SELECT count(*) FROM public.video_scenes WHERE video_id = NEW.video_id AND id <> NEW.id) >= 6 THEN
      RAISE EXCEPTION 'Free plan videos can have up to 6 scenes.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.enforce_free_video_limits() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS enforce_free_video_limits ON public.videos;
CREATE TRIGGER enforce_free_video_limits BEFORE INSERT OR UPDATE OF target_seconds, quality ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_video_limits();
DROP TRIGGER IF EXISTS enforce_free_scene_limits ON public.video_scenes;
CREATE TRIGGER enforce_free_scene_limits BEFORE INSERT OR UPDATE OF position ON public.video_scenes
  FOR EACH ROW EXECUTE FUNCTION public.enforce_free_video_limits();