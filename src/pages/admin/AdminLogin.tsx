import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { BitaugMotif } from '../../components/BitaugMotif';
import { SealImage } from '../../components/ui/Picture';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginWithSupabase } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginWithSupabase(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-brand-900 px-4 py-12">
      {/* Deep navy ground: the login screen is the boundary between the public
          site and the console, and should not look like either one. */}
      <BitaugMotif className="pointer-events-none absolute -left-10 bottom-0 hidden h-80 w-96 text-white/[0.05] lg:block" />
      <BitaugMotif className="pointer-events-none absolute -right-10 top-0 hidden h-72 w-80 text-white/[0.04] lg:block" />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-xl bg-white shadow-overlay">
          <span className="block h-1.5 w-full bg-accent-500" aria-hidden="true" />

          <div className="p-8">
            <div className="text-center">
              <SealImage alt="Municipal seal of Magallanes" priority className="mx-auto h-20 w-20 object-contain" />
              <h1 className="mt-4 font-display text-xl font-extrabold tracking-[-0.015em] text-brand-800">
                Municipality of Magallanes
              </h1>
              <p className="mt-1.5 font-display text-eyebrow uppercase text-accent-700">
                Administrative Management Console
              </p>
              <p className="mt-3 text-[0.875rem] text-ink-muted">
                Sign in with authorized municipal credentials.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-md border-l-[3px] border-alert-600 bg-alert-50 p-3.5 text-[0.875rem] text-alert-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-alert-600" aria-hidden="true" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="field-label" htmlFor="admin-email">
                  Official email address
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@magallanes.gov.ph"
                    className="field pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="admin-pass">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                    aria-hidden="true"
                  />
                  <input
                    id="admin-pass"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="field pl-9"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign in with Supabase
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-hairline pt-5 text-center">
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 font-display text-[0.8125rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                <ArrowLeft
                  className="h-3.5 w-3.5 transition-transform duration-150 ease-gov group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                Return to public website
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[0.75rem] text-brand-200">
          <ShieldCheck className="h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
          Magallanes LGU · Information &amp; Communications Technology Office
        </p>
      </div>
    </div>
  );
}
