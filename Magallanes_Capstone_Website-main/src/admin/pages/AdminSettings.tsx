import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  DatabaseIcon,
  ShieldIcon,
  KeyIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ServerIcon,
  ExternalLinkIcon,
  SaveIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { supabase, isConfigured, getSupabaseConfig } from '../../lib/supabaseClient';
import { isSupabaseLive } from '../services/supabaseAdminService';

export const AdminSettings: React.FC = () => {
  const { user } = useAdminAuth();

  // Supabase Credential form state
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrlInput(config.url || '');
    setSupabaseKeyInput(config.key || '');
  }, []);

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingConnection(true);
    setConnectionStatus(null);

    const cleanUrl = supabaseUrlInput.trim();
    const cleanKey = supabaseKeyInput.trim();

    if (!cleanUrl || !cleanKey) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: 'Both Supabase Project URL and API Key are required.',
      });
      setTestingConnection(false);
      return;
    }

    try {
      // Save to localStorage for instant client access
      localStorage.setItem('magallanes_supabase_url', cleanUrl);
      localStorage.setItem('magallanes_supabase_key', cleanKey);

      // Test real connection to news_announcements table
      const testClient = createClient(cleanUrl, cleanKey);
      const { data, error } = await testClient.from('news_announcements').select('id').limit(1);

      if (error) {
        setConnectionStatus({
          tested: true,
          success: false,
          message: `Connected to Supabase project, but query on 'news_announcements' returned: ${error.message}. Please verify table RLS policies.`,
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: true,
          message: 'Connection verified! Your website and admin dashboard are now live with Supabase.',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: `Connection failed: ${err.message || 'Please check your URL and network.'}`,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsUpdating(true);
    setStatusMsg(null);

    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setStatusMsg({ type: 'error', text: error.message });
          setIsUpdating(false);
          return;
        }
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.message });
        setIsUpdating(false);
        return;
      }
    }

    setStatusMsg({ type: 'success', text: 'Password updated successfully.' });
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy">Admin Portal Settings & Database</h2>
        <p className="text-sm text-slate-500">
          Connect your live Supabase cloud database, review table status, and manage administrative settings.
        </p>
      </div>

      {/* Live Supabase Connection Setup Box */}
      <div className="rounded border-2 border-teal-500/30 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <DatabaseIcon className="h-5 w-5 text-teal" />
            <div>
              <h3 className="font-display text-base font-bold text-navy">Supabase Cloud Database Connection</h3>
              <p className="text-xs text-slate-500">
                Paste your Project URL & Anon/Publishable Key here to connect your live Supabase tables instantly.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-mono text-xs font-semibold text-slate-700">
              {isSupabaseLive ? 'Live Connected' : 'Staging / Offline Store'}
            </span>
          </div>
        </div>

        {connectionStatus && (
          <div
            className={`rounded p-3 text-xs flex items-start gap-2 ${
              connectionStatus.success
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}
          >
            {connectionStatus.success ? (
              <CheckCircle2Icon className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangleIcon className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>{connectionStatus.message}</div>
          </div>
        )}

        <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Supabase Project URL
            </label>
            <input
              type="text"
              required
              value={supabaseUrlInput}
              onChange={(e) => setSupabaseUrlInput(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-mono text-xs text-ink focus:border-teal focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">
              Found in Supabase Dashboard → Settings → API → Project URL
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Supabase Publishable (Anon) Key
            </label>
            <input
              type="password"
              required
              value={supabaseKeyInput}
              onChange={(e) => setSupabaseKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="mt-1 w-full rounded border border-slate-200 px-3 py-2 font-mono text-xs text-ink focus:border-teal focus:outline-none"
            />
            <span className="text-[11px] text-slate-400">
              Found in Supabase Dashboard → Settings → API → Project API Keys (anon public)
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              {isSupabaseLive ? (
                <span className="text-emerald-700 font-medium">✓ Currently linked to live Supabase database</span>
              ) : (
                <span className="text-amber-700 font-medium">⚠️ Currently using local storage fallback</span>
              )}
            </p>
            <button
              type="submit"
              disabled={testingConnection}
              className="inline-flex items-center gap-2 rounded bg-teal px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              <SaveIcon className="h-4 w-4" />
              <span>{testingConnection ? 'Testing Connection...' : 'Save & Connect to Supabase'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Account Profile & Password */}
      <div className="rounded border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <KeyIcon className="h-5 w-5 text-teal" />
          <h3 className="font-display text-base font-bold text-navy">Administrator Account Security</h3>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded border border-slate-100 text-xs">
          <div className="h-10 w-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <p className="font-bold text-navy text-sm">{user?.name || 'LGU Administrator'}</p>
            <p className="font-mono text-slate-500">{user?.email || 'admin@magallanes.gov.ph'}</p>
            <span className="inline-block mt-1 rounded bg-teal-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-teal-900">
              Role: {user?.role || 'superadmin'}
            </span>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Change Admin Password</h4>

          {statusMsg && (
            <div
              className={`rounded p-3 text-xs font-medium ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-alert-50 text-alert-900 border border-alert-200'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="mt-1 w-full rounded border border-slate-200 px-3 py-2 text-sm text-ink focus:border-teal focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded bg-teal px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
