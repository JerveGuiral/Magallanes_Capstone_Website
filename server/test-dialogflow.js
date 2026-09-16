import fs from 'fs';
import crypto from 'crypto';
import { detectLanguage, refineIntent } from './services/languageDetect.js';
import { getResponse } from './services/responses.js';

async function testBilingualChatbot() {
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

  function base64url(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(encodedHeader + '.' + encodedClaim);
  const signature = signer.sign(creds.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: encodedHeader + '.' + encodedClaim + '.' + signature,
    }),
  });
  const { access_token } = await tokenRes.json();

  const testCases = [
    {
      query: 'Unsa akong kinahanglanon para sa business permit?',
      expectedLang: 'bisaya',
      expectedIntent: 'permit.business.new.inquire'
    },
    {
      query: 'What do I need for a new business permit?',
      expectedLang: 'english',
      expectedIntent: 'permit.business.new.inquire'
    },
    {
      query: 'Tagpila ang bayranon sa business permit?',
      expectedLang: 'bisaya',
      expectedIntent: 'permit.business.fees.inquire'
    },
    {
      query: 'How much are the business permit fees?',
      expectedLang: 'english',
      expectedIntent: 'permit.business.fees.inquire'
    },
    {
      query: 'Maayong adlaw!',
      expectedLang: 'bisaya',
      expectedIntent: 'Welcome'
    },
    {
      query: 'Hello good morning',
      expectedLang: 'english',
      expectedIntent: 'Welcome'
    },
    {
      query: 'Asa dapit ang munisipyo para mag apply?',
      expectedLang: 'bisaya',
      expectedIntent: 'permit.business.location.inquire'
    },
    {
      query: 'Where is the office located to apply?',
      expectedLang: 'english',
      expectedIntent: 'permit.business.location.inquire'
    }
  ];

  console.log('================================================================');
  console.log('   BILINGUAL DIALOGFLOW + LANGUAGE LOCALIZATION VERIFICATION    ');
  console.log('================================================================\n');

  let passed = 0;

  for (const tc of testCases) {
    const lang = detectLanguage(tc.query);

    const dfRes = await fetch(
      `https://dialogflow.googleapis.com/v2/projects/${creds.project_id}/agent/sessions/bilingual-eval:detectIntent`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryInput: {
            text: {
              text: tc.query,
              languageCode: 'en',
            },
          },
        }),
      }
    );
    const dfData = await dfRes.json();
    const qr = dfData.queryResult || {};
    let intentName = qr.intent?.displayName || 'Default Fallback Intent';
    
    // Apply semantic refinement
    intentName = refineIntent(tc.query, intentName, lang);

    const dfFulfillment = qr.fulfillmentText || '';
    const localizedReply = getResponse(intentName, lang, dfFulfillment);

    const match = intentName === tc.expectedIntent && lang === tc.expectedLang;
    if (match) passed++;

    console.log(`[USER QUERY]   "${tc.query}"`);
    console.log(`[DETECTED]     Language: ${lang.toUpperCase()} (Expected: ${tc.expectedLang.toUpperCase()})`);
    console.log(`[INTENT]       ${intentName} (Expected: ${tc.expectedIntent}) [${match ? 'PASS' : 'FAIL'}]`);
    console.log(`[BOT REPLY]    ${localizedReply}`);
    console.log('----------------------------------------------------------------\n');
  }

  console.log(`Test Results: ${passed} / ${testCases.length} test cases passed perfectly.`);
}

testBilingualChatbot().catch(console.error);
