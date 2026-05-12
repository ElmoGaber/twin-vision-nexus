# 🚀 إعدادات Supabase المطلوبة

## الخطوة 1: تعطيل متطلب التحقق من البريد

اتبع هذه الخطوات بالضبط في لوحة Supabase:

### للدخول إلى Supabase:
```
1. اذهب إلى: https://supabase.com
2. سجل الدخول بحسابك
3. اختر مشروعك: twin-vision-nexus
```

### لتعطيل التحقق من البريد:
```
Dashboard (لوحة التحكم)
  ↓
Authentication (المصادقة)
  ↓
Providers (مزودو الخدمة)
  ↓
Email (البريد الإلكتروني)
  ↓
ابحث عن:
- "Require email confirmation"
  أو
- "Confirm email"
  ↓
اختر: Disable أو Auto Confirm
  ↓
اضغط: Save
```

---

## الخطوة 2: التحقق من الإعدادات

تأكد من أن:
- ✅ Email provider: Enabled
- ✅ Confirm email: Disabled (أو Auto Confirm)
- ✅ JWT expiration: 3600 seconds
- ✅ Session timeout: 86400 seconds (24 hours)

---

## الخطوة 3: اختبار إعدادات SMTP (اختياري)

إذا كنت تريد إرسال رسائل بريد فعلية:

```
Authentication →
  Templates →
    إضافة خادم SMTP:
    - Host: smtp.gmail.com
    - Port: 587
    - Username: your-email@gmail.com
    - Password: your-app-password
```

---

## الخطوة 4: تفعيل المزيد من الخيارات الأمنية

### تفعيل MFA (Double Authentication):
```
Authentication →
  Security →
    MFA Enforcement: Recommended
```

### تفعيل مراقبة الجلسات:
```
Database →
    New Table: security_logs
    Columns:
    - id (UUID)
    - user_id (UUID)
    - action (text)
    - details (json)
    - ip_address (text)
    - created_at (timestamp)
```

---

## الخطوة 5: اختبر النظام

### اختبر التسجيل:
```
1. اذهب إلى: http://localhost:5173/login
2. اختر: Sign Up
3. أدخل:
   - الاسم: Ahmed Mohamed
   - البريد: test@gmail.com
   - كلمة المرور: TestPass123!
   - تأكيد: TestPass123!
4. اضغط: Create Account
5. يجب أن تنتقل للصفحة الرئيسية مباشرة ✅
```

### اختبر تسجيل الدخول:
```
1. سجل خروج أولاً
2. اذهب إلى: /login
3. اختر: Sign In
4. أدخل نفس البيانات
5. يجب أن تدخل ✅
```

### اختبر معدل الأخطاء:
```
1. اختر: Sign In
2. أدخل بريد صحيح وكلمة خاطئة
3. حاول 5 مرات
4. في المحاولة 6 ستظهر رسالة قفل ✅
5. انتظر 15 دقيقة ثم حاول مرة أخرى
```

---

## حل المشاكل

### المشكلة: لا تزال ترسالة "Email not confirmed"
**الحل:**
```
1. اذهب إلى Supabase Dashboard
2. اختر: Authentication → Users
3. ابحث عن المستخدم
4. اضغط: Edit
5. ضع علامة على: ☑ Email Confirmed
6. اضغط: Save
```

### المشكلة: لا يمكن التسجيل
**الحل:**
```
1. تأكد أن Email provider: Enabled
2. تأكد أن Site URL صحيح:
   - localhost:5173 (للتطوير)
   - yourdomain.com (للإنتاج)
3. تحقق من Redis connection (إن وجد)
```

### المشكلة: لا تصل رسائل البريد الفعلية
**الحل:**
```
1. تأكد من إعداد SMTP
2. تحقق من spam folder
3. تحقق من SMTP logs في Supabase
4. استخدم Gmail app password (ليس كلمة المرور العادية)
```

---

## ملاحظات أمنية مهمة

⚠️ **لا تسجل بيانات في الـ Logs:**
- كلمات المرور / tokens
- أرقام الائتمان
- معلومات حساسة

✅ **سجل:**
- محاولات تسجيل الدخول الفاشلة
- تغييرات البيانات الحساسة
- عمليات المسؤول

---

## الدعم

إذا واجهت مشكلة:
1. اطلب من الدعم الفني
2. أرسل رقم Project ID: `ysfrhfhuuuzejnhunejh`
3. وصف المشكلة بالتفصيل
4. أرسل screenshot للخطأ
