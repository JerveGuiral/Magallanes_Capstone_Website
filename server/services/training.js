// server/services/training.js
//
// "Train" in Admin → Chatbot Reports: staff take a question Bitoy could not answer and add it as
// a training phrase of the topic that should answer it.
//   - A Dialogflow intent: the phrase is added to the agent through the Dialogflow API and the
//     agent retrains (machine learning), so wordings close to it are recognised too.
//   - An admin topic (Admin → Chatbot Responses, rows with sample questions): the phrase joins
//     the topic's sample questions, which the server matches itself (matchCustomIntent).
// Every addition is recorded in Supabase `chatbot_training_phrases` (supabase/add-chatbot-
// training-phrases.sql): who added what, and the list `npm run dialogflow:build` merges back
// into the intents it builds from code, so a ZIP re-import does not wipe staff additions.
//
// The service account needs the "Dialogflow API Admin" role for the Dialogflow half; with only
// "Dialogflow API Client" (enough to chat) the admin topics still work and the page says what
// to change.

import fs from 'fs';
import { tokens, phraseSimilarity } from './liveContent.js';
import { detectLanguage } from './languageDetect.js';

const DIALOGFLOW_API = 'https://dialogflow.googleapis.com/v2';
const LANGUAGE_CODE = 'en'; // The agent's language; Bisaya phrases live in the English intents.
export const MAX_PHRASE_LENGTH = 256; // Dialogflow's query limit — a longer phrase is never sent.
const INTENT_CACHE_MS = 5 * 60 * 1000;

// Same measure and limit as the held-out check of scripts/evaluate-chatbot.mjs (HOLDOUT_LIMIT):
// a phrase this close to a test question would let the test set leak into training, and the
// accuracy reported in the paper would stop meaning anything.
export const HOLDOUT_LIMIT = 0.6;

export class TrainingError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// --- Pure helpers (server/test-training.js) ------------------------------------------------------

const normalize = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ]+/g, ' ')
    .trim();
const wordSet = (s) => new Set(normalize(s).split(' ').filter(Boolean));

/** Dice overlap of the two word sets (0–1), exactly as the evaluation script measures it. */
export function wordSimilarity(a, b) {
  const A = wordSet(a);
  const B = wordSet(b);
  if (A.size === 0 || B.size === 0) return 0;
  let common = 0;
  for (const w of A) if (B.has(w)) common++;
  return (2 * common) / (A.size + B.size);
}

/** Same phrase, different typing: case, accents, spacing and punctuation don't count. */
export const samePhrase = (a, b) => normalize(a) === normalize(b);

/**
 * The phrase as it will be stored, or an error message. Keeps the resident's wording (typos and
 * Bislish are what the model should learn from); only trims, collapses spaces and rejects what
 * Dialogflow cannot take.
 * @returns {{ phrase: string } | { error: string }}
 */
export function cleanPhrase(text) {
  const phrase = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (phrase.length < 2) return { error: 'Type the question to add.' };
  if (phrase.length > MAX_PHRASE_LENGTH) return { error: `Keep it under ${MAX_PHRASE_LENGTH} characters — that is all Dialogflow reads of a question.` };
  if ((phrase.match(/\p{L}/gu) || []).length < 2) return { error: 'The question needs words, not only numbers or symbols.' };
  // `{@entity:text}` is the build script's entity syntax; a stray brace would break the ZIP.
  if (/[{}]/.test(phrase)) return { error: 'Remove the { } characters.' };
  return { phrase };
}

/** Every question of the held-out test set, conversations included. */
export function loadHoldoutQuestions(file) {
  try {
    const set = JSON.parse(fs.readFileSync(file, 'utf8'));
    return [...(set.questions || []), ...(set.conversations || []).flatMap((c) => c.turns || [])]
      .map((q) => q.question)
      .filter(Boolean);
  } catch (err) {
    console.warn(`[Training] Could not read the held-out test set (${file}): ${err.message}. Adding phrases is blocked until it can be read.`);
    return null;
  }
}

/** True when the phrase copies or nearly copies a held-out test question. */
export function resemblesHoldout(phrase, holdout) {
  return holdout.some((q) => samePhrase(q, phrase) || wordSimilarity(q, phrase) >= HOLDOUT_LIMIT);
}

/** The best-matching topics for a question, by the same word matching the chat server uses. */
export function suggestTopics(question, topics, limit = 3) {
  const q = tokens(question);
  if (q.length === 0) return [];
  return topics
    .map((t) => ({ name: t.name, score: Math.max(0, ...t.phrases.map((p) => phraseSimilarity(q, tokens(p)))) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

const phraseText = (tp) => (tp.parts || []).map((p) => p.text).join('');

// The "please make your question clearer" replies: questions trained into them would go
// unanswered on purpose. (The same set the report counts as not answered.)
const NOT_ANSWERS = new Set(['vague.question.en', 'vague.question.ceb']);

/**
 * Topics a question can be added to. Not the fallback (the "no match"), not a "be clearer"
 * reply, and not a follow-up (input context), which only matches mid-conversation.
 */
const isTrainable = (intent) =>
  !intent.isFallback && !NOT_ANSWERS.has(intent.displayName) && !(intent.inputContextNames || []).length;

// --- Service --------------------------------------------------------------------------------------

/**
 * @param {object} deps
 * @param {() => Promise<string>} deps.getAccessToken  Google token (index.js)
 * @param {string} deps.projectId
 * @param {string} [deps.serviceAccountEmail]          named in the permission message
 * @param {string} [deps.supabaseUrl]
 * @param {string} [deps.supabaseSecretKey]
 * @param {() => object[]} deps.getAdminTopics         intent_responses rows (index.js cache)
 * @param {() => Promise<void>} deps.refreshAdminTopics
 * @param {(name: string) => string} deps.previewFor   the topic's current English answer
 * @param {string[] | null} deps.holdoutQuestions
 */
export function createTrainingService(deps) {
  const { getAccessToken, projectId, serviceAccountEmail, supabaseUrl, supabaseSecretKey, getAdminTopics, refreshAdminTopics, previewFor, holdoutQuestions } = deps;
  const supabaseConfigured = Boolean(supabaseUrl && supabaseSecretKey);
  let intentCache = null;
  let intentCacheAt = 0;
  // One write at a time: adding reads the intent's phrases and writes them back, so two staff
  // training the same intent at once would otherwise drop one of the phrases.
  let queue = Promise.resolve();

  const permissionMessage =
    `The chat server's Google service account${serviceAccountEmail ? ` (${serviceAccountEmail})` : ''} can chat with ` +
    'Dialogflow but is not allowed to edit it. In Google Cloud Console → IAM, give it the "Dialogflow API Admin" role, ' +
    'then try again. Admin topics can still be trained meanwhile.';

  async function dialogflow(method, url, body) {
    let token;
    try {
      token = await getAccessToken();
    } catch (err) {
      throw new TrainingError(503, 'DIALOGFLOW_UNAVAILABLE', `Could not sign in to Dialogflow: ${err.message}`);
    }
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 403) throw new TrainingError(503, 'DIALOGFLOW_PERMISSION', permissionMessage);
    if (!res.ok) {
      // A ZIP import gives intents new ids, so the cached list may point at ones that no longer
      // exist; read it afresh next time instead of failing for the rest of the cache period.
      intentCache = null;
      console.warn(`[Training] Dialogflow ${method} failed (${res.status}): ${data.error?.message || res.statusText}`);
      throw new TrainingError(502, 'DIALOGFLOW_ERROR', `Dialogflow refused the change (${data.error?.status || res.status}). Try again in a minute.`);
    }
    return data;
  }

  async function agentIntents({ fresh = false } = {}) {
    if (!fresh && intentCache && Date.now() - intentCacheAt < INTENT_CACHE_MS) return intentCache;
    const all = [];
    let pageToken = '';
    do {
      const url =
        `${DIALOGFLOW_API}/projects/${projectId}/agent/intents?intentView=INTENT_VIEW_FULL&languageCode=${LANGUAGE_CODE}` +
        `&pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
      const data = await dialogflow('GET', url);
      all.push(...(data.intents || []));
      pageToken = data.nextPageToken || '';
    } while (pageToken);
    intentCache = all;
    intentCacheAt = Date.now();
    return all;
  }

  const adminTopics = () => getAdminTopics().filter((row) => (row.training_phrases || []).length > 0);

  /** The topics a question can be added to, the best matches for it, and the question's language. */
  async function getOptions(question = '') {
    let dialogflowError = null;
    let intents = [];
    try {
      intents = (await agentIntents()).filter(isTrainable);
    } catch (err) {
      if (!(err instanceof TrainingError)) throw err;
      dialogflowError = { code: err.code, message: err.message };
    }
    const topics = [
      ...intents.map((i) => ({
        name: i.displayName,
        kind: 'dialogflow',
        phrases: (i.trainingPhrases || []).map(phraseText),
        preview: previewFor(i.displayName) || i.messages?.find((m) => m.text)?.text?.text?.[0] || '',
      })),
      ...adminTopics().map((row) => ({
        name: row.intent_name,
        kind: 'admin',
        phrases: row.training_phrases,
        preview: row.response_en || row.response_bisaya || '',
      })),
    ];
    const suggested = question ? suggestTopics(question, topics) : [];
    return {
      language: question ? detectLanguage(question) : null,
      dialogflowError,
      suggested: suggested.map((s) => s.name),
      topics: topics
        .map(({ name, kind, phrases, preview }) => ({ name, kind, phraseCount: phrases.length, preview: preview.replace(/\s+/g, ' ').slice(0, 220) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  async function record(row) {
    if (!supabaseConfigured) return false;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/chatbot_training_phrases`, {
        method: 'POST',
        headers: {
          apikey: supabaseSecretKey,
          Authorization: `Bearer ${supabaseSecretKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error(`Supabase REST error ${res.status}${res.status === 404 ? ' (run supabase/add-chatbot-training-phrases.sql)' : ''}`);
      return true;
    } catch (err) {
      console.warn('[Training] Could not record the training phrase:', err.message);
      return false;
    }
  }

  async function addToDialogflow(intentName, phrase) {
    const intent = (await agentIntents()).find((i) => i.displayName === intentName);
    if (!intent) throw new TrainingError(404, 'UNKNOWN_TOPIC', 'That topic no longer exists. Reload the page and choose again.');
    if (!isTrainable(intent)) throw new TrainingError(400, 'NOT_TRAINABLE', 'Phrases cannot be added to that topic.');

    // Re-read just this intent: the cached copy may be minutes old.
    const current = await dialogflow('GET', `${DIALOGFLOW_API}/${intent.name}?intentView=INTENT_VIEW_FULL&languageCode=${LANGUAGE_CODE}`);
    const existing = current.trainingPhrases || [];
    if (existing.some((tp) => samePhrase(phraseText(tp), phrase))) {
      throw new TrainingError(409, 'DUPLICATE', `"${intentName}" already has this question.`);
    }
    // In two intents, the same phrase teaches the model nothing but confusion.
    const elsewhere = (await agentIntents()).find(
      (i) => i.displayName !== intentName && (i.trainingPhrases || []).some((tp) => samePhrase(phraseText(tp), phrase))
    );
    if (elsewhere) {
      throw new TrainingError(409, 'IN_OTHER_TOPIC', `This question already trains "${elsewhere.displayName}". Adding it to a second topic would confuse Bitoy.`);
    }

    await dialogflow(
      'PATCH',
      `${DIALOGFLOW_API}/${intent.name}?languageCode=${LANGUAGE_CODE}&updateMask=trainingPhrases`,
      { name: intent.name, displayName: current.displayName, trainingPhrases: [...existing, { type: 'EXAMPLE', parts: [{ text: phrase }] }] }
    );
    intentCache = null;
    // The agent normally retrains on its own after an edit; asking explicitly covers an agent
    // with automatic training switched off. Not awaited — training takes a minute or so.
    dialogflow('POST', `${DIALOGFLOW_API}/projects/${projectId}/agent:train`, {}).catch((err) =>
      console.warn('[Training] Retraining request failed (the agent retrains on its own if automatic training is on):', err.message)
    );
  }

  async function addToAdminTopic(row, phrase) {
    if (!supabaseConfigured) throw new TrainingError(503, 'SUPABASE_UNAVAILABLE', 'The chat server is not connected to the database.');
    const phrases = row.training_phrases || [];
    if (phrases.some((p) => samePhrase(p, phrase))) throw new TrainingError(409, 'DUPLICATE', `"${row.intent_name}" already has this question.`);
    const res = await fetch(`${supabaseUrl}/rest/v1/intent_responses?intent_name=eq.${encodeURIComponent(row.intent_name)}`, {
      method: 'PATCH',
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ training_phrases: [...phrases, phrase], updated_at: new Date().toISOString() }),
    });
    if (!res.ok) throw new TrainingError(502, 'SUPABASE_ERROR', `Could not save the question (database error ${res.status}).`);
    await refreshAdminTopics();
  }

  /**
   * Adds `phrase` to the topic `topic` ({ name, kind }). Resolves to what was added.
   * @throws {TrainingError}
   */
  function addPhrase({ phrase: input, topic, sourceQuestion, addedBy }) {
    const task = async () => {
      const cleaned = cleanPhrase(input);
      if ('error' in cleaned) throw new TrainingError(400, 'INVALID_PHRASE', cleaned.error);
      const { phrase } = cleaned;
      if (!holdoutQuestions) {
        throw new TrainingError(503, 'HOLDOUT_UNAVAILABLE', 'The evaluation test set could not be read, so the server cannot check this question against it. Tell the developers.');
      }
      if (resemblesHoldout(phrase, holdoutQuestions)) {
        throw new TrainingError(
          422,
          'HOLDOUT',
          "This question is too close to one of the questions used to measure Bitoy's accuracy (the evaluation test set). " +
            'Training on it would make the accuracy score meaningless, so it cannot be added.'
        );
      }

      const kind = topic?.kind === 'admin' ? 'admin' : 'dialogflow';
      if (kind === 'admin') {
        const row = adminTopics().find((r) => r.intent_name === topic?.name);
        if (!row) throw new TrainingError(404, 'UNKNOWN_TOPIC', 'That topic no longer exists. Reload the page and choose again.');
        await addToAdminTopic(row, phrase);
      } else {
        await addToDialogflow(String(topic?.name || ''), phrase);
      }

      const language = detectLanguage(phrase);
      const source = String(sourceQuestion ?? '').trim().slice(0, 500);
      const logged = await record({
        phrase,
        intent_name: topic.name,
        target: kind === 'admin' ? 'admin_topic' : 'dialogflow',
        language,
        source_question: source && source !== phrase ? source : null,
        added_by: addedBy || null,
      });
      console.log(`[Training] ${addedBy || 'An admin'} added "${phrase}" to ${kind === 'admin' ? 'admin topic' : 'intent'} ${topic.name}.`);
      return { phrase, topic: topic.name, kind, language, logged };
    };
    const run = queue.then(task, task);
    queue = run.catch(() => undefined); // the next task runs whatever this one did
    return run;
  }

  return { getOptions, addPhrase };
}
