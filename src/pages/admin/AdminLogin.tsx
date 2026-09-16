import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { isSupabaseConfigured } from '../../services/adminService';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { loginWithSupabase, loginAsDemo } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin';
  const supabaseConnected = isSupabaseConfigured();

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

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#F1F5F9] px-4 py-12">
      {/* Decorative top bar */}
      <div className="w-full max-w-md bg-navy h-2 rounded-t-lg shadow-sm" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-hairline p-8 shadow-xl rounded-b-lg">
        {/* Header Branding */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-navy text-gold font-display text-2xl font-bold shadow-md">
            M
          </div>
          <h1 className="font-display text-xl font-bold text-navy">
            Municipality of Magallanes
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-teal font-semibold">
            Administrative Management Console
          </p>
          <p className="text-xs text-ink-muted">
            Sign in with authorized municipal credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded border border-red-200 bg-red-50 p-3 text-xs text-alert">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1" htmlFor="admin-email">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@magallanes.gov.ph"
                className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1" htmlFor="admin-pass">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="admin-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded border border-hairline bg-surface py-2 pl-9 pr-3 text-xs text-ink focus:border-navy focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded bg-navy py-2.5 px-4 text-xs font-bold text-white shadow hover:bg-indigo-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In with Supabase</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Dev Demo Mode Button — only ever rendered in local dev builds, stripped out of production */}
        {import.meta.env.DEV && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider text-ink-muted">
                <span className="bg-white px-2">or quick development access</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 rounded border border-teal-200 bg-teal-50 py-2.5 px-4 text-xs font-semibold text-teal-900 hover:bg-teal-100 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-teal" />
                <span>Enter as Demo / Dev Admin</span>
              </button>
              <p className="text-[11px] text-ink-muted text-center leading-snug">
                {supabaseConnected
                  ? 'Supabase client is loaded in environment. You can test directly with live tables or demo bypass.'
                  : 'Add your live VITE_SUPABASE_URL and key to .env for production authentication.'}
              </p>
            </div>
          </>
        )}

        {/* Return to website */}
        <div className="mt-8 text-center border-t border-hairline pt-4">
          <Link
            to="/"
            className="text-xs text-teal hover:underline font-mono inline-flex items-center gap-1"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-ink-muted font-mono">
        <ShieldCheck className="h-4 w-4 text-teal" />
        <span>Magallanes LGU · Information & Communications Technology Office</span>
      </div>
    </div>
  );
}
