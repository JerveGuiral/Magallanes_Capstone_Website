// Offline checks for services/liveContent.js: answers built from posted content, run against
// fixture content (no Supabase, no Dialogflow). Run: node server/test-live-content.js
import assert from 'node:assert/strict';
import { answerFromLiveContent } from './services/liveContent.js';

const content = {
  news: [
    { id: '1', title: 'Free rabies vaccination', body: 'Bring your dogs and cats to the plaza on Friday for free vaccination.', category: 'advisory', created_at: '2026-10-20T00:00:00Z' },
  ],
  services: [],
  officials: [],
  offices: [],
  barangays: [],
  bids: [],
  documents: [],
  forms: [
    { title: 'Business Permit Application Form', title_bisaya: null, description: 'Unified form for new and renewal applications.', office: 'Business Permits and Licensing Office' },
    { title: 'Application for Birth Certificate Registration', title_bisaya: 'Aplikasyon sa Pagparehistro sa Birth Certificate', description: 'For late registration of birth.', office: 'Municipal Civil Registrar' },
  ],
};
const noForms = { ...content, forms: [] };

const ask = (message, intent = 'Default Fallback Intent', language = 'english', c = content) =>
  answerFromLiveContent({ message, intent, language }, c);

let passed = 0;
async function check(name, fn) {
  await fn();
  passed++;
  console.log(`  ok  ${name}`);
}

await check('names the matching form', async () => {
  const r = await ask('Where can I download the business permit form?', 'permit.business.new.inquire');
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /^Business Permit Application Form/);
  assert.match(r.reply, /Downloadable Forms page/);
});

await check('lists the forms when no form is named', async () => {
  const r = await ask('What forms can I download?');
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /^Forms you can download/);
  assert.match(r.reply, /• Business Permit Application Form \(Business Permits and Licensing Office\)/);
  assert.match(r.reply, /• Application for Birth Certificate Registration/);
});

await check('answers in Bisaya with the Bisaya title', async () => {
  const r = await ask('Asa makuha ang porma sa birth certificate?', 'civil.registry.birth.new.inquire', 'bisaya');
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /^Aplikasyon sa Pagparehistro sa Birth Certificate/);
  assert.match(r.reply, /I-download kini/);
});

await check('Bisaya list question with particles is still a list question', async () => {
  const r = await ask('Naa moy forms?', 'Default Fallback Intent', 'bisaya');
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /^Mga porma nga ma-download/);
});

await check('a recognised question about a form that is not posted keeps its own answer', async () => {
  const r = await ask('Where can I get the form for a building permit?', 'permit.building.process.inquire');
  assert.equal(r, null);
});

await check('an unrecognised question about a form that is not posted gets the list', async () => {
  const r = await ask('Do you have the cedula form?');
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /^I couldn't find a form for that\./);
});

await check('says so when no forms are posted', async () => {
  const r = await ask('Where can I download forms?', 'Default Fallback Intent', 'english', noForms);
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /No downloadable forms are posted/);
});

await check('"information" is not a forms question', async () => {
  const r = await ask('I need information about the business permit', 'permit.business.new.inquire');
  assert.equal(r, null);
});

await check('officials questions are left to the officials answers', async () => {
  const r = await ask('Who signs the business permit form?', 'officials.mayor.inquire');
  assert.notEqual(r?.intent, 'live.forms');
});

await check('the search of everything finds a form', async () => {
  const r = await ask('business permit application');
  assert.equal(r.intent, 'live.forms');
  assert.match(r.reply, /^Business Permit Application Form/);
});

const withServices = {
  ...content,
  services: [
    { name: 'Business Permit Renewal', requirements: '1. Previous permit', office: 'BPLO' },
    { name: 'Marriage License Application', requirements: '1. Birth Certificate', office: 'LCRO' },
  ],
};

await check('a new-permit question does not get the renewal checklist', async () => {
  const r = await ask('How do I apply for a business permit?', 'Default Fallback Intent', 'english', withServices);
  assert.notEqual(r?.intent, 'live.service');
});

await check('a renewal question still finds the renewal checklist', async () => {
  const r = await ask('how to renew my business permit', 'Default Fallback Intent', 'english', withServices);
  assert.equal(r.intent, 'live.service');
  assert.match(r.reply, /^Business Permit Renewal/);
});

await check('a service without a qualifier still matches', async () => {
  const r = await ask('requirements for marriage license', 'Default Fallback Intent', 'english', withServices);
  assert.equal(r.intent, 'live.service');
  assert.match(r.reply, /^Marriage License Application/);
});

await check('news questions still go to the news', async () => {
  const r = await ask('Any news about vaccination?');
  assert.equal(r.intent, 'live.news');
  assert.match(r.reply, /^Free rabies vaccination/);
});

await check('bids questions still go to the bids', async () => {
  const r = await ask('Are there open bids?');
  assert.equal(r.intent, 'live.bids');
});

await check('transparency questions still go to the documents', async () => {
  const r = await ask('Where can I see the annual budget?');
  assert.equal(r.intent, 'live.documents');
});

await check('content without a forms table (migration not run) still answers', async () => {
  const withoutForms = { ...content };
  delete withoutForms.forms;
  const r = await ask('Where can I download forms?', 'Default Fallback Intent', 'english', withoutForms);
  assert.match(r.reply, /No downloadable forms are posted/);
});

console.log(`\n${passed} checks passed.`);
