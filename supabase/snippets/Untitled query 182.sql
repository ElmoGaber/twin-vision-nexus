-- 1. أضف المستخدمين في auth.users أولاً
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
VALUES
  ('d702effd-326d-4f60-aa70-1bd27f709a52', 'kyehia294@gmail.com', 'password_hash_here', now(), now()),
    ('fdf2ee99-9936-470a-8de9-16e504a238a2', 'momen2004tarek@gmail.com', 'password_hash_here', now(), now())
    ON CONFLICT (email) DO NOTHING;

    -- 2. بعد كده أضفهم في profiles
    INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
    VALUES
      ('d702effd-326d-4f60-aa70-1bd27f709a52', 'Khaled Mohamad', NULL, now(), now()),
        ('fdf2ee99-9936-470a-8de9-16e504a238a2', 'momen tarek gaber', NULL, now(), now())
        ON CONFLICT (user_id) DO UPDATE
        SET
          full_name = EXCLUDED.full_name,
            avatar_url = EXCLUDED.avatar_url,
              updated_at = now();