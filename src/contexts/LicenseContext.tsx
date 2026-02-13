import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface License {
  id: string;
  user_id: string;
  status: 'active' | 'trial' | 'expired' | 'revoked' | 'suspended';
  expires_at: string;
  usage_limit: number;
  usage_count: number;
  allowed_features: string[];
  max_sessions: number;
  max_projects: number;
  created_at: string;
  updated_at: string;
}

interface LicenseContextType {
  license: License | null;
  isValid: boolean;
  isAdmin: boolean;
  loading: boolean;
  remainingDays: number;
  remainingUsage: number;
  errorCode: string | null;
  hasFeature: (feature: string) => boolean;
  refreshLicense: () => Promise<void>;
}

const LicenseContext = createContext<LicenseContextType>({
  license: null,
  isValid: false,
  isAdmin: false,
  loading: true,
  remainingDays: 0,
  remainingUsage: 0,
  errorCode: null,
  hasFeature: () => false,
  refreshLicense: async () => {},
});

export const useLicense = () => useContext(LicenseContext);

export const LicenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, user } = useAuth();
  const [license, setLicense] = useState<License | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [remainingDays, setRemainingDays] = useState(0);
  const [remainingUsage, setRemainingUsage] = useState(0);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const validateLicense = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      setIsValid(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('validate-license', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) {
        setIsValid(false);
        setErrorCode('ERROR');
        return;
      }

      if (data.valid) {
        setLicense(data.license);
        setIsValid(true);
        setIsAdmin(data.isAdmin);
        setRemainingDays(data.remainingDays);
        setRemainingUsage(data.remainingUsage);
        setErrorCode(null);
      } else {
        setLicense(data.license || null);
        setIsValid(false);
        setErrorCode(data.code || 'INVALID');
      }
    } catch {
      setIsValid(false);
      setErrorCode('ERROR');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user) {
      validateLicense();
    } else {
      setLoading(false);
      setIsValid(false);
      setLicense(null);
    }
  }, [user, validateLicense]);

  const hasFeature = useCallback(
    (feature: string) => {
      if (isAdmin) return true;
      return license?.allowed_features?.includes(feature) ?? false;
    },
    [license, isAdmin]
  );

  return (
    <LicenseContext.Provider
      value={{
        license,
        isValid,
        isAdmin,
        loading,
        remainingDays,
        remainingUsage,
        errorCode,
        hasFeature,
        refreshLicense: validateLicense,
      }}
    >
      {children}
    </LicenseContext.Provider>
  );
};
