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
/* The last-activity time is kept in memory as well as in sessionStorage (which survives a
 * reload). When the browser blocks site storage, sessionStorage throws, and reading it used
 * to give 0 — "last active in 1970" — so every sign-in was ended as idle the moment it
 * happened and the login page simply came back. Memory is the fallback now. */
let lastActiveInMemory = 0;
const readLastActive = () => {
  try {
    const stored = Number(window.sessionStorage.getItem(LAST_ACTIVE_KEY)) || 0;
    return Math.max(stored, lastActiveInMemory);
  } catch {
    return lastActiveInMemory;
  }
};
const writeLastActive = (t: number) => {
  lastActiveInMemory = t;
  try {
    window.sessionStorage.setItem(LAST_ACTIVE_KEY, String(t));
  } catch {
    /* storage unavailable — the in-memory value still applies */
  }
};
/** True only when a last-activity time is known and is older than the limit. An unknown
 * time (0) never counts as idle: it starts the clock instead of ending the session. */
const isIdle = (last: number) => last > 0 && Date.now() - last >= IDLE_LIMIT_MS;

/* The sign-out still under way, if any. Supabase's sign-out removes whatever session is stored
 * when its request comes back, so one still running on a slow network (a laptop just woken)
 * used to end the sign-in made after it: the login page simply came back. Signing in waits
 * for it now. */
let pendingSignOut: Promise<unknown> = Promise.resolve();
/* 'local' ends this tab's sign-in only. The idle sign-out used 'global', so one forgotten tab
 * signed the same account out in every other tab and on every other computer. */
function endSession(scope: 'local' | 'global' = 'local') {
  if (supabase) {
    pendingSignOut = supabase.auth.signOut({ scope }).catch((e) => console.warn('SignOut error:', e));
  }
  return pendingSignOut;
}

const toAdminUser = (u: { id: string; email?: string; role?: string }): AdminUser => ({
  id: u.id,
  email: u.email || 'admin@magallanes.gov.ph',
  role: u.role,
});

/* Supabase's error messages are written for developers. These are what staff see. */
function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return 'Incorrect email or password. Please try again.';
  if (/email not confirmed/i.test(message)) return 'This account has not been confirmed yet. Ask the system administrator to confirm it.';
  if (/rate limit|too many/i.test(message)) return 'Too many sign-in attempts. Please wait a few minutes, then try again.';
  if (/fetch|network|failed to fetch/i.test(message)) return 'Could not reach the sign-in server. Check your internet connection and try again.';
  if (/should be different|same as the old/i.test(message)) return 'Choose a password different from your current one.';
  if (/at least \d+ characters|password is too short|weak password/i.test(message)) return 'That password is too short or too easy to guess. Use at least 8 characters with letters and numbers.';
  if (/session|jwt|expired|not authenticated|auth session missing/i.test(message)) return 'This reset link has expired. Request a new one.';
  return message;
}

/** Where the emailed reset link sends the admin: this site's set-a-new-password page. */
export const RESET_PASSWORD_PATH = '/admin/reset-password';

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signOutReason: SignOutReason;
  loginWithSupabase: (email: string, pass: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
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
      if (isIdle(readLastActive())) {
        setSignOutReason('idle');
        // The old time has done its job; the next sign-in starts the clock afresh.
        writeLastActive(0);
        void endSession();
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
      if (session?.user && isIdle(readLastActive())) {
        setSignOutReason('idle');
        writeLastActive(0);
        void endSession();
        setLoading(false);
        return;
      }
      if (session?.user) setUser(toAdminUser(session.user));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    /* Supabase also relays other tabs' sign-ins and sign-outs to this one, but each tab keeps
     * its own sign-in (sessionStorage). Taking those events at their word let an open tab of
     * the public site adopt an admin's sign-in, find its own long-stale activity time, and sign
     * out at once — which threw the admin straight back to the login page, on every attempt.
     * So the event only prompts a look at this tab's own stored session. Deferred: Supabase
     * must not be called back from inside its own listener. */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => {
        supabase?.auth
          .getSession()
          .then(({ data: { session } }) => setUser(session?.user ? toAdminUser(session.user) : null))
          .catch(() => undefined)
          .finally(() => setLoading(false));
      }, 0);
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
      // At most 10 s: a request stuck on a dead connection must not hold "Signing in…" forever.
      await Promise.race([pendingSignOut, new Promise((resolve) => setTimeout(resolve, 10_000))]);
      // Start the idle clock before the session exists: Supabase announces the sign-in to
      // the listeners (and so to the idle check) before signInWithPassword returns.
      writeLastActive(Date.now());
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
        setUser(toAdminUser({ ...data.user, email: data.user.email || email }));
      }

      return { error: null };
    } catch (err: any) {
      return { error: friendlyAuthError(err.message || 'An unexpected error occurred during login.') };
    }
  };

  const logout = async () => {
    writeLastActive(0);
    // Signing out on purpose (or after a password reset) ends the account's other sessions too.
    await endSession('global');
    setUser(null);
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (!supabase) {
      return { error: 'Supabase client is not configured.' };
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: friendlyAuthError(error.message) };
      return { error: null };
    } catch (err: any) {
      return { error: friendlyAuthError(err.message || 'Failed to update password.') };
    }
  };

  /*
   * Emails a link to set a new password. Supabase answers the same whether or not the email
   * has an account, and so does the page, so it can't be used to find out which emails are
   * admins. A failure to send (the rate limit, no email service set up, the network) is shown,
   * not hidden behind "we've sent it": that would leave an admin waiting for an email that never
   * comes.
   */
  const requestPasswordReset = async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) {
      return { error: 'Supabase is not configured in .env.' };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${RESET_PASSWORD_PATH}`,
      });
      if (!error) return { error: null };
      console.warn('[Auth] Password reset email not sent:', error.message);
      if (/rate limit|too many/i.test(error.message)) return { error: 'Too many reset requests. Please wait a few minutes, then try again.' };
      if (/fetch|network/i.test(error.message)) return { error: friendlyAuthError(error.message) };
      return { error: "The reset email couldn't be sent right now. Please try again later, or ask the system administrator." };
    } catch (err: any) {
      return { error: friendlyAuthError(err.message || 'Could not send the reset email.') };
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
        requestPasswordReset,
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
