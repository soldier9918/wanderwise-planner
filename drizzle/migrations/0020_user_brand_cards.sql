CREATE TABLE public.user_brand_cards (
  user_id uuid PRIMARY KEY,
  cards jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_brand_cards TO authenticated;
GRANT ALL ON public.user_brand_cards TO service_role;
ALTER TABLE public.user_brand_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cards select" ON public.user_brand_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own cards insert" ON public.user_brand_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cards update" ON public.user_brand_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cards delete" ON public.user_brand_cards FOR DELETE TO authenticated USING (auth.uid() = user_id);