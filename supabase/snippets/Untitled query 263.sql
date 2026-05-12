-- التأكد من أن user_id موجود كـ PRIMARY KEY أو UNIQUE
ALTER TABLE IF EXISTS public.profiles
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- إنشاء CTE بالبيانات الجديدة
WITH src(email, full_name, avatar_url, created_at, updated_at) AS (
  VALUES
      (
            'kyehia294@gmail.com',
                  'Khaled Mohamad',
                        NULL::text,
                              '2026-03-10 21:57:37.485534+00'::timestamptz,
                                    '2026-03-10 21:57:37.485534+00'::timestamptz
                                        ),
                                            (
                                                  'momen2004tarek@gmail.com',
                                                        'momen tarek gaber',
                                                              NULL::text,
                                                                    '2026-02-24 22:17:18.138555+00'::timestamptz,
                                                                          '2026-02-24 22:17:18.138555+00'::timestamptz
                                                                              )
                                                                              )

                                                                              -- إدراج أو تحديث الصفوف في جدول profiles
                                                                              INSERT INTO public.profiles (user_id, full_name, avatar_url, created_at, updated_at)
                                                                              SELECT
                                                                                u.id,
                                                                                  s.full_name,
                                                                                    COALESCE(s.avatar_url, '') AS avatar_url, -- تعويض null بقيمة فارغة
                                                                                      s.created_at,
                                                                                        s.updated_at
                                                                                        FROM src s
                                                                                        JOIN auth.users u
                                                                                          ON LOWER(u.email) = LOWER(s.email)
                                                                                          ON CONFLICT (user_id) DO UPDATE
                                                                                          SET
                                                                                            full_name = EXCLUDED.full_name,
                                                                                              avatar_url = EXCLUDED.avatar_url,
                                                                                                updated_at = EXCLUDED.updated_at;