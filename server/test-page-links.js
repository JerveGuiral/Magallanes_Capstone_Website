// Offline checks for services/pageLinks.js: answers end with a link to their page on the website.
// Run: node server/test-page-links.js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withPageLink, pageFor } from './services/pageLinks.js';
import { INTENT_RESPONSES } from './services/responses.js';

const SITE = 'https://magallanes-lgu.vercel.app';
const link = (reply, intent, language = 'english', path = null) => withPageLink(reply, { intent, language, siteUrl: SITE, path });

// The website's routes (src/App.tsx) and tourism pages (src/data/tourism.ts).
const ROUTES = new Set([...fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8').matchAll(/path="(\/[\w-]*)"/g)].map((m) => m[1]));
const PLACES = new Set([...fs.readFileSync(new URL('../src/data/tourism.ts', import.meta.url), 'utf8').matchAll(/^\s{4}id: '([\w-]+)'/gm)].map((m) => m[1]));
const pageSource = fs.readFileSync(new URL('./services/pageLinks.js', import.meta.url), 'utf8');
const listed = [...pageSource.split('const BY_INTENT')[1].matchAll(/'([\w.-]+)': '\//g)].map((m) => m[1]);

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

check('every linked page exists on the website', () => {
  for (const intent of [...listed, 'officials.mayor.inquire', 'barangay.captain.guiasan.inquire']) {
    const page = pageFor(intent);
    const [, top, place] = page.split('/');
    assert.ok(ROUTES.has(`/${top}`), `${intent} -> ${page}: no such route`);
    if (place) assert.ok(PLACES.has(place), `${intent} -> ${page}: no such tourism page`);
  }
});

check('every answer named in the list is one Bitoy has', () => {
  for (const intent of listed) {
    assert.ok(intent.startsWith('live.') || INTENT_RESPONSES[intent], `${intent} is not an answer`);
  }
});

check('an answer that names its page gets the link right under that sentence', () => {
  const r = link('File it through the Report a Concern form on this website.', 'report.concern.inquire');
  assert.equal(r, `File it through the Report a Concern form on this website.\n${SITE}/report`);
});

check('an answer that does not name its page gets a labelled link', () => {
  const r = link('Government offices are open Monday to Friday, 8:00 AM to 5:00 PM.', 'office.hours.inquire');
  assert.match(r, /\n\nContact page \(address, office hours, map and hotlines\):\nhttps:\/\/magallanes-lgu\.vercel\.app\/contact$/);
});

check('a tourism place links to its own page, labelled in Bisaya for a Bisaya answer', () => {
  const r = link('Ang Bitaug naa sa Caloc-an.', 'tourism.centennial-tree.inquire', 'bisaya');
  assert.match(r, /\n\nMga litrato ug detalye:\nhttps:\/\/magallanes-lgu\.vercel\.app\/tourism\/centennial-bitaug-tree$/);
});

check('one news post links to that post', () => {
  const r = link('Free rabies (Oct 25, 2026)\n\nBring your dogs.\n\nRead the full post on the News page.', 'live.news', 'english', '/news/abc-123');
  assert.match(r, /Read the full post on the News page\.\nhttps:\/\/magallanes-lgu\.vercel\.app\/news\/abc-123$/);
});

check('officials and barangay captains link to their pages', () => {
  assert.match(link('The mayor is Hon. Cesar C. Cumba, Jr.', 'officials.mayor.inquire'), /\/officials$/);
  assert.match(link('The captain of Guiasan is …', 'barangay.captain.guiasan.inquire'), /\/barangays$/);
});

check('no link is added twice, nor to answers without a page', () => {
  const photo = `Here are photos:\n${SITE}/tourism/magellan-shrine`;
  assert.equal(link(photo, 'tourism.magellan-shrine.inquire'), photo);
  assert.equal(link('Here are videos …', 'media.video'), 'Here are videos …');
  assert.equal(link("I'm sorry, I didn't quite catch that.", 'Default Fallback Intent'), "I'm sorry, I didn't quite catch that.");
  assert.equal(link('Pila ang bayad?', 'permit.business.fees.inquire'), 'Pila ang bayad?');
});

console.log(`\n${passed} checks passed.`);
