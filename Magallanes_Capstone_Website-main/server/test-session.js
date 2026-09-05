import fs from 'fs';
import crypto from 'crypto';
import { detectLanguage, refineIntent, normalizeBisayaQuery } from './services/languageDetect.js';
import { getResponse } from './services/responses.js';

async function testSessionMemory() {
  const creds = JSON.parse(fs.readFileSync('./credentials/dialogflow-service-account.json', 'utf8'));
  const res = await fetch('https://www.google.com', { method: 'HEAD' });
  const serverTime = new Date(res.headers.get('date')).getTime();
  const nowSec = Math.floor(serverTime / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/dialogflow',
    aud: 'https://oauth2.googleapis.com/token',
    exp: nowSec + 3600,
    iat: nowSec - 10,
  };
  function b64(s) { return Buffer.from(s).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_'); }
  const h = b64(JSON.stringify(header));
  const c = b64(JSON.stringify(claim));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(h + '.' + c);
  const sig = signer.sign(creds.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: h + '.' + c + '.' + sig }),
  });
  const { access_token } = await tokenRes.json();

  const sessId = 'test-conversation-session-' + Date.now();
  console.log('Session ID:', sessId);

  const conversation = [
    { query: 'Unsa akong kinahanglanon para sa business permit?', expectedIntent: 'permit.business.new.inquire' },
    { query: 'tag pila sab?', expectedIntent: 'permit.business.fees.inquire' },
    { query: 'unsa kadugay makuha?', expectedIntent: 'permit.business.process.inquire' },
    { query: 'asa dapit ang opisina?', expectedIntent: 'permit.business.location.inquire' },
  ];

  let lastActiveContexts = [];

  for (let i = 0; i < conversation.length; i++) {
    const item = conversation[i];
    const detectedLang = detectLanguage(item.query);
    const queryToSend = normalizeBisayaQuery(item.query);

    console.log(`\n--- TURN ${i + 1} ---`);
    console.log(`[USER QUERY]       "${item.query}" (Normalized: "${queryToSend}", Detected: ${detectedLang.toUpperCase()})`);

    const dfRes = await fetch(`https://dialogflow.googleapis.com/v2/projects/${creds.project_id}/agent/sessions/${sessId}:detectIntent`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ queryInput: { text: { text: queryToSend, languageCode: 'en' } } })
    });
    const dfData = await dfRes.json();
    const qr = dfData.queryResult || {};
    let dfIntent = qr.intent?.displayName || 'Default Fallback Intent';
    
    lastActiveContexts = (qr.outputContexts || []).map(x => x.name.split('/contexts/')[1]);
    console.log(`[DF RAW INTENT]    ${dfIntent} (Confidence: ${((qr.intentDetectionConfidence || 0) * 100).toFixed(1)}%)`);
    console.log(`[ACTIVE CONTEXTS]  ${lastActiveContexts.join(', ') || 'none'}`);

    const finalIntent = refineIntent(item.query, dfIntent, lastActiveContexts);
    const reply = getResponse(finalIntent, detectedLang, qr.fulfillmentText);

    const match = finalIntent === item.expectedIntent;
    console.log(`[FINAL INTENT]     ${finalIntent} (Expected: ${item.expectedIntent}) [${match ? 'PASS' : 'FAIL'}]`);
    console.log(`[BOT REPLY]        ${reply}`);
  }
}

testSessionMemory().catch(console.error);
