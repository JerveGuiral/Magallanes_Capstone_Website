// server/services/languageDetect.js
import { isOfficialsIntent } from './officials.js';
import { isCivilIntent, civilFeeIntentFor, civilRequirementsIntentFor } from './civilRegistry.js';

// "Who is…" questions are about people, not services. The topic rewrites and rescue rules
// below key off service words ("LCR", "cedula", "business permit"), which also appear in
// office names — "Kinsa ang head sa LCR?" and "LCRO head" must reach the officials intents
// untouched.
const ASKS_WHO = /\b(kinsa|kinsay|who|sino|name|ngalan|head|hepe|nangulo|in-charge)\b/i;

// A question about running a business, not a personal document.
const BUSINESS_WORDS = /\b(business|negosyo|tindahan|store|shop|sari-sari|baligya|nagbaligya|magbaligya)\b/i;

// Places to stay, the public market (not a stall application) and the officials' structure.
const LODGING_WORDS = /\b(hotels?|inns?|motels?|lodg\w*|pension\s*house|resorts?|overnight|place\s*to\s*(stay|sleep)|where\s*(can|to)\s*(i|we)?\s*stay|staycation|transient|homestay|airbnb|matulog|makatulog|mopuyo\s*og\s*(usa\s*ka\s*)?gabii|kapuy-?an)\b/i;
const MARKET_WORDS = /\b(public\s*market|market|merkado|palengke|tiangge)\b/i;
const STALL_WORDS = /\b(stalls?|puesto|puwesto|pwesto|vendors?|tindera|sell\w*|\w*baligya|rent|renta|clearance|apply|meedmo|tiendas?|refilling|permit)\b/i;
const STRUCTURE_WORDS = /\b(organi[sz]ational|org\s*chart|structure|istruktura|hierarchy|organi[sz]ed|organisar|ubos\s*sa\s*mayor|under\s*the\s*mayor|pagkahan-?ay)\b/i;

// --- Follow-ups on a place or office the previous answer was about ---
// Business permits and civil registry have their own follow-up intents; these topics did not,
// so "where is it?" after the Magellan Shrine got "your question is unclear" and "how much?"
// after a barangay clearance got the business permit fee.
const FOLLOW_CONTACT = /\b(contact|number|phone|cellphone|cp|email|e-mail|tawag|call|numero|text)\b/i;
const FOLLOW_WHERE = /\b(where|asa|diin|saan|location|located|dapit|address)\b/i;
const FOLLOW_GET_THERE = /\b(get\s*there|go\s*there|how\s*to\s*get|sakay|sakyan|ride|commute|paingon|pag-?adto|pa-?adto|maabot)\b/i;
const FOLLOW_HOURS = /\b(open|opens|close|closes|time|oras|abri|sira|hours?|schedule|monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miyerkules|huwebes|biyernes|sabado|domingo|today|karon|weekend)\b/i;
const FOLLOW_FEE = /\b(how\s*much|magkano|tag\s*pila|tagpila|pila|bayad|bayronon|fees?|cost\w*|price|presyo|mahal|entrance|libre|free)\b/i;
// A follow-up that names a topic of its own is a new question, not a follow-up.
const TOPIC_NOUNS = /\b(hall|munisipyo|municipal|market|merkado|palengke|hotels?|resorts?|inns?|shrine|tree|bitaug|bay\s*walk|baywalk|parish|church|simbahan|fiesta|pista|lisagan|permit|clearance|cedula|certificate|cert|licen[cs]e|mayor|captain|kapitan|treasurer|butuan|delta|river|business|negosyo|birth|death|marriage|kasal|stalls?|puesto|meedmo)\b/i;
// Places whose own answer already gives where, how to get there, fees and hours.
const PLACE_INTENTS = new Set([
  'tourism.magellan-shrine.inquire', 'tourism.centennial-tree.inquire', 'tourism.baywalk.inquire', 'tourism.river-delta.inquire',
  'tourism.parish.inquire', 'places.market.inquire', 'tourism.accommodation.inquire', 'events.fiesta.inquire', 'events.lisagan.inquire',
]);
const OFFICE_INTENTS = new Set(['office.hours.inquire', 'office.location.inquire', 'office.contact.inquire']);

/**
 * The specific answer to a short follow-up on the previous topic, or '' when the message is not
 * one (too long, names a topic of its own, or follows a topic with its own follow-up handling).
 */
function topicFollowup(q, lastIntent = '') {
  if (!lastIntent || q.split(/\s+/).length > 7) return '';
  // "how about in Butuan?" after the places-to-stay answer — that answer lists the Butuan inns.
  // "how far is Butuan?" asks for the distance (getting-there), not for more hotels — the agent
  // picked the places-to-stay answer for it at 0.81.
  if (lastIntent === 'tourism.accommodation.inquire' && /\b(how\s*far|distance|km|kilometers?|layo|get\s*there|go\s*there|sakay|commute)\b/i.test(q) && !LODGING_WORDS.test(q)) {
    return 'tourism.getting-there.inquire';
  }
  if (
    lastIntent === 'tourism.accommodation.inquire' &&
    /\b(butuan|nearest|nearby|duol|pinakaduol|cheap\w*|barato|motels?|inns?)\b/i.test(q) &&
    !/\b(far|distance|km|kilometers?|layo|get\s*there|go\s*there|sakay|ride|commute|minutes?)\b/i.test(q)
  ) {
    return lastIntent;
  }
  if (TOPIC_NOUNS.test(q)) return '';

  if (isOfficialsIntent(lastIntent) && FOLLOW_CONTACT.test(q)) return 'officials.followup.contact.inquire';

  if (OFFICE_INTENTS.has(lastIntent)) {
    if (FOLLOW_CONTACT.test(q)) return 'office.contact.inquire';
    if (FOLLOW_WHERE.test(q) || FOLLOW_GET_THERE.test(q)) return 'office.location.inquire';
    if (FOLLOW_HOURS.test(q)) return 'office.hours.inquire';
    return '';
  }
  if (PLACE_INTENTS.has(lastIntent)) {
    if (FOLLOW_WHERE.test(q) || FOLLOW_GET_THERE.test(q) || FOLLOW_FEE.test(q) || FOLLOW_HOURS.test(q) || FOLLOW_CONTACT.test(q)) {
      return lastIntent;
    }
    return '';
  }
  if (lastIntent === 'ctc.cedula.inquire' && (FOLLOW_WHERE.test(q) || FOLLOW_FEE.test(q) || FOLLOW_HOURS.test(q))) {
    return lastIntent;
  }
  if (lastIntent === 'clearance.barangay.inquire') {
    if (FOLLOW_FEE.test(q)) return 'clearance.barangay.fee.inquire';
    if (FOLLOW_WHERE.test(q)) return lastIntent;
  }
  if (lastIntent === 'permit.building.requirements.inquire' && FOLLOW_FEE.test(q)) return 'permit.building.fee.inquire';
  return '';
}

// Asking what something costs.
const FEE_WORDS = /\b(how\s*much|magkano|tag\s*pila|tagpila|pila(\s*(ang|man))?\s*(bayad|bayronon)|bayad|bayronon|fees?|cost|price|presyo)\b/i;

// Civil registry topics from the LCRO (see civilRegistry.js).
const MARRIAGE_WORDS = /\b(marriage|kasal|magpakasal|pakasal|kasalan)\b/i;
const DEATH_WORDS = /\b(death|namatay|patay)\b/i;
const CORRECTION_WORDS = /\b(mali|sayop|wrong|correct|correction|i-?correct|itama|ayo|pag-?ayo|ayusin|change|baguhin|ilisan|spelling|misspell\w*|typo|clerical|letra|letter)\b/i;
const SEX_WORDS = /\b(gender|sex|kasarian|babae|lalaki|female|male)\b/i;
const NEWBORN_WORDS = /\b(newborn|new\s*born|bag-?ong\s*natawo|bag-?o\s*(lang\s*)?natawo|bagong\s*panganak|baby|sanggol|just\s*born)\b/i;

/**
 * The civil registry intent a question is plainly about, or '' when it names none. Used both
 * to keep a Bisaya question's topic when it is rewritten for the agent and to rescue weak matches.
 */
function civilTopic(q) {
  const asksFee = FEE_WORDS.test(q);
  if (CORRECTION_WORDS.test(q) && SEX_WORDS.test(q)) return 'civil.registry.correction.sex.inquire';
  if (CORRECTION_WORDS.test(q) && /\b(birth|cert\w*|ngalan|name|pangalan|apelyido|surname)\b/i.test(q)) {
    return 'civil.registry.correction.clerical.inquire';
  }
  if (DEATH_WORDS.test(q) && asksFee) return 'civil.registry.death.fee.inquire';
  if (MARRIAGE_WORDS.test(q) && asksFee) return 'civil.registry.marriage.fee.inquire';
  if (NEWBORN_WORDS.test(q) && /\b(regist\w*|\w*rehistro|birth)\b/i.test(q)) return 'civil.registry.birth.new.inquire';
  // "requirements for birth certificate?" — the LCRO uses one checklist for every birth
  // registration (late registration has its own intent and keeps it).
  if (
    /\b(requirements?|kinahanglan\w*|kailangan|need|dad-?on|documents?|papeles)\b/i.test(q) &&
    /\b(birth|katawo|natawo)\b/i.test(q) &&
    !/\b(late|delayed|ulahi)\b/i.test(q)
  ) {
    return 'civil.registry.birth.new.inquire';
  }
  if (asksFee && /\b(civil\s*regist\w*|lcro?|registrar)\b/i.test(q)) return 'civil.registry.fees.inquire';
  return '';
}

// Words a question must contain for the agent's match on that intent to stand (see refineIntent).
// Follow-up intents are not guarded: their context already ties them to the thread.
const FEE_GUARD = /\b(how\s*much|magkano|tag\s*pila|tagpila|pila|bayad|bayronon|fees?|cost\w*|price|presyo|mahal|charge\w*|magasto|pay)\b/i;
const MARRIAGE_GUARD =/\b(marriage|kasal|magpakasal|pakasal|kasalan|wedding|licen[cs]e|cenomar|magminyo|minyo)\b/i;
const LATE_BIRTH_GUARD = /\b(birth|regist\w*|\w*rehistro|late|katawo|natawo|anak|baby|bata|sanggol)\b/i;
const TOPIC_GUARDS = {
  'permit.business.barangay-clearance.inquire': BUSINESS_WORDS,
  'permit.business.registration.inquire': /\b(dti|sec|cda|coop\w*|kooperatiba|corporation|partnership|proprietorship|business|negosyo|store|tindahan|shop)\b/i,
  'permit.business.online.inquire': /\b(online|shopee|lazada|facebook|fb|home[\s-]?based|internet|sell\w*|seller|baligya|nagbaligya)\b/i,
  'permit.business.meedmo.inquire': /\b(meedmo|tiendas?|market|merkado|palengke|stalls?|puesto|puwesto|refilling|vendors?)\b/i,
  'permit.business.fire-safety.inquire': /\b(bfp|fire|sunog)\b/i,
  'permit.business.renewal-deadline.inquire': /\b(renew\w*|permit|business|negosyo)\b/i,
  // Fee answers only for questions about money: "requirements for birth certificate?" was
  // rewritten to "civil registry documents" and answered with the fee list.
  'civil.registry.fees.inquire': FEE_GUARD,
  'civil.registry.marriage.fee.inquire': FEE_GUARD,
  'civil.registry.death.fee.inquire': FEE_GUARD,
  'civil.registry.marriage.license.inquire': MARRIAGE_GUARD,
  'marriage.main.en': MARRIAGE_GUARD,
  'marriage.main.ceb': MARRIAGE_GUARD,
  'civil.registry.birth.late.inquire': LATE_BIRTH_GUARD,
  'latereg.main.en': LATE_BIRTH_GUARD,
  'latereg.main.ceb': LATE_BIRTH_GUARD,
};

// The English question each civil topic is rewritten to before it is sent to the agent.
const CIVIL_QUERY = {
  'civil.registry.correction.sex.inquire': 'How do I correct the sex entry in my birth certificate?',
  'civil.registry.correction.clerical.inquire': 'How do I correct an error in my birth certificate?',
  'civil.registry.death.fee.inquire': 'How much is a death certificate?',
  'civil.registry.marriage.fee.inquire': 'How much is the marriage license?',
  'civil.registry.birth.new.inquire': 'Requirements for birth registration',
  'civil.registry.fees.inquire': 'How much are the civil registry fees?',
};

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
  'maayo', 'baroto', 'hangtod', 'baligya', 'nagbaligya', 'magbaligya', 'ulahi'
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

  // 0. Civil registry fees, corrections and newborn registration keep their topic — the fee and
  // civil registry rules below would flatten them into "how much are the fees?" or "civil
  // registry documents".
  const civil = civilTopic(q);
  if (civil) return CIVIL_QUERY[civil];

  // 1. Follow-up Fee Questions ("tag pila sab?", "tagpila?", "pila ang bayad?") — not boat fares
  // or entrance fees, which the tourism intents answer from the original wording.
  if (/\b(tag\s*pila|pila\s*(ang\s*)?bayad|bayronon|tagpila)\b/i.test(q) && !/\b(baroto|boat|tour|entrance)\b/i.test(q)) {
    // The cedula answer carries its rates ("pila bayad cedula" lost its topic here).
    if (/\b(cedula|ctc|community\s*tax)\b/i.test(q)) {
      return 'How do I get a community tax certificate (cedula)?';
    }
    if (/\bpermit\b/i.test(q) || BUSINESS_WORDS.test(q)) {
      return 'How much are the business permit fees?';
    }
    return 'how much are the fees?';
  }

  // 2. Follow-up Duration ("unsa kadugay sab?", "pila ka adlaw makuha?")
  if (/\b(unsa\s*kadugay|pila\s*ka\s*adlaw|kadugayon)\b/i.test(q)) {
    if (/\bpermit\b/i.test(q) || BUSINESS_WORDS.test(q)) {
      return 'How long does it take to process a business permit?';
    }
    return 'how long is the processing time?';
  }

  // 3. Location / Office ("asa dapit ang munisipyo?", "asa moadto?", "asa mag apply?")
  if (/\b(asa\s*(dapit|man\s*dapit|moadto|mag\s*apply|ang\s*opisina|ang\s*munisipyo))\b/i.test(q)) {
    if (/\bpermit\b/i.test(q) || BUSINESS_WORDS.test(q)) {
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

  // 4. Renewal — a deadline or penalty question keeps its point ("Kanus-a ang deadline sa
  // renewal?" is not "how do I renew"). A plain "kanus-a ang renewal?" is the renewal answer,
  // which already gives the January window.
  if (/\b(unsaon\s*pag\s*renew|renew|renewal|i-renew)\b/i.test(q)) {
    if (/\b(deadline|hangtod|until|multa|penalty|penalt\w*|late|ulahi|extend\w*)\b/i.test(q)) {
      return 'When is the deadline for business permit renewal?';
    }
    return 'How do I renew a business permit?';
  }

  // 5. New Business Permit Requirements
  if (
    /\b(unsa\s*(akong\s*)?kinahanglan|kinahanglanon|unsaon\s*pag\s*apply|unsaon\s*pag-?kuha|requirements)\b/i.test(q) &&
    (/\bpermit\b/i.test(q) || BUSINESS_WORDS.test(q)) &&
    !/\b(building|bilding|balay|construction|pagtukod|occupancy|fencing|electrical|demolition)\b/i.test(q)
  ) {
    return 'What do I need for a new business permit?';
  }

  // 6. Barangay Clearance — a cedula is required *for* a barangay clearance, so a question that
  // names both is about the clearance; the cedula on its own is checked next.
  if (/\b(barangay\s*clearance|brgy\s*clearance|clearance\s*sa\s*barangay|residency)\b/i.test(q)) {
    // For a business it comes from the barangay of the business address, not the residence.
    if (BUSINESS_WORDS.test(q)) {
      return 'Where do I get a barangay business clearance?';
    }
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
  // A civil registry answer since then means the conversation moved on, even while the business
  // context is still alive. And when the agent matched a business intent on *this* message, the
  // context may be that match's own output — "When is the deadline for paying amilyar?" weakly
  // matched the renewal deadline, emitted the context, and then read as a business thread.
  const hasBusinessContext =
    ((contextIds.includes('business-permit-followup') || contextIds.includes('business-permit')) &&
      !isCivilIntent(lastIntent) &&
      !currentIntent.startsWith('permit.business')) ||
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
  // A short follow-up about the topic just answered ("where is it?", "libre ba?", "what time
  // does it open?", "unsa iyang number?") gets that topic's specific answer — even when the agent
  // confidently matched something generic like the Municipal Hall's hours or contact.
  const thread = topicFollowup(q, lastIntent);
  if (thread) {
    return thread;
  }
  // "Who is under the mayor?" asks about the structure, not about the Mayor — before the "who"
  // rule below keeps whichever officials intent the agent picked.
  if (STRUCTURE_WORDS.test(q) && currentIntent !== 'officials.structure.inquire') {
    return 'officials.structure.inquire';
  }
  // "Kinsa man ang mayor diri?" weakly matched the former mayors; without a word about the past
  // the question is about who holds the office now. Before the "who" rule just below, which
  // would keep the former-mayors match as it is.
  if (/^officials\.former\.(mayors|vicemayors)\.inquire$/.test(currentIntent) && !/\b(former|past|previous|before|first|was|were|history|how\s*many|list|lista|\d{4}|kanhi\w*|kaniadto|niadtong|miaging|nahimong|naging|nauna|una|wala\s*pa|kasaysayan|dati\w*|dating|mga\s*mayor)\b/i.test(q)) {
    return currentIntent === 'officials.former.mayors.inquire' ? 'officials.mayor.inquire' : 'officials.vicemayor.inquire';
  }
  if (isOfficialsIntent(currentIntent) && (ASKS_WHO.test(q) || currentIntent.includes('.followup.'))) {
    return currentIntent;
  }
  // The general barangay clearance answer says "where you live or where your business is"; for
  // a business it is only the barangay of the business address (BPLO, October 2026).
  if (currentIntent === 'clearance.barangay.inquire' && BUSINESS_WORDS.test(q)) {
    return 'permit.business.barangay-clearance.inquire';
  }
  // The console's civil registry intents answer with a checklist even when the question names a
  // fee or a correction ("magkano po ang marriage license" got the requirements at full
  // confidence). A specific topic in the question wins over the agent's broader one.
  const civil = civilTopic(q);
  if (civil && isCivilIntent(currentIntent) && !currentIntent.includes('.followup.')) {
    return civil;
  }
  // The all-fees summary also attracts questions that name one document ("how about a death
  // certificate?" scored 0.87 for it) — answer about that document. Only for a fee question or
  // inside a civil registry thread; otherwise the fee guard below drops the match.
  if (currentIntent === 'civil.registry.fees.inquire' && (FEE_GUARD.test(q) || isCivilIntent(lastIntent))) {
    if (DEATH_WORDS.test(q)) return 'civil.registry.death.fee.inquire';
    if (MARRIAGE_WORDS.test(q)) return 'civil.registry.marriage.fee.inquire';
    if (SEX_WORDS.test(q)) return 'civil.registry.correction.sex.inquire';
    if (CORRECTION_WORDS.test(q)) return 'civil.registry.correction.clerical.inquire';
  }
  // The public market, places to stay and the officials' structure (generalInfo.js, officials.js).
  // Each overlaps an older intent — a stall question is the MEEDMO's, "what time does the market
  // open?" carries an hours cue, "hotels" drew the tourist spots list — so the topic words decide.
  const accommodationIntent = 'tourism.accommodation.inquire';
  const marketIntent = 'places.market.inquire';
  const structureIntent = 'officials.structure.inquire';
  // The topic words also confirm the agent's own weak match ("Is there a motel in Magallanes?"
  // scored 0.66 for places to stay and was dropped as unsure).
  if (LODGING_WORDS.test(q) && !BUSINESS_WORDS.test(q)) {
    return accommodationIntent;
  }
  if (MARKET_WORDS.test(q) && !STALL_WORDS.test(q)) {
    return marketIntent;
  }
  if (STRUCTURE_WORDS.test(q)) {
    return structureIntent;
  }
  // "Okay bye!" is a goodbye, not an acknowledgement.
  if (currentIntent === 'smalltalk.acknowledge' && /\b(bye|goodbye|babay|ba-?bye|amping|paalam|see\s*you)\b/i.test(q)) {
    return 'smalltalk.goodbye';
  }
  // "What can you help me with?" scored 0.63 for the catch-all "be more specific" intent.
  if (
    (NON_SPECIFIC_INTENTS.has(currentIntent) || currentIntent === 'Default Fallback Intent' || confidence < MIN_CONFIDENCE) &&
    /\b(what\s*can\s*you\s*(do|help)|what\s*do\s*you\s*(do|know)|how\s*can\s*you\s*help|unsa(y|\s*ang)?\s*(imong\s*)?(matabang|mahimo|kaya)|unsa\s*imong\s*(matabang|mahimo)|ano\s*ang\s*kaya\s*mo)\b/i.test(q)
  ) {
    return 'smalltalk.capabilities';
  }
  if (
    (currentIntent === 'office.hours.inquire' && !HOURS_CUE.test(q)) ||
    (currentIntent === 'smalltalk.acknowledge' && q.split(/\s+/).length > ACK_MAX_WORDS)
  ) {
    currentIntent = 'Default Fallback Intent';
  }

  // Topic guards: an agent match only stands when the question names its topic. After the
  // business permit ZIP was imported, "Do I need a fencing permit?" scored 0.83 for online
  // sellers and "How do I register a death?" 0.70 for DTI/SEC registration; the console's
  // marriage licence intent took "How do I apply for a water connection?". A guarded-out match
  // falls through to the keyword rules below, and to the fallback if none applies.
  const guard = TOPIC_GUARDS[currentIntent];
  if (guard && !guard.test(q)) {
    // A general barangay clearance question has its own answer.
    currentIntent = currentIntent === 'permit.business.barangay-clearance.inquire' ? 'clearance.barangay.inquire' : 'Default Fallback Intent';
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
  // Market stall rent is the MEEDMO's (rule 5b), not a BPLO fee.
  // The cedula has its own rates (rule 6).
  const aboutStalls = /\b(stalls?|puesto|puwesto|meedmo|refilling|cedula|ctc|community\s*tax)\b/i.test(q);
  if (!civil && !aboutStalls && /\b(tag\s*pila|tagpila|pila\s*(ang\s*)?(bayranon|bayad)|bayronon|bayad|how\s*much|fee|fees|cost|rates|price|assessment)\b/i.test(q)) {
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

  // 4. Renewal ("unsaon pag renew?", "how to renew?") — and its deadline or late penalty
  // ("kanus-a ang deadline?", "naa bay multa?"), which only makes sense about a business permit.
  // "Late" means a late renewal here, never a late birth registration.
  const asksDeadline =
    /\b(deadline|multa|penalty|penalt\w*|last\s*day|hangtod\s*kanus-?a|until\s*when|late|ma-?late|ulahi)\b/i.test(q) &&
    !/\b(registration|birth|rehistro)\b/i.test(q);
  if (/\b(renew|renewal|pag\s*renew|i-renew|irenew)\b/i.test(q)) {
    return asksDeadline ? 'permit.business.renewal-deadline.inquire' : 'permit.business.renew.inquire';
  }
  if (asksDeadline && (/(permit|negosyo|business)/i.test(q) || hasBusinessContext)) {
    return 'permit.business.renewal-deadline.inquire';
  }

  // 5. Office Location / Where to Apply ("asa dapit?", "where to apply?", "asa moadto?")
  if (/\b(asa\s*dapit|asa\s*ang\s*opisina|asa\s*mag\s*apply|asa\s*moadto|where\s*is\s*(the\s*)?office|where\s*to\s*apply|location|bplo\s*location|asa\s*ang\s*munisipyo)\b/i.test(q)) {
    if (/(permit|negosyo|business)/i.test(q) || currentIntent.startsWith('permit.business') || hasBusinessContext) {
      return 'permit.business.location.inquire';
    }
  }

  // 5b. The other topics on the BPLO checklist (see businessPermit.js). "BFP" alone is also the
  // fire station ("What is the BFP number?"), so it needs a business cue; the clearance or the
  // inspection is never an emergency question.
  const businessCue = BUSINESS_WORDS.test(q) || /\bpermit\b/i.test(q) || hasBusinessContext;
  if (/\b(fire\s*(safety|clearance|inspection)|bfp\s*clearance)\b/i.test(q) || (/\bbfp\b/i.test(q) && businessCue)) {
    return 'permit.business.fire-safety.inquire';
  }
  if (/\b(dti|sec|cda|cooperatives?|kooperatiba|coop|corporation|single\s*proprietorship|business\s*name)\b/i.test(q)) {
    return 'permit.business.registration.inquire';
  }
  if (/\b(meedmo|block\s*tiendas?|water\s*refilling|market\s*stalls?|stall|puesto|puwesto)\b/i.test(q)) {
    return 'permit.business.meedmo.inquire';
  }
  if (/\b(online|shopee|lazada|home[\s-]?based)\b/i.test(q) && (businessCue || /\b(sell|seller|selling)\b/i.test(q))) {
    return 'permit.business.online.inquire';
  }
  if (/\b(barangay|brgy)\s*(business\s*)?clearance\b/i.test(q) && BUSINESS_WORDS.test(q)) {
    return 'permit.business.barangay-clearance.inquire';
  }

  // 6. Barangay Clearance, then the cedula on its own (see normalizeBisayaQuery for why the
  // clearance wins when a question names both)
  if (/\b(barangay\s*clearance|clearance\s*sa\s*barangay|residency|brgy\s*clearance)\b/i.test(q)) {
    return 'clearance.barangay.inquire';
  }
  if (/\b(cedula|ctc|community\s*tax)\b/i.test(q)) {
    return 'ctc.cedula.inquire';
  }

  // 6b. Civil registry fees, corrections and newborn registration (civilRegistry.js) — before
  // the checklist rules below, which would answer "how much is the marriage license?" with the
  // marriage licence requirements.
  if (civil) {
    return civil;
  }

  // Bare follow-ups in a civil registry thread: "how much?" is the fee of what was just
  // discussed; "sa death certificate?", "kung gender?", "usa ra ka letra?" switch topic within
  // it. Before rule 7, whose broad "death certificate" match would answer with the generic reply.
  // The agent's own fallback reports confidence 1, so it counts as unrecognised by name.
  const unrecognised =
    currentIntent === 'Default Fallback Intent' || NON_SPECIFIC_INTENTS.has(currentIntent) || confidence < MIN_CONFIDENCE;
  if (isCivilIntent(lastIntent) && q.split(/\s+/).length <= 8 && unrecognised) {
    if (SEX_WORDS.test(q)) return 'civil.registry.correction.sex.inquire';
    if (CORRECTION_WORDS.test(q)) return 'civil.registry.correction.clerical.inquire';
    if (DEATH_WORDS.test(q)) return 'civil.registry.death.fee.inquire';
    if (MARRIAGE_WORDS.test(q)) return 'civil.registry.marriage.fee.inquire';
    if (FEE_WORDS.test(q) || /\b(pila|much)\b/i.test(q)) return civilFeeIntentFor(lastIntent);
    if (/\b(requirements?|kinahanglan|need|dad-?on|bring|kailangan|documents?)\b/i.test(q)) return civilRequirementsIntentFor(lastIntent);
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
  const asksForRequirements = /\b(unsa\s*(akong\s*)?kinahanglan|kinahanglanon|unsaon\s*pag\s*apply|unsaon\s*pag-?kuha|requirements|new\s*permit|bag-ong\s*permit|bag-o\s*nga\s*permit|what\s*do\s*i\s*need|need\s*to\s*open|magbukas|ano\s*ang\s*kailangan)\b/i.test(q);
  if (asksForRequirements) {
    const mentionsBuilding = /\b(building|bilding|balay|construction|pagtukod|two-storey|two\s*storey)\b/i.test(q);
    const mentionsBusiness = BUSINESS_WORDS.test(q);

    if (mentionsBuilding && !mentionsBusiness) {
      return 'permit.building.requirements.inquire';
    }
    if (mentionsBusiness || currentIntent.startsWith('permit.business') || hasBusinessContext) {
      return 'permit.business.new.inquire';
    }
  }

  // 8b. Building work on a house ("Do I need a permit to renovate my house?") — the agent sent it
  // to the online-seller intent once that existed, and the topic guard drops that match.
  if (/\bpermit\b/i.test(q) && /\b(renovat\w*|construct\w*|build(ing)?|pagtukod|magtukod|balay|house|bahay|extension)\b/i.test(q) && !BUSINESS_WORDS.test(q)) {
    return 'permit.building.requirements.inquire';
  }

  // Context heuristic for bare follow-ups ("where?", "pila?") in a business permit thread. Runs
  // before the catch-all intents are trusted, because those match exactly these topicless
  // phrasings and would otherwise answer "where?" with "your question is unclear".
  // The thread must predate this turn: a weak business-permit guess on *this* message emits the
  // same context, and "Is the municipal hall open on Saturday?" then read as "where is the BPLO".
  const businessThread = lastIntent.startsWith('permit.business') || (hasBusinessContext && !currentIntent.startsWith('permit.business'));
  if (businessThread && unrecognised) {
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
