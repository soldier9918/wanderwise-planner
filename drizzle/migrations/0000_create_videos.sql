CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled video',
  topic text NOT NULL,
  style text NOT NULL DEFAULT 'Documentary',
  voice text NOT NULL DEFAULT 'Kore',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT ALL ON public.videos TO service_role;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own videos select" ON public.videos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own videos insert" ON public.videos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own videos update" ON public.videos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own videos delete" ON public.videos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.video_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  position int NOT NULL,
  heading text NOT NULL DEFAULT '',
  narration text NOT NULL,
  visual_prompt text NOT NULL,
  image_path text,
  audio_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_scenes TO authenticated;
GRANT ALL ON public.video_scenes TO service_role;
ALTER TABLE public.video_scenes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scenes select" ON public.video_scenes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own scenes insert" ON public.video_scenes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own scenes update" ON public.video_scenes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own scenes delete" ON public.video_scenes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX video_scenes_video_idx ON public.video_scenes(video_id, position);

CREATE POLICY "own assets read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'video-assets' AND (storage.foldername(name))[1] = auth.uid()::text);