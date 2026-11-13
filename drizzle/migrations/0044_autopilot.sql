ALTER TABLE public.youtube_uploads ADD COLUMN IF NOT EXISTS publish_at timestamptz;
ALTER TABLE public.youtube_uploads ADD COLUMN IF NOT EXISTS title text;

CREATE TABLE public.autopilot_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic text NOT NULL,
  create_on timestamptz NOT NULL,
  publish_on timestamptz,
  status text NOT NULL DEFAULT 'planned',
  video_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.autopilot_plans TO authenticated;
GRANT ALL ON public.autopilot_plans TO service_role;
ALTER TABLE public.autopilot_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans select" ON public.autopilot_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own plans insert" ON public.autopilot_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND char_length(topic) BETWEEN 3 AND 500);
CREATE POLICY "own plans update" ON public.autopilot_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own plans delete" ON public.autopilot_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);