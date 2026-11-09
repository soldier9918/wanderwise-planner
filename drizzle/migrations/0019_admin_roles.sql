CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.grant_admin_for_owner_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) = 'samyhussain123@gmail.com' THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_grant_admin AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_owner_email();
CREATE TRIGGER on_auth_user_confirmed_grant_admin AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW WHEN (old.email_confirmed_at IS NULL AND new.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_admin_for_owner_email();

INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users WHERE lower(email) = 'samyhussain123@gmail.com' AND email_confirmed_at IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN jsonb_build_object(
    'users', (SELECT count(*) FROM auth.users),
    'users_7d', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '7 days'),
    'users_30d', (SELECT count(*) FROM auth.users WHERE created_at > now() - interval '30 days'),
    'active_7d', (SELECT count(*) FROM auth.users WHERE last_sign_in_at > now() - interval '7 days'),
    'videos', (SELECT count(*) FROM public.videos),
    'videos_7d', (SELECT count(*) FROM public.videos WHERE created_at > now() - interval '7 days'),
    'scenes', (SELECT count(*) FROM public.video_scenes),
    'animated', (SELECT count(*) FROM public.video_scenes WHERE clip_path IS NOT NULL AND clip_credit IS NULL),
    'credits_issued', (SELECT coalesce(sum(amount),0) FROM public.credit_ledger WHERE amount > 0),
    'credits_spent', (SELECT coalesce(-sum(amount),0) FROM public.credit_ledger WHERE amount < 0),
    'referrals', (SELECT count(*) FROM public.credit_accounts WHERE referred_by IS NOT NULL),
    'paying_users', (SELECT count(DISTINCT user_id) FROM public.credit_ledger WHERE reason IN ('purchase','topup','subscription') AND amount > 0),
    'signups_by_day', (SELECT coalesce(jsonb_agg(jsonb_build_object('day', d, 'n', n) ORDER BY d),'[]') FROM (
       SELECT date_trunc('day', created_at)::date d, count(*) n FROM auth.users WHERE created_at > now() - interval '30 days' GROUP BY 1) s)
  );
END $$;

CREATE OR REPLACE FUNCTION public.admin_users()
RETURNS TABLE(user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, confirmed boolean,
  provider text, balance bigint, paid_total bigint, plan text, referral_code text, referred_by_email text,
  invites bigint, videos bigint, is_admin boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at, u.email_confirmed_at IS NOT NULL,
    coalesce(u.raw_app_meta_data->>'provider','email'),
    coalesce((SELECT sum(l.amount) FROM credit_ledger l WHERE l.user_id = u.id),0)::bigint,
    coalesce((SELECT sum(l.amount) FROM credit_ledger l WHERE l.user_id = u.id AND l.reason IN ('purchase','topup','subscription') AND l.amount > 0),0)::bigint,
    coalesce((SELECT l.reason FROM credit_ledger l WHERE l.user_id = u.id AND l.reason IN ('subscription','topup','purchase') ORDER BY l.created_at DESC LIMIT 1),'free'),
    a.referral_code,
    (SELECT r.email::text FROM auth.users r WHERE r.id = a.referred_by),
    (SELECT count(*) FROM credit_accounts c WHERE c.referred_by = u.id),
    (SELECT count(*) FROM videos v WHERE v.user_id = u.id),
    public.has_role(u.id, 'admin')
  FROM auth.users u LEFT JOIN credit_accounts a ON a.user_id = u.id
  ORDER BY u.created_at DESC;
END $$;

CREATE OR REPLACE FUNCTION public.admin_videos(_limit int DEFAULT 100)
RETURNS TABLE(id uuid, title text, email text, style text, voice text, aspect_ratio text, quality text,
  scenes bigint, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT v.id, v.title, u.email::text, v.style, v.voice, v.aspect_ratio, v.quality,
    (SELECT count(*) FROM video_scenes s WHERE s.video_id = v.id), v.created_at
  FROM videos v LEFT JOIN auth.users u ON u.id = v.user_id ORDER BY v.created_at DESC LIMIT _limit;
END $$;

CREATE OR REPLACE FUNCTION public.admin_ledger(_limit int DEFAULT 200)
RETURNS TABLE(id uuid, email text, amount int, reason text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT l.id, u.email::text, l.amount, l.reason, l.created_at
  FROM credit_ledger l LEFT JOIN auth.users u ON u.id = l.user_id ORDER BY l.created_at DESC LIMIT _limit;
END $$;

CREATE OR REPLACE FUNCTION public.admin_adjust_credits(_user uuid, _amount int, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _amount = 0 THEN RAISE EXCEPTION 'amount must not be zero'; END IF;
  INSERT INTO credit_ledger(user_id, amount, reason) VALUES (_user, _amount, 'admin_adjustment');
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_overview(), public.admin_users(), public.admin_videos(int), public.admin_ledger(int), public.admin_adjust_credits(uuid,int,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview(), public.admin_users(), public.admin_videos(int), public.admin_ledger(int), public.admin_adjust_credits(uuid,int,text) TO authenticated;