DROP FUNCTION IF EXISTS public.admin_ledger(integer);
CREATE FUNCTION public.admin_ledger(_limit integer DEFAULT 200)
 RETURNS TABLE(id uuid, email text, amount integer, reason text, created_at timestamptz, livemode boolean)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT l.id, u.email::text, l.amount, l.reason, l.created_at, l.livemode
  FROM credit_ledger l LEFT JOIN auth.users u ON u.id = l.user_id ORDER BY l.created_at DESC LIMIT _limit;
END $$;
REVOKE ALL ON FUNCTION public.admin_ledger(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_ledger(integer) TO authenticated;