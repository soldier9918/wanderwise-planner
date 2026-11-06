ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS music_mood text NOT NULL DEFAULT 'none';
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS music_volume integer NOT NULL DEFAULT 30;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS music_ducking boolean NOT NULL DEFAULT true;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS music_path text;