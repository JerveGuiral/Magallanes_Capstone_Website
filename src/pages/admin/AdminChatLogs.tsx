import React, { useEffect, useRef, useState } from 'react';
import { Search, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService, ChatSessionLog } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';

// Supabase returns at most 1,000 rows per request by default. Loading that many keeps the
// metrics cards and CSV export meaningful; the table itself is paginated below.
const LOG_LIMIT = 1000;
const PAGE_SIZES = [10, 20, 50];

/** Page numbers to show, collapsing long runs into '…': 1 … 4 5 6 … 20 */
function pageNumbers(page: number, totalPages: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push('…');
  pages.push(totalPages);
  return pages;
}

export function AdminChatLogs() {
  const [items, setItems] = useState<ChatSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'bisaya' | 'english'>('all');
  const [selectedIntent, setSelectedIntent] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const tableRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getChatLogs(LOG_LIMIT);
      if (error) throw error;
      // No fabricated fallback: an empty table means the table is empty.
      // Seeded placeholder rows carried non-UUID ids, so editing or
      // deleting one could never reach the database.
      setItems((data || []) as ChatSessionLog[]);
    } catch (e) {
      console.warn('Could not fetch chat logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute evaluation metrics for capstone presentation
  const totalLogs = items.length;
  const bisayaLogs = items.filter((i) => i.language_detected?.toLowerCase() === 'bisaya').length;
  const englishLogs = items.filter((i) => i.language_detected?.toLowerCase() === 'english').length;
  const bisayaPercentage = totalLogs > 0 ? Math.round((bisayaLogs / totalLogs) * 100) : 0;

  // Extract unique intents
  const uniqueIntents = Array.from(
    new Set(items.map((i) => i.detected_intent).filter(Boolean))
  ) as string[];

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Session ID', 'User Message', 'Detected Intent', 'Bot Response', 'Language', 'Timestamp'];
    const rows = filteredItems.map((i) => [
      `"${i.session_id}"`,
      `"${(i.user_message || '').replace(/"/g, '""')}"`,
      `"${(i.detected_intent || '').replace(/"/g, '""')}"`,
      `"${(i.bot_response || '').replace(/"/g, '""')}"`,
      `"${i.language_detected || 'Unknown'}"`,
      `"${i.created_at || ''}"`,
    ]);

    // Leading BOM so Excel reads the file as UTF-8 — otherwise "Santo Niño" and other
    // Bisaya text comes out garbled.
    const csvContent = '﻿' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `magallanes_chat_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    const matchSearch =
      (it.user_message && it.user_message.toLowerCase().includes(q)) ||
      (it.bot_response && it.bot_response.toLowerCase().includes(q)) ||
      (it.session_id && it.session_id.toLowerCase().includes(q));
    const matchLang =
      languageFilter === 'all' ||
      it.language_detected?.toLowerCase() === languageFilter;
    const matchIntent =
      selectedIntent === 'all' || it.detected_intent === selectedIntent;
    return matchSearch && matchLang && matchIntent;
  });

  // A new filter or page size starts over at the first page.
  useEffect(() => {
    setPage(1);
  }, [search, languageFilter, selectedIntent, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  // A refresh can shrink the list below the current page.
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredItems.slice(firstIndex, firstIndex + pageSize);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-800">
            Chatbot Session Inquiries & NLU Logs
          </h2>
          <p className="text-xs text-ink-muted">
            Read-only audit of citizen chat sessions, detected intents, and Bisaya/English language usage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded border border-hairline bg-white px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-surface transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV for Defense</span>
          </button>
        </div>
      </div>

      {/* Capstone Evaluation Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            Total Logged Inquiries
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-800">{totalLogs}</p>
          <p className="text-[11px] text-ink-muted mt-1">Multi-turn session queries</p>
        </div>

        <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-brand-800">
              Bisaya Queries Share
            </p>
            <span className="font-mono text-xs font-bold text-brand-600">{bisayaPercentage}%</span>
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-brand-950">{bisayaLogs}</p>
          <p className="text-[11px] text-brand-800 mt-1">Localized Cebuano-Bisaya dialect</p>
        </div>

        <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            English Queries
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-800">{englishLogs}</p>
          <p className="text-[11px] text-ink-muted mt-1">Standard English inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-subtle" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by citizen question, bot reply, or session ID..."
            className="w-full rounded-md border border-hairline bg-white py-2 pl-9 pr-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-neutral-300 focus:border-brand-600"
          />
        </div>

        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value as any)}
          className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-brand-800 focus:bg-white"
        >
          <option value="all">All Languages</option>
          <option value="bisaya">Bisaya Only</option>
          <option value="english">English Only</option>
        </select>

        <select
          value={selectedIntent}
          onChange={(e) => setSelectedIntent(e.target.value)}
          className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-brand-800 focus:bg-white max-w-xs"
        >
          <option value="all">All Intents ({uniqueIntents.length})</option>
          {uniqueIntents.map((intent) => (
            <option key={intent} value={intent}>
              {intent}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-hidden card scroll-mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
              <tr>
                <th className="py-3 px-4">Session & Time</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Citizen User Message</th>
                <th className="py-3 px-4">NLU Detected Intent</th>
                <th className="py-3 px-4">Automated Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    Loading session logs...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No chat session logs matching filters.
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      <p className="font-semibold text-brand-800">
                        {item.session_id.length > 14
                          ? `${item.session_id.substring(0, 14)}...`
                          : item.session_id}
                      </p>
                      <p className="text-[10px] text-ink-subtle">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.language_detected || 'Unknown'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-brand-800 max-w-xs">
                      <p className="leading-snug">{item.user_message}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-brand-600 max-w-xs">
                      {item.detected_intent || 'Default Fallback'}
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted max-w-sm">
                      <p className="line-clamp-2 leading-relaxed text-[11px]">{item.bot_response}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredItems.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-hairline bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <span>
                Showing <span className="font-semibold text-brand-800">{firstIndex + 1}</span>–
                <span className="font-semibold text-brand-800">{firstIndex + pageItems.length}</span> of{' '}
                <span className="font-semibold text-brand-800">{filteredItems.length}</span>
              </span>
              <label className="flex items-center gap-1.5">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded border border-hairline bg-white px-2 py-1 text-xs text-ink focus:border-brand-800"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <nav className="flex items-center gap-1" aria-label="Chat logs pages">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded border border-hairline bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {pageNumbers(currentPage, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`gap-${i}`} className="px-1.5 text-xs text-ink-subtle" aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-current={p === currentPage ? 'page' : undefined}
                    className={`min-w-[2rem] rounded border px-2 py-1.5 text-xs font-semibold transition-colors ${
                      p === currentPage
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-hairline bg-white text-brand-800 hover:bg-surface'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded border border-hairline bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
