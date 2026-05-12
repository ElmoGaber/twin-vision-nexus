import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getOfflineLicense, syncOfflineLicense } from '@/lib/offlineAuth';

interface LicenseData {
  id: string;
  user_id: string;
  email: string;
  license_key: string;
  created_at: string;
  expires_at: string;
  last_accessed_at: string | null;
  status: 'active' | 'expired' | 'revoked' | 'paused';
  days_valid: number;
  notes: string | null;
}

interface LicenseContextType {
  license: LicenseData | null;
  isValid: boolean;
  loading: boolean;
  remainingDays: number;
  expiryDate: Date | null;
  errorCode: string | null;
  refreshLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType>({
  license: null,
  isValid: false,
  loading: true,
  remainingDays: 0,
  expiryDate: null,
  errorCode: null,
  refreshLicense: async () => {},
});

export const useLicense = () => useContext(LicenseContext);

const isNetworkError = (value: unknown) => {
  const text = String(value || '').toLowerCase();
  return text.includes('failed to fetch') || text.includes('fetch') || text.includes('network');
};

const applyLicenseState = (
  licenseData: LicenseData,
  setLicense: (value: LicenseData | null) => void,
  setIsValid: (value: boolean) => void,
  setErrorCode: (value: string | null) => void,
  setRemainingDays: (value: number) => void,
  setExpiryDate: (value: Date | null) => void,
) => {
  const parsedExpiryDate = new Date(licenseData.expires_at);
  const now = new Date();
  const daysLeft = Math.ceil((parsedExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (licenseData.status === 'active' && parsedExpiryDate > now) {
    setLicense(licenseData);
    setIsValid(true);
    setErrorCode(null);
    setRemainingDays(daysLeft);
    setExpiryDate(parsedExpiryDate);
    return;
  }

  setIsValid(false);
  setLicense(licenseData);
  setErrorCode(licenseData.status === 'revoked' ? 'REVOKED' : 'EXPIRED');
  setRemainingDays(Math.max(0, daysLeft));
  setExpiryDate(parsedExpiryDate);
};

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [license, setLicense] = useState<LicenseData | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState(0);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const validateLicense = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setIsValid(false);
      setLicense(null);
      setErrorCode(null);
      return;
    }

    try {
      // 🔐 الفحص من الخادم عبر RLS الآمن
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        // If server query failed due connectivity, try cached offline license.
        if (isNetworkError(error?.message || error)) {
          const offlineLicense = getOfflineLicense(user.id);
          if (offlineLicense) {
            const offlineData: LicenseData = {
              id: `offline-${user.id}`,
              user_id: user.id,
              email: user.email || '',
              license_key: 'OFFLINE-CACHE',
              created_at: new Date().toISOString(),
              expires_at: offlineLicense.expiresAt,
              last_accessed_at: null,
              status: offlineLicense.status,
              days_valid: offlineLicense.daysValid,
              notes: 'offline-cache',
            };

            applyLicenseState(
              offlineData,
              setLicense,
              setIsValid,
              setErrorCode,
              setRemainingDays,
              setExpiryDate,
            );
            setLoading(false);
            return;
          }
        }

        setIsValid(false);
        setErrorCode('NO_LICENSE');
        setLicense(null);
        setLoading(false);
        return;
      }

      const licenseData = data as LicenseData;
      applyLicenseState(
        licenseData,
        setLicense,
        setIsValid,
        setErrorCode,
        setRemainingDays,
        setExpiryDate,
      );

      syncOfflineLicense(user.id, {
        status: licenseData.status,
        expiresAt: licenseData.expires_at,
        daysValid: licenseData.days_valid,
      });

      // ✅ الترخيص نشط وصالح
      if (licenseData.status === 'active' && new Date(licenseData.expires_at) > new Date()) {
        // 📝 تحديث آخر وصول عبر دالة server-side
        try {
          await supabase.rpc('update_license_last_access', {
            p_user_id: user.id,
          });
        } catch (e) {
          console.error('Failed to update last access:', e);
        }
      }
    } catch (err) {
      console.error('License validation error:', err);

      const offlineLicense = getOfflineLicense(user.id);
      if (offlineLicense) {
        const offlineData: LicenseData = {
          id: `offline-${user.id}`,
          user_id: user.id,
          email: user.email || '',
          license_key: 'OFFLINE-CACHE',
          created_at: new Date().toISOString(),
          expires_at: offlineLicense.expiresAt,
          last_accessed_at: null,
          status: offlineLicense.status,
          days_valid: offlineLicense.daysValid,
          notes: 'offline-cache',
        };

        applyLicenseState(
          offlineData,
          setLicense,
          setIsValid,
          setErrorCode,
          setRemainingDays,
          setExpiryDate,
        );
      } else {
        setIsValid(false);
        setErrorCode('ERROR');
        setLicense(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 🔄 مراقبة التغييرات في المستخدم
  useEffect(() => {
    if (!authLoading) {
      validateLicense();
      // 🔁 إعادة التحقق كل 5 دقائق
      const interval = setInterval(validateLicense, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, authLoading, validateLicense]);

  return (
    <LicenseContext.Provider
      value={{
        license,
        isValid,
        loading,
        remainingDays,
        expiryDate,
        errorCode,
        refreshLicense: validateLicense,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};
