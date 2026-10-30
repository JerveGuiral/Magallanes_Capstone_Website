// server/services/health.js
//
// Health services: a business's health and sanitary requirements, PhilHealth's YAKAP package at
// the Rural Health Unit, and the related services staff described (health certificates, prenatal
// care, animal bites, where seniors go). The single source for both the Dialogflow intents
// (scripts/build-dialogflow-intents.mjs) and the chat server's replies, like businessPermit.js.
//
// Sources (October 2026), capstone interviews recorded in Cebuano:
//   - Sanitary requirements, 28 October 2026, a Municipal Health Office staff member: sputum and
//     urine tests for owners and employees (plus stool for eateries and bakeries), the health
//     card once results are okay, the sanitary permit for the building, the January inspection
//     with the Mayor's Office, and the health card fee — "₱275, or ₱235?", paid at the Municipal
//     Hall. She did not know the current sanitary permit fee, and whether ₱275 includes the lab
//     tests was unclear; the answers say so instead of guessing.
//   - YAKAP requirements, 29 October 2026, a Rural Health Unit staff member: PhilHealth plus a
//     valid ID (photocopy) and a form, coverage January to December 31, the ₱20,000 medicines
//     budget, free lab tests (some at a diagnostic center with a referral), animal bites covered
//     but not handled there yet, health certificates, prenatal care through BHWs and HRH nurses,
//     the sanitary office in another building, and the Office of Senior Citizens across from the
//     7-Eleven in the Poblacion. How often the medicines can be claimed was unclear.
// Neither office's address or phone number is on record (offices table), so no answer gives one.

import { HOTLINES } from './generalInfo.js';

// Every health answer opens this context for FOLLOWUP_LIFESPAN turns (3, set by the ZIP build).
// While it is alive, short follow-ups ("how much?", "asa?", "kada tuig ba?") match the follow-up
// intents below; resolveHealthFollowup() then picks the answer for the topic just discussed —
// "how much?" after the health card is the sanitary fees, after YAKAP it is what YAKAP costs.
export const HEALTH_CONTEXT = 'health-followup';

const ANSWERS = {
  sanitaryRequirements: {
    english:
      'Health and sanitary requirements for a business (Municipal Health Office):\n1. Laboratory tests — the owner and every employee must pass a sputum test and a urine test. Food businesses such as eateries (karinderya) and bakeries also need a stool test.\n2. Health card — issued to each person once their lab results are okay.\n3. Sanitary permit — issued for the building or business place, not for each person.\n4. Inspection — every January, after the business permit, a team that includes the Mayor\'s Office checks the place: trash bins, hairnets on employees, cleanliness.\nYou can ask me about the fees, the health card, the lab tests or the sanitary permit.',
    bisaya:
      'Mga health ug sanitary requirement para sa negosyo (Municipal Health Office):\n1. Laboratory test — ang tag-iya ug matag empleyado kinahanglan mopasar sa sputum (luwa) ug urine (ihi) test. Ang mga negosyo nga may pagkaon sama sa karinderya ug bakery, kinahanglan pud og stool (tae) test.\n2. Health card — ihatag sa matag tawo kung okay na ang resulta sa ilang lab test.\n3. Sanitary permit — para sa building o lugar sa negosyo, dili sa matag tawo.\n4. Inspection — kada Enero, human sa business permit, mo-inspeksyon ang team nga apil ang Mayor\'s Office: basurahan, hairnet sa mga empleyado, ug kalimpyo.\nPwede ka mangutana bahin sa bayad, health card, lab test, o sanitary permit.',
  },
  healthCard: {
    english:
      'A health card shows that a business owner or employee is healthy. Everyone working in the business needs one, the owner included.\n1. Pass the laboratory tests: sputum and urine (eateries, bakeries and other food businesses also need a stool test).\n2. Once your results are okay, the Municipal Health Office issues your health card.\nThe fee is about ₱275 (₱235 was also mentioned), paid at the Municipal Hall.',
    bisaya:
      'Ang health card nagpakita nga himsog ang tag-iya o empleyado sa negosyo. Tanan nga nagtrabaho sa negosyo kinahanglan ani, apil ang tag-iya.\n1. Pasara ang laboratory test: sputum (luwa) ug urine (ihi) — ang karinderya, bakery ug uban pang negosyo nga may pagkaon, kinahanglan pud og stool (tae) test.\n2. Kung okay na ang resulta, ang Municipal Health Office ang mohatag sa imong health card.\nAng bayad mga ₱275 (gihisgotan pud ang ₱235), bayran sa Munisipyo.',
  },
  labTests: {
    english:
      'Before they get a health card, a business owner and every employee must pass these laboratory tests:\n• Sputum test\n• Urine test\n• Stool test — for food businesses such as eateries (karinderya) and bakeries\nAsk the Municipal Health Office where to have them done, and whether the lab fee is included in the ₱275 health card fee.',
    bisaya:
      'Sa dili pa makakuha og health card, ang tag-iya ug matag empleyado kinahanglan mopasar niining mga laboratory test:\n• Sputum (luwa) test\n• Urine (ihi) test\n• Stool (tae) test — para sa mga negosyo nga may pagkaon sama sa karinderya ug bakery\nPangutana sa Municipal Health Office kung asa ni buhaton, ug kung apil na ba ang bayad sa lab sa ₱275 nga bayad sa health card.',
  },
  sanitaryPermit: {
    english:
      'The sanitary permit is issued for the business place or building, not for each person — employees get health cards instead. It is one of the clearances you need for a business permit, and it goes with the yearly January inspection.\nIt is handled by the sanitary office, which is in a separate building from the health office — ask at the Municipal Health Office (Rural Health Unit) for directions. The current fee could not be confirmed, so ask the sanitary office.',
    bisaya:
      'Ang sanitary permit para sa lugar o building sa negosyo, dili sa matag tawo — ang mga empleyado, health card ang ilang kuhaon. Usa kini sa mga clearance nga kinahanglan sa business permit, ug kauban kini sa inspection kada Enero.\nAng sanitary office ang naghatag niini, nga lahi nga building sa health office — pangutana sa Municipal Health Office (Rural Health Unit) kung asa. Wala pa makumpirma ang bayad karon, busa pangutana sa sanitary office.',
  },
  sanitaryFees: {
    english:
      'Health and sanitary fees for a business:\n• Health card: about ₱275 per person (₱235 was also mentioned), paid at the Municipal Hall\n• Laboratory tests: ask the Municipal Health Office whether they are included in the ₱275\n• Sanitary permit: the current amount was not confirmed — ask the sanitary office',
    bisaya:
      'Mga bayad sa health ug sanitary para sa negosyo:\n• Health card: mga ₱275 matag tawo (gihisgotan pud ang ₱235), bayran sa Munisipyo\n• Laboratory test: pangutana sa Municipal Health Office kung apil na ba sa ₱275\n• Sanitary permit: wala pa makumpirma ang bayad karon — pangutana sa sanitary office',
  },
  inspection: {
    english:
      'Every January, after business permits are processed, an inspection team that includes the Mayor\'s Office visits each business. They check the place or building — for example, whether there are trash bins and whether employees wear hairnets. The permit can still be issued, but a business with violations gets a warning from the Mayor\'s Office.',
    bisaya:
      'Kada Enero, human ma-proseso ang mga business permit, mobisita sa matag negosyo ang inspection team nga apil ang Mayor\'s Office. Tan-awon nila ang lugar o building — pananglitan, kung naa bay basurahan ug kung naka-hairnet ba ang mga empleyado. Mahatagan gihapon og permit, pero ang negosyo nga naay violation pagahatagan og warning sa Mayor\'s Office.',
  },
  sanitaryLocation: {
    english:
      'Where to go:\n• Lab tests and health card — the Municipal Health Office (Rural Health Unit). The health card fee is paid at the Municipal Hall.\n• Sanitary permit — the sanitary office, in a separate building from the health office. Ask at the Rural Health Unit for directions.',
    bisaya:
      'Asa moadto:\n• Lab test ug health card — sa Municipal Health Office (Rural Health Unit). Ang bayad sa health card, bayran sa Munisipyo.\n• Sanitary permit — sa sanitary office, lahi nga building sa health office. Pangutana sa Rural Health Unit kung asa.',
  },
  yakap: {
    english:
      'YAKAP (Yaman ng Kalusugan Program) is PhilHealth\'s primary care package, offered at the Municipal Health Office (Rural Health Unit). Registered members get:\n• Check-ups\n• Medicines, up to a ₱20,000 budget\n• Free laboratory tests, depending on what you need (some at a diagnostic center, with a referral)\nCoverage runs from January to December 31, and you register again each year. To register you need PhilHealth and a valid ID.\nYou can ask me about the requirements, the medicines or the lab tests.',
    bisaya:
      'Ang YAKAP (Yaman ng Kalusugan Program) mao ang primary care package sa PhilHealth, nga anaa sa Municipal Health Office (Rural Health Unit). Ang mga rehistrado makakuha og:\n• Check-up\n• Tambal, hangtod ₱20,000 nga budget\n• Libre nga laboratory test, depende sa imong kinahanglan (ang uban sa diagnostic center, uban ang referral)\nAng coverage sugod Enero hangtod Disyembre 31, ug magparehistro ka usab kada tuig. Para magparehistro, kinahanglan nimo ang PhilHealth ug valid ID.\nPwede ka mangutana bahin sa requirements, tambal, o lab test.',
  },
  yakapRequirements: {
    english:
      'To register for YAKAP at the Municipal Health Office (Rural Health Unit):\n1. PhilHealth membership — if you don\'t have PhilHealth yet, get it first. An expired or unpaid PhilHealth status is usually okay, because staff look you up in the PhilHealth system.\n2. A valid ID — a photocopy is enough.\n3. A registration form, which you fill out at the office.',
    bisaya:
      'Para magparehistro sa YAKAP sa Municipal Health Office (Rural Health Unit):\n1. PhilHealth — kung wala ka pay PhilHealth, kuha usa. Kasagaran okay ra bisan expired o wala nabayri ang PhilHealth, kay i-search ra sa staff sa PhilHealth system.\n2. Valid ID — okay na ang photocopy.\n3. Registration form, nga i-fill out nimo didto sa opisina.',
  },
  yakapMedicines: {
    english:
      'YAKAP gives each registered member a budget of up to ₱20,000 for medicines, for the January–December coverage year. You get them through a check-up at the Rural Health Unit. Ask the health office how often you can claim your medicines.',
    bisaya:
      'Ang YAKAP mohatag sa matag rehistradong miyembro og budget hangtod ₱20,000 para sa tambal, sulod sa coverage gikan Enero hangtod Disyembre. Makuha kini pinaagi sa check-up sa Rural Health Unit. Pangutana sa health office kung kapila nimo makuha ang imong tambal.',
  },
  yakapLabTests: {
    english:
      'YAKAP includes free laboratory tests, depending on what the doctor says you need. Some tests are done at the Rural Health Unit; others at a diagnostic center, with a referral from the health office.',
    bisaya:
      'Apil sa YAKAP ang libre nga laboratory test, depende sa ingon sa doktor nga imong kinahanglan. Ang uban nga test buhaton sa Rural Health Unit; ang uban sa diagnostic center, uban ang referral gikan sa health office.',
  },
  yakapCoverage: {
    english:
      'YAKAP coverage runs from January to December 31. When the year ends, you register again for the next year.',
    bisaya:
      'Ang coverage sa YAKAP sugod Enero hangtod Disyembre 31. Kung mahuman na ang tuig, magparehistro ka usab para sa sunod nga tuig.',
  },
  yakapCost: {
    english:
      'Lab tests under YAKAP are free, and medicines are covered up to a ₱20,000 budget. You need PhilHealth membership to register. For anything else, ask the Municipal Health Office (Rural Health Unit).',
    bisaya:
      'Libre ang lab test sa YAKAP, ug ang tambal sakop hangtod ₱20,000 nga budget. Kinahanglan ka og PhilHealth para makaparehistro. Sa uban pa, pangutana sa Municipal Health Office (Rural Health Unit).',
  },
  yakapLocation: {
    english:
      'Register for YAKAP at the Municipal Health Office (Rural Health Unit). Bring a valid ID (a photocopy is enough); staff check your PhilHealth record there.',
    bisaya:
      'Magparehistro sa YAKAP sa Municipal Health Office (Rural Health Unit). Pagdala og valid ID (okay na ang photocopy); ang staff mo-check sa imong PhilHealth didto.',
  },
  animalBite: {
    english:
      `Animal bites are covered by YAKAP, but the Rural Health Unit does not treat them yet — go to a hospital emergency room right away. For urgent help, call MERT at ${HOTLINES.mert} or 911. Free anti-rabies vaccination schedules are posted on the News page.`,
    bisaya:
      `Sakop sa YAKAP ang kagat sa hayop, pero wala pa kini gitambalan sa Rural Health Unit — adto dayon sa emergency room sa ospital. Kung dinalian, tawag sa MERT sa ${HOTLINES.mert} o sa 911. Ang iskedyul sa libre nga anti-rabies, i-post sa News page.`,
  },
  healthCertificate: {
    english:
      'The Municipal Health Office (Rural Health Unit) issues health certificates — a medical certification after a check-up. Ask the office what to bring.\nIf you need a health card to work in a business, that needs laboratory tests first — ask me about the health card.',
    bisaya:
      'Ang Municipal Health Office (Rural Health Unit) naghatag og health certificate — medical certification human sa check-up. Pangutana sa opisina kung unsa ang dad-on.\nKung health card ang imong kinahanglan para magtrabaho sa negosyo, kinahanglan una og laboratory test — pangutana nako bahin sa health card.',
  },
  prenatal: {
    english:
      'Prenatal check-ups are available at your barangay, through the barangay health workers (BHWs) and HRH nurses. Laboratory tests are available too. For an ultrasound, the Rural Health Unit refers you to a diagnostic center.',
    bisaya:
      'Ang prenatal check-up anaa sa imong barangay, pinaagi sa mga barangay health worker (BHW) ug HRH nurse. Naa pud laboratory test. Kung ultrasound, i-refer ka sa Rural Health Unit sa diagnostic center.',
  },
  seniors: {
    english:
      'Senior citizen services, such as the senior citizen ID, are handled by the Office of Senior Citizens — not by the health office. It is in the Poblacion, across from the 7-Eleven. The ID is free for residents aged 60 and above (RA 9994). Usually bring proof of age (a birth certificate or a valid ID showing your birth date), a barangay certificate of residency, and 1x1 photos — confirm the list with the office.',
    bisaya:
      'Ang mga serbisyo para sa senior citizen, sama sa senior citizen ID, gihatag sa Office of Senior Citizens — dili sa health office. Anaa kini sa Poblacion, atbang sa 7-Eleven. Libre ang ID sa mga residente nga 60 anyos pataas (RA 9994). Kasagaran dad-a ang pamatuod sa edad (birth certificate o valid ID nga naay petsa sa pagkatawo), barangay certificate of residency, ug 1x1 nga picture — kumpirmaha ang listahan sa opisina.',
  },
};

// The answers about a business's sanitary requirements, and those about YAKAP: a follow-up's
// meaning depends on which group the previous answer belongs to.
const SANITARY_ANSWERS = new Set(['sanitaryRequirements', 'healthCard', 'labTests', 'sanitaryPermit', 'sanitaryFees', 'inspection', 'sanitaryLocation']);
const YAKAP_ANSWERS = new Set(['yakap', 'yakapRequirements', 'yakapMedicines', 'yakapLabTests', 'yakapCoverage', 'yakapCost', 'yakapLocation']);

const MAIN_INTENTS = [
  // ---- A business's health and sanitary requirements ----
  {
    name: 'health.sanitary.requirements.inquire',
    answer: 'sanitaryRequirements',
    phrases: [
      'What are the sanitary requirements for a business?', 'Health requirements for a business permit', 'What health requirements do I need for my store?',
      'What are the health and sanitary requirements for food businesses?', 'What does the health office require for a business?',
      'Sanitary requirements for a sari-sari store', 'Sanitary requirements for an eatery', 'What do I need from the health office to open a karinderya?',
      'Requirements from the health office for my business', 'What are the health requirements for a bakery?', 'Do I need anything from the RHU for my business permit?',
      'What health documents does a business need?', 'I am opening a restaurant, what are the health requirements?', 'Health clearance for business',
      'What are the sanitation requirements for food establishments?', 'What does the Municipal Health Office require from business owners?',
      'Sanitary and health requirements for a canteen', 'What are the requirements for food handlers?',
    ],
  },
  {
    name: 'health.card.inquire',
    answer: 'healthCard',
    phrases: [
      'How do I get a health card?', 'What is a health card?', 'Do employees need a health card?', 'Health card requirements', 'Who needs a health card?',
      'Does the owner need a health card too?', 'How do I get a health card for my employees?', 'Can my employees get their health cards together?',
      'Do I need a health card to work in an eatery?', 'Health card for food handlers', 'Is a health card required for a sari-sari store?',
      'What do I need to get a health card?', 'Health card for my bakery workers', 'How long does it take to get a health card?',
      'Is a health card required every year?', 'Health card application', 'I need a health card for my job',
    ],
  },
  {
    name: 'health.labtest.inquire',
    answer: 'labTests',
    phrases: [
      'What laboratory tests do employees need?', 'What lab tests are needed for a health card?', 'Do I need a stool test for my bakery?',
      'What tests do food handlers need?', 'Sputum and urine test for health card', 'Is a stool test required for an eatery?',
      'What medical tests do business employees need?', 'Do my employees need a urine test?', 'Laboratory requirements for a health card',
      'What lab tests for a sari-sari store owner?', 'Do I need an x-ray for a health card?', 'What are the lab tests for food business workers?',
      'Lab test for health card', 'Do all workers need lab tests?', 'Where do I get the lab tests for my health card?',
    ],
  },
  {
    name: 'health.sanitary.permit.inquire',
    answer: 'sanitaryPermit',
    phrases: [
      'How do I get a sanitary permit?', 'What is a sanitary permit?', 'Where do I get a sanitary permit?', 'Sanitary permit requirements',
      'Do I need a sanitary permit for my store?', 'Is the sanitary permit for the building or for the employees?', 'Sanitary permit for a business',
      'Who issues the sanitary permit?', 'Where is the sanitary office?', 'Sanitary permit for an eatery', 'Do I need a sanitary permit for a sari-sari store?',
      'How do I renew my sanitary permit?', 'Sanitary permit application', 'Is a sanitary permit required for a business permit?',
      'Sanitary inspector office', 'What is the difference between a health card and a sanitary permit?', 'Is the health card the same as the sanitary permit?',
    ],
  },
  {
    name: 'health.sanitary.fees.inquire',
    answer: 'sanitaryFees',
    phrases: [
      'How much is a health card?', 'How much is the sanitary permit?', 'Health card fee', 'How much does a health card cost?', 'Sanitary permit fee',
      'How much do I pay for the health card?', 'Where do I pay for the health card?', 'How much are the lab tests for the health card?',
      'Is the lab test included in the health card fee?', 'How much are the health and sanitary fees for a business?', 'Cost of a health card',
      'How much is the health card per employee?', 'How much is the sanitary permit for a sari-sari store?', 'Sanitary fees', 'Is the health card free?',
    ],
  },
  {
    name: 'health.sanitary.inspection.inquire',
    answer: 'inspection',
    phrases: [
      'When is the sanitary inspection?', 'Is there a health inspection for businesses?', 'What do they check during the sanitary inspection?',
      'Who inspects businesses?', 'When do they inspect stores?', 'Sanitary inspection schedule', 'What happens if my store fails the inspection?',
      'Is the inspection every year?', 'Do employees need to wear hairnets?', 'What do inspectors look for in an eatery?', 'Business inspection in January',
      'Will my permit be cancelled if I fail the inspection?', 'Is there a penalty for sanitary violations?', 'Who is in the inspection team?',
      'Do they inspect sari-sari stores?',
    ],
  },
  {
    name: 'health.sanitary.location.inquire',
    answer: 'sanitaryLocation',
    phrases: [
      'Where do I go for the health card and sanitary permit?', 'Which office handles health cards?', 'Where do I process my health card?',
      'Where do I apply for health requirements for my business?', 'Which office issues health cards?', 'Where do I submit my lab results?',
      'Where is the office for sanitary requirements?', 'Where do I go for my employees health cards?', 'Office for health card',
      'Where can I get my health card processed?', 'Which office for sanitary requirements?', 'Where do I bring my lab results for the health card?',
      'Health card office', 'Where do I get a health card?', 'asa makuha ang health card', 'Where do I get the health requirements for my business permit?', 'Where are health cards released?',
    ],
  },
  // ---- YAKAP and related health services ----
  {
    name: 'health.yakap.inquire',
    answer: 'yakap',
    phrases: [
      'What is YAKAP?', 'What is the YAKAP program?', 'Tell me about YAKAP', 'What is Yaman ng Kalusugan Program?', 'What does YAKAP cover?',
      'What are the benefits of YAKAP?', 'Is YAKAP available in Magallanes?', 'PhilHealth YAKAP', 'What is PhilHealth primary care?',
      'What is the PhilHealth Konsulta package?', 'What can I get from YAKAP?', 'YAKAP benefits', 'What services does YAKAP give?',
      'What is the YAKAP package?', 'Is YAKAP the same as Konsulta?', 'Check-ups with PhilHealth',
    ],
  },
  {
    name: 'health.yakap.requirements.inquire',
    answer: 'yakapRequirements',
    phrases: [
      'How do I register for YAKAP?', 'What are the requirements for YAKAP?', 'What do I bring to register for YAKAP?', 'Who can register for YAKAP?',
      'Can I register for YAKAP without PhilHealth?', 'My PhilHealth is expired, can I still register for YAKAP?', 'YAKAP registration requirements',
      'Do I need PhilHealth for YAKAP?', 'Is a photocopy of my ID enough for YAKAP?', 'How to apply for YAKAP', 'YAKAP enrollment',
      'Can I join YAKAP if my PhilHealth is unpaid?', 'What ID do I need for YAKAP?', 'Steps to register for YAKAP', 'How do I avail of YAKAP?', 'Can I avail YAKAP?',
      'Who is qualified for YAKAP?',
    ],
  },
  {
    name: 'health.yakap.medicines.inquire',
    answer: 'yakapMedicines',
    phrases: [
      'Does YAKAP give free medicines?', 'How much is the medicine budget in YAKAP?', 'Is the ₱20,000 for medicines?', 'YAKAP medicines',
      'Can I get maintenance medicines from YAKAP?', 'How do I get medicines from YAKAP?', 'Is there a limit on YAKAP medicines?',
      'Can I claim YAKAP medicines every month?', 'What medicines does YAKAP cover?', 'Free medicines from PhilHealth', '20,000 for medicines',
      'How often can I get medicines from YAKAP?', 'Where do I claim YAKAP medicines?', 'Does YAKAP cover my medicine for high blood?', 'YAKAP medicine budget', 'Free medicine at the RHU',
    ],
  },
  {
    name: 'health.yakap.labtest.inquire',
    answer: 'yakapLabTests',
    phrases: [
      'Does YAKAP include free laboratory tests?', 'Are lab tests free with YAKAP?', 'What lab tests does YAKAP cover?', 'YAKAP laboratory',
      'Can I get a free lab test at the RHU?', 'Do I need a referral for lab tests?', 'Where do I get my YAKAP lab tests?', 'Free laboratory with PhilHealth',
      'Is blood test free under YAKAP?', 'Does YAKAP cover x-ray?', 'Free lab test', 'Can the RHU refer me to a diagnostic center?',
      'Diagnostic center referral', 'Is the laboratory free?', 'YAKAP lab tests', 'Do I pay for the YAKAP lab tests?',
    ],
  },
  {
    name: 'health.yakap.coverage.inquire',
    answer: 'yakapCoverage',
    phrases: [
      'How long is YAKAP valid?', 'Do I need to renew YAKAP every year?', 'When does YAKAP coverage end?', 'Is YAKAP valid for one year?',
      'YAKAP coverage period', 'Can I use YAKAP every year?', 'When do I renew my YAKAP?', 'Does YAKAP expire?', 'Is YAKAP good until December?',
      'YAKAP renewal', 'How often do I register for YAKAP?', 'When does the YAKAP year start?', 'Is my YAKAP still valid next year?',
      'YAKAP validity', 'Do I register again for YAKAP?',
    ],
  },
  {
    name: 'health.yakap.cost.inquire',
    answer: 'yakapCost',
    phrases: [
      'How much is YAKAP?', 'Is YAKAP free?', 'Do I pay for YAKAP?', 'How much does it cost to register for YAKAP?', 'YAKAP fee',
      'Is there a fee for YAKAP?', 'Is the YAKAP check-up free?', 'Do I pay anything at the RHU for YAKAP?', 'Is YAKAP registration free?',
      'Cost of YAKAP', 'Are the services under YAKAP free?', 'Is the consultation free under YAKAP?', 'Is the YAKAP consultation free of charge?',
      'Do I need money for YAKAP?', 'Libre ra ba ang YAKAP?',
    ],
  },
  {
    name: 'health.yakap.location.inquire',
    answer: 'yakapLocation',
    phrases: [
      'Where do I register for YAKAP?', 'Where can I avail YAKAP?', 'Where is YAKAP offered?', 'Which office handles YAKAP?', 'YAKAP office',
      'Where do I go for YAKAP?', 'Is YAKAP at the RHU?', 'Where do I apply for YAKAP in Magallanes?', 'Where is the YAKAP registration?',
      'Can I register for YAKAP at the health center?', 'Where do I get my YAKAP check-up?', 'Is YAKAP at the municipal hall?',
      'Where can I enroll in YAKAP?', 'YAKAP location', 'Where is the YAKAP desk?',
    ],
  },
  {
    name: 'health.animal-bite.inquire',
    answer: 'animalBite',
    phrases: [
      'I was bitten by a dog, where do I go?', 'Does YAKAP cover animal bites?', 'Where can I get an anti-rabies shot?', 'Dog bite treatment',
      'My child was bitten by a dog', 'Is there an animal bite center in Magallanes?', 'Cat bite what should I do?', 'Anti-rabies vaccine for people',
      'Does the RHU treat dog bites?', 'Where is the animal bite center?', 'I was scratched by a cat', 'Rabies vaccine', 'Animal bite treatment',
      'Is anti-rabies free?', 'Bitten by a dog, is it covered by PhilHealth?',
    ],
  },
  {
    name: 'health.certificate.inquire',
    answer: 'healthCertificate',
    phrases: [
      'How do I get a health certificate?', 'Where can I get a medical certificate?', 'Does the RHU issue health certificates?', 'Medical certificate requirements',
      'I need a medical certificate for work', 'Health certificate requirements', 'Can I get a medical certificate at the health center?',
      'Medical certificate for school', 'Where do I get a health certificate?', 'Medical certification', 'I need a med cert',
      'Health certificate for employment', 'How much is a medical certificate?', 'Fit to work certificate', 'Medical certificate from the RHU',
    ],
  },
  {
    name: 'health.prenatal.inquire',
    answer: 'prenatal',
    phrases: [
      'Where can I get a prenatal check-up?', 'Is there prenatal care in the barangay?', 'I am pregnant, where do I go for check-ups?',
      'Free prenatal check-up', 'Where can I get an ultrasound?', 'Does the RHU do ultrasound?', 'Prenatal care in Magallanes',
      'Check-up for pregnant women', 'Can BHWs do prenatal check-ups?', 'Where do pregnant women go?', 'Prenatal laboratory tests',
      'Is prenatal check-up free?', 'Ultrasound referral', 'My wife is pregnant, where can she have a check-up?', 'Prenatal services',
    ],
  },
  {
    name: 'seniors.office.inquire',
    answer: 'seniors',
    phrases: [
      'Where do senior citizens apply?', 'Where is the Office of Senior Citizens?', 'Where is the OSCA office?', 'Senior citizen office',
      'Where do I get a senior citizen ID?', 'Where can my lola get her senior citizen ID?', 'Senior citizen services in Magallanes',
      'Where do I apply for a senior citizen ID?', 'Office for senior citizens', 'Is the senior citizen office at the RHU?',
      'Where do seniors go for their benefits?', 'OSCA Magallanes', 'Senior citizen ID application', 'Where is the senior citizen office located?',
      'Where can my grandfather apply as a senior citizen?',
    ],
  },
];

// Follow-up intents: short questions that only make sense inside a health thread. They match only
// while HEALTH_CONTEXT is alive; resolveHealthFollowup() picks the answer for the thread's topic.
const FOLLOWUP_INTENTS = [
  {
    name: 'health.followup.fees.inquire',
    kind: 'fees',
    phrases: [
      'How much?', 'How much is it?', 'How much does it cost?', 'How much will I pay?', 'What is the fee?', 'Is it free?', 'Is it expensive?',
      'Pila?', 'Pila man?', 'Tagpila?', 'Pila ang bayad?', 'Libre ba?', 'Magkano?', 'Magkano po?', 'Libre lang ba?',
    ],
  },
  {
    name: 'health.followup.location.inquire',
    kind: 'location',
    phrases: [
      'Where?', 'Where do I go?', 'Where do I get it?', 'Which office?', 'Where is that?', 'Where do I register?', 'Where do I pay?',
      'Asa?', 'Asa man?', 'Asa ko moadto?', 'Asa kuhaon?', 'Asa magbayad?', 'Saan?', 'Saan po?', 'Asa magparehistro?',
    ],
  },
  {
    name: 'health.followup.requirements.inquire',
    kind: 'requirements',
    phrases: [
      'What are the requirements?', 'What do I need?', 'What should I bring?', 'Requirements?', 'What documents?', 'And the requirements?',
      'What do I need to register?', 'Unsa ang requirements?', 'Unsa akong kinahanglan?', 'Unsa ang dad-on?', 'Unsa ang mga papeles?',
      'Ano ang requirements?', 'Ano ang kailangan?', 'Ano ang dadalhin?', 'Unsa pa ang kinahanglan?',
    ],
  },
  {
    name: 'health.followup.renewal.inquire',
    kind: 'renewal',
    phrases: [
      'Every year?', 'Is it every year?', 'Do I renew it?', 'How often?', 'Is it yearly?', 'Until when is it valid?', 'Does it expire?',
      'Kada tuig ba?', 'Kada tuig?', 'Mag-renew ba?', 'Hangtod kanus-a?', 'Kapila?', 'Taon-taon ba?', 'Valid hanggang kailan?', 'Ma-expire ba?',
    ],
  },
  {
    name: 'health.followup.labtest.inquire',
    kind: 'labtest',
    phrases: [
      'What tests?', 'What lab tests?', 'Is there a lab test?', 'Do I need lab tests?', 'What about the laboratory?', 'Lab test too?',
      'Free ba ang lab?', 'Unsa nga test?', 'Unsa nga lab test?', 'Naa bay lab test?', 'Kinahanglan ba og lab test?', 'Sa laboratory?',
      'Anong test?', 'May lab test ba?', 'How about the lab tests?',
    ],
  },
  {
    name: 'health.followup.who.inquire',
    kind: 'who',
    phrases: [
      'Who needs it?', 'Who can register?', 'Is the owner included?', 'Even the owner?', 'Does everyone need it?', 'Who is qualified?',
      'All employees?', 'Kinsa ang kinahanglan?', 'Apil ba ang tag-iya?', 'Bisan ang owner?', 'Tanan ba nga empleyado?', 'Kinsa ang pwede?',
      'Sino ang kailangan?', 'Kasama ba ang may-ari?', 'Pwede ba ko?',
    ],
  },
];

// More Bisaya, the way residents type it: short, casual, English mixed in. Kept apart from the
// lists above so the balance per intent is easy to see.
const BISAYA_PHRASES = {
  'health.sanitary.requirements.inquire': [
    'unsa ang sanitary requirements sa negosyo', 'unsa kinahanglan sa health office para sa akong tindahan', 'health requirements sa business permit',
    'magbukas ko og karinderya unsa ang health requirements', 'unsa ang requirements sa sanitary para sa bakery', 'unsa ang kinahanglan sa RHU para sa negosyo',
    'requirements sa health para sa sari-sari store', 'unsa ang sanitary nga requirements', 'unsay health requirements para sa food business',
    'unsa ang dad-on sa health office para sa permit sa negosyo', 'mga requirements sa sanitary ug health card',
  ],
  'health.card.inquire': [
    'unsaon pagkuha og health card', 'kinahanglan ba og health card ang empleyado', 'unsa ang proseso sa health card', 'kinsa kinahanglan og health card',
    'apil ba ang tag-iya sa health card', 'health card para sa akong mga trabahante', 'unsa ang health card', 'kinahanglan ba ko og health card sa karinderya',
    'unsaon pag-apply og health card', 'unsa requirements sa health card',
  ],
  'health.labtest.inquire': [
    'unsa nga lab test ang kinahanglan sa empleyado', 'kinahanglan ba og stool test ang bakery', 'unsa mga laboratory sa health card',
    'luwa ug ihi ba ang test sa health card', 'kinahanglan pa ba og tae nga test', 'unsa ang mga test para sa health card', 'lab test para sa trabahante sa karinderya',
    'kinahanglan ba og x-ray sa health card', 'asa magpa laboratory para sa health card',
  ],
  'health.sanitary.permit.inquire': [
    'unsaon pagkuha og sanitary permit', 'asa makuha ang sanitary permit', 'unsa ang sanitary permit', 'kinahanglan ba og sanitary permit ang tindahan',
    'para sa building ba ang sanitary permit', 'asa ang sanitary office', 'kinsa naghatag og sanitary permit', 'sanitary permit para sa karinderya',
    'unsaon pag renew sa sanitary permit', 'lahi ba ang health card ug sanitary permit',
  ],
  'health.sanitary.fees.inquire': [
    'pila ang health card', 'tagpila ang sanitary permit', 'pila bayad sa health card', 'pila ang bayronon sa health card', 'asa magbayad sa health card',
    'apil na ba ang lab sa bayad sa health card', 'pila ang health card matag empleyado', 'libre ba ang health card', 'pila bayad sa sanitary',
    'magkano ang health card',
  ],
  'health.sanitary.inspection.inquire': [
    'kanus-a ang inspection sa negosyo', 'naa bay inspection sa sanitary', 'unsa ang tan-awon sa inspection', 'kinsa mo-inspeksyon sa tindahan',
    'kada tuig ba ang inspection', 'kinahanglan ba naka hairnet ang mga empleyado', 'unsa mahitabo kung bagsak sa inspection', 'naa bay multa sa sanitary violation',
    'inspection sa enero sa negosyo',
  ],
  'health.sanitary.location.inquire': [
    'asa ko moadto para sa health card ug sanitary permit', 'asa nga opisina ang health card', 'asa i-proseso ang health card', 'asa i-submit ang resulta sa lab',
    'asa ang opisina sa sanitary requirements', 'asa kuhaon ang health requirements sa negosyo', 'asa ma-release ang health card',
  ],
  'health.yakap.inquire': [
    'unsa ang YAKAP', 'unsa ang YAKAP program', 'unsa ang makuha sa YAKAP', 'unsa ang benepisyo sa YAKAP', 'naa ba YAKAP diri sa Magallanes',
    'unsa ang sakop sa YAKAP', 'YAKAP sa PhilHealth unsa na', 'pareho ba ang YAKAP ug Konsulta', 'check-up sa PhilHealth', 'unsa ang Yaman ng Kalusugan',
  ],
  'health.yakap.requirements.inquire': [
    'unsaon pagparehistro sa YAKAP', 'unsa ang requirements sa YAKAP', 'unsa ang dad-on para sa YAKAP', 'kinsa ang pwede sa YAKAP',
    'pwede ba sa YAKAP bisan walay PhilHealth', 'expired akong PhilHealth pwede pa ba ko sa YAKAP', 'kinahanglan ba og PhilHealth sa YAKAP',
    'okay ra ba photocopy sa ID sa YAKAP', 'unsaon pag apply sa YAKAP', 'wala nabayri akong PhilHealth pwede ba ko magparehistro',
  ],
  'health.yakap.medicines.inquire': [
    'naa bay libre nga tambal sa YAKAP', 'pila ang budget sa tambal sa YAKAP', 'para sa tambal ba ang 20,000', 'makuha ba ang maintenance nga tambal sa YAKAP',
    'unsaon pagkuha og tambal sa YAKAP', 'kada bulan ba makuha ang tambal sa YAKAP', 'unsa nga tambal ang sakop sa YAKAP', 'libre tambal sa RHU',
    'kapila makuha ang tambal sa YAKAP', 'asa makuha ang tambal sa YAKAP',
  ],
  'health.yakap.labtest.inquire': [
    'libre ba ang laboratory sa YAKAP', 'unsa nga lab test ang sakop sa YAKAP', 'naa bay libre nga lab test sa RHU', 'kinahanglan ba og referral sa lab test',
    'asa magpa laboratory sa YAKAP', 'libre ba ang blood test sa YAKAP', 'i-refer ba ko sa diagnostic', 'libre lab test sa PhilHealth', 'magbayad pa ba sa lab sa YAKAP',
  ],
  'health.yakap.coverage.inquire': [
    'hangtod kanus-a ang YAKAP', 'kinahanglan ba i-renew ang YAKAP kada tuig', 'kanus-a mahuman ang YAKAP', 'usa ka tuig ba ang YAKAP',
    'magamit ba ang YAKAP kada tuig', 'kanus-a mag renew sa YAKAP', 'ma-expire ba ang YAKAP', 'magparehistro ba ko usab sa YAKAP sunod tuig',
  ],
  'health.yakap.cost.inquire': [
    'pila ang YAKAP', 'libre ba ang YAKAP', 'magbayad ba ko sa YAKAP', 'pila bayad sa pagparehistro sa YAKAP', 'naa bay bayad ang YAKAP',
    'libre ba ang check-up sa YAKAP', 'magbayad pa ba ko sa RHU para sa YAKAP', 'kinahanglan ba og kwarta sa YAKAP',
  ],
  'health.yakap.location.inquire': [
    'asa magparehistro sa YAKAP', 'asa makuha ang YAKAP', 'asa nga opisina ang YAKAP', 'asa moadto para sa YAKAP', 'sa RHU ba ang YAKAP',
    'asa mag-apply sa YAKAP diri sa Magallanes', 'pwede ba sa health center magparehistro sa YAKAP', 'asa ang YAKAP sa Magallanes',
  ],
  'health.animal-bite.inquire': [
    'napaakan ko sa iro asa ko moadto', 'gikagat sa iro akong anak', 'sakop ba sa YAKAP ang kagat sa iro', 'asa magpa anti-rabies',
    'naa bay animal bite center diri', 'gikalot ko sa iring unsa akong buhaton', 'nagtambal ba ang RHU sa kagat sa iro', 'libre ba ang anti rabies',
    'napaakan sa iring', 'bakuna sa rabies para sa tawo',
  ],
  'health.certificate.inquire': [
    'unsaon pagkuha og health certificate', 'asa makakuha og medical certificate', 'naghatag ba ang RHU og health certificate', 'kinahanglan ko og medical certificate sa trabaho',
    'unsa ang requirements sa health certificate', 'medical certificate para sa eskwelahan', 'pila ang medical certificate', 'asa magpa med cert',
  ],
  'health.prenatal.inquire': [
    'asa magpa prenatal check-up', 'naa bay prenatal sa barangay', 'buntis ko asa ko magpa check-up', 'libre ba ang prenatal', 'asa magpa ultrasound',
    'naa bay ultrasound sa RHU', 'check-up para sa mabdos', 'pwede ba ang BHW mo prenatal', 'mabdos akong asawa asa siya magpa check-up',
  ],
  'seniors.office.inquire': [
    'asa mag-apply ang senior citizen', 'asa ang opisina sa senior citizen', 'asa ang OSCA', 'asa makuha ang senior citizen ID',
    'asa makuha sa akong lola ang iyang senior ID', 'asa nga opisina para sa mga senior', 'sa RHU ba ang senior citizen', 'asa ang opisina sa tigulang',
    'asa moadto ang senior para sa benepisyo',
  ],
  'health.followup.fees.inquire': ['pila bayad?', 'pila man ang bayad?', 'tag pila man?', 'libre ra ba?', 'naa bay bayad?', 'magbayad pa ba?'],
  'health.followup.location.inquire': ['asa man ko moadto?', 'asa man na?', 'asa man kuhaon?', 'asa ang opisina?', 'asa man magbayad?'],
  'health.followup.requirements.inquire': ['unsa man ang requirements?', 'unsay dad-on?', 'unsa may kinahanglan?', 'unsa pa ang kinahanglan?', 'unsa mga papeles?'],
  'health.followup.renewal.inquire': ['kada tuig man?', 'i-renew pa ba?', 'hangtod kanus-a man?', 'ma expire ba?', 'kapila man?'],
  'health.followup.labtest.inquire': ['unsa man nga test?', 'naa pa bay lab?', 'libre ba ang lab?', 'unsa man ang laboratory?', 'kinahanglan pa ba og test?'],
  'health.followup.who.inquire': ['kinsa man ang kinahanglan?', 'apil ba ang owner?', 'tanan ba?', 'bisan ang tag-iya?', 'pwede ba ko ani?'],
};

const withBisaya = (name, phrases) => [...phrases, ...(BISAYA_PHRASES[name] || [])];

const ANSWER_OF = Object.fromEntries(MAIN_INTENTS.map(({ name, answer }) => [name, answer]));
const INTENT_OF = Object.fromEntries(MAIN_INTENTS.map(({ name, answer }) => [answer, name]));

/** True for every health intent, main or follow-up. */
export const isHealthIntent = (intent = '') => intent.startsWith('health.') || intent === 'seniors.office.inquire';

// Per follow-up kind: the answer for a thread about a business's sanitary requirements, the one
// for a YAKAP thread, and — for the other health topics, whose own answer already covers fees,
// place and requirements — the previous answer itself (null). A thread that cannot be told
// apart falls back to the sanitary answer, the commoner question.
const FOLLOWUP_ANSWERS = {
  fees: { sanitary: 'sanitaryFees', yakap: 'yakapCost' },
  location: { sanitary: 'sanitaryLocation', yakap: 'yakapLocation', sanitaryPermit: 'sanitaryPermit' },
  requirements: { sanitary: 'sanitaryRequirements', yakap: 'yakapRequirements', healthCard: 'healthCard' },
  renewal: { sanitary: 'inspection', yakap: 'yakapCoverage' },
  labtest: { sanitary: 'labTests', yakap: 'yakapLabTests', prenatal: 'prenatal' },
  who: { sanitary: 'healthCard', yakap: 'yakapRequirements' },
};

/**
 * The main intent a health follow-up asks for, given the previous answer's intent.
 * @param {string} kind - fees | location | requirements | renewal | labtest | who
 * @param {string} lastIntent
 */
export function healthFollowupTarget(kind, lastIntent = '') {
  const map = FOLLOWUP_ANSWERS[kind];
  const last = ANSWER_OF[lastIntent];
  if (!map) return lastIntent;
  if (last && map[last]) return INTENT_OF[map[last]];
  if (YAKAP_ANSWERS.has(last)) return INTENT_OF[map.yakap];
  if (SANITARY_ANSWERS.has(last) || !last) return INTENT_OF[map.sanitary];
  return lastIntent;
}

const FOLLOWUP_KIND = Object.fromEntries(FOLLOWUP_INTENTS.map((f) => [f.name, f.kind]));

/** Turns a health follow-up intent into the main intent whose answer it asks for. */
export function resolveHealthFollowup(intent, lastIntent = '') {
  const kind = FOLLOWUP_KIND[intent];
  return kind ? healthFollowupTarget(kind, lastIntent) : intent;
}

export const HEALTH_INTENTS = [
  ...MAIN_INTENTS.map(({ name, answer, phrases }) => ({
    name,
    phrases: withBisaya(name, phrases),
    outputContexts: [HEALTH_CONTEXT],
    ...ANSWERS[answer],
  })),
  // A follow-up's own reply is never shown — it is resolved first — but the agent and the ZIP
  // build need text for it. It keeps the thread alive too.
  ...FOLLOWUP_INTENTS.map(({ name, kind, phrases }) => ({
    name,
    phrases: withBisaya(name, phrases),
    inputContexts: [HEALTH_CONTEXT],
    outputContexts: [HEALTH_CONTEXT],
    ...ANSWERS[FOLLOWUP_ANSWERS[kind].sanitary],
  })),
];

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const HEALTH_RESPONSES = Object.fromEntries(MAIN_INTENTS.map(({ name, answer }) => [name, ANSWERS[answer]]));
