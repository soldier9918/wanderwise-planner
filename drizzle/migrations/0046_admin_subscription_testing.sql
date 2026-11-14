CREATE TABLE public.admin_test_accounts (user_id uuid PRIMARY KEY, mode text NOT NULL DEFAULT 'admin' CHECK (mode IN ('admin','free','creator','pro')), balance integer NOT NULL DEFAULT 30 CHECK (balance >= 0), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.admin_test_accounts TO authenticated;
GRANT ALL ON public.admin_test_accounts TO service_role;
ALTER TABLE public.admin_test_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_admin_test_read ON public.admin_test_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.admin_test_credit_log (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, amount integer NOT NULL, reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.admin_test_credit_log TO authenticated;
GRANT ALL ON public.admin_test_credit_log TO service_role;
ALTER TABLE public.admin_test_credit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_admin_test_log ON public.admin_test_credit_log FOR SELECT TO authenticated USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));
CREATE FUNCTION public.effective_account(_user uuid) RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE a boolean; m text; b integer; t text;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' AND auth.uid() IS DISTINCT FROM _user THEN RAISE EXCEPTION 'forbidden'; END IF;
 a := public.has_role(_user,'admin');
 IF a THEN SELECT mode, balance INTO m,b FROM public.admin_test_accounts WHERE user_id=_user; END IF;
 IF a AND COALESCE(m,'admin') <> 'admin' THEN RETURN jsonb_build_object('isAdmin',false,'adminAccess',true,'testMode',m,'tier',m,'pro',m<>'free','balance',b); END IF;
 IF a THEN t:='pro'; ELSIF public.has_active_subscription(_user) THEN SELECT plan_tier INTO t FROM public.user_subscriptions WHERE user_id=_user AND livemode=public.stripe_livemode(); ELSE t:='free'; END IF;
 RETURN jsonb_build_object('isAdmin',a,'adminAccess',a,'testMode',null,'tier',t,'pro',a OR t<>'free','balance',public.credit_balance(_user));
END $$;
REVOKE ALL ON FUNCTION public.effective_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.effective_account(uuid) TO authenticated,service_role;
CREATE FUNCTION public.admin_set_test_mode(_mode text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
 IF _mode IS NULL OR _mode NOT IN ('admin','free','creator','pro') THEN RAISE EXCEPTION 'Invalid test mode'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('credits:'||auth.uid()::text));
 INSERT INTO public.admin_test_accounts(user_id,mode) VALUES(auth.uid(),_mode) ON CONFLICT(user_id) DO UPDATE SET mode=EXCLUDED.mode,updated_at=now();
END $$;
CREATE FUNCTION public.admin_adjust_test_credits(_amount integer) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE b integer;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
 IF _amount IS NULL OR _amount=0 THEN RAISE EXCEPTION 'Enter a non-zero whole number'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('credits:'||auth.uid()::text));
 SELECT balance INTO b FROM public.admin_test_accounts WHERE user_id=auth.uid();
 IF b IS NULL THEN RAISE EXCEPTION 'Choose a test plan first'; END IF;
 IF b::bigint+_amount<0 OR b::bigint+_amount>2147483647 THEN RAISE EXCEPTION 'Test balance must be zero or greater and within the supported range'; END IF;
 UPDATE public.admin_test_accounts SET balance=balance+_amount,updated_at=now() WHERE user_id=auth.uid() RETURNING balance INTO b;
 INSERT INTO public.admin_test_credit_log(user_id,amount,reason) VALUES(auth.uid(),_amount,'manual_adjustment');
 RETURN b;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_test_mode(text),public.admin_adjust_test_credits(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_set_test_mode(text),public.admin_adjust_test_credits(integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.can_mutate_project(_user_id uuid) RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE m text; b integer;
BEGIN
 IF _user_id IS NULL THEN RETURN false; END IF;
 IF public.has_role(_user_id,'admin') THEN
  SELECT mode,balance INTO m,b FROM public.admin_test_accounts WHERE user_id=_user_id;
  RETURN COALESCE(m,'admin')<>'free' OR b>0;
 END IF;
 RETURN public.has_active_subscription(_user_id) OR public.credit_balance(_user_id)>0;
END $$;
CREATE OR REPLACE FUNCTION public.spend_credits(_user uuid,_amount integer,_reason text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE m text; b integer;
BEGIN
 IF _amount<=0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('credits:'||_user::text));
 IF public.has_role(_user,'admin') THEN
  SELECT mode,balance INTO m,b FROM public.admin_test_accounts WHERE user_id=_user;
  IF COALESCE(m,'admin')='admin' THEN RETURN 'admin'; END IF;
  IF b<_amount THEN RETURN 'insufficient'; END IF;
  UPDATE public.admin_test_accounts SET balance=balance-_amount,updated_at=now() WHERE user_id=_user;
  INSERT INTO public.admin_test_credit_log(user_id,amount,reason) VALUES(_user,-_amount,_reason);
  RETURN 'ok';
 END IF;
 IF public.credit_balance(_user)<_amount THEN RETURN 'insufficient'; END IF;
 INSERT INTO public.credit_ledger(user_id,amount,reason) VALUES(_user,-_amount,_reason);
 RETURN 'ok';
END $$;
CREATE OR REPLACE FUNCTION public.refund_credits(_user uuid,_amount integer,_reason text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF _amount<=0 THEN RETURN; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('credits:'||_user::text));
 IF public.has_role(_user,'admin') THEN
  IF EXISTS(SELECT 1 FROM public.admin_test_accounts WHERE user_id=_user AND mode<>'admin') THEN
   UPDATE public.admin_test_accounts SET balance=balance+_amount,updated_at=now() WHERE user_id=_user;
   INSERT INTO public.admin_test_credit_log(user_id,amount,reason) VALUES(_user,_amount,_reason);
  END IF;
  RETURN;
 END IF;
 INSERT INTO public.credit_ledger(user_id,amount,reason) VALUES(_user,_amount,_reason);
END $$;
CREATE OR REPLACE FUNCTION public.enforce_free_video_limits() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE me uuid:=auth.uid(); tier text; m text;
BEGIN
 IF me IS NULL THEN RETURN NEW; END IF;
 IF public.has_role(me,'admin') THEN
  SELECT mode INTO m FROM public.admin_test_accounts WHERE user_id=me;
  IF COALESCE(m,'admin')='admin' THEN RETURN NEW; END IF;
  tier:=m;
 ELSIF public.has_active_subscription(me) THEN
  SELECT CASE WHEN plan_tier='pro' THEN 'pro' ELSE 'creator' END INTO tier FROM public.user_subscriptions WHERE user_id=me AND livemode=public.stripe_livemode();
 ELSE tier:='free'; END IF;
 IF tier='pro' THEN RETURN NEW; END IF;
 IF TG_TABLE_NAME='videos' THEN
  IF COALESCE(NEW.target_seconds,0)>(CASE WHEN tier='creator' THEN 1200 ELSE 120 END) AND (TG_OP='INSERT' OR NEW.target_seconds IS DISTINCT FROM OLD.target_seconds) THEN
   RAISE EXCEPTION '%',CASE WHEN tier='creator' THEN 'Creator videos can be up to 20 minutes.' ELSE 'Free plan videos can be up to 2 minutes.' END USING ERRCODE='check_violation'; END IF;
  IF NEW.quality='1080p' AND (TG_OP='INSERT' OR NEW.quality IS DISTINCT FROM OLD.quality) THEN RAISE EXCEPTION '1080p needs the Pro plan.' USING ERRCODE='check_violation'; END IF;
 ELSIF tier='free' AND (TG_OP='INSERT' OR NEW.position IS DISTINCT FROM OLD.position) THEN
  IF NEW.position>=6 OR (SELECT count(*) FROM public.video_scenes WHERE video_id=NEW.video_id AND id<>NEW.id)>=6 THEN RAISE EXCEPTION 'Free plan videos can have up to 6 scenes.' USING ERRCODE='check_violation'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.narration_total_char_limit(_video uuid) RETURNS integer LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE owner uuid; tgt integer; tier_max integer; m text;
BEGIN
 SELECT user_id,COALESCE(target_seconds,120) INTO owner,tgt FROM public.videos WHERE id=_video;
 IF owner IS NULL THEN RETURN NULL; END IF;
 IF public.has_role(owner,'admin') THEN
  SELECT mode INTO m FROM public.admin_test_accounts WHERE user_id=owner;
  IF COALESCE(m,'admin')='admin' THEN RETURN NULL; END IF;
  tier_max:=CASE m WHEN 'pro' THEN 3600 WHEN 'creator' THEN 1200 ELSE 120 END;
 ELSIF public.has_active_subscription(owner) THEN
  SELECT CASE WHEN plan_tier='pro' THEN 3600 ELSE 1200 END INTO tier_max FROM public.user_subscriptions WHERE user_id=owner AND livemode=public.stripe_livemode();
 ELSE tier_max:=120; END IF;
 RETURN floor((LEAST(tgt,COALESCE(tier_max,120))+20)*11.5)::integer;
END $$;