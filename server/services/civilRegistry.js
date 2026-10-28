// server/services/civilRegistry.js
//
// Civil registry fees and corrections: the single source for both the Dialogflow intents
// (scripts/build-dialogflow-intents.mjs) and the chat server's replies, like businessPermit.js.
// The LCRO's printed checklists (late birth registration, marriage licence) stay in responses.js.
//
// Birth registration: the LCRO's late-registration checklist (below) applies to newborns too —
// the office uses the same requirements for both (capstone team, October 2026).
//
// Fees source: capstone interview with the Local Civil Registry Office, 28 October 2026 (recording
// Civil_registry.m4a, partly faint). Amounts are as the staff member stated them:
//   - Marriage licence ₱500. ₱550 was also said at the start; whether that is a total with
//     another charge is unclear, so the answer asks the citizen to confirm the total.
//   - Death certificate ₱50.
//   - Correction of a clerical error in a birth certificate: "usually ₱1,500", even for a single
//     letter (RA 9048).
//   - Correction of the sex entry: "about ₱6,000, I think", with many requirements (RA 10172).
// The 10-day posting of a marriage licence application is the Family Code, Art. 17.
// Confirm the amounts through the LGU questionnaire (Part 3) and drop the hedges once confirmed.

// Transcribed verbatim from the Local Civil Registry Office's printed checklists, including the
// office's own wording and numbering. Kept as constants so the several Dialogflow intents that
// cover each topic (responses.js and the intents below) share one authoritative copy.
export const LATE_BIRTH_EN = `LATE REGISTRATION OF BIRTH CERTIFICATE
CHECKLIST OF REQUIREMENTS

1. Philippine Statistics Authority (PSA) Negative Result
2. National ID (1 yr old and above)
3. 2x2 size picture w/ white background (unedited front-facing photo)
4. Affidavit of Two (2) Disinterested Persons
5. Any two (2) of the following documents evidence which may show the name of the child:
   a. Baptismal Certificate
   b. School Records
   c. Income Tax Return
   d. Medical Records, Immunization record
   e. Voter Registration Record (VRR)
   f. Philhealth (MDR)
6. Valid ID of Informant, Senior Citizen ID
7. Marriage Certificate of document owner, if applicable
8. Siblings birth certificate, if applicable
9. Any two (2) documents evidences showing of the identity of parents:
   a. Certificate of Live Birth of Parents
   b. Government issued ID
   c. Marriage Cert. of Parents
   d. Death Cert. of Parents
10. Barangay Certification as proof of residency
11. Affidavit of Acknowledgment, Affidavit of Admission of Paternity, Affidavit to use the surname of the father, and Certificate of Registration (for illegitimate child), if applicable`;

export const LATE_BIRTH_CEB = `Mao kini ang mga requirements para sa Late Registration of Birth Certificate sa Local Civil Registry Office (LCRO) sa Magallanes:
1. PSA Negative Result
2. National ID (kung 1 ka tuig pataas)
3. 2x2 nga picture nga puti ang background (dili edited, nag-atubang)
4. Affidavit of Two (2) Disinterested Persons
5. Bisan unsang duha (2) ka dokumento nga nagpakita sa ngalan sa bata (pananglitan: Baptismal Certificate, School Records, ITR, Medical/Immunization Record, Voter Registration Record, PhilHealth MDR)
6. Valid ID sa informant (o Senior Citizen ID)
7. Marriage Certificate sa tag-iya sa dokumento, kung aplikable
8. Birth certificate sa mga igsoon, kung aplikable
9. Bisan unsang duha (2) ka dokumento nga nagpamatuod sa identity sa mga ginikanan
10. Barangay Certification isip pamatuod nga diri ka nagpuyo
11. Para sa illegitimate nga anak, kung aplikable: Affidavit of Acknowledgment/Admission of Paternity, Affidavit to Use the Surname of the Father (AUSF), ug Certificate of Registration`;

export const MARRIAGE_LICENSE_EN = `REQUIREMENTS FOR APPLICATION FOR MARRIAGE LICENCE: (both groom & bride)

1. Birth Certificate
2. Cedula (Current year)
3. CENOMAR (PSA)
4. PRE- Marriage Counseling Certificate (MSWD)
5. Personal appearance of Parent/s for Consent or Advice (if age 18 to 25 yrs old)
6. Death Certificate (widow/widower only)
7. Court Decree/ ORDER (if annulled, nullified of marriage)
8. Legal capacity to contract marriage (foreigner only)
9. Divorce paper, if divorced
10. Valid ID's
11. Brgy. Certification`;

export const MARRIAGE_LICENSE_CEB = `Mao kini ang mga requirements sa pag-apply og Marriage License (para sa LALAKI ug BABAYE):
1. Birth Certificate
2. Cedula (karon nga tuig)
3. CENOMAR (PSA)
4. Pre-Marriage Counseling Certificate (MSWD)
5. Personal nga pag-adto sa ginikanan para sa consent o advice (kung 18 hangtod 25 anyos)
6. Death Certificate (para sa biyuda/biyudo lang)
7. Court Decree/Order (kung na-annul o na-nullify ang kasal)
8. Legal Capacity to Contract Marriage (para sa foreigner lang)
9. Divorce papers, kung na-divorce
10. Valid IDs
11. Barangay Certification`;

// Every answer below opens this context for FOLLOWUP_LIFESPAN turns (officials.js; 3, set on
// the context by the ZIP build). While it is alive, "how much?", "sa death certificate?" and
// "kung gender?" match the follow-up intents instead of the fallback.
export const CIVIL_CONTEXT = 'civil-registry-followup';

const ANSWERS = {
  // The LCRO uses one checklist for timely and late birth registration (capstone team, confirmed
  // with the LCRO, October 2026), so a newborn's registration gets the same list.
  birth: {
    english: `Registering a newborn's birth uses the same Local Civil Registry Office (LCRO) checklist as late registration:\n\n${LATE_BIRTH_EN}`,
    bisaya: `Ang pagparehistro sa bag-ong natawo nga bata parehas ra og requirements sa late registration sa Local Civil Registry Office (LCRO):\n${LATE_BIRTH_CEB.split('\n').slice(1).join('\n')}`,
  },
  fees: {
    english:
      'Civil registry fees at the Local Civil Registry Office (LCRO), Municipal Hall:\n• Marriage license: ₱500\n• Death certificate: ₱50\n• Correction of a clerical error in a birth certificate (for example, a misspelled name): usually ₱1,500\n• Correction of the sex (gender) entry: about ₱6,000\nFor other documents, please ask the LCRO.',
    bisaya:
      'Mga bayronon sa Local Civil Registry Office (LCRO), Munisipyo:\n• Marriage license: ₱500\n• Death certificate: ₱50\n• Pag-correct sa sayop sa birth certificate (pananglitan, sayop nga spelling sa ngalan): kasagaran ₱1,500\n• Pag-correct sa sex (gender) entry: mga ₱6,000\nSa ubang dokumento, palihug pangutana sa LCRO.',
  },
  marriage: {
    english:
      'The marriage license fee at the Local Civil Registry Office (LCRO) is ₱500. ₱550 was also mentioned, so please confirm the exact total when you apply. After you apply, the application is posted publicly for 10 consecutive days before the license is issued (Family Code, Art. 17). Ask me for the requirements if you need them.',
    bisaya:
      'Ang bayad sa marriage license sa Local Civil Registry Office (LCRO) kay ₱500. Naay nahisgutan usab nga ₱550, mao nga palihug kumpirmaha ang eksaktong total inig apply nimo. Human ka mag-apply, ipaskil ang aplikasyon sulod sa 10 ka sunod-sunod nga adlaw sa dili pa i-issue ang license (Family Code, Art. 17). Pangutana lang kung gusto nimo mahibal-an ang requirements.',
  },
  death: {
    english: 'A death certificate costs ₱50 at the Local Civil Registry Office (LCRO) in the Municipal Hall.',
    bisaya: 'Ang death certificate kay ₱50 sa Local Civil Registry Office (LCRO) sa Munisipyo.',
  },
  clerical: {
    english:
      'A clerical error in a birth certificate, such as a misspelled name, is corrected through the Local Civil Registry Office (LCRO), even if only one letter is wrong (RA 9048). The fee is usually ₱1,500. The LCRO will tell you which documents to bring. Correcting the sex (gender) entry is a separate, more expensive process.',
    bisaya:
      'Ang sayop sa birth certificate, sama sa sayop nga spelling sa ngalan, i-correct pinaagi sa Local Civil Registry Office (LCRO), bisan usa ra ka letra ang sayop (RA 9048). Ang bayad kasagaran ₱1,500. Ang LCRO ang mosulti kung unsa nga mga dokumento ang dad-on. Ang pag-correct sa sex (gender) entry lahi nga proseso ug mas mahal.',
  },
  sex: {
    english:
      'Correcting the sex (gender) entry in a birth certificate (RA 10172) costs more than a clerical correction — about ₱6,000 — and has more requirements. Please ask the Local Civil Registry Office (LCRO) for the complete list before you file.',
    bisaya:
      'Ang pag-correct sa sex (gender) entry sa birth certificate (RA 10172) mas mahal kaysa sa ordinaryong correction — mga ₱6,000 — ug mas daghan ang requirements. Palihug pangutana sa Local Civil Registry Office (LCRO) sa kompleto nga lista sa dili pa ka mo-file.',
  },
};

const MAIN_INTENTS = [
  {
    name: 'civil.registry.birth.new.inquire',
    answer: 'birth',
    phrases: [
      'How do I register my newborn baby?', 'How do I register the birth of my baby?', 'Requirements for birth registration',
      'My baby was just born, how do I get a birth certificate?', 'How to register a newborn', 'What do I need to register my child\'s birth?',
      'Birth registration requirements', 'Where do I register my baby\'s birth?', 'How do I get a birth certificate for my newborn?',
      'Unsaon pagparehistro sa akong bag-ong natawo nga bata?', 'Unsa ang requirements sa pagparehistro sa birth?', 'Bag-o lang natawo akong anak, unsaon pagkuha og birth certificate?',
      'Asa iparehistro ang bata nga bag-ong natawo?', 'Requirements sa birth certificate sa bata', 'Paano iparehistro ang bagong panganak na sanggol?',
      'Ano ang requirements sa pag-register ng birth?', 'Is the requirement for new birth registration the same as late registration?',
    ],
  },
  {
    name: 'civil.registry.fees.inquire',
    answer: 'fees',
    phrases: [
      'How much are the civil registry fees?', 'What are the fees at the civil registrar?', 'LCR fees', 'How much does the LCRO charge?',
      'Civil registry fees', 'List of fees at the Local Civil Registry', 'How much are the fees for civil registry documents?',
      'What do I pay at the civil registry?', 'Pila ang bayad sa civil registry?', 'Pila ang mga bayronon sa LCR?',
      'Tagpila ang mga dokumento sa civil registry?', 'Unsa ang mga bayad sa LCRO?', 'Magkano ang bayad sa civil registry?',
      'Magkano ang mga fees sa LCR?', 'How much are documents at the civil registrar?',
    ],
  },
  {
    name: 'civil.registry.marriage.fee.inquire',
    answer: 'marriage',
    phrases: [
      'How much is the marriage license?', 'How much does a marriage license cost?', 'Marriage license fee', 'What is the fee for a marriage license?',
      'How much do we pay to apply for a marriage license?', 'How much is the application for a marriage license?', 'marriage license price',
      'How much to get married at the municipal hall?', 'Pila ang bayad sa marriage license?', 'Tagpila ang marriage license?',
      'Pila bayad kung magpakasal?', 'Pila ang bayad sa pag-apply og marriage license?', 'Magkano ang marriage license?',
      'magkano po ang marriage license', 'Magkano ang bayad sa kasal sa munisipyo?', 'How much is the marriage licence?',
    ],
  },
  {
    name: 'civil.registry.death.fee.inquire',
    answer: 'death',
    phrases: [
      'How much is a death certificate?', 'Death certificate fee', 'How much does a death certificate cost?', 'How much do I pay for a death certificate?',
      'What is the fee for a death certificate?', 'Price of a death certificate at the LCR', 'How much to get a copy of a death certificate?',
      'death certificate price', 'Pila ang bayad sa death certificate?', 'Tagpila ang death certificate?', 'Pila bayad sa death cert?',
      'Pila ang bayad sa certificate sa namatay?', 'Magkano ang death certificate?', 'Magkano ang bayad sa death certificate?',
      'Magkano ang death cert?',
    ],
  },
  {
    name: 'civil.registry.correction.clerical.inquire',
    answer: 'clerical',
    phrases: [
      'My name is misspelled in my birth certificate, how do I correct it?', 'How do I correct an error in my birth certificate?',
      'How much is the correction of a birth certificate?', 'Wrong spelling in my birth certificate', 'How do I fix a typo in my birth certificate?',
      'One letter in my name is wrong in my birth certificate', 'Correction of clerical error', 'How much to correct my name in my birth certificate?',
      'Petition for correction of clerical error', 'Mali ang spelling sa akong birth certificate, unsaon pag-ayo?', 'Sayop ang akong ngalan sa birth certificate',
      'Unsaon pag-correct sa birth certificate?', 'Pila ang bayad sa correction sa birth certificate?', 'Usa ra ka letra ang sayop sa akong ngalan',
      'Mali ang pangalan sa birth certificate ko, paano ayusin?', 'Magkano ang correction ng birth certificate?', 'How do I correct my birthday in my birth certificate?',
    ],
  },
  {
    name: 'civil.registry.correction.sex.inquire',
    answer: 'sex',
    phrases: [
      'How do I change the gender entry in my birth certificate?', 'My gender is wrong in my birth certificate', 'How much is the correction of gender in a birth certificate?',
      'Correction of sex in birth certificate', 'The sex in my birth certificate says female but I am male', 'How do I correct the sex entry in my birth certificate?',
      'Gender correction birth certificate fee', 'Wrong sex in birth certificate', 'Sayop ang gender sa akong birth certificate', 'Unsaon pag-correct sa gender sa birth certificate?',
      'Pila ang bayad sa pag-correct sa gender?', 'Babae ang nakabutang sa akong birth certificate pero lalaki ko', 'Mali ang gender sa birth certificate ko',
      'Magkano ang correction ng gender sa birth certificate?', 'Paano itama ang kasarian sa birth certificate?', 'How much to correct the gender in a birth certificate?',
    ],
  },
];

// Follow-ups inside a civil registry thread. resolveCivilFollowup() decides which answer each
// one stands for — "how much?" depends on what the previous answer was about.
const FOLLOWUP_INTENTS = [
  {
    name: 'civil.registry.followup.fees.inquire',
    answer: 'fees',
    phrases: [
      'How much?', 'How much is it?', 'How much does it cost?', 'What is the fee?', 'How much will I pay?', 'how much are the fees?', 'Is it expensive?',
      'Pila?', 'Pila man?', 'Tagpila?', 'Pila ang bayad?', 'Mahal ba?', 'Magkano?', 'Magkano po?', 'Magkano ang bayad?',
    ],
  },
  {
    name: 'civil.registry.followup.death.inquire',
    answer: 'death',
    phrases: [
      'How about a death certificate?', 'And the death certificate?', 'What about the death certificate?', 'How much for a death certificate?',
      'Death certificate?', 'For death?', 'Sa death certificate?', 'Sa death cert?', 'Kung death certificate?', 'Ang sa namatay?',
      'Sa kuan, sa death certificate?', 'Paano ang death certificate?', 'Yung death certificate?', 'Death cert naman?', 'How about for a death?',
    ],
  },
  {
    name: 'civil.registry.followup.marriage.inquire',
    answer: 'marriage',
    phrases: [
      'How about a marriage license?', 'And the marriage license?', 'What about the marriage license?', 'How much for a marriage license?',
      'Marriage license?', 'For marriage?', 'Sa marriage license?', 'Kung magpakasal?', 'Sa kasal?', 'Ang sa marriage?', 'Kung marriage license?',
      'Paano ang marriage license?', 'Yung marriage license?', 'Kasal naman?', 'How about getting married?',
    ],
  },
  {
    name: 'civil.registry.followup.clerical.inquire',
    answer: 'clerical',
    phrases: [
      'What if it is just one letter?', 'Even just one letter?', 'Only one letter is wrong', 'What if only the spelling is wrong?', 'How about a misspelled name?',
      'What about a correction?', 'Kung usa ra ka letra?', 'Bisan usa ra?', 'Spelling ra ang sayop', 'Kung naay sayop?', 'Kung mali ang spelling?',
      'Sa correction?', 'Kahit isang letra lang?', 'Paano kung mali ang spelling?', 'How about corrections?',
    ],
  },
  {
    name: 'civil.registry.followup.sex.inquire',
    answer: 'sex',
    phrases: [
      'What if it is the gender?', 'How about the gender?', 'And for gender?', 'What about the sex entry?', 'If the gender is wrong?', 'Gender?',
      'Kung gender?', 'Sa gender?', 'Ang sa gender, pila?', 'Kung sayop ang gender?', 'Paano kung gender?', 'Yung gender?', 'Kung kasarian?',
      'How about a gender correction?', 'Gender naman?',
    ],
  },
  {
    name: 'civil.registry.followup.requirements.inquire',
    answer: 'fees',
    phrases: [
      'What are the requirements?', 'What do I need?', 'What documents do I need?', 'What should I bring?', 'Requirements?', 'And the requirements?',
      'Unsa ang requirements?', 'Unsa akong kinahanglan?', 'Unsa ang dad-on?', 'Unsa ang mga dokumento?', 'Requirements pud?', 'Ano ang requirements?',
      'Ano ang kailangan?', 'Ano ang dadalhin?', 'What do we need to bring?',
    ],
  },
];

// More Bisaya, the way residents actually type it (see the same list in businessPermit.js):
// every intent carries at least as many Bisaya phrasings as English ones.
const BISAYA_PHRASES = {
  'civil.registry.birth.new.inquire': [
    'unsaon pagparehistro sa bata', 'bag-o natawo akong anak unsaon pag rehistro', 'asa iparehistro ang bata',
    'unsa ang requirements sa birth certificate sa bag-ong natawo', 'unsa dad-on para iparehistro ang bata',
    'pareho ba ang requirements sa bag-ong natawo ug late registration', 'unsaon pagkuha og birth certificate sa akong baby',
  ],
  'civil.registry.fees.inquire': [
    'pila bayad sa LCR', 'pila ang bayad sa mga dokumento sa civil registrar', 'unsa ang mga bayronon sa civil registry',
    'pila bayad sa mga certificate sa LCRO', 'tagpila ang mga papeles sa LCRO', 'mahal ba ang mga dokumento sa civil registry',
  ],
  'civil.registry.marriage.fee.inquire': [
    'pila bayad kasal', 'pila bayad sa marriage license karon', 'tagpila mag apply og marriage license', 'pila magasto sa kasal sa munisipyo',
    'pila ang bayronon kung magpakasal mi', 'pila bayad sa lisensya sa kasal',
  ],
  'civil.registry.death.fee.inquire': [
    'pila bayad sa death cert', 'tagpila ang certificate sa namatay', 'pila bayad kung mokuha og death certificate',
    'pila ang bayronon sa death certificate sa LCR', 'mahal ba ang death certificate', 'pila ang death certificate karon',
  ],
  'civil.registry.correction.clerical.inquire': [
    'sayop ang spelling sa akong ngalan sa birth cert', 'mali ang akong apelyido sa birth certificate', 'usa ra ka letra ang mali sa akong ngalan unsaon',
    'pila bayad sa correction sa birth cert', 'unsaon pag ayo sa sayop sa birth certificate', 'sayop ang birthday sa akong birth certificate',
    'unsaon pag correct sa ngalan sa birth certificate',
  ],
  'civil.registry.correction.sex.inquire': [
    'sayop ang gender sa birth cert', 'babae ang nakabutang pero lalaki ko unsaon', 'pila bayad sa pag correct sa gender',
    'unsaon pag ilis sa gender sa birth certificate', 'lalaki ang nakasulat pero babae ko', 'unsa requirements sa correction sa gender',
  ],
  'civil.registry.followup.fees.inquire': ['pila bayad?', 'pila man ang bayad?', 'tag pila man?', 'pila magasto?', 'pila ang bayronon?'],
  'civil.registry.followup.death.inquire': ['sa death cert man?', 'kung sa namatay?', 'ang death certificate pila?', 'unsa man ang sa death?', 'death certificate pud?', 'kung patay na?'],
  'civil.registry.followup.marriage.inquire': ['sa kasal man?', 'ang marriage license pila?', 'kung magpakasal mi?', 'marriage license pud?', 'unsa man ang sa kasal?', 'kung kasal?'],
  'civil.registry.followup.clerical.inquire': ['usa ra man ka letra', 'kung spelling ra?', 'bisan gamay ra nga sayop?', 'kung sayop ang ngalan?', 'sa sayop nga spelling?'],
  'civil.registry.followup.sex.inquire': ['kung gender man?', 'ang sa gender pila?', 'kung sayop ang gender?', 'gender pud?', 'kung kasarian man?', 'sa gender man?'],
  'civil.registry.followup.requirements.inquire': ['unsa man ang requirements?', 'unsay dad-on?', 'unsa may kinahanglan?', 'unsa pa ang kinahanglan?', 'unsa mga papeles?'],
};

const withBisaya = (name, phrases) => [...phrases, ...(BISAYA_PHRASES[name] || [])];

export const CIVIL_INTENTS = [
  ...MAIN_INTENTS.map(({ name, answer, phrases }) => ({ name, phrases: withBisaya(name, phrases), outputContexts: [CIVIL_CONTEXT], ...ANSWERS[answer] })),
  // A follow-up's own text is never shown (it is resolved first), but the agent needs one.
  ...FOLLOWUP_INTENTS.map(({ name, answer, phrases }) => ({
    name,
    phrases: withBisaya(name, phrases),
    inputContexts: [CIVIL_CONTEXT],
    outputContexts: [CIVIL_CONTEXT],
    ...ANSWERS[answer],
  })),
];

const MARRIAGE_INTENTS = new Set([
  'civil.registry.marriage.license.inquire', 'marriage.main.en', 'marriage.main.ceb', 'civil.registry.marriage.fee.inquire',
]);
const LATE_BIRTH_INTENTS = new Set(['civil.registry.birth.late.inquire', 'latereg.main.en', 'latereg.main.ceb', 'civil.registry.birth.new.inquire']);

/** True for every intent about the civil registry, code-built or from the console. */
export const isCivilIntent = (intent = '') =>
  intent.startsWith('civil.registry.') || intent.startsWith('marriage.main') || intent.startsWith('latereg.main');

/** The fee answer for whatever the previous civil registry answer was about. */
export function civilFeeIntentFor(lastIntent = '') {
  if (MARRIAGE_INTENTS.has(lastIntent)) return 'civil.registry.marriage.fee.inquire';
  if (['civil.registry.death.fee.inquire', 'civil.registry.correction.clerical.inquire', 'civil.registry.correction.sex.inquire'].includes(lastIntent)) {
    return lastIntent;
  }
  return 'civil.registry.fees.inquire';
}

/** The requirements answer for the previous topic; the LCRO checklists live in responses.js. */
export function civilRequirementsIntentFor(lastIntent = '') {
  if (MARRIAGE_INTENTS.has(lastIntent)) return 'civil.registry.marriage.license.inquire';
  if (LATE_BIRTH_INTENTS.has(lastIntent)) return 'civil.registry.birth.late.inquire';
  // Corrections: the LCRO gave no checklist; their answers already say to ask it.
  if (lastIntent.startsWith('civil.registry.correction.')) return lastIntent;
  return 'civil.registry.inquire';
}

const FIXED_TARGET = {
  'civil.registry.followup.death.inquire': 'civil.registry.death.fee.inquire',
  'civil.registry.followup.marriage.inquire': 'civil.registry.marriage.fee.inquire',
  'civil.registry.followup.clerical.inquire': 'civil.registry.correction.clerical.inquire',
  'civil.registry.followup.sex.inquire': 'civil.registry.correction.sex.inquire',
};

/**
 * Turns a civil registry follow-up intent into the intent whose answer it asks for.
 * @param {string} intent - final intent for this turn
 * @param {string} [lastIntent] - the session's previous final intent
 * @returns {string}
 */
export function resolveCivilFollowup(intent, lastIntent = '') {
  if (intent === 'civil.registry.followup.fees.inquire') return civilFeeIntentFor(lastIntent);
  if (intent === 'civil.registry.followup.requirements.inquire') return civilRequirementsIntentFor(lastIntent);
  return FIXED_TARGET[intent] || intent;
}

/** Intent → { english, bisaya }, in the shape responses.js's INTENT_RESPONSES uses. */
export const CIVIL_RESPONSES = Object.fromEntries(MAIN_INTENTS.map(({ name, answer }) => [name, ANSWERS[answer]]));
