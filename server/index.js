import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { detectLanguage, refineIntent, normalizeBisayaQuery, hasEnglishWords } from './services/languageDetect.js';
import { getResponse } from './services/responses.js';
import { resolveOfficialsFollowup } from './services/officials.js';
import { resolveBusinessFollowup } from './services/businessPermit.js';
import { resolveCivilFollowup, isCivilIntent } from './services/civilRegistry.js';
import { resolveHealthFollowup, isHealthIntent } from './services/health.js';
import { answerFromLiveContent, getLiveContent, matchCustomIntent } from './services/liveContent.js';
import { INTENT_RESPONSES } from './services/responses.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- Admin-editable chatbot responses (Supabase `intent_responses` table) ---
// Lets edits made in the admin "Chatbot Responses" screen take effect live, without a
// code deploy. Falls back to the hardcoded responses.js file when a row isn't found or
// Supabase isn't configured. Queries the REST API directly with plain fetch rather than
// @supabase/supabase-js — that SDK's realtime client requires a native WebSocket, which
// isn't available on Node 20 and below, and no realtime features are needed here.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
const supabaseConfigured = Boolean(supabaseUrl && supabaseSecretKey);

let dbIntentResponses = new Map();

async function refreshDbIntentResponses(retriesLeft = 1) {
  if (!supabaseConfigured) return;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/intent_responses?select=*`, {
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
      },
    });
    if (!res.ok) throw new Error(`Supabase REST error ${res.status}`);
    const rows = await res.json();
    const next = new Map();
    for (const row of rows) {
      next.set(row.intent_name, row);
    }
    // Refreshed every 30 s, so only log when something changed.
    if (next.size !== dbIntentResponses.size) {
      console.log(`[Chatbot] Loaded ${next.size} admin-configured intent response(s) from Supabase.`);
    }
    dbIntentResponses = next;
  } catch (err) {
    // The very first outbound request right at process startup occasionally fails on a
    // cold network stack — one quick retry clears that without needing a fixed startup delay.
    if (retriesLeft > 0) {
      await new Promise((r) => setTimeout(r, 1500));
      return refreshDbIntentResponses(retriesLeft - 1);
    }
    console.warn('[Chatbot] Could not refresh intent_responses from Supabase:', err.message);
  }
}

/**
 * Lower-cases a message typed with caps lock on (mostly capital letters), and leaves ordinary
 * text alone — "Do I need DTI or SEC?" keeps its acronyms.
 */
function calmCase(text) {
  const letters = text.replace(/[^A-Za-zÑñ]/g, '');
  if (letters.length < 3) return text;
  const upper = letters.replace(/[^A-ZÑ]/g, '').length;
  return upper / letters.length >= 0.6 ? text.toLowerCase() : text;
}

// The follow-up intents several threads share a phrasing for ("how much?", "what do I need?",
// "where?"). Civil registry has no location follow-up.
const SHARED_FOLLOWUPS = new Set([
  'permit.business.followup.fees.inquire', 'permit.business.followup.requirements.inquire', 'permit.business.followup.location.inquire',
  'civil.registry.followup.fees.inquire', 'civil.registry.followup.requirements.inquire',
  'health.followup.fees.inquire', 'health.followup.requirements.inquire', 'health.followup.location.inquire',
]);
const threadOf = (intent = '') =>
  intent.startsWith('permit.business') ? 'permit.business' : isCivilIntent(intent) ? 'civil.registry' : isHealthIntent(intent) ? 'health' : '';

/** Swaps a shared-phrasing follow-up for its twin in the thread the previous answer belongs to. */
function followupForCurrentThread(intent, lastIntent = '') {
  if (!SHARED_FOLLOWUPS.has(intent)) return intent;
  const thread = threadOf(lastIntent);
  const twin = thread && intent.replace(/^(permit\.business|civil\.registry|health)\./, `${thread}.`);
  return twin && SHARED_FOLLOWUPS.has(twin) ? twin : intent;
}

// Intents meaning "the agent didn't recognise this question" — where looser admin matches apply.
const UNRECOGNISED_INTENTS = new Set(['Default Fallback Intent', 'vague.question.en', 'vague.question.ceb']);

function getDbResponse(intentName, language) {
  const row = dbIntentResponses.get(intentName);
  if (!row) return null;
  if (language === 'bisaya' && row.response_bisaya) return row.response_bisaya;
  return row.response_en || row.response_bisaya || null;
}

// --- Chat session logging (Supabase `chatbot_session_logs` table) ---
// Nothing previously wrote to this table, so the admin "Chat Logs" screen only ever showed
// seed/placeholder rows even though real conversations were happening. Fire-and-forget: a
// logging failure should never block or slow down the reply to the citizen.
async function logChatInteraction({ sessionId, userMessage, detectedIntent, botResponse, languageDetected }) {
  if (!supabaseConfigured) return;
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/chatbot_session_logs`, {
      method: 'POST',
      headers: {
        apikey: supabaseSecretKey,
        Authorization: `Bearer ${supabaseSecretKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_message: userMessage,
        detected_intent: detectedIntent,
        bot_response: botResponse,
        language_detected: languageDetected,
      }),
    });
    if (!res.ok) throw new Error(`Supabase REST error ${res.status}`);
  } catch (err) {
    console.warn('[Chatbot] Could not log interaction to Supabase:', err.message);
  }
}

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../credentials/dialogflow-service-account.json');
const projectId = process.env.DIALOGFLOW_PROJECT_ID || 'web-chatbot-m9uv';

let credentials = null;
try {
  const resolvedPath = path.resolve(credentialsPath);
  if (fs.existsSync(resolvedPath)) {
    credentials = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    console.log(`[Dialogflow] Successfully loaded credentials for ${credentials.client_email} (Project: ${projectId})`);
  } else {
    console.warn(`[Dialogflow] Warning: Credentials file not found at: ${resolvedPath}`);
  }
} catch (err) {
  console.error('[Dialogflow] Error reading service account JSON:', err.message);
}

// In-memory session context cache for multi-turn conversational follow-ups
const sessionContextMemory = new Map();

// Sessions idle this long are forgotten. Without this the map grew for the life of the
// process — one entry per visitor, never removed. 30 minutes comfortably outlasts any real
// conversation (Dialogflow's own contexts expire sooner).
const SESSION_IDLE_MS = 30 * 60 * 1000;
setInterval(() => {
  const cutoff = Date.now() - SESSION_IDLE_MS;
  for (const [id, memory] of sessionContextMemory) {
    if ((memory.updatedAt || 0) < cutoff) sessionContextMemory.delete(id);
  }
}, 10 * 60 * 1000);

// Dialogflow ES rejects query text longer than 256 characters, so a long, polite message
// ("Good morning, I would like to ask about…") lost the NLU entirely and was answered by the
// greeting rule. The question is almost always within the first 256 characters.
const DIALOGFLOW_MAX_QUERY = 256;

// Token management with automatic clock drift synchronization
let cachedToken = null;
let tokenExpiresAt = 0;
let timeOffsetMs = 0;

async function syncTimeOffset() {
  try {
    const res = await fetch('https://www.google.com', { method: 'HEAD' });
    const serverDateHeader = res.headers.get('date');
    if (serverDateHeader) {
      const serverTime = new Date(serverDateHeader).getTime();
      const localTime = Date.now();
      timeOffsetMs = serverTime - localTime;
      console.log(`[Dialogflow Auth] Time sync: Clock offset is ${Math.round(timeOffsetMs / 1000)}s`);
    }
  } catch (e) {
    console.warn('[Dialogflow Auth] Could not sync clock offset with Google server, using local time:', e.message);
  }
}

function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken() {
  const adjustedNow = Date.now() + timeOffsetMs;
  if (cachedToken && adjustedNow < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  if (!credentials) {
    throw new Error('No service account credentials loaded');
  }

  if (timeOffsetMs === 0) {
    await syncTimeOffset();
  }

  const nowSec = Math.floor((Date.now() + timeOffsetMs) / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/dialogflow',
    aud: 'https://oauth2.googleapis.com/token',
    exp: nowSec + 3600,
    iat: nowSec - 10,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(encodedHeader + '.' + encodedClaim);
  const signature = signer.sign(credentials.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const assertion = `${encodedHeader}.${encodedClaim}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion,
    }),
  });

  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    await syncTimeOffset();
    throw new Error(`Google Auth error: ${tokenData.error_description || tokenData.error}`);
  }

  cachedToken = tokenData.access_token;
  tokenExpiresAt = Date.now() + timeOffsetMs + ((tokenData.expires_in || 3600) * 1000);
  return cachedToken;
}

// Dialogflow detection endpoint with language localization & multi-turn session memory
app.post('/api/chat', async (req, res) => {
  try {
    const { message: rawMessage, sessionId = 'default-user-session', languageOverride } = req.body;

    if (!rawMessage || typeof rawMessage !== 'string') {
      return res.status(400).json({ error: 'A valid text message is required.' });
    }
    // "PILA ANG BAYAD SA MARRIAGE LICENSE?" must be read exactly like the same words in lower
    // case — every rule, the agent and the website search see the calmed text; the log keeps
    // what the citizen typed.
    const message = calmCase(rawMessage);

    // Retrieve previous session contexts from memory
    const existingMemory = sessionContextMemory.get(sessionId) || { contexts: [], lastIntent: '', lastLanguage: '' };

    // 1. Detect language (Bisaya vs English). A short follow-up like "Sa Guiasan?" carries no
    // marker of its own, so it keeps the language the conversation is already in — unless it
    // is plainly English itself ("how are you", "thank you").
    let detectedLanguage = languageOverride || detectLanguage(message);
    if (
      !languageOverride &&
      detectedLanguage === 'english' &&
      existingMemory.lastLanguage === 'bisaya' &&
      message.trim().split(/\s+/).length <= 3 &&
      !hasEnglishWords(message)
    ) {
      detectedLanguage = 'bisaya';
    }

    // 2. Prepare query for Dialogflow (normalize Bisaya phrasing into NLU-understandable query)
    const queryToSend = normalizeBisayaQuery(message, { lastIntent: existingMemory.lastIntent });

    let dfIntent = 'Default Fallback Intent';
    let dfConfidence = 0;
    let dfFulfillment = '';
    let dfParameters = {};
    let responseId = '';
    let outputContexts = existingMemory.contexts;

    try {
      const token = await getAccessToken();
      const effectiveProjectId = credentials?.project_id || projectId;

      const dfUrl = `https://dialogflow.googleapis.com/v2/projects/${effectiveProjectId}/agent/sessions/${encodeURIComponent(sessionId)}:detectIntent`;

      const dfResponse = await fetch(dfUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: queryToSend.slice(0, DIALOGFLOW_MAX_QUERY),
              languageCode: 'en',
            },
          },
        }),
      });

      const data = await dfResponse.json();

      // A quota or auth error used to pass silently, and every question then got the fallback
      // as if the agent had not understood it.
      if (data.error) {
        console.warn(`[Dialogflow API Warning] detectIntent failed (${data.error.code} ${data.error.status}): ${data.error.message}`);
      } else {
        const queryResult = data.queryResult || {};
        dfIntent = queryResult.intent?.displayName || 'Default Fallback Intent';
        dfConfidence = queryResult.intentDetectionConfidence || 0;
        dfParameters = queryResult.parameters || {};
        responseId = data.responseId || '';
        if (queryResult.outputContexts && queryResult.outputContexts.length > 0) {
          outputContexts = queryResult.outputContexts;
        }
        dfFulfillment =
          queryResult.fulfillmentText ||
          (queryResult.fulfillmentMessages && queryResult.fulfillmentMessages.length > 0
            ? queryResult.fulfillmentMessages.map((m) => m.text?.text?.join(' ')).filter(Boolean).join('\n')
            : '');
      }
    } catch (dfErr) {
      console.warn('[Dialogflow API Warning] Could not reach Dialogflow directly, using local session refinement:', dfErr.message);
    }

    // 3. Refine intent using semantic rules, active contexts, and session memory.
    // The previous turn's intent is passed separately from the contexts — folding it into the
    // context list made refineIntent's substring checks treat an intent name as a context.
    const allContextNames = outputContexts.map((c) => (typeof c === 'string' ? c : c.name || ''));
    const refinedIntent = refineIntent(message, dfIntent, allContextNames, {
      confidence: dfConfidence,
      lastIntent: existingMemory.lastIntent,
    });

    // Officials follow-ups ("How about Guiasan?", "Unsa iyang email?") name a person or office
    // through an entity, or point back at the previous turn — resolve them to the actual answer.
    let finalIntent = resolveOfficialsFollowup(refinedIntent, dfParameters, existingMemory.lastIntent);
    // Business-permit follow-ups ("how much?", "asa?", "how about online sellers?") name the
    // topic of the thread they belong to.
    // Both follow-up contexts can be alive at once (each lasts 3 turns), and their "how much?" /
    // "what are the requirements?" intents share phrasings — so the agent may pick the older
    // thread's. The most recent topic decides.
    finalIntent = followupForCurrentThread(finalIntent, existingMemory.lastIntent);
    finalIntent = resolveBusinessFollowup(finalIntent);
    // Civil registry follow-ups: "how much?" means the fee of whatever was just discussed.
    finalIntent = resolveCivilFollowup(finalIntent, existingMemory.lastIntent);
    // Health follow-ups: "how much?" after the health card is the sanitary fees, after YAKAP it
    // is what YAKAP costs.
    finalIntent = resolveHealthFollowup(finalIntent, existingMemory.lastIntent);

    // Questions staff added in Admin → Chatbot Responses (rows with sample questions). They are
    // matched here, not by Dialogflow, so new topics need no agent changes. A close match (≥ 0.75)
    // wins outright; a looser one only fills in when nothing else recognised the question.
    const custom = matchCustomIntent(message, [...dbIntentResponses.values()]);
    if (custom && (custom.score >= 0.75 || UNRECOGNISED_INTENTS.has(finalIntent))) {
      finalIntent = custom.intent;
    }

    // Update session context memory
    sessionContextMemory.set(sessionId, {
      contexts: outputContexts,
      lastIntent: finalIntent,
      lastLanguage: detectedLanguage,
      updatedAt: Date.now(),
    });

    // 4. Localize the response based on final intent + detected language.
    // Precedence: an admin edit in the Chatbot Responses screen; then an answer built from what
    // is currently posted on the website (news, services, officials, offices, barangays, bids,
    // documents — see liveContent.js); then the agent's own English wording; then the local file
    // (which owns every Bisaya translation). The agent's text is only offered when refineIntent
    // kept Dialogflow's classification — once it redirects to a different intent, the text
    // Dialogflow returned describes the topic it originally matched.
    let replyIntent = finalIntent;
    let localizedReply = getDbResponse(finalIntent, detectedLanguage);
    if (!localizedReply) {
      const live = await answerFromLiveContent({ message, intent: finalIntent, language: detectedLanguage });
      if (live) {
        replyIntent = live.intent;
        localizedReply = live.reply;
      }
    }
    if (!localizedReply) {
      const fulfillmentMatchesFinalIntent = finalIntent === dfIntent;
      localizedReply = getResponse(finalIntent, detectedLanguage, fulfillmentMatchesFinalIntent ? dfFulfillment : '');
    }

    // Log for the admin Chat Logs screen — not awaited, so a slow/failed log write never
    // delays the reply the citizen is waiting for.
    logChatInteraction({
      sessionId,
      userMessage: rawMessage,
      detectedIntent: replyIntent,
      botResponse: localizedReply,
      languageDetected: detectedLanguage,
    }).catch(() => {});

    return res.json({
      reply: localizedReply,
      intent: replyIntent,
      language: detectedLanguage,
      confidence: dfConfidence || 1,
      parameters: dfParameters,
      sessionId: sessionId,
      responseId: responseId,
    });
  } catch (error) {
    // Details stay in the server log; the browser only learns that something failed.
    console.error('[Dialogflow Chat Error]:', error);
    return res.status(500).json({
      error: 'Failed to process message',
    });
  }
});

// The bot's built-in intents and their current default English answer, for the admin
// "Chatbot Responses" screen: staff pick from this list to change an existing answer instead of
// typing internal names by hand (a typo used to be silently ignored).
app.get('/api/intents', (req, res) => {
  const intents = Object.entries(INTENT_RESPONSES)
    .map(([name, r]) => ({ name, preview: (r.english || r.bisaya || '').slice(0, 160) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json({ intents });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: credentials?.project_id || projectId,
    credentialsConfigured: !!credentials,
    supabaseConfigured,
    adminIntentResponsesLoaded: dbIntentResponses.size,
    timeOffsetSeconds: Math.round(timeOffsetMs / 1000),
    activeSessions: sessionContextMemory.size,
    timestamp: new Date().toISOString(),
  });
});

// Initialize time offset and admin-configured responses on startup, then keep the
// latter in sync so edits in the admin panel reach the bot without a restart.
syncTimeOffset().catch(console.error);
refreshDbIntentResponses().catch(console.error);
// Warm the posted-content cache so the first visitor's question doesn't wait on it.
getLiveContent().then((c) => c && console.log(
  `[LiveContent] Loaded ${c.news.length} news, ${c.services.length} services, ${c.officials.length} officials, ` +
  `${c.offices.length} offices, ${c.barangays.length} barangays, ${c.bids.length} bids, ${c.documents.length} documents.`
));
// Every 30 s: an answer or new question saved in the admin panel reaches the bot within that.
setInterval(() => refreshDbIntentResponses().catch(console.error), 30 * 1000);

app.listen(PORT, () => {
  console.log(`[Backend] Dialogflow API server running on http://localhost:${PORT}`);
});
