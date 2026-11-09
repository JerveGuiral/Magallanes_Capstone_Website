// Offline checks for training from the admin panel (services/training.js): the phrase guards, the
// held-out test set guard, topic suggestions, and the calls made to Dialogflow and Supabase —
// against fakes, so the live agent is never touched.
// Run: node server/test-training.js
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cleanPhrase,
  createTrainingService,
  loadHoldoutQuestions,
  resemblesHoldout,
  suggestTopics,
  TrainingError,
  wordSimilarity,
} from './services/training.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
};

// --- Phrase guards ---
await check('keeps the resident wording, trims spaces', () => {
  assert.deepEqual(cleanPhrase('  unsaon pag  kuha og permit sa tindahan?  '), { phrase: 'unsaon pag kuha og permit sa tindahan?' });
});
await check('rejects empty, symbol-only, braces and over-long phrases', () => {
  assert.ok('error' in cleanPhrase(' '));
  assert.ok('error' in cleanPhrase('?? 123'));
  assert.ok('error' in cleanPhrase('permit {@barangay:Poblacion}'));
  assert.ok('error' in cleanPhrase('a'.repeat(257)));
});

// --- Held-out test set ---
const holdout = loadHoldoutQuestions(path.join(__dirname, '../evaluation/test-set.json'));
await check('reads every held-out question, conversations included', () => {
  assert.ok(Array.isArray(holdout) && holdout.length >= 100, `got ${holdout?.length}`);
});
await check('blocks a copy and a near-copy of a test question', () => {
  const q = holdout[0];
  assert.equal(resemblesHoldout(q, holdout), true);
  assert.equal(resemblesHoldout(q.toUpperCase() + '!!', holdout), true);
  // One word dropped from a long question is still the test question.
  const words = q.split(' ');
  assert.ok(words.length >= 5);
  const nearCopy = words.slice(0, -1).join(' ');
  assert.ok(wordSimilarity(nearCopy, q) >= 0.6);
  assert.equal(resemblesHoldout(nearCopy, holdout), true);
});
await check('lets an unrelated question through', () => {
  assert.equal(resemblesHoldout('asa mapalit ang ticket sa pump boat padulong Butuan', holdout), false);
});
await check('a missing test set reads as null (adding is then blocked)', () => {
  assert.equal(loadHoldoutQuestions(path.join(__dirname, 'no-such-file.json')), null);
});

// --- Suggestions ---
await check('suggests the topic whose phrases share distinctive words', () => {
  const topics = [
    { name: 'permit.business.new.inquire', phrases: ['business permit requirements', 'unsa requirements sa business permit'] },
    { name: 'ctc.cedula.inquire', phrases: ['where can I get a cedula'] },
  ];
  const s = suggestTopics('unsaon pagkuha og business permit sa tindahan', topics);
  assert.equal(s[0]?.name, 'permit.business.new.inquire');
  assert.ok(!s.some((x) => x.name === 'ctc.cedula.inquire'));
});

// --- The service, against a fake Dialogflow and Supabase ---
const INTENT_ID = 'projects/p/agent/intents/abc';
function fakeWorld({ forbidden = false } = {}) {
  const calls = [];
  const intent = {
    name: INTENT_ID,
    displayName: 'permit.business.new.inquire',
    trainingPhrases: [{ name: 'tp1', type: 'EXAMPLE', parts: [{ text: 'business permit requirements' }] }],
    messages: [{ text: { text: ['Requirements for a NEW business permit…'] } }],
  };
  const agent = [
    intent,
    { name: 'projects/p/agent/intents/fb', displayName: 'Default Fallback Intent', isFallback: true, trainingPhrases: [] },
    { name: 'projects/p/agent/intents/fu', displayName: 'permit.business.fees.followup', inputContextNames: ['x'], trainingPhrases: [] },
    { name: 'projects/p/agent/intents/vq', displayName: 'vague.question.ceb', trainingPhrases: [{ type: 'EXAMPLE', parts: [{ text: 'unsa man' }] }] },
    { name: 'projects/p/agent/intents/ce', displayName: 'ctc.cedula.inquire', trainingPhrases: [{ type: 'EXAMPLE', parts: [{ text: 'where can I get a cedula' }] }] },
  ];
  const adminRows = [{ intent_name: 'custom.senior-id', training_phrases: ['how do I get a senior citizen ID'], response_en: 'Go to the OSCA office.' }];
  global.fetch = async (url, opts = {}) => {
    const method = opts.method || 'GET';
    calls.push({ method, url: String(url), body: opts.body ? JSON.parse(opts.body) : undefined });
    const json = (status, body) => ({ ok: status < 400, status, statusText: '', json: async () => body });
    if (String(url).includes('dialogflow.googleapis.com')) {
      if (forbidden) return json(403, { error: { status: 'PERMISSION_DENIED', message: 'denied' } });
      if (method === 'GET' && url.includes('/agent/intents?')) return json(200, { intents: agent });
      if (method === 'GET' && url.includes(INTENT_ID)) return json(200, intent);
      if (method === 'PATCH') return json(200, {});
      if (method === 'POST' && url.endsWith(':train')) return json(200, {});
    }
    if (String(url).includes('/rest/v1/')) return json(method === 'POST' ? 201 : 204, {});
    return json(404, {});
  };
  const service = createTrainingService({
    getAccessToken: async () => 'token',
    projectId: 'p',
    serviceAccountEmail: 'bot@p.iam.gserviceaccount.com',
    supabaseUrl: 'https://db.example',
    supabaseSecretKey: 'secret',
    getAdminTopics: () => adminRows,
    refreshAdminTopics: async () => undefined,
    previewFor: () => '',
    holdoutQuestions: holdout,
  });
  return { service, calls };
}
const rejectsWith = async (promise, code) => {
  await assert.rejects(promise, (err) => err instanceof TrainingError && err.code === code);
};

await check('lists trainable topics only (no fallback, no "be clearer" reply, no follow-ups), with suggestions', async () => {
  const { service } = fakeWorld();
  const o = await service.getOptions('unsaon pagkuha og business permit');
  const names = o.topics.map((t) => t.name);
  assert.deepEqual(names, ['ctc.cedula.inquire', 'custom.senior-id', 'permit.business.new.inquire']);
  assert.equal(o.suggested[0], 'permit.business.new.inquire');
  assert.equal(o.language, 'bisaya');
  assert.equal(o.dialogflowError, null);
});

await check('adds the phrase to the intent, keeps the old ones, retrains and records it', async () => {
  const { service, calls } = fakeWorld();
  const r = await service.addPhrase({
    phrase: 'unsaon pagkuha og permit sa tindahan',
    topic: { name: 'permit.business.new.inquire', kind: 'dialogflow' },
    sourceQuestion: 'unsaon pagkuha og permit sa tindahan?',
    addedBy: 'staff@lgu.ph',
  });
  assert.equal(r.language, 'bisaya');
  assert.equal(r.logged, true);
  const patch = calls.find((c) => c.method === 'PATCH');
  assert.ok(patch.url.includes(`${INTENT_ID}?languageCode=en&updateMask=trainingPhrases`));
  assert.deepEqual(patch.body.trainingPhrases.map((tp) => tp.parts.map((p) => p.text).join('')), [
    'business permit requirements',
    'unsaon pagkuha og permit sa tindahan',
  ]);
  assert.equal(patch.body.trainingPhrases[0].name, 'tp1', 'existing phrases are sent back unchanged');
  await new Promise((r) => setTimeout(r, 0));
  assert.ok(calls.some((c) => c.method === 'POST' && c.url.endsWith('/agent:train')));
  const log = calls.find((c) => c.method === 'POST' && c.url.endsWith('/chatbot_training_phrases'));
  assert.deepEqual(log.body, {
    phrase: 'unsaon pagkuha og permit sa tindahan',
    intent_name: 'permit.business.new.inquire',
    target: 'dialogflow',
    language: 'bisaya',
    source_question: 'unsaon pagkuha og permit sa tindahan?',
    added_by: 'staff@lgu.ph',
  });
});

await check('refuses a duplicate, a phrase another topic owns, the fallback, a "be clearer" reply and a test question', async () => {
  const { service, calls } = fakeWorld();
  await rejectsWith(service.addPhrase({ phrase: 'Business permit requirements?', topic: { name: 'permit.business.new.inquire' } }), 'DUPLICATE');
  await rejectsWith(service.addPhrase({ phrase: 'where can I get a cedula', topic: { name: 'permit.business.new.inquire' } }), 'IN_OTHER_TOPIC');
  await rejectsWith(service.addPhrase({ phrase: 'blah blah', topic: { name: 'Default Fallback Intent' } }), 'NOT_TRAINABLE');
  await rejectsWith(service.addPhrase({ phrase: 'unsa diay ni', topic: { name: 'vague.question.ceb' } }), 'NOT_TRAINABLE');
  await rejectsWith(service.addPhrase({ phrase: holdout[3], topic: { name: 'permit.business.new.inquire' } }), 'HOLDOUT');
  assert.ok(!calls.some((c) => c.method === 'PATCH'), 'nothing was written');
});

await check('adds to an admin topic in Supabase', async () => {
  const { service, calls } = fakeWorld();
  const r = await service.addPhrase({ phrase: 'unsaon pagkuha og OSCA ID', topic: { name: 'custom.senior-id', kind: 'admin' } });
  assert.equal(r.kind, 'admin');
  const patch = calls.find((c) => c.method === 'PATCH');
  assert.ok(patch.url.includes('/rest/v1/intent_responses?intent_name=eq.custom.senior-id'));
  assert.deepEqual(patch.body.training_phrases, ['how do I get a senior citizen ID', 'unsaon pagkuha og OSCA ID']);
  assert.equal(calls.find((c) => c.url.endsWith('/chatbot_training_phrases')).body.target, 'admin_topic');
});

await check('without Dialogflow edit rights: admin topics still listed, Dialogflow adds explain the fix', async () => {
  const { service } = fakeWorld({ forbidden: true });
  const o = await service.getOptions('senior citizen id');
  assert.equal(o.dialogflowError.code, 'DIALOGFLOW_PERMISSION');
  assert.match(o.dialogflowError.message, /Dialogflow API Admin/);
  assert.deepEqual(o.topics.map((t) => t.name), ['custom.senior-id']);
  await rejectsWith(service.addPhrase({ phrase: 'unsaon pagkuha og permit', topic: { name: 'permit.business.new.inquire' } }), 'DIALOGFLOW_PERMISSION');
});

await check('a failed add does not block the next one', async () => {
  const { service } = fakeWorld();
  await rejectsWith(service.addPhrase({ phrase: '', topic: { name: 'permit.business.new.inquire' } }), 'INVALID_PHRASE');
  const r = await service.addPhrase({ phrase: 'permit para sa sari-sari store', topic: { name: 'permit.business.new.inquire' } });
  assert.equal(r.topic, 'permit.business.new.inquire');
});

console.log(`\nTraining: ${passed} checks passed.`);
