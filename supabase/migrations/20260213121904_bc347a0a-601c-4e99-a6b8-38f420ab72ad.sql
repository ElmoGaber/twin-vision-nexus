
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create license_status enum
CREATE TYPE public.license_status AS ENUM ('active', 'trial', 'expired', 'revoked', 'suspended');

-- Create licenses table
CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status license_status NOT NULL DEFAULT 'trial',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '14 days'),
  usage_limit INTEGER NOT NULL DEFAULT 1000,
  usage_count INTEGER NOT NULL DEFAULT 0,
  allowed_features TEXT[] NOT NULL DEFAULT ARRAY['dashboard', 'analytics'],
  max_sessions INTEGER NOT NULL DEFAULT 3,
  max_projects INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Security definer function: check role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Security definer function: check valid license
CREATE OR REPLACE FUNCTION public.has_valid_license(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.licenses
    WHERE user_id = _user_id
      AND status IN ('active', 'trial')
      AND expires_at > now()
      AND usage_count < usage_limit
  )
$$;

-- Security definer function: get license for user
CREATE OR REPLACE FUNCTION public.get_user_license(_user_id UUID)
RETURNS SETOF public.licenses
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.licenses WHERE user_id = _user_id LIMIT 1
$$;

-- Security definer function: increment usage
CREATE OR REPLACE FUNCTION public.increment_license_usage(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.licenses
  SET usage_count = usage_count + 1, updated_at = now()
  WHERE user_id = _user_id
    AND status IN ('active', 'trial')
    AND expires_at > now()
    AND usage_count < usage_limit;
END;
$$;

-- RLS: Users can read their own license
CREATE POLICY "Users can view own license"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Admins can do everything on licenses
CREATE POLICY "Admins can manage all licenses"
  ON public.licenses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: User roles - admins can manage
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Users can view own role
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-create trial license on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_license()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.licenses (user_id, status, expires_at, usage_limit, allowed_features)
  VALUES (NEW.id, 'trial', now() + interval '14 days', 500, ARRAY['dashboard', 'analytics']);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_license
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_license();

-- Trigger for updated_at on licenses
CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS on profiles: allow licensed users only (additional layer)
CREATE POLICY "Only licensed users access profiles"
  ON public.profiles FOR SELECT
  USING (public.has_valid_license(auth.uid()));
