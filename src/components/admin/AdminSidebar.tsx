import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  MapPin,
  Users,
  Building2,
  ShieldCheck,
  Gavel,
  MessageSquare,
  Mail,
  Bot,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'News & Updates', to: '/admin/news', icon: Newspaper },
  { label: "Citizen's Services", to: '/admin/services', icon: FileText },
  { label: 'Barangays', to: '/admin/barangays', icon: MapPin },
  { label: 'Municipal Officials', to: '/admin/officials', icon: Users },
  { label: 'Offices Directory', to: '/admin/offices', icon: Building2 },
  { label: 'Transparency Seal', to: '/admin/transparency', icon: ShieldCheck },
  { label: 'Bids & Awards', to: '/admin/bids-awards', icon: Gavel },
  { label: 'Chat Logs', to: '/admin/chat-logs', icon: MessageSquare },
  { label: 'Messages Inbox', to: '/admin/messages', icon: Mail },
  { label: 'Chatbot Responses', to: '/admin/chatbot-responses', icon: Bot },
  { label: 'Account Settings', to: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user, isDemo, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-indigo-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-indigo-800 bg-indigo-900 text-white transition-transform duration-200 ease-gov lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-indigo-800/80 px-6 bg-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-gold text-indigo-950 font-bold font-display text-base">
              M
            </div>
            <div>
              <h1 className="font-display text-sm font-bold tracking-tight text-white">
                Magallanes LGU
              </h1>
              <p className="font-mono text-[10px] text-indigo-200 uppercase tracking-wider">
                Admin Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-indigo-200 hover:bg-indigo-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-indigo-200/60 font-semibold">
            Management Modules
          </p>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal text-white shadow-sm font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-800/70 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0 opacity-90" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info & links */}
        <div className="border-t border-indigo-800/80 p-4 bg-indigo-950/30 space-y-3">
          {/* User badge */}
          <div className="flex items-center justify-between text-xs">
            <div className="overflow-hidden">
              <p className="truncate font-semibold text-white text-xs">{user?.email || 'Admin User'}</p>
              <p className="font-mono text-[10px] text-teal-400">
                {isDemo ? 'Demo Mode Active' : 'Supabase Auth Verified'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded border border-indigo-700 bg-indigo-800/50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Public Site</span>
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded border border-red-900/60 bg-red-950/40 px-3 py-1.5 text-[11px] font-medium text-red-200 hover:bg-red-900/60 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3 w-3" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
