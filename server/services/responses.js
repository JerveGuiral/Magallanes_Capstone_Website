// server/services/responses.js
import { OFFICIALS_RESPONSES } from './officials.js';
import { GENERAL_RESPONSES } from './generalInfo.js';
import { BUSINESS_RESPONSES } from './businessPermit.js';
import {
  CIVIL_RESPONSES,
  LATE_BIRTH_EN,
  LATE_BIRTH_CEB,
  MARRIAGE_LICENSE_EN,
  MARRIAGE_LICENSE_CEB,
} from './civilRegistry.js';

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

  // Business permits (BPLO checklist + the October 2026 LGU interview) — from businessPermit.js.
  ...BUSINESS_RESPONSES,

  // Civil registry fees and corrections (October 2026 LCRO interview) — from civilRegistry.js.
  ...CIVIL_RESPONSES,

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
  // Intents built from code (officials.js, generalInfo.js, businessPermit.js, civilRegistry.js):
  // the code is their source of truth, so a wording change goes live on restart instead of
  // waiting for a ZIP re-import.
  ...Object.keys(OFFICIALS_RESPONSES),
  ...Object.keys(GENERAL_RESPONSES),
  ...Object.keys(BUSINESS_RESPONSES),
  ...Object.keys(CIVIL_RESPONSES),
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
