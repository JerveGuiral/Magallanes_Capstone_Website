import React, { useState, useEffect, useMemo } from 'react';
import { DownloadIcon, MessageSquareIcon, FilterIcon, BarChart3Icon, GlobeIcon, SparklesIcon } from 'lucide-react';
import { DataTable, Column } from '../components/DataTable';
import { supabaseAdmin } from '../services/supabaseAdminService';
import { ChatbotSessionLog } from '../types';

export const ChatLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<ChatbotSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState('all');
  const [filterIntent, setFilterIntent] = useState('all');

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const data = await supabaseAdmin.getChatLogs();
      setLogs(data);
      setLoading(false);
    }
    loadLogs();
  }, []);

  // Compute evaluation metrics for capstone presentation
  const metrics = useMemo(() => {
    const total = logs.length || 1;
    const bisayaCount = logs.filter((l) => l.language_detected?.toLowerCase() === 'bisaya').length;
    const englishCount = logs.filter((l) => l.language_detected?.toLowerCase() === 'english').length;
    const bisayaPercent = Math.round((bisayaCount / total) * 100);
    const englishPercent = Math.round((englishCount / total) * 100);

    const intentMap: Record<string, number> = {};
    logs.forEach((l) => {
      const intent = l.detected_intent || 'General';
      intentMap[intent] = (intentMap[intent] || 0) + 1;
    });

    const topIntent = Object.entries(intentMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Permit Inquiry';

    return { total: logs.length, bisayaPercent, englishPercent, bisayaCount, englishCount, topIntent };
  }, [logs]);

  // Unique intents for filtering
  const distinctIntents = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.detected_intent).filter(Boolean)));
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (filterLang !== 'all' && l.language_detected?.toLowerCase() !== filterLang) return false;
      if (filterIntent !== 'all' && l.detected_intent !== filterIntent) return false;
      return true;
    });
  }, [logs, filterLang, filterIntent]);

  // CSV Exporter function
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('No records to export.');
      return;
    }

    const headers = ['Session ID', 'User Message', 'Detected Intent', 'Bot Response', 'Language Detected', 'Timestamp'];
    const rows = filteredLogs.map((l) => [
      `"${l.session_id}"`,
      `"${(l.user_message || '').replace(/"/g, '""')}"`,
      `"${(l.detected_intent || '').replace(/"/g, '""')}"`,
      `"${(l.bot_response || '').replace(/"/g, '""')}"`,
      `"${l.language_detected || 'english'}"`,
      `"${l.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `magallanes_chatbot_evaluation_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<ChatbotSessionLog>[] = [
    {
      key: 'session_id',
      header: 'Session',
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {item.session_id.length > 14 ? item.session_id.slice(0, 12) + '…' : item.session_id}
        </span>
      ),
    },
    {
      key: 'user_message',
      header: 'Citizen Query & Bot Response',
      render: (item) => (
        <div className="max-w-md space-y-1">
          <p className="font-semibold text-navy text-xs sm:text-sm">"{item.user_message}"</p>
          <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
            <span className="font-semibold text-teal">Bot: </span>
            {item.bot_response}
          </p>
        </div>
      ),
    },
    {
      key: 'detected_intent',
      header: 'Detected Intent',
      sortable: true,
      render: (item) => (
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          {item.detected_intent || 'Default Fallback'}
        </span>
      ),
    },
    {
      key: 'language_detected',
      header: 'Language',
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
            item.language_detected?.toLowerCase() === 'bisaya'
              ? 'bg-teal-100 text-teal-900'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          <GlobeIcon className="h-3 w-3" />
          {item.language_detected || 'English'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Timestamp',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-xs text-slate-500">
          {new Date(item.created_at).toLocaleString('en-PH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy">Chat Session Logs (Read-only)</h2>
          <p className="text-sm text-slate-500">
            Real-time query log capturing conversational sessions, NLU intent classification, and Bisaya/English language split.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded bg-navy px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-navy-900 transition-all self-start sm:self-auto"
        >
          <DownloadIcon className="h-4 w-4 text-teal-200" />
          Export Dataset (CSV)
        </button>
      </div>

      {/* Capstone Defense Analytics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border border-slate-200 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Evaluated Queries</span>
            <MessageSquareIcon className="h-4 w-4 text-teal" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-navy">{metrics.total}</p>
          <p className="text-[11px] text-slate-400 mt-1">Logged sessions in database</p>
        </div>

        <div className="rounded border border-slate-200 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Language Localization Ratio</span>
            <GlobeIcon className="h-4 w-4 text-teal" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-teal">{metrics.bisayaPercent}%</span>
            <span className="text-xs text-slate-500">Bisaya / {metrics.englishPercent}% EN</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-teal h-full" style={{ width: `${metrics.bisayaPercent}%` }} />
            <div className="bg-indigo h-full" style={{ width: `${metrics.englishPercent}%` }} />
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-4 shadow-subtle">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Most Frequent Intent</span>
            <BarChart3Icon className="h-4 w-4 text-teal" />
          </div>
          <p className="mt-2 font-display text-lg font-bold text-navy truncate">{metrics.topIntent}</p>
          <p className="text-[11px] text-slate-400 mt-1">Primary citizen topic inquiry</p>
        </div>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        searchPlaceholder="Search citizen message text or session ID..."
        filterSlot={
          <div className="flex items-center gap-2">
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="bisaya">Bisaya Only</option>
              <option value="english">English Only</option>
            </select>

            <select
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              className="rounded border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal focus:outline-none"
            >
              <option value="all">All Intents</option>
              {distinctIntents.map((intent) => (
                <option key={intent} value={intent}>
                  {intent}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </div>
  );
};
