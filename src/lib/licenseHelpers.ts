/**
 * 🔐 License Helper Functions
 * 100% Server-Side Implementation
 * 
 * ملاحظة: معظم العمليات تُنفذ على الخادم عبر Supabase Functions و Triggers
 * هذا الملف يحتوي على helper functions للـ Frontend فقط
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * حساب الأيام المتبقية من تاريخ الانتهاء
 */
export const getRemainingDays = (expiryDate: string): number => {
  const days = Math.ceil(
    (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, days);
};

/**
 * فحص إذا كانت الترخيصة على وشك الانتهاء
 */
export const isLicenseExpiring = (expiryDate: string, daysThreshold: number = 3): boolean => {
  const remainingDays = getRemainingDays(expiryDate);
  return remainingDays <= daysThreshold && remainingDays > 0;
};

/**
 * الحصول على رسالة حالة الترخيص
 */
export const getLicenseStatusMessage = (
  errorCode: string | null,
  remainingDays: number
): { title: string; description: string; variant: 'default' | 'destructive' | 'outline' } => {
  const messages: Record<string, any> = {
    'EXPIRED': {
      title: '⏰ انتهت صلاحية الترخيص',
      description: 'للأسف، انتهت صلاحية الترخيص الخاص بك.',
      variant: 'destructive',
    },
    'REVOKED': {
      title: '🚫 تم إلغاء الترخيص',
      description: 'تم إلغاء الترخيص الخاص بك من قبل المسؤولين.',
      variant: 'destructive',
    },
    'NO_LICENSE': {
      title: '⚠️ لا يوجد ترخيص',
      description: 'لم يتم العثور على ترخيص نشط لحسابك.',
      variant: 'destructive',
    },
    'EXPIRING': {
      title: '⏰ الترخيص ينتهي قريباً!',
      description: `يتبقى ${remainingDays} أيام فقط. يرجى التجديد.`,
      variant: 'default',
    },
  };

  return messages[errorCode] || {
    title: '❌ خطأ',
    description: 'حدث خطأ في التحقق من الترخيص.',
    variant: 'destructive',
  };
};

/**
 * استدعاء دالة Server-Side لإلغاء الترخيص (Admin فقط)
 * ملاحظة: يجب تفويض هذا من خلال Role-Based Access Control
 */
export const revokeLicenseAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('revoke_license', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Failed to revoke license:', error);
      return false;
    }

    return data;
  } catch (err) {
    console.error('Error revoking license:', err);
    return false;
  }
};

/**
 * استدعاء دالة Server-Side لتمديد الترخيص (Admin فقط)
 */
export const extendLicenseAdmin = async (
  userId: string,
  additionalDays: number = 14
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('extend_license', {
      p_user_id: userId,
      p_additional_days: additionalDays,
    });

    if (error) {
      console.error('Failed to extend license:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error extending license:', err);
    return null;
  }
};
