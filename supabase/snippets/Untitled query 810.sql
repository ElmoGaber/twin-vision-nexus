with src(email, license_key, created_at, expires_at, status, days_valid, last_accessed_at, notes) as (
    values
        (
              'momen2004tarek@gmail.com',
                    'LICENSE_1bda68c1-bfce-4bc0-b9f8-39efa247ab26',
                          '2026-02-24 22:17:18.138555+00'::timestamptz,
                                '2026-03-24 22:17:18.138555+00'::timestamptz,
                                      'active',
                                            14,
                                                  null::timestamptz,
                                                        null::text
                                                            ),
                                                                (
                                                                      'kyehia294@gmail.com',
                                                                            'LICENSE_8f791a0b-b739-44e5-a94c-1ef7e4c7602d',
                                                                                  '2026-03-10 21:57:37.485534+00'::timestamptz,
                                                                                        '2026-03-24 21:57:37.485534+00'::timestamptz,
                                                                                              'active',
                                                                                                    14,
                                                                                                          null::timestamptz,
                                                                                                                null::text
                                                                                                                    )
                                                                                                                    )
                                                                                                                    insert into public.licenses (
                                                                                                                      user_id, email, license_key, created_at, expires_at, status, days_valid, last_accessed_at, notes
                                                                                                                      )
                                                                                                                      select
                                                                                                                        u.id,
                                                                                                                          s.email,
                                                                                                                            s.license_key,
                                                                                                                              s.created_at,
                                                                                                                                s.expires_at,
                                                                                                                                  s.status,
                                                                                                                                    s.days_valid,
                                                                                                                                      s.last_accessed_at,
                                                                                                                                        s.notes
                                                                                                                                        from src s
                                                                                                                                        join auth.users u
                                                                                                                                          on lower(u.email) = lower(s.email)
                                                                                                                                          on conflict (user_id) do update
                                                                                                                                          set
                                                                                                                                            email = excluded.email,
                                                                                                                                              license_key = excluded.license_key,
                                                                                                                                                created_at = excluded.created_at,
                                                                                                                                                  expires_at = excluded.expires_at,
                                                                                                                                                    status = excluded.status,
                                                                                                                                                      days_valid = excluded.days_valid,
                                                                                                                                                        last_accessed_at = excluded.last_accessed_at,
                                                                                                                                                          notes = excluded.notes;with src(email, license_key, created_at, expires_at, status, days_valid, last_accessed_at, notes) as (
                                                                                                                                                            values
                                                                                                                                                                (
                                                                                                                                                                      'momen2004tarek@gmail.com',
                                                                                                                                                                            'LICENSE_1bda68c1-bfce-4bc0-b9f8-39efa247ab26',
                                                                                                                                                                                  '2026-02-24 22:17:18.138555+00'::timestamptz,
                                                                                                                                                                                        '2026-03-24 22:17:18.138555+00'::timestamptz,
                                                                                                                                                                                              'active',
                                                                                                                                                                                                    14,
                                                                                                                                                                                                          null::timestamptz,
                                                                                                                                                                                                                null::text
                                                                                                                                                                                                                    ),
                                                                                                                                                                                                                        (
                                                                                                                                                                                                                              'kyehia294@gmail.com',
                                                                                                                                                                                                                                    'LICENSE_8f791a0b-b739-44e5-a94c-1ef7e4c7602d',
                                                                                                                                                                                                                                          '2026-03-10 21:57:37.485534+00'::timestamptz,
                                                                                                                                                                                                                                                '2026-03-24 21:57:37.485534+00'::timestamptz,
                                                                                                                                                                                                                                                      'active',
                                                                                                                                                                                                                                                            14,
                                                                                                                                                                                                                                                                  null::timestamptz,
                                                                                                                                                                                                                                                                        null::text
                                                                                                                                                                                                                                                                            )
                                                                                                                                                                                                                                                                            )
                                                                                                                                                                                                                                                                            insert into public.licenses (
                                                                                                                                                                                                                                                                              user_id, email, license_key, created_at, expires_at, status, days_valid, last_accessed_at, notes
                                                                                                                                                                                                                                                                              )
                                                                                                                                                                                                                                                                              select
                                                                                                                                                                                                                                                                                u.id,
                                                                                                                                                                                                                                                                                  s.email,
                                                                                                                                                                                                                                                                                    s.license_key,
                                                                                                                                                                                                                                                                                      s.created_at,
                                                                                                                                                                                                                                                                                        s.expires_at,
                                                                                                                                                                                                                                                                                          s.status,
                                                                                                                                                                                                                                                                                            s.days_valid,
                                                                                                                                                                                                                                                                                              s.last_accessed_at,
                                                                                                                                                                                                                                                                                                s.notes
                                                                                                                                                                                                                                                                                                from src s
                                                                                                                                                                                                                                                                                                join auth.users u
                                                                                                                                                                                                                                                                                                  on lower(u.email) = lower(s.email)
                                                                                                                                                                                                                                                                                                  on conflict (user_id) do update
                                                                                                                                                                                                                                                                                                  set
                                                                                                                                                                                                                                                                                                    email = excluded.email,
                                                                                                                                                                                                                                                                                                      license_key = excluded.license_key,
                                                                                                                                                                                                                                                                                                        created_at = excluded.created_at,
                                                                                                                                                                                                                                                                                                          expires_at = excluded.expires_at,
                                                                                                                                                                                                                                                                                                            status = excluded.status,
                                                                                                                                                                                                                                                                                                              days_valid = excluded.days_valid,
                                                                                                                                                                                                                                                                                                                last_accessed_at = excluded.last_accessed_at,
                                                                                                                                                                                                                                                                                                                  notes = excluded.notes;
)