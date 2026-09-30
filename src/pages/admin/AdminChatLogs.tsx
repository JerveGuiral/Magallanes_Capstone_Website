import React, { useEffect, useState } from 'react';
import { Search, Download, MessageSquare, Filter, Bot, Globe, Calendar, RefreshCw } from 'lucide-react';
import { adminService, ChatSessionLog } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';

export function AdminChatLogs() {
  const [items, setItems] = useState<ChatSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'bisaya' | 'english'>('all');
  const [selectedIntent, setSelectedIntent] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await adminService.getChatLogs(150);
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

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">
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
            className="flex items-center gap-1.5 rounded border border-hairline bg-white px-3 py-2 text-xs font-semibold text-navy hover:bg-surface transition-colors shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded bg-teal px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
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
          <p className="mt-1 font-display text-2xl font-bold text-navy">{totalLogs}</p>
          <p className="text-[11px] text-ink-muted mt-1">Multi-turn session queries</p>
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase tracking-wider text-teal-900">
              Bisaya Queries Share
            </p>
            <span className="font-mono text-xs font-bold text-teal">{bisayaPercentage}%</span>
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-teal-950">{bisayaLogs}</p>
          <p className="text-[11px] text-teal-800 mt-1">Localized Cebuano-Bisaya dialect</p>
        </div>

        <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">
            English Queries
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-navy">{englishLogs}</p>
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
          className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white"
        >
          <option value="all">All Languages</option>
          <option value="bisaya">Bisaya Only</option>
          <option value="english">English Only</option>
        </select>

        <select
          value={selectedIntent}
          onChange={(e) => setSelectedIntent(e.target.value)}
          className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-navy focus:bg-white max-w-xs"
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
      <div className="overflow-hidden card">
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
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">
                      <p className="font-semibold text-navy">
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
                    <td className="py-3.5 px-4 font-semibold text-navy max-w-xs">
                      <p className="leading-snug">{item.user_message}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-teal max-w-xs">
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
      </div>
    </div>
  );
}
