import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkIsAdmin } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// ─── Static admin credentials ─────────────────────────────────────────────────
const STATIC_ADMIN_ID       = 'admin';
const STATIC_ADMIN_PASSWORD = 'IGO@Admin2026';
const SESSION_KEY           = 'igo_static_admin';

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  /** True while checking admin_users table */
  checkingRole: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]               = useState<User | null>(null);
  // Initialise synchronously from sessionStorage so there is no loading flash
  const [isAdmin, setIsAdmin]         = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [loading, setLoading]         = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) !== '1');
  const [error, setError]             = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);

  // ── On mount: if no static session, verify via Supabase ──────────────────────
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      // Static session already active — nothing to do
      return;
    }

    const checkAuth = async () => {
      try {
        // 5 s timeout so a slow/offline Supabase never hangs the spinner forever
        const result = await Promise.race([
          supabase.auth.getUser(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          ),
        ]);
        const authUser = (result as Awaited<ReturnType<typeof supabase.auth.getUser>>).data.user;
        setUser(authUser);
        if (authUser) {
          setCheckingRole(true);
          try {
            const ok = await checkIsAdmin();
            setIsAdmin(ok);
          } catch {
            setIsAdmin(false);
          } finally {
            setCheckingRole(false);
          }
        }
      } catch {
        // Timeout or network error — treat as not logged in
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return;
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        try { setIsAdmin(await checkIsAdmin()); } catch { setIsAdmin(false); }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      // Check static credentials first (case-sensitive)
      if (email.trim() === STATIC_ADMIN_ID && password === STATIC_ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setIsAdmin(true);
        return;
      }

      // Fallback: Supabase email auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      setUser(data.user);
      const ok = await checkIsAdmin();
      setIsAdmin(ok);

      if (!ok) {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        throw new Error('Access denied. This account does not have admin privileges.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      setIsAdmin(false);
      setUser(null);
      // Best-effort Supabase signout (no-op if logged in via static creds)
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, error, isAdmin, checkingRole, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
