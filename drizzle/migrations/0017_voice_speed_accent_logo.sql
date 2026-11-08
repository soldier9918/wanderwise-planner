ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS narration_speed numeric NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS accent text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS logo_path text,
  ADD COLUMN IF NOT EXISTS logo_position text NOT NULL DEFAULT 'bottom-right',
  ADD COLUMN IF NOT EXISTS logo_opacity integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE public.video_scenes ADD COLUMN IF NOT EXISTS clip_credit text;