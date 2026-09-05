import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheckIcon, LockIcon, MailIcon, ArrowRightIcon, SparklesIcon, CheckCircle2Icon } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { isSupabaseLive } from '../services/supabaseAdminService';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@magallanes.gov.ph');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Invalid administrator login credentials.');
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-navy text-white shadow-raised ring-4 ring-teal/20">
            <span className="font-display text-2xl font-bold text-teal-200">M</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy">
            Municipality of Magallanes
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
            Official LGU Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-md border border-slate-200 bg-white p-6 sm:p-8 shadow-raised">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-navy">
              <ShieldCheckIcon className="h-4 w-4 text-teal" />
              <span>Restricted Access</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
              <span className={`h-2 w-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isSupabaseLive ? 'Live Supabase' : 'Offline / Demo Ready'}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded border border-alert-200 bg-alert-50 p-3 text-xs text-alert-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Official Admin Email
              </label>
              <div className="relative mt-1">
                <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@magallanes.gov.ph"
                  className="w-full rounded border border-slate-200 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-slate-200 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded bg-navy py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-navy-900 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Demo Login */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="flex w-full items-center justify-center gap-2 rounded border border-teal-200 bg-teal-50/60 py-2 text-xs font-semibold text-teal hover:bg-teal-100 transition-colors"
            >
              <SparklesIcon className="h-3.5 w-3.5 text-teal" />
              <span>Instant 1-Click Administrator Access</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              For evaluation, development, and capstone presentation walkthroughs.
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-medium text-slate-500 hover:text-teal transition-colors">
            ← Return to Citizen Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};
