// server/services/focus.js
//
// The panel asked that Bitoy give the specific answer to what was asked. Most topics have one
// answer that covers everything — who handles it, where, the fee, what to bring — so "How much is
// a PWD ID?", "asa?" after it, or "What is the BFP hotline?" got the whole paragraph or list.
//
// focusAnswer() narrows an answer to the part the question asks for:
//   1. what kind of thing is asked (the fee, where, hours, a deadline, how long, requirements,
//      a contact, a penalty, a discount, who qualifies), and any specific item it names
//      ("BFP", "population", "sanitary permit") that only some lines of the answer mention;
//   2. the answer is split into sentences and list lines, and only the matching ones are kept
//      (a list line keeps the heading it sits under);
//   3. when the topic has nothing on what was asked, the reply says so and names who handles it,
//      instead of repeating everything else.
// It leaves the answer whole when the question is broad ("Tell me about the shrine"), when the
// answer already is about exactly that ("What are the requirements?" → the checklist), or when
// the matching part is most of the answer anyway.

import { tokens } from './liveContent.js';

// --- What the question asks for -----------------------------------------------------------------

// Checked in this order: "late payment penalty" is a penalty, not a fee; "until when" a deadline.
const QUESTION_ASPECTS = [
  // Not "late registration" — that is a service, asked about like any other.
  ['penalty', /\b(penalt\w*|multa|surcharge|late\s*(payment|fee|renewal)|interest|na-?late|ma-?late)\b/i],
  ['discount', /\b(discount|diskwento)\b/i],
  ['deadline', /\b(deadline|due\s*date|until\s*when|hangtod\s*kanus-?a|last\s*day|katapusang\s*adlaw)\b/i],
  ['duration', /\b(how\s*long|kadugay|dugay|gaano\s*katagal|valid\w*|expir\w*|pila\s*ka\s*(adlaw|semana|bulan|tuig))\b/i],
  ['contact', /\b(e-?mail|contact|phone|numero|number|cellphone|cp|hotline|tawag\w*|call)\b/i],
  // Who qualifies — not something's age ("a 500 year old tree, where is it?").
  ['eligibility', /\b(age\s*(limit|requirement|range|bracket)|minimum\s*age|how\s*old\s*(must|should|do|does)|edad|qualif\w*|eligib\w*|who\s*can\s*(apply|get|avail|join)|kinsa\s*(ang\s*)?(pwede|kwalipikado))\b/i],
  ['reqs', /\b(requirements?|requisitos|what\s*(do|should)\s*i\s*(need|bring)|need\s*to\s*bring|bring|dad-?on|dalhon|dad-?a|kinahanglan|documents?|papers?|papeles)\b/i],
  ['fee', /\b(how\s*much|magkano|tag\s*pila|tagpila|bayad|bayronon|fees?|cost\w*|price|presyo|charge|libre|free|amount)\b|\bpila\b(?!\s*ka\b)/i],
  ['where', /\b(where|asa|diin|saan|location|located|dapit|address)\b/i],
  // Opening hours ("unsa oras?", "what time does it open?") and dates ("when was it founded?",
  // "kanus-a ang fiesta?") are different questions: a date is no answer to "what time?".
  // "open" only as being open — "open a sari-sari store" is starting a business.
  ['hours', /\bopens?\s*[?.!]*\s*$|\b(what\s*time|oras|opening\s*hours|(is|are)\s*(it|they|the\s+\S+(\s+\S+)?)\s*open|open\s*(today|now|on|ba|karon|until|from|at)|abri\s*(ba|karon|kung|na)|sirado|close[sd]?|closing|sira|hours?|schedule|iskedyul|what\s*day|unsang\s*adlawa|mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|lunes|martes|miyerkules|huwebes|biyernes|sabado|domingo|weekends?)\b/i],
  ['date', /\b(when|kanus-?a|what\s*year|unsang\s*tuiga|dates?|petsa|founded|natukod|established)\b/i],
];

// "what day / what time" decides over a word like "free" ("on what day are free vaccinations?").
const ASKS_WHEN_EXPLICITLY = /\b(what\s*(day|days|time)|unsang\s*(adlawa|orasa?)|unsa\s*(nga\s*)?(adlaw|oras))\b/i;
// "unsaon nako pag-renew?", "how do I…?" — a how-to question is broad, whatever else it says
// ("Ma-expire na ang permit, unsaon nako pag-renew?" is not asking how long it is valid). Only
// a plain ask for the fee, the place, the hours or a contact narrows it.
const HOW_TO = /\b(unsaon|unsay\s*buhaton|how\s*(do|can|should|would)\s*(i|we)|how\s*to|paano|what\s*should\s*(i|we)\s*do)\b/i;

/** The kind of thing a question asks for, or null for a broad question. */
export function questionAspect(question = '') {
  if (ASKS_WHEN_EXPLICITLY.test(question)) return 'hours';
  const hit = QUESTION_ASPECTS.find(([, re]) => re.test(question));
  const aspect = hit ? hit[0] : null;
  if (aspect && HOW_TO.test(question) && !['fee', 'where', 'hours', 'contact', 'reqs'].includes(aspect)) return null;
  return aspect;
}

// --- Which parts of an answer say that -----------------------------------------------------------

// "May" is left out: "the LGU may grant" is not a date.
const MONTHS = 'january|february|march|april|june|july|august|september|october|november|december|enero|pebrero|marso|abril|mayo|hunyo|hulyo|agosto|septyembre|oktubre|nobyembre|disyembre';
// A line that states a price or that something is free. Paying as an action ("pay online", "paid
// at the Municipal Hall") is not one — "How much is the police clearance?" picked the steps.
// "bayad na" is "already paid", not a fee.
const FEE_STATED = /₱|\bfree\b|\blibre\b|\bfees?\b|\bamount\b|\bkantidad\b|\bprices?\b|\bpresyo\b|\bbayad\b(?!\s*na\b)|\bbayronon\b|\b(how\s*much|pila)\s*:|\b(no|walay)\s*(entrance\s*)?(fee|bayad)\b/i;
// A place named as where to go: "at the Municipal Treasurer's Office", "sa Munisipyo", "online at
// https://…", "across from the 7-Eleven". Case matters for the first: an office is named in
// capitals — "kumpirmaha ang listahan sa opisina" (confirm with the office) is no address.
const WHERE_NAMED = /\b(at|sa|to|by|through|pinaagi\s+sa)\s+(the\s+)?(([A-Z][\w'’().-]*|of|and|ug|for|sa)\s+){0,9}(Office|Hall|Unit|Station|Center|Centre|Outlet|Branch|Building|Munisipyo)\b/;
const WHERE_DETAIL = /https?:\/\/|\b(located|nahimutang|naa\s*sa|anaa\s*sa|across\s*from|atbang\s*sa|near|duol\s*sa|floor|in\s*(barangay|poblacion|the\s*town\s*cent(er|re))|sa\s*(barangay|poblacion|sentro)|go\s*to|adto\s*sa)\b/i;
const DAY_NAMES = 'mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?|lunes|martes|miyerkules|huwebes|biyernes|sabado|domingo';
const UNIT_ASPECTS = {
  fee: FEE_STATED,
  where: { test: (t) => WHERE_NAMED.test(t) || WHERE_DETAIL.test(t) },
  // Opening hours: a clock time, a day, "open", "busiest in the early morning".
  // Not a bare "oras": "sakto sa oras ang bayad" is paying on time. "the vaccination day in your
  // barangay" is a day.
  hours: new RegExp(`\\b\\d{1,2}:\\d{2}\\b|\\b(a\\.?m\\.?|p\\.?m\\.?)(?=\\W|$)|\\b(${DAY_NAMES}|daily|weekdays?|weekends?|morning|afternoon|buntag|hapon|open|abri|closed|sirado|hours|oras\\s*sa\\s*(opisina|pag-?abri)|schedule|iskedyul|\\w+\\s+day|adlaw\\s*sa\\s*\\w+)\\b`, 'i'),
  // A date: a year, a month or a day ("21 June 1969", "every third Saturday of October").
  date: new RegExp(`\\b(1[5-9]|20)\\d{2}\\b|\\b(${MONTHS}|${DAY_NAMES})\\b`, 'i'),
  deadline: new RegExp(`\\b(deadline|on\\s*or\\s*before|until|hangtod|due|${MONTHS})\\b`, 'i'),
  duration: /\b(\d+\s*(working\s*)?(days?|weeks?|months?|years?|minutes?|hours?)|adlaw|semana|bulan|tuig|valid\w*|minutos)\b/i,
  reqs: /\b(bring|dad-?a|dalha|pagdala|requirements?|kinahanglan|documents?|forms?|valid\s*ids?|certificate|photos?|picture|receipts?|resibo|proof)\b/i,
  contact: /@|\b0\d{2,3}[-\s]?\d{3}[-\s]?\d{3,4}\b|\b(call|tawag\w*|phone|e-?mail|numero|hotline)\b/i,
  penalty: /\b(penalt\w*|late|ulahi|interest|interes|multa|surcharge)\b/i,
  discount: /\b(discount|diskwento)\b/i,
  eligibility: /\b(aged?|years?\s*old|anyos|\d+\s*(?:–|-|to|hangtod)\s*\d+|students?|estudyante|residents?|qualif\w*|kwalipikado|eligib\w*|members?)\b/i,
};

const BULLET = /^\s*([•\-*]|\d+[.)])\s+/;

/** Sentences and list lines, each knowing the heading line it sits under. */
function splitUnits(answer) {
  const units = [];
  let heading = -1;
  for (const [lineNo, raw] of answer.split('\n').entries()) {
    const line = raw.trim();
    if (!line) {
      heading = -1;
      continue;
    }
    if (BULLET.test(line)) {
      units.push({ text: line, item: true, heading, line: lineNo });
      continue;
    }
    // Not after an initial or an abbreviation: "Cheryl S. Altura", "Sec. 250", "Hon. Cesar".
    const sentences = line.split(/(?<![\s(][A-Z]\.)(?<!\b(?:Sec|No|Nos|Hon|Dr|Engr|Mr|Mrs|Ms|St|Ave|Brgy|Jr|Sr|Inc|vs|Art|Atty|Gov|Sto|Sta|Rep)\.)(?<=[.!?])\s+(?=[A-Z"“(•])/);
    heading = -1;
    for (const s of sentences) {
      units.push({ text: s, item: false, heading: -1, line: lineNo });
    }
    // A line ending in ":" heads the list lines below it.
    if (/:\s*$/.test(line)) heading = units.length - 1;
  }
  return units;
}

// Words that say what kind of thing is asked, not which item — they never pick out a line.
const ASPECT_WORDS = new Set([
  'much', 'cost', 'fee', 'price', 'presyo', 'bayad', 'bayronon', 'tagpila', 'magkano', 'free', 'libre', 'amount', 'charge',
  'requirement', 'requisito', 'need', 'bring', 'dalhon', 'kinahanglan', 'document', 'paper', 'papele',
  'where', 'location', 'located', 'address', 'dapit', 'time', 'oras', 'open', 'abri', 'close', 'hour', 'schedule', 'iskedyul',
  'long', 'kadugay', 'dugay', 'valid', 'validity', 'deadline', 'until', 'hangtod', 'email', 'contact', 'phone', 'number',
  'numero', 'hotline', 'call', 'tawag', 'age', 'limit', 'edad', 'anyo', 'year', 'old', 'qualified', 'penalty', 'late',
  'multa', 'interest', 'discount', 'diskwento', 'get', 'apply', 'kuha', 'makuha', 'makakuha', 'available', 'pwede',
]);
// tokens() turns "babies" into "babie"; make it "baby" so it matches the singular.
const wordsOf = (text) => tokens(text).map((w) => w.replace(/ie$/, 'y'));
// Same word, or one stem: "vaccine" ~ "vaccination", "registry" ~ "registration".
const sameWord = (a, b) =>
  a === b || (a.length >= 5 && b.length >= 5 && (a.startsWith(b) || b.startsWith(a))) || (a.length >= 6 && b.length >= 6 && a.slice(0, 6) === b.slice(0, 6));

// An answer whose opening says it is about exactly this ("CHECKLIST OF REQUIREMENTS", "Civil
// registry fees…", "Office hours…") already is the specific answer.
const OPENING_ABOUT = {
  reqs: /\b(requirements?|checklist|requisitos|you('|’)ll\s*need|kinahanglanon)\b/i,
  fee: /\b(fees|bayronon|schedule\s*of\s*fees)\b/i,
  hours: /\b(schedule|iskedyul|office\s*hours)\b/i,
};
// Who handles a topic, named when the answer has nothing on what was asked.
const HANDLER = /\b(office|opisina|unit|hall|munisipyo|station|mswdo|rhu|lcro|bplo|meedmo|peso|osca|mho|dswd|dole|pnp|psa|bfp|nbi|barangay\s*hall)\b/i;

/**
 * Question words that pick out particular lines: not aspect words, not the topic itself (the
 * intent's name or the answer's opening line), and not in most of the answer's lines.
 */
function itemWords(question, intent, units) {
  const topic = new Set([...intent.toLowerCase().split(/[.\-_]+/), ...wordsOf(units[0]?.text || '')]);
  const unitWords = units.map((u) => wordsOf(u.text));
  return [...new Set(wordsOf(question))].filter((w) => {
    if (ASPECT_WORDS.has(w) || [...topic].some((t) => sameWord(t, w))) return false;
    const n = unitWords.filter((ws) => ws.some((x) => sameWord(x, w))).length;
    return n > 0 && n <= Math.max(1, Math.floor(units.length / 2));
  });
}

const NOT_ON_FILE = {
  english: {
    fee: "I don't have the amount for this on file.",
    hours: "I don't have the hours or schedule for this on file.",
    date: "I don't have a date for this on file.",
    deadline: "I don't have a deadline for this on file.",
    duration: "I don't have how long this takes, or how long it is valid, on file.",
    contact: "I don't have a direct contact number or email for this on file.",
    penalty: "I don't have the penalty for this on file.",
    discount: "I don't have a discount for this on file.",
    eligibility: "I don't have the eligibility rules for this on file.",
  },
  bisaya: {
    fee: 'Wala koy listahan sa kantidad para niini.',
    hours: 'Wala koy listahan sa oras o iskedyul para niini.',
    date: 'Wala koy listahan sa petsa para niini.',
    deadline: 'Wala koy listahan sa deadline para niini.',
    duration: 'Wala koy listahan kung unsa kadugay kini o hangtod kanus-a kini valid.',
    contact: 'Wala koy direktang numero o email para niini.',
    penalty: 'Wala koy listahan sa multa para niini.',
    discount: 'Wala koy listahan sa diskwento para niini.',
    eligibility: 'Wala koy listahan kung kinsa ang kwalipikado para niini.',
  },
};

// Answers that are lists of people or of everything Bitoy can do — narrowing them makes no sense —
// and answers already built for the one question asked.
// Also: answers written for one specific question (specific.js), and processing-time answers,
// whose reasoning ("most house permits are complex applications") is part of the answer.
// The lists of tourist spots and places to stay are the answer to any question about them.
const NEVER_FOCUS =
  /^(smalltalk\.|Default |Welcome$|vague\.|live\.|media\.|transport\.boat\.|officials\.(directory|structure|sb|former)|emergency\.(?!hotline)|civil\.registry\.birth-copy\.|permit\.building\.location\.|tourism\.(spots|accommodation)\.)|\.(process|time)\.inquire$/;
// A shorter answer is already specific: cutting a three-sentence answer about animal bites left
// only its side note about vaccination schedules.
const MIN_LENGTH = 300;
const KEEP_RATIO = 0.7; // when the matching part is this much of the answer, send it all

/**
 * The part of `answer` that answers `question`, or null to send the whole answer.
 * @param {string} answer
 * @param {{ question: string, intent: string, language?: 'english'|'bisaya' }} turn
 */
export function focusAnswer(answer, { question = '', intent = '', language = 'english' } = {}) {
  if (!answer || NEVER_FOCUS.test(intent)) return null;
  const lang = language === 'bisaya' ? 'bisaya' : 'english';
  const units = splitUnits(answer);
  if (units.length < 2) return null;
  const aspect = questionAspect(question);
  const items = itemWords(question, intent, units);
  if (!aspect && items.length === 0) return null;

  const matchesAspect = (u) => Boolean(aspect && UNIT_ASPECTS[aspect]?.test(u.text));
  const matchesItem = (u) => items.some((w) => wordsOf(u.text).some((x) => sameWord(x, w)));
  // A line's label: "Population" in "• Population: 22,780", "BFP (fire)" in "• BFP (fire): 0931…".
  // Without a "fee/where/hours…" ask, a question picks out a line only by naming its label —
  // "open a sari-sari store" must not pick the one checklist line that mentions sari-sari stores.
  const labelOf = (u) => {
    const m = u.text.replace(BULLET, '').match(/^(.{1,70}?)(:|\s[—–]\s)/);
    return m ? m[1] : '';
  };
  const namesLabel = (u) => items.some((w) => wordsOf(labelOf(u)).some((x) => sameWord(x, w)));
  // A short answer is already specific — unless the question names one labelled line of it
  // ("What is the BFP hotline?" over the four hotlines).
  if (answer.length < MIN_LENGTH && !(items.length && units.some((u) => u.item && namesLabel(u)))) return null;

  // The answer opens with a heading about exactly that ("Requirements for a NEW business permit:",
  // "Civil registry fees at the LCRO:"): it already is the specific answer, unless the question
  // names one item in it.
  // An answer that is already about exactly what is asked — the contact list for "contact number?",
  // a fee answer for "how much?" — is sent whole, unless the question names one line of it.
  const INTENT_ABOUT = { contact: /contact|hotline/, fee: /\.fees?\./, where: /\.location\./, hours: /\.hours\./, reqs: /requirements/ };
  if (aspect && INTENT_ABOUT[aspect]?.test(intent) && !units.some((u) => namesLabel(u))) return null;
  // A requirements question over a requirements checklist: the whole checklist, always. "unsay
  // requirements sa birth certificate?" kept only the items that said "certificate".
  if (aspect === 'reqs' && units.slice(0, 2).some((u) => OPENING_ABOUT.reqs.test(u.text))) return null;
  if (aspect && items.length === 0) {
    // "Where can I stay?", "where are the tourist spots?": the list of places is the answer.
    if (aspect === 'where' && /(accommodation|spots)/.test(intent)) return null;
    if (['reqs', 'fee', 'hours', 'deadline'].includes(aspect) && /:\s*$/.test(units[0].text) && matchesAspect(units[0])) return null;
    if (OPENING_ABOUT[aspect] && units.slice(0, 2).some((u) => OPENING_ABOUT[aspect].test(u.text))) return null;
  }

  // A requirements checklist answers any question about it that is not a fee, place, time or
  // contact ("What permits do I need to open a sari-sari store?").
  if (!['fee', 'where', 'hours', 'date', 'deadline', 'contact', 'penalty', 'discount'].includes(aspect) && units.slice(0, 2).some((u) => OPENING_ABOUT.reqs.test(u.text))) {
    return null;
  }

  let picked;
  if (aspect === 'reqs') {
    // What to bring is every requirement line, not the ones that repeat a word of the question
    // ("requirements for a burial permit" kept only the sentence that says "permit").
    picked = units.filter(matchesAspect);
  } else if (items.length && aspect) {
    // Lines that name the item and answer the ask; else the lines that answer the ask ("where is
    // the 500-year-old tree?" is a where question, not one about its age).
    const both = units.filter((u) => matchesItem(u) && matchesAspect(u));
    picked = both.length ? both : units.filter(matchesAspect);
  } else if (items.length) {
    picked = units.filter(namesLabel);
    if (!picked.length) return null; // a broad question that happens to mention a word of a line
  } else {
    picked = units.filter(matchesAspect);
  }
  // Where: the first place named — with the line after it when that one only adds detail ("It is
  // in the Poblacion, across from the 7-Eleven"). Later mentions ("confirm with the MSWDO") repeat it.
  if (aspect === 'where' && !items.length && picked.length) {
    if (picked[0].item) {
      // Several places or channels (PSA online or at an outlet; VAW desk, PNP or MSWDO): one of
      // them is no answer to "where?" — the list is, with its heading.
      const list = units.filter((u) => u.item && u.heading === picked[0].heading);
      picked = picked[0].heading >= 0 ? [units[picked[0].heading], ...list] : list;
    } else {
      const i = units.indexOf(picked[0]);
      const next = units[i + 1];
      picked = next && !next.item && WHERE_DETAIL.test(next.text) ? [picked[0], next] : [picked[0]];
    }
  }
  // A fee: not the late-payment or discount lines, which state amounts too ("Ulahi nga bayad").
  if (aspect === 'fee' && !items.length) {
    const plain = picked.filter((u) => !UNIT_ASPECTS.penalty.test(u.text) && !UNIT_ASPECTS.discount.test(u.text));
    if (plain.length) picked = plain;
  }

  if (picked.length === 0) {
    // Nothing on what was asked: say so, and who handles it, rather than repeat everything else.
    // A list of places or offices to call ("where to stay", complaint hotlines) stays whole —
    // those are the ones to ask.
    if (!aspect || !NOT_ON_FILE[lang][aspect]) return null;
    if (units.filter((u) => u.item && UNIT_ASPECTS.contact.test(u.text)).length >= 3) return null;
    const who = units.find((u) => HANDLER.test(u.text) && u.text.length <= 300);
    return who ? `${NOT_ON_FILE[lang][aspect]} ${who.text.replace(BULLET, '')}` : NOT_ON_FILE[lang][aspect];
  }

  // A heading comes with the list lines picked under it, and a picked heading brings its list.
  const keep = new Set(picked.map((u) => units.indexOf(u)));
  for (const i of [...keep]) {
    const u = units[i];
    // "It is in the Poblacion…" needs the sentence that says what "it" is.
    if (!u.item && i > 0 && !units[i - 1].item && /^(it|this|they|these|kini|anaa\s+kini|naa\s+kini|sila)\b/i.test(u.text)) keep.add(i - 1);
    if (u.item && u.heading >= 0 && units[u.heading].text.length <= 90) keep.add(u.heading);
    // Not for "where?": "apply through the PESO — ask at the Municipal Hall:" answers it alone.
    if (/:\s*$/.test(u.text) && aspect !== 'where') units.forEach((x, j) => x.heading === i && keep.add(j));
  }
  const chosen = [...keep].sort((a, b) => a - b).map((i) => units[i]);
  // Numbered steps are a sequence: "1. … 3." with step 2 cut out reads as a mistake. A question
  // that picks some steps gets them all.
  const numbered = (u) => u.item && /^\s*\d+[.)]/.test(u.text);
  if (chosen.some(numbered) && units.filter(numbered).some((u) => !chosen.includes(u))) return null;
  if (aspect === 'where' && chosen.length && /:\s*$/.test(chosen[chosen.length - 1].text)) {
    chosen[chosen.length - 1] = { ...chosen[chosen.length - 1], text: chosen[chosen.length - 1].text.replace(/\s*:\s*$/, '.') };
  }
  const text = chosen
    // Sentences of one line stay one line; anything from another line starts a new one.
    .map((u, k) => (k === 0 ? u.text : (u.line !== chosen[k - 1].line ? '\n' : ' ') + u.text))
    .join('')
    .trim();
  if (text.length >= answer.length * KEEP_RATIO) return null;
  return text;
}
