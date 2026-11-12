// server/services/specific.js
//
// Answers worked out from the question itself, so a specific question gets a specific answer
// (the panel's requirement) where the topic's own answer is a schedule or a fee table:
//   - office hours on the day asked about ("Open ba karong Sabado?", "Is it open on Friday?");
//   - the building fee for the floor area named ("building permit for a 50 sqm house?").
// Both use the figures already in the topics' answers (generalInfo.js OFFICE_HOURS, responses.js
// permit.building.fee.inquire), so the two can never disagree.

import { RHU_SCHEDULE, YAKAP_MEDICINES, YAKAP_MEDICINE_GROUPS, yakapMedicinesIn, yakapTestsIn } from './health.js';

//   - the Rural Health Unit's services on the day asked about, and whether a medicine or test is on
//     the PhilHealth YAKAP poster (health.js, the RHU posters of November 2026).

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
  if (/\b(tomorrow|ugma|bukas\s*ng\s*umaga)\b/i.test(q)) return manilaDay(new Date(now.getTime() + 864e5));
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

// ---- The Rural Health Unit's posted schedule (health.js RHU_SCHEDULE) ----

const WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const hour = (h, en) => (h < 12 ? `${h} AM` : h === 12 ? (en ? '12 noon' : '12 sa udto') : `${h - 12} PM`);
const span = ([open, close], en) => `${hour(open, en)}–${hour(close, en)}`;
const andList = (items, en) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ${en ? 'and' : 'ug'} ${items.at(-1)}`);

/** A service's days in words: "Monday to Thursday, 8 AM–5 PM; Friday, 8 AM–12 noon". */
function daysInWords(days, en) {
  const names = DAY_NAMES[en ? 'english' : 'bisaya'];
  const groups = [];
  for (const day of WEEK) {
    if (!days[day]) continue;
    const key = days[day].join('-');
    const group = groups.find((g) => g.key === key);
    if (group) group.days.push(day);
    else groups.push({ key, hours: days[day], days: [day] });
  }
  return groups
    .map(({ days: ds, hours }) => {
      const consecutive = ds.every((d, i) => i === 0 || WEEK.indexOf(d) === WEEK.indexOf(ds[i - 1]) + 1);
      const label = consecutive && ds.length >= 3 ? `${names[ds[0]]} ${en ? 'to' : 'hangtod'} ${names[ds.at(-1)]}` : andList(ds.map((d) => names[d]), en);
      return `${label}, ${span(hours, en)}`;
    })
    .join('; ');
}

// Which posted services each topic's day question is about.
const RHU_DAY_SERVICES = {
  'health.consultation.inquire': () => ['consultation'],
  'rhu.dental.inquire': () => ['dental'],
  'rhu.family-planning.inquire': () => ['familyPlanning'],
  'health.rhu.laboratory.inquire': (q) => (PREGNANT.test(q) ? ['pregnantLab'] : ['laboratory', 'pregnantLab']),
  'health.prenatal.inquire': (q) => (/\b(lab\w*|tests?)\b/i.test(q) ? ['pregnantLab'] : []),
  'health.rhu.schedule.inquire': () => Object.keys(RHU_SCHEDULE),
};
const PREGNANT = /\b(pregnan\w*|buntis|mabdos|prenatal)\b/i;
const POPULATION_Q = /\b(population|populasyon|residents|how\s*many\s*people|pila\s*(ka\s*)?(ang\s*)?(tawo|katawhan|nagpuyo))\b/i;

/** What the RHU offers on the day asked about, from its posted schedule. */
function rhuOnDay(intent, q, lang, now) {
  const day = askedDay(q, now);
  const keys = RHU_DAY_SERVICES[intent](q).filter((k) => RHU_SCHEDULE[k]);
  if (keys.length === 0 || day === 'holiday') return null;
  const en = lang !== 'bisaya';
  // "Kanus-a ang lab sa mabdos?" / "What days is the dentist in?": one service's days, no more.
  if (!day) {
    const asksWhen = /\b(when|kanus-?a|kailan|what\s*days?|which\s*days?|unsa\s*(nga\s*)?adlaw|unsang\s*adlaw|schedule|iskedyul)\b/i.test(q);
    if (!asksWhen || keys.length !== 1) return null;
    const service = RHU_SCHEDULE[keys[0]];
    return en
      ? `${service.en} at the Rural Health Unit: ${daysInWords(service.days, en)}.`
      : `${service.ceb} sa Rural Health Unit: ${daysInWords(service.days, en)}.`;
  }
  const dayName = DAY_NAMES[en ? 'english' : 'bisaya'][day];
  const label = (k) => RHU_SCHEDULE[k][en ? 'en' : 'ceb'];
  const lower = (k) => (en ? label(k).toLowerCase() : label(k));

  // One service: yes with its hours that day, or no with the days it is on.
  if (keys.length === 1 || (intent === 'health.rhu.laboratory.inquire' && !PREGNANT.test(q))) {
    const [main, extra] = keys;
    const hours = RHU_SCHEDULE[main].days[day];
    const also = extra && RHU_SCHEDULE[extra].days[day] ? (en ? ` ${label(extra)} are also that day, ${span(RHU_SCHEDULE[extra].days[day], en)}.` : ` Ang ${label(extra)} anaa pud nianang adlawa, ${span(RHU_SCHEDULE[extra].days[day], en)}.`) : '';
    if (hours) {
      return en
        ? `Yes — ${lower(main)} at the Rural Health Unit is on ${dayName}, ${span(hours, en)}.${also}`
        : `Oo — ang ${label(main)} sa Rural Health Unit anaa kung ${dayName}, ${span(hours, en)}.${also}`;
    }
    return en
      ? `No — ${lower(main)} at the Rural Health Unit is not on ${dayName}. It is on ${daysInWords(RHU_SCHEDULE[main].days, en)}.`
      : `Dili — ang ${label(main)} sa Rural Health Unit wala kung ${dayName}. Anaa kini kung ${daysInWords(RHU_SCHEDULE[main].days, en)}.`;
  }

  // The whole schedule: what is on that day, and what is not.
  const open = keys.filter((k) => RHU_SCHEDULE[k].days[day]);
  const closed = keys.filter((k) => !RHU_SCHEDULE[k].days[day]);
  if (open.length === 0) {
    return en
      ? `None of the Rural Health Unit's posted services are on ${dayName}; they run Monday to Friday. For an emergency, go to a hospital or call 911.`
      : `Walay serbisyo sa Rural Health Unit kung ${dayName} sumala sa gi-post nga iskedyul; Lunes hangtod Biyernes ra kini. Kung emergency, adto sa ospital o tawag sa 911.`;
  }
  const lines = open.map((k) => `• ${label(k)}: ${span(RHU_SCHEDULE[k].days[day], en)}`).join('\n');
  const notOn = closed.length
    ? en
      ? `\nNot on ${dayName}: ${closed.map((k) => `${lower(k)} (${daysInWords(RHU_SCHEDULE[k].days, en)})`).join('; ')}.`
      : `\nWala kung ${dayName}: ${closed.map((k) => `${label(k)} (${daysInWords(RHU_SCHEDULE[k].days, en)})`).join('; ')}.`
    : '';
  return en ? `On ${dayName}, the Rural Health Unit has:\n${lines}${notOn}` : `Kung ${dayName}, anaa sa Rural Health Unit ang:\n${lines}${notOn}`;
}

// ---- Items on the PhilHealth YAKAP poster (health.js) ----

/** "Is metformin covered?" → yes, with its group; "tambal sa high blood?" → that group's medicines. */
function yakapMedicineAnswer(q, lang) {
  const en = lang !== 'bisaya';
  const tail = en
    ? 'Registered members get listed medicines through a check-up at the Rural Health Unit, within the ₱20,000 yearly budget; the doctor decides what you need.'
    : 'Makuha sa mga rehistradong miyembro ang mga tambal sa lista pinaagi sa check-up sa Rural Health Unit, sulod sa ₱20,000 nga budget kada tuig; ang doktor ang modesisyon kung unsa ang imong kinahanglan.';
  const named = yakapMedicinesIn(q);
  if (named.length) {
    const items = named.map((m) => `${m.name} (${YAKAP_MEDICINE_GROUPS[m.group][en ? 'en' : 'ceb']})`);
    return en
      ? `Yes — ${andList(items, en)} ${named.length > 1 ? 'are' : 'is'} on the PhilHealth YAKAP medicines list. ${tail}`
      : `Oo — ang ${andList(items, en)} anaa sa lista sa tambal sa PhilHealth YAKAP. ${tail}`;
  }
  const groups = Object.entries(YAKAP_MEDICINE_GROUPS).filter(([key, g]) => g.re.test(q) && !(key === 'fluids' && /\bors\b/i.test(q) && !/\b(diarrh\w*|kalibanga|dehydrat\w*)\b/i.test(q)));
  if (groups.length === 0) return null;
  const lines = groups.map(([key, g]) => {
    const meds = YAKAP_MEDICINES.filter((m) => m.group === key).map((m) => m.name);
    return en ? `${g.en[0].toUpperCase()}${g.en.slice(1)}: ${andList(meds, en)}` : `${g.ceb[0].toUpperCase()}${g.ceb.slice(1)}: ${andList(meds, en)}`;
  });
  return en
    ? `On the PhilHealth YAKAP medicines list:\n${lines.map((l) => `• ${l}`).join('\n')}\n${tail}`
    : `Sa lista sa tambal sa PhilHealth YAKAP:\n${lines.map((l) => `• ${l}`).join('\n')}\n${tail}`;
}

/** "Libre ba ang chest x-ray?" / "Is mammogram covered?" → yes, and where it is done. */
function yakapTestAnswer(q, lang) {
  const en = lang !== 'bisaya';
  const named = yakapTestsIn(q);
  if (named.length === 0) return null;
  const parts = [];
  const labs = named.filter((t) => t.list === 'lab').map((t) => t.name);
  const screens = named.filter((t) => t.list === 'screening').map((t) => t.name);
  if (labs.length) {
    parts.push(
      en
        ? `Yes — ${andList(labs, en)} ${labs.length > 1 ? 'are' : 'is'} on the PhilHealth YAKAP list of laboratory tests, free for registered members when the doctor says you need ${labs.length > 1 ? 'them' : 'it'}. Some tests are done at the RHU laboratory (Monday to Friday, 8 AM–5 PM); others at a diagnostic center, with a referral from the RHU.`
        : `Oo — ang ${andList(labs, en)} anaa sa lista sa laboratory test sa PhilHealth YAKAP, libre sa mga rehistradong miyembro kung ingnon sa doktor nga kinahanglan nimo. Ang uban buhaton sa laboratory sa RHU (Lunes hangtod Biyernes, 8 AM–5 PM); ang uban sa diagnostic center, uban ang referral gikan sa RHU.`,
    );
  }
  if (screens.length) {
    parts.push(
      en
        ? `Yes — ${andList(screens, en)} ${screens.length > 1 ? 'are' : 'is'} among the other primary care services under PhilHealth YAKAP. Register for YAKAP at the Rural Health Unit, then ask the doctor there whether you need ${screens.length > 1 ? 'them' : 'it'} and for a referral.`
        : `Oo — ang ${andList(screens, en)} usa sa ubang primary care nga serbisyo ubos sa PhilHealth YAKAP. Magparehistro sa YAKAP sa Rural Health Unit, unya pangutana sa doktor didto kung kinahanglan nimo ug para sa referral.`,
    );
  }
  return parts.join('\n');
}

/**
 * A reply worked out from the question for these intents, or null to use the topic's answer.
 * @param {{ intent: string, question: string, language?: 'english'|'bisaya', now?: Date }} turn
 */
export function specificAnswer({ intent, question = '', language = 'english', now = new Date() }) {
  const lang = language === 'bisaya' ? 'bisaya' : 'english';
  if (intent === 'office.hours.inquire') return officeHoursOnDay(question, lang, now);
  if (intent === 'permit.building.fee.inquire') return buildingFeeFor(question, lang);
  // "population of barangay poblacion": not on record per barangay; the town's total is.
  if (intent === 'about.facts.inquire' && POPULATION_Q.test(question) && /\b(buhang|caloc-?an|guiasan|marcos|poblacion|santo\s*ni(ñ|n)o|sto\.?\s*ni(ñ|n)o|santo\s*rosario|sto\.?\s*rosario|taod-?oy|barangays?|brgy)\b/i.test(question)) {
    return lang === 'bisaya'
      ? 'Wala koy populasyon sa matag barangay. Ang tibuok Magallanes naay 22,780 ka tawo sa 2024 Census; ang PSA (https://psa.gov.ph) ang nagpatik sa ihap matag barangay.'
      : "I don't have the population of each barangay. Magallanes as a whole had 22,780 people in the 2024 Census; the PSA (https://psa.gov.ph) publishes the count for each barangay.";
  }
  // "blood test sa RHU pila?": the RHU's lab fees are not on file; YAKAP members' tests are free.
  if (intent === 'health.rhu.laboratory.inquire' && /\b(how\s*much|magkano|pila|tagpila|bayad|price|presyo|cost|fees?)\b/i.test(question) && !/\bpila\s*ka\s*(adlaw|oras)\b/i.test(question)) {
    return lang === 'bisaya'
      ? 'Wala koy listahan sa bayad sa laboratory sa RHU — pangutana sa laboratory sa Rural Health Unit (abri Lunes hangtod Biyernes, 8 AM–5 PM). Ang mga rehistrado sa PhilHealth YAKAP libre sa mga test nga nalista, apil ang CBC, blood sugar, cholesterol ug urinalysis.'
      : "I don't have the RHU laboratory's fees on file — ask the Rural Health Unit laboratory (open Monday to Friday, 8 AM–5 PM). Registered PhilHealth YAKAP members get the listed tests free, including CBC, blood sugar, cholesterol and urinalysis.";
  }
  // "asa ang RHU?": once the agent knew the RHU topics it matched them, and the narrowing kept only
  // the schedule's heading. The RHU's address is not on record: say so, and where to ask.
  if (/^health\.(rhu\.(schedule|laboratory)|consultation)\.inquire$/.test(intent) && /\b(where|asa|diin|saan|nasaan|location|located|address|dapit|nahimutang|unsaon\s*pag-?adto)\b/i.test(question) && !askedDay(question, now)) {
    return lang === 'bisaya'
      ? "Wala pa koy eksaktong address sa Rural Health Unit. Pangutana sa Munisipyo sa Poblacion, o tawag sa Mayor's Office sa 0948-623-6977."
      : "I don't have the Rural Health Unit's exact address on file yet. Ask at the Municipal Hall in Poblacion, or call the Mayor's Office at 0948-623-6977.";
  }
  // "libre ba ang check up sa RHU?": free under YAKAP for members; otherwise not on file.
  if (intent === 'health.consultation.inquire' && /\b(free|libre|how\s*much|magkano|pila|bayad|fee|charge)\b/i.test(question) && !askedDay(question, now)) {
    return lang === 'bisaya'
      ? 'Ang check-up sa Rural Health Unit libre sa mga rehistrado sa PhilHealth YAKAP, ubos sa YAKAP. Sa dili miyembro, wala koy listahan sa bayad — pangutana sa RHU. Medical consultation: Lunes hangtod Huwebes, 8 AM–5 PM; Biyernes, 8 AM–12 sa udto.'
      : "Check-ups at the Rural Health Unit are covered by PhilHealth YAKAP for registered members. For others, I don't have the fee on file — ask the RHU. Medical consultation: Monday to Thursday, 8 AM–5 PM; Friday, 8 AM–12 noon.";
  }
  if (RHU_DAY_SERVICES[intent]) return rhuOnDay(intent, question, lang, now);
  if (intent === 'health.yakap.medicines.inquire') return yakapMedicineAnswer(question, lang);
  if (intent === 'health.yakap.labtest.inquire' || intent === 'health.yakap.screening.inquire') return yakapTestAnswer(question, lang);
  if (intent === 'health.yakap.complaint.inquire') return yakapContactAnswer(question, lang);
  return null;
}

/** "Unsa ang email sa YAKAP?" → the email; "number?" → the text number and the hotline. */
function yakapContactAnswer(q, lang) {
  const en = lang !== 'bisaya';
  const email = /\b(e-?mail)\b/i.test(q);
  const text = /\b(text|mag-?text|mo-?text|cellphone|cell|mobile|sms)\b/i.test(q);
  const number = /\b(numbers?|numero|contact\s*number|call|tawag\w*|phone|telepono)\b/i.test(q);
  // Charged or refused ("gisingil ko sa YAKAP, asa ko mo reklamo?"): the hotline for that.
  if (/\b(charged|\w*singil\w*|refused|gibalibaran|tinanggihan|gipabayad|reklamo|mo-?reklamo|magreklamo|complain\w*|report\w*)\b/i.test(q) && !email && !text) {
    return en
      ? 'If you were refused a YAKAP service or charged for one, report it to PhilHealth at (02) 8662-2588.'
      : 'Kung gibalibaran ka sa serbisyo sa YAKAP o gisingil, i-report kini sa PhilHealth sa (02) 8662-2588.';
  }
  if (email && !text && !number) {
    return en ? 'Email PhilHealth YAKAP at yakaptugon@philhealth.gov.ph for questions or concerns.' : 'Mag-email sa PhilHealth YAKAP sa yakaptugon@philhealth.gov.ph para sa pangutana o concern.';
  }
  if (text && !email) {
    return en ? 'Text PhilHealth YAKAP at 0917 127 5937 for questions or concerns.' : 'Mag-text sa PhilHealth YAKAP sa 0917 127 5937 para sa pangutana o concern.';
  }
  if (number && !email) {
    return en
      ? 'PhilHealth YAKAP numbers:\n• Questions or concerns: text 0917 127 5937\n• Refused a service or charged for one: call (02) 8662-2588'
      : 'Mga numero sa PhilHealth YAKAP:\n• Pangutana o concern: mag-text sa 0917 127 5937\n• Gibalibaran sa serbisyo o gisingil: tawag sa (02) 8662-2588';
  }
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
