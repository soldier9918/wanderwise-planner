DROP POLICY IF EXISTS "Anyone can delete own alerts" ON public.price_alerts;
DROP POLICY IF EXISTS "Anyone can insert alert" ON public.price_alerts;
DROP POLICY IF EXISTS "Anyone can read alerts" ON public.price_alerts;
REVOKE ALL ON public.price_alerts FROM anon, authenticated;
COMMENT ON TABLE public.price_alerts IS 'DEPRECATED: leftover from old travel app; locked, unused by Vydora';