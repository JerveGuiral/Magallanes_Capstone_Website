// Offline checks for the Rural Health Unit's posted services and the PhilHealth YAKAP poster
// (health.js, November 2026): questions reach the right topic, a question about a day or a
// named medicine/test gets the specific answer, and short follow-ups keep the topic.
// Run: node server/test-rhu.js
import assert from 'node:assert/strict';
import { refineIntent, detectLanguage } from './services/languageDetect.js';
import { specificAnswer } from './services/specific.js';
import { focusAnswer } from './services/focus.js';
import { INTENT_RESPONSES } from './services/responses.js';

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};
// What Magi routes a question to, with the agent's match and the previous topic.
const route = (q, df = 'Default Fallback Intent', conf = 0, last = '') => refineIntent(q, df, [], { confidence: conf, lastIntent: last });
// The reply the server sends for an intent: worked out, narrowed, or whole.
const reply = (intent, q, now = new Date('2026-11-12T02:00:00Z')) => {
  const language = detectLanguage(q);
  const whole = INTENT_RESPONSES[intent][language] || INTENT_RESPONSES[intent].english;
  return specificAnswer({ intent, question: q, language, now }) || focusAnswer(whole, { question: q, intent, language }) || whole;
};

check('questions about the RHU reach the right topic', () => {
  const cases = [
    ['What services does the RHU offer?', 'health.rhu.schedule.inquire'],
    ['unsa oras abri ang RHU?', 'health.rhu.schedule.inquire'],
    ['abri ba ang health center karong Sabado?', 'health.rhu.schedule.inquire'],
    ['When can I see a doctor at the RHU?', 'health.consultation.inquire'],
    ['asa magpa check-up?', 'health.consultation.inquire'],
    ['naa bay doktor sa RHU karon?', 'health.consultation.inquire'],
    ['What time is the laboratory open at the RHU?', 'health.rhu.laboratory.inquire'],
    ['kanus-a ang lab test sa mga buntis?', 'health.prenatal.inquire'],
    ['Is dental open on Friday?', 'rhu.dental.inquire'],
    ['kanus-a ang family planning sa RHU?', 'rhu.family-planning.inquire'],
    ['Does YAKAP cover a mammogram?', 'health.yakap.screening.inquire'],
    ['libre ba ang colonoscopy?', 'health.yakap.screening.inquire'],
    ['Is metformin covered by YAKAP?', 'health.yakap.medicines.inquire'],
    ['libre ba ang losartan sa RHU?', 'health.yakap.medicines.inquire'],
    ['libre ba ang chest x-ray sa YAKAP?', 'health.yakap.labtest.inquire'],
    ['libre ba ang cholesterol test?', 'health.yakap.labtest.inquire'],
    ['gisingil ko sa YAKAP, asa ko mo reklamo?', 'health.yakap.complaint.inquire'],
  ];
  for (const [q, want] of cases) assert.equal(route(q), want, q);
});

check('older health topics still reach their own answers', () => {
  const cases = [
    ['How much is a health card?', 'health.sanitary.fees.inquire'],
    ['What lab tests are needed for a health card?', 'health.labtest.inquire'],
    ['Do I need a stool test for my bakery?', 'health.labtest.inquire'],
    ['What is YAKAP?', 'health.yakap.inquire'],
    ['How do I register for YAKAP?', 'health.yakap.requirements.inquire'],
    ['I was bitten by a dog, where do I go?', 'health.animal-bite.inquire'],
    ['Where can I get a prenatal check-up?', 'health.prenatal.inquire'],
    ['Where do I get a senior citizen ID?', 'seniors.office.inquire'],
    ['Where can I get tested for TB?', 'rhu.tb.inquire'],
    // Naming the RHU and a day does not make a vaccine question the RHU schedule.
    ['What day is the immunization at the RHU?', 'rhu.immunization.inquire'],
    ['kanus-a ang bakuna sa health center?', 'rhu.immunization.inquire'],
  ];
  for (const [q, want] of cases) assert.equal(route(q, want, 1), want, q);
});

check('a day question gets that day, not the whole schedule', () => {
  assert.match(reply('health.consultation.inquire', 'Is there consultation on Friday?'), /^Yes — medical consultation .* Friday, 8 AM–12 noon\.$/);
  assert.match(reply('rhu.dental.inquire', 'Is dental open on Friday?'), /^No — dental care .* not on Friday\. It is on Monday and Tuesday, 8 AM–5 PM\.$/);
  assert.match(reply('rhu.dental.inquire', 'naa bay dentista karong Lunes?'), /^Oo — ang Dental care .* Lunes, 8 AM–5 PM\.$/);
  assert.match(reply('health.rhu.laboratory.inquire', 'abri ba ang lab sa RHU kung Huwebes?'), /General laboratory .* Huwebes, 8 AM–5 PM\. .*mabdos.*8 AM–12 sa udto/);
  assert.match(reply('health.rhu.schedule.inquire', 'Is the RHU open on Saturday?'), /^None of the Rural Health Unit's posted services are on Saturday/);
  const friday = reply('health.rhu.schedule.inquire', 'What is open at the RHU on Friday?');
  assert.match(friday, /Medical consultation: 8 AM–12 noon/);
  assert.match(friday, /Not on Friday: dental care \(Monday and Tuesday, 8 AM–5 PM\); routine lab tests for pregnant women \(Tuesday and Thursday, 8 AM–12 noon\)/);
  assert.match(reply('health.consultation.inquire', 'unsa ang schedule sa konsultasyon?'), /Lunes hangtod Huwebes, 8 AM–5 PM; Biyernes, 8 AM–12 sa udto/);
  // "What days?" with no day named: that service's days only.
  assert.equal(reply('health.prenatal.inquire', 'unsa nga adlaw ang lab?'), 'Routine lab test para sa mga mabdos sa Rural Health Unit: Martes ug Huwebes, 8 AM–12 sa udto.');
  assert.equal(reply('rhu.dental.inquire', 'What days is the dentist at the RHU?'), 'Dental care at the Rural Health Unit: Monday and Tuesday, 8 AM–5 PM.');
});

check('a named medicine or test gets a yes on that item', () => {
  assert.match(reply('health.yakap.medicines.inquire', 'Is metformin covered by YAKAP?'), /^Yes — metformin \(for diabetes\) is on the PhilHealth YAKAP medicines list\./);
  assert.match(reply('health.yakap.medicines.inquire', 'sakop ba sa YAKAP ang Biogesic?'), /^Oo — ang paracetamol \(para sa hilanat\)/);
  assert.match(reply('health.yakap.medicines.inquire', 'Does YAKAP cover my medicine for high blood?'), /For high blood pressure: amlodipine, enalapril, hydrochlorothiazide, losartan and metoprolol/);
  assert.match(reply('health.yakap.medicines.inquire', 'Is co-amoxiclav included in YAKAP?'), /^Yes — co-amoxiclav \(antibiotic\) is on/);
  assert.match(reply('health.yakap.labtest.inquire', 'libre ba ang chest x-ray sa YAKAP?'), /^Oo — ang chest X-ray anaa sa lista sa laboratory test/);
  assert.match(reply('health.yakap.screening.inquire', 'Does YAKAP cover a mammogram?'), /^Yes — mammogram is among the other primary care services/);
  // Asking for the whole list still gets the whole list.
  assert.match(reply('health.yakap.medicines.inquire', 'What medicines are on the YAKAP list?'), /High blood pressure: amlodipine.*\n.*Blood thinner/s);
});

check('YAKAP contacts: the one asked for', () => {
  assert.equal(route('unsa ang email sa YAKAP?'), 'health.yakap.complaint.inquire');
  assert.equal(route('What is the contact number of YAKAP?'), 'health.yakap.complaint.inquire');
  assert.equal(reply('health.yakap.complaint.inquire', 'unsa ang email sa YAKAP?'), 'Mag-email sa PhilHealth YAKAP sa yakaptugon@philhealth.gov.ph para sa pangutana o concern.');
  assert.equal(reply('health.yakap.complaint.inquire', 'Where can I text about YAKAP?'), 'Text PhilHealth YAKAP at 0917 127 5937 for questions or concerns.');
  assert.match(reply('health.yakap.complaint.inquire', 'What is the contact number of YAKAP?'), /text 0917 127 5937\n• Refused a service or charged for one: call \(02\) 8662-2588$/);
  // Charged or refused: the hotline line, not the text number for questions.
  assert.equal(reply('health.yakap.complaint.inquire', 'They charged me for a YAKAP service'), 'If you were refused a YAKAP service or charged for one, report it to PhilHealth at (02) 8662-2588.');
  // Live, "asa" made the narrowing pick the QR-code line instead.
  assert.equal(reply('health.yakap.complaint.inquire', 'gisingil ko sa YAKAP, asa ko mo reklamo?'), 'Kung gibalibaran ka sa serbisyo sa YAKAP o gisingil, i-report kini sa PhilHealth sa (02) 8662-2588.');
  // A general "how do I contact them?" gets all of it.
  assert.match(reply('health.yakap.complaint.inquire', 'How do I contact PhilHealth YAKAP?'), /8662-2588[\s\S]*0917 127 5937[\s\S]*yakaptugon@philhealth\.gov\.ph/);
});

check('follow-ups keep the topic (session memory)', () => {
  const cases = [
    ['health.consultation.inquire', 'kanus-a?', 'health.consultation.inquire'],
    ['health.consultation.inquire', 'lab test?', 'health.rhu.laboratory.inquire'],
    ['health.consultation.inquire', 'unsa nga tambal?', 'health.yakap.medicines.inquire'],
    ['health.yakap.inquire', 'unsa nga tambal?', 'health.yakap.medicines.inquire'],
    ['health.yakap.inquire', 'kanus-a?', 'health.rhu.schedule.inquire'],
    ['health.yakap.medicines.inquire', 'metformin?', 'health.yakap.medicines.inquire'],
    ['health.yakap.labtest.inquire', 'ECG?', 'health.yakap.labtest.inquire'],
    ['rhu.dental.inquire', 'kanus-a?', 'rhu.dental.inquire'],
    ['rhu.dental.inquire', 'abri ba karong Biyernes?', 'rhu.dental.inquire'],
    ['rhu.family-planning.inquire', 'unsa nga adlaw?', 'rhu.family-planning.inquire'],
    ['health.prenatal.inquire', 'unsa nga adlaw ang lab?', 'health.prenatal.inquire'],
  ];
  // The agent weakly matched the Municipal Hall's hours for this one, live.
  assert.equal(route('Is it open on Saturday?', 'office.hours.inquire', 0.56, 'health.rhu.schedule.inquire'), 'health.rhu.schedule.inquire');
  assert.equal(route('Is it open on Saturday?', 'office.hours.inquire', 0.56, 'rhu.dental.inquire'), 'rhu.dental.inquire');
  assert.equal(route('Is the municipal hall open on Saturday?', 'office.hours.inquire', 0.56, 'rhu.dental.inquire'), 'office.hours.inquire');
  for (const [last, q, want] of cases) assert.equal(route(q, 'Default Fallback Intent', 0, last), want, `${q} after ${last}`);
  // ...and the follow-up gets the specific answer for that topic.
  assert.match(reply('rhu.dental.inquire', 'abri ba karong Biyernes?'), /^Dili — ang Dental care .* wala kung Biyernes/);
});

check('Bisaya questions are answered in Bisaya', () => {
  for (const q of ['kanus-a ang dental?', 'naa bay doktor sa RHU karon?', 'libre ba ang losartan?', 'sakop ba sa YAKAP ang mammogram?']) {
    assert.equal(detectLanguage(q), 'bisaya', q);
  }
});

console.log(`\nRHU and YAKAP posters: ${passed} checks passed.`);
