import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NewspaperIcon,
  MailIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ShieldCheckIcon,
  MessageSquareIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  ClockIcon,
} from 'lucide-react';
import { supabaseAdmin, isSupabaseLive } from '../services/supabaseAdminService';
import { NewsAnnouncement, BidAward, ContactMessage, ServiceItem } from '../types';

export const DashboardOverview: React.FC = () => {
  const [news, setNews] = useState<NewsAnnouncement[]>([]);
  const [bids, setBids] = useState<BidAward[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [newsData, bidsData, messagesData, servicesData] = await Promise.all([
          supabaseAdmin.getNews(),
          supabaseAdmin.getBids(),
          supabaseAdmin.getMessages(),
          supabaseAdmin.getServices(),
        ]);
        setNews(newsData);
        setBids(bidsData);
        setMessages(messagesData);
        setServices(servicesData);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const publishedNewsCount = news.filter((n) => n.is_published).length;
  const unreadMessages = messages.filter((m) => !m.is_read && !m.is_archived);
  const openBids = bids.filter((b) => b.status === 'open');

  // Check upcoming/overdue bids
  const now = new Date();
  const criticalBids = openBids.filter((b) => {
    if (!b.bid_opening_date) return false;
    const opening = new Date(b.bid_opening_date);
    const diffDays = (opening.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 3; // within 3 days or past
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Municipal Administration Overview</h2>
          <p className="text-sm text-slate-500">
            Welcome back. Monitor citizen engagement, transparency disclosures, and manage official public bulletins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/news"
            className="inline-flex items-center gap-2 rounded bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-teal-700"
          >
            <PlusIcon className="h-4 w-4" />
            Post News Update
          </Link>
          <Link
            to="/admin/transparency"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <ShieldCheckIcon className="h-4 w-4 text-teal" />
            Upload Disclosure
          </Link>
        </div>
      </div>

      {/* Critical Action Banner if pending items */}
      {(unreadMessages.length > 0 || criticalBids.length > 0) && (
        <div className="rounded-md border border-amber-200 bg-amber-50/70 p-4 shadow-subtle">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1 space-y-1 text-sm text-amber-900">
              <h3 className="font-semibold">Action Required for Compliance & Citizen Inquiries</h3>
              <div className="flex flex-wrap gap-4 text-xs">
                {unreadMessages.length > 0 && (
                  <Link to="/admin/messages" className="underline font-medium hover:text-amber-700">
                    • {unreadMessages.length} unread citizen inquiry waiting in Inbox
                  </Link>
                )}
                {criticalBids.length > 0 && (
                  <Link to="/admin/bids-awards" className="underline font-medium hover:text-amber-700">
                    • {criticalBids.length} procurement bidding opening date is within 3 days or pending review
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Published News */}
        <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500">Bulletins & News</span>
            <div className="rounded bg-teal-50 p-2 text-teal">
              <NewspaperIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-navy">{publishedNewsCount}</span>
            <span className="text-xs text-slate-500 ml-2">published active</span>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <Link to="/admin/news" className="flex items-center gap-1 text-xs font-medium text-teal hover:underline">
              Manage bulletins <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Unread Messages */}
        <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500">Citizen Inquiries</span>
            <div className={`rounded p-2 ${unreadMessages.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
              <MailIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-navy">{unreadMessages.length}</span>
            <span className="text-xs text-slate-500 ml-2">awaiting response</span>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <Link to="/admin/messages" className="flex items-center gap-1 text-xs font-medium text-teal hover:underline">
              View inbox <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Active Procurement / Bids */}
        <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500">Bids & Procurement</span>
            <div className="rounded bg-indigo-50 p-2 text-indigo">
              <FileSpreadsheetIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-navy">{openBids.length}</span>
            <span className="text-xs text-slate-500 ml-2">open opportunities</span>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <Link to="/admin/bids-awards" className="flex items-center gap-1 text-xs font-medium text-teal hover:underline">
              Review RA 9184 bids <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Listed Citizen Charter Services */}
        <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500">Citizen's Charter</span>
            <div className="rounded bg-teal-50 p-2 text-teal">
              <FileTextIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-display text-3xl font-bold text-navy">{services.length}</span>
            <span className="text-xs text-slate-500 ml-2">active services</span>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <Link to="/admin/services" className="flex items-center gap-1 text-xs font-medium text-teal hover:underline">
              Manage requirements <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Navigation */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent News & Bids Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent News Card */}
          <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-sm font-bold text-navy">Latest Public Releases</h3>
              <Link to="/admin/news" className="text-xs text-teal font-semibold hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {news.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            item.category === 'advisory'
                              ? 'bg-alert-100 text-alert-900'
                              : item.category === 'event'
                              ? 'bg-teal-100 text-teal-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-navy text-sm">{item.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.body}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        item.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
            <h3 className="font-display text-sm font-bold text-navy mb-4">Quick Manager Shortcuts</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                to="/admin/barangays"
                className="flex flex-col rounded border border-slate-200 p-3 text-left transition-all hover:border-teal hover:bg-teal-50/20"
              >
                <span className="text-xs font-bold text-navy">Barangays</span>
                <span className="text-[11px] text-slate-500 mt-1">Captain contacts & population</span>
              </Link>
              <Link
                to="/admin/officials"
                className="flex flex-col rounded border border-slate-200 p-3 text-left transition-all hover:border-teal hover:bg-teal-50/20"
              >
                <span className="text-xs font-bold text-navy">Municipal Officials</span>
                <span className="text-[11px] text-slate-500 mt-1">Mayor, VM & SB roster</span>
              </Link>
              <Link
                to="/admin/chatbot-responses"
                className="flex flex-col rounded border border-slate-200 p-3 text-left transition-all hover:border-teal hover:bg-teal-50/20"
              >
                <span className="text-xs font-bold text-navy">Chatbot Responses</span>
                <span className="text-[11px] text-slate-500 mt-1">Edit Bisaya & English replies</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: System Status & Chatbot Highlights */}
        <div className="space-y-6">
          {/* Database Integration Card */}
          <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
            <h3 className="font-display text-sm font-bold text-navy">Supabase Architecture</h3>
            <div className="mt-3 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-semibold text-slate-700">PostgreSQL (Supabase)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Row Level Security (RLS):</span>
                <span className="font-semibold text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Public Document Bucket:</span>
                <span className="font-semibold text-slate-700 font-mono text-[11px]">public-documents</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Total Configured Tables:</span>
                <span className="font-bold text-teal">10 tables</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <Link
                to="/admin/settings"
                className="block text-center rounded bg-slate-50 py-2 text-xs font-semibold text-navy hover:bg-slate-100"
              >
                Inspect Connection Details
              </Link>
            </div>
          </div>

          {/* AI Chatbot Analytics Preview */}
          <div className="rounded border border-slate-200 bg-white p-5 shadow-subtle">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-navy">Public Assistance AI</h3>
              <MessageSquareIcon className="h-4 w-4 text-teal" />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Citizen queries are localized between English and Bisaya with session logging.
            </p>

            <div className="mt-4 rounded bg-slate-50 p-3 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Primary Language:</span>
                <span className="text-teal font-semibold">Bisaya / Cebuano (75%)</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Top Inquired Intent:</span>
                <span className="text-navy font-semibold">Business Permit</span>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link to="/admin/chat-logs" className="text-teal font-semibold hover:underline">
                View Chat Logs
              </Link>
              <Link to="/admin/chatbot-responses" className="text-slate-500 hover:text-navy">
                Edit Responses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
