-- لو عايز تضيف المستخدمين الجدد مع التعامل مع الـ conflict
INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
VALUES
  ('d702effd-326d-4f60-aa70-1bd27f709a52', 'Khaled Mohamad', NULL, now(), now()),
    ('fdf2ee99-9936-470a-8de9-16e504a238a2', 'momen tarek gaber', NULL, now(), now())
    ON CONFLICT (user_id) DO UPDATE
    SET
      full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
          updated_at = now();