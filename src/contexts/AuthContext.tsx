import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';
import { getOrCreateProfile } from '../lib/phoneAuth';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const profileLoadIdRef = useRef(0);

  const loadProfile = useCallback(async (authUser: User | null) => {
    const loadId = profileLoadIdRef.current + 1;
    profileLoadIdRef.current = loadId;

    if (!authUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const nextProfile = await getOrCreateProfile(authUser);
      if (profileLoadIdRef.current === loadId) {
        setProfile(nextProfile);
      }
    } catch (error) {
      console.error('[AuthContext] Failed to load profile:', error);
      if (profileLoadIdRef.current === loadId) {
        setProfile(null);
      }
    } finally {
      if (profileLoadIdRef.current === loadId) {
        setProfileLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;

        setSession(initialSession);
        const initialUser = initialSession?.user ?? null;
        setUser(initialUser);

        // Fire profile load without awaiting — it has its own profileLoading state.
        // Awaiting here blocks setLoading(false) and freezes the whole app on the spinner.
        void loadProfile(initialUser);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);
      window.setTimeout(() => {
        void loadProfile(nextUser);
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await loadProfile(user);
  }, [loadProfile, user]);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        profileLoading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
