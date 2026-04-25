import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkIsAdmin } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  const verifyAdminRole = async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      return;
    }
    setCheckingRole(true);
    try {
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);
    } catch {
      setIsAdmin(false);
    } finally {
      setCheckingRole(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        await verifyAdminRole(user);
      } catch (err) {
        console.error('Admin auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      await verifyAdminRole(authUser);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setLoading(true);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      setUser(data.user);

      // Verify admin role after login
      const adminStatus = await checkIsAdmin();
      setIsAdmin(adminStatus);

      if (!adminStatus) {
        // Sign out immediately — this account is not an admin
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        throw new Error(
          'Access denied. Your account does not have admin privileges. ' +
            'Contact the super-admin to grant access.'
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;
      setUser(null);
      setIsAdmin(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
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
