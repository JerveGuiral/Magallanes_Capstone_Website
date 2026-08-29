import fs from 'fs';
import crypto from 'crypto';

async function listIntents() {
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

  const r = await fetch(`https://dialogflow.googleapis.com/v2/projects/${creds.project_id}/agent/intents`, {
    headers: { 'Authorization': `Bearer ${access_token}` }
  });
  const data = await r.json();
  console.log('Response status:', r.status);
  console.log('Data keys:', Object.keys(data));
  console.log('Data:', JSON.stringify(data, null, 2));
}

listIntents().catch(console.error);
