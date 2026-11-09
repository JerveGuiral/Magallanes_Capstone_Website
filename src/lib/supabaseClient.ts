import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[Supabase] Warning: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in environment variables.'
  );
}

/*
 * Where the admin sign-in is kept: sessionStorage, not localStorage.
 *
 * With Supabase's default (localStorage) a sign-in lasted forever on that computer: close
 * the browser, come back days later, click "Admin Portal" in the footer and the dashboard
 * opened with no password asked. On a shared office or demo computer that hands the CMS to
 * whoever sits down next. sessionStorage ends with the browser tab/window, so every new
 * visit has to sign in. (Each new tab also asks once — the safer trade-off.)
 *
 * Storage can throw (private mode, blocked site data); then nothing is stored and the
 * sign-in simply lasts for the page's lifetime.
 */
const tabStorage = {
  getItem: (key: string) => {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      /* storage unavailable — the sign-in lasts only while the page is open */
    }
  },
  removeItem: (key: string) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* nothing stored */
    }
  },
};

/* Sign-ins saved by the old setup are still sitting in localStorage and would keep a
 * browser signed in forever. Remove them, so that browser is asked for the password again. */
try {
  for (const key of Object.keys(window.localStorage)) {
    if (/^sb-.+-auth-token(-code-verifier)?$/.test(key)) window.localStorage.removeItem(key);
  }
} catch {
  /* storage unavailable — nothing to clear */
}

// Initialize Supabase JS Client using the PUBLISHABLE key (browser-safe, respects RLS)
export const supabase: SupabaseClient | null =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: { storage: tabStorage, persistSession: true, autoRefreshToken: true },
      })
    : null;

export default supabase;
