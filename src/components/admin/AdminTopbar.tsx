import React, { useState, useEffect } from 'react';
import { Menu, LogOut, CheckCircle2, AlertTriangle, Shield, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { isSupabaseConfigured } from '../../services/adminService';

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

export function AdminTopbar({ onToggleSidebar }: AdminTopbarProps) {
  const { user, isDemo, logout } = useAdminAuth();
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

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/admin':
      case '/admin/':
        return 'System Overview & Analytics';
      case '/admin/news':
        return 'News & Announcements Manager';
      case '/admin/services':
        return "Citizen's Charter & Services";
      case '/admin/barangays':
        return 'Barangay Records';
      case '/admin/officials':
        return 'Municipal Officials';
      case '/admin/offices':
        return 'Offices & Department Directory';
      case '/admin/transparency':
        return 'Transparency Seal Documents';
      case '/admin/bids-awards':
        return 'Bids & Awards (BAC)';
      case '/admin/chat-logs':
        return 'Chatbot Session Inquiries';
      case '/admin/messages':
        return 'Citizen Feedback & Inquiries';
      case '/admin/chatbot-responses':
        return 'Knowledge Base & Bisaya Responses';
      case '/admin/settings':
        return 'System Settings & Credentials';
      default:
        return 'Admin Portal';
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const configured = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-hairline bg-white px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded p-1.5 text-navy hover:bg-surface lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-display text-base font-bold text-navy sm:text-lg">
            {getPageTitle(location.pathname)}
          </h1>
          <p className="hidden text-[11px] font-mono text-ink-muted sm:block">
            Municipality of Magallanes · Administrative Management Console
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-ink-muted bg-surface px-2.5 py-1 rounded border border-hairline">
          <Clock className="h-3.5 w-3.5 text-teal" />
          <span>{time} (PST)</span>
        </div>

        {/* Supabase Status Pill */}
        <div className="flex items-center gap-1.5">
          {isDemo ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-mono font-medium text-amber-800 border border-amber-200"
              title="Demo Mode: Changes operate locally"
            >
              <AlertTriangle className="h-3 w-3 text-amber-600" />
              <span className="hidden sm:inline">Demo Mode</span>
            </span>
          ) : configured ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-800 border border-emerald-200"
              title="Connected to Supabase PostgreSQL"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span className="hidden sm:inline">Supabase Connected</span>
            </span>
          ) : (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-medium text-slate-700 border border-slate-200"
            >
              <Shield className="h-3 w-3" />
              <span className="hidden sm:inline">Offline Mode</span>
            </span>
          )}
        </div>

        {/* User Pill & Sign out */}
        <div className="flex items-center gap-2 border-l border-hairline pl-3">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-bold text-navy truncate max-w-[140px]">
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
            <p className="text-[10px] font-mono text-ink-muted">LGU Officer</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 rounded border border-hairline p-1.5 text-xs text-ink-muted hover:bg-red-50 hover:text-alert hover:border-red-200 transition-colors"
            title="Sign out of Admin Portal"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
