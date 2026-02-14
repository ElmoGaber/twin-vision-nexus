
-- Create active_sessions table for session limiting
CREATE TABLE public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS: users can only see own sessions
CREATE POLICY "Users can view own sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: users can delete own sessions (logout)
CREATE POLICY "Users can delete own sessions"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions"
  ON public.active_sessions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create has_feature function
CREATE OR REPLACE FUNCTION public.has_feature(_user_id UUID, _feature TEXT)
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
      AND _feature = ANY(allowed_features)
  )
$$;

-- Create session count check function
CREATE OR REPLACE FUNCTION public.check_session_limit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*) FROM public.active_sessions
    WHERE user_id = _user_id AND expires_at > now()
  ) < (
    SELECT COALESCE(max_sessions, 3) FROM public.licenses
    WHERE user_id = _user_id
    LIMIT 1
  )
$$;

-- Cleanup expired sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.active_sessions WHERE expires_at < now();
END;
$$;

-- Index for fast session lookups
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);
