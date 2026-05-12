INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
VALUES
  ('uuid-1', 'kyehia294@gmail.com', 'password_hash_here', now(), now()),
    ('uuid-2', 'momen2004tarek@gmail.com', 'password_hash_here', now(), now())
    ON CONFLICT (email) DO NOTHING;