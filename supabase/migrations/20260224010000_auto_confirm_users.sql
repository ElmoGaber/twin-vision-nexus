-- Handle auto-confirmation and user setup on signup
-- This migration ensures users can sign in immediately after registration

-- Create a trigger to auto-confirm users and set them up
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := NEW.id;
  
  -- Update user to mark email as confirmed if not already confirmed
  -- This allows users to sign in immediately
  IF NOT NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = v_user_id AND email_confirmed_at IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;

-- Create trigger to auto-confirm new users
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

-- Ensure existing unconfirmed users can still sign in
-- (This is a workaround for users who attempted to sign up before)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL
  AND created_at > NOW() - interval '30 days';
