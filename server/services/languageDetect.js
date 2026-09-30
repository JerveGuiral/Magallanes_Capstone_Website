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

// Agent intents that match a question's *shape* rather than its subject — they deliberately
// catch short, topicless phrasings like "how much". Because they score highly on exactly the
// follow-ups the context rules are meant to resolve, they are never treated as a confident
// classification; they still win if no rule below recognises the topic either.
const NON_SPECIFIC_INTENTS = new Set(['vague.question.en', 'vague.question.ceb']);

/**
 * Refines intent detection using semantic rules and active conversation session contexts.
 * @param {string} query
 * @param {string} currentIntent
 * @param {string[]} [activeContexts] - Dialogflow output contexts for this session
 * @param {{ confidence?: number, lastIntent?: string }} [options]
 * @returns {string}
 */
export function refineIntent(query, currentIntent = 'Default Fallback Intent', activeContexts = [], options = {}) {
  if (!query || typeof query !== 'string') return currentIntent;

  const { confidence = 0, lastIntent = '' } = options;
  const q = query.toLowerCase().trim();

  // Compare against the bare context id ("business-permit-followup"), not the full session path
  // Dialogflow returns. Matching loose substrings here previously meant the *intent name* of the
  // previous turn — which the caller mixed into this list — could satisfy a context check: after
  // any `permit.business.*` answer, the string "permit" was present and every later question in
  // the session looked like it was still about business permits.
  const contextIds = (activeContexts || [])
    .map((c) => (typeof c === 'string' ? c : c.name || ''))
    .map((name) => name.split('/contexts/').pop().toLowerCase())
    .filter(Boolean);

  // A weak NLU match still emits its intent's output context, so several topic contexts can be
  // alive at once. Deciding the topic from the previous *answer* rather than from whichever
  // context happens to be present keeps a low-confidence stray match from hijacking the thread.
  const hasBusinessContext =
    contextIds.includes('business-permit-followup') ||
    contextIds.includes('business-permit') ||
    lastIntent.startsWith('permit.business');

  // 1. Greetings (Bisaya & English)
  if (/^(maayong\s+(adlaw|buntag|hapon|gabii)|kumusta|musta|hello|hi|good\s+(morning|afternoon|evening|day)|hey)\b/i.test(q)) {
    return 'Welcome';
  }

  // The rules below exist to rescue weak or missing NLU classifications. When Dialogflow has
  // already matched a specific intent with high confidence it knows better than these keyword
  // heuristics do, so leave its answer alone — otherwise a confidently-matched marriage licence
  // question still gets rewritten into a business-permit answer by the "requirements" rule.
  //
  // Catch-all intents are the exception. They match a bare "how much" with total confidence
  // while saying nothing about the topic, so trusting them would answer the commonest follow-up
  // in the bot with "your question is a bit unclear" even though the active context makes the
  // topic obvious. Let the context-aware rules below have first refusal on those.
  if (
    currentIntent &&
    currentIntent !== 'Default Fallback Intent' &&
    !NON_SPECIFIC_INTENTS.has(currentIntent) &&
    confidence >= 0.7
  ) {
    return currentIntent;
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

  // 7. Civil Registry — the LCRO has dedicated intents for late birth registration and for
  // marriage licence applications. Those must be checked before the generic civil-registry
  // rule, which is broad enough ("kasal", "birth cert") to swallow both and answer a specific
  // checklist question with the generic "visit the LCR office" reply.
  if (/\b(late\s*registration|late\s*reg|delayed\s*registration|delayed\s*birth)\b/i.test(q)) {
    return 'civil.registry.birth.late.inquire';
  }

  const mentionsMarriage = /\b(marriage\s*licen[cs]e|cenomar|kasal|magpakasal|pakasal)\b/i.test(q);
  const asksHowOrWhat = /\b(requirements?|kinahanglan|kinahanglanon|unsaon|unsa|apply|application|mag-?apply|how\s*(do|to))\b/i.test(q);
  if (mentionsMarriage && (asksHowOrWhat || /\blicen[cs]e\b/i.test(q))) {
    return 'civil.registry.marriage.license.inquire';
  }

  if (/\b(birth\s*cert|marriage\s*cert|death\s*cert|civil\s*registry|lcr|rehistro|kasal|katawo|patay)\b/i.test(q)) {
    return 'civil.registry.inquire';
  }

  // 8. New Permit / Requirements — "requirements" alone is ambiguous (business permit vs.
  // building permit vs. other permits are all asked this way), so only resolve locally when
  // the query itself, the active conversation context, or Dialogflow's own last answer tells
  // us which permit is meant. Otherwise fall through and trust Dialogflow's classification
  // instead of guessing — it already has a dedicated, better-trained intent for each one.
  const asksForRequirements = /\b(unsa\s*(akong\s*)?kinahanglan|kinahanglanon|unsaon\s*pag\s*apply|requirements|new\s*permit|bag-ong\s*permit|bag-o\s*nga\s*permit)\b/i.test(q);
  if (asksForRequirements) {
    const mentionsBuilding = /\b(building|bilding|balay|construction|pagtukod|two-storey|two\s*storey)\b/i.test(q);
    const mentionsBusiness = /\b(business|negosyo)\b/i.test(q);

    if (mentionsBuilding && !mentionsBusiness) {
      return 'permit.building.requirements.inquire';
    }
    if (mentionsBusiness || currentIntent.startsWith('permit.business') || hasBusinessContext) {
      return 'permit.business.new.inquire';
    }
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
