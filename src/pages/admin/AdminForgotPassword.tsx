import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, Loader2, Send, ArrowLeft, MailCheck } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { AdminAuthShell, AuthAlert, AuthNotice } from '../../components/admin/AdminAuthShell';
import { usePageTitle } from '../../lib/usePageTitle';

/**
 * "Forgot password?": emails a link to set a new password. The page says the same thing whether
 * or not the email has an account, so it can't be used to check which emails are admins.
 */
export function AdminForgotPassword() {
  usePageTitle('Reset your password');
  const location = useLocation();
  // The sign-in page passes the email typed there, so the admin doesn't type it twice.
  const typed = (location.state as { email?: string } | null)?.email || '';
  const [email, setEmail] = useState(typed);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const address = email.trim();
    const res = await requestPasswordReset(address);
    setLoading(false);
    if (res.error) setError(res.error);
    else setSentTo(address);
  };

  return (
    <AdminAuthShell>
      <h1 className="font-display text-[1.75rem] font-bold leading-tight text-brand-800">Reset your password</h1>

      {sentTo ? (
        <>
          <AuthNotice icon={<MailCheck className="h-4 w-4" />}>
            If <strong className="font-semibold [overflow-wrap:anywhere]">{sentTo}</strong> has an admin account, we've sent it a link to set a new
            password. The link works once and expires in 1 hour.
          </AuthNotice>
          <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-muted">
            No email after a few minutes? Check your spam folder, then{' '}
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800"
            >
              try again
            </button>
            . If you still can't sign in, ask the system administrator.
          </p>
        </>
      ) : (
        <>
          <p className="mt-1.5 text-[0.9375rem] text-ink-muted">Enter the email you sign in with. We'll email you a link to set a new password.</p>

          {error && <AuthAlert>{error}</AuthAlert>}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label className="field-label" htmlFor="reset-email">
                Email address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  inputMode="email"
                  spellCheck={false}
                  enterKeyHint="send"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@magallanes.gov.ph"
                  className="field h-12 pl-10 text-base"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg h-12 w-full rounded-xl">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <>
                  Send reset link
                  <Send className="h-4 w-4" aria-hidden="true" />
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
