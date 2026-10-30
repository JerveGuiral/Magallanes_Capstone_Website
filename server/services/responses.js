// server/services/responses.js
import { OFFICIALS_RESPONSES } from './officials.js';
import { GENERAL_RESPONSES } from './generalInfo.js';
import { BUSINESS_RESPONSES } from './businessPermit.js';
import { HEALTH_RESPONSES } from './health.js';
import { PUBLIC_RESPONSES } from './publicServices.js';
import {
  CIVIL_RESPONSES,
  LATE_BIRTH_EN,
  LATE_BIRTH_CEB,
  MARRIAGE_LICENSE_EN,
  MARRIAGE_LICENSE_CEB,
} from './civilRegistry.js';

// Lists only topics the bot can actually answer (it used to offer "health services").
// Bitoy is the chatbot's mascot (src/components/Bitoy.tsx).
const WELCOME = {
  english: "Maayong adlaw! I'm Bitoy, the virtual assistant of the Magallanes, Agusan del Norte Public Assistance Desk. How can I help you today? You can ask about business permits, barangay clearance and cedula, civil registry, health services, municipal officials, office hours, or tourist spots — in English or Bisaya.",
  bisaya: 'Maayong adlaw! Ako si Bitoy, ang virtual assistant sa Magallanes, Agusan del Norte Public Assistance Desk. Unsa may akong ikatabang nimo karon? Makapangutana ka bahin sa business permit, barangay clearance ug cedula, civil registry, serbisyo sa panglawas, mga opisyal sa munisipyo, oras sa opisina, o mga tourist spot — sa English o Bisaya.'
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
    // Hours live in one place (office.hours.inquire) — the LGU's 2026 compressed work week made
    // the old "Monday to Friday, 8–5" here contradict it.
    english: "A Community Tax Certificate (Cedula) is issued by the Municipal Treasurer's Office at the Municipal Hall during office hours. Bring a valid ID. The basic tax is ₱5.00, plus ₱1.00 for every ₱1,000 of income or gross receipts (up to ₱5,000).",
    bisaya: 'Ang Community Tax Certificate (Cedula) makuha sa Municipal Treasurer\'s Office sa Munisipyo sa oras sa opisina. Pagdala og valid ID. Ang basic nga bayad kay ₱5.00, dugang ₱1.00 sa matag ₱1,000 nga kita o gross receipts (hangtod ₱5,000).'
  },
  // For a business the clearance comes only from the barangay of the business address (BPLO,
  // October 2026) — see permit.business.barangay-clearance.inquire.
  'clearance.barangay.inquire': {
    english: 'For a Barangay Clearance, go to the Barangay Hall of the barangay where you live. Bring a valid ID and your Community Tax Certificate (Cedula). If the clearance is for a business, get it from the barangay where the business is located instead.',
    bisaya: 'Para sa Barangay Clearance, adto sa Barangay Hall sa barangay diin ka nagpuyo. Pagdala og valid ID ug imong Cedula (Community Tax Certificate). Kung para sa negosyo ang clearance, sa barangay diin nahimutang ang negosyo ka mokuha.'
  },
  // Local-only intents (not in the agent): refineIntent's follow-up rule sends "how much?" after
  // a barangay clearance or building permit answer here, instead of the business permit fee.
  // No amounts are on file, so they say who sets the fee rather than guess one.
  'clearance.barangay.fee.inquire': {
    english: 'The fee for a barangay clearance is set by each barangay, so it can differ from one barangay to another. Please ask at the Barangay Hall where you will get the clearance.',
    bisaya: 'Ang bayad sa barangay clearance gitakda sa matag barangay, mao nga lahi-lahi kini. Palihug pangutana sa Barangay Hall diin ka mokuha sa clearance.'
  },
  // From the "New Schedule of Fees and Other Charges" of the Revised IRR of the National Building
  // Code (PD 1096), as published by LGUs (e.g. alaminoslaguna.com, NBC_FEES_AND_CHARGES.pdf):
  // Division A-1 building fee brackets and the IRR's own 75 m² example; line and grade; electrical
  // (connected load ≤ 5 kVA); fencing; Certificate of Use or Occupancy for A-1/A-2 by cost, with
  // cost fixed at ₱10,000/m² (Table II.G.1). The Municipal Engineer confirmed in the capstone
  // interview (Oct 2026) that fees depend on the plans and follow the Building Code.
  'permit.building.fee.inquire': {
    english: `Building permit fees follow the fee schedule of the National Building Code (PD 1096, Revised IRR), so the amount depends on your plans — mainly the use of the building, its floor area, cost and height. The Municipal Engineering Office computes the exact total.

Building fee for a single-family house, per sq. meter of floor area (the whole area is charged at its bracket's rate):
• New construction up to 20 m²: ₱2.00
• Addition/renovation up to 20 m²: ₱2.40
• Above 20 to 50 m²: ₱3.40
• Above 50 to 100 m²: ₱4.80
• Above 100 to 150 m²: ₱6.00
• Above 150 m²: ₱7.20
Example: a 75 m² house pays 75 × ₱4.80 = ₱360.

Other fees are added, for example:
• Line and grade: ₱24.00 for the first 10 m of frontage, plus ₱2.40 per extra meter
• Electrical: ₱200 for a connected load of 5 kVA or less
• Fence of masonry or concrete up to 1.80 m tall: ₱3.00 per meter
• Certificate of Occupancy: ₱100 to ₱800 depending on the computed cost (₱400 for a 75 m² house)
Plumbing and other fees depend on the fixtures and systems in your plans.`,
    bisaya: `Ang bayad sa building permit nagsunod sa fee schedule sa National Building Code (PD 1096, Revised IRR), mao nga depende kini sa imong plano — labi na sa gamit sa building, gidak-on sa salog, gasto, ug gitas-on. Ang Municipal Engineering Office ang mo-compute sa eksaktong total.

Building fee para sa balay sa usa ka pamilya, matag sq. meter sa salog (ang tibuok gidak-on bayran sa rate sa iyang bracket):
• Bag-ong tukod hangtod 20 m²: ₱2.00
• Dugang/renovation hangtod 20 m²: ₱2.40
• Labaw 20 hangtod 50 m²: ₱3.40
• Labaw 50 hangtod 100 m²: ₱4.80
• Labaw 100 hangtod 150 m²: ₱6.00
• Labaw 150 m²: ₱7.20
Pananglitan: ang balay nga 75 m² mobayad og 75 × ₱4.80 = ₱360.

Naay dugang nga bayad, pananglitan:
• Line and grade: ₱24.00 sa unang 10 m sa atubangan, dugang ₱2.40 matag sobra nga metro
• Electrical: ₱200 kung ang connected load 5 kVA o ubos pa
• Koral nga masonry o konkreto hangtod 1.80 m ang gitas-on: ₱3.00 matag metro
• Certificate of Occupancy: ₱100 hangtod ₱800 depende sa gi-compute nga gasto (₱400 para sa balay nga 75 m²)
Ang plumbing ug uban pang bayad depende sa mga fixture ug sistema sa imong plano.`
  },
  'civil.registry.inquire': {
    english: 'For civil registry services (birth, marriage and death certificates), visit the Local Civil Registry Office (LCRO) at the Municipal Hall with your supporting documents. You can ask me about registering a newborn, late registration of birth, marriage license requirements and fees, death certificate fees, or correcting an error in a birth certificate.',
    bisaya: 'Para sa mga serbisyo sa civil registry (birth, marriage ug death certificate), adto sa Local Civil Registry Office (LCRO) sa Munisipyo uban sa imong mga dokumento. Pwede ka mangutana nako bahin sa pagparehistro sa bag-ong natawo, late registration sa birth, requirements ug bayad sa marriage license, bayad sa death certificate, o pag-correct sa sayop sa birth certificate.'
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
  ...HEALTH_RESPONSES,
  ...PUBLIC_RESPONSES,

  // Feedback about the LGU's services or this assistant: where to send it (the console text
  // answered "Sorry, I don't understand your question").
  'Feedback': {
    english: "Thank you — we'd like to hear it. Send your feedback or suggestion through the Report a Concern form on this website (choose \"Other\"), or email the Mayor's Office at mayorsoffice2019.magallanesadn@gmail.com. Every submission is read by the Public Assistance Desk.",
    bisaya: "Salamat — gusto namo kini madungog. Ipadala ang imong feedback o suhestiyon pinaagi sa Report a Concern form niining website (pilia ang \"Other\"), o i-email ang Mayor's Office sa mayorsoffice2019.magallanesadn@gmail.com. Basahon sa Public Assistance Desk ang matag usa."
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
  // Corrected October 2026: the console copy of the barangay clearance answer sends businesses
  // to the owner's home barangay, and the other two offer topics the bot cannot answer.
  'clearance.barangay.inquire',
  'civil.registry.inquire',
  'Feedback',
  // The console's fallback offers only late registration and the marriage licence, half in Bisaya.
  'Default Fallback Intent',
  // Intents built from code (officials.js, generalInfo.js, businessPermit.js, civilRegistry.js):
  // the code is their source of truth, so a wording change goes live on restart instead of
  // waiting for a ZIP re-import.
  ...Object.keys(OFFICIALS_RESPONSES),
  ...Object.keys(GENERAL_RESPONSES),
  ...Object.keys(BUSINESS_RESPONSES),
  ...Object.keys(CIVIL_RESPONSES),
  ...Object.keys(HEALTH_RESPONSES),
  ...Object.keys(PUBLIC_RESPONSES),
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
