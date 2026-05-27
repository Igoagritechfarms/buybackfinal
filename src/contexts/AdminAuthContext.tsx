import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkIsAdmin } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// ─── Static admin credentials ─────────────────────────────────────────────────

export interface StaticAdmin {
  id: string;          // login username
  email: string;       // canonical email shown in UI
  name: string;        // display name
  password: string;
}

export const STATIC_ADMINS: StaticAdmin[] = [
  { id: 'admin',                   email: 'admin@farmgatemandi.com',  name: 'Admin',  password: 'IGO@Admin2026'  },
  { id: 'karun@farmgatemandi.com', email: 'karun@farmgatemandi.com',  name: 'Karun',  password: 'karun@farmgate' },
  { id: 'shiva@farmgatemandi.com', email: 'shiva@farmgatemandi.com',  name: 'Shiva',  password: 'shiva@farmgate' },
];

const SESSION_KEY       = 'igo_static_admin';
const SESSION_EMAIL_KEY = 'igo_static_admin_email';
const SESSION_NAME_KEY  = 'igo_static_admin_name';

// ─── Context type ─────────────────────────────────────────────────────────────

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  /** Email of the currently logged-in admin (static or Supabase). */
  adminEmail: string;
  /** Display name of the currently logged-in admin. */
  adminName: string;
  /** True while checking admin_users table */
  checkingRole: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]                 = useState<User | null>(null);
  const [isAdmin, setIsAdmin]           = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [loading, setLoading]           = useState<boolean>(() => sessionStorage.getItem(SESSION_KEY) !== '1');
  const [error, setError]               = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(false);
  const [adminEmail, setAdminEmail]     = useState<string>(
    () => sessionStorage.getItem(SESSION_EMAIL_KEY) ?? ''
  );
  const [adminName, setAdminName]       = useState<string>(
    () => sessionStorage.getItem(SESSION_NAME_KEY) ?? 'Admin'
  );

  // ── On mount: verify via Supabase if no static session ──────────────────────
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    const checkAuth = async () => {
      try {
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
          setAdminEmail(authUser.email ?? '');
          setAdminName(authUser.email?.split('@')[0] ?? 'Admin');
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
      setAdminEmail(authUser?.email ?? '');
      setAdminName(authUser?.email?.split('@')[0] ?? 'Admin');
      if (authUser) {
        try { setIsAdmin(await checkIsAdmin()); } catch { setIsAdmin(false); }
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────────
  const login = async (emailOrId: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      // Check static admin list (match by id OR email, case-insensitive)
      const input = emailOrId.trim().toLowerCase();
      const matched = STATIC_ADMINS.find(
        (a) => a.id.toLowerCase() === input || a.email.toLowerCase() === input
      );

      if (matched && password === matched.password) {
        sessionStorage.setItem(SESSION_KEY, '1');
        sessionStorage.setItem(SESSION_EMAIL_KEY, matched.email);
        sessionStorage.setItem(SESSION_NAME_KEY, matched.name);
        setIsAdmin(true);
        setAdminEmail(matched.email);
        setAdminName(matched.name);
        return;
      }

      // Fallback: Supabase email auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: emailOrId,
        password,
      });
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

      setAdminEmail(data.user.email ?? '');
      setAdminName(data.user.email?.split('@')[0] ?? 'Admin');
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
      sessionStorage.removeItem(SESSION_EMAIL_KEY);
      sessionStorage.removeItem(SESSION_NAME_KEY);
      setIsAdmin(false);
      setUser(null);
      setAdminEmail('');
      setAdminName('Admin');
      await supabase.auth.signOut().catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, error, isAdmin, adminEmail, adminName, checkingRole, login, logout }}
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
