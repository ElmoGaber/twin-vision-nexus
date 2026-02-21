
-- Create the missing trigger for auto-creating profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Remove the license auto-creation trigger (if it exists)
-- We want license to be created on FIRST LOGIN, not on signup
DROP TRIGGER IF EXISTS on_auth_user_license ON auth.users;

-- Update the license function to be a regular function (not trigger) - keep for reference
-- The actual license creation will happen in the validate-license edge function
