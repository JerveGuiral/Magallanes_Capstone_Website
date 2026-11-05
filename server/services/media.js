// server/services/media.js
//
// "Show me a photo of the Bitaug tree", "naa bay video sa Magellan Shrine?" — Bitoy answers with
// links (adviser's request, November 2026). Photos: the website's own page for the place, which
// carries the photos and their credits (src/data/tourism.ts). Videos: the website has none, so a
// YouTube search for the place — a search rather than one video, which could be wrong or taken
// down — and the LGU's Facebook page, where it posts its own.

const LGU_FACEBOOK = 'https://www.facebook.com/MagallanesADNPIO';

// Places with a page of photos on the website, in the order they are tried. Each id is the page's
// address (/tourism/<id>) and must match an id in src/data/tourism.ts.
const PLACES = [
  {
    id: 'centennial-bitaug-tree',
    name: 'the Philippine Centennial Bitaug Tree',
    nameCeb: 'Philippine Centennial Bitaug Tree',
    search: 'Bitaug tree Magallanes Agusan del Norte',
    re: /\b(bitaug|bituag|bitoag|bitawg|centennial\s*tree|dakong\s*kahoy|old\s*tree|500[\s-]*year)/i,
  },
  {
    id: 'magellan-shrine',
    name: 'the Magellan Shrine',
    nameCeb: 'Magellan Shrine',
    search: 'Magellan Shrine Magallanes Agusan del Norte',
    re: /\b(magellan|shrine|landing\s*site|monument)/i,
  },
  { id: 'bay-walk', name: 'the Magallanes Bay Walk', nameCeb: 'Magallanes Bay Walk', search: 'Magallanes Bay Walk Agusan del Norte', re: /\b(bay\s*walk|baywalk|boulevard)\b/i },
  { id: 'guiasan-bridge', name: 'Guiasan Bridge', nameCeb: 'Guiasan Bridge', search: 'Guiasan Bridge Magallanes Agusan del Norte', re: /\b(bridges?|tulay)\b/i },
  {
    id: 'rosario-parish',
    name: 'the Nuestra Señora del Rosario Parish',
    nameCeb: 'Nuestra Señora del Rosario Parish',
    search: 'Nuestra Senora del Rosario Parish Magallanes Agusan del Norte',
    re: /\b(parish|church|simbahan|parokya|nuestra)\b/i,
  },
  {
    id: 'agusan-baug-delta',
    name: 'the Agusan and Baug river delta',
    nameCeb: 'delta sa suba sa Agusan ug Baug',
    search: 'Agusan river delta Magallanes',
    re: /\b(delta|rivers?|suba|mangroves?|bakhawan|baug)\b/i,
  },
  {
    // The town centre page also has the Municipal Hall, the public market and the welcome mark.
    id: 'poblacion-town-centre',
    name: 'the Poblacion town centre, the Municipal Hall and the public market',
    nameCeb: 'sentro sa Poblacion, sa Municipal Hall ug sa public market',
    search: 'Poblacion Magallanes Agusan del Norte',
    re: /\b(town\s*cent(re|er)|poblacion|plaza|municipal\s*hall|munisipyo|town\s*hall|public\s*market|merkado|welcome\s*(mark|sign|arch))\b/i,
  },
];

// Events have no photo page on the website; their photos and videos are on the LGU's page.
const EVENTS = [
  { name: 'the Lisagan Festival', nameCeb: 'Lisagan Festival', search: 'Lisagan Festival Magallanes Agusan del Norte', re: /\blisagan\b/i },
  { name: 'the Magallanes town fiesta', nameCeb: 'piyesta sa Magallanes', search: 'Magallanes Agusan del Norte fiesta', re: /\b(fiesta|piyesta|pista)\b/i },
];

// The town as a whole, or its tourist spots in general.
const TOWN = /\b(magallanes|tourist\s*spots?|attractions?|pasyalan|places|lugar|town|lungsod)\b/i;

// Which place a previous answer was about, for "can I see a photo?" right after it.
const PLACE_OF_INTENT = {
  'tourism.centennial-tree.inquire': 'centennial-bitaug-tree',
  'tourism.magellan-shrine.inquire': 'magellan-shrine',
  'tourism.baywalk.inquire': 'bay-walk',
  'tourism.river-delta.inquire': 'agusan-baug-delta',
  'tourism.parish.inquire': 'rosario-parish',
  'places.market.inquire': 'poblacion-town-centre',
  'office.location.inquire': 'poblacion-town-centre',
};

const PHOTO = /\b(photos?|pictures?|pics?|images?|litrato|retrato|hulagway|selfie)\b/i;
const VIDEO = /\b(videos?|vids?|vlogs?|bidyo|footage|clips?)\b/i;
// "Do I need a 2x2 picture for the PWD ID?" is a requirements question, and "Can I take pictures
// inside the church?" a question about rules — neither asks to see a photo.
const NOT_A_REQUEST = /\b(2x2|1x1|passport|id\s*(photo|picture|pic)|requirements?|kinahanglan\w*|dad-?on|bring|submit|attach|take\s+(a\s+)?(photos?|pictures?|pics?|videos?)|allowed)\b/i;

const youtube = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query).replace(/%20/g, '+')}`;

/**
 * A reply with links when the message asks to see a photo or video of a place in Magallanes,
 * otherwise null.
 * @param {{ message: string, language: 'english' | 'bisaya', lastIntent?: string, siteUrl: string }} turn
 * @returns {{ intent: 'media.photo' | 'media.video', reply: string } | null}
 */
export function answerMediaRequest({ message, language, lastIntent = '', siteUrl }) {
  const wantsVideo = VIDEO.test(message);
  const wantsPhoto = PHOTO.test(message);
  if ((!wantsVideo && !wantsPhoto) || NOT_A_REQUEST.test(message)) return null;

  const ceb = language === 'bisaya';
  const intent = wantsVideo ? 'media.video' : 'media.photo';
  const facebook = ceb
    ? `Nag-post sad ang LGU og mga litrato ug video sa ilang Facebook page:\n${LGU_FACEBOOK}`
    : `The LGU also posts photos and videos on its Facebook page:\n${LGU_FACEBOOK}`;

  const place = PLACES.find((p) => p.re.test(message)) || PLACES.find((p) => p.id === PLACE_OF_INTENT[lastIntent]);
  if (place) {
    const page = `${siteUrl}/tourism/${place.id}`;
    const videos = youtube(place.search);
    if (wantsVideo) {
      return {
        intent,
        reply: ceb
          ? `Ania ang mga video sa ${place.nameCeb} sa YouTube (resulta sa pagpangita, gi-post sa ubang tawo):\n${videos}\n\nAng mga litrato naa sa website sa munisipyo:\n${page}\n\n${facebook}`
          : `Here are videos of ${place.name} on YouTube (search results, posted by other people):\n${videos}\n\nPhotos are on the municipal website:\n${page}\n\n${facebook}`,
      };
    }
    return {
      intent,
      reply: ceb
        ? `Ania ang mga litrato sa ${place.nameCeb} sa website sa munisipyo:\n${page}\n\nPara sa mga video, pangitaa sa YouTube:\n${videos}`
        : `Here are photos of ${place.name} on the municipal website:\n${page}\n\nFor videos, see YouTube:\n${videos}`,
    };
  }

  const event = EVENTS.find((e) => e.re.test(message));
  if (event) {
    const videos = youtube(event.search);
    return {
      intent,
      reply: ceb
        ? `Ang mga litrato ug video sa ${event.nameCeb} gi-post sa LGU sa ilang Facebook page:\n${LGU_FACEBOOK}\n\nPangitaa usab sa YouTube:\n${videos}`
        : `The LGU posts photos and videos of ${event.name} on its Facebook page:\n${LGU_FACEBOOK}\n\nYou can also search YouTube:\n${videos}`,
    };
  }

  if (TOWN.test(message)) {
    const page = `${siteUrl}/tourism`;
    const videos = youtube('Magallanes Agusan del Norte');
    return {
      intent,
      reply: ceb
        ? `Ania ang mga litrato sa mga tourist spot sa Magallanes, sa Visit Magallanes page sa website:\n${page}\n\nMga video sa YouTube:\n${videos}\n\n${facebook}`
        : `Photos of the tourist spots of Magallanes are on the website's Visit Magallanes page:\n${page}\n\nVideos on YouTube:\n${videos}\n\n${facebook}`,
    };
  }
  return null;
}
