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
//   - Two posters at the Magallanes Rural Health Unit, photographed November 2026:
//     "Magallanes Rural Health Unit and Family Planning Center — Health Services": medical
//     consultation Monday–Thursday 8 AM–5 PM and Friday 8 AM–12 noon; family planning Monday–
//     Friday 8 AM–5 PM; dental care Monday–Tuesday 8 AM–5 PM; general laboratory Monday–Friday
//     8 AM–5 PM; routine lab tests for pregnant women Tuesday and Thursday 8 AM–12 noon.
//     PhilHealth's "Listahan ng mga Serbisyo sa PhilHealth YAKAP": primary care (check-up with
//     health education, preventive services, referral to a hospital), 13 laboratory tests, six
//     other primary care services (mammogram … colonoscopy), the medicines by group, "register at
//     a YAKAP clinic", (02) 8662-2588 for reporting a refused or charged service, and for
//     questions or concerns a text number (0917 127 5937, read by the team on the poster) and the
//     email yakaptugon@philhealth.gov.ph ("Tugon", as the poster's QR label spells it).
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
      'YAKAP (Yaman ng Kalusugan Program) is PhilHealth\'s primary care package, offered at the Magallanes Rural Health Unit. Registered members get:\n• Check-ups with health education, and services to prevent illness\n• Referral to a hospital when needed\n• Free laboratory tests such as CBC, cholesterol, blood sugar, chest X-ray, ECG, urinalysis and pap smear (some at a diagnostic center, with a referral)\n• Screening such as mammogram, breast and liver ultrasound, low-dose chest CT scan and colonoscopy\n• Medicines, up to a ₱20,000 budget\nCoverage runs from January to December 31, and you register again each year. To register you need PhilHealth and a valid ID.\nYou can ask me about the requirements, the medicines, the lab tests or the screening.',
    bisaya:
      'Ang YAKAP (Yaman ng Kalusugan Program) mao ang primary care package sa PhilHealth, nga anaa sa Magallanes Rural Health Unit. Ang mga rehistrado makakuha og:\n• Check-up uban ang health education, ug serbisyo para malikayan ang sakit\n• Referral sa ospital kung kinahanglan\n• Libre nga laboratory test sama sa CBC, cholesterol, blood sugar, chest X-ray, ECG, urinalysis ug pap smear (ang uban sa diagnostic center, uban ang referral)\n• Screening sama sa mammogram, breast ug liver ultrasound, low-dose chest CT scan ug colonoscopy\n• Tambal, hangtod ₱20,000 nga budget\nAng coverage sugod Enero hangtod Disyembre 31, ug magparehistro ka usab kada tuig. Para magparehistro, kinahanglan nimo ang PhilHealth ug valid ID.\nPwede ka mangutana bahin sa requirements, tambal, lab test, o screening.',
  },
  yakapRequirements: {
    english:
      'To register for YAKAP at the Municipal Health Office (Rural Health Unit):\n1. PhilHealth membership — if you don\'t have PhilHealth yet, get it first. An expired or unpaid PhilHealth status is usually okay, because staff look you up in the PhilHealth system.\n2. A valid ID — a photocopy is enough.\n3. A registration form, which you fill out at the office.',
    bisaya:
      'Para magparehistro sa YAKAP sa Municipal Health Office (Rural Health Unit):\n1. PhilHealth — kung wala ka pay PhilHealth, kuha usa. Kasagaran okay ra bisan expired o wala nabayri ang PhilHealth, kay i-search ra sa staff sa PhilHealth system.\n2. Valid ID — okay na ang photocopy.\n3. Registration form, nga i-fill out nimo didto sa opisina.',
  },
  yakapMedicines: {
    english:
      'PhilHealth YAKAP medicines, within a budget of up to ₱20,000 per member for the January–December coverage year:\n• Antibiotics (anti-infectives): amoxicillin, ciprofloxacin, clarithromycin, co-amoxiclav, co-trimoxazole, nitrofurantoin\n• Fluids and electrolytes: oral rehydration salts (ORS)\n• Asthma: fluticasone + salmeterol, prednisone, salbutamol\n• Fever: paracetamol\n• Cholesterol: simvastatin\n• Diabetes: gliclazide, metformin\n• High blood pressure: amlodipine, enalapril, hydrochlorothiazide, losartan, metoprolol\n• Blood thinner: aspirin\n• Allergy: chlorphenamine\nYou get them through a check-up at the Rural Health Unit; the doctor decides which you need. Ask the RHU how often you can claim them.',
    bisaya:
      'Mga tambal sa PhilHealth YAKAP, sulod sa budget hangtod ₱20,000 matag miyembro para sa coverage gikan Enero hangtod Disyembre:\n• Antibiotic (anti-infective): amoxicillin, ciprofloxacin, clarithromycin, co-amoxiclav, co-trimoxazole, nitrofurantoin\n• Fluids ug electrolytes: oral rehydration salts (ORS)\n• Hubak (asthma): fluticasone + salmeterol, prednisone, salbutamol\n• Hilanat: paracetamol\n• Cholesterol: simvastatin\n• Diabetes: gliclazide, metformin\n• High blood: amlodipine, enalapril, hydrochlorothiazide, losartan, metoprolol\n• Pang-nipis sa dugo: aspirin\n• Allergy: chlorphenamine\nMakuha kini pinaagi sa check-up sa Rural Health Unit; ang doktor ang modesisyon kung unsa ang imong kinahanglan. Pangutana sa RHU kung kapila nimo makuha.',
  },
  yakapLabTests: {
    english:
      'PhilHealth YAKAP laboratory tests, free for registered members when the doctor says you need them:\n• Complete blood count (CBC) with platelet count\n• Lipid profile (total cholesterol, HDL and LDL cholesterol, triglycerides)\n• Fasting blood sugar (FBS)\n• Oral glucose tolerance test (OGTT)\n• HbA1c (glycosylated hemoglobin)\n• Creatinine\n• Chest X-ray\n• Sputum microscopy\n• Electrocardiogram (ECG)\n• Urinalysis\n• Pap smear\n• Fecalysis\n• Fecal occult blood test\nSome are done at the RHU laboratory (Monday to Friday, 8 AM–5 PM); others at a diagnostic center, with a referral from the RHU.',
    bisaya:
      'Mga laboratory test sa PhilHealth YAKAP, libre sa mga rehistradong miyembro kung ingnon sa doktor nga kinahanglan nimo:\n• Complete blood count (CBC) uban ang platelet count\n• Lipid profile (total cholesterol, HDL ug LDL cholesterol, triglycerides)\n• Fasting blood sugar (FBS)\n• Oral glucose tolerance test (OGTT)\n• HbA1c (glycosylated hemoglobin)\n• Creatinine\n• Chest X-ray\n• Sputum microscopy\n• Electrocardiogram (ECG)\n• Urinalysis\n• Pap smear\n• Fecalysis\n• Fecal occult blood test\nAng uban buhaton sa laboratory sa RHU (Lunes hangtod Biyernes, 8 AM–5 PM); ang uban sa diagnostic center, uban ang referral gikan sa RHU.',
  },
  yakapScreening: {
    english:
      'Other primary care services under PhilHealth YAKAP:\n• Mammogram\n• Breast ultrasound\n• Low-dose chest CT scan\n• Alpha-fetoprotein (AFP) test\n• Liver ultrasound\n• Colonoscopy\nRegister for YAKAP at the Rural Health Unit, then ask the doctor there whether you need one and for a referral.',
    bisaya:
      'Ubang primary care nga serbisyo ubos sa PhilHealth YAKAP:\n• Mammogram\n• Breast ultrasound\n• Low-dose chest CT scan\n• Alpha-fetoprotein (AFP) test\n• Liver ultrasound\n• Colonoscopy\nMagparehistro sa YAKAP sa Rural Health Unit, unya pangutana sa doktor didto kung kinahanglan nimo ug para sa referral.',
  },
  yakapComplaint: {
    english:
      'Contacting PhilHealth about YAKAP:\n• Refused a service or charged for one: report it at (02) 8662-2588\n• Questions or concerns: text 0917 127 5937, or email yakaptugon@philhealth.gov.ph\nThe YAKAP poster at the Rural Health Unit also has a QR code for the YAKAP Tugon form.',
    bisaya:
      'Pagkontak sa PhilHealth bahin sa YAKAP:\n• Gibalibaran sa serbisyo o gisingil: i-report sa (02) 8662-2588\n• Pangutana o concern: mag-text sa 0917 127 5937, o mag-email sa yakaptugon@philhealth.gov.ph\nAng poster sa YAKAP sa Rural Health Unit naay QR code usab para sa YAKAP Tugon form.',
  },
  // ---- The Rural Health Unit's posted schedule ----
  rhuSchedule: {
    english:
      'Health services at the Magallanes Rural Health Unit and Family Planning Center:\n• Medical consultation: Monday to Thursday, 8 AM–5 PM; Friday, 8 AM–12 noon\n• Family planning: Monday to Friday, 8 AM–5 PM\n• Dental care: Monday and Tuesday, 8 AM–5 PM\n• General laboratory: Monday to Friday, 8 AM–5 PM\n• Routine lab tests for pregnant women: Tuesday and Thursday, 8 AM–12 noon\nThe RHU is also where you register for PhilHealth YAKAP.',
    bisaya:
      'Mga serbisyo sa panglawas sa Magallanes Rural Health Unit and Family Planning Center:\n• Medical consultation: Lunes hangtod Huwebes, 8 AM–5 PM; Biyernes, 8 AM–12 sa udto\n• Family planning: Lunes hangtod Biyernes, 8 AM–5 PM\n• Dental care: Lunes ug Martes, 8 AM–5 PM\n• General laboratory: Lunes hangtod Biyernes, 8 AM–5 PM\n• Routine lab test para sa mga mabdos: Martes ug Huwebes, 8 AM–12 sa udto\nAng RHU usab ang dapit para magparehistro sa PhilHealth YAKAP.',
  },
  consultation: {
    english:
      'Medical consultation (check-up with a doctor) at the Magallanes Rural Health Unit:\n• Monday to Thursday: 8 AM–5 PM\n• Friday: 8 AM–12 noon\nRegistered PhilHealth YAKAP members get their check-ups under YAKAP. For an emergency, go to a hospital or call MERT at ' + HOTLINES.mert + ' or 911.',
    bisaya:
      'Medical consultation (check-up sa doktor) sa Magallanes Rural Health Unit:\n• Lunes hangtod Huwebes: 8 AM–5 PM\n• Biyernes: 8 AM–12 sa udto\nAng mga rehistrado sa PhilHealth YAKAP, ubos sa YAKAP ang ilang check-up. Kung emergency, adto sa ospital o tawag sa MERT sa ' + HOTLINES.mert + ' o sa 911.',
  },
  rhuLab: {
    english:
      'The Rural Health Unit\'s general laboratory is open Monday to Friday, 8 AM–5 PM. Routine lab tests for pregnant women are on Tuesday and Thursday, 8 AM–12 noon. Registered PhilHealth YAKAP members get the listed lab tests free — ask me which tests YAKAP covers.',
    bisaya:
      'Ang general laboratory sa Rural Health Unit abri Lunes hangtod Biyernes, 8 AM–5 PM. Ang routine lab test para sa mga mabdos kay Martes ug Huwebes, 8 AM–12 sa udto. Ang mga rehistrado sa PhilHealth YAKAP libre sa mga lab test nga nalista — pangutana nako kung unsa nga test ang sakop sa YAKAP.',
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
      'Prenatal check-ups are available at your barangay, through the barangay health workers (BHWs) and HRH nurses. Routine lab tests for pregnant women are done at the Rural Health Unit on Tuesday and Thursday, 8 AM–12 noon. For an ultrasound, the Rural Health Unit refers you to a diagnostic center.',
    bisaya:
      'Ang prenatal check-up anaa sa imong barangay, pinaagi sa mga barangay health worker (BHW) ug HRH nurse. Ang routine lab test para sa mga mabdos buhaton sa Rural Health Unit kada Martes ug Huwebes, 8 AM–12 sa udto. Kung ultrasound, i-refer ka sa Rural Health Unit sa diagnostic center.',
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
const YAKAP_ANSWERS = new Set(['yakap', 'yakapRequirements', 'yakapMedicines', 'yakapLabTests', 'yakapCoverage', 'yakapCost', 'yakapLocation', 'yakapScreening', 'yakapComplaint']);
// The Rural Health Unit's own services and schedule (the posted schedule).
const RHU_ANSWERS = new Set(['rhuSchedule', 'consultation', 'rhuLab']);

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
      'Is metformin covered by YAKAP?', 'Is losartan free with YAKAP?', 'Does YAKAP give amoxicillin?', 'Is paracetamol included in YAKAP?',
      'What medicines are on the YAKAP list?', 'YAKAP medicines for diabetes', 'Does YAKAP have asthma medicine?', 'Is amlodipine covered by PhilHealth YAKAP?',
      'Can I get salbutamol from YAKAP?', 'Is simvastatin free with YAKAP?', 'YAKAP antibiotics', 'Does YAKAP cover ORS?',
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
      'Is CBC free with YAKAP?', 'Does YAKAP cover a chest x-ray?', 'Is urinalysis included in YAKAP?', 'Is pap smear free under YAKAP?',
      'Can I get an ECG with YAKAP?', 'Is the cholesterol test covered by PhilHealth YAKAP?', 'Does YAKAP include fasting blood sugar?',
      'Is HbA1c included in YAKAP?', 'Free creatinine test with YAKAP', 'Is fecalysis free with PhilHealth?', 'What laboratory tests are on the YAKAP list?',
    ],
  },
  {
    name: 'health.yakap.screening.inquire',
    answer: 'yakapScreening',
    phrases: [
      'Does YAKAP cover a mammogram?', 'Is colonoscopy covered by YAKAP?', 'Can I get a breast ultrasound with YAKAP?', 'Is low-dose chest CT scan free with YAKAP?',
      'Does PhilHealth YAKAP include cancer screening?', 'What are the other primary care services of YAKAP?', 'Is liver ultrasound covered by YAKAP?',
      'Alpha fetoprotein test YAKAP', 'Where can I get a free mammogram?', 'Free colonoscopy with PhilHealth', 'Does YAKAP cover breast cancer screening?',
      'YAKAP other services', 'Can YAKAP pay for my CT scan?', 'Is there a free mammogram in Magallanes?', 'Screening tests under YAKAP',
    ],
  },
  {
    name: 'health.yakap.complaint.inquire',
    answer: 'yakapComplaint',
    phrases: [
      'They charged me for a YAKAP service', 'I was refused a YAKAP service, where do I complain?', 'Where can I report a problem with YAKAP?',
      'YAKAP complaint hotline', 'PhilHealth YAKAP hotline', 'They asked me to pay for my YAKAP lab test', 'Who do I call about YAKAP?',
      'How do I complain to PhilHealth about YAKAP?', 'The RHU did not give my YAKAP medicine', 'Report a YAKAP clinic',
      'PhilHealth complaint number', 'Is there a number for YAKAP concerns?',
      'What is the contact number of YAKAP?', 'What is the email of YAKAP?', 'How do I contact PhilHealth YAKAP?', 'Where can I text about YAKAP?',
      'YAKAP contact', 'I have a question about YAKAP, who do I contact?',
    ],
  },
  // ---- The Rural Health Unit's posted schedule ----
  {
    name: 'health.rhu.schedule.inquire',
    answer: 'rhuSchedule',
    phrases: [
      'What services does the RHU offer?', 'What time does the RHU open?', 'What is the schedule of the Rural Health Unit?', 'Is the RHU open on Friday?',
      'What are the health services in Magallanes?', 'RHU schedule', 'What are the office hours of the health center?', 'Is the health center open today?',
      'What services are available at the health center?', 'Health services schedule', 'When is the RHU open?', 'Is the RHU open now?',
      'What days is the Rural Health Unit open?', 'What can I avail at the RHU?', 'Rural Health Unit and Family Planning Center services',
      'Until what time is the health center open?', 'Health center schedule this week', 'Which RHU services are open today?',
    ],
  },
  {
    name: 'health.consultation.inquire',
    answer: 'consultation',
    phrases: [
      'When can I see a doctor at the RHU?', 'What is the schedule of medical consultation?', 'Is there a doctor at the health center today?',
      'Can I have a check-up on Friday?', 'What time is the check-up at the RHU?', 'Medical consultation schedule', 'Is consultation open on Friday?',
      'Where can I get a medical check-up?', 'Is there a doctor available at the RHU?', 'I want to have a check-up', 'Consultation hours at the Rural Health Unit',
      'Until what time is the consultation on Friday?', 'Can I consult a doctor at the health center?', 'Doctor schedule at the RHU', 'General check-up schedule',
    ],
  },
  {
    name: 'health.rhu.laboratory.inquire',
    answer: 'rhuLab',
    phrases: [
      'What time is the laboratory open at the RHU?', 'Is there a laboratory at the health center?', 'Laboratory schedule at the RHU',
      'When can I have a laboratory test at the RHU?', 'Is the RHU laboratory open on Friday?', 'What days is the laboratory open?',
      'Does the RHU have a laboratory?', 'Laboratory hours at the RHU', 'Is the RHU laboratory open today?',
      'Can I have a blood test at the RHU?', 'Is the lab open on Thursday?', 'What time does the RHU laboratory close?', 'RHU laboratory services',
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
  {
    name: 'health.followup.schedule.inquire',
    kind: 'schedule',
    phrases: [
      'When?', 'What days?', 'What time?', 'Until what time?', 'Is it open today?', 'Open on Friday?', 'What is the schedule?',
      'Kanus-a?', 'Unsa nga adlaw?', 'Unsa oras?', 'Hangtod unsa oras?', 'Abri ba karon?', 'Abri ba karong Biyernes?', 'Unsa ang schedule?', 'Kailan?',
    ],
  },
  {
    name: 'health.followup.medicines.inquire',
    kind: 'medicines',
    phrases: [
      'What medicines?', 'Is there free medicine?', 'What medicines are included?', 'And the medicines?', 'Do they give medicine?',
      'Unsa nga tambal?', 'Naa bay tambal?', 'Libre ba ang tambal?', 'Unsa ang mga tambal?', 'Ano ang gamot?', 'May gamot ba?',
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
    'sakop ba sa YAKAP ang metformin', 'libre ba ang losartan sa YAKAP', 'naa bay amoxicillin sa YAKAP', 'unsa nga tambal ang naa sa lista sa YAKAP',
    'naa bay tambal sa hubak sa YAKAP', 'tambal sa diabetes sa YAKAP', 'libre ba ang paracetamol sa RHU', 'tambal sa high blood sa YAKAP',
  ],
  'health.yakap.labtest.inquire': [
    'libre ba ang laboratory sa YAKAP', 'unsa nga lab test ang sakop sa YAKAP', 'naa bay libre nga lab test sa RHU', 'kinahanglan ba og referral sa lab test',
    'asa magpa laboratory sa YAKAP', 'libre ba ang blood test sa YAKAP', 'i-refer ba ko sa diagnostic', 'libre lab test sa PhilHealth', 'magbayad pa ba sa lab sa YAKAP',
    'libre ba ang CBC sa YAKAP', 'sakop ba sa YAKAP ang chest x-ray', 'apil ba ang urinalysis sa YAKAP', 'libre ba ang pap smear sa YAKAP',
    'naa bay ECG sa YAKAP', 'sakop ba ang cholesterol test sa YAKAP', 'unsa nga lab test ang naa sa lista sa YAKAP',
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
  'health.yakap.screening.inquire': [
    'sakop ba sa YAKAP ang mammogram', 'libre ba ang colonoscopy sa YAKAP', 'naa bay breast ultrasound sa YAKAP', 'sakop ba ang CT scan sa YAKAP',
    'naa bay cancer screening sa YAKAP', 'unsa ang ubang serbisyo sa YAKAP', 'libre ba ang liver ultrasound sa PhilHealth', 'asa magpa mammogram nga libre',
    'pwede ba ko magpa colonoscopy sa YAKAP',
  ],
  'health.yakap.complaint.inquire': [
    'gisingil ko sa YAKAP', 'wala ko gihatagan og serbisyo sa YAKAP asa ko mo reklamo', 'asa i-report ang problema sa YAKAP', 'numero sa PhilHealth para sa reklamo',
    'gipabayad ko sa lab test sa YAKAP', 'kinsa akong tawagan bahin sa YAKAP', 'wala ko gihatagan og tambal sa YAKAP', 'hotline sa YAKAP',
    'unsa ang numero sa YAKAP', 'unsa ang email sa YAKAP', 'asa ko mo-text bahin sa YAKAP', 'contact number sa YAKAP', 'unsaon pag-contact sa YAKAP',
  ],
  'health.rhu.schedule.inquire': [
    'unsa ang serbisyo sa RHU', 'unsa oras abri ang RHU', 'unsa ang schedule sa health center', 'abri ba ang RHU karong Biyernes', 'abri ba ang RHU karon',
    'unsa ang mga serbisyo sa panglawas sa Magallanes', 'kanus-a abri ang health center', 'abri ba ang RHU ugma', 'unsa nga adlaw abri ang RHU',
    'unsa ang makuha sa RHU', 'hangtod unsa oras ang health center', 'schedule sa RHU', 'unsa nga serbisyo ang abri karon sa RHU',
  ],
  'health.consultation.inquire': [
    'kanus-a pwede magpa check-up sa RHU', 'unsa ang schedule sa konsultasyon', 'naa bay doktor sa health center karon', 'pwede ba magpa check-up karong Biyernes',
    'unsa oras ang check-up sa RHU', 'asa magpa check-up', 'gusto ko magpa check-up', 'naa bay doktor sa RHU', 'hangtod unsa oras ang check-up kung Biyernes',
    'pwede ba magpakonsulta sa doktor sa health center', 'schedule sa doktor sa RHU', 'magpatan-aw ko sa doktor asa',
  ],
  'health.rhu.laboratory.inquire': [
    'unsa oras abri ang laboratory sa RHU', 'naa bay laboratory sa health center', 'schedule sa laboratory sa RHU', 'kanus-a pwede magpa laboratory sa RHU',
    'abri ba ang laboratory karong Biyernes', 'unsa nga adlaw ang laboratory', 'naa bay lab ang RHU', 'kanus-a ang lab test sa mga buntis',
    'pwede ba magpa blood test sa RHU', 'abri ba ang lab kung Huwebes',
  ],
  'health.followup.fees.inquire': ['pila bayad?', 'pila man ang bayad?', 'tag pila man?', 'libre ra ba?', 'naa bay bayad?', 'magbayad pa ba?'],
  'health.followup.location.inquire': ['asa man ko moadto?', 'asa man na?', 'asa man kuhaon?', 'asa ang opisina?', 'asa man magbayad?'],
  'health.followup.requirements.inquire': ['unsa man ang requirements?', 'unsay dad-on?', 'unsa may kinahanglan?', 'unsa pa ang kinahanglan?', 'unsa mga papeles?'],
  'health.followup.renewal.inquire': ['kada tuig man?', 'i-renew pa ba?', 'hangtod kanus-a man?', 'ma expire ba?', 'kapila man?'],
  'health.followup.labtest.inquire': ['unsa man nga test?', 'naa pa bay lab?', 'libre ba ang lab?', 'unsa man ang laboratory?', 'kinahanglan pa ba og test?'],
  'health.followup.who.inquire': ['kinsa man ang kinahanglan?', 'apil ba ang owner?', 'tanan ba?', 'bisan ang tag-iya?', 'pwede ba ko ani?'],
  'health.followup.schedule.inquire': ['kanus-a man?', 'unsa man nga adlaw?', 'unsa man oras?', 'abri ba ugma?', 'hangtod pila ka oras?'],
  'health.followup.medicines.inquire': ['unsa man nga tambal?', 'naa pud bay tambal?', 'unsa ang mga tambal nga apil?', 'naa bay libre nga tambal?'],
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
// `rhu` is the answer for a thread about the Rural Health Unit's own services (its schedule,
// consultation, its laboratory); without one, a follow-up there gets the previous answer, which
// focus.js narrows to what was asked ("kanus-a?" → its days).
const FOLLOWUP_ANSWERS = {
  fees: { sanitary: 'sanitaryFees', yakap: 'yakapCost' },
  location: { sanitary: 'sanitaryLocation', yakap: 'yakapLocation', sanitaryPermit: 'sanitaryPermit' },
  // After the RHU's schedule, the requirements on record are YAKAP's (registering there).
  requirements: { sanitary: 'sanitaryRequirements', yakap: 'yakapRequirements', healthCard: 'healthCard', rhuSchedule: 'yakapRequirements' },
  renewal: { sanitary: 'inspection', yakap: 'yakapCoverage' },
  labtest: { sanitary: 'labTests', yakap: 'yakapLabTests', prenatal: 'prenatal', rhu: 'rhuLab' },
  who: { sanitary: 'healthCard', yakap: 'yakapRequirements' },
  // "kanus-a?" after YAKAP: when the RHU is open to register; after the health card: January.
  schedule: { sanitary: 'inspection', yakap: 'rhuSchedule' },
  medicines: { sanitary: 'yakapMedicines', yakap: 'yakapMedicines', rhu: 'yakapMedicines' },
};

/**
 * The main intent a health follow-up asks for, given the previous answer's intent.
 * @param {string} kind - fees | location | requirements | renewal | labtest | who | schedule | medicines
 * @param {string} lastIntent
 */
export function healthFollowupTarget(kind, lastIntent = '') {
  const map = FOLLOWUP_ANSWERS[kind];
  const last = ANSWER_OF[lastIntent];
  if (!map) return lastIntent;
  if (last && map[last]) return INTENT_OF[map[last]];
  if (YAKAP_ANSWERS.has(last)) return INTENT_OF[map.yakap];
  if (RHU_ANSWERS.has(last)) return map.rhu ? INTENT_OF[map.rhu] : lastIntent;
  if (SANITARY_ANSWERS.has(last) || !last) return INTENT_OF[map.sanitary];
  return lastIntent;
}

// ---- The posters' facts as data, for answers worked out from the question (specific.js) ----

/** The RHU's posted schedule: [opens, closes] in hours, per weekday. */
const WEEKDAYS_8_5 = { monday: [8, 17], tuesday: [8, 17], wednesday: [8, 17], thursday: [8, 17], friday: [8, 17] };
export const RHU_SCHEDULE = {
  consultation: { en: 'Medical consultation', ceb: 'Medical consultation', days: { ...WEEKDAYS_8_5, friday: [8, 12] } },
  familyPlanning: { en: 'Family planning', ceb: 'Family planning', days: WEEKDAYS_8_5 },
  dental: { en: 'Dental care', ceb: 'Dental care', days: { monday: [8, 17], tuesday: [8, 17] } },
  laboratory: { en: 'General laboratory', ceb: 'General laboratory', days: WEEKDAYS_8_5 },
  pregnantLab: { en: 'Routine lab tests for pregnant women', ceb: 'Routine lab test para sa mga mabdos', days: { tuesday: [8, 12], thursday: [8, 12] } },
};

// Generic names on the YAKAP poster, with the brand names residents use for them.
export const YAKAP_MEDICINES = [
  ['co-amoxiclav', 'antibiotic', /\b(co-?\s*amoxiclav|amoxiclav|augmentin)\b/i],
  ['amoxicillin', 'antibiotic', /\b(amoxi?cill?in|amoxil)\b/i],
  ['ciprofloxacin', 'antibiotic', /\b(ciprofloxacin|cipro|ciprobay)\b/i],
  ['clarithromycin', 'antibiotic', /\b(clarithromycin|klaricid)\b/i],
  ['co-trimoxazole', 'antibiotic', /\b(co-?\s*trimoxazole|cotrimoxazole|bactrim)\b/i],
  ['nitrofurantoin', 'antibiotic', /\b(nitrofurantoin|macrodantin)\b/i],
  ['oral rehydration salts (ORS)', 'fluids', /\b(ors|oral\s*rehydration\w*|oresol|hydrite)\b/i],
  ['fluticasone + salmeterol', 'asthma', /\b(fluticasone|salmeterol|seretide)\b/i],
  ['prednisone', 'asthma', /\bprednisone\b/i],
  ['salbutamol', 'asthma', /\b(salbutamol|ventolin|albuterol)\b/i],
  ['paracetamol', 'fever', /\b(paracetamol|biogesic|tempra|calpol)\b/i],
  ['simvastatin', 'cholesterol', /\bsimvastatin\b/i],
  ['gliclazide', 'diabetes', /\b(gliclazide|diamicron)\b/i],
  ['metformin', 'diabetes', /\b(metformin|glucophage)\b/i],
  ['amlodipine', 'bloodPressure', /\b(amlodipine|norvasc)\b/i],
  ['enalapril', 'bloodPressure', /\benalapril\b/i],
  ['hydrochlorothiazide', 'bloodPressure', /\b(hydrochlorothiazide|hctz)\b/i],
  ['losartan', 'bloodPressure', /\b(losartan|cozaar)\b/i],
  ['metoprolol', 'bloodPressure', /\b(metoprolol|betaloc)\b/i],
  ['aspirin', 'bloodThinner', /\b(aspirin|aspilets)\b/i],
  ['chlorphenamine', 'allergy', /\b(chlorphenamine|chlorpheniramine)\b/i],
].map(([name, group, re]) => ({ name, group, re }));

/** Medicine groups, and the words a resident asks for one by. */
export const YAKAP_MEDICINE_GROUPS = {
  antibiotic: { en: 'antibiotic', ceb: 'antibiotic', re: /\b(antibiotics?|anti-?infect\w*|infections?|impeksyon)\b/i },
  fluids: { en: 'for dehydration', ceb: 'para sa dehydration', re: /\b(diarrh\w*|kalibanga|dehydrat\w*|ors)\b/i },
  asthma: { en: 'for asthma', ceb: 'para sa hubak', re: /\b(asthma|hubak|hika)\b/i },
  fever: { en: 'for fever', ceb: 'para sa hilanat', re: /\b(fever|hilanat|lagnat)\b/i },
  cholesterol: { en: 'for cholesterol', ceb: 'para sa cholesterol', re: /\bcholesterol\b/i },
  diabetes: { en: 'for diabetes', ceb: 'para sa diabetes', re: /\b(diabet\w*|blood\s*sugar|sugar)\b/i },
  bloodPressure: { en: 'for high blood pressure', ceb: 'para sa high blood', re: /\b(high\s*blood|highblood|hypertension|blood\s*pressure|alta\s*presyon)\b/i },
  bloodThinner: { en: 'blood thinner', ceb: 'pang-nipis sa dugo', re: /\b(blood\s*thinners?|anti-?thrombotics?)\b/i },
  allergy: { en: 'for allergy', ceb: 'para sa allergy', re: /\b(allerg\w*|antihistamines?|anti-?histamines?)\b/i },
};

// The YAKAP poster's laboratory tests and other primary care services.
export const YAKAP_TESTS = [
  ['complete blood count (CBC)', 'lab', /\b(cbc|complete\s*blood\s*count|platelets?(\s*count)?)\b/i],
  ['lipid profile (cholesterol and triglycerides)', 'lab', /\b(lipid\s*profile|cholesterol|triglycerides?|hdl|ldl)\b/i],
  ['oral glucose tolerance test (OGTT)', 'lab', /\b(ogtt|glucose\s*tolerance)\b/i],
  ['fasting blood sugar (FBS)', 'lab', /\b(fbs|fasting\s*blood\s*sugar|blood\s*sugar\s*test)\b/i],
  ['HbA1c', 'lab', /\b(hba1c|a1c|glycosylated|glycated)\b/i],
  ['creatinine', 'lab', /\bcreatinine\b/i],
  ['chest X-ray', 'lab', /\b(chest\s*)?x-?\s*rays?\b|\bxrays?\b/i],
  ['sputum microscopy', 'lab', /\bsputum\b/i],
  ['electrocardiogram (ECG)', 'lab', /\b(ecg|ekg|electrocardiogram)\b/i],
  ['urinalysis', 'lab', /\b(urinalysis|urine\s*test)\b/i],
  ['pap smear', 'lab', /\bpap\s*smear\b/i],
  ['fecal occult blood test', 'lab', /\b(fecal\s*occult|fobt)\b/i],
  ['fecalysis', 'lab', /\b(fecalysis|stool\s*(test|exam\w*))\b/i],
  ['mammogram', 'screening', /\bmammo\w*\b/i],
  ['breast ultrasound', 'screening', /\bbreast\s*ultrasound\b/i],
  ['low-dose chest CT scan', 'screening', /\b(ct\s*-?\s*scan|low-?\s*dose\s*(chest\s*)?ct)\b/i],
  ['alpha-fetoprotein (AFP) test', 'screening', /\b(alpha-?\s*feto\w*|afp)\b/i],
  ['liver ultrasound', 'screening', /\bliver\s*ultrasound\b/i],
  ['colonoscopy', 'screening', /\bcolonoscop\w*\b/i],
].map(([name, list, re]) => ({ name, list, re }));

/** The YAKAP medicines a question names, by generic or brand name. */
export const yakapMedicinesIn = (q = '') => {
  const named = YAKAP_MEDICINES.filter((m) => m.re.test(q));
  // "co-amoxiclav" is not also amoxicillin.
  return named.some((m) => m.name === 'co-amoxiclav') ? named.filter((m) => m.name !== 'amoxicillin') : named;
};
/** The YAKAP tests and screening services a question names. */
export const yakapTestsIn = (q = '') => {
  const named = YAKAP_TESTS.filter((t) => t.re.test(q));
  // "fecal occult blood test" is not also fecalysis; "breast/liver ultrasound" is screening only.
  return named.some((t) => t.name === 'fecal occult blood test') ? named.filter((t) => t.name !== 'fecalysis') : named;
};

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
