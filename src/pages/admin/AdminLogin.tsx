import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useAdminAuth, IDLE_LIMIT_MS } from '../../contexts/AdminAuthContext';
import { AdminAuthShell, AuthAlert, AuthNotice } from '../../components/admin/AdminAuthShell';
import { usePageTitle } from '../../lib/usePageTitle';

const IDLE_MINUTES = Math.round(IDLE_LIMIT_MS / 60_000);

type LoginState = { from?: { pathname?: string }; passwordChanged?: boolean } | null;

export function AdminLogin() {
  usePageTitle('Admin sign in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginWithSupabase, signOutReason } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LoginState;
  const from = state?.from?.pathname || '/admin';
  const passwordChanged = Boolean(state?.passwordChanged);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginWithSupabase(email.trim(), password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      setPassword('');
    } else {
      navigate(from, { replace: true });
    }
  };

  const onPasswordKey = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState?.('CapsLock') ?? false);

  return (
    <AdminAuthShell>
      <h1 className="font-display text-[1.75rem] font-bold leading-tight text-brand-800">Sign in</h1>
      <p className="mt-1.5 text-[0.9375rem] text-ink-muted">Use the email and password issued to you by the LGU.</p>

      {passwordChanged && !error && (
        <AuthNotice icon={<CheckCircle2 className="h-4 w-4 text-accent-700" />}>Your password was changed. Sign in with your new password.</AuthNotice>
      )}

      {signOutReason === 'idle' && !error && !passwordChanged && (
        <AuthNotice icon={<Clock className="h-4 w-4" />}>
          You were signed out after {IDLE_MINUTES} minutes of inactivity. Please sign in again.
        </AuthNotice>
      )}

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label className="field-label" htmlFor="admin-email">
            Email address
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@magallanes.gov.ph"
              className="field h-12 pl-10 text-base"
            />
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label className="field-label" htmlFor="admin-pass">
              Password
            </label>
            <Link
              to="/admin/forgot-password"
              state={{ email: email.trim() }}
              className="font-sans text-[0.8125rem] font-semibold text-brand-600 underline-offset-2 hover:text-brand-800 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              id="admin-pass"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={onPasswordKey}
              onKeyDown={onPasswordKey}
              aria-describedby={capsLock ? 'caps-warning' : undefined}
              className="field h-12 pl-10 pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              aria-controls="admin-pass"
              className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-brand-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {capsLock && (
            <p id="caps-warning" className="mt-1.5 text-[0.8125rem] font-medium text-fiesta-700">
              Caps Lock is on.
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg h-12 w-full rounded-xl">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 flex items-start gap-2.5 rounded-xl bg-surface-muted p-3.5 text-[0.8125rem] leading-relaxed text-ink-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" aria-hidden="true" />
        <span>
          For authorized municipal staff only. For your security you are signed out when you close the browser,
          or after {IDLE_MINUTES} minutes of inactivity.
        </span>
      </p>
    </AdminAuthShell>
  );
}
