# 🔐 نظام الترخيصات المؤقت - دليل التطبيق العملي

## بدء سريع (5 دقائق)

### 1️⃣ تطبيق ال Migration:

**نسخ الكود التالي وشغله في Supabase SQL Editor:**

```sql
-- نسخ الكود من supabase/migrations/20260224_create_licenses_table.sql
-- والصقه مباشرة في SQL Editor ثم اضغط "RUN"
```

### 2️⃣ شغّل المشروع:
```bash
npm run dev
```

### 3️⃣ اختبر النظام:
- اذهب إلى `http://localhost:5173/login`
- سجل حساب جديد
- سيتم إنشاء ترخيص 14 يوم تلقائياً
- اذهب إلى `/admin` لرؤية الترخيصات

---

## 🎯 حالات الاستخدام الشائعة:

### حالة 1: تقديم الوصول لعميل تجريبي (14 يوم)

```bash
# في صفحة /admin:
1. اضغط "+ ترخيص جديد"
2. أدخل البريد الإلكتروني: customer@company.com
3. ضع الأيام: 14
4. اضغط "إنشاء"

# سيحصل على:
- رابط مفتاح الترخيص
- ترخيص صالح لمدة 14 يوم
- سجل وصول في التدقيق
```

**النتيجة:**
```
البريد: customer@company.com
مفتاح: LICENSE_1708864000_abc123def
الانتهاء: 2026-03-10
الحالة: ✓ نشط
```

### حالة 2: عميل طلب تمديد إضافي (7 أيام إضافية)

```bash
# في صفحة /admin:
1. ابحث عن البريد الإلكتروني
2. اضغط الرمز 🔄 (تمديد لـ 14 يوم)
# أو بدل يدويا من database

# سيصبح التاريخ:
الانتهاء الجديد = التاريخ الحالي + 14 يوم إضافي
```

### حالة 3: إلغاء الوصول فوراً (عميل لم يدفع)

```bash
# في صفحة /admin:
1. ابحث عن البريد الإلكتروني
2. اضغط الزر 🗑️ (إلغاء)

# سيحدث فوراً:
- تغيير الحالة إلى "revoked"
- عند الدخول التالي: الوصول مرفوع
- تسجيل في سجل التدقيق
```

---

## 📊 رسائل الأخطاء والحالات:

### عند محاولة الوصول:

| الحالة | الرسالة | الإجراء |
|------|--------|--------|
| **نشط** | ✅ وصول كامل | عرض المحتوى بالكامل |
| **منتهي** | ⏰ انتهت الصلاحية | عرض الرسالة أعلاه والعودة للتسجيل |
| **ملغى** | 🚫 تم الإلغاء | عرض رسالة الإلغاء والتواصل |
| **آخر 3 أيام** | ⚠️ ينتهي قريباً | عرض تنبيه أصفر مع زر "تجديد الآن" |

---

## 🔄 سير عمل كامل للعميل الجديد:

### المسؤول:
```
1. إنشاء ترخيص جديد في /admin
   - البريد: client@example.com
   - الأيام: 30
   
2. إرسال رابط التطبيق للعميل
   - مثال: https://myapp.com/login
```

### العميل:
```
1. فتح الرابط
2. إنشاء حساب جديد:
   - البريد: client@example.com
   - كلمة مرور: SecurePass123!
3. تم! وصول مباشري 30 يوم
4. استخدام التطبيق بكامل الميزات
5. بعد 27 يوم: رؤية تنبيه "ينتهي قريباً"
```

### عند الانتهاء (30 يوم):
```
1. عند محاولة الدخول: رسالة "انتهت الصلاحية"
2. عودة تلقائية لصفحة تسجيل الدخول
3. لا يمكن الوصول بدون ترخيص جديد
```

---

## 💾 قاعدة البيانات:

### جدول `licenses`:

```sql
-- عرض جميع الترخيصات النشطة
SELECT email, license_key, expires_at, status
FROM licenses
WHERE status = 'active';

-- عرض الترخيصات التي تنتهي خلال 7 أيام
SELECT email, expires_at
FROM licenses
WHERE status = 'active' 
AND expires_at < now() + interval '7 days';

-- عرض جميع الترخيصات المنتهية
SELECT email, expires_at, last_accessed_at
FROM licenses
WHERE status = 'expired';
```

### جدول `license_audit_logs`:

```sql
-- عرض سجل الوصول لعميل معين
SELECT email, action, created_at
FROM license_audit_logs
WHERE email = 'client@example.com'
ORDER BY created_at DESC;

-- عرض محاولات الوصول المرفوضة
SELECT email, action, created_at
FROM license_audit_logs
WHERE action = 'access_denied'
ORDER BY created_at DESC;
```

---

## 🚀 التكامل مع كود العميل:

### عرض الترخيص الحالي:

```tsx
import { useLicense } from '@/contexts/LicenseContext';

export function LicenseStatus() {
  const { license, remainingDays, isValid } = useLicense();

  if (!license) return null;

  return (
    <div className="p-4 bg-blue-50 rounded">
      <p>📧 البريد: {license.email}</p>
      <p>📅 الانتهاء: {new Date(license.expires_at).toLocaleDateString('ar-EG')}</p>
      <p>⏳ المتبقي: <strong>{remainingDays} أيام</strong></p>
      <p>🔑 المفتاح: {license.license_key}</p>
    </div>
  );
}
```

### عرض تنبيه للترخيص المنتهي:

```tsx
import { useLicense } from '@/contexts/LicenseContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LicenseAlert() {
  const { isValid, errorCode } = useLicense();

  if (isValid) return null;

  const errors: Record<string, string> = {
    'EXPIRED': 'انتهى التاريخ - اتصل بالمسؤول',
    'REVOKED': 'تم الإلغاء - لا يمكن الوصول',
    'NO_LICENSE': 'لا يوجد ترخيص لهذا البريد',
  };

  return (
    <Alert variant="destructive">
      <AlertDescription>
        {errors[errorCode || 'ERROR']}
      </AlertDescription>
    </Alert>
  );
}
```

---

## 📧 رسالة بريد لإرسالها للعميل:

```
الموضوع: ✅ تم تفعيل حسابك - وصول 30 يوم

مرحباً بك في [اسم التطبيق]!

تم تفعيل حسابك بنجاح ✓

🔐 بيانات الدخول:
- البريد الإلكتروني: customer@example.com
- رابط الدخول: https://app.example.com/login
- فترة الوصول: 30 يوم
- تاريخ الانتهاء: 2026-03-24

📌 ملاحظات مهمة:
- الوصول محدود بـ 30 يوماً من الآن
- يمكنك تحميل وتشغيل التطبيق محلياً
- لا يمكن تجاوز هذه الفترة
- لا يمكن جعل الكود يعمل بدون ترخيص

❓ أسئلة؟
تواصل معنا على: support@example.com

مع أطيب التحيات،
فريق الدعم
```

---

## 🔒 معلومات الأمان:

### كيف يعمل النظام الأمني:

```
┌─────────────────────────────────────────┐
│ مستخدم يفتح التطبيق                    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ ProtectedRoute يفحص الجلسة               │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ LicenseContext يسأل Supabase            │
│ "هل هذا البريد له ترخيص نشط؟"          │
└────────────────┬────────────────────────┘
                 │
          ≡≡≡≡≡≡≡ Supabase Database
                 │
        ┌────────┴─────────┐
        ▼                  ▼
    ✅ نشط             ❌ ملغى/منتهي
        │                  │
        ▼                  ▼
   عرض المحتوى      عرض رسالة خطأ
   والميزات        والعودة للتسجيل
```

### النقاط الحرجة الأمنية:

✅ **محدود بـ Supabase**
- لا يمكن الالتفاف حول الفحص محلياً
- كل طلب يُتحقق من الخادم

✅ **حماية RLS**
- المستخدمون يرون ترخيصهم فقط
- العميل لا يمكنه تعديل ترخيص آخر

✅ **سجل التدقيق**
- تسجيل كل محاولة وصول
- كشف الأنشطة المريبة

---

## 🐛 استكشاف الأخطاء:

### المشكلة: المستخدم يقول "لا يمكنني الدخول"

**الحل:**
```bash
# 1. تحقق من وجود الترخيص في Supabase:
SELECT * FROM licenses WHERE email = 'user@example.com';

# 2. تحقق من الحالة: يجب أن تكون 'active'

# 3. تحقق من التاريخ: يجب أن يكون في المستقبل
# SELECT expires_at FROM licenses WHERE email = 'user@example.com';

# 4. إذا لم يكن موجوداً: أنشئ واحد جديد
INSERT INTO licenses (email, license_key, expires_at, status, days_valid)
VALUES ('user@example.com', 'LICENSE_' || now()::text, 
        now() + interval '30 days', 'active', 30);
```

### المشكلة: ترخيص واحد يعمل لعدة حسابات

**الحل:**
- عدّل موفر Supabase ليتطلب `user_id` محدد
- أضف قيد فريد على `(email, user_id)` بدلاً من البريد فقط

### المشكلة: تنبيهات الانتهاء لا تظهر

**الحل:**
```typescript
// تحقق من LicenseContext
- تأكد من تحميل LicenseProvider في App.tsx
- تحقق من أن remainingDays <= 3
- تحقق من الـ console للأخطاء
```

---

## 💡 نصائح للإنتاج:

### قبل الإطلاق:

```bash
# 1. تفعيل HTTPS فقط
- قم بذلك في Supabase Settings

# 2. تعيين متغيرات البيئة
- أضف VITE_SUPABASE_KEY إلى .env

# 3. تعطيل الوصول المباشر للـ API
- استخدم Row Level Security (RLS)
- قيد الأدوار والصلاحيات

# 4. نسخ احتياطية
- قم بعمل backup يومي لقاعدة البيانات
```

### مراقبة مستمرة:

```sql
-- عرض الترخيصات التي تنتهي خلال أسبوع
SELECT email, expires_at 
FROM licenses 
WHERE status = 'active' 
AND expires_at < now() + interval '7 days'
ORDER BY expires_at;

-- إرسال تنبيهات للعملاء تلقائياً
-- (يمكن استخدام Supabase Edge Functions)
```

---

## 📝 ملخص سريع:

| ما | كيف |
|----|-----|
| **إنشاء ترخيص** | `/admin` → `+ ترخيص جديد` |
| **تمديد ترخيص** | `/admin` → اضغط 🔄 |
| **إلغاء ترخيص** | `/admin` → اضغط 🗑️ |
| **رؤية السجل** | `/admin` → Tab "سجل التدقيق" |
| **تصدير البيانات** | `/admin` → `📊 تصدير CSV` |
| **فحص من الكود** | `useLicense()` hook |

---

جاهز للاستخدام الفوري! 🎉
