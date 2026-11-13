CREATE TABLE public.youtube_connections (
  user_id uuid PRIMARY KEY,
  channel_id text NOT NULL,
  channel_title text NOT NULL DEFAULT '',
  channel_thumbnail text,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  connected_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.youtube_connections TO service_role;
ALTER TABLE public.youtube_connections ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.youtube_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id uuid NOT NULL,
  youtube_video_id text,
  privacy text NOT NULL,
  status text NOT NULL DEFAULT 'uploading',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.youtube_uploads TO authenticated;
GRANT ALL ON public.youtube_uploads TO service_role;
ALTER TABLE public.youtube_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own uploads select" ON public.youtube_uploads FOR SELECT TO authenticated USING (auth.uid() = user_id);