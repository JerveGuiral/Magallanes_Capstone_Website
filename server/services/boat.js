// server/services/boat.js
//
// Passenger boats between Magallanes and Butuan City: the schedule, and a specific answer to each
// kind of question about it. The panel asked that Bitoy answer what was asked — "what time is the
// last trip?" gets the last trip, not the whole board — so a boat question is narrowed to one
// aspect (first / last / next trip, fare, trip length, trips a day, days, terminal) and, when the
// question says which way, to one direction.
//
// Source: the schedule board of the Magallanes Watercraft Association, Inc. (MWAI) at the boat
// terminal, photographed by the capstone team in November 2026. Trips from Magallanes are the
// chalk-written November update beside the painted times (confirmed by the team as current);
// trips from Butuan are the painted column. The board gives the fare rules but no amount, and no
// days of operation. The ~45-minute trip is the figure tourism.getting-there.inquire uses.
// When MWAI changes the schedule, update BOAT_SCHEDULE below — every answer is built from it.

export const BOAT_SCHEDULE = {
  updated: { english: 'November 2026', bisaya: 'Nobyembre 2026' },
  tripMinutes: 45,
  // Departures from each town.
  magallanes: ['6:20 AM', '7:00 AM', '8:10 AM', '9:30 AM', '11:00 AM', '12:00 NN', '1:00 PM', '2:30 PM', '3:30 PM', '4:30 PM'],
  butuan: ['7:10 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 NN', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '4:45 PM', '5:30 PM'],
};

export const BOAT_INTENT = 'transport.boat.schedule.inquire';
const ASPECT_INTENTS = {
  first: 'transport.boat.first-trip.inquire',
  last: 'transport.boat.last-trip.inquire',
  next: 'transport.boat.next-trip.inquire',
  fare: 'transport.boat.fare.inquire',
  duration: 'transport.boat.duration.inquire',
  count: 'transport.boat.trips-per-day.inquire',
  days: 'transport.boat.days.inquire',
  terminal: 'transport.boat.terminal.inquire',
};
const ASPECT_OF = Object.fromEntries(Object.entries(ASPECT_INTENTS).map(([a, i]) => [i, a]));
export const BOAT_INTENTS = [BOAT_INTENT, ...Object.values(ASPECT_INTENTS)];
export const isBoatIntent = (intent = '') => BOAT_INTENTS.includes(intent);

// --- What is being asked ----------------------------------------------------------------------

// Checked in this order: "pila ka byahe?" is a count, not a fare; "last trip on Sunday" a last trip.
const ASPECTS = [
  ['count', /\b(how\s*many\s*(trips?|times|boats?|byahe)|pila\s*ka\s*(byahe|biyahe|trips?|baroto|beses))\b/i],
  ['duration', /\b(how\s*long|kadugay|dugay|pila\s*ka\s*(minuto|minutos|minutes|oras)|gaano\s*katagal|travel\s*time|minutes?|minutos)\b/i],
  ['fare', /\b(fares?|pamasahe|plete|bayad|tag\s*pila|tagpila|magkano|how\s*much|price|presyo|half\s*fare|discount|diskwento|students?|estudyante|seniors?|bata|children|kids?)\b/i],
  ['last', /\b(last|ulahi|katapusan\w*|final)\b/i],
  ['first', /\b(first|una|unang|earliest|pinakasayo)\b/i],
  ['next', /\b(next|sunod|karon|karong|now|still|naa\s*pa|pa\s*bay|available)\b/i],
  ['days', /\b(sundays?|domingo|saturdays?|sabado|weekends?|holidays?|daily|every\s*day|everyday|matag\s*adlaw|kada\s*adlaw|adlaw-?adlaw)\b/i],
  ['terminal', /\b(where|asa|diin|terminal|pantalan|port|sakayan|dunggoanan)\b/i],
];
// A bare "pila?" ("how much?") after a boat answer asks the fare.
const BARE_PILA = /^\s*(pila|tag\s*pila|tagpila)\s*(man|na|sad|sab|pud)?\s*[?.!]*\s*$/i;

/** The aspect a boat question asks about, or null for the schedule as a whole. */
export function boatAspect(q = '') {
  if (BARE_PILA.test(q)) return 'fare';
  if (parseTime(q) !== null) return 'next';
  const hit = ASPECTS.find(([, re]) => re.test(q));
  // "unsa ang schedule sa baroto karon?" asks for today's schedule, not the next boat.
  if (hit?.[0] === 'next' && SCHEDULE_WORDS.test(q)) return null;
  return hit ? hit[0] : null;
}
const SCHEDULE_WORDS = /\b(schedules?|sched|iskedyul|eskedyul|timetable)\b/i;

const FROM_BUTUAN =
  /\b(gikan\s*(sa\s*)?butuan|from\s*butuan|leaves?\s*butuan|mobiya\s*(sa\s*)?butuan|(paingon|padulong|pauli|going|to)\s*(sa\s*)?magallanes|pauli|pabalik|balik|return\w*)\b/i;
const FROM_MAGALLANES =
  /\b(gikan\s*(sa\s*)?magallanes|from\s*magallanes|leaves?\s*magallanes|mobiya\s*(sa\s*)?magallanes|(paingon|padulong|going|adto|to)\s*(sa\s*)?butuan|pa-?butuan)\b/i;

/** The town the asked-about boats leave from, or null for both directions. */
export function boatDirection(q = '') {
  const butuan = FROM_BUTUAN.test(q);
  const magallanes = FROM_MAGALLANES.test(q);
  if (butuan === magallanes) return null;
  return butuan ? 'butuan' : 'magallanes';
}

/** The specific boat intent for a question; `lastIntent` keeps the aspect for "how about from Butuan?". */
export function boatIntentFor(q = '', lastIntent = '') {
  const aspect = boatAspect(q);
  if (aspect) return ASPECT_INTENTS[aspect];
  if (isBoatIntent(lastIntent) && boatDirection(q)) return lastIntent;
  return BOAT_INTENT;
}

// --- Times ------------------------------------------------------------------------------------

const toMinutes = (t) => {
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM|NN)/);
  let h = Number(m[1]) % 12;
  if (m[3] === 'PM') h += 12;
  if (m[3] === 'NN') h = 12;
  return h * 60 + Number(m[2]);
};
const formatMinutes = (min) => {
  const h = Math.floor(min / 60);
  const mm = String(min % 60).padStart(2, '0');
  if (h === 12 && mm === '00') return '12:00 NN';
  return `${h % 12 || 12}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
};

/**
 * A clock time named in the question ("alas 5", "5 pm", "3:30", "alas 9 sa buntag"), in minutes
 * after midnight, or null. Without am/pm, 6–11 is morning and 1–5 afternoon — the boats' hours.
 */
export function parseTime(q = '') {
  const m = q.match(/\balas\s*(\d{1,2})(?:[:.](\d{2}))?|\b(\d{1,2})[:.](\d{2})\b|\b(\d{1,2})\s*(?=a\.?m\b|p\.?m\b|nn\b|noon\b)/i);
  if (!m) return null;
  let h = Number(m[1] ?? m[3] ?? m[5]);
  const min = Number(m[2] ?? m[4] ?? 0);
  if (h > 23 || min > 59) return null;
  const rest = q.slice(m.index);
  if (h <= 12) {
    if (/\b(noon|nn|udto|tungang\s*adlaw)\b/i.test(rest)) h = 12;
    else if (/\b(p\.?m\.?|hapon|gabii|afternoon|evening|night)\b/i.test(rest)) h = (h % 12) + 12;
    else if (/\b(a\.?m\.?|buntag|morning)\b/i.test(rest)) h %= 12;
    else if (h >= 1 && h <= 5) h += 12;
  }
  return h * 60 + min;
}

/** Minutes after midnight now, in Philippine time. */
function manilaMinutes(date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
  return get('hour') * 60 + get('minute');
}

// --- Answers ----------------------------------------------------------------------------------

const T = {
  english: {
    from: { magallanes: 'From Magallanes to Butuan', butuan: 'From Butuan to Magallanes' },
    last: '(last trip)',
    source: `Schedule from the MWAI board (${BOAT_SCHEDULE.updated.english}); trips can change in bad weather, so confirm at the terminal.`,
  },
  bisaya: {
    from: { magallanes: 'Gikan Magallanes paingon Butuan', butuan: 'Gikan Butuan paingon Magallanes' },
    last: '(last trip)',
    source: `Iskedyul gikan sa board sa MWAI (${BOAT_SCHEDULE.updated.bisaya}); mausab ang byahe kung dili maayo ang panahon, mao nga kumpirmaha sa terminal.`,
  },
};
const dirs = (direction) => (direction ? [direction] : ['magallanes', 'butuan']);
const timesOf = (d) => BOAT_SCHEDULE[d];
const listLine = (d) => timesOf(d).map((t, i, all) => (i === all.length - 1 ? `${t} (last trip)` : t)).join(' · ');

function fullSchedule(direction, lang) {
  const t = T[lang];
  // One direction asked ("what time does the boat leave Butuan?"): just those departures.
  if (direction) {
    const lead =
      lang === 'bisaya'
        ? `Mga oras sa baroto ${t.from[direction].replace(/^Gikan/, 'gikan')} (mga ${BOAT_SCHEDULE.tripMinutes} minutos ang byahe):`
        : `Boats ${t.from[direction].replace(/^From/, 'from')} (about ${BOAT_SCHEDULE.tripMinutes} minutes):`;
    return `${lead}\n${listLine(direction)}\n${t.source}`;
  }
  const header =
    lang === 'bisaya'
      ? `Ang mga pasaherong baroto tali sa Magallanes ug Butuan City gipadagan sa Magallanes Watercraft Association, Inc. (MWAI). Mga ${BOAT_SCHEDULE.tripMinutes} minutos ang byahe. Iskedyul nga gipaskil sa terminal sa baroto (${BOAT_SCHEDULE.updated.bisaya}):`
      : `Passenger boats between Magallanes and Butuan City are run by the Magallanes Watercraft Association, Inc. (MWAI). The trip takes about ${BOAT_SCHEDULE.tripMinutes} minutes. Schedule posted at the boat terminal (${BOAT_SCHEDULE.updated.english}):`;
  const lists = dirs(direction).map((d) => `${t.from[d]}:\n${listLine(d)}`).join('\n\n');
  const fare =
    lang === 'bisaya'
      ? 'Pamasahe: ang mga bata nga 3 hangtod 11 anyos tunga ra ang bayad (half fare); 12 anyos pataas, full fare. Ang mga estudyante ug senior citizen kinahanglan magpakita og valid ID para sa ilang diskwento. Pangutana sa terminal sa eksaktong pamasahe karon. Mausab ang byahe labi na kung dili maayo ang panahon, mao nga kumpirmaha una sa terminal.'
      : 'Fare: children 3 to 11 years old pay half fare; 12 years old and above pay full fare. Students and senior citizens must show a valid ID for their discount. Ask at the terminal for the current fare. Trips can change, especially in bad weather, so confirm at the terminal before you go.';
  return `${header}\n\n${lists}\n\n${fare}`;
}

function firstOrLast(which, direction, lang) {
  const t = T[lang];
  const pick = (d) => (which === 'first' ? timesOf(d)[0] : timesOf(d)[timesOf(d).length - 1]);
  const label = which === 'first' ? (lang === 'bisaya' ? 'Unang byahe' : 'First trip') : lang === 'bisaya' ? 'Last trip' : 'Last trip';
  if (direction) {
    const lower = lang === 'bisaya' ? t.from[direction].replace(/^Gikan/, 'gikan') : t.from[direction].replace(/^From/, 'from');
    return `${label} ${lower}: ${pick(direction)}.\n${t.source}`;
  }
  return `${label}:\n${dirs(null).map((d) => `• ${t.from[d]}: ${pick(d)}`).join('\n')}\n${t.source}`;
}

function nextTrip(direction, lang, ref, explicit) {
  const t = T[lang];
  const at = formatMinutes(ref);
  const lines = dirs(direction).map((d) => {
    const times = timesOf(d);
    const i = times.findIndex((x) => toMinutes(x) >= ref);
    if (i === -1) {
      return lang === 'bisaya'
        ? `• ${t.from[d]}: wala na — ang last trip ${times[times.length - 1]}`
        : `• ${t.from[d]}: none — the last trip leaves at ${times[times.length - 1]}`;
    }
    return `• ${t.from[d]}: ${times[i]}${i === times.length - 1 ? ` ${t.last}` : ''}`;
  });
  const noneLeft = dirs(direction).every((d) => toMinutes(timesOf(d)[timesOf(d).length - 1]) < ref);
  let head;
  if (explicit) head = lang === 'bisaya' ? `Sunod nga baroto sukad ${at}:` : `Next boat at or after ${at}:`;
  else head = lang === 'bisaya' ? `Karon ${at}. Sunod nga baroto:` : `It's ${at} now. Next boat:`;
  let tail = '';
  if (noneLeft && !explicit) {
    tail =
      lang === 'bisaya'
        ? `\nUgma, ang unang byahe: ${dirs(direction).map((d) => `${timesOf(d)[0]} gikan ${d === 'magallanes' ? 'Magallanes' : 'Butuan'}`).join(', ')}.`
        : `\nTomorrow's first trips: ${dirs(direction).map((d) => `${timesOf(d)[0]} from ${d === 'magallanes' ? 'Magallanes' : 'Butuan'}`).join(', ')}.`;
  }
  return `${head}\n${lines.join('\n')}${tail}\n${t.source}`;
}

function simple(aspect, direction, lang) {
  const t = T[lang];
  const S = BOAT_SCHEDULE;
  const en = lang !== 'bisaya';
  switch (aspect) {
    case 'fare':
      return en
        ? 'Boat fare (MWAI): children 3 to 11 years old pay half fare; 12 years old and above pay full fare. Students and senior citizens must show a valid ID for their discount. The board does not list the amount, so ask at the boat terminal for the current fare.'
        : 'Pamasahe sa baroto (MWAI): ang mga bata nga 3 hangtod 11 anyos tunga ra ang bayad (half fare); 12 anyos pataas, full fare. Ang mga estudyante ug senior citizen kinahanglan magpakita og valid ID para sa ilang diskwento. Wala gibutang sa board ang kantidad, mao nga pangutana sa terminal sa baroto sa eksaktong pamasahe karon.';
    case 'duration':
      return en
        ? `The boat ride between Magallanes and Butuan City takes about ${S.tripMinutes} minutes.`
        : `Mga ${S.tripMinutes} minutos ang byahe sa baroto tali sa Magallanes ug Butuan City.`;
    case 'count':
      return `${dirs(direction)
        .map((d) => {
          const times = timesOf(d);
          return en
            ? `• ${t.from[d]}: ${times.length} trips a day, ${times[0]} to ${times[times.length - 1]}`
            : `• ${t.from[d]}: ${times.length} ka byahe kada adlaw, ${times[0]} hangtod ${times[times.length - 1]}`;
        })
        .join('\n')}\n${t.source}`;
    case 'days':
      return en
        ? "The MWAI schedule board lists one set of trip times and doesn't mention Sundays or holidays. Ask at the boat terminal whether the boats run on those days."
        : 'Usa ra ka set sa oras ang nakalista sa board sa MWAI ug wala kini maghisgot sa Domingo o holiday. Pangutana sa terminal sa baroto kung naay byahe niadtong mga adlawa.';
    case 'terminal':
      return en
        ? "The passenger boats are run by the Magallanes Watercraft Association, Inc. (MWAI), which posts its schedule at its boat terminal. I don't have the terminal's exact location on file yet — ask at the Municipal Hall."
        : 'Ang mga pasaherong baroto gipadagan sa Magallanes Watercraft Association, Inc. (MWAI), nga nagpaskil sa iskedyul sa ilang terminal sa baroto. Wala pa nako ang eksaktong lokasyon sa terminal — pangutana sa Munisipyo.';
    default:
      return null;
  }
}

/**
 * The reply for a boat intent: the specific aspect it names, for the direction the message asks
 * about (both when it says neither).
 * @param {string} intent  one of BOAT_INTENTS
 * @param {string} message the visitor's question (for the direction and a named time)
 * @param {'english'|'bisaya'} language
 * @param {Date} [now]
 */
export function boatReply(intent, message = '', language = 'english', now = new Date()) {
  const lang = language === 'bisaya' ? 'bisaya' : 'english';
  const aspect = ASPECT_OF[intent] || null;
  const direction = boatDirection(message);
  if (aspect === 'first' || aspect === 'last') return firstOrLast(aspect, direction, lang);
  if (aspect === 'next') {
    const named = parseTime(message);
    return nextTrip(direction, lang, named ?? manilaMinutes(now), named !== null);
  }
  return simple(aspect, direction, lang) ?? fullSchedule(direction, lang);
}

/**
 * Fixed versions for INTENT_RESPONSES (the admin "change an existing answer" list and the fallback
 * when no message is at hand): both directions; the next-trip one is the full schedule.
 */
export const BOAT_RESPONSES = Object.fromEntries(
  BOAT_INTENTS.map((intent) => {
    const fixed = intent === ASPECT_INTENTS.next ? BOAT_INTENT : intent;
    return [intent, { english: boatReply(fixed, '', 'english'), bisaya: boatReply(fixed, '', 'bisaya') }];
  })
);
