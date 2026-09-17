// server/services/responses.js

export const INTENT_RESPONSES = {
  'Welcome': {
    english: 'Maayong adlaw! Welcome to Magallanes, Agusan del Norte Public Assistance Desk. How can I help you today? You can ask about business permits, clearances, civil registry, health services, or office hours.',
    bisaya: 'Maayong adlaw! Maayong pag-abot sa Magallanes, Agusan del Norte Public Assistance Desk. Unsa may akong ikatabang nimo karon? Makapangutana ka bahin sa business permit, barangay clearance, health services, o oras sa opisina.'
  },
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
  'clearance.barangay.inquire': {
    english: 'To get a Barangay Clearance, visit the Barangay Hall where your residence or business is located. Bring a valid ID and community tax certificate (Cedula).',
    bisaya: 'Para makakuha og Barangay Clearance, adto sa Barangay Hall kung asa nahimutang ang imong balay o negosyo. Pagdala og valid ID ug Cedula (Community Tax Certificate).'
  },
  'civil.registry.inquire': {
    english: 'For Civil Registry services (Birth Certificate, Marriage Certificate, Death Certificate), visit the Local Civil Registrar (LCR) office at the Municipal Hall with your supporting documents.',
    bisaya: 'Para sa mga serbisyo sa Civil Registry (Birth Certificate, Marriage Certificate, Death Certificate), bisitaha ang opisina sa Local Civil Registrar (LCR) sa Munisipyo uban sa imong mga dokumento.'
  },
  'Feedback': {
    english: "Sorry, I don't understand your question. I only answer questions about LGU services such as permits, civil registry, health services, and office hours.",
    bisaya: 'Pasensya, wala nako masabti ang imong pangutana. Motubag ra ako sa mga pangutana bahin sa mga serbisyo sa LGU sama sa business permits, civil registry, health services, ug oras sa opisina.'
  },
  'Default Fallback Intent': {
    english: "I'm sorry, I didn't quite catch that. Could you please rephrase your question about our municipal services?",
    bisaya: 'Pasensya, wala kaayo nako nakuha. Palihug usba o klaroha ang imong pangutana bahin sa mga serbisyo sa atong munisipyo.'
  }
};

/**
 * Get response by intent and language
 * @param {string} intentName
 * @param {'bisaya' | 'english'} language
 * @param {string} [dfFulfillmentText] - Optional fallback from Dialogflow
 * @returns {string}
 */
export function getResponse(intentName, language = 'english', dfFulfillmentText = '') {
  const entry = INTENT_RESPONSES[intentName];

  if (entry) {
    if (language === 'bisaya' && entry.bisaya) {
      return entry.bisaya;
    }
    if (language === 'english' && entry.english) {
      return entry.english;
    }
    return entry.bisaya || entry.english;
  }

  // Fallback to Dialogflow's fulfillment text if available, or default message
  if (dfFulfillmentText && dfFulfillmentText.trim()) {
    return dfFulfillmentText;
  }

  return language === 'bisaya'
    ? 'Pasensya, wala pa koy tubag para ana karon. Palihug mobisita sa atong Munisipyo.'
    : "Sorry, I don't have an answer for that yet. Please visit the Municipal Hall for assistance.";
}
