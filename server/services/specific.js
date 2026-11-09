// server/services/specific.js
//
// Answers worked out from the question itself, so a specific question gets a specific answer
// (the panel's requirement) where the topic's own answer is a schedule or a fee table:
//   - office hours on the day asked about ("Open ba karong Sabado?", "Is it open on Friday?");
//   - the building fee for the floor area named ("building permit for a 50 sqm house?").
// Both use the figures already in the topics' answers (generalInfo.js OFFICE_HOURS, responses.js
// permit.building.fee.inquire), so the two can never disagree.

const DAYS = [
  ['sunday', /\b(sundays?|domingo)\b/i],
  ['monday', /\b(mondays?|lunes)\b/i],
  ['tuesday', /\b(tuesdays?|martes)\b/i],
  ['wednesday', /\b(wednesdays?|miyerkules)\b/i],
  ['thursday', /\b(thursdays?|huwebes)\b/i],
  ['friday', /\b(fridays?|biyernes)\b/i],
  ['saturday', /\b(saturdays?|sabado)\b/i],
];
const DAY_NAMES = {
  english: { sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' },
  bisaya: { sunday: 'Domingo', monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miyerkules', thursday: 'Huwebes', friday: 'Biyernes', saturday: 'Sabado' },
};

/** Today in the Philippines, as a DAYS key. */
function manilaDay(now) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long' }).format(now).toLowerCase();
}

/** The day a question asks about: one it names, "today"/"karon", or the weekend; else null. */
function askedDay(q, now) {
  if (/\b(holidays?|piyesta\s*opisyal)\b/i.test(q)) return 'holiday';
  if (/\b(weekends?)\b/i.test(q)) return 'saturday';
  const named = DAYS.find(([, re]) => re.test(q));
  if (named) return named[0];
  if (/\b(today|karon|karong\s*adlawa|now)\b/i.test(q)) return manilaDay(now);
  return null;
}

/**
 * Whether the municipal offices are open on the day asked about. Weekends and holidays are closed
 * under either schedule; Friday depends on whether the 2026 compressed work week is in force.
 */
function officeHoursOnDay(q, lang, now) {
  const day = askedDay(q, now);
  if (!day) return null;
  const en = lang !== 'bisaya';
  if (day === 'holiday') {
    return en
      ? 'Municipal offices are closed on regular holidays. For special non-working days, check the latest LGU announcement.'
      : 'Sirado ang mga opisina sa munisipyo kung regular holiday. Para sa special non-working day, tan-awa ang pinakabag-ong pahibalo sa LGU.';
  }
  const name = DAY_NAMES[lang === 'bisaya' ? 'bisaya' : 'english'][day];
  // "Open on weekends?" — both days, not just the Saturday it was read as.
  if (/\b(weekends?)\b/i.test(q)) {
    return en
      ? 'No — municipal offices are closed on weekends (Saturday and Sunday). They open on weekdays.'
      : 'Dili — sirado ang mga opisina sa munisipyo kung weekend (Sabado ug Domingo). Abri sila kung adlaw sa trabaho (weekdays).';
  }
  if (day === 'saturday' || day === 'sunday') {
    return en
      ? `No — municipal offices are closed on ${name}s. They open on weekdays.`
      : `Dili — sirado ang mga opisina sa munisipyo kung ${name}. Abri sila kung adlaw sa trabaho (weekdays).`;
  }
  if (day === 'friday') {
    return en
      ? 'It depends on the schedule in force: offices normally open on Friday, 8:00 AM to 5:00 PM, but under the compressed work week the LGU announced in 2026 there is no office on Friday. Please check the latest LGU announcement before you go.'
      : 'Depende sa iskedyul karon: kasagaran abri ang mga opisina kung Biyernes, 8:00 AM hangtod 5:00 PM, apan ubos sa compressed work week nga gipahibalo sa LGU niadtong 2026, walay opisina kung Biyernes. Palihug tan-awa una ang pinakabag-ong pahibalo sa LGU.';
  }
  return en
    ? `Yes — offices are open on ${name}: normally 8:00 AM to 5:00 PM, or 7:00 AM to 6:00 PM under the LGU's 2026 compressed work week.`
    : `Oo — abri ang mga opisina kung ${name}: kasagaran 8:00 AM hangtod 5:00 PM, o 7:00 AM hangtod 6:00 PM ubos sa compressed work week sa LGU niadtong 2026.`;
}

// Building fee per m² for a single-family house (National Building Code, Revised IRR, Division
// A-1), the same brackets permit.building.fee.inquire lists. The whole floor area is charged at the
// rate of the bracket it falls in.
const HOUSE_RATES = [
  [50, 3.4],
  [100, 4.8],
  [150, 6.0],
  [Infinity, 7.2],
];
const AREA = /(\d+(?:\.\d+)?)\s*(?:sq\.?\s*m\.?|sqm|square\s*met(?:er|re)s?|m²|m2|metro\s*kwadrado|kwadrado|square)\b/i;
const NOT_A_HOUSE = /\b(commercial|business|negosyo|store|tindahan|shop|warehouse|bodega|apartment|boarding|hotel|resort|church|school|factory|office)\b/i;
const peso = (x) =>
  '₱' + (Number.isInteger(x) ? x.toLocaleString('en-US') : x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

/** The building fee for the house floor area named in the question, or null. */
function buildingFeeFor(q, lang) {
  const m = q.match(AREA);
  if (!m || NOT_A_HOUSE.test(q)) return null;
  const area = Number(m[1]);
  if (!(area > 0 && area < 100000)) return null;
  const renovation = /\b(renovat\w*|addition|extension|dugang|pa-?ayo|ayo)\b/i.test(q);
  const rate = area <= 20 ? (renovation ? 2.4 : 2.0) : HOUSE_RATES.find(([max]) => area <= max)[1];
  const fee = Math.round(area * rate * 100) / 100;
  const sum = `${area} × ${peso(rate)} = ${peso(fee)}`;
  return lang === 'bisaya'
    ? `Para sa balay sa usa ka pamilya nga ${area} m², ang building fee kay ${sum} (fee schedule sa National Building Code, Division A-1). Dugang pa ang ubang bayad — line and grade, electrical, plumbing, koral ug Certificate of Occupancy — ug ang Municipal Engineering Office ang mo-compute sa eksaktong total gikan sa imong plano.`
    : `For a single-family house of ${area} m², the building fee is ${sum} (National Building Code fee schedule, Division A-1). Other fees are added — line and grade, electrical, plumbing, fencing and the Certificate of Occupancy — and the Municipal Engineering Office computes the exact total from your plans.`;
}

/**
 * A reply worked out from the question for these intents, or null to use the topic's answer.
 * @param {{ intent: string, question: string, language?: 'english'|'bisaya', now?: Date }} turn
 */
export function specificAnswer({ intent, question = '', language = 'english', now = new Date() }) {
  const lang = language === 'bisaya' ? 'bisaya' : 'english';
  if (intent === 'office.hours.inquire') return officeHoursOnDay(question, lang, now);
  if (intent === 'permit.building.fee.inquire') return buildingFeeFor(question, lang);
  return null;
}

// --- Answers for questions that had none of their own ------------------------------------------

/** Local intents (not in the Dialogflow agent): the routing in languageDetect.js picks them. */
export const SPECIFIC_RESPONSES = {
  // "Pila ang bayad sa birth certificate?" got the whole LCRO fee list, which has no birth
  // certificate copy in it. The PSA figures are the ones psa.certificate.inquire gives.
  'civil.registry.birth-copy.fee.inquire': {
    english:
      'A copy of a birth certificate:\n• PSA copy (on security paper — needed for passports and most jobs): ₱155 at a PSA Civil Registry System outlet, or about ₱330 online at https://www.psaserbilis.com.ph, delivered.\n• Local certified copy from the Local Civil Registry Office (LCRO) at the Municipal Hall, for births registered in Magallanes: the fee is not on file — ask the LCRO.',
    bisaya:
      'Kopya sa birth certificate:\n• PSA copy (sa security paper — kinahanglan sa passport ug kadaghanan sa trabaho): ₱155 sa PSA Civil Registry System outlet, o mga ₱330 online sa https://www.psaserbilis.com.ph, i-deliver.\n• Local certified copy gikan sa Local Civil Registry Office (LCRO) sa Munisipyo, para sa natawo nga narehistro sa Magallanes: wala pay listahan sa bayad — pangutana sa LCRO.',
  },
  // "Where do I get a building permit?" got the requirements checklist.
  'permit.building.location.inquire': {
    english:
      'Apply for a building permit at the Office of the Building Official — the Municipal Engineering Office — at the Municipal Hall in Poblacion, during office hours.',
    bisaya:
      'Mag-apply og building permit sa Office of the Building Official — ang Municipal Engineering Office — sa Munisipyo sa Poblacion, sa oras sa opisina.',
  },
};
