
-- Update the trial trigger to 7 days instead of 14
CREATE OR REPLACE FUNCTION public.handle_new_user_license()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.licenses (user_id, status, expires_at, usage_limit, allowed_features)
  VALUES (NEW.id, 'trial', now() + interval '7 days', 500, ARRAY['dashboard', 'analytics']);
  RETURN NEW;
END;
$function$;

-- Update default on licenses table
ALTER TABLE public.licenses ALTER COLUMN expires_at SET DEFAULT (now() + interval '7 days');
