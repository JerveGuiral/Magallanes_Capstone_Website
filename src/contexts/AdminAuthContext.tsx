import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
  isDemo?: boolean;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isDemo: boolean;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error: string | null }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check local demo persistence first (dev builds only — never trust this flag in production)
    const demoSession = import.meta.env.DEV && localStorage.getItem('magallanes_admin_demo');
    if (demoSession === 'true') {
      setUser({
        id: 'demo-admin-id',
        email: 'admin@magallanes.gov.ph',
        role: 'authenticated',
        isDemo: true,
      });
      setIsDemo(true);
      setLoading(false);
      return;
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || 'admin@magallanes.gov.ph',
          role: session.user.role,
          isDemo: false,
        });
        setIsDemo(false);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || 'admin@magallanes.gov.ph',
          role: session.user.role,
          isDemo: false,
        });
        setIsDemo(false);
      } else if (!(import.meta.env.DEV && localStorage.getItem('magallanes_admin_demo'))) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithSupabase = async (email: string, pass: string): Promise<{ error: string | null }> => {
    if (!supabase) {
      return { error: 'Supabase is not configured in .env. You can use Demo Admin Login to access the dashboard.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        localStorage.removeItem('magallanes_admin_demo');
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role: data.user.role,
          isDemo: false,
        });
        setIsDemo(false);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  const loginAsDemo = () => {
    // Demo bypass only ever works in local dev builds — stripped out of production.
    if (!import.meta.env.DEV) return;
    localStorage.setItem('magallanes_admin_demo', 'true');
    setUser({
      id: 'demo-admin-id',
      email: 'admin@magallanes.gov.ph',
      role: 'authenticated',
      isDemo: true,
    });
    setIsDemo(true);
  };

  const logout = async () => {
    localStorage.removeItem('magallanes_admin_demo');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    setUser(null);
    setIsDemo(false);
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (isDemo) {
      return { error: 'Password change is disabled in Demo Mode. Connect live Supabase Auth to update your password.' };
    }
    if (!supabase) {
      return { error: 'Supabase client is not configured.' };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to update password.' };
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        loginWithSupabase,
        loginAsDemo,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
