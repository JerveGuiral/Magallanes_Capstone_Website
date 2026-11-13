import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Loader2, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { supabase, initialAuthHash } from '../../lib/supabaseClient';
import { AdminAuthShell, AuthAlert } from '../../components/admin/AdminAuthShell';
import { usePageTitle } from '../../lib/usePageTitle';

type Phase = 'checking' | 'ready' | 'invalid';

// The page was opened from a reset link (not just visited while signed in), or from a broken one.
const FROM_RESET_LINK = /(^|[#&?])type=recovery(&|$)/.test(initialAuthHash);
const LINK_ERROR = /(^|[#&?])error(_code)?=/.test(initialAuthHash);

// At least 8 characters, with a letter and a number (the browser checks it before sending).
const PASSWORD_PATTERN = '(?=.*[A-Za-z])(?=.*\\d).{8,}';

/**
 * Where the emailed reset link lands. Supabase signs the admin in from the link (it is proof
 * they own the email); here they choose a new password, are signed out, and sign in with it.
 * An expired or already-used link, or opening this page without one, says so.
 *
 * Only a reset link opens the form. Being signed in is not enough: otherwise anyone at an
 * unattended, still-signed-in computer could change the password without knowing the old one
 * and lock the admin out.
 */
export function AdminResetPassword() {
  usePageTitle('Set a new password');
  const navigate = useNavigate();
  const { updatePassword, logout } = useAdminAuth();
  const [phase, setPhase] = useState<Phase>(() => (LINK_ERROR || !FROM_RESET_LINK ? 'invalid' : 'checking'));
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Wait for Supabase to read the link and start the session; give up after a few seconds.
  useEffect(() => {
    if (phase !== 'checking') return;
    if (!supabase) {
      setPhase('invalid');
      return;
    }
    let settled = false;
    const ready = (email?: string) => {
      if (settled) return;
      settled = true;
      setAccount(email || '');
      setPhase('ready');
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) ready(session.user.email);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) ready(session.user.email);
    });
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setPhase('invalid');
      }
    }, 6000);
    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [phase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await updatePassword(password);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      inputRef.current?.focus();
      return;
    }
    // Sign out, so the next sign-in proves the new password works.
    await logout();
    navigate('/admin/login', { replace: true, state: { passwordChanged: true } });
  };

  return (
    <AdminAuthShell>
      <h1 className="font-display text-[1.75rem] font-bold leading-tight text-brand-800">Set a new password</h1>

      {phase === 'checking' && (
        <p role="status" className="mt-6 flex items-center gap-2.5 text-[0.9375rem] text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Checking your reset link…
        </p>
      )}

      {phase === 'invalid' && (
        <>
          <AuthAlert>This reset link has expired, was already used, or is incomplete. Request a new one — each link works once, for 1 hour.</AuthAlert>
          <Link to="/admin/forgot-password" className="btn btn-primary btn-lg mt-6 h-12 w-full rounded-xl">
            Request a new link
          </Link>
        </>
      )}

      {phase === 'ready' && (
        <>
          <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
            {account ? (
              <>
                For <strong className="font-semibold text-ink [overflow-wrap:anywhere]">{account}</strong>.{' '}
              </>
            ) : null}
            After saving, sign in with your new password.
          </p>

          {error && <AuthAlert>{error}</AuthAlert>}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {/* The account's email, hidden, so the browser saves the new password to the right account. */}
            {account && <input type="email" name="email" autoComplete="username" value={account} readOnly hidden />}
            <div>
              <label className="field-label" htmlFor="new-password">
                New password
              </label>
              <p id="new-password-rules" className="mt-1 text-[0.8125rem] text-ink-muted">
                At least 8 characters, with at least one letter and one number.
              </p>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                <input
                  ref={inputRef}
                  id="new-password"
                  name="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  pattern={PASSWORD_PATTERN}
                  title="At least 8 characters, with at least one letter and one number."
                  autoComplete="new-password"
                  enterKeyHint="done"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-describedby="new-password-rules"
                  className="field h-12 pl-10 pr-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  aria-controls="new-password"
                  className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-brand-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-lg h-12 w-full rounded-xl">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  Save new password
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 border-t border-hairline pt-5">
        <Link
          to="/admin/login"
          className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:-translate-x-0.5" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </AdminAuthShell>
  );
}
