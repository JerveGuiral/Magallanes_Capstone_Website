// server/services/responses.js
import { OFFICIALS_RESPONSES } from './officials.js';
import { GENERAL_RESPONSES } from './generalInfo.js';

// Transcribed verbatim from the Local Civil Registry Office's printed checklists, including the
// office's own wording and numbering. Kept as constants so the several Dialogflow intents that
// cover each topic can share one authoritative copy.
const LATE_BIRTH_EN = `LATE REGISTRATION OF BIRTH CERTIFICATE
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

const LATE_BIRTH_CEB = `Mao kini ang mga requirements para sa Late Registration of Birth Certificate sa Local Civil Registry Office (LCRO) sa Magallanes:
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

const MARRIAGE_LICENSE_EN = `REQUIREMENTS FOR APPLICATION FOR MARRIAGE LICENCE: (both groom & bride)

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

const MARRIAGE_LICENSE_CEB = `Mao kini ang mga requirements sa pag-apply og Marriage License (para sa LALAKI ug BABAYE):
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

// Lists only topics the bot can actually answer (it used to offer "health services").
const WELCOME = {
  english: 'Maayong adlaw! Welcome to the Magallanes, Agusan del Norte Public Assistance Desk. How can I help you today? You can ask about business permits, barangay clearance and cedula, civil registry, municipal officials, office hours, or tourist spots — in English or Bisaya.',
  bisaya: 'Maayong adlaw! Maayong pag-abot sa Magallanes, Agusan del Norte Public Assistance Desk. Unsa may akong ikatabang nimo karon? Makapangutana ka bahin sa business permit, barangay clearance ug cedula, civil registry, mga opisyal sa munisipyo, oras sa opisina, o mga tourist spot — sa English o Bisaya.'
};

export const INTENT_RESPONSES = {
  'Welcome': WELCOME,
  // Dialogflow's built-in welcome intent, which some greetings ("Good morning!") match instead
  // of `Welcome`. Same answer, so Bisaya speakers get the Bisaya greeting either way.
  'Default Welcome Intent': WELCOME,
  'permit.business.new.inquire': {
    english: "For a new business permit, you'll generally need: (1) DTI or SEC registration, (2) Barangay Clearance, (3) a valid government ID, (4) Locational/Zoning Clearance, (5) Fire Safety Inspection Certificate, (6) Sanitary Permit, and (7) Proof of address or lease contract. You can ask about the fees, processing time, or where to apply next.",
    bisaya: 'Para sa bag-ong business permit, kinahanglan nimo: (1) DTI o SEC registration, (2) Barangay Clearance, (3) valid ID, (4) Locational/Zoning Clearance, (5) Fire Safety Inspection Certificate, (6) Sanitary Permit, ug (7) proof sa address o lease contract. Makapangutana ka bahin sa bayronon, kadugayon sa proseso, o asa mag-apply.'
  },
  'permit.business.fees.inquire': {
    english: 'Fees are based on your business type, capital investment, or gross receipts — the Business Permits and Licensing Office (BPLO) at the Municipal Hall will provide the exact assessment.',
    bisaya: 'Ang bayad depende sa klase sa negosyo, kapital, o gross receipts — ang Business Permits and Licensing Office (BPLO) sa Munisipyo ang maghatag sa eksaktong assessment.'
  },
  'permit.business.process.inquire': {
    english: 'Processing a business permit typically takes 1 to 3 working days once all required documents, inspections, and clearances are submitted.',
    bisaya: 'Ang pagproseso sa business permit kasagarang molungtad og 1 hangtod 3 ka adlaw kung kompleto na ang tanang gikinahanglan nga dokumento ug clearance.'
  },
  'permit.business.location.inquire': {
    english: 'You can submit your application at the Business Permits and Licensing Office (BPLO) located on the Ground Floor of the Magallanes Municipal Hall, open Monday to Friday, 8:00 AM to 5:00 PM.',
    bisaya: 'Mahimo nimong isumite ang imong aplikasyon sa Business Permits and Licensing Office (BPLO) sa Ground Floor sa Magallanes Municipal Hall, Lunes hangtod Biyernes, 8:00 AM hangtod 5:00 PM.'
  },
  'permit.business.renew.inquire': {
    english: 'For business permit renewal, please prepare: (1) Previous Year Business Permit & Official Receipts, (2) Barangay Clearance for Renewal, (3) Income Tax Return (ITR) or Financial Statements, and (4) Updated Sanitary & Fire Inspection Clearances.',
    bisaya: 'Para sa renewal sa business permit, andama palihug: (1) Daang Business Permit ug resibo, (2) Barangay Clearance for Renewal, (3) ITR o Financial Statement, ug (4) Updated Sanitary ug Fire Inspection Clearance.'
  },
  'permit.building.requirements.inquire': {
    english: "For a building permit application, you'll need: 5 copies of Building Plans (Architectural/Civil, sign & sealed); 4 copies of Electrical Diagram/Plans (sign & sealed); 5 copies of Bill of Materials for the building with estimate; 4 copies of Bill of Materials for electrical with estimate; 5 copies of a Notarized Building Application Form; 4 copies of Plumbing/Sanitary Plan (sign & sealed); 1 copy of Barangay Clearance Certificate; and 2 pieces of long brown envelopes. You can also ask me about requirements for a two-storey building, lot ownership documents, or the Certificate of Occupancy.",
    bisaya: 'Para sa building permit application, kinahanglan nimo: 5 copies sa Building Plans (Architectural/Civil, sign & sealed); 4 copies sa Electrical Diagram/Plans (sign & sealed); 5 copies sa Bill of Materials para sa building nga naay estimate; 4 copies sa Bill of Materials para sa electrical nga naay estimate; 5 copies sa Notarized Building Application Form; 4 copies sa Plumbing/Sanitary Plan (sign & sealed); 1 copy sa Barangay Clearance Certificate; ug 2 ka long brown envelope. Pwede sad ka mangutana bahin sa requirements para sa two-storey building, lot ownership documents, o Certificate of Occupancy.'
  },
  // Local-only intent (not defined in the Dialogflow agent): refineIntent routes cedula questions
  // here so they no longer get the barangay clearance answer. Rates are the
  // statutory ones (Local Government Code, Sec. 157).
  'ctc.cedula.inquire': {
    english: "A Community Tax Certificate (Cedula) is issued by the Municipal Treasurer's Office at the Municipal Hall, Monday to Friday, 8:00 AM to 5:00 PM. Bring a valid ID. The basic tax is ₱5.00, plus ₱1.00 for every ₱1,000 of income or gross receipts (up to ₱5,000).",
    bisaya: 'Ang Community Tax Certificate (Cedula) makuha sa Municipal Treasurer\'s Office sa Munisipyo, Lunes hangtod Biyernes, 8:00 AM hangtod 5:00 PM. Pagdala og valid ID. Ang basic nga bayad kay ₱5.00, dugang ₱1.00 sa matag ₱1,000 nga kita o gross receipts (hangtod ₱5,000).'
  },
  'clearance.barangay.inquire': {
    english: 'To get a Barangay Clearance, visit the Barangay Hall where your residence or business is located. Bring a valid ID and community tax certificate (Cedula).',
    bisaya: 'Para makakuha og Barangay Clearance, adto sa Barangay Hall kung asa nahimutang ang imong balay o negosyo. Pagdala og valid ID ug Cedula (Community Tax Certificate).'
  },
  'civil.registry.inquire': {
    english: 'For Civil Registry services (Birth Certificate, Marriage Certificate, Death Certificate), visit the Local Civil Registrar (LCR) office at the Municipal Hall with your supporting documents.',
    bisaya: 'Para sa mga serbisyo sa Civil Registry (Birth Certificate, Marriage Certificate, Death Certificate), bisitaha ang opisina sa Local Civil Registrar (LCR) sa Munisipyo uban sa imong mga dokumento.'
  },
  // --- Late registration of birth certificate (LCRO) ---
  // English text is transcribed verbatim from the LCRO's printed checklist; the Bisaya text is
  // the one authored in the Dialogflow console. Defined here rather than left to Dialogflow's
  // fulfillment because the agent currently has two intents covering this same topic
  // (`civil.registry.birth.late.inquire` and `latereg.main.ceb`) — keying both to one entry
  // keeps the answer identical no matter which one the NLU happens to match.
  //
  // TEMPORARY: `english` normally belongs in the Dialogflow console, but the console's copy of
  // this answer is an older paraphrase rather than the office's printed wording. Delete the
  // `english` lines in the four LCRO entries below once the console holds the verbatim text.
  'civil.registry.birth.late.inquire': {
    english: LATE_BIRTH_EN,
    bisaya: LATE_BIRTH_CEB
  },
  'latereg.main.ceb': {
    english: LATE_BIRTH_EN,
    bisaya: LATE_BIRTH_CEB
  },
  'latereg.main.en': {
    english: LATE_BIRTH_EN,
    bisaya: LATE_BIRTH_CEB
  },

  // --- Marriage licence application (LCRO) ---
  // Same duplicate-intent situation as above. `civil.registry.marriage.license.inquire` is also
  // where the birth-certificate checklist was pasted by mistake in the console, so without these
  // entries a marriage-licence question is answered with the late-registration requirements.
  'civil.registry.marriage.license.inquire': {
    english: MARRIAGE_LICENSE_EN,
    bisaya: MARRIAGE_LICENSE_CEB
  },
  'marriage.main.en': {
    english: MARRIAGE_LICENSE_EN,
    bisaya: MARRIAGE_LICENSE_CEB
  },
  'marriage.main.ceb': {
    english: MARRIAGE_LICENSE_EN,
    bisaya: MARRIAGE_LICENSE_CEB
  },

  // Officials directory (mayor, vice mayor, SB, department heads, barangay captains) —
  // generated from server/services/officials.js, which also builds the matching agent intents.
  ...OFFICIALS_RESPONSES,

  // Tourism & events, office information, small talk — generated from generalInfo.js.
  ...GENERAL_RESPONSES,

  'Feedback': {
    english: "Sorry, I don't understand your question. I only answer questions about LGU services such as permits, civil registry, health services, and office hours.",
    bisaya: 'Pasensya, wala nako masabti ang imong pangutana. Motubag ra ako sa mga pangutana bahin sa mga serbisyo sa LGU sama sa business permits, civil registry, health services, ug oras sa opisina.'
  },
  'Default Fallback Intent': {
    english: "I'm sorry, I didn't quite catch that. Could you please rephrase your question about our municipal services?",
    bisaya: 'Pasensya, wala kaayo nako nakuha. Palihug usba o klaroha ang imong pangutana bahin sa mga serbisyo sa atong munisipyo.'
  }
};

// Intents whose English wording stays under code control instead of the Dialogflow console's.
// Two groups: the LCRO entries, whose console copy is known to be wrong (an older paraphrase of
// the checklists, and `civil.registry.marriage.license.inquire` has the late-registration
// checklist pasted into it by mistake — once the console holds the office's printed wording,
// drop those names and delete their `english` lines); and every intent built from code.
const PINNED_ENGLISH = new Set([
  'civil.registry.birth.late.inquire',
  'latereg.main.ceb',
  'latereg.main.en',
  'civil.registry.marriage.license.inquire',
  'marriage.main.en',
  'marriage.main.ceb',
  // The console's welcome text still offers "health services", which the bot cannot answer.
  'Welcome',
  'Default Welcome Intent',
  // Intents built from code (officials.js, generalInfo.js): the code is their source of truth,
  // so a wording change goes live on restart instead of waiting for a ZIP re-import.
  ...Object.keys(OFFICIALS_RESPONSES),
  ...Object.keys(GENERAL_RESPONSES),
]);

/**
 * Get response by intent and language.
 *
 * English wording belongs to the Dialogflow console, so staff can reword an answer without a
 * code change; this file supplies the Bisaya translation, which the agent cannot provide because
 * the server always queries it with `languageCode: 'en'` regardless of what the citizen typed.
 * The English text kept here is the safety net for when the agent returns nothing usable.
 *
 * @param {string} intentName
 * @param {'bisaya' | 'english'} language
 * @param {string} [dfFulfillmentText] - The agent's own answer. The caller must pass this only
 *   when it actually belongs to `intentName`: when refineIntent redirects to a different intent
 *   than the one Dialogflow matched, the agent's text is about the wrong topic.
 * @returns {string}
 */
export function getResponse(intentName, language = 'english', dfFulfillmentText = '') {
  const entry = INTENT_RESPONSES[intentName];

  if (language === 'bisaya' && entry?.bisaya) {
    return entry.bisaya;
  }

  if (PINNED_ENGLISH.has(intentName) && entry?.english) {
    return entry.english;
  }

  if (dfFulfillmentText && dfFulfillmentText.trim()) {
    return dfFulfillmentText;
  }

  if (entry) {
    return entry.english || entry.bisaya;
  }

  // Fallback to Dialogflow's fulfillment text if available, or default message
  if (dfFulfillmentText && dfFulfillmentText.trim()) {
    return dfFulfillmentText;
  }

  return language === 'bisaya'
    ? 'Pasensya, wala pa koy tubag para ana karon. Palihug mobisita sa atong Munisipyo.'
    : "Sorry, I don't have an answer for that yet. Please visit the Municipal Hall for assistance.";
}
