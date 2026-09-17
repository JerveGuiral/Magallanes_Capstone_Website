import React, { useState, useEffect } from 'react';
import { Menu, LogOut, CheckCircle2, Shield, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { isSupabaseConfigured } from '../../services/adminService';

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'System Overview & Analytics',
  '/admin/': 'System Overview & Analytics',
  '/admin/news': 'News & Announcements Manager',
  '/admin/services': "Citizen's Charter & Services",
  '/admin/barangays': 'Barangay Records',
  '/admin/officials': 'Municipal Officials',
  '/admin/offices': 'Offices & Department Directory',
  '/admin/transparency': 'Transparency Seal Documents',
  '/admin/bids-awards': 'Bids & Awards (BAC)',
  '/admin/chat-logs': 'Chatbot Session Inquiries',
  '/admin/messages': 'Citizen Feedback & Inquiries',
  '/admin/chatbot-responses': 'Knowledge Base & Bisaya Responses',
  '/admin/settings': 'System Settings & Credentials',
};

export function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const configured = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-hairline bg-white px-4 shadow-subtle sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-hairline text-brand-800 transition-colors duration-150 hover:border-brand-400 hover:bg-brand-50 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate font-display text-[0.9375rem] font-bold text-brand-800 sm:text-[1.0625rem]">
            {PAGE_TITLES[location.pathname] || 'Admin Portal'}
          </h1>
          <p className="hidden text-[0.6875rem] text-ink-muted sm:block">
            Municipality of Magallanes · Administrative Management Console
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2.5 sm:gap-3.5">
        {/* Clock — operators timestamp postings against it, so it is monospaced
            and never reflows as the seconds tick. */}
        <div className="hidden items-center gap-1.5 rounded-md border border-hairline bg-surface px-2.5 py-1.5 font-mono text-[0.6875rem] text-ink-muted md:flex">
          <Clock className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
          <span>{time} (PST)</span>
        </div>

        {configured ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-sea-200 bg-sea-50 px-2.5 py-1 font-display text-[0.6875rem] font-semibold text-sea-800"
            title="Connected to Supabase PostgreSQL"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-sea-700" aria-hidden="true" />
            <span className="hidden sm:inline">Supabase connected</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 py-1 font-display text-[0.6875rem] font-semibold text-ink-muted">
            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Offline mode</span>
          </span>
        )}

        <div className="flex items-center gap-2.5 border-l border-hairline pl-2.5 sm:pl-3.5">
          <div className="hidden text-right lg:block">
            <p className="max-w-[140px] truncate font-display text-[0.8125rem] font-bold text-brand-800">
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-[0.625rem] text-ink-muted">LGU Officer</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="grid h-9 w-9 place-items-center rounded-md border border-hairline text-ink-muted transition-colors duration-150 hover:border-alert-600/40 hover:bg-alert-50 hover:text-alert-600"
            title="Sign out of Admin Portal"
            aria-label="Sign out of Admin Portal"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
