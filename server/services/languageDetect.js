// server/services/languageDetect.js
import { isOfficialsIntent } from './officials.js';

// "Who is…" questions are about people, not services. The topic rewrites and rescue rules
// below key off service words ("LCR", "cedula", "business permit"), which also appear in
// office names — "Kinsa ang head sa LCR?" and "LCRO head" must reach the officials intents
// untouched.
const ASKS_WHO = /\b(kinsa|kinsay|who|sino|name|ngalan|head|hepe|nangulo|in-charge)\b/i;

// Words that only occur in Bisaya — one of these is enough to call the message Bisaya.
// `kanus` is the first half of "kanus-a", which the hyphen-to-space cleanup splits in two.
export const BISAYA_MARKERS = new Set([
  'unsa', 'unsay', 'unsaon', 'asa', 'diin', 'pila', 'kanus', 'kanusa', 'kinahanglan', 'kinahanglanon',
  'palihug', 'salamat', 'wala', 'naa', 'dili', 'buhaton', 'kinsay', 'nangulo', 'ngalan',
  'nako', 'nimo', 'akong', 'imong', 'iyang', 'kadugay', 'tagpila', 'moadto',
  'mangutana', 'mangayo', 'bayronon', 'bayad', 'adlaw', 'maayong', 'opisina',
  'gyud', 'jud', 'lagi', 'diha', 'bisan', 'ug', 'og', 'nganong', 'kinsa',
  'kuha', 'mokuha', 'pagkuha', 'makakuha', 'kuhaon', 'adto',
  'negosyo', 'balay', 'lungsod', 'munisipyo', 'tabang', 'buntag', 'hapon', 'gabii',
  'sab', 'sad', 'pud', 'karon', 'kumusta', 'musta', 'kana', 'unya', 'siyay',
  'babay', 'amping', 'piyesta', 'simbahan', 'kasaysayan', 'nindot', 'kasabot', 'kahibalo', 'tawo',
  'maayo', 'baroto'
]);

// Words Bisaya uses constantly but that are also English ("way", "man", "tag", "para"), office
// acronyms ("mao" — the Municipal Agriculture Office), or shared with Tagalog ("sa", "ko",
// "kung"). Treating any one of them as proof sent English
// questions like "Which way is the municipal hall?" a Bisaya reply, so they only count once a
// second marker backs them up.
export const AMBIGUOUS_MARKERS = new Set([
  'way', 'man', 'di', 'ba', 'tag', 'para', 'sa', 'kung', 'pwede', 'taga',
  'ko', 'mag', 'nga', 'ni', 'kay', 'gusto', 'ang', 'kapitan', 'mao', 'mga', 'bise', 'niya', 'siya',
  'ra', 'ka', 'sige', 'kamusta'
]);

// Everyday English function words. A short message containing one is English on its own
// terms, so it must not inherit Bisaya from the previous turn ("how are you" after a Bisaya
// question was getting a Bisaya reply). Messages with none — "Sa Guiasan?", "Ok", a bare
// place name — still follow the conversation's language.
const ENGLISH_MARKERS = new Set([
  'how', 'what', 'where', 'when', 'who', 'why', 'which', 'is', 'are', 'am', 'was', 'you', 'your',
  'i', 'me', 'my', 'we', 'the', 'a', 'an', 'of', 'for', 'to', 'and', 'about', 'do', 'does', 'can',
  'please', 'thanks', 'thank', 'hello', 'hi', 'hey', 'bye', 'goodbye', 'much', 'long', 'there',
  'this', 'that', 'it', 'yes', 'no', 'good', 'morning', 'afternoon', 'evening', 'night',
]);

/** True when the text contains at least one everyday English word. */
export function hasEnglishWords(text) {
  if (!text || typeof text !== 'string') return false;
  return text
    .toLowerCase()
    .replace(/[?!,.;:()"'`-]/g, ' ')
    .split(/\s+/)
    .some((w) => ENGLISH_MARKERS.has(w));
}

/**
 * Returns 'bisaya' or 'english' based on keyword marker overlap.
 * One unambiguous marker, or two ambiguous ones, makes it Bisaya; otherwise English.
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

  // Handle common phrases like "tag pila", "maayong adlaw"
  if (/\b(tag\s*pila|maayong\s*(adlaw|buntag|hapon|gabii)|unsa\s*kadugay|asa\s*dapit)\b/i.test(cleaned)) {
    return 'bisaya';
  }

  let strong = 0;
  let ambiguous = 0;
  for (const word of words) {
    if (BISAYA_MARKERS.has(word)) strong++;
    else if (AMBIGUOUS_MARKERS.has(word)) ambiguous++;
  }

  if (strong >= 1 || ambiguous >= 2) {
    return 'bisaya';
  }

  return 'english';
}

/**
 * Normalizes Bisaya queries into standard English equivalents for Dialogflow's NLU model,
 * preserving context and enabling accurate follow-up intent matching.
 * @param {string} text
 * @param {{ lastIntent?: string }} [options]
 * @returns {string}
 */
export function normalizeBisayaQuery(text, { lastIntent = '' } = {}) {
  if (!text || typeof text !== 'string') return text;

  const q = text.toLowerCase().trim();

  if (ASKS_WHO.test(q)) return text;

  // A short follow-up in an officials thread ("How about the LCR?") names an office, not a
  // service — leave it for the agent's follow-up intents.
  if (isOfficialsIntent(lastIntent) && q.split(/\s+/).length <= 6) return text;

  // 1. Follow-up Fee Questions ("tag pila sab?", "tagpila?", "pila ang bayad?") — not boat fares
  // or entrance fees, which the tourism intents answer from the original wording.
  if (/\b(tag\s*pila|pila\s*(ang\s*)?bayad|bayronon|tagpila)\b/i.test(q) && !/\b(baroto|boat|tour|entrance)\b/i.test(q)) {
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
    // Asking where the town hall itself is, not where to file something.
    if (/\b(munisipyo|municipal\s*hall|town\s*hall|lgu)\b/i.test(q)) {
      return 'Where is the municipal hall?';
    }
    // Any other named place ("Asa dapit ang Magellan Shrine?") — leave it for the agent.
    if (!/\b(opisina|office|apply)\b/i.test(q)) {
      return text;
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

  // 6. Barangay Clearance — a cedula is required *for* a barangay clearance, so a question that
  // names both is about the clearance; the cedula on its own is checked next.
  if (/\b(barangay\s*clearance|brgy\s*clearance|clearance\s*sa\s*barangay|residency)\b/i.test(q)) {
    return 'How to get barangay clearance?';
  }

  // 6b. Cedula — issued by the Municipal Treasurer's Office, not the barangay
  if (/\b(cedula|ctc|community\s*tax)\b/i.test(q)) {
    return 'How do I get a community tax certificate (cedula)?';
  }

  // 7. Civil Registry — the two LCRO checklists first, so the generic rule below doesn't
  // rewrite a specific late-registration or marriage-licence question into a vague one.
  if (/\b(late\s*registration|late\s*reg|delayed\s*registration|delayed\s*birth)\b/i.test(q)) {
    return 'What are the requirements for late registration of birth?';
  }
  if (/\b(marriage\s*licen[cs]e|cenomar)\b/i.test(q)) {
    return 'What are the requirements for a marriage license?';
  }
  if (/\b((birth|marriage|death)\s*cert(ificate)?s?|civil\s*registry|lcro?|rehistro|kasal|katawo)\b/i.test(q)) {
    return 'How to request civil registry documents?';
  }

  // 8. Greetings — only a bare greeting. "Kumusta ka?" is small talk, and "Maayong buntag, unsa
  // ang requirements…?" carries a real question that rewriting would throw away.
  if (/^(maayong\s*(adlaw|buntag|hapon|gabii)|kumusta|musta)[\s!.,?]*$/i.test(q)) {
    return 'Hello good day';
  }

  return text;
}

// Agent intents that match a question's *shape* rather than its subject — they deliberately
// catch short, topicless phrasings like "how much". Because they score highly on exactly the
// follow-ups the context rules are meant to resolve, they are never treated as a confident
// classification; they still win if no rule below recognises the topic either.
const NON_SPECIFIC_INTENTS = new Set(['vague.question.en', 'vague.question.ceb']);

// Below this, an agent match is a guess. A citizen test run showed the agent's catch-all-ish
// intents (marriage licence, late registration) winning unrelated questions at 0.3–0.69 — a
// senior citizen ID question got the business permit checklist — so a weak match is only
// used when a keyword rule below confirms the topic; otherwise the bot says it doesn't know.
const MIN_CONFIDENCE = 0.7;

// Officials intents are trained on office *titles*, so they also attract service questions
// that merely contain one: "Where is the health center?", "What is a mayor's permit?",
// "where to get brgy clearance". A question naming a service and not asking who is not
// about a person.
const SERVICE_WORDS = /\b(clearance|permit|certificates?|budget|schedules?|cent(er|re)|fees?|tax|bayad|requirements?|apply|licen[cs]e|franchise|report|jobs?|openings?|hiring|scholarships?|assistance|programs?|vaccines?|bakuna|check-?up|hotline|number|open)\b/i;

// Office-hours answers need a time cue. Without one the intent was answering "Are there job
// openings in the municipality?" — "openings" is close enough to "open" for the agent.
const HOURS_CUE = /\b(time|oras|open|abri|bukas|close|sira|magsira|hours?|schedule|iskedyul|monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miyerkules|huwebes|biyernes|sabado|domingo|today|karon|lunch|days?|kanus)\b/i;

// The "ok / I see / nice" acknowledgement intent is trained on one- and two-word replies, so it
// also grabs longer questions that contain one of them ("Where can I see the bidding
// opportunities?"). Real acknowledgements are short.
const ACK_MAX_WORDS = 4;

// Words that make a question about people even without "who", so an officials match on them
// is kept at any confidence (provided no SERVICE_WORDS appear).
const PERSON_WORDS = /\b(captains?|kapitan|chairman|chairmen|punong|mayors?|alkalde|konsehal|councilors?|sangguniang|sb|officials?|opisyal|directory|heads|email|contact|pagkontak|members?)\b/i;

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

  // 1. Greetings (Bisaya & English) — unless the agent confidently matched something more
  // specific ("Kumusta ka?" is small talk, "Hi, who is the mayor?" is a question), or the
  // message is long: "Good morning, I would like to ask about the requirements for…" opens
  // politely but is a question, and the rules below should get to read it.
  const confidentMatch =
    currentIntent &&
    currentIntent !== 'Default Fallback Intent' &&
    !NON_SPECIFIC_INTENTS.has(currentIntent) &&
    confidence >= MIN_CONFIDENCE;
  const shortMessage = q.split(/\s+/).length <= 6;
  if (!confidentMatch && shortMessage && /^(maayong\s+(adlaw|buntag|hapon|gabii)|kumusta|musta|hello|hi|good\s+(morning|afternoon|evening|day)|hey)\b/i.test(q)) {
    return 'Welcome';
  }

  // A "who is…" question the agent sent to an officials intent stays there even at low
  // confidence — the service rules below would otherwise steal "Who is the LCR?" for the
  // civil-registry answer. Follow-up intents only match while their context is alive, so the
  // agent choosing one already means the thread is about officials.
  if (isOfficialsIntent(currentIntent) && (ASKS_WHO.test(q) || currentIntent.includes('.followup.'))) {
    return currentIntent;
  }
  if (
    (currentIntent === 'office.hours.inquire' && !HOURS_CUE.test(q)) ||
    (currentIntent === 'smalltalk.acknowledge' && q.split(/\s+/).length > ACK_MAX_WORDS)
  ) {
    currentIntent = 'Default Fallback Intent';
  }

  if (isOfficialsIntent(currentIntent)) {
    if (SERVICE_WORDS.test(q)) {
      currentIntent = 'Default Fallback Intent';
    } else if (PERSON_WORDS.test(q)) {
      // "Kapitan sa Buhang", "List of SB members" — about people without saying "who".
      return currentIntent;
    }
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
    confidence >= MIN_CONFIDENCE
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

  // 6. Barangay Clearance, then the cedula on its own (see normalizeBisayaQuery for why the
  // clearance wins when a question names both)
  if (/\b(barangay\s*clearance|clearance\s*sa\s*barangay|residency|brgy\s*clearance)\b/i.test(q)) {
    return 'clearance.barangay.inquire';
  }
  if (/\b(cedula|ctc|community\s*tax)\b/i.test(q)) {
    return 'ctc.cedula.inquire';
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

  if (/\b((birth|marriage|death)\s*cert(ificate)?s?|civil\s*registry|lcro?|rehistro|kasal|katawo|patay)\b/i.test(q)) {
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

  // Context heuristic for bare follow-ups ("where?", "pila?") in a business permit thread. Runs
  // before the catch-all intents are trusted, because those match exactly these topicless
  // phrasings and would otherwise answer "where?" with "your question is unclear".
  // The thread must predate this turn: a weak business-permit guess on *this* message emits the
  // same context, and "Is the municipal hall open on Saturday?" then read as "where is the BPLO".
  const businessThread = lastIntent.startsWith('permit.business') || (hasBusinessContext && !currentIntent.startsWith('permit.business'));
  if (businessThread && (NON_SPECIFIC_INTENTS.has(currentIntent) || confidence < MIN_CONFIDENCE)) {
    if (/\b(pila|bayad|tag|cost|much)\b/i.test(q)) return 'permit.business.fees.inquire';
    if (/\b(adlaw|dugay|time|long|when)\b/i.test(q)) return 'permit.business.process.inquire';
    if (/\b(asa|where|office|hall)\b/i.test(q)) return 'permit.business.location.inquire';
  }

  // No rule recognised the topic: keep the agent's answer only if it was confident. The
  // catch-all intents are kept too — their reply already says "please be more specific".
  if (
    currentIntent &&
    currentIntent !== 'Default Fallback Intent' &&
    (NON_SPECIFIC_INTENTS.has(currentIntent) || confidence >= MIN_CONFIDENCE)
  ) {
    return currentIntent;
  }

  return 'Default Fallback Intent';
}
