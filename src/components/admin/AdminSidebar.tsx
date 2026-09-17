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

/* Flat list kept exported — other modules import it for route metadata. */
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

/**
 * Twelve undifferentiated links is a scan problem, not a scroll problem.
 * Grouping them by what the operator is trying to do turns one long list into
 * four short ones, each short enough to take in at a glance.
 */
const NAV_GROUPS: { heading: string; items: typeof ADMIN_NAV_ITEMS }[] = [
  { heading: 'Overview', items: ADMIN_NAV_ITEMS.slice(0, 1) },
  { heading: 'Content', items: [ADMIN_NAV_ITEMS[1], ADMIN_NAV_ITEMS[2]] },
  { heading: 'Directory', items: [ADMIN_NAV_ITEMS[3], ADMIN_NAV_ITEMS[4], ADMIN_NAV_ITEMS[5]] },
  { heading: 'Governance', items: [ADMIN_NAV_ITEMS[6], ADMIN_NAV_ITEMS[7]] },
  { heading: 'Engagement', items: [ADMIN_NAV_ITEMS[8], ADMIN_NAV_ITEMS[9], ADMIN_NAV_ITEMS[10]] },
  { heading: 'System', items: [ADMIN_NAV_ITEMS[11]] },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-brand-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 flex w-72 flex-col border-r border-brand-800 bg-brand-900 text-white transition-transform duration-200 ease-gov lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* ---- Brand ---- */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-brand-950/50 px-5">
          <div className="flex items-center gap-3">
            <img
              src="/seal-removebg-preview.png"
              alt="Municipal seal of Magallanes"
              className="h-11 w-11 shrink-0 object-contain"
            />
            <div>
              <h1 className="font-display text-[0.9375rem] font-extrabold tracking-[-0.01em] text-white">
                Magallanes LGU
              </h1>
              <p className="font-display text-[0.625rem] font-bold uppercase tracking-[0.1em] text-accent-400">
                Admin Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-brand-200 transition-colors duration-150 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ---- Navigation ---- */}
        <nav className="admin-scroll flex-1 overflow-y-auto px-3 py-4" aria-label="Admin sections">
          {NAV_GROUPS.map((group) => (
            <div key={group.heading} className="mb-5 last:mb-0">
              <p className="px-3 pb-2 font-display text-[0.625rem] font-bold uppercase tracking-[0.12em] text-brand-300">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.exact}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.875rem] transition-colors duration-150 ${
                            isActive
                              ? 'bg-brand-600 font-semibold text-white'
                              : 'font-medium text-brand-100 hover:bg-white/[0.07] hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Brass rail — the same active marker the public nav uses. */}
                            {isActive && (
                              <span
                                className="absolute inset-y-1.5 -left-3 w-1 rounded-r-full bg-accent-500"
                                aria-hidden="true"
                              />
                            )}
                            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ---- Session ---- */}
        <div className="shrink-0 space-y-3 border-t border-white/10 bg-brand-950/40 p-4">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-600 font-display text-[0.8125rem] font-bold uppercase text-white"
              aria-hidden="true"
            >
              {(user?.email || 'A').slice(0, 1)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] font-semibold text-white">{user?.email || 'Admin User'}</p>
              <p className="flex items-center gap-1 font-mono text-[0.625rem] text-sea-500">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sea-500" aria-hidden="true" />
                Supabase verified
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-2.5 py-2 text-[0.75rem] font-medium text-brand-100 transition-colors duration-150 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Public site
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 rounded-md border border-alert-600/40 bg-alert-900/30 px-3 py-2 text-[0.75rem] font-medium text-alert-100 transition-colors duration-150 hover:border-alert-600 hover:bg-alert-600 hover:text-white"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Exit
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
