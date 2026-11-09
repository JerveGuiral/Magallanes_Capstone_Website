import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, RefreshCw, TrendingUp, AlertCircle, GraduationCap, CheckCircle2, History, X } from 'lucide-react';
import { adminService, type TrainingRecord, type TrainingResult } from '../../services/adminService';
import {
  buildReport,
  normalizeQuestion,
  topicsCsv,
  questionsCsv,
  unansweredCsv,
  type ReportLog,
  type QuestionRow,
} from '../../lib/chatReport';
import { TrainQuestionModal } from '../../components/admin/TrainQuestionModal';

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

/** "Train" for a question, or what it was already trained as. */
function TrainCell({ record, onTrain }: { record?: TrainingRecord; onTrain: () => void }) {
  if (record) {
    return (
      <span
        className="inline-flex max-w-[200px] items-start gap-1 text-[11px] font-semibold text-accent-700"
        title={`Added${record.added_by ? ` by ${record.added_by}` : ''} on ${fmtDate(record.created_at)}`}
      >
        <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="[overflow-wrap:anywhere]">
          Trained <span className="font-mono font-normal text-ink-muted">→ {record.intent_name}</span>
        </span>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onTrain}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded border border-brand-600/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-600 transition-colors hover:bg-brand-50"
    >
      <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> Train
    </button>
  );
}

function QuestionTable({
  rows,
  showAnswer,
  emptyText,
  trainedOf,
  onTrain,
}: {
  rows: QuestionRow[];
  showAnswer: boolean;
  emptyText: string;
  trainedOf: (q: QuestionRow) => TrainingRecord | undefined;
  onTrain: (q: QuestionRow) => void;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, PREVIEW_ROWS);
  const max = rows[0]?.count || 1;
  const columns = showAnswer ? 7 : 6;
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
              <th className="py-3 px-4">Training</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns} className="py-8 text-center text-ink-muted">
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
                  <td className="py-3 px-4">
                    <TrainCell record={trainedOf(q)} onTrain={() => onTrain(q)} />
                  </td>
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
  const [training, setTraining] = useState<QuestionRow | null>(null);
  const [history, setHistory] = useState<TrainingRecord[]>([]);
  const [historyMissing, setHistoryMissing] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ result: TrainingResult; question: string } | null>(null);

  const loadHistory = async () => {
    const { data, missingTable, error: err } = await adminService.getTrainingHistory();
    // On a failed reload keep what is shown (e.g. the phrase just added) rather than blanking it.
    if (!err) setHistory(data);
    setHistoryMissing(missingTable);
    setHistoryError(err);
  };
  useEffect(() => {
    loadHistory();
  }, []);

  /** Questions already added, by how residents typed them (and by the phrase, if staff edited it). */
  const trainedMap = useMemo(() => {
    const m = new Map<string, TrainingRecord>();
    // Oldest first, so the newest record for a question wins.
    for (const r of [...history].reverse()) {
      m.set(normalizeQuestion(r.phrase), r);
      if (r.source_question) m.set(normalizeQuestion(r.source_question), r);
    }
    return m;
  }, [history]);
  const trainedOf = (q: QuestionRow) => trainedMap.get(normalizeQuestion(q.text));

  const handleTrained = (result: TrainingResult, question: string) => {
    setTraining(null);
    setNotice({ result, question });
    // Shown at once, before (or without) the audit table: the phrase is in Bitoy either way.
    setHistory((h) => [
      {
        id: `local-${Date.now()}`,
        phrase: result.phrase,
        intent_name: result.topic,
        target: result.kind === 'admin' ? 'admin_topic' : 'dialogflow',
        language: result.language,
        source_question: question,
        added_by: 'you',
        created_at: new Date().toISOString(),
      },
      ...h,
    ]);
    if (result.logged) loadHistory();
  };

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
          onClick={() => {
            load();
            loadHistory();
          }}
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

      {notice && (
        <div className="flex items-start gap-2.5 rounded border border-accent-600/30 bg-accent-50 p-3.5 text-xs text-accent-800" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <p className="flex-1 [overflow-wrap:anywhere]">
            Added “{notice.result.phrase}” to <span className="font-mono">{notice.result.topic}</span>.{' '}
            {notice.result.kind === 'dialogflow' ? 'Dialogflow is retraining; Bitoy will recognise it in about a minute.' : 'Bitoy will recognise it within 30 seconds.'}
            {!notice.result.logged && ' It could not be added to the training record, so tell the developers before they next rebuild the Dialogflow ZIP.'}
          </p>
          <button type="button" onClick={() => setNotice(null)} className="text-accent-800 hover:text-accent-900" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <TrainQuestionModal question={training} onClose={() => setTraining(null)} onTrained={handleTrained} />

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
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${view === v ? 'bg-brand-600 text-white' : 'bg-white text-brand-800 hover:bg-surface'}`}
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
          <QuestionTable rows={report.questions} showAnswer emptyText="No answered questions in this period." trainedOf={trainedOf} onTrain={setTraining} />
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
          <QuestionTable
            rows={report.unansweredQuestions}
            showAnswer={false}
            emptyText="Bitoy answered every question in this period."
            trainedOf={trainedOf}
            onTrain={setTraining}
          />
        )}
      </section>

      {/* Recently trained */}
      <section className="overflow-hidden card" aria-labelledby="trained-title">
        <div className="border-b border-hairline px-4 py-4">
          <h3 id="trained-title" className="flex items-center gap-2 font-display text-base font-bold text-brand-800">
            <History className="h-4 w-4 text-brand-600" /> Recently trained
          </h3>
          <p className="text-[11px] text-ink-muted">Questions staff added to Bitoy’s training from this page, newest first.</p>
        </div>
        {historyError && history.length === 0 ? (
          <p className="px-4 py-5 text-xs text-alert-800">Could not load the training record ({historyError}). Press Refresh to try again.</p>
        ) : historyMissing ? (
          <p className="px-4 py-5 text-xs text-ink-muted">
            The training record is not set up yet, so additions are not kept here. Tell the developers to run{' '}
            <code className="font-mono text-[11px]">supabase/add-chatbot-training-phrases.sql</code>.
          </p>
        ) : history.length === 0 ? (
          <p className="px-4 py-5 text-xs text-ink-muted">Nothing trained from this page yet. Use “Train” on a question above.</p>
        ) : (
          <ul className="divide-y divide-hairline">
            {history.slice(0, 10).map((r) => (
              <li key={r.id} className="flex flex-col gap-1 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="min-w-0">
                  <span className="font-semibold text-brand-800 [overflow-wrap:anywhere]">“{r.phrase}”</span>
                  <span className="ml-1.5 font-mono text-[11px] text-ink-muted [overflow-wrap:anywhere]">→ {r.intent_name}</span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-ink-muted">
                  {r.language === 'bisaya' ? 'CEB' : 'EN'} · {r.added_by || '—'} · {fmtDate(r.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* How to use */}
      <div className="rounded border border-hairline bg-surface-raised p-4 text-xs leading-relaxed text-ink-light">
        <p className="font-semibold text-brand-800">Using the report to train Bitoy</p>
        <ol className="mt-1.5 list-decimal space-y-1 pl-4">
          <li>
            Press <strong>Train</strong> on a question Bitoy could not answer (or answered with the wrong topic), pick the topic that should answer it, and add it. Dialogflow topics retrain in about a minute.
          </li>
          <li>Leave off-topic questions alone — only train questions about municipal services.</li>
          <li>
            If no topic fits, create one in <Link to="/admin/chatbot-responses" className="font-semibold text-brand-600 underline underline-offset-2">Chatbot Responses</Link> with the question as a sample question.
          </li>
          <li>Questions too close to the ones used to measure Bitoy’s accuracy are refused, so the accuracy score stays honest.</li>
        </ol>
        <p className="mt-2 text-ink-muted">
          Each chat is counted as it happened: a question listed as not answered may already be answered after a later update.
          {loadedAt && ` Loaded ${loadedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`}
        </p>
      </div>
    </div>
  );
}
