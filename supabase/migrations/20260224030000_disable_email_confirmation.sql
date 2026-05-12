-- Disable email confirmation requirement for immediate access
-- This migration ensures users can sign in immediately after registration

-- Update auth settings to auto-confirm emails
-- Note: This requires manual configuration in Supabase Dashboard

-- Function to auto-confirm users on signup
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark email as confirmed immediately
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_confirm_email_trigger ON auth.users;

-- Create trigger to auto-confirm emails
CREATE TRIGGER auto_confirm_email_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- Also update any existing unconfirmed users from recent signup attempts
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL
  AND created_at > NOW() - INTERVAL '7 days';

-- Log security action
DO $$
BEGIN
  IF to_regclass('public.security_logs') IS NOT NULL THEN
    INSERT INTO public.security_logs (action, details, created_at)
    VALUES ('AUTO_CONFIRM_ENABLED', 'Email auto-confirmation enabled for faster signup', NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;
