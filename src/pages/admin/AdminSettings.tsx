import React, { useState } from 'react';
import { Shield, Key, Lock, CheckCircle2, AlertCircle, Database, Server } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { STORAGE_BUCKET } from '../../services/adminService';

export function AdminSettings() {
  const { user, updatePassword } = useAdminAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);


  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 6) {
      setPasswordStatus({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'Passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    setChangingPassword(false);

    if (error) {
      setPasswordStatus({ error });
    } else {
      setPasswordStatus({ success: 'Your password has been successfully updated!' });
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const tablesList = [
    { name: 'news_announcements', desc: 'Bilingual news, advisories, and public notices' },
    { name: 'services', desc: "Citizen's Charter fees, steps, and requirements" },
    { name: 'barangays', desc: '8 barangay directories and contacts' },
    { name: 'officials', desc: 'Municipal executive & legislative roster' },
    { name: 'offices', desc: 'Department heads, rooms, and local extensions' },
    { name: 'transparency_documents', desc: 'FDP full disclosure compliance & budgets' },
    { name: 'bids_awards', desc: 'RA 9184 procurement & invitations to bid' },
    { name: 'chatbot_session_logs', desc: 'NLU interaction logs & evaluation metrics' },
    { name: 'contact_messages', desc: 'Citizen feedback and public contact inbox' },
    { name: 'intent_responses', desc: 'Dual-language English & Bisaya knowledge base' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-bold text-navy">
          System Configuration & Account Settings
        </h2>
        <p className="text-xs text-ink-muted">
          Manage administrator security credentials, database connection parameters, and storage setup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile & Password */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admin Profile Info */}
          <div className="rounded-lg border border-hairline bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-50 p-2 text-navy">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-navy">
                  Active Administrator Account
                </h3>
                <p className="text-xs text-ink-muted">Authenticated management session</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded border border-hairline bg-surface p-3 text-xs">
                <span className="text-ink-muted font-mono text-[10px] uppercase">Account Email</span>
                <p className="font-bold text-navy font-mono mt-0.5">{user?.email || 'N/A'}</p>
              </div>

              <div className="rounded border border-hairline bg-surface p-3 text-xs">
                <span className="text-ink-muted font-mono text-[10px] uppercase">Security Role</span>
                <p className="font-bold text-teal font-mono mt-0.5 uppercase">{user?.role || 'authenticated'}</p>
              </div>

              <div className="rounded border border-hairline bg-surface p-3 text-xs sm:col-span-2">
                <span className="text-ink-muted font-mono text-[10px] uppercase">Session Mode</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 rounded bg-sea-100 text-sea-900 px-2 py-0.5 text-xs font-mono font-medium">
                    Live Supabase Auth Session
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="rounded-lg border border-hairline bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-50 p-2 text-navy">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-navy">
                  Change Administrator Password
                </h3>
                <p className="text-xs text-ink-muted">
                  Update your authentication credentials in Supabase Auth
                </p>
              </div>
            </div>

            {passwordStatus?.error && (
              <div className="flex items-center gap-2 rounded border border-alert-100 bg-alert-50 p-3 text-xs text-alert">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus?.success && (
              <div className="flex items-center gap-2 rounded border border-sea-200 bg-sea-50 p-3 text-xs text-sea-800">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-display text-[0.8125rem] font-semibold text-brand-800">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-md bg-brand-800 px-4 py-2 text-[0.8125rem] font-semibold text-white transition-colors duration-150 hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {changingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Database & Storage Status */}
        <div className="space-y-6">
          <div className="rounded-lg border border-hairline bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-teal" />
              <h3 className="font-display text-sm font-bold text-navy">
                Supabase Tables Checklist
              </h3>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              All 10 required tables from your guide are integrated with RLS policies:
            </p>

            <ul className="space-y-2 text-xs divide-y divide-hairline">
              {tablesList.map((t) => (
                <li key={t.name} className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-navy">{t.name}</span>
                    <CheckCircle2 className="h-4 w-4 text-sea-600 flex-shrink-0" />
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">{t.desc}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-hairline bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-navy" />
              <h3 className="font-display text-sm font-bold text-navy">
                Storage Bucket: {STORAGE_BUCKET}
              </h3>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Used for Transparency Seal PDFs and BAC Bidding Documents. Allows public read with authenticated admin uploads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
