import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  role?: string;
}

/** Why the last session ended, so the login page can say so. */
export type SignOutReason = 'idle' | null;

/* Admins are signed out after this long without using the page (mouse, keyboard, touch,
 * scroll), so a CMS left open on an unattended office computer locks itself. */
export const IDLE_LIMIT_MS = 30 * 60 * 1000;
const LAST_ACTIVE_KEY = 'magallanes_admin_last_active';
const readLastActive = () => {
  try {
    return Number(window.sessionStorage.getItem(LAST_ACTIVE_KEY)) || 0;
  } catch {
    return 0;
  }
};
const writeLastActive = (t: number) => {
  try {
    window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(t));
  } catch {
    /* storage unavailable — the in-memory timer still applies */
  }
};

/* Supabase's error messages are written for developers. These are what staff see. */
function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password. Please try again.';
  if (/email not confirmed/i.test(message)) return 'This account has not been confirmed yet. Ask the system administrator to confirm it.';
  if (/rate limit|too many/i.test(message)) return 'Too many sign-in attempts. Please wait a few minutes, then try again.';
  if (/fetch|network|failed to fetch/i.test(message)) return 'Could not reach the sign-in server. Check your internet connection and try again.';
  return message;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signOutReason: SignOutReason;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutReason, setSignOutReason] = useState<SignOutReason>(null);

  /* Idle sign-out. Activity is recorded (throttled) while signed in; a check every minute,
   * and whenever the tab comes back into view (laptops sleep, timers pause), signs out once
   * the limit has passed. The last-activity time is kept in sessionStorage so a reload does
   * not reset the clock. */
  useEffect(() => {
    if (!user || !supabase) return;
    if (!readLastActive()) writeLastActive(Date.now());

    let lastWrite = 0;
    const markActive = () => {
      const now = Date.now();
      if (now - lastWrite > 15_000) {
        lastWrite = now;
        writeLastActive(now);
      }
    };
    const check = () => {
      if (Date.now() - readLastActive() >= IDLE_LIMIT_MS) {
        setSignOutReason('idle');
        void supabase?.auth.signOut();
        setUser(null);
      }
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, 60_000);
    check();
    return () => {
      events.forEach((e) => window.removeEventListener(e, markActive));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [user]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // A session left idle past the limit (e.g. the tab sat open overnight) is ended
      // before anything is shown.
      const last = readLastActive();
      if (session?.user && last && Date.now() - last >= IDLE_LIMIT_MS) {
        setSignOutReason('idle');
        void supabase?.auth.signOut();
        setLoading(false);
        return;
      }
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
        return { error: friendlyAuthError(error.message) };
      }

      if (data.user) {
        writeLastActive(Date.now());
        setSignOutReason(null);
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          role: data.user.role,
        });
      }

      return { error: null };
    } catch (err: any) {
      return { error: friendlyAuthError(err.message || 'An unexpected error occurred during login.') };
    }
  };

  const logout = async () => {
    writeLastActive(0);
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
        signOutReason,
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
