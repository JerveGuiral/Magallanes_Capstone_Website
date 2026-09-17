import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        });
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
        });
      } else {
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
      return { error: 'Supabase is not configured in .env.' };
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
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role: data.user.role,
        });
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'An unexpected error occurred during login.' };
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    setUser(null);
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
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
        loginWithSupabase,
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
