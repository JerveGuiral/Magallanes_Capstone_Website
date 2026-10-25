// server/services/liveContent.js
//
// Answers from whatever is currently posted on the website — news, services, officials, offices,
// barangays, bids and transparency documents — read live from the same Supabase tables the site
// and the admin CMS use. Anything staff post or edit becomes answerable within REFRESH_MS, with
// no Dialogflow or code change. (Panel requirement: "whatever is posted, old or new, the chatbot
// must be able to answer.")
//
// The agent still does the language understanding; this module supplies the *facts*:
//   1. explicit content questions ("latest news", "open bids", "annual budget") → those tables;
//   2. officials/barangay intents → the officials, offices and barangays tables, so CMS edits
//      show up in the bot (falls back to officials.js text if a row isn't found);
//   3. anything the agent couldn't classify → a search across all posted content.
// If Supabase is unreachable it returns null and the caller uses the fixed answers.

import { barangayNameForKey } from './officials.js';

const REFRESH_MS = 30 * 1000;
const FALLBACK_INTENTS = new Set(['Default Fallback Intent', 'vague.question.en', 'vague.question.ceb']);

// --- Loading -----------------------------------------------------------------------------------

const QUERIES = {
  news: 'news_announcements?select=id,title,title_bisaya,body,body_bisaya,category,created_at&is_published=eq.true&order=created_at.desc',
  services: 'services?select=name,name_bisaya,category,requirements,requirements_bisaya,fee,processing_time,office&order=name',
  // All officials, former ones included (is_current = false) — the history questions need them.
  officials: 'officials?select=full_name,position,display_order,is_current,term_start,term_end&order=display_order',
  offices: 'offices?select=name,head_name,location,contact_number,email,office_hours&order=name',
  barangays: 'barangays?select=name,captain_name,contact_number&order=name',
  bids: 'bids_awards?select=title,reference_number,status,posting_date,bid_opening_date,award_date,awarded_to&order=posting_date.desc',
  documents: 'transparency_documents?select=title,category,fiscal_year,uploaded_at&is_archived=eq.false&order=uploaded_at.desc',
};

let cache = null;
let cacheAt = 0;
let inflight = null;

async function fetchAll() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const entries = await Promise.all(
    Object.entries(QUERIES).map(async ([name, query]) => {
      const res = await fetch(`${url}/rest/v1/${query}`, { headers });
      if (!res.ok) throw new Error(`${name}: Supabase REST error ${res.status}`);
      return [name, await res.json()];
    })
  );
  return Object.fromEntries(entries);
}

/** Current posted content, refreshed at most every REFRESH_MS; stale data beats none on error. */
export async function getLiveContent() {
  if (cache && Date.now() - cacheAt < REFRESH_MS) return cache;
  if (!inflight) {
    inflight = fetchAll()
      .then((data) => {
        if (data) {
          cache = data;
          cacheAt = Date.now();
        }
        return cache;
      })
      .catch((err) => {
        console.warn('[LiveContent] Could not refresh posted content:', err.message);
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// --- Text matching -----------------------------------------------------------------------------

const STOPWORDS = new Set([
  // English
  'the', 'and', 'for', 'with', 'what', 'whats', 'how', 'where', 'when', 'who', 'which', 'why', 'are', 'is',
  'was', 'there', 'any', 'can', 'could', 'you', 'your', 'about', 'please', 'tell', 'know', 'want', 'need',
  'get', 'this', 'that', 'from', 'have', 'has', 'does', 'did', 'will', 'would', 'should', 'into', 'our',
  'magallanes', 'municipality', 'municipal', 'office', 'offices', 'lgu', 'town',
  // Bisaya / Tagalog function words
  'unsa', 'unsay', 'unsaon', 'ang', 'mga', 'nga', 'naa', 'bay', 'man', 'asa', 'diin', 'kinsa', 'pila',
  'kanus', 'pwede', 'gusto', 'para', 'sab', 'sad', 'pud', 'karon', 'diri', 'kini', 'kana', 'niini',
  'munisipyo', 'lungsod', 'ano', 'saan', 'paano', 'mayroon', 'may', 'bahin', 'mahitungod', 'kumusta',
  'musta', 'tanan', 'kining', 'kanang', 'lang', 'jud', 'gyud', 'diay', 'unta',
]);

// Bisaya words staff are likely to write in English (and vice versa), mapped to one form.
const SYNONYMS = {
  balita: 'news', anunsyo: 'announcement', pahibalo: 'announcement', bakuna: 'vaccination', vaccine: 'vaccination',
  baha: 'flood', flooding: 'flood', bagyo: 'typhoon', tubig: 'water', kuryente: 'electricity', trabaho: 'job',
  jobs: 'job', eskwelahan: 'school', eskwela: 'school', iskolar: 'scholarship', tambal: 'medicine',
  doktor: 'doctor', permiso: 'permit', buhis: 'tax', amilyar: 'tax', yuta: 'land', bidding: 'bid',
};

const normalize = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function tokens(text) {
  // "new" in Bisaya is written bag-o, bag-ong, bag ong, bagong, bago — unhandled, it splits into
  // the meaningless words "bag" and "ong" and is mistaken for a search topic.
  return normalize(String(text ?? '').replace(/\bbag[-\s]?o(ng)?\b/gi, ' latest '))
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map((w) => SYNONYMS[w] || w)
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w));
}

// Words shared by many service titles. They still count toward a match, but cannot be the only
// title word in common: "mayor's permit" must not match "Building Permit", nor "police clearance"
// match "Barangay Clearance".
const GENERIC = new Set([
  'permit', 'certificate', 'clearance', 'license', 'licence', 'registration', 'application', 'requirement',
  'form', 'service', 'card', 'copy', 'document', 'report', 'assistance', 'program',
]);

/** Words of a field, stemmed the same way as the query. */
const fieldWords = (text) => new Set(tokens(text));

/**
 * How well the query matches an item. `fields` are [text, weight]; the first is the title.
 * Returns null unless the title shares at least one distinctive (non-GENERIC) word with the
 * query and at least half of the query words are found somewhere — a single shared word in a
 * long body is not a match. `requireTitle: false` drops the title rule for news searches the
 * visitor explicitly asked for: posts often have short titles ("Free rabies") with the topic
 * ("vaccination") only in the body.
 */
function scoreItem(queryTokens, fields, { requireTitle = true } = {}) {
  if (queryTokens.length === 0) return null;
  const sets = fields.map(([text, weight]) => [fieldWords(text), weight]);
  let score = 0;
  let titleHits = 0;
  let matched = 0;
  for (const t of queryTokens) {
    let best = 0;
    sets.forEach(([words, weight], i) => {
      // Exact word, or a shared stem of 5+ letters ("vaccin" ~ "vaccination").
      const hit =
        words.has(t) ||
        (t.length >= 5 && [...words].some((w) => w.startsWith(t) || (w.length >= 5 && t.startsWith(w))));
      if (hit) {
        best = Math.max(best, weight);
        if (i === 0 && !GENERIC.has(t)) titleHits++;
      }
    });
    if (best) {
      score += best;
      matched++;
    }
  }
  if ((requireTitle && titleHits === 0) || matched === 0 || matched / queryTokens.length < 0.5) return null;
  return score / queryTokens.length;
}

function bestMatch(queryTokens, items, fieldsOf, options) {
  let best = null;
  for (const item of items || []) {
    const s = scoreItem(queryTokens, fieldsOf(item), options);
    if (s !== null && (!best || s > best.score)) best = { item, score: s };
  }
  return best;
}

// --- Formatting --------------------------------------------------------------------------------

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const excerpt = (text = '', max = 320) => {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length <= max ? clean : `${clean.slice(0, max).replace(/\s\S*$/, '')}…`;
};

const pick = (lang, item, field) => (lang === 'bisaya' && item[`${field}_bisaya`]) || item[field];

// Ends a sentence on a name without doubling the period of "Jr." / "Sr.".
const sentence = (name) => (name.endsWith('.') ? name : `${name}.`);

function newsList(items, lang) {
  const lines = items.slice(0, 3).map((n) => `• ${pick(lang, n, 'title')} (${fmtDate(n.created_at)})`);
  return lang === 'bisaya'
    ? `Mga bag-ong anunsyo sa website:\n${lines.join('\n')}\n\nBasaha ang tibuok anunsyo sa News page.`
    : `Latest announcements on the website:\n${lines.join('\n')}\n\nRead the full posts on the News page.`;
}

function newsItem(n, lang) {
  const title = pick(lang, n, 'title');
  const body = excerpt(pick(lang, n, 'body'));
  return lang === 'bisaya'
    ? `${title} (${fmtDate(n.created_at)})\n\n${body}\n\nBasaha ang tibuok anunsyo sa News page.`
    : `${title} (${fmtDate(n.created_at)})\n\n${body}\n\nRead the full post on the News page.`;
}

function serviceItem(s, lang) {
  const ceb = lang === 'bisaya';
  const parts = [pick(lang, s, 'name')];
  const reqs = pick(lang, s, 'requirements');
  if (reqs) parts.push(`${ceb ? 'Mga kinahanglan' : 'Requirements'}:\n${reqs}`);
  if (s.office) parts.push(`${ceb ? 'Opisina' : 'Office'}: ${s.office}`);
  if (s.fee) parts.push(`${ceb ? 'Bayad' : 'Fee'}: ${s.fee}`);
  if (s.processing_time) parts.push(`${ceb ? 'Kadugayon' : 'Processing time'}: ${s.processing_time}`);
  return parts.join('\n\n');
}

function officeItem(o, content, lang) {
  const ceb = lang === 'bisaya';
  const contacts = [o.contact_number, o.email].filter(Boolean).join(' · ');
  const mayor = (content.offices || []).find((x) => /office of the mayor/i.test(x.name));
  const via = mayor?.contact_number
    ? ceb
      ? `Wala pay direktang linya; tawag sa Mayor's Office sa ${mayor.contact_number} o bisitaha ang Municipal Hall.`
      : `No direct line published yet; call the Mayor's Office at ${mayor.contact_number} or visit the Municipal Hall.`
    : '';
  const head = o.head_name ? (ceb ? `Nangulo: ${o.head_name}` : `Head: ${o.head_name}`) : '';
  return [o.name, head, o.location, contacts || via].filter(Boolean).join('\n');
}

// --- Explicit content questions ------------------------------------------------------------------

// Not "update"/"notice" alone: "any update on my permit?" is not a request for the news page.
const NEWS_RE = /\b(news|announcements?|advisor(y|ies)|anunsyo|balita|pahibalo|public notices?|bulletins?)\b/i;
const LATEST_RE = /\b(latest|recent|new|newest|bag[-\s]?o(ng)?|today|karong|what'?s new)\b/i;
const BIDS_RE = /\b(bids?|bidding|procurement|tenders?|invitations? to bid|notices? of award|awarded contracts?)\b/i;
const DOCS_RE = /\b(transparency|full disclosure|disclosures?|annual budget|budget (report|of|for|sa)|annual investment (plan|program)|aip|financial (reports?|statements?)|saln|public documents?)\b/i;
const CONTENT_WORDS = new Set(['news', 'announcement', 'advisory', 'advisorie', 'update', 'notice', 'bulletin', 'latest', 'recent', 'newest', 'today', 'karong', 'post', 'posted']);

function answerNews(message, content, lang) {
  const news = content.news || [];
  if (news.length === 0) {
    return lang === 'bisaya'
      ? 'Wala pay anunsyo nga na-post sa website karon.'
      : 'There are no announcements posted on the website right now.';
  }
  // Topic words left after removing the "news / latest" words: "news about vaccination" → [vaccination].
  const topic = tokens(message).filter((t) => !CONTENT_WORDS.has(t));
  if (topic.length > 0) {
    const hit = bestMatch(
      topic,
      news,
      (n) => [[`${n.title} ${n.title_bisaya || ''}`, 3], [`${n.body} ${n.body_bisaya || ''}`, 1], [n.category, 1]],
      { requireTitle: false }
    );
    if (hit) return newsItem(hit.item, lang);
    const none = lang === 'bisaya' ? 'Wala koy nakit-an nga anunsyo bahin ana.' : "I couldn't find an announcement about that.";
    return `${none}\n\n${newsList(news, lang)}`;
  }
  return newsList(news, lang);
}

function answerBids(content, lang) {
  const bids = content.bids || [];
  const ceb = lang === 'bisaya';
  if (bids.length === 0) {
    return ceb ? 'Wala pay bids o awards nga na-post sa website.' : 'There are no bids or awards posted on the website right now.';
  }
  const open = bids.filter((b) => b.status === 'open');
  const shown = (open.length ? open : bids).slice(0, 5);
  const lines = shown.map((b) => {
    const ref = b.reference_number ? ` [${b.reference_number}]` : '';
    const when = b.status === 'open' && b.bid_opening_date ? ` — opening ${fmtDate(b.bid_opening_date)}` : b.status === 'awarded' && b.awarded_to ? ` — awarded to ${b.awarded_to}` : '';
    return `• ${b.title}${ref} (${b.status})${when}`;
  });
  const head = open.length
    ? ceb ? 'Mga bukas nga bidding karon:' : 'Open bidding opportunities:'
    : ceb ? 'Walay bukas nga bidding karon. Mga bag-ong gi-post:' : 'No bidding is open right now. Most recent postings:';
  const tail = ceb ? 'Tan-awa ang detalye sa Bids & Awards page.' : 'See the details on the Bids & Awards page.';
  return `${head}\n${lines.join('\n')}\n\n${tail}`;
}

function answerDocuments(message, content, lang) {
  const docs = content.documents || [];
  const ceb = lang === 'bisaya';
  if (docs.length === 0) {
    return ceb
      ? 'Wala pay transparency documents nga na-post sa website.'
      : 'There are no transparency documents posted on the website yet.';
  }
  const topic = tokens(message).filter((t) => !['transparency', 'document', 'disclosure', 'public'].includes(t));
  const hit = topic.length ? bestMatch(topic, docs, (d) => [[d.title, 3], [d.category, 2], [d.fiscal_year, 1]]) : null;
  const shown = hit ? [hit.item] : docs.slice(0, 5);
  const lines = shown.map((d) => `• ${d.title}${d.fiscal_year ? ` (FY ${d.fiscal_year})` : ''}`);
  const tail = ceb ? 'Ma-download kini sa Transparency page.' : 'You can download them from the Transparency page.';
  return `${ceb ? 'Mga dokumento nga na-post:' : 'Posted documents:'}\n${lines.join('\n')}\n\n${tail}`;
}

// --- Officials and barangays from the database -----------------------------------------------------

// Which official answers each `officials.head.<key>.inquire` intent, matched on their position.
const HEAD_POSITION = {
  'budget-lcr': /budget|civil registrar/i,
  accounting: /accountant/i,
  hrmo: /human resource/i,
  'mpdo-mdrrmo': /planning|mdrrm/i,
  treasurer: /treasurer/i,
  mswdo: /social welfare/i,
  meedmo: /economic enterprise/i,
  health: /health officer/i,
  engineering: /engineer/i,
  menro: /environment/i,
  agriculture: /agricultur/i,
  assessor: /assessor/i,
  gso: /general services/i,
};

// Questions about the past ("Who WAS the mayor in 2015?", "Kinsa ang mayor kaniadto?"). The agent
// often files these under the current-official intent, so the server redirects them.
const PAST_RE = /\b(former|previous|past|before|first|was|were|history|kanhi(ng)?|kaniadto|niadto(ng)?|miaging|nahimo(ng)?|dati(ng)?|(19|20)\d{2})\b/i;
const FIRST_RE = /\b(first|una|unang)\b/i;
const PREVIOUS_RE = /\b(previous|before|miaging|wala pa|last)\b/i;

const yearOf = (d) => (d ? new Date(d).getUTCFullYear() : null);
const termOf = (o) => {
  const from = yearOf(o.term_start);
  const to = yearOf(o.term_end);
  if (!from) return '';
  return !to || to === from ? `${from}` : `${from}–${to}`;
};
// "Hon. Cesar C. Cumba, Jr." and "Cesar C. Cumba, Jr." are the same person.
const samePerson = (a, b) => normalize(a.replace(/^hon\.?\s*/i, '')) === normalize(b.replace(/^hon\.?\s*/i, ''));

/** Former (and, for year questions, current) holders of one office, oldest first. */
function answerFormer(role, message, content, lang) {
  const ceb = lang === 'bisaya';
  const re = role === 'vice' ? /vice mayor/i : /^(municipal )?mayor$/i;
  const label = role === 'vice' ? 'vice mayor' : 'mayor';
  const rows = (content.officials || [])
    .filter((o) => re.test(o.position.trim()) && o.term_start)
    .sort((a, b) => new Date(a.term_start) - new Date(b.term_start));
  const former = rows.filter((o) => !o.is_current);
  const current = rows.find((o) => o.is_current);

  if (former.length === 0) {
    return ceb
      ? `Wala pay lista sa mga kanhing ${label} sa website.${current ? ` Ang ${label} karon kay si ${current.full_name}.` : ''}`
      : `The website doesn't list former ${label}s yet.${current ? ` The current ${label} is ${current.full_name}.` : ''}`;
  }

  const year = /\b(19|20)\d{2}\b/.exec(message);
  if (year) {
    const y = Number(year[0]);
    const holders = rows.filter((o) => yearOf(o.term_start) <= y && y <= (yearOf(o.term_end) ?? y));
    if (holders.length === 0) {
      const from = yearOf(rows[0].term_start);
      return ceb
        ? `Walay record sa ${label} niadtong ${y}. Ang records nagsugod sa ${from}.`
        : `There is no record of the ${label} in ${y}. The records start in ${from}.`;
    }
    const names = holders.map((o) => `${o.full_name} (${termOf(o)})`).join(ceb ? ' ug ' : ' and ');
    return ceb ? `Ang ${label} sa Magallanes niadtong ${y}: ${names}.` : `The ${label} of Magallanes in ${y}: ${names}.`;
  }
  if (FIRST_RE.test(message)) {
    const o = rows[0];
    return ceb
      ? `Ang pinakaunang ${label} sa records kay si ${o.full_name} (${termOf(o)}).`
      : `The earliest ${label} on record is ${o.full_name} (${termOf(o)}).`;
  }
  if (PREVIOUS_RE.test(message)) {
    // The previous *person*: the current mayor's own earlier terms don't count.
    const others = current ? former.filter((o) => !samePerson(o.full_name, current.full_name)) : former;
    const pool = others.length ? others : former;
    const o = pool[pool.length - 1];
    return ceb
      ? `Ang miaging ${label} kay si ${o.full_name} (${termOf(o)}).`
      : `The previous ${label} was ${o.full_name} (${termOf(o)}).`;
  }
  const list = former.map((o) => `• ${o.full_name} (${termOf(o)})`).join('\n');
  const now = current ? (ceb ? `\n\nKaron: ${current.full_name} (${termOf(current)})` : `\n\nCurrent: ${current.full_name} (${termOf(current)})`) : '';
  return ceb
    ? `Mga kanhing ${label} sa Magallanes:\n${list}${now}`
    : `Former ${label}s of Magallanes:\n${list}${now}`;
}

function answerOfficials(intent, message, content, lang) {
  if (intent === 'officials.former.mayors.inquire' || (intent === 'officials.mayor.inquire' && PAST_RE.test(message))) {
    return { intent: 'officials.former.mayors.inquire', reply: answerFormer('mayor', message, content, lang) };
  }
  if (intent === 'officials.former.vicemayors.inquire' || (intent === 'officials.vicemayor.inquire' && PAST_RE.test(message))) {
    return { intent: 'officials.former.vicemayors.inquire', reply: answerFormer('vice', message, content, lang) };
  }
  const reply = answerCurrentOfficials(intent, content, lang);
  return reply ? { intent, reply } : null;
}

function answerCurrentOfficials(intent, content, lang) {
  const ceb = lang === 'bisaya';
  // Former officials live in the same table; everything below is about who holds office now.
  const officials = (content.officials || []).filter((o) => o.is_current);
  const byPosition = (re) => officials.find((o) => re.test(o.position));
  const mayorOffice = (content.offices || []).find((o) => /office of the mayor/i.test(o.name));

  if (intent === 'officials.mayor.inquire') {
    const m = byPosition(/municipal mayor/i);
    if (!m) return null;
    const contact = [
      mayorOffice?.email && (ceb ? `mo-email sa ${mayorOffice.email}` : `email ${mayorOffice.email}`),
      mayorOffice?.contact_number && (ceb ? `tawag sa ${mayorOffice.contact_number}` : `call ${mayorOffice.contact_number}`),
    ].filter(Boolean).join(ceb ? ' o ' : ' or ');
    return ceb
      ? `Ang Local Chief Executive (Mayor) sa Magallanes kay si ${sentence(m.full_name)}${contact ? ` Para sa Mayor's Office, ${contact}.` : ''}`
      : `The Local Chief Executive (Municipal Mayor) of Magallanes is ${sentence(m.full_name)}${contact ? ` To reach the Mayor's Office, ${contact}.` : ''}`;
  }
  if (intent === 'officials.vicemayor.inquire') {
    const v = byPosition(/vice mayor/i);
    if (!v) return null;
    return ceb
      ? `Ang Vice Mayor sa Magallanes kay si ${v.full_name}, ang nangulo sa Sangguniang Bayan.`
      : `The Vice Mayor of Magallanes is ${v.full_name}, who presides over the Sangguniang Bayan.`;
  }
  if (intent === 'officials.sb.inquire') {
    const sb = officials.filter((o) => /sb member|sangguniang|councilor|kagawad/i.test(o.position));
    if (sb.length === 0) return null;
    const list = sb.map((o, i) => `${i + 1}. ${o.full_name}`).join('\n');
    return ceb ? `Ang mga miyembro sa Sangguniang Bayan sa Magallanes:\n${list}` : `The members of the Sangguniang Bayan of Magallanes are:\n${list}`;
  }
  if (intent === 'officials.directory.inquire') {
    if (officials.length === 0) return null;
    const lines = officials
      .filter((o) => !/sb member|sangguniang|councilor|kagawad/i.test(o.position))
      .map((o) => `• ${o.position}: ${o.full_name}`);
    const more = ceb ? 'Pwede sad ka mangutana bahin sa mga konsehal o sa kapitan sa usa ka barangay.' : 'You can also ask about the Sangguniang Bayan members or a barangay captain.';
    return `${ceb ? 'Mga opisyal sa Magallanes:' : 'Municipal officials of Magallanes:'}\n${lines.join('\n')}\n\n${more}`;
  }
  const head = /^officials\.head\.(.+)\.inquire$/.exec(intent);
  if (head && HEAD_POSITION[head[1]]) {
    const o = byPosition(HEAD_POSITION[head[1]]);
    if (!o) return null;
    return ceb ? `Ang ${o.position} sa Magallanes kay si ${o.full_name}.` : `The ${o.position} of Magallanes is ${o.full_name}.`;
  }
  if (intent === 'barangay.captain.list.inquire') {
    const rows = (content.barangays || []).filter((b) => b.captain_name);
    if (rows.length === 0) return null;
    const list = rows.map((b) => `• ${b.name}: ${b.captain_name}`).join('\n');
    return ceb ? `Mga Punong Barangay (kapitan) sa Magallanes:\n${list}` : `Punong Barangay (barangay captains) of Magallanes:\n${list}`;
  }
  const captain = /^barangay\.captain\.(.+)\.inquire$/.exec(intent);
  if (captain) {
    const wanted = normalize(barangayNameForKey(captain[1]) || '');
    const b = (content.barangays || []).find((x) => normalize(x.name) === wanted);
    if (!b?.captain_name) return null;
    return ceb ? `Ang Punong Barangay (kapitan) sa ${b.name} kay si ${b.captain_name}.` : `The Punong Barangay (barangay captain) of ${b.name} is ${b.captain_name}.`;
  }
  return null;
}

// --- Last resort: search everything posted ---------------------------------------------------------

function searchAll(message, content, lang) {
  const q = tokens(message);
  if (q.length === 0) return null;
  const candidates = [
    ['live.service', bestMatch(q, content.services, (s) => [[`${s.name} ${s.name_bisaya || ''}`, 3], [s.category, 2], [`${s.requirements} ${s.office || ''}`, 1]]), (s) => serviceItem(s, lang)],
    ['live.news', bestMatch(q, content.news, (n) => [[`${n.title} ${n.title_bisaya || ''}`, 3], [`${n.body} ${n.body_bisaya || ''}`, 1]]), (n) => newsItem(n, lang)],
    ['live.office', bestMatch(q, content.offices, (o) => [[o.name, 3], [o.head_name, 1]]), (o) => officeItem(o, content, lang)],
    ['live.bids', bestMatch(q, content.bids, (b) => [[b.title, 3], [b.reference_number, 2]]), () => answerBids(content, lang)],
    ['live.documents', bestMatch(q, content.documents, (d) => [[d.title, 3], [d.category, 2]]), () => answerDocuments(message, content, lang)],
  ].filter(([, hit]) => hit);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b[1].score - a[1].score);
  const [intent, hit, format] = candidates[0];
  return { intent, reply: format(hit.item) };
}

// --- Admin-defined intents ---------------------------------------------------------------------------

const sameWord = (a, b) => a === b || (a.length >= 5 && b.length >= 5 && (a.startsWith(b) || b.startsWith(a)));

/**
 * Dice overlap of two word lists (0–1), counting shared stems ("requirement" ~ "requirements").
 * 0 unless they share a distinctive (non-GENERIC) word: "What are the requirements?" must not
 * match "PWD ID requirements" on "requirements" alone.
 */
function phraseSimilarity(a, b) {
  if (a.length === 0 || b.length === 0) return 0;
  const used = new Set();
  let common = 0;
  let distinctive = 0;
  for (const w of a) {
    const j = b.findIndex((x, k) => !used.has(k) && sameWord(w, x));
    if (j !== -1) {
      used.add(j);
      common++;
      if (!GENERIC.has(w)) distinctive++;
    }
  }
  return distinctive === 0 ? 0 : (2 * common) / (a.length + b.length);
}

/**
 * The admin-defined intent (Admin → Chatbot Responses, rows with sample questions) whose sample
 * questions best match the message, so staff can add new topics without editing Dialogflow.
 * @param {string} message
 * @param {{ intent_name: string, training_phrases?: string[] }[]} rows
 * @returns {{ intent: string, score: number } | null} best match scoring at least 0.5
 */
export function matchCustomIntent(message, rows) {
  const q = tokens(message);
  if (q.length === 0) return null;
  let best = null;
  for (const row of rows) {
    for (const phrase of row.training_phrases || []) {
      const score = phraseSimilarity(q, tokens(phrase));
      if (score >= 0.5 && (!best || score > best.score)) best = { intent: row.intent_name, score };
    }
  }
  return best;
}

// --- Entry point -----------------------------------------------------------------------------------

/**
 * A reply built from currently posted content, or null to use the fixed answers.
 * @param {{ message: string, intent: string, language: 'english' | 'bisaya' }} turn
 * @param {object} [content] - posted content to answer from; defaults to the live cache (tests
 *   pass fixtures here)
 * @returns {Promise<{ intent: string, reply: string } | null>}
 */
export async function answerFromLiveContent({ message, intent, language }, content) {
  content = content ?? (await getLiveContent());
  if (!content) return null;

  // "budget officer" is a person, not a document; officials intents keep those questions.
  const aboutPeople = intent.startsWith('officials.') || intent.startsWith('barangay.captain.');

  if (NEWS_RE.test(message) || (LATEST_RE.test(message) && /\b(post|posted)\b/i.test(message))) {
    return { intent: 'live.news', reply: answerNews(message, content, language) };
  }
  if (BIDS_RE.test(message)) {
    return { intent: 'live.bids', reply: answerBids(content, language) };
  }
  if (!aboutPeople && DOCS_RE.test(message)) {
    return { intent: 'live.documents', reply: answerDocuments(message, content, language) };
  }
  if (aboutPeople) {
    return answerOfficials(intent, message, content, language);
  }
  if (FALLBACK_INTENTS.has(intent)) {
    return searchAll(message, content, language);
  }
  return null;
}
