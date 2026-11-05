// server/services/pageLinks.js
//
// The page of the website an answer belongs to, added at the end of Bitoy's reply as a link
// ("Report a Concern form: https://…/report"), so a resident can go straight to the details,
// the form or the photos. Only answers with a page that adds something get one.

// Pages of the website (src/App.tsx routes), named as the site names them. `named` matches a
// reply that already sends the reader there ("Read the full posts on the News page."): the link
// then goes on the next line instead of under a label of its own.
const PAGES = {
  '/report': { en: 'Report a Concern form', ceb: 'Report a Concern form', named: /Report a Concern (form|page)/i },
  '/foi': { en: 'Freedom of Information page', ceb: 'Freedom of Information page', named: /\bFOI page\b|Freedom of Information page/i },
  '/contact': { en: 'Contact page (address, office hours, map and hotlines)', ceb: 'Contact page (address, oras sa opisina, mapa ug hotline)' },
  '/privacy': { en: 'Privacy Policy', ceb: 'Privacy Policy' },
  '/services': { en: "Citizen's services page", ceb: "Citizen's services page" },
  '/officials': { en: 'Municipal officials page', ceb: 'Municipal officials page', named: /Officials page/i },
  '/barangays': { en: 'Barangays page', ceb: 'Barangays page' },
  '/offices': { en: 'Office directory', ceb: 'Office directory' },
  '/about': { en: 'About Magallanes page', ceb: 'About Magallanes page' },
  '/tourism': { en: 'Visit Magallanes page', ceb: 'Visit Magallanes page', named: /Tourism page|Visit Magallanes page/i },
  '/news': { en: 'News page', ceb: 'News page', named: /News page/i },
  '/bids': { en: 'Bids & Awards page', ceb: 'Bids & Awards page', named: /Bids & Awards page/i },
  '/forms': { en: 'Downloadable Forms page', ceb: 'Downloadable Forms page', named: /Downloadable Forms page/i },
  '/transparency': { en: 'Transparency Seal page', ceb: 'Transparency Seal page', named: /Transparency (Seal )?page/i },
};

// Answer (intent) → page. Tourism places go to their own page, which has the photos.
const BY_INTENT = {
  'report.concern.inquire': '/report',
  'governance.complaint.inquire': '/report',
  'utilities.water.inquire': '/report',
  'env.burning.inquire': '/report',
  'smalltalk.sorry': '/report',
  'Feedback': '/report',
  'foi.request.inquire': '/foi',
  'office.contact.inquire': '/contact',
  'office.location.inquire': '/contact',
  'office.hours.inquire': '/contact',
  'emergency.hotline.inquire': '/contact',
  'smalltalk.human-agent': '/contact',
  'smalltalk.bot-privacy': '/privacy',
  'governance.citizens-charter.inquire': '/services',
  // Both send residents to the News page for advisories and vaccination schedules.
  'disaster.weather.inquire': '/news',
  'health.animal-bite.inquire': '/news',
  'about.history.inquire': '/about',
  'about.facts.inquire': '/about',
  'tourism.spots.inquire': '/tourism',
  'tourism.getting-there.inquire': '/tourism',
  'tourism.accommodation.inquire': '/tourism',
  'tourism.best-time.inquire': '/tourism',
  'events.fiesta.inquire': '/tourism',
  'events.lisagan.inquire': '/tourism',
  'tourism.centennial-tree.inquire': '/tourism/centennial-bitaug-tree',
  'tourism.magellan-shrine.inquire': '/tourism/magellan-shrine',
  'tourism.baywalk.inquire': '/tourism/bay-walk',
  'tourism.river-delta.inquire': '/tourism/agusan-baug-delta',
  'tourism.parish.inquire': '/tourism/rosario-parish',
  'places.market.inquire': '/tourism/poblacion-town-centre',
  // Answers built from what is posted on the website (liveContent.js).
  'live.news': '/news',
  'live.bids': '/bids',
  'live.forms': '/forms',
  'live.documents': '/transparency',
  'live.service': '/services',
  'live.office': '/offices',
};

/** The website page for an answer, or null. */
export function pageFor(intent = '') {
  if (BY_INTENT[intent]) return BY_INTENT[intent];
  if (intent.startsWith('barangay.captain.')) return '/barangays';
  if (intent.startsWith('officials.')) return '/officials';
  return null;
}

const TOURISM_PLACE = /^\/tourism\/[\w-]+$/;
const NEWS_POST = /^\/news\/[\w-]+$/;

/**
 * The reply with a link to its website page added at the end, unless it already links there.
 * @param {string} reply
 * @param {{ intent: string, language: 'english' | 'bisaya', siteUrl: string, path?: string | null }} opts
 *   path — a more specific page than the intent's (one news post), from liveContent.js
 */
export function withPageLink(reply, { intent, language, siteUrl, path = null }) {
  const page = path || pageFor(intent);
  if (!reply || !page) return reply;
  const url = `${siteUrl}${page}`;
  if (reply.includes(url)) return reply;
  const ceb = language === 'bisaya';
  const section = PAGES['/' + page.split('/')[1]];
  // The last paragraph already names the page ("Read the full post on the News page."): the
  // link goes right under it.
  const lastParagraph = reply.slice(reply.lastIndexOf('\n\n') + 1);
  if (section?.named && section.named.test(lastParagraph)) return `${reply}\n${url}`;
  let label;
  if (NEWS_POST.test(page)) label = ceb ? 'Basaha ang tibuok anunsyo' : 'Read the full post';
  else if (TOURISM_PLACE.test(page)) label = ceb ? 'Mga litrato ug detalye' : 'Photos and details';
  else label = (PAGES[page] || section)[ceb ? 'ceb' : 'en'];
  return `${reply}\n\n${label}:\n${url}`;
}
