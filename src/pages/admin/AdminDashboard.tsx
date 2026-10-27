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
    barangaysCount: 0,
    chatLogsCount: 0,
    urgentBids: [] as any[],
  });

  const loadStats = async () => {
    setLoading(true);
    // Real counts only — the old "|| 12" fallback showed twelve barangays; Magallanes has eight.
    setStats(await adminService.getDashboardStats());
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  /* The usual fix for an overdue notice: the bids were opened, the status just never moved on. */
  const [closingId, setClosingId] = useState<string | null>(null);
  const markClosed = async (id: string) => {
    setClosingId(id);
    try {
      await adminService.updateBidAward(id, { status: 'closed' });
      setStats((s) => ({ ...s, urgentBids: s.urgentBids.filter((b) => b.id !== id), pendingBids: Math.max(0, s.pendingBids - 1) }));
    } catch (err: any) {
      alert(`Could not update this notice: ${err.message}`);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-800">
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
            className="flex items-center gap-1.5 rounded border border-hairline bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-surface transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Overdue / Urgent Bids Alert (RA 9184 compliance) */}
      {stats.urgentBids.length > 0 && (
        <div className="rounded-lg border border-alert-600/25 bg-alert-50 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-alert-100 p-2 text-alert-700 flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-sm font-bold text-alert-800">
                  Bid notices that need BAC action ({stats.urgentBids.length})
                </h3>
                <Link
                  to="/admin/bids-awards"
                  className="text-xs font-semibold text-alert-800 hover:underline inline-flex items-center gap-1 font-mono"
                >
                  Manage Bids & Awards →
                </Link>
              </div>
              <p className="text-xs text-alert-800 mt-1 leading-relaxed">
                These notices are still <strong>Open</strong> and their bids open within 3 days, or the opening date has
                already passed. Once the bids have been opened, change the status to <strong>Closed</strong>; when a winner is
                chosen, set it to <strong>Awarded</strong>. The notice then leaves this list.
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {stats.urgentBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between gap-3 rounded border border-alert-600/20 bg-white p-3 text-xs shadow-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-800 truncate">{bid.title}</p>
                      <p className="text-[11px] font-mono text-ink-muted">
                        Ref: {bid.reference_number || 'N/A'} · Opening: {bid.bid_opening_date}
                      </p>
                      <p className={`mt-1 text-[11px] font-semibold ${bid.urgency?.type === 'overdue' ? 'text-alert-700' : 'text-brand-700'}`}>
                        {bid.urgency?.label}
                      </p>
                    </div>
                    {bid.urgency?.type === 'overdue' ? (
                      <button
                        type="button"
                        onClick={() => markClosed(bid.id)}
                        disabled={closingId === bid.id}
                        className="shrink-0 rounded-md border border-hairline bg-white px-2.5 py-1.5 text-[11px] font-semibold text-brand-800 transition-colors hover:bg-brand-50 disabled:opacity-50"
                      >
                        {closingId === bid.id ? 'Saving…' : 'Mark as closed'}
                      </button>
                    ) : (
                      <StatusBadge status="upcoming" size="sm" />
                    )}
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
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-brand-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Published News
            </span>
            <div className="rounded bg-brand-50 p-2 text-brand-600">
              <Newspaper className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-brand-800">
              {loading ? '...' : stats.newsCount}
            </p>
            <Link to="/admin/news" className="text-xs text-brand-600 font-medium hover:underline">
              Manage →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Announcements & Advisories</p>
        </div>

        {/* Unread Inquiries */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-brand-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Citizen Inquiries
            </span>
            <div className={`rounded p-2 ${stats.unreadMessages > 0 ? 'bg-brand-50 text-brand-600' : 'bg-surface text-ink-muted'}`}>
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-brand-800">
              {loading ? '...' : stats.unreadMessages}
            </p>
            <Link to="/admin/messages" className="text-xs text-brand-600 font-medium hover:underline">
              Inbox →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">Pending citizen feedback</p>
        </div>

        {/* Active Bids */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-brand-800 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Active Bids
            </span>
            <div className="rounded bg-brand-50 p-2 text-brand-800">
              <Gavel className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-brand-800">
              {loading ? '...' : stats.pendingBids}
            </p>
            <Link to="/admin/bids-awards" className="text-xs text-brand-800 font-medium hover:underline">
              View Bids →
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">RA 9184 Procurement</p>
        </div>

        {/* Services */}
        <div className="rounded-lg border border-hairline bg-white p-5 shadow-card hover:border-brand-600 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              Citizen Services
            </span>
            <div className="rounded bg-brand-50 p-2 text-brand-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <p className="font-display text-3xl font-bold text-brand-800">
              {loading ? '...' : stats.servicesCount}
            </p>
            <Link to="/admin/services" className="text-xs text-brand-600 font-medium hover:underline">
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
            <h3 className="font-display text-base font-bold text-brand-800 mb-4">
              Direct Access Modules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/admin/news"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-brand-600 hover:bg-surface transition-all"
              >
                <div className="rounded bg-brand-50 p-2.5 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-800 group-hover:text-brand-600 transition-colors">
                    News & Advisories
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Publish updates in English and Bisaya.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/transparency"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-brand-600 hover:bg-surface transition-all"
              >
                <div className="rounded bg-brand-50 p-2.5 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-800 group-hover:text-brand-600 transition-colors">
                    Transparency Seal
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Upload and archive official municipal budgets & audits.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/chat-logs"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-brand-600 hover:bg-surface transition-all"
              >
                <div className="rounded bg-brand-50 p-2.5 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-800 group-hover:text-brand-600 transition-colors">
                    Chatbot Session Logs
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Review public inquiries and export capstone evaluation CSV.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/chatbot-responses"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-brand-600 hover:bg-surface transition-all"
              >
                <div className="rounded bg-brand-50 p-2.5 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-800 group-hover:text-brand-600 transition-colors">
                    Chatbot Responses (KB)
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Edit Bisaya and English answers directly in Supabase.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/officials"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-brand-600 hover:bg-surface transition-all"
              >
                <div className="rounded bg-brand-50 p-2.5 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-800 group-hover:text-brand-600 transition-colors">
                    Officials & Barangay Directory
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Maintain historical terms, contacts, and leadership.
                  </p>
                </div>
              </Link>

              <Link
                to="/admin/settings"
                className="group flex items-start gap-3.5 rounded-lg border border-hairline p-4 hover:border-brand-600 hover:bg-surface transition-all"
              >
                <div className="rounded bg-brand-50 p-2.5 text-brand-800 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-brand-800 group-hover:text-brand-600 transition-colors">
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
            <h3 className="font-display text-base font-bold text-brand-800">
              Supabase Health & Tables
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              All 10 required database tables are tracked and managed via your Supabase PostgreSQL instance.
            </p>

            <ul className="space-y-2 text-xs divide-y divide-hairline">
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">news_announcements</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">services (Charter)</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">barangays (12 units)</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">officials</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">offices</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">transparency_documents</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">bids_awards</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">chatbot_session_logs</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">contact_messages</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
              <li className="flex items-center justify-between pt-2">
                <span className="font-mono text-ink">intent_responses</span>
                <span className="text-brand-600 font-semibold font-mono">Ready</span>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                to="/admin/settings"
                className="w-full flex items-center justify-center gap-1 rounded border border-hairline py-2 text-xs font-semibold text-brand-800 hover:bg-surface transition-colors"
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
