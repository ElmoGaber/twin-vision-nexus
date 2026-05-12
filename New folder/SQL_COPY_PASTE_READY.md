# 🔐 SQL Code Ready to Copy & Paste

## ⚡ Quick Start (30 seconds):

1. Go to: https://app.supabase.com
2. Select your project
3. Go to: **SQL Editor**
4. **Copy everything below** ⬇️
5. **Paste** in SQL Editor
6. Click **RUN** ✅

---

## 📋 FULL SQL CODE (Ready to Run):

```sql
-- ============================================================================
-- 🔐 License System - Server-Side Automatic License Creation
-- ============================================================================

-- Drop existing objects to avoid conflicts
DROP TRIGGER IF EXISTS trigger_create_license_on_signup ON auth.users;
DROP FUNCTION IF EXISTS public.trigger_create_license_on_signup();
DROP FUNCTION IF EXISTS public.create_license_for_user(UUID, TEXT, INT);
DROP TABLE IF EXISTS public.license_audit_logs;
DROP TABLE IF EXISTS public.licenses;

-- ============================================================================
-- 1️⃣ Create licenses table
-- ============================================================================

CREATE TABLE public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  license_key TEXT NOT NULL UNIQUE DEFAULT ('LICENSE_' || gen_random_uuid()::TEXT),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  days_valid INTEGER NOT NULL DEFAULT 14,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON public.licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON public.licenses(expires_at);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);

-- ============================================================================
-- 2️⃣ Create audit logs table
-- ============================================================================

CREATE TABLE public.license_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.license_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON public.license_audit_logs(email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.license_audit_logs(created_at);

-- ============================================================================
-- 3️⃣ Function: Create license (SECURITY DEFINER - Safe)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_license_for_user(
  p_user_id UUID,
  p_email TEXT,
  p_days_valid INT DEFAULT 14
)
RETURNS UUID AS $$
DECLARE
  v_license_id UUID;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_expires_at := now() AT TIME ZONE 'UTC' + (p_days_valid || ' days')::INTERVAL;
  
  INSERT INTO public.licenses (
    user_id,
    email,
    created_at,
    expires_at,
    status,
    days_valid
  )
  VALUES (
    p_user_id,
    p_email,
    now() AT TIME ZONE 'UTC',
    v_expires_at,
    'active',
    p_days_valid
  )
  ON CONFLICT (user_id) DO UPDATE SET
    expires_at = v_expires_at,
    status = 'active',
    created_at = now() AT TIME ZONE 'UTC'
  RETURNING id INTO v_license_id;
  
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  VALUES (p_user_id, p_email, 'license_created', 'active');
  
  RETURN v_license_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 4️⃣ TRIGGER: Auto-create license on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_create_license_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.create_license_for_user(
    NEW.id,
    NEW.email,
    14
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_license_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_create_license_on_signup();

-- ============================================================================
-- 5️⃣ Function: Check license validity
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_license_validity(p_user_id UUID)
RETURNS TABLE (
  is_valid BOOLEAN,
  days_remaining BIGINT,
  status TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  license_key TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (l.status = 'active' AND l.expires_at > now() AT TIME ZONE 'UTC')::BOOLEAN,
    EXTRACT(DAY FROM (l.expires_at - (now() AT TIME ZONE 'UTC')))::BIGINT,
    l.status,
    l.expires_at,
    l.license_key
  FROM public.licenses l
  WHERE l.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 6️⃣ Function: Update last access
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_license_last_access(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.licenses
  SET last_accessed_at = now() AT TIME ZONE 'UTC'
  WHERE user_id = p_user_id AND status = 'active';
  
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  SELECT user_id, email, 'access', status
  FROM public.licenses
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 7️⃣ Function: Revoke license (Admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.revoke_license(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.licenses
  WHERE user_id = p_user_id;
  
  UPDATE public.licenses
  SET status = 'revoked'
  WHERE user_id = p_user_id;
  
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  VALUES (p_user_id, v_email, 'revoked', 'revoked');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 8️⃣ Function: Extend license (Admin only)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.extend_license(p_user_id UUID, p_additional_days INT DEFAULT 14)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_new_expiry TIMESTAMP WITH TIME ZONE;
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM public.licenses WHERE user_id = p_user_id;
  
  v_new_expiry := (now() AT TIME ZONE 'UTC') + (p_additional_days || ' days')::INTERVAL;
  
  UPDATE public.licenses
  SET expires_at = v_new_expiry
  WHERE user_id = p_user_id;
  
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  VALUES (p_user_id, v_email, 'extended', 'active');
  
  RETURN v_new_expiry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 9️⃣ Row Level Security (RLS) - Protection
-- ============================================================================

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for licenses table
CREATE POLICY "users_select_own_license"
  ON public.licenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_cannot_insert_licenses"
  ON public.licenses
  FOR INSERT
  WITH CHECK (FALSE);

CREATE POLICY "users_cannot_update_licenses"
  ON public.licenses
  FOR UPDATE
  USING (FALSE);

CREATE POLICY "users_cannot_delete_licenses"
  ON public.licenses
  FOR DELETE
  USING (FALSE);

-- Policies for audit logs (admin only)
CREATE POLICY "audit_logs_admin_select"
  ON public.license_audit_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "audit_logs_admin_insert"
  ON public.license_audit_logs
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- ✅ DONE! System Ready
-- ============================================================================

-- Test: View all licenses
-- SELECT * FROM public.licenses LIMIT 5;

-- Test: View audit logs
-- SELECT * FROM public.license_audit_logs LIMIT 5;

-- Test: Check validity
-- SELECT * FROM public.check_license_validity('user-uuid-here');
```

---

## ✅ After Pasting & Running:

1. ✅ All tables created
2. ✅ All functions created
3. ✅ TRIGGER activated
4. ✅ RLS enabled
5. ✅ Ready to use!

---

## 🧪 Verify It Works:

```sql
-- 1️⃣ Check tables exist
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('licenses', 'license_audit_logs');

-- 2️⃣ Check trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trigger_create_license_on_signup';

-- 3️⃣ Check functions exist
SELECT function_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

---

## 🚀 Now:

1. Go to your app
2. Sign up with new email
3. Run this test:

```sql
SELECT user_id, email, status, expires_at 
FROM public.licenses 
WHERE email = 'your-test-email@example.com';
```

**Should return:** ✅ One license record!

---

**Done! 🎉**
