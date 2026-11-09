import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, Loader2, Eye, EyeOff, ShieldCheck, Clock } from 'lucide-react';
import { useAdminAuth, IDLE_LIMIT_MS } from '../../contexts/AdminAuthContext';
import { Picture, SealImage } from '../../components/ui/Picture';
import { usePageTitle } from '../../lib/usePageTitle';

const IDLE_MINUTES = Math.round(IDLE_LIMIT_MS / 60_000);

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

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/admin';

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
    <div className="grid min-h-[100dvh] w-full bg-surface-muted lg:grid-cols-[1.05fr_1fr]">
      {/* ---- Left: the Municipal Hall (desktop). Pinned to the screen height, so its text
              is never pushed below the fold by a tall form. ---- */}
      <aside className="relative hidden overflow-hidden bg-brand-800 lg:sticky lg:top-0 lg:block lg:h-[100dvh]">
        <Picture
          name="municipal-hall-1"
          alt=""
          sizes="55vw"
          priority
          className="absolute inset-0 block h-full w-full"
          imgClassName="h-full w-full object-cover"
          style={{ objectPosition: 'center 45%' }}
        />
        {/* Darker only where the text sits: top for the identity, bottom for the message. */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent" aria-hidden="true" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-card">
              <SealImage className="h-10 w-10 object-contain" />
            </span>
            <span className="leading-tight text-white">
              <span className="block font-display text-lg font-bold">Municipality of Magallanes</span>
              <span className="text-[0.8125rem] text-white/85">Province of Agusan del Norte</span>
            </span>
          </div>

          <div className="max-w-lg">
            <p className="font-sans text-eyebrow uppercase text-fiesta-300">Admin portal</p>
            <p className="mt-3 font-display text-[2.25rem] font-bold leading-tight text-white">
              Keep the people of Magallanes informed.
            </p>
            <p className="mt-3 text-[1rem] leading-relaxed text-white/90">
              Publish news and advisories, update services and officials, and see what residents ask Bitoy.
            </p>
          </div>
        </div>
      </aside>

      {/* ---- Right: sign-in ---- */}
      <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[26rem]">
          {/* Phones: identity above the card (the photo panel is desktop-only). */}
          <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
            <SealImage alt="Municipal seal of Magallanes" priority className="h-12 w-12 object-contain" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-brand-800">Municipality of Magallanes</span>
              <span className="text-[0.8125rem] text-ink-muted">Admin portal</span>
            </span>
          </div>

          <div className="rounded-3xl border border-hairline bg-white p-7 shadow-raised sm:p-9">
            <h1 className="font-display text-[1.75rem] font-bold leading-tight text-brand-800">Sign in</h1>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">Use the email and password issued to you by the LGU.</p>

            {signOutReason === 'idle' && !error && (
              <div role="status" className="mt-6 flex items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[0.875rem] text-brand-800">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="leading-relaxed">You were signed out after {IDLE_MINUTES} minutes of inactivity. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-xl border border-alert-600/25 bg-alert-50 p-3.5 text-[0.875rem] text-alert-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-alert-600" aria-hidden="true" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="field-label" htmlFor="admin-email">
                  Email address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="username"
                    inputMode="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@magallanes.gov.ph"
                    className="field h-12 pl-10 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="admin-pass">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                  <input
                    id="admin-pass"
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
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:-translate-x-0.5" aria-hidden="true" />
              Return to public website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
