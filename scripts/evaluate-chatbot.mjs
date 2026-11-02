#!/usr/bin/env node
/**
 * Chatbot evaluation (section 3.5.1): sends every question of evaluation/test-set.json to the
 * running chat server and measures accuracy, precision, recall, F1, language detection,
 * confidence and response time. Also runs the multi-turn conversations (FR-05).
 *
 * Usage:
 *   npm run server                     # in another terminal
 *   npm run evaluate                   # against http://localhost:3001
 *   npm run evaluate -- --url https://magallanes-chat.onrender.com
 *   npm run evaluate -- --check-only   # only check the test set against the training phrases
 *
 * Writes evaluation/results/<timestamp>.md (the report), .csv (one row per question) and .json.
 * Each question gets a fresh session, so no answer depends on the one before it. The chat logs
 * of a run are written like any other, under session ids starting with "eval-".
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OFFICIALS_INTENTS } from '../server/services/officials.js';
import { GENERAL_INTENTS } from '../server/services/generalInfo.js';
import { BUSINESS_INTENTS } from '../server/services/businessPermit.js';
import { CIVIL_INTENTS } from '../server/services/civilRegistry.js';
import { HEALTH_INTENTS } from '../server/services/health.js';
import { PUBLIC_INTENTS } from '../server/services/publicServices.js';
import { INTENT_RESPONSES } from '../server/services/responses.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INTENTS = [...OFFICIALS_INTENTS, ...GENERAL_INTENTS, ...BUSINESS_INTENTS, ...CIVIL_INTENTS, ...HEALTH_INTENTS, ...PUBLIC_INTENTS];

// The same confidence threshold the chat server uses (MIN_CONFIDENCE in languageDetect.js).
const CONFIDENCE_THRESHOLD = 0.7;
// Response-time targets: section 3.2.1 (2.5 s) and NFR-01 (5 s).
const TARGET_FAST_MS = 2500;
const TARGET_NFR_MS = 5000;
// A test question this similar to a training phrase (word overlap, 0–1) is reported as too close.
const SIMILARITY_LIMIT = 0.8;
const FALLBACK_INTENTS = new Set(['Default Fallback Intent', 'vague.question.en', 'vague.question.ceb']);

// --- Arguments ---------------------------------------------------------------------------------

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const BASE_URL = option('url', process.env.CHAT_URL || 'http://localhost:3001').replace(/\/$/, '');
const SET_PATH = path.resolve(ROOT, option('set', 'evaluation/test-set.json'));
// Development runs are kept apart from the test results the report (Chapter 4) cites.
const OUT_DIR = path.resolve(ROOT, option('out', args.includes('--dev') ? 'evaluation/dev-results' : 'evaluation/results'));
const CHECK_ONLY = args.includes('--check-only');
// A development set (--dev) is for improving the bot, so it may overlap the training phrases; it
// must not resemble the held-out test set, or tuning on it would leak into the test score.
const DEV = args.includes('--dev');
const HOLDOUT_PATH = path.resolve(ROOT, option('holdout', 'evaluation/test-set.json'));
const HOLDOUT_LIMIT = 0.6;

// --- Test set vs training phrases ----------------------------------------------------------------

const normalize = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\{@[\w-]+:([^}]+)\}/g, '$1')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
const words = (s) => new Set(normalize(s).split(' ').filter(Boolean));
function similarity(a, b) {
  const A = words(a);
  const B = words(b);
  if (A.size === 0 || B.size === 0) return 0;
  let common = 0;
  for (const w of A) if (B.has(w)) common++;
  return (2 * common) / (A.size + B.size);
}

/** Test questions that copy (exact) or nearly copy (similar) a training phrase. */
function checkOverlap(questions) {
  const training = INTENTS.flatMap((intent) => intent.phrases.map((phrase) => ({ intent: intent.name, phrase })));
  const exact = new Map(training.map((t) => [normalize(t.phrase), t]));
  const found = [];
  for (const q of questions) {
    const copy = exact.get(normalize(q.question));
    if (copy) {
      found.push({ id: q.id, question: q.question, kind: 'exact', training: copy.phrase, intent: copy.intent, score: 1 });
      continue;
    }
    let best = null;
    for (const t of training) {
      const score = similarity(q.question, t.phrase);
      if (!best || score > best.score) best = { ...t, score };
    }
    if (best && best.score >= SIMILARITY_LIMIT) {
      found.push({ id: q.id, question: q.question, kind: 'similar', training: best.phrase, intent: best.intent, score: best.score });
    }
  }
  return { trainingPhrases: training.length, found };
}

// --- Talking to the chat server ------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ask(message, sessionId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const started = performance.now();
    let res;
    try {
      res = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
      });
    } catch (err) {
      return { error: `Could not reach the chat server: ${err.message}`, ms: performance.now() - started };
    }
    const ms = performance.now() - started;
    if (res.status === 429) {
      // Rate limited (deployed server): wait as told and ask again; the wait is not response time.
      await sleep((Number(res.headers.get('retry-after')) || 60) * 1000);
      continue;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { error: body.error || `HTTP ${res.status}`, ms };
    return { ...body, ms };
  }
  return { error: 'Still rate limited after 3 attempts', ms: 0 };
}

// --- Metrics -------------------------------------------------------------------------------------

const round = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;
const pct = (x) => `${(x * 100).toFixed(2)}%`;
const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
function percentile(xs, p) {
  if (xs.length === 0) return 0;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)];
}

/**
 * Per-intent precision, recall and F1, and their macro averages.
 * Each question has one true label (its main expected intent) and one predicted label: the true
 * label when the bot's intent is any of the expected ones, otherwise the intent it returned.
 *   precision(c) = TP / (TP + FP)   of the answers given as c, the share that were right
 *   recall(c)    = TP / (TP + FN)   of the questions about c, the share answered as c
 *   F1(c)        = 2·P·R / (P + R)
 * An intent the bot never answered with has precision 0. A wrong answer that is not one of the
 * tested intents (a fallback, another topic) counts against the recall of the true intent only.
 */
function classMetrics(rows) {
  const classes = [...new Set(rows.map((r) => r.gold))];
  const perClass = classes.map((c) => {
    const tp = rows.filter((r) => r.gold === c && r.predLabel === c).length;
    const fp = rows.filter((r) => r.gold !== c && r.predLabel === c).length;
    const fn = rows.filter((r) => r.gold === c && r.predLabel !== c).length;
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    return { intent: c, support: tp + fn, tp, fp, fn, precision, recall, f1 };
  });
  return {
    perClass,
    macroPrecision: mean(perClass.map((m) => m.precision)),
    macroRecall: mean(perClass.map((m) => m.recall)),
    macroF1: mean(perClass.map((m) => m.f1)),
  };
}

function summarize(rows) {
  const correct = rows.filter((r) => r.correct).length;
  return { total: rows.length, correct, accuracy: rows.length ? correct / rows.length : 0, ...classMetrics(rows) };
}

// --- Report --------------------------------------------------------------------------------------

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const mdCell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

function writeReports(run) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const stamp = run.startedAt.replace(/[:.]/g, '-');
  const base = path.join(OUT_DIR, stamp);

  fs.writeFileSync(`${base}.json`, JSON.stringify(run, null, 2));

  const header = ['ID', 'Category', 'Language', 'Question', 'Expected intent', 'Bot intent', 'Correct', 'Language detected', 'Dialogflow intent', 'Confidence', 'Response time (ms)', 'Bot reply', 'Error'];
  const lines = run.questions.map((r) =>
    [r.id, r.category, r.language, r.question, r.expected.join(' / '), r.intent, r.correct ? 'yes' : 'no', r.languageDetected, r.dialogflowIntent, r.confidence ?? '', Math.round(r.ms), r.reply, r.error]
      .map(csvCell)
      .join(',')
  );
  // Leading BOM so Excel reads the Bisaya text as UTF-8.
  fs.writeFileSync(`${base}.csv`, '﻿' + [header.map(csvCell).join(','), ...lines].join('\n'));

  const s = run.summary;
  const md = [];
  md.push(`# Chatbot evaluation${DEV ? ' (development set — not the held-out test)' : ''} — ${new Date(run.startedAt).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })}`);
  md.push('');
  md.push(`Chat server: \`${run.server}\` · Test set: ${run.questions.length} questions (${s.english.total} English, ${s.bisaya.total} Bisaya), ${run.conversations.length} conversations · Intents tested: ${s.overall.perClass.length}`);
  md.push(`Overlap with the ${run.overlap.trainingPhrases} training phrases: ${run.overlap.found.length === 0 ? 'none (no test question copies or nearly copies a training phrase)' : `${run.overlap.found.length} question(s), listed at the end`}.`);
  md.push('');
  md.push('## Results');
  md.push('');
  md.push('| Metric | Overall | English | Bisaya |');
  md.push('|---|---|---|---|');
  md.push(`| Accuracy | ${pct(s.overall.accuracy)} (${s.overall.correct}/${s.overall.total}) | ${pct(s.english.accuracy)} (${s.english.correct}/${s.english.total}) | ${pct(s.bisaya.accuracy)} (${s.bisaya.correct}/${s.bisaya.total}) |`);
  md.push(`| Precision (macro) | ${pct(s.overall.macroPrecision)} | ${pct(s.english.macroPrecision)} | ${pct(s.bisaya.macroPrecision)} |`);
  md.push(`| Recall (macro) | ${pct(s.overall.macroRecall)} | ${pct(s.english.macroRecall)} | ${pct(s.bisaya.macroRecall)} |`);
  md.push(`| F1-score (macro) | ${pct(s.overall.macroF1)} | ${pct(s.english.macroF1)} | ${pct(s.bisaya.macroF1)} |`);
  md.push(`| Language detected correctly | ${pct(s.languageDetection.overall)} | ${pct(s.languageDetection.english)} | ${pct(s.languageDetection.bisaya)} |`);
  md.push('');
  md.push(`Target (Objective 2, FR-03): accuracy of 85% or higher — **${s.overall.accuracy >= 0.85 ? 'met' : 'not met'}**.`);
  md.push('');
  md.push('## Confidence and response time');
  md.push('');
  md.push('| Measure | Value |');
  md.push('|---|---|');
  md.push(`| Mean Dialogflow confidence | ${s.confidence.mean === null ? 'n/a' : round(s.confidence.mean, 3)} |`);
  md.push(`| Questions below the ${CONFIDENCE_THRESHOLD} threshold | ${s.confidence.belowThreshold} of ${s.confidence.scored} (answered by the server's rules, the website content or the fallback) |`);
  md.push(`| Mean response time | ${Math.round(s.latency.mean)} ms |`);
  md.push(`| Median response time | ${Math.round(s.latency.median)} ms |`);
  md.push(`| 95th percentile | ${Math.round(s.latency.p95)} ms |`);
  md.push(`| Slowest | ${Math.round(s.latency.max)} ms |`);
  md.push(`| Within 2.5 s (section 3.2.1) | ${pct(s.latency.withinFast)} |`);
  md.push(`| Within 5 s (NFR-01) | ${pct(s.latency.withinNfr)} |`);
  md.push('');
  md.push('Response time is measured by this script from sending the question to receiving the reply, so it includes the network between the script and the chat server.');
  md.push('');
  md.push('Dialogflow reports a confidence for its own fallback intent too (often 1.0, meaning "certain it is not understood"), so a high confidence alone does not mean a correct answer; accuracy is judged on the intent answered.');
  md.push('');
  md.push('## Accuracy per category');
  md.push('');
  md.push('| Category | Correct | Accuracy |');
  md.push('|---|---|---|');
  for (const c of s.categories) md.push(`| ${mdCell(c.category)} | ${c.correct}/${c.total} | ${pct(c.accuracy)} |`);
  md.push('');
  md.push('## Precision, recall and F1 per intent');
  md.push('');
  md.push('| Intent | Support | TP | FP | FN | Precision | Recall | F1 |');
  md.push('|---|---|---|---|---|---|---|---|');
  for (const m of s.overall.perClass) {
    md.push(`| \`${m.intent}\` | ${m.support} | ${m.tp} | ${m.fp} | ${m.fn} | ${round(m.precision, 3)} | ${round(m.recall, 3)} | ${round(m.f1, 3)} |`);
  }
  md.push('');
  md.push('## Wrong answers');
  md.push('');
  const wrong = run.questions.filter((r) => !r.correct);
  if (wrong.length === 0) {
    md.push('None.');
  } else {
    md.push('| ID | Language | Question | Expected | Bot answered with | Confidence |');
    md.push('|---|---|---|---|---|---|');
    for (const r of wrong) {
      md.push(`| ${r.id} | ${r.language} | ${mdCell(r.question)} | \`${r.expected[0]}\` | \`${mdCell(r.intent || r.error)}\` | ${r.confidence ?? '—'} |`);
    }
  }
  md.push('');
  md.push('## Conversation memory (FR-05)');
  md.push('');
  md.push(`${s.conversations.passed} of ${s.conversations.total} conversations had every turn answered correctly; ${s.conversations.turnsCorrect} of ${s.conversations.turns} follow-up turns were answered correctly, ${s.conversations.memoryNeeded} of them only thanks to the conversation memory (the same follow-up asked alone, in a new session, got a different answer).`);
  md.push('');
  md.push('| Conversation | Turn | Question | Expected | Bot answered with | Correct | Asked alone |');
  md.push('|---|---|---|---|---|---|---|');
  for (const c of run.conversations) {
    c.turns.forEach((t, i) => {
      md.push(`| ${c.id} ${mdCell(c.description)} | ${i + 1} | ${mdCell(t.question)} | \`${t.expected[0]}\` | \`${mdCell(t.intent || t.error)}\` | ${t.correct ? 'yes' : 'no'} | ${i === 0 ? '—' : `\`${mdCell(t.intentWithoutContext)}\``} |`);
    });
  }
  md.push('');
  md.push('## How the metrics are computed');
  md.push('');
  md.push('- **Accuracy** = correct answers ÷ questions asked. An answer is correct when the intent the bot answered with is one of the question\'s expected intents.');
  md.push('- For each intent *c*: **Precision** = TP ÷ (TP + FP), **Recall** = TP ÷ (TP + FN), **F1** = 2 × P × R ÷ (P + R), where TP counts questions about *c* answered as *c*, FP questions about another intent answered as *c*, and FN questions about *c* answered as anything else (another intent or the fallback).');
  md.push('- The **macro** averages are the means over the tested intents, each counting equally.');
  md.push('- A fallback ("I didn\'t understand") counts as a wrong answer.');
  md.push('');
  if (run.overlap.found.length) {
    md.push('## Test questions close to training phrases');
    md.push('');
    md.push('| ID | Question | Training phrase | Intent | Similarity |');
    md.push('|---|---|---|---|---|');
    for (const o of run.overlap.found) md.push(`| ${o.id} | ${mdCell(o.question)} | ${mdCell(o.training)} | \`${o.intent}\` | ${round(o.score, 2)} |`);
    md.push('');
  }
  fs.writeFileSync(`${base}.md`, md.join('\n'));
  return base;
}

// --- Main ----------------------------------------------------------------------------------------

const set = JSON.parse(fs.readFileSync(SET_PATH, 'utf8'));
const questions = set.questions || [];
const conversations = set.conversations || [];

// Intents defined in code (built into the agent ZIP) and the answers the server owns
// (responses.js, which also covers the console-made intents its rules answer with).
const known = new Set([...INTENTS.map((i) => i.name), ...Object.keys(INTENT_RESPONSES)]);
const unknown = [...questions, ...conversations.flatMap((c) => c.turns)]
  .flatMap((q) => q.expected)
  .filter((name) => !known.has(name) && !name.startsWith('live.') && !FALLBACK_INTENTS.has(name));
if (unknown.length) {
  console.error(`Expected intents that do not exist in the agent: ${[...new Set(unknown)].join(', ')}`);
  process.exit(1);
}

const overlap = checkOverlap([...questions, ...conversations.flatMap((c) => c.turns.map((t, i) => ({ ...t, id: `${c.id}.${i + 1}` })))]);
console.log(`Test set: ${questions.length} questions, ${conversations.length} conversations. Training phrases: ${overlap.trainingPhrases}.`);
if (overlap.found.length === 0) {
  console.log('Overlap check: no test question copies or nearly copies a training phrase.');
} else {
  console.log(`Overlap check: ${overlap.found.length} test question(s) too close to a training phrase:`);
  for (const o of overlap.found) console.log(`  ${o.id} (${o.kind}, ${round(o.score, 2)}): "${o.question}" ~ "${o.training}" [${o.intent}]`);
}
if (DEV) {
  const holdout = JSON.parse(fs.readFileSync(HOLDOUT_PATH, 'utf8'));
  const held = [...(holdout.questions || []), ...(holdout.conversations || []).flatMap((c) => c.turns)];
  const leaks = [];
  for (const q of [...questions, ...conversations.flatMap((c) => c.turns.map((t, i) => ({ ...t, id: `${c.id}.${i + 1}` })))]) {
    for (const h of held) {
      const score = similarity(q.question, h.question);
      if (score >= HOLDOUT_LIMIT) leaks.push({ id: q.id, question: q.question, test: h.question, score });
    }
  }
  if (leaks.length) {
    console.error(`${leaks.length} development question(s) resemble the held-out test set; remove them:`);
    for (const l of leaks) console.error(`  ${l.id} (${round(l.score, 2)}): "${l.question}" ~ "${l.test}"`);
    process.exit(1);
  }
  console.log(`Held-out check: no development question resembles the ${held.length} test questions.`);
}
if (CHECK_ONLY) process.exit(!DEV && overlap.found.some((o) => o.kind === 'exact') ? 1 : 0);
if (!DEV && overlap.found.some((o) => o.kind === 'exact')) {
  console.error('A test question is copied from the training phrases; reword it before evaluating.');
  process.exit(1);
}

let health;
try {
  health = await (await fetch(`${BASE_URL}/api/health`)).json();
} catch (err) {
  console.error(`The chat server at ${BASE_URL} is not reachable (${err.message}). Start it with: npm run server`);
  process.exit(1);
}
if (!health.credentialsConfigured) {
  console.error('The chat server has no Dialogflow credentials, so every answer would be a fallback. Fix that first.');
  process.exit(1);
}

const runId = Date.now().toString(36);
const startedAt = new Date().toISOString();
console.log(`\nAsking ${questions.length} questions at ${BASE_URL} …`);

const rows = [];
for (const q of questions) {
  const res = await ask(q.question, `eval-${runId}-${q.id}`);
  const intent = res.intent || '';
  const correct = !res.error && q.expected.includes(intent);
  rows.push({
    ...q,
    intent,
    correct,
    gold: q.expected[0],
    predLabel: correct ? q.expected[0] : intent || '(error)',
    languageDetected: res.language || '',
    dialogflowIntent: res.dialogflowIntent || '',
    confidence: typeof res.confidence === 'number' ? round(res.confidence, 4) : null,
    ms: res.ms,
    reply: res.reply || '',
    error: res.error || '',
  });
  process.stdout.write(correct ? '.' : 'x');
}
process.stdout.write('\n');

console.log(`Running ${conversations.length} conversations …`);
const convoResults = [];
for (const c of conversations) {
  const turns = [];
  for (const [i, t] of c.turns.entries()) {
    const res = await ask(t.question, `eval-${runId}-${c.id}`);
    const turn = { ...t, turn: i + 1, intent: res.intent || '', correct: !res.error && t.expected.includes(res.intent), ms: res.ms, reply: res.reply || '', error: res.error || '' };
    if (i > 0) {
      // Control: the same follow-up in a fresh session. Only when it fails there did the
      // conversation memory make the difference.
      const alone = await ask(t.question, `eval-${runId}-${c.id}-control-${i + 1}`);
      turn.intentWithoutContext = alone.intent || alone.error || '';
      turn.memoryNeeded = turn.correct && !t.expected.includes(alone.intent);
    }
    turns.push(turn);
  }
  convoResults.push({ ...c, turns, passed: turns.every((t) => t.correct) });
}

const byLang = (lang) => rows.filter((r) => r.language === lang);
const detected = (rs) => (rs.length ? rs.filter((r) => r.languageDetected === r.language).length / rs.length : 0);
const scored = rows.filter((r) => typeof r.confidence === 'number');
const times = rows.filter((r) => !r.error).map((r) => r.ms);
const categories = [...new Set(rows.map((r) => r.category))].map((category) => {
  const rs = rows.filter((r) => r.category === category);
  const correct = rs.filter((r) => r.correct).length;
  return { category, total: rs.length, correct, accuracy: correct / rs.length };
});
const followups = convoResults.flatMap((c) => c.turns.slice(1));

const summary = {
  overall: summarize(rows),
  english: summarize(byLang('english')),
  bisaya: summarize(byLang('bisaya')),
  languageDetection: { overall: detected(rows), english: detected(byLang('english')), bisaya: detected(byLang('bisaya')) },
  confidence: {
    scored: scored.length,
    mean: scored.length ? mean(scored.map((r) => r.confidence)) : null,
    belowThreshold: scored.filter((r) => r.confidence < CONFIDENCE_THRESHOLD).length,
  },
  latency: {
    mean: mean(times),
    median: percentile(times, 0.5),
    p95: percentile(times, 0.95),
    max: times.length ? Math.max(...times) : 0,
    withinFast: times.length ? times.filter((t) => t <= TARGET_FAST_MS).length / times.length : 0,
    withinNfr: times.length ? times.filter((t) => t <= TARGET_NFR_MS).length / times.length : 0,
  },
  categories,
  conversations: {
    total: convoResults.length,
    passed: convoResults.filter((c) => c.passed).length,
    turns: followups.length,
    turnsCorrect: followups.filter((t) => t.correct).length,
    memoryNeeded: followups.filter((t) => t.memoryNeeded).length,
  },
  errors: rows.filter((r) => r.error).length,
};

const base = writeReports({ startedAt, server: BASE_URL, overlap, summary, questions: rows, conversations: convoResults });

const s = summary;
console.log(`
Accuracy        ${pct(s.overall.accuracy)}  (English ${pct(s.english.accuracy)}, Bisaya ${pct(s.bisaya.accuracy)})
Precision       ${pct(s.overall.macroPrecision)}  (macro)
Recall          ${pct(s.overall.macroRecall)}  (macro)
F1-score        ${pct(s.overall.macroF1)}  (macro)
Language        ${pct(s.languageDetection.overall)} detected correctly
Response time   mean ${Math.round(s.latency.mean)} ms, 95th percentile ${Math.round(s.latency.p95)} ms
Conversations   ${s.conversations.passed}/${s.conversations.total} fully correct; ${s.conversations.turnsCorrect}/${s.conversations.turns} follow-ups right, ${s.conversations.memoryNeeded} needing the memory
${s.errors ? `Errors          ${s.errors} question(s) got no answer — see the report\n` : ''}
Report: ${path.relative(ROOT, base)}.md (also .csv and .json)`);
