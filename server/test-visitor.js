// Offline checks for what the visitor test (12 November 2026) found Magi could not answer or
// answered wrongly: each question reaches the right topic and gets the specific answer.
// Run: node server/test-visitor.js
import assert from 'node:assert/strict';
import { refineIntent, detectLanguage, correctSpelling } from './services/languageDetect.js';
import { specificAnswer } from './services/specific.js';
import { focusAnswer } from './services/focus.js';
import { INTENT_RESPONSES } from './services/responses.js';

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};
// What Magi routes a question to (spelling corrected first, as the server does).
const route = (q, df = 'Default Fallback Intent', conf = 0, last = '') => refineIntent(correctSpelling(q), df, [], { confidence: conf, lastIntent: last });
const reply = (intent, q) => {
  const language = detectLanguage(q);
  const whole = INTENT_RESPONSES[intent][language] || INTENT_RESPONSES[intent].english;
  return specificAnswer({ intent, question: q, language }) || focusAnswer(whole, { question: q, intent, language }) || whole;
};

check('questions Magi could not answer now reach a topic', () => {
  const cases = [
    // [question, what the agent matched in the visitor test, its confidence, expected]
    ['last trip sa barko paingon butuan?', 'transport.boat.schedule.inquire', 0.82, 'transport.boat.last-trip.inquire'],
    ['what is magallanes famous for?', 'tourism.spots.inquire', 0.51, 'tourism.spots.inquire'],
    ['where can i buy fresh fish', 'places.market.inquire', 0.5, 'places.market.inquire'],
    ['covid vaccine asa?', 'rhu.immunization.inquire', 0.75, 'rhu.adult-vaccine.inquire'],
    ['kanus-a ang collection sa basura?', 'env.burning.inquire', 0.67, 'env.garbage.inquire'],
    ['where to eat in magallanes', 'tourism.spots.inquire', 0.44, 'tourism.food.inquire'],
    ['jeep fare from magallanes to butuan', 'transport.boat.schedule.inquire', 0.72, 'transport.land.inquire'],
    ['is there a bank or atm in magallanes', 'tourism.accommodation.inquire', 0.44, 'places.banks.inquire'],
    ['naa bay gcash padala diri?', 'permit.business.payment.inquire', 0.46, 'places.banks.inquire'],
    ['nawala akong ID unsa akong buhaton?', 'social.pwd-id.inquire', 0.48, 'national.lost-id.inquire'],
    ['voters registration comelec magallanes', 'permit.business.registration.inquire', 0.52, 'national.comelec.inquire'],
    ['national id registration', 'agri.fisherfolk.inquire', 0.63, 'national.philsys.inquire'],
    ['passport application', 'permit.business.location.inquire', 0.45, 'national.passport.inquire'],
    ['drivers license lto', 'civil.registry.marriage.time.inquire', 0.59, 'national.lto.inquire'],
    ['sss contribution', 'social.philhealth.inquire', 0.48, 'national.sss.inquire'],
    ['pag-ibig loan', 'civil.registry.correction.sex.inquire', 0.34, 'national.pagibig.inquire'],
  ];
  for (const [q, df, conf, want] of cases) assert.equal(route(q, df, conf), want, q);
});

check('questions Magi answered wrongly now reach the right topic', () => {
  const cases = [
    ['libre ba ang check up sa RHU?', 'health.consultation.inquire', 0.69, 'health.consultation.inquire'],
    ['libre ba ang tambal sa RHU?', 'health.yakap.medicines.inquire', 0.62, 'health.yakap.medicines.inquire'],
    ['flu vaccine for senior citizens', 'seniors.office.inquire', 1, 'rhu.adult-vaccine.inquire'],
    ['palengke open ba kung sunday?', 'places.market.inquire', 0.63, 'places.market.inquire'],
    ['population of barangay poblacion', 'barangay.captain.poblacion.inquire', 0.84, 'about.facts.inquire'],
    ['is there a beach in magallanes', 'tourism.accommodation.inquire', 0.5, 'tourism.beach.inquire'],
    ['baha sa among lugar unsa akong buhaton', 'emergency.hotline.inquire', 0.51, 'disaster.flood.inquire'],
  ];
  for (const [q, df, conf, want] of cases) assert.equal(route(q, df, conf), want, q);
  // ...and what they must still not take.
  assert.equal(route('baha na diri, tabang! numero sa MERT?', 'emergency.hotline.inquire', 0.9), 'emergency.hotline.inquire');
  assert.equal(route('Where do I get a senior citizen ID?', 'seniors.office.inquire', 1), 'seniors.office.inquire');
  assert.equal(route('How do I get a tricycle franchise?', 'permit.tricycle.inquire', 0.94), 'permit.tricycle.inquire');
  assert.equal(route('Can I pay my business permit with GCash?', 'permit.business.payment.inquire', 1), 'permit.business.payment.inquire');
  assert.equal(route('marriage license requirements', 'marriage.main.en', 1), 'marriage.main.en');
  assert.equal(route('how to apply for a market stall', 'places.market.inquire', 0.8), 'permit.business.meedmo.inquire');
  assert.equal(route('Is the municipal hall open on Sunday?', 'office.hours.inquire', 0.6), 'office.hours.inquire');
});

check('the specific answer to each', () => {
  assert.match(reply('about.facts.inquire', 'population of barangay poblacion'), /^I don't have the population of each barangay\. Magallanes as a whole had 22,780/);
  assert.match(reply('health.rhu.laboratory.inquire', 'blood test sa RHU pila?'), /^Wala koy listahan sa bayad sa laboratory sa RHU/);
  assert.match(reply('places.market.inquire', 'palengke open ba kung sunday?'), /MEEDMO/);
  assert.match(reply('civil.registry.birth.new.inquire', 'birth certificate requirements'), /^Need a copy of a birth certificate that is already registered\? A PSA copy costs ₱155/);
  assert.match(reply('civil.registry.fees.inquire', 'pila ang birth certificate?'), /PSA copy ₱155/);
  // A bare follow-up asking what a short answer does not have: not on file, and who to ask.
  assert.match(reply('clearance.barangay.inquire', 'unsa oras?'), /^Wala koy listahan sa oras o iskedyul para niini\. .*Barangay Hall/);
  assert.match(reply('rhu.adult-vaccine.inquire', 'flu vaccine for senior citizens'), /free flu \(influenza\) and pneumococcal/);
  // Live, the narrowing kept only the flu sentence for a COVID question, and one flood step.
  assert.match(reply('rhu.adult-vaccine.inquire', 'covid vaccine asa?'), /COVID-19/);
  assert.match(reply('disaster.flood.inquire', 'baha sa among lugar unsa akong buhaton'), /evacuation center[\s\S]*main switch[\s\S]*MERT/);
  assert.match(reply('health.consultation.inquire', 'libre ba ang check-up sa RHU?'), /^Ang check-up sa Rural Health Unit libre sa mga rehistrado sa PhilHealth YAKAP/);
  // After the import the agent matched "asa ang RHU?" to the RHU schedule; the narrowing kept only its heading.
  assert.match(reply('health.rhu.schedule.inquire', 'asa ang RHU?'), /^Wala pa koy eksaktong address sa Rural Health Unit\. .*0948-623-6977/);
});

check('"unsa oras?" after YAKAP is the RHU schedule', () => {
  assert.equal(route('unsa oras?', 'smalltalk.time', 0.5, 'health.yakap.location.inquire'), 'health.rhu.schedule.inquire');
  assert.equal(route('unsa oras?', 'smalltalk.time', 0.5, 'clearance.barangay.inquire'), 'clearance.barangay.inquire');
  // ...and the next "unsa ang requirements?" is registering for YAKAP there, not the schedule again.
  assert.equal(route('unsa ang requirements?', 'health.followup.requirements.inquire', 1, 'health.rhu.schedule.inquire'), 'health.yakap.requirements.inquire');
});

check('"how long?" after the senior citizen ID stays on that topic', () => {
  assert.equal(route('how long?', 'civil.registry.marriage.time.inquire', 0.53, 'seniors.office.inquire'), 'seniors.office.inquire');
  assert.match(reply('seniors.office.inquire', 'how long?'), /^I don't have how long this takes, or how long it is valid, on file\./);
});

console.log(`\nVisitor test fixes: ${passed} checks passed.`);
