// Offline checks that Magi gives the specific answer to what was asked (the panel's requirement):
// focus.js narrows a topic's answer to the part the question asks about, specific.js works out
// answers from the question, and the routing in languageDetect.js sends specific questions to
// specific answers.
// Run: node server/test-focus.js
import assert from 'node:assert/strict';
import { focusAnswer, questionAspect } from './services/focus.js';
import { specificAnswer } from './services/specific.js';
import { refineIntent, correctSpelling, detectLanguage } from './services/languageDetect.js';
import { INTENT_RESPONSES } from './services/responses.js';

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`  ok  ${name}`);
};
// The reply the server sends: the narrowed answer, or the whole one.
const reply = (intent, question, language = 'english') => {
  const answer = INTENT_RESPONSES[intent][language];
  return focusAnswer(answer, { question, intent, language }) ?? answer;
};
const whole = (intent, question, language = 'english') =>
  assert.equal(reply(intent, question, language), INTENT_RESPONSES[intent][language], `${question} should keep the whole answer`);

check('what a question asks for', () => {
  assert.equal(questionAspect('How much is a PWD ID?'), 'fee');
  assert.equal(questionAspect('pila?'), 'fee');
  assert.equal(questionAspect('pila ka adlaw?'), 'duration'); // "how many days?", not a price
  assert.equal(questionAspect('asa?'), 'where');
  assert.equal(questionAspect('unsa oras?'), 'hours');
  assert.equal(questionAspect('When was Magallanes founded?'), 'date');
  assert.equal(questionAspect('When is the deadline for paying amilyar?'), 'deadline');
  assert.equal(questionAspect('How much is the penalty for late amilyar?'), 'penalty');
  assert.equal(questionAspect('What are the requirements for late registration?'), 'reqs');
  assert.equal(questionAspect('What is the age limit for SPES?'), 'eligibility');
});

check('a fee question gets the fee, not the whole topic', () => {
  assert.equal(reply('social.pwd-id.inquire', 'How much is a PWD ID?'), 'PWD IDs are issued free by the municipality — apply at the Municipal Social Welfare and Development Office (MSWDO).');
  assert.equal(reply('tourism.magellan-shrine.inquire', 'How much is the entrance fee at the Magellan Shrine?'), 'There is no entrance fee.');
  assert.equal(reply('tourism.magellan-shrine.inquire', 'Libre ba ang Magellan Shrine?', 'bisaya'), 'Walay entrance fee.');
  assert.equal(reply('seniors.office.inquire', 'How much is the senior citizen ID?'), 'The ID is free for residents aged 60 and above (RA 9994).');
  const police = reply('clearance.police.inquire', 'How much is the police clearance?');
  assert.match(police, /free with a barangay certificate[\s\S]*Check the current fee on the site/);
  assert.doesNotMatch(police, /fingerprints/);
});

check('one item of a list: just that line, under its heading', () => {
  assert.equal(reply('emergency.hotline.inquire', 'What is the hotline of the BFP?'), 'Emergency hotlines in Magallanes:\n• BFP (fire): 0931 721 8881');
  assert.equal(reply('about.facts.inquire', 'What is the population of Magallanes?'), '• Population: 22,780 (2024 Census)');
  assert.match(reply('health.sanitary.fees.inquire', 'How much is the sanitary permit?'), /^Health and sanitary fees for a business:\n• Sanitary permit:/);
  assert.match(reply('jobs.spes-tupad.inquire', 'What is the age limit for SPES?'), /^• SPES[^\n]*15 to 30/);
});

check('amilyar: deadline, penalty, discount and where are each one line', () => {
  assert.match(reply('property.tax.inquire', 'When is the deadline for paying amilyar?'), /^• When: in full on or before March 31/);
  assert.doesNotMatch(reply('property.tax.inquire', 'When is the deadline for paying amilyar?'), /Discount/);
  assert.match(reply('property.tax.inquire', 'How much is the penalty for late amilyar?'), /^• Late payment: interest of 2% a month/);
  assert.match(reply('property.tax.inquire', 'Is there a discount for early payment?'), /^• Discount: the LGU may grant up to 20%/);
  assert.equal(reply('property.tax.inquire', 'Where do I pay amilyar?'), "Real property tax (amilyar) is paid at the Municipal Treasurer's Office at the Municipal Hall.");
  // "Pila:" is the amount; "Ulahi nga bayad" (late payment) and "Diskwento" are not.
  assert.match(reply('property.tax.inquire', 'pila ang amilyar?', 'bisaya'), /^• Pila: porsyento/);
});

check('where: the first place named, with the detail line after it', () => {
  assert.equal(
    reply('seniors.office.inquire', 'Where is the senior citizen office?'),
    'Senior citizen services, such as the senior citizen ID, are handled by the Office of Senior Citizens — not by the health office. It is in the Poblacion, across from the 7-Eleven.'
  );
  assert.equal(reply('jobs.spes-tupad.inquire', 'asa?', 'bisaya'), 'Parehong programa sa Department of Labor and Employment (DOLE), i-apply pinaagi sa Public Employment Service Office (PESO) sa LGU — pangutana sa Munisipyo.');
});

check('nothing on what was asked: say so, and who handles it', () => {
  assert.equal(
    reply('social.pwd-id.inquire', 'unsa oras?', 'bisaya'),
    'Wala koy listahan sa oras o iskedyul para niini. Ang PWD ID libre nga gihatag sa munisipyo — mag-apply sa Municipal Social Welfare and Development Office (MSWDO).'
  );
  assert.match(reply('social.assistance.inquire', 'How much is the burial assistance?'), /^I don't have the amount for this on file\. Help with burial/);
  assert.equal(reply('events.lisagan.inquire', 'pila?', 'bisaya'), 'Wala koy listahan sa kantidad para niini.');
});

check('a date question gets the date, an hours question is not answered with one', () => {
  assert.match(reply('tourism.magellan-shrine.inquire', 'unsa oras?', 'bisaya'), /^Wala koy listahan sa oras/);
  assert.match(reply('about.history.inquire', 'When was Magallanes founded?'), /21 June 1969/);
  assert.doesNotMatch(reply('property.tax.inquire', 'unsa oras?', 'bisaya'), /Diskwento/);
});

check('broad questions and answers that already are the specific one stay whole', () => {
  whole('tourism.magellan-shrine.inquire', 'Tell me about the Magellan Shrine');
  whole('emergency.hotline.inquire', 'emergency hotlines');
  whole('permit.business.new.inquire', 'What are the requirements for a new business permit?');
  whole('permit.building.requirements.inquire', 'What do I need for a building permit?');
  whole('civil.registry.birth.late.inquire', 'What are the requirements for late registration?');
  whole('civil.registry.fees.inquire', 'How much are the civil registry fees?');
  whole('civil.registry.marriage.license.inquire', 'Unsa ang requirements sa marriage license?', 'bisaya');
  whole('tourism.accommodation.inquire', 'Asa ko makatulog sa Magallanes?', 'bisaya');
  whole('tourism.accommodation.inquire', 'How much is a hotel in Magallanes?');
  whole('governance.complaint.inquire', 'asa?', 'bisaya');
  whole('permit.building.process.inquire', 'How long does a building permit take?');
});

check('worked out from the question: office hours on a day', () => {
  const at = (iso) => new Date(iso);
  const day = (q, lang = 'english', now = at('2026-11-09T10:00:00+08:00')) => specificAnswer({ intent: 'office.hours.inquire', question: q, language: lang, now });
  assert.match(day('Is the municipal hall open on Saturday?'), /^No — municipal offices are closed on Saturdays/);
  assert.match(day('Open ba ang munisipyo karong Domingo?', 'bisaya'), /^Dili — sirado/);
  assert.match(day('Is it open on Friday?'), /^It depends on the schedule in force/);
  assert.match(day('Open ba karong Martes?', 'bisaya'), /^Oo — abri ang mga opisina kung Martes/);
  assert.match(day('Is it open today?'), /^Yes — offices are open on Monday/); // 2026-11-09 is a Monday
  assert.match(day('Open ba karon?', 'bisaya', at('2026-11-14T10:00:00+08:00')), /^Dili/); // a Saturday
  assert.equal(day('What time does the municipal hall open?'), null);
});

check('worked out from the question: the building fee for a floor area', () => {
  const fee = (q) => specificAnswer({ intent: 'permit.building.fee.inquire', question: q });
  assert.match(fee('How much is the building permit for a 50 sqm house?'), /50 m², the building fee is 50 × ₱3\.40 = ₱170 /);
  assert.match(fee('building permit fee for 75 square meters'), /75 × ₱4\.80 = ₱360 /);
  assert.match(fee('building permit for 18 sqm new house'), /18 × ₱2 = ₱36 /);
  assert.match(fee('renovation of 15 sqm'), /15 × ₱2\.40 = ₱36 /);
  assert.match(fee('200 sqm house'), /200 × ₱7\.20 = ₱1,440 /);
  assert.equal(fee('How much is the building permit for a 100 sqm store?'), null); // not a house
  assert.equal(fee('How much is the building permit?'), null);
});

check('specific questions are routed to specific answers', () => {
  const route = (q, df = 'Default Fallback Intent', last = '') => refineIntent(q, df, [], { confidence: 1, lastIntent: last });
  assert.equal(route('Pila ang bayad sa birth certificate?', 'civil.registry.fees.inquire'), 'civil.registry.birth-copy.fee.inquire');
  assert.equal(route('How much is a copy of a birth certificate?', 'civil.registry.fees.inquire'), 'civil.registry.birth-copy.fee.inquire');
  assert.equal(route('How much is a PSA birth certificate?', 'psa.certificate.inquire'), 'psa.certificate.inquire');
  assert.equal(route('How much is late registration of birth?', 'civil.registry.birth.late.inquire'), 'civil.registry.birth.late.inquire');
  assert.equal(route('Where do I get a building permit?', 'permit.building.requirements.inquire'), 'permit.building.location.inquire');
  assert.equal(route('asa?', 'vague.question.ceb', 'permit.building.requirements.inquire'), 'permit.building.location.inquire');
  assert.equal(route('unsa oras?', 'smalltalk.time', 'seniors.office.inquire'), 'seniors.office.inquire');
  assert.equal(route('unsa na oras?', 'smalltalk.time', 'seniors.office.inquire'), 'smalltalk.time');
  assert.equal(route('what time is it?', 'smalltalk.time', 'social.pwd-id.inquire'), 'smalltalk.time');
});

check('death certificate: requirements, a copy, a PSA copy and the fee each go to their answer', () => {
  const route = (q, df = 'civil.registry.inquire') => refineIntent(correctSpelling(q), df, [], { confidence: 0.8 });
  assert.equal(route('unsay requirements pag kuhag death certificate?'), 'civil.registry.death.registration.inquire');
  assert.equal(route('How do I get a death certificate?'), 'civil.registry.death.registration.inquire');
  assert.equal(route('How do I get a copy of a death certificate?'), 'civil.registry.copy.inquire');
  assert.equal(route('pila ang death certificate?'), 'civil.registry.death.fee.inquire');
  assert.match(reply('civil.registry.death.registration.inquire', 'unsay requirements pag kuhag death certificate?', 'bisaya'), /Dad-a ang Certificate of Death \(Municipal Form 103\)/);
});

check('broad questions that only mention a word of one line keep the whole answer', () => {
  // Found by asking the pushed and the new version the same 319 questions side by side.
  whole('permit.business.new.inquire', 'What permits do I need to open a sari-sari store?');
  whole('permit.business.new.inquire', "My store's permit expires this year. How do I get it renewed?");
  whole('social.solo-parent.inquire', 'Ako ra usa nag-atiman sa akong duha ka anak, unsaon pagkuha og solo parent ID?', 'bisaya');
  whole('civil.registry.correction.clerical.inquire', 'Mali ang spelling sa akong birth certificate, unsaon pag-ayo?', 'bisaya');
  whole('agri.rsbsa.inquire', "I'm a rice farmer. How do I register with RSBSA to get assistance?");
  whole('report.concern.inquire', 'unsaon pagreklamo nga wala makolekta ang basura sa among lugar?', 'bisaya');
  whole('governance.complaint.inquire', 'unsay pag report sa kurapsyon?', 'bisaya');
  whole('civil.registry.inquire', 'unsaon pag kuhag birth certificate?', 'bisaya');
  whole('permit.building.requirements.inquire', 'two storey building akoang ipatukod', 'bisaya');
  whole('tourism.spots.inquire', 'unsay nindot bisitahon sa magallanes?', 'bisaya');
  whole('tourism.spots.inquire', 'Any nice places to go here for a weekend?');
  whole('tourism.accommodation.inquire', 'Are there hotels or places to stay in Magallanes?');
  whole('health.animal-bite.inquire', 'Where can we get anti-rabies shots?');
  whole('office.contact.inquire', 'contact number sa munisipyo?', 'bisaya');
});

check('how-to questions are broad; "what day" decides over "free"', () => {
  whole('permit.business.renew.inquire', 'Ma-expire na ang permit sa akong tindahan, unsaon nako pag-renew?', 'bisaya');
  whole('property.tax.inquire', 'How do I pay amilyar?');
  const day = /^Ask your barangay health worker or the RHU for the vaccination day/;
  assert.match(reply('rhu.immunization.inquire', 'on what day or days are free vaccination for babies?'), day);
  assert.match(reply('rhu.immunization.inquire', 'What day is the immunization at the RHU?'), day);
});

check('where over several places or channels: the whole list', () => {
  assert.match(reply('social.vawc.inquire', 'Where can a victim of domestic violence go for help?'), /VAW Desk[\s\S]*Women and Children Protection Desk[\s\S]*MSWDO/);
  assert.match(reply('psa.certificate.inquire', 'Where can I request a PSA copy for my passport?'), /Online at[\s\S]*PSA Civil Registry System outlet/);
  assert.match(reply('tourism.centennial-tree.inquire', 'I heard there is a 500 year old tree here, where is it?'), /Barangay Caloc-an/);
  assert.match(reply('civil.registry.death.registration.inquire', 'unsa ang mga requirements para makakuha og permit sa paglubong?', 'bisaya'), /Certificate of Death \(Municipal Form 103\)/);
});

check('a checklist or a list of steps is never cut partway', () => {
  whole('civil.registry.birth.new.inquire', 'unsay requirements sa birth certificate?', 'bisaya');
  whole('civil.registry.birth.new.inquire', 'What are the requirements for a birth certificate?');
  whole('civil.registry.wedding.inquire', 'requirements for the permit?');
});

check('everyday spellings: "unsa orasa mo abli ang municipyo?" is the office hours', () => {
  // The server corrects spelling before anything else (index.js); the agent matched these to
  // office hours at 0.69 and 0.79, and the hours guard threw the match out over "orasa"/"abli".
  const route = (q, conf) => refineIntent(correctSpelling(q), 'office.hours.inquire', [], { confidence: conf });
  assert.equal(route('unsa orasa mo abli ang municipyo?', 0.69), 'office.hours.inquire');
  assert.equal(route('unsang orasa moabli ang munisipyo?', 0.79), 'office.hours.inquire');
  assert.equal(correctSpelling('nag-abli ba ang opisina?'), 'nag-abri ba ang opisina?');
  assert.equal(correctSpelling('publiko'), 'publiko');
});

check('the fallen Centennial Tree: "where is it?" still says it has fallen', () => {
  assert.match(reply('tourism.centennial-tree.inquire', 'Where is the Bitaug tree?'), /has since fallen/);
  assert.match(reply('tourism.centennial-tree.inquire', 'Asa ang Bitaug sa Magallanes?', 'bisaya'), /natumba na/);
  // Never "the fee is not on file", as if it could still be visited.
  assert.match(reply('tourism.centennial-tree.inquire', 'how much is the entrance?'), /has since fallen/);
  assert.match(reply('tourism.centennial-tree.inquire', 'pila ang entrance?', 'bisaya'), /natumba na/);
  assert.match(reply('tourism.centennial-tree.inquire', 'what time is it open?'), /has since fallen/);
});

check('small talk with Magi in Bisaya is answered in Bisaya', () => {
  for (const q of ['Patawa-a ko Magi', 'Lab tika Magi', 'Wa kay pulos Magi', 'Sultii ko og joke', 'Pila na ka katuig Magi?']) {
    assert.equal(detectLanguage(q), 'bisaya', q);
  }
  for (const q of ['Tell me a joke', 'I love you Magi', 'Who is Magi?', 'How old are you?']) {
    assert.equal(detectLanguage(q), 'english', q);
  }
});

console.log(`\nSpecific answers: ${passed} checks passed.`);
