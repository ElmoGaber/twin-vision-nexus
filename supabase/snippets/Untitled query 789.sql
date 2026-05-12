-- إنشاء مستخدمين جديدين في auth.users مع UUID عشوائي
WITH new_users AS (
  INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
    VALUES
        (gen_random_uuid(), 'kyehia294@gmail.com', 'bcrypt_hash_here', now(), now()),
            (gen_random_uuid(), 'momen2004tarek@gmail.com', 'bcrypt_hash_here', now(), now())
              RETURNING id, email
              )
              -- إنشاء أو تحديث profiles لكل مستخدم
              INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
              SELECT
                u.id,
                  CASE u.email
                      WHEN 'kyehia294@gmail.com' THEN 'Khaled Mohamad'
                          WHEN 'momen2004tarek@gmail.com' THEN 'momen tarek gaber'
                            END AS full_name,
                              NULL::text AS avatar_url,
                                now() AS created_at,
                                  now() AS updated_at
                                  FROM new_users u
                                  ON CONFLICT (user_id) DO UPDATE
                                  SET
                                    full_name = EXCLUDED.full_name,
                                      avatar_url = EXCLUDED.avatar_url,
                                        updated_at = EXCLUDED.updated_at;