import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  NewspaperIcon,
  FileTextIcon,
  MapPinIcon,
  UsersIcon,
  Building2Icon,
  ShieldCheckIcon,
  FileSpreadsheetIcon,
  MessageSquareIcon,
  MailIcon,
  BotIcon,
  SettingsIcon,
  LogOutIcon,
  ExternalLinkIcon,
  MenuIcon,
  XIcon,
  DatabaseIcon,
  SparklesIcon,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { isSupabaseLive } from '../services/supabaseAdminService';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboardIcon,
      exact: true,
    },
    {
      to: '/admin/news',
      label: 'News & Bulletins',
      icon: NewspaperIcon,
    },
    {
      to: '/admin/services',
      label: 'Services & Charter',
      icon: FileTextIcon,
    },
    {
      to: '/admin/barangays',
      label: 'Barangays',
      icon: MapPinIcon,
    },
    {
      to: '/admin/officials',
      label: 'Municipal Officials',
      icon: UsersIcon,
    },
    {
      to: '/admin/offices',
      label: 'Offices Directory',
      icon: Building2Icon,
    },
    {
      to: '/admin/transparency',
      label: 'Transparency Seal',
      icon: ShieldCheckIcon,
    },
    {
      to: '/admin/bids-awards',
      label: 'Bids & Awards',
      icon: FileSpreadsheetIcon,
      badge: 'RA 9184',
    },
    {
      to: '/admin/chat-logs',
      label: 'Chat Session Logs',
      icon: MessageSquareIcon,
      badge: 'Read-only',
    },
    {
      to: '/admin/messages',
      label: 'Citizen Messages',
      icon: MailIcon,
    },
    {
      to: '/admin/chatbot-responses',
      label: 'Chatbot Responses',
      icon: BotIcon,
      badge: 'Bisaya/EN',
    },
    {
      to: '/admin/settings',
      label: 'Settings & Database',
      icon: SettingsIcon,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isCurrent = (to: string, exact = false) => {
    if (exact) return pathname === to;
    return pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] font-sans antialiased text-ink">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-navy text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-teal text-white font-display font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <h1 className="font-display text-sm font-bold tracking-tight text-white">MAGALLANES LGU</h1>
              <p className="font-mono text-[10px] uppercase tracking-widest text-teal-200">Admin Portal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Database Status Pill */}
        <div className="border-b border-white/5 px-5 py-3">
          <div className="flex items-center justify-between rounded bg-white/5 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-3.5 w-3.5 text-teal-200" />
              <span className="font-mono text-[11px] text-slate-300">Supabase DB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}
              />
              <span className="font-mono text-[10px] text-slate-300">
                {isSupabaseLive ? 'Live RLS' : 'Local Staging'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-xs font-medium">
          {navItems.map((item) => {
            const active = isCurrent(item.to, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded px-3 py-2.5 transition-all duration-150 ${
                  active
                    ? 'bg-teal text-white font-semibold shadow-subtle'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-teal-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                      active ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-3 space-y-1 text-xs">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between rounded px-3 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLinkIcon className="h-3.5 w-3.5 text-teal-200" />
              View Public Website
            </span>
            <span className="text-[10px] text-slate-400">New tab</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded px-3 py-2 text-slate-400 transition-colors hover:bg-alert/20 hover:text-alert"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8 shadow-subtle">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Magallanes LGU</span>
              <span>/</span>
              <span className="capitalize text-teal font-medium">
                {pathname.split('/')[2]?.replace(/-/g, ' ') || 'Overview'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-semibold text-navy">{user?.name || 'Administrator'}</p>
              <p className="font-mono text-[10px] uppercase text-slate-500">{user?.email || 'admin@magallanes.gov.ph'}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-white shadow-sm ring-2 ring-teal/20">
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
};
