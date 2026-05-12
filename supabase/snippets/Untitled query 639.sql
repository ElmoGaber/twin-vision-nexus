INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NULL, now(), now())
ON CONFLICT (user_id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
        updated_at = now();