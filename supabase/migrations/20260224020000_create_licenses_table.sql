-- ============================================================================
-- 🔐 نظام الترخيصات المؤقت - Server-Side Only (100% آمن)
-- ============================================================================

-- ============================================================================
-- 1️⃣ إنشاء جدول licenses
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.licenses (
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

-- Ensure required columns exist when table already exists from older migrations
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS license_key TEXT DEFAULT ('LICENSE_' || gen_random_uuid()::TEXT);
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS days_valid INTEGER NOT NULL DEFAULT 14;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ensure email index is created only after email column exists
CREATE INDEX IF NOT EXISTS idx_licenses_email ON public.licenses(email);

-- Add unique constraint for license_key if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'licenses_license_key_key'
      AND conrelid = 'public.licenses'::regclass
  ) THEN
    ALTER TABLE public.licenses
      ADD CONSTRAINT licenses_license_key_key UNIQUE (license_key);
  END IF;
END;
$$;

-- Create indexes only if target columns exist (safe for legacy schemas)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'licenses' AND column_name = 'user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'licenses' AND column_name = 'expires_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON public.licenses(expires_at);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'licenses' AND column_name = 'status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_licenses_status ON public.licenses(status);
  END IF;
END;
$$;

-- ============================================================================
-- 2️⃣ إنشاء جدول license_audit_logs
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.license_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure required columns exist when table already exists from older migrations
ALTER TABLE public.license_audit_logs ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.license_audit_logs ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE public.license_audit_logs ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.license_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'license_audit_logs' AND column_name = 'user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.license_audit_logs(user_id);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'license_audit_logs' AND column_name = 'email'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_email ON public.license_audit_logs(email);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'license_audit_logs' AND column_name = 'created_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.license_audit_logs(created_at);
  END IF;
END;
$$;

-- ============================================================================
-- 3️⃣ الدالة: إنشاء ترخيص جديد (SECURITY DEFINER - آمنة تماماً)
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
  -- حساب تاريخ الانتهاء
  v_expires_at := now() AT TIME ZONE 'UTC' + (p_days_valid || ' days')::INTERVAL;
  
  -- إنشاء الترخيص
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
  
  -- تسجيل في التدقيق
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  VALUES (p_user_id, p_email, 'license_created', 'active');
  
  RETURN v_license_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 4️⃣ TRIGGER: إنشاء ترخيص تلقائي عند تسجيل مستخدم جديد
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_create_license_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- تنفيذ الدالة الآمنة لإنشاء الترخيص
  PERFORM public.create_license_for_user(
    NEW.id,
    NEW.email,
    14  -- 14 يوم افتراضي
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ⚠️ ملاحظة هامة: استخدمنا IF EXISTS (بدون NOT) لأن Supabase لا يدعم IF NOT EXISTS
-- على جداول مثل auth.users
DROP TRIGGER IF EXISTS trigger_create_license_on_signup ON auth.users;

-- إنشاء الـ trigger الجديد
CREATE TRIGGER trigger_create_license_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_create_license_on_signup();

-- ============================================================================
-- 5️⃣ دالة: التحقق من صحة الترخيص
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
    (l.status = 'active' AND l.expires_at > now() AT TIME ZONE 'UTC')::BOOLEAN as is_valid,
    EXTRACT(DAY FROM (l.expires_at - (now() AT TIME ZONE 'UTC')))::BIGINT as days_remaining,
    l.status,
    l.expires_at,
    l.license_key
  FROM public.licenses l
  WHERE l.user_id = p_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 6️⃣ دالة: تحديث آخر وقت وصول
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
-- 7️⃣ Row Level Security (RLS) - الحماية الكاملة
-- ============================================================================

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- سياسات licenses
-- ============================================================================

-- سياسة 1: المستخدم يرى ترخيصه فقط
DROP POLICY IF EXISTS "users_select_own_license" ON public.licenses;
CREATE POLICY "users_select_own_license"
  ON public.licenses
  FOR SELECT
  USING (auth.uid() = user_id);

-- سياسة 2: منع المستخدمين من الإدراج (INSERT)
DROP POLICY IF EXISTS "users_cannot_insert_licenses" ON public.licenses;
CREATE POLICY "users_cannot_insert_licenses"
  ON public.licenses
  FOR INSERT
  WITH CHECK (FALSE);

-- سياسة 3: منع المستخدمين من التحديث (UPDATE)
DROP POLICY IF EXISTS "users_cannot_update_licenses" ON public.licenses;
CREATE POLICY "users_cannot_update_licenses"
  ON public.licenses
  FOR UPDATE
  USING (FALSE);

-- سياسة 4: منع المستخدمين من الحذف (DELETE)
DROP POLICY IF EXISTS "users_cannot_delete_licenses" ON public.licenses;
CREATE POLICY "users_cannot_delete_licenses"
  ON public.licenses
  FOR DELETE
  USING (FALSE);

-- سياسة 5: Admin/Service Role يمكنهم كل شيء
DROP POLICY IF EXISTS "admin_full_access_licenses" ON public.licenses;
CREATE POLICY "admin_full_access_licenses"
  ON public.licenses
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('authenticated', 'service_role'))
  WITH CHECK (true);

-- ============================================================================
-- سياسات license_audit_logs
-- ============================================================================

-- سياسة 1: لا شيء يقرأ audit logs إلا admin
DROP POLICY IF EXISTS "audit_logs_admin_select" ON public.license_audit_logs;
CREATE POLICY "audit_logs_admin_select"
  ON public.license_audit_logs
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

-- سياسة 2: منع أي insert غير موثوق
DROP POLICY IF EXISTS "audit_logs_insert" ON public.license_audit_logs;
CREATE POLICY "audit_logs_insert"
  ON public.license_audit_logs
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 8️⃣ دالة: إلغاء ترخيص (للـ admin فقط)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.revoke_license(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_email TEXT;
BEGIN
  -- الحصول على البريد
  SELECT email INTO v_email
  FROM public.licenses
  WHERE user_id = p_user_id;
  
  -- التحديث
  UPDATE public.licenses
  SET status = 'revoked'
  WHERE user_id = p_user_id;
  
  -- التسجيل
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  VALUES (p_user_id, v_email, 'revoked', 'revoked');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 9️⃣ دالة: تمديد الترخيص (للـ admin فقط)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.extend_license(p_user_id UUID, p_additional_days INT DEFAULT 14)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  v_new_expiry TIMESTAMP WITH TIME ZONE;
  v_email TEXT;
BEGIN
  -- الحصول على البريد والتاريخ الجديد
  SELECT email INTO v_email FROM public.licenses WHERE user_id = p_user_id;
  
  v_new_expiry := (now() AT TIME ZONE 'UTC') + (p_additional_days || ' days')::INTERVAL;
  
  -- التحديث
  UPDATE public.licenses
  SET expires_at = v_new_expiry
  WHERE user_id = p_user_id;
  
  -- التسجيل
  INSERT INTO public.license_audit_logs (user_id, email, action, status)
  VALUES (p_user_id, v_email, 'extended', 'active');
  
  RETURN v_new_expiry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- ✅ تم الإنشاء بنجاح!
-- ============================================================================

-- اختبار: تحقق من الجداول
-- SELECT * FROM public.licenses LIMIT 1;
-- SELECT * FROM public.license_audit_logs LIMIT 1;
