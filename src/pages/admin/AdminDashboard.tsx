import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper,
  Mail,
  Gavel,
  FileText,
  MessageSquare,
  MapPin,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newsCount: 0,
    unreadMessages: 0,
    pendingBids: 0,
    servicesCount: 0,
    barangaysCount: 12,
    chatLogsCount: 0,
    urgentBids: [] as any[],
  });

  const loadStats = async () => {
    setLoading(true);
    const data = await adminService.getDashboardStats();
    setStats({
      ...data,
      barangaysCount: data.barangaysCount || 12,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">
            Administrative Operations Dashboard
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Real-time status overview across municipal citizen services, public records, and public communications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadStats}
            disabled={loading}
            className="flex items-center gap-1.5 rounded border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:bg-surface transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Overdue / Urgent Bids Alert (RA 9184 compliance) */}
      {stats.urgentBids.length > 0 && (
        <div className="rounded-lg border border-accent-300 bg-accent-50/90 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-accent-200 p-2 text-accent-900 flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-accent-900">
                  Urgent BAC Notice: Upcoming or Pending Bid Openings ({stats.urgentBids.length})
                </h3>
                <Link
                  to="/admin/bids-awards"
                  className="text-xs font-semibold text-accent-900 hover:underline inline-flex items-center gap-1 font-mono"
                >
                  Manage Bids & Awards →
                </Link>
              </div>
              <p className="text-xs text-accent-900 mt-1 leading-relaxed">
                The following procurement projects require BAC attention because their bid opening date is scheduled within the next 3 days or is currently open:
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {stats.urgentBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between rounded border border-accent-200 bg-white p-3 text-xs shadow-xs"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="font-semibold text-navy truncate">{bid.title}</p>
                      <p className="text-[11px] font-mono text-ink-muted">
                        Ref: {bid.reference_number || 'N/A'} · Opening: {bid.bid_opening_date || 'TBD'}
                      </p>
                    </div>
                    <StatusBadge status="urgent" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* News */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-teal transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Published News
            </span>
            <div className="rounded bg-teal-50 p-2 text-teal">
              <Newspaper className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-navy">
              {loading ? '...' : stats.newsCount}
            </p>
            <Link to="/admin/news" className="text-xs text-teal font-medium hover:underline">
              Manage →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Announcements & Advisories</p>
        </div>

        {/* Unread Inquiries */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-accent-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Citizen Inquiries
            </span>
            <div className={`rounded p-2 ${stats.unreadMessages > 0 ? 'bg-accent-50 text-signal-600' : 'bg-surface text-ink-muted'}`}>
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-navy">
              {loading ? '...' : stats.unreadMessages}
            </p>
            <Link to="/admin/messages" className="text-xs text-signal-600 font-medium hover:underline">
              Inbox →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Pending citizen feedback</p>
        </div>

        {/* Active Bids */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-navy transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Active Bids
            </span>
            <div className="rounded bg-indigo-50 p-2 text-navy">
              <Gavel className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-navy">
              {loading ? '...' : stats.pendingBids}
            </p>
            <Link to="/admin/bids-awards" className="text-xs text-navy font-medium hover:underline">
              View Bids →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">RA 9184 Procurement</p>
        </div>

        {/* Services */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-teal transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Citizen Services
            </span>
            <div className="rounded bg-teal-50 p-2 text-teal">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-navy">
              {loading ? '...' : stats.servicesCount}
            </p>
            <Link to="/admin/services" className="text-xs text-teal font-medium hover:underline">
              Charter →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Documented frontline services</p>
        </div>
      </div>

      {/* Management Grid & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-hairline bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-navy mb-4">
              Direct Access Modules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/admin/news"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-teal hover:bg-surface transition-all"
              >
                <div className="rounded bg-indigo-50 p-2.5 text-navy group-hover:bg-teal group-hover:text-white transition-colors">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy group-hover:text-teal transition-colors">
                    News & Advisories
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Publish updates in English and Bisaya.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/transparency"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-teal hover:bg-surface transition-all"
              >
                <div className="rounded bg-indigo-50 p-2.5 text-navy group-hover:bg-teal group-hover:text-white transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy group-hover:text-teal transition-colors">
                    Transparency Seal
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Upload and archive official municipal budgets & audits.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/chat-logs"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-teal hover:bg-surface transition-all"
              >
                <div className="rounded bg-indigo-50 p-2.5 text-navy group-hover:bg-teal group-hover:text-white transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy group-hover:text-teal transition-colors">
                    Chatbot Session Logs
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Review public inquiries and export capstone evaluation CSV.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/chatbot-responses"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-teal hover:bg-surface transition-all"
              >
                <div className="rounded bg-indigo-50 p-2.5 text-navy group-hover:bg-teal group-hover:text-white transition-colors">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy group-hover:text-teal transition-colors">
                    Chatbot Responses (KB)
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Edit Bisaya and English answers directly in Supabase.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/officials"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-teal hover:bg-surface transition-all"
              >
                <div className="rounded bg-indigo-50 p-2.5 text-navy group-hover:bg-teal group-hover:text-white transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy group-hover:text-teal transition-colors">
                    Officials & Barangay Directory
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Maintain historical terms, contacts, and leadership.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/settings"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-teal hover:bg-surface transition-all"
              >
                <div className="rounded bg-indigo-50 p-2.5 text-navy group-hover:bg-teal group-hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-navy group-hover:text-teal transition-colors">
                    System & Credentials
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Database tables checklist and password management.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right: System Health & Database Summary */}
        <div className="space-y-6">
          <div className="rounded-lg border border-hairline bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-display text-base font-bold text-navy">
              Supabase Health & Tables
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              All 10 required database tables are tracked and managed via your Supabase PostgreSQL instance.
            </p>

            <ul className="space-y-2 text-xs divide-y divide-hairline">
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">news_announcements</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">services (Charter)</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">barangays (12 units)</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">officials</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">offices</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">transparency_documents</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">bids_awards</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">chatbot_session_logs</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">contact_messages</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">intent_responses</span>
                <span className="text-teal font-semibold font-mono">Ready</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/admin/settings"
                className="w-full flex items-center justify-center gap-1 rounded border border-hairline py-2 text-xs font-semibold text-navy hover:bg-surface transition-colors"
              >
                <span>View Full Connection Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
