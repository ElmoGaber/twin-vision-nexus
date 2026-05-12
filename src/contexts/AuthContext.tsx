import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import {
  clearOfflineSession,
  getOfflineSessionUser,
  OFFLINE_AUTH_EVENT,
} from '@/lib/offlineAuth';

interface AuthUser {
  id: string;
  email?: string | null;
  isOffline?: boolean;
}

interface AuthSession {
  access_token?: string;
  user: AuthUser;
  isOffline?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const mapSupabaseSession = (supabaseSession: Session | null): AuthSession | null => {
    if (!supabaseSession?.user) return null;

    return {
      access_token: supabaseSession.access_token,
      user: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email,
      },
      isOffline: false,
    };
  };

  const getOfflineAuthSession = (): AuthSession | null => {
    const offlineUser = getOfflineSessionUser();
    if (!offlineUser) return null;

    return {
      access_token: undefined,
      isOffline: true,
      user: {
        id: offlineUser.id,
        email: offlineUser.email,
        isOffline: true,
      },
    };
  };

  useEffect(() => {
    let mounted = true;

    const applySession = (nextSession: AuthSession | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      const mappedOnline = mapSupabaseSession(supabaseSession);
      if (mappedOnline) {
        applySession(mappedOnline);
        return;
      }

      applySession(getOfflineAuthSession());
    });

    const refreshOfflineAuthState = () => {
      const nextOffline = getOfflineAuthSession();

      setSession((prev) => {
        // Keep active online session untouched.
        if (prev && !prev.isOffline) return prev;
        return nextOffline;
      });

      setUser((prev) => {
        if (prev && !prev.isOffline) return prev;
        return nextOffline?.user ?? null;
      });

      setLoading(false);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && event.key !== 'tvn.offline.session.v1') return;
      refreshOfflineAuthState();
    };

    window.addEventListener(OFFLINE_AUTH_EVENT, refreshOfflineAuthState);
    window.addEventListener('storage', onStorage);

    const initAuth = async () => {
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        const mappedOnline = mapSupabaseSession(supabaseSession);
        if (mappedOnline) {
          applySession(mappedOnline);
          return;
        }
      } catch {
        // If Supabase is unreachable, fall back to offline session.
      }

      applySession(getOfflineAuthSession());
    };

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(OFFLINE_AUTH_EVENT, refreshOfflineAuthState);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors in offline mode.
    }

    clearOfflineSession();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
