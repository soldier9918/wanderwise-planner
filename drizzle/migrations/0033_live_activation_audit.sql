CREATE TABLE public.live_activation_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  activated_at timestamptz NOT NULL DEFAULT now(),
  adjustments integer NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX live_activation_audit_once ON public.live_activation_audit ((true));
GRANT ALL ON public.live_activation_audit TO service_role;
ALTER TABLE public.live_activation_audit ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.activate_live_billing_audited(_admin uuid, _details jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer; already boolean;
BEGIN
  IF NOT public.has_role(_admin, 'admin') THEN RAISE EXCEPTION 'not_admin'; END IF;
  SELECT live INTO already FROM billing_config WHERE id FOR UPDATE;
  IF already OR EXISTS (SELECT 1 FROM live_activation_audit) THEN RAISE EXCEPTION 'already_live'; END IF;
  n := public.activate_live_billing();
  INSERT INTO live_activation_audit(admin_id, adjustments, details) VALUES (_admin, n, COALESCE(_details, '{}'::jsonb));
  RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.activate_live_billing_audited(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_live_billing_audited(uuid, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.live_activation_ready()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'isolation', EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace WHERE s.nspname='public' AND p.proname='credit_balance')
             AND EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace s ON s.oid = p.pronamespace WHERE s.nspname='public' AND p.proname='activate_live_billing'),
    'db_live', public.stripe_livemode(),
    'audit', (SELECT to_jsonb(a) FROM live_activation_audit a LIMIT 1))
$$;
REVOKE ALL ON FUNCTION public.live_activation_ready() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.live_activation_ready() TO service_role;