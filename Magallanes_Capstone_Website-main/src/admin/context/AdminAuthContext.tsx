import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor' | 'officer';
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const DEMO_ADMIN: AdminUser = {
  id: 'demo-admin-01',
  email: 'admin@magallanes.gov.ph',
  name: 'LGU Administrator',
  role: 'superadmin',
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('magallanes_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default active demo session for seamless initial developer testing
    return DEMO_ADMIN;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supabase) {
      // Check current Supabase auth session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser: AdminUser = {
            id: session.user.id,
            email: session.user.email || 'admin@magallanes.gov.ph',
            name: session.user.user_metadata?.full_name || 'LGU Administrator',
            role: 'superadmin',
          };
          setUser(authUser);
          localStorage.setItem('magallanes_admin_user', JSON.stringify(authUser));
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser: AdminUser = {
            id: session.user.id,
            email: session.user.email || 'admin@magallanes.gov.ph',
            name: session.user.user_metadata?.full_name || 'LGU Administrator',
            role: 'superadmin',
          };
          setUser(authUser);
          localStorage.setItem('magallanes_admin_user', JSON.stringify(authUser));
        } else if (!session && !localStorage.getItem('magallanes_admin_user')) {
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    if (supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // If auth failed on Supabase, return error
          setLoading(false);
          return { success: false, error: error.message };
        }
        if (data.user) {
          const authUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || 'LGU Administrator',
            role: 'superadmin',
          };
          setUser(authUser);
          localStorage.setItem('magallanes_admin_user', JSON.stringify(authUser));
          setLoading(false);
          return { success: true };
        }
      } catch (err: any) {
        setLoading(false);
        return { success: false, error: err.message };
      }
    }

    // Direct login fallback
    const simulatedUser: AdminUser = {
      id: 'admin-' + Date.now(),
      email,
      name: email.split('@')[0].toUpperCase(),
      role: 'superadmin',
    };
    setUser(simulatedUser);
    localStorage.setItem('magallanes_admin_user', JSON.stringify(simulatedUser));
    setLoading(false);
    return { success: true };
  };

  const loginAsDemo = () => {
    setUser(DEMO_ADMIN);
    localStorage.setItem('magallanes_admin_user', JSON.stringify(DEMO_ADMIN));
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    localStorage.removeItem('magallanes_admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginAsDemo,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
