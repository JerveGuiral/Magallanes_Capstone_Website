import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { detectLanguage, refineIntent, normalizeBisayaQuery } from './services/languageDetect.js';
import { getResponse } from './services/responses.js';

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
    dbIntentResponses = next;
    console.log(`[Chatbot] Loaded ${dbIntentResponses.size} admin-configured intent response(s) from Supabase.`);
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
    const { message, sessionId = 'default-user-session', languageOverride } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A valid text message is required.' });
    }

    // 1. Detect language (Bisaya vs English)
    const detectedLanguage = languageOverride || detectLanguage(message);

    // 2. Prepare query for Dialogflow (normalize Bisaya phrasing into NLU-understandable query)
    const queryToSend = normalizeBisayaQuery(message);

    // Retrieve previous session contexts from memory
    const existingMemory = sessionContextMemory.get(sessionId) || { contexts: [], lastIntent: '' };

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
              text: queryToSend,
              languageCode: 'en',
            },
          },
        }),
      });

      const data = await dfResponse.json();

      if (!data.error) {
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
    const finalIntent = refineIntent(message, dfIntent, allContextNames, {
      confidence: dfConfidence,
      lastIntent: existingMemory.lastIntent,
    });

    // Update session context memory
    sessionContextMemory.set(sessionId, {
      contexts: outputContexts,
      lastIntent: finalIntent,
      updatedAt: Date.now(),
    });

    // 4. Localize the response based on final intent + detected language.
    // Precedence: an admin edit in the Chatbot Responses screen, then the agent's own English
    // wording, then the local file (which owns every Bisaya translation). The agent's text is
    // only offered when refineIntent kept Dialogflow's classification — once it redirects to a
    // different intent, the text Dialogflow returned describes the topic it originally matched.
    const fulfillmentMatchesFinalIntent = finalIntent === dfIntent;
    const localizedReply =
      getDbResponse(finalIntent, detectedLanguage) ||
      getResponse(finalIntent, detectedLanguage, fulfillmentMatchesFinalIntent ? dfFulfillment : '');

    // Log for the admin Chat Logs screen — not awaited, so a slow/failed log write never
    // delays the reply the citizen is waiting for.
    logChatInteraction({
      sessionId,
      userMessage: message,
      detectedIntent: finalIntent,
      botResponse: localizedReply,
      languageDetected: detectedLanguage,
    }).catch(() => {});

    return res.json({
      reply: localizedReply,
      intent: finalIntent,
      language: detectedLanguage,
      confidence: dfConfidence || 1,
      parameters: dfParameters,
      sessionId: sessionId,
      responseId: responseId,
    });
  } catch (error) {
    console.error('[Dialogflow Chat Error]:', error);
    return res.status(500).json({
      error: 'Failed to process message with Dialogflow',
      details: error.message,
    });
  }
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
setInterval(() => refreshDbIntentResponses().catch(console.error), 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`[Backend] Dialogflow API server running on http://localhost:${PORT}`);
});
