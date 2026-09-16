// server/services/languageDetect.js

export const BISAYA_MARKERS = new Set([
  'unsa', 'unsaon', 'asa', 'pila', 'kanus-a', 'kinahanglan', 'kinahanglanon',
  'palihug', 'salamat', 'wala', 'way', 'naa', 'dili', 'di', 'mao', 'buhaton',
  'nako', 'nimo', 'akong', 'imong', 'iyang', 'kadugay', 'tagpila', 'tag', 'moadto',
  'mangutana', 'bayronon', 'bayad', 'adlaw', 'maayong', 'opisina', 'kung',
  'pwede', 'ba', 'man', 'gyud', 'jud', 'lagi', 'diha', 'bisan', 'para', 'sa',
  'ug', 'nganong', 'kinsa', 'taga', 'kuha', 'mokuha', 'pagkuha', 'adto',
  'negosyo', 'balay', 'lungsod', 'munisipyo', 'tabang', 'buntag', 'hapon', 'gabii',
  'sab', 'sad', 'pud', 'karon'
]);

/**
 * Returns 'bisaya' or 'english' based on keyword marker overlap.
 * Defaults to 'english' if uncertain or no strong Bisaya markers found.
 * @param {string} text
 * @returns {'bisaya' | 'english'}
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'english';

  const cleaned = text
    .toLowerCase()
    .replace(/[?!,.;:()"'`-]/g, ' ')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);

  let matchCount = 0;
  for (const word of words) {
    if (BISAYA_MARKERS.has(word)) {
      matchCount++;
    }
  }

  // Handle common phrases like "tag pila", "maayong adlaw"
  if (/\b(tag\s*pila|maayong\s*(adlaw|buntag|hapon|gabii)|unsa\s*kadugay|asa\s*dapit)\b/i.test(cleaned)) {
    return 'bisaya';
  }

  if (matchCount >= 1) {
    return 'bisaya';
  }

  return 'english';
}

/**
 * Normalizes Bisaya queries into standard English equivalents for Dialogflow's NLU model,
 * preserving context and enabling accurate follow-up intent matching.
 * @param {string} text
 * @returns {string}
 */
export function normalizeBisayaQuery(text) {
  if (!text || typeof text !== 'string') return text;

  const q = text.toLowerCase().trim();

  // 1. Follow-up Fee Questions ("tag pila sab?", "tagpila?", "pila ang bayad?")
  if (/\b(tag\s*pila|pila\s*(ang\s*)?bayad|bayronon|tagpila)\b/i.test(q)) {
    if (/\b(business|permit|negosyo)\b/i.test(q)) {
      return 'How much are the business permit fees?';
    }
    return 'how much are the fees?';
  }

  // 2. Follow-up Duration ("unsa kadugay sab?", "pila ka adlaw makuha?")
  if (/\b(unsa\s*kadugay|pila\s*ka\s*adlaw|kadugayon)\b/i.test(q)) {
    if (/\b(business|permit|negosyo)\b/i.test(q)) {
      return 'How long does it take to process a business permit?';
    }
    return 'how long is the processing time?';
  }

  // 3. Location / Office ("asa dapit ang munisipyo?", "asa moadto?", "asa mag apply?")
  if (/\b(asa\s*(dapit|man\s*dapit|moadto|mag\s*apply|ang\s*opisina|ang\s*munisipyo))\b/i.test(q)) {
    if (/\b(business|permit|negosyo)\b/i.test(q)) {
      return 'Where is the office located to apply for business permit?';
    }
    return 'where is the office located to apply?';
  }

  // 4. Renewal
  if (/\b(unsaon\s*pag\s*renew|renew|renewal|i-renew)\b/i.test(q)) {
    return 'How do I renew a business permit?';
  }

  // 5. New Business Permit Requirements
  if (/\b(unsa\s*(akong\s*)?kinahanglan|kinahanglanon|unsaon\s*pag\s*apply)\b/i.test(q) && /\b(business|permit|negosyo)\b/i.test(q)) {
    return 'What do I need for a new business permit?';
  }

  // 6. Barangay Clearance
  if (/\b(barangay\s*clearance|clearance\s*sa\s*barangay|cedula|residency)\b/i.test(q)) {
    return 'How to get barangay clearance?';
  }

  // 7. Civil Registry (Birth, Marriage, Death certificates)
  if (/\b(birth\s*cert|marriage\s*cert|death\s*cert|civil\s*registry|lcr|rehistro|kasal|katawo)\b/i.test(q)) {
    return 'How to request civil registry documents?';
  }

  // 8. Greetings
  if (/^(maayong\s*(adlaw|buntag|hapon|gabii)|kumusta|musta)\b/i.test(q)) {
    return 'Hello good day';
  }

  return text;
}

/**
 * Refines intent detection using semantic rules and active conversation session contexts.
 * @param {string} query
 * @param {string} currentIntent
 * @param {string[]} [activeContexts]
 * @returns {string}
 */
export function refineIntent(query, currentIntent = 'Default Fallback Intent', activeContexts = []) {
  if (!query || typeof query !== 'string') return currentIntent;

  const q = query.toLowerCase().trim();
  const contextNames = (activeContexts || []).map((c) => (typeof c === 'string' ? c : c.name || '')).join(' ').toLowerCase();
  const hasBusinessContext = contextNames.includes('business-permit') || contextNames.includes('permit');

  // 1. Greetings (Bisaya & English)
  if (/^(maayong\s+(adlaw|buntag|hapon|gabii)|kumusta|musta|hello|hi|good\s+(morning|afternoon|evening|day)|hey)\b/i.test(q)) {
    return 'Welcome';
  }

  // 2. Fees & Payments ("tag pila sab?", "tagpila?", "how much?", "fees")
  if (/\b(tag\s*pila|tagpila|pila\s*(ang\s*)?(bayranon|bayad)|bayronon|bayad|how\s*much|fee|fees|cost|rates|price|assessment)\b/i.test(q)) {
    if (/(permit|negosyo|business)/i.test(q) || currentIntent.startsWith('permit.business') || hasBusinessContext) {
      return 'permit.business.fees.inquire';
    }
  }

  // 3. Processing Time & Turnaround ("unsa kadugay sab?", "pila ka adlaw?", "how long?")
  if (/\b(pila\s*ka\s*adlaw|kadugay|kadugayon|unsa\s*kadugay|how\s*long|processing\s*time|turnaround|schedule|pila\s*ka\s*oras|days)\b/i.test(q)) {
    if (/(permit|negosyo|business)/i.test(q) || currentIntent.startsWith('permit.business') || hasBusinessContext) {
      return 'permit.business.process.inquire';
    }
  }

  // 4. Renewal ("unsaon pag renew?", "how to renew?")
  if (/\b(renew|renewal|pag\s*renew|i-renew|irenew)\b/i.test(q)) {
    return 'permit.business.renew.inquire';
  }

  // 5. Office Location / Where to Apply ("asa dapit?", "where to apply?", "asa moadto?")
  if (/\b(asa\s*dapit|asa\s*ang\s*opisina|asa\s*mag\s*apply|asa\s*moadto|where\s*is\s*(the\s*)?office|where\s*to\s*apply|location|bplo\s*location|asa\s*ang\s*munisipyo)\b/i.test(q)) {
    if (/(permit|negosyo|business)/i.test(q) || currentIntent.startsWith('permit.business') || hasBusinessContext) {
      return 'permit.business.location.inquire';
    }
  }

  // 6. Barangay Clearance
  if (/\b(barangay\s*clearance|clearance\s*sa\s*barangay|cedula|residency|brgy\s*clearance)\b/i.test(q)) {
    return 'clearance.barangay.inquire';
  }

  // 7. Civil Registry
  if (/\b(birth\s*cert|marriage\s*cert|death\s*cert|civil\s*registry|lcr|rehistro|kasal|katawo|patay)\b/i.test(q)) {
    return 'civil.registry.inquire';
  }

  // 8. New Permit / Requirements
  if (/\b(unsa\s*(akong\s*)?kinahanglan|kinahanglanon|unsaon\s*pag\s*apply|requirements|new\s*permit|bag-ong\s*permit|bag-o\s*nga\s*permit|business\s*permit)\b/i.test(q)) {
    return 'permit.business.new.inquire';
  }

  // If Dialogflow returned a valid non-fallback intent, preserve it
  if (currentIntent && currentIntent !== 'Default Fallback Intent') {
    return currentIntent;
  }

  // Fallback heuristic based on context
  if (hasBusinessContext) {
    if (/\b(pila|bayad|tag|cost|much)\b/i.test(q)) return 'permit.business.fees.inquire';
    if (/\b(adlaw|dugay|time|long|when)\b/i.test(q)) return 'permit.business.process.inquire';
    if (/\b(asa|where|office|hall)\b/i.test(q)) return 'permit.business.location.inquire';
  }

  return currentIntent;
}
