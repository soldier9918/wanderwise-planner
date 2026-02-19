
CREATE TABLE public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  from_iata text NOT NULL,
  to_iata text NOT NULL,
  depart_date text NOT NULL,
  return_date text,
  adults int NOT NULL DEFAULT 1,
  cabin text NOT NULL DEFAULT 'ECONOMY',
  target_price numeric,
  current_price numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert alert"
  ON public.price_alerts FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read alerts"
  ON public.price_alerts FOR SELECT USING (true);

CREATE POLICY "Anyone can delete own alerts"
  ON public.price_alerts FOR DELETE USING (true);
