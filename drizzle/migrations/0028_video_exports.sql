CREATE TABLE public.video_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  version_hash text NOT NULL,
  quality text NOT NULL CHECK (quality IN ('720p','1080p')),
  format text NOT NULL CHECK (format IN ('mp4','webm')),
  status text NOT NULL DEFAULT 'rendering' CHECK (status IN ('rendering','completed','failed','superseded')),
  path text,
  content_type text,
  size_bytes bigint,
  credits_charged integer NOT NULL DEFAULT 0,
  refunded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT ON public.video_exports TO authenticated;
GRANT ALL ON public.video_exports TO service_role;
ALTER TABLE public.video_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own exports select" ON public.video_exports FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- One render in flight per project; completed exports are looked up by exact version.
CREATE UNIQUE INDEX video_exports_one_rendering ON public.video_exports(video_id) WHERE status = 'rendering';
CREATE INDEX video_exports_lookup ON public.video_exports(video_id, version_hash, quality, format) WHERE status = 'completed';

-- Only the server (signed upload URLs) may write finished exports; users can't upload into exports/ folders.
DROP POLICY IF EXISTS "own assets insert" ON storage.objects;
DROP POLICY IF EXISTS "own assets update" ON storage.objects;
CREATE POLICY "own assets insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND COALESCE((storage.foldername(name))[3], '') <> 'exports' AND public.can_mutate_project(auth.uid()));
CREATE POLICY "own assets update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND COALESCE((storage.foldername(name))[3], '') <> 'exports' AND public.can_mutate_project(auth.uid()))
  WITH CHECK (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text AND COALESCE((storage.foldername(name))[3], '') <> 'exports' AND public.can_mutate_project(auth.uid()));