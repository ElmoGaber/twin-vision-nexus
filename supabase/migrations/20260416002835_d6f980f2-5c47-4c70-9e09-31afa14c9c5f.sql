DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_profile'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    DROP TRIGGER on_auth_user_created_profile ON auth.users;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_auth_user_created_license'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    DROP TRIGGER on_auth_user_created_license ON auth.users;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (user_id) DO UPDATE
  SET full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      updated_at = now();

  RETURN NEW;
END;
$$;

WITH ranked_licenses AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY
        CASE WHEN status IN ('active', 'trial') THEN 0 ELSE 1 END,
        expires_at DESC,
        updated_at DESC,
        created_at DESC,
        id DESC
    ) AS rn
  FROM public.licenses
)
DELETE FROM public.licenses l
USING ranked_licenses r
WHERE l.id = r.id
  AND r.rn > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'licenses_user_id_key'
      AND conrelid = 'public.licenses'::regclass
  ) THEN
    ALTER TABLE public.licenses
    ADD CONSTRAINT licenses_user_id_key UNIQUE (user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user_license()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.licenses (user_id, status, expires_at, usage_limit, allowed_features)
  VALUES (NEW.id, 'trial', now() + interval '7 days', 500, ARRAY['dashboard', 'analytics'])
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

INSERT INTO public.profiles (user_id, full_name)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1))
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.licenses (user_id, status, expires_at, usage_limit, allowed_features)
SELECT
  u.id,
  'trial'::public.license_status,
  now() + interval '7 days',
  500,
  ARRAY['dashboard', 'analytics']::text[]
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_license
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_license();