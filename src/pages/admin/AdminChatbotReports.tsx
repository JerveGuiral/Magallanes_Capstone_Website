import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  buildReport,
  topicsCsv,
  questionsCsv,
  unansweredCsv,
  type ReportLog,
  type QuestionRow,
} from '../../lib/chatReport';

const PERIODS = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: 'all', label: 'All time', days: null },
] as const;
type PeriodId = (typeof PERIODS)[number]['id'];

const PREVIEW_ROWS = 15;

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');

/** Saves text as a file (Excel opens the UTF-8 CSV directly). */
function download(text: string, name: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function LanguageSplit({ english, bisaya }: { english: number; bisaya: number }) {
  return (
    <span className="font-mono text-[11px] text-ink-muted whitespace-nowrap">
      EN {english} · CEB {bisaya}
    </span>
  );
}

/** A count with a bar scaled to the largest count in the list. */
function CountBar({ count, max }: { count: number; max: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <span className="w-8 text-right font-mono text-xs font-semibold text-brand-800 tabular-nums">{count}</span>
      <span className="h-1.5 flex-1 rounded-full bg-surface-raised" aria-hidden="true">
        <span className="block h-1.5 rounded-full bg-accent-600" style={{ width: `${Math.max(4, (count / max) * 100)}%` }} />
      </span>
    </div>
  );
}

function ShowAll({ shown, total, onClick }: { shown: number; total: number; onClick: () => void }) {
  if (total <= shown) return null;
  return (
    <div className="border-t border-hairline bg-surface-raised px-4 py-2.5 text-center">
      <button type="button" onClick={onClick} className="text-xs font-semibold text-brand-600 hover:text-brand-800">
        Show all {total}
      </button>
    </div>
  );
}

function QuestionTable({ rows, showAnswer, emptyText }: { rows: QuestionRow[]; showAnswer: boolean; emptyText: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, PREVIEW_ROWS);
  const max = rows[0]?.count || 1;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
            <tr>
              <th className="py-3 px-4 w-10">#</th>
              <th className="py-3 px-4">Question</th>
              <th className="py-3 px-4">Times asked</th>
              <th className="py-3 px-4">Language</th>
              {showAnswer && <th className="py-3 px-4">Answered as</th>}
              <th className="py-3 px-4">Last asked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={showAnswer ? 6 : 5} className="py-8 text-center text-ink-muted">
                  {emptyText}
                </td>
              </tr>
            ) : (
              shown.map((q, i) => (
                <tr key={q.text + i} className="hover:bg-surface/60 transition-colors">
                  <td className="py-3 px-4 font-mono text-ink-muted tabular-nums">{i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-brand-800 max-w-sm [overflow-wrap:anywhere]">{q.text}</td>
                  <td className="py-3 px-4">
                    <CountBar count={q.count} max={max} />
                  </td>
                  <td className="py-3 px-4">
                    <LanguageSplit english={q.english} bisaya={q.bisaya} />
                  </td>
                  {showAnswer && <td className="py-3 px-4 font-mono text-[11px] text-brand-600 max-w-[220px] [overflow-wrap:anywhere]">{q.intents.join(' / ')}</td>}
                  <td className="py-3 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">{fmtDate(q.lastAsked)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ShowAll shown={shown.length} total={rows.length} onClick={() => setAll(true)} />
    </>
  );
}

export function AdminChatbotReports() {
  const [period, setPeriod] = useState<PeriodId>('30');
  const [includeTests, setIncludeTests] = useState(false);
  const [hideSmallTalk, setHideSmallTalk] = useState(true);
  const [view, setView] = useState<'topics' | 'questions'>('topics');
  const [allTopics, setAllTopics] = useState(false);
  const [logs, setLogs] = useState<ReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  const since = useMemo(() => {
    const days = PERIODS.find((p) => p.id === period)?.days;
    return days ? new Date(Date.now() - days * 86_400_000).toISOString() : null;
  }, [period]);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await adminService.getChatLogsForReport(since);
    if (err) setError(err.message || 'Could not load the chat logs.');
    setLogs((data || []) as ReportLog[]);
    setLoadedAt(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [since]);

  const report = useMemo(() => buildReport(logs, { since, includeTests, hideSmallTalk }), [logs, since, includeTests, hideSmallTalk]);
  const periodLabel = PERIODS.find((p) => p.id === period)?.label.toLowerCase() || '';
  const stamp = new Date().toISOString().slice(0, 10);
  const topics = allTopics ? report.topics : report.topics.slice(0, PREVIEW_ROWS);
  const maxTopic = report.topics[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-800">Chatbot Question Report</h2>
          <p className="text-xs text-ink-muted">
            What residents ask Bitoy most and least, and the questions it could not answer, for the next round of training.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 self-start rounded border border-hairline bg-white px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-surface transition-colors shadow-sm sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-lg border border-hairline bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="font-semibold text-brand-800">Period</span>
          <select
            id="report-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodId)}
            className="rounded border border-hairline bg-surface px-3 py-2 text-xs text-ink focus:border-brand-800 focus:bg-white"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer">
          <input id="report-small-talk" type="checkbox" checked={hideSmallTalk} onChange={(e) => setHideSmallTalk(e.target.checked)} className="rounded border-hairline text-brand-800" />
          <span>Hide greetings and small talk</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-muted cursor-pointer">
          <input id="report-tests" type="checkbox" checked={includeTests} onChange={(e) => setIncludeTests(e.target.checked)} className="rounded border-hairline text-brand-800" />
          <span>Include test sessions</span>
        </label>
        <span className="text-[11px] text-ink-subtle sm:ml-auto">
          {includeTests ? 'Counting every logged chat, including the team’s test runs.' : 'Counting chats from the website’s chat window only.'}
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded border border-alert-600/25 bg-alert-50 p-3.5 text-xs text-alert-800" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            <strong>Some chat logs could not be loaded</strong> ({error}). The report below counts only what loaded.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">Questions asked</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-800 tabular-nums">{loading ? '…' : report.total}</p>
          <p className="text-[11px] text-ink-muted mt-1">{loading ? 'Loading' : `${report.sessions} conversations, ${periodLabel}`}</p>
        </div>
        <div className="rounded-lg border border-hairline bg-white p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-muted">Answered</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-800 tabular-nums">{loading ? '…' : pct(report.answered, report.total)}</p>
          <p className="text-[11px] text-ink-muted mt-1">{report.answered} questions got an answer</p>
        </div>
        <div className="rounded-lg border border-alert-600/25 bg-alert-50 p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-alert-800">Not answered</p>
          <p className="mt-1 font-display text-2xl font-bold text-alert-800 tabular-nums">{loading ? '…' : report.unanswered}</p>
          <p className="text-[11px] text-alert-800 mt-1">{report.unansweredQuestions.length} different questions to train</p>
        </div>
        <div className="rounded-lg border border-brand-200 bg-brand-50/60 p-4 shadow-sm">
          <p className="text-xs font-mono uppercase tracking-wider text-brand-800">Asked in Bisaya</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-950 tabular-nums">{loading ? '…' : pct(report.bisaya, report.total)}</p>
          <p className="text-[11px] text-brand-800 mt-1">{report.bisaya} questions</p>
        </div>
      </div>

      {/* Most to least asked */}
      <section className="overflow-hidden card" aria-labelledby="frequent-title">
        <div className="flex flex-col gap-3 border-b border-hairline px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="frequent-title" className="flex items-center gap-2 font-display text-base font-bold text-brand-800">
              <TrendingUp className="h-4 w-4 text-brand-600" /> Most to least asked
            </h3>
            <p className="text-[11px] text-ink-muted">Answered questions only, ranked from the most frequent.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded border border-hairline" role="group" aria-label="Rank by">
              {(['topics', 'questions'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${view === v ? 'bg-brand-800 text-white' : 'bg-white text-brand-800 hover:bg-surface'}`}
                >
                  {v === 'topics' ? 'By topic' : 'By exact question'}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                view === 'topics'
                  ? download(topicsCsv(report), `bitoy_most_asked_topics_${stamp}.csv`)
                  : download(questionsCsv(report), `bitoy_most_asked_questions_${stamp}.csv`)
              }
              className="flex items-center gap-1.5 rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {view === 'topics' ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-hairline bg-surface-raised font-display text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  <tr>
                    <th className="py-3 px-4 w-10">#</th>
                    <th className="py-3 px-4">Topic and how people asked</th>
                    <th className="py-3 px-4">Times asked</th>
                    <th className="py-3 px-4">Share</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4">Last asked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted">Loading chat logs…</td>
                    </tr>
                  ) : report.topics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted">No answered questions in this period.</td>
                    </tr>
                  ) : (
                    topics.map((t, i) => (
                      <tr key={t.intent} className="hover:bg-surface/60 transition-colors align-top">
                        <td className="py-3 px-4 font-mono text-ink-muted tabular-nums">{i + 1}</td>
                        <td className="py-3 px-4 max-w-md">
                          <p className="font-semibold text-brand-800 [overflow-wrap:anywhere]">{t.examples[0]?.text}</p>
                          {t.examples.length > 1 && (
                            <p className="mt-0.5 text-[11px] text-ink-muted [overflow-wrap:anywhere]">
                              Also: {t.examples.slice(1, 4).map((e) => e.text).join(' · ')}
                            </p>
                          )}
                          <p className="mt-0.5 font-mono text-[10.5px] text-brand-600">{t.intent}</p>
                        </td>
                        <td className="py-3 px-4">
                          <CountBar count={t.count} max={maxTopic} />
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-light tabular-nums">{(t.share * 100).toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          <LanguageSplit english={t.english} bisaya={t.bisaya} />
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-muted whitespace-nowrap">{fmtDate(t.lastAsked)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && <ShowAll shown={topics.length} total={report.topics.length} onClick={() => setAllTopics(true)} />}
          </>
        ) : loading ? (
          <p className="py-8 text-center text-xs text-ink-muted">Loading chat logs…</p>
        ) : (
          <QuestionTable rows={report.questions} showAnswer emptyText="No answered questions in this period." />
        )}
      </section>

      {/* Not answered */}
      <section className="overflow-hidden card" aria-labelledby="unanswered-title">
        <div className="flex flex-col gap-3 border-b border-hairline px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 id="unanswered-title" className="flex items-center gap-2 font-display text-base font-bold text-alert-800">
              <AlertCircle className="h-4 w-4" /> Questions Bitoy could not answer
            </h3>
            <p className="text-[11px] text-ink-muted">Most frequent first. Train these next.</p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={() => download(unansweredCsv(report), `bitoy_unanswered_questions_${stamp}.csv`)}
            className="flex items-center gap-1.5 self-start rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 sm:self-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download for training (CSV)</span>
          </button>
        </div>
        {loading ? (
          <p className="py-8 text-center text-xs text-ink-muted">Loading chat logs…</p>
        ) : (
          <QuestionTable rows={report.unansweredQuestions} showAnswer={false} emptyText="Bitoy answered every question in this period." />
        )}
      </section>

      {/* How to use */}
      <div className="rounded border border-hairline bg-surface-raised p-4 text-xs leading-relaxed text-ink-light">
        <p className="font-semibold text-brand-800">Using the report to train Bitoy</p>
        <ol className="mt-1.5 list-decimal space-y-1 pl-4">
          <li>Download the unanswered questions and open the file in Excel or Google Sheets.</li>
          <li>For each question that is about a municipal service, fill in the topic or the answer it should get. Leave off-topic questions blank.</li>
          <li>
            Add a new topic yourself in <Link to="/admin/chatbot-responses" className="font-semibold text-brand-600 underline underline-offset-2">Chatbot Responses</Link> (with the questions as sample questions), or give the file to the developers to add as training phrases.
          </li>
        </ol>
        <p className="mt-2 text-ink-muted">
          Each chat is counted as it happened: a question listed as not answered may already be answered after a later update.
          {loadedAt && ` Loaded ${loadedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`}
        </p>
      </div>
    </div>
  );
}
