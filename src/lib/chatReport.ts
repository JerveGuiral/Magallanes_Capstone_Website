/**
 * The chatbot question report (Admin → Chatbot Reports): which topics residents ask about most,
 * which exact questions repeat, and which questions Magi could not answer — the material for
 * the next round of training. Pure functions over chat log rows, so the page only fetches and
 * draws.
 */

export interface ReportLog {
  session_id: string;
  user_message: string | null;
  detected_intent: string | null;
  language_detected: string | null;
  created_at: string | null;
}

/** The chat widget's own session ids ("session-k3j9x2a1b-1730000000000"); tests and scripts use others. */
const WIDGET_SESSION = /^session-[a-z0-9]{6,12}-[0-9]{13}$/;
export const isVisitorSession = (sessionId: string) => WIDGET_SESSION.test(sessionId);

/** The answers that mean "I didn't understand" — the questions to train next. */
const UNANSWERED = new Set(['Default Fallback Intent', 'vague.question.en', 'vague.question.ceb']);
export const isUnanswered = (intent: string | null) => !intent || UNANSWERED.has(intent);

/** Greetings, thanks and chit-chat: real, but not questions about municipal services. */
const SMALL_TALK = /^(smalltalk\.|Welcome$|Default Welcome Intent$)/;
export const isSmallTalk = (intent: string | null) => !!intent && SMALL_TALK.test(intent);

/** Same question, different typing: case, spacing and end punctuation don't count. */
export function normalizeQuestion(text: string) {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[\s?!.,;:]+$/g, '')
    .trim();
}

export interface ReportOptions {
  /** ISO time; rows before it are left out. Null for all time. */
  since: string | null;
  includeTests: boolean;
  hideSmallTalk: boolean;
}

export interface TopicRow {
  intent: string;
  count: number;
  share: number;
  english: number;
  bisaya: number;
  /** The most common wordings, most frequent first. */
  examples: { text: string; count: number }[];
  lastAsked: string | null;
}

export interface QuestionRow {
  text: string;
  count: number;
  english: number;
  bisaya: number;
  /** The answers it got; one when Magi is consistent. */
  intents: string[];
  firstAsked: string | null;
  lastAsked: string | null;
}

export interface ChatReport {
  total: number;
  answered: number;
  unanswered: number;
  bisaya: number;
  sessions: number;
  topics: TopicRow[];
  questions: QuestionRow[];
  unansweredQuestions: QuestionRow[];
}

const later = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b);
const earlier = (a: string | null, b: string | null) => (!a ? b : !b ? a : a < b ? a : b);

interface Group {
  count: number;
  english: number;
  bisaya: number;
  first: string | null;
  last: string | null;
  spellings: Map<string, number>;
  intents: Map<string, number>;
}
const newGroup = (): Group => ({ count: 0, english: 0, bisaya: 0, first: null, last: null, spellings: new Map(), intents: new Map() });
const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) || 0) + 1);
const ranked = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

function add(g: Group, row: ReportLog, text: string) {
  g.count++;
  if (row.language_detected === 'bisaya') g.bisaya++;
  else g.english++;
  g.first = earlier(g.first, row.created_at);
  g.last = later(g.last, row.created_at);
  bump(g.spellings, text);
  bump(g.intents, row.detected_intent || 'Default Fallback Intent');
}

/** The rows the options keep. */
export function filterLogs(rows: ReportLog[], opts: ReportOptions) {
  return rows.filter(
    (r) =>
      (r.user_message || '').trim() !== '' &&
      (opts.includeTests || isVisitorSession(r.session_id)) &&
      (!opts.since || (r.created_at || '') >= opts.since) &&
      !(opts.hideSmallTalk && isSmallTalk(r.detected_intent))
  );
}

export function buildReport(allRows: ReportLog[], opts: ReportOptions): ChatReport {
  const rows = filterLogs(allRows, opts);
  const byIntent = new Map<string, Group>();
  const byQuestion = new Map<string, Group>();
  const sessions = new Set<string>();
  let unanswered = 0;
  let bisaya = 0;

  for (const r of rows) {
    const text = (r.user_message || '').trim();
    const intent = r.detected_intent || 'Default Fallback Intent';
    sessions.add(r.session_id);
    if (r.language_detected === 'bisaya') bisaya++;
    if (isUnanswered(intent)) unanswered++;
    else {
      if (!byIntent.has(intent)) byIntent.set(intent, newGroup());
      add(byIntent.get(intent) as Group, r, text);
    }
    const key = normalizeQuestion(text);
    if (!byQuestion.has(key)) byQuestion.set(key, newGroup());
    add(byQuestion.get(key) as Group, r, text);
  }

  const answered = rows.length - unanswered;
  const topics: TopicRow[] = [...byIntent.entries()]
    .map(([intent, g]) => ({
      intent,
      count: g.count,
      share: answered ? g.count / answered : 0,
      english: g.english,
      bisaya: g.bisaya,
      examples: groupExamples(g),
      lastAsked: g.last,
    }))
    .sort((a, b) => b.count - a.count || (b.lastAsked || '').localeCompare(a.lastAsked || ''));

  const questionRows = [...byQuestion.values()].map(
    (g): QuestionRow => ({
      text: ranked(g.spellings)[0][0],
      count: g.count,
      english: g.english,
      bisaya: g.bisaya,
      intents: ranked(g.intents).map(([i]) => i),
      firstAsked: g.first,
      lastAsked: g.last,
    })
  );
  const byCount = (a: QuestionRow, b: QuestionRow) => b.count - a.count || (b.lastAsked || '').localeCompare(a.lastAsked || '');

  return {
    total: rows.length,
    answered,
    unanswered,
    bisaya,
    sessions: sessions.size,
    topics,
    questions: questionRows.filter((q) => !q.intents.every(isUnanswered)).sort(byCount),
    // A question counts as unanswered when Magi never answered it; one it sometimes answered
    // (before a fix, or in another wording of the thread) is in the answered list.
    unansweredQuestions: questionRows.filter((q) => q.intents.every(isUnanswered)).sort(byCount),
  };
}

/** A topic's wordings, merging spellings that differ only in case or punctuation. */
function groupExamples(g: Group) {
  const merged = new Map<string, { text: string; count: number }>();
  for (const [text, count] of ranked(g.spellings)) {
    const key = normalizeQuestion(text);
    const seen = merged.get(key);
    if (seen) seen.count += count;
    else merged.set(key, { text, count });
  }
  return [...merged.values()].sort((a, b) => b.count - a.count).slice(0, 5);
}

// --- CSV (Excel-ready: UTF-8 BOM so "Santo Niño" and Bisaya text open correctly) ---

const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const toCsv = (header: string[], rows: unknown[][]) => '﻿' + [header, ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export function topicsCsv(report: ChatReport) {
  return toCsv(
    ['Rank', 'Topic (intent)', 'Times asked', 'Share of answered questions', 'English', 'Bisaya', 'How people asked (most common first)', 'Last asked'],
    report.topics.map((t, i) => [
      i + 1,
      t.intent,
      t.count,
      `${(t.share * 100).toFixed(1)}%`,
      t.english,
      t.bisaya,
      t.examples.map((e) => `${e.text} (${e.count})`).join(' | '),
      day(t.lastAsked),
    ])
  );
}

export function questionsCsv(report: ChatReport) {
  return toCsv(
    ['Rank', 'Question', 'Times asked', 'English', 'Bisaya', 'Answered as (intent)', 'First asked', 'Last asked'],
    report.questions.map((q, i) => [i + 1, q.text, q.count, q.english, q.bisaya, q.intents.join(' / '), day(q.firstAsked), day(q.lastAsked)])
  );
}

/** For the next round of training: staff fill in the topic each question should have got. */
export function unansweredCsv(report: ChatReport) {
  return toCsv(
    ['Rank', 'Question Magi could not answer', 'Times asked', 'Language', 'First asked', 'Last asked', 'Correct topic or answer (fill in)', 'Notes'],
    report.unansweredQuestions.map((q, i) => [
      i + 1,
      q.text,
      q.count,
      q.bisaya > q.english ? 'Bisaya' : q.english > q.bisaya ? 'English' : 'Both',
      day(q.firstAsked),
      day(q.lastAsked),
      '',
      '',
    ])
  );
}
