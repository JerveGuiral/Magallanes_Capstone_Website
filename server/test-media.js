// Offline checks for services/media.js: "show me a photo / video of …" answers with links.
// Run: node server/test-media.js
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { answerMediaRequest } from './services/media.js';

const SITE = 'https://magallanes-lgu.vercel.app';
const ask = (message, language = 'english', lastIntent = '') => answerMediaRequest({ message, language, lastIntent, siteUrl: SITE });
// The tourism pages the website really has (src/data/tourism.ts), so no link can point nowhere.
const PAGES = new Set([...fs.readFileSync(new URL('../src/data/tourism.ts', import.meta.url), 'utf8').matchAll(/^\s{4}id: '([\w-]+)'/gm)].map((m) => m[1]));
const pagesIn = (reply) => [...reply.matchAll(/\/tourism\/([\w-]+)/g)].map((m) => m[1]);

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
}

check('a video of the Bitaug tree (the adviser\'s example, misspelled) gives a YouTube search and the photo page', () => {
  const r = ask('show a video of bituag tree');
  assert.equal(r.intent, 'media.video');
  assert.match(r.reply, /youtube\.com\/results\?search_query=Bitaug\+tree\+Magallanes/);
  assert.match(r.reply, /\/tourism\/centennial-bitaug-tree/);
});

check('a photo of the Bitaug tree gives the website page', () => {
  const r = ask('show me a photo of the bitaug tree');
  assert.equal(r.intent, 'media.photo');
  assert.match(r.reply, /^Here are photos of the Philippine Centennial Bitaug Tree on the municipal website:\nhttps:\/\/magallanes-lgu\.vercel\.app\/tourism\/centennial-bitaug-tree/);
});

check('Bisaya: "naa bay litrato sa Magellan Shrine?"', () => {
  const r = ask('naa bay litrato sa Magellan Shrine?', 'bisaya');
  assert.equal(r.intent, 'media.photo');
  assert.match(r.reply, /^Ania ang mga litrato sa Magellan Shrine sa website sa munisipyo:/);
  assert.doesNotMatch(r.reply, /\bthe\b/i);
  assert.match(r.reply, /\/tourism\/magellan-shrine/);
});

check('every place links to a page the website has', () => {
  for (const q of ['photo of the bay walk', 'picture of guiasan bridge', 'photo of the parish church', 'pictures of the river delta', 'photo of the municipal hall', 'photo of the public market', 'photo of the magellan shrine', 'photo of the bitaug tree']) {
    const pages = pagesIn(ask(q).reply);
    assert.equal(pages.length, 1, q);
    assert.ok(PAGES.has(pages[0]), `${q} -> /tourism/${pages[0]} does not exist`);
  }
});

check('an event without a photo page points to the LGU Facebook page and YouTube', () => {
  const r = ask('Pakita ko og video sa Lisagan festival', 'bisaya');
  assert.equal(r.intent, 'media.video');
  assert.match(r.reply, /facebook\.com\/MagallanesADNPIO/);
  assert.match(r.reply, /search_query=Lisagan\+Festival/);
});

check('photos of the town in general go to the Visit Magallanes page', () => {
  const r = ask('Can I see pictures of Magallanes?');
  assert.match(r.reply, /https:\/\/magallanes-lgu\.vercel\.app\/tourism\n/);
});

check('"can I see a picture?" right after the Bitaug tree answer means the Bitaug tree', () => {
  const r = ask('can I see a picture?', 'english', 'tourism.centennial-tree.inquire');
  assert.match(r.reply, /\/tourism\/centennial-bitaug-tree/);
});

check('a photo request naming no place, with nothing before it, is left to the other answers', () => {
  assert.equal(ask('show me a photo'), null);
});

check('ID photo requirements are not photo requests', () => {
  assert.equal(ask('Do I need a 2x2 picture for the PWD ID?'), null);
  assert.equal(ask('Unsa ang kinahanglan nga litrato sa solo parent ID?', 'bisaya'), null);
});

check('"Can I take pictures inside the church?" is not a photo request', () => {
  assert.equal(ask('Can I take pictures inside the church?'), null);
});

check('questions without a photo or video word are untouched', () => {
  assert.equal(ask('Where is the Bitaug tree?'), null);
  assert.equal(ask('Who is the mayor?'), null);
});

console.log(`\n${passed} checks passed.`);
