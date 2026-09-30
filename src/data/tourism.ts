import type { ImageName } from './images';

/**
 * Destinations in Magallanes, Agusan del Norte.
 *
 * Every entry here is a real, verifiable place. The previous version of this
 * file invented four destinations — including a "Bitaug Shoreline" in a
 * "Barangay Bitaug", which is not one of the municipality's eight barangays
 * (Buhang, Caloc-an, Guiasan, Marcos, Poblacion, Santo Niño, Santo Rosario,
 * Taod-oy). Invented attractions on an official LGU site are worse than none.
 *
 * Sources: PhilAtlas, Wikipedia (Magallanes, Agusan del Norte), and
 * localphilippines.com. Photography is from Wikimedia Commons under CC BY-SA or
 * CC0 — see TOURISM_CREDITS, which the site is legally required to display.
 */

export type GalleryImage = {
  name: ImageName;
  alt: string;
  /** Shown under the image in the gallery; keeps the page useful without opening anything. */
  caption: string;
};

export type Destination = {
  id: string;
  name: string;
  barangay: string;
  /** One-line hook used on cards and the index page. */
  summary: string;
  /** Longer-form paragraphs shown only on the destination's own detail page. */
  details: string[];
  /** Short, concrete things to do or watch for. */
  highlights: string[];
  access: string;
  season: string;
  fee: string;
  /** Lead image first — it is the one used on cards and as the detail hero. */
  gallery: GalleryImage[];
  category: 'Heritage' | 'Nature' | 'Town life';
};

export const DESTINATIONS: Destination[] = [
  {
    id: 'magellan-shrine',
    name: 'Magellan Shrine',
    barangay: 'Poblacion',
    category: 'Heritage',
    summary:
      'The stone marker at the mouth of the Agusan River commemorating the Mass said here on 8 April 1521 — and the reason the town carries Magellan’s name.',
    details: [
      'The shrine stands in Poblacion, a short walk from the Municipal Hall, close to where the Agusan River meets Butuan Bay. The marker was erected in 1872 during the term of the Spanish district governor José María Carvallo, and commemorates a Mass held on 8 April 1521 by Ferdinand Magellan’s expedition.',
      'It is worth knowing that this claim is contested. Magallanes, along with Butuan, has long argued it hosted the first Catholic Mass in Mindanao, while the National Historical Commission recognises Limasawa in Southern Leyte as the site of the first Mass in the Philippines. The town does not hide the debate — the shrine is presented as a marker of local memory as much as of settled history, and that argument is part of what makes it interesting to visit.',
      'Church ruins near the river bank nearby have been cited as supporting evidence for early Spanish presence in the area.',
    ],
    highlights: [
      'The 1872 Spanish-era marker itself, with its original inscription',
      'A five-minute walk from the Municipal Hall and the Bay Walk',
      'Best light in the late afternoon, when the marker faces the river mouth',
      'Ask at the Municipal Tourism desk for the local account of the 1521 landing',
    ],
    access: 'In Poblacion, walking distance from the Municipal Hall. Any tricycle in the town proper will know "Magellan Shrine".',
    season: 'Open year-round; the fiesta week in October is the liveliest time',
    fee: 'No entrance fee',
    gallery: [
      { name: 'magellan-shrine-2', alt: 'The Magellan Shrine marker in Poblacion, Magallanes', caption: 'The shrine in Poblacion, near the mouth of the Agusan River' },
      { name: 'magellan-shrine-1', alt: 'Close view of the Magellan Shrine marker and its inscription', caption: 'The marker, erected in 1872' },
    ],
  },
  {
    id: 'centennial-bitaug-tree',
    name: 'The Philippine Centennial Bitaug Tree',
    barangay: 'Caloc-an',
    category: 'Nature',
    summary:
      'A Bitaug roughly five centuries old, declared a Philippine Centennial Tree in 1998 — and the heritage marker this municipality takes its motif from.',
    details: [
      'The tree stands in Barangay Caloc-an and is a Bitaug (Calophyllum inophyllum), the salt-tolerant hardwood that grows along this coastline. The Department of Environment and Natural Resources declared it a Philippine Centennial Tree in June 1998; its trunk measures about 290 centimetres in diameter and it is estimated at over 500 years old, which would make it among the oldest known trees in the country.',
      'Before electricity reached the coast, fisherfolk used the tree as a night landmark — thousands of fireflies would settle in its canopy, making it visible from the water. The Department of Tourism has since installed a visitor area nearby.',
      'The tree lost significant branches in June 2017 and is no longer the full canopy older residents remember, which is part of why the municipality treats it as something to protect rather than simply to display.',
    ],
    highlights: [
      'A trunk roughly 290 cm across — bring someone to photograph the scale',
      'The DOT visitor area beside the tree explains the 1998 centennial declaration',
      'Fireflies still gather at dusk in the surrounding stand, though fewer than before',
      'The Bitaug appears throughout this website as a line drawing — this is the original',
    ],
    access: 'Barangay Caloc-an, reachable by tricycle or habal-habal from the Poblacion town proper. Ask for the "Centennial Tree".',
    season: 'Year-round. Visit at dusk if you want to see the fireflies',
    fee: 'No entrance fee',
    gallery: [
      { name: 'centennial-tree-1', alt: 'The Philippine Centennial Bitaug Tree in Barangay Caloc-an, photographed in July 2017', caption: 'Photographed in July 2017, shortly after it lost major branches' },
    ],
  },
  {
    id: 'bay-walk',
    name: 'Magallanes Bay Walk',
    barangay: 'Poblacion',
    category: 'Town life',
    summary:
      'The town’s waterfront promenade and sea wall, where Magallanes gathers in the late afternoon as the fishing boats come in.',
    details: [
      'The Bay Walk runs along the Poblacion waterfront where the Agusan River opens into Butuan Bay. It is the town’s common ground: joggers in the early morning, families and vendors from late afternoon, and a clear view across the water as the outriggers return.',
      'The adjoining sea wall is working coastal defence as much as public space — this is a low-lying delta municipality, and the wall is part of how the Poblacion holds back the tide.',
      'It is also the best vantage point for the fluvial procession during the Lisagan Festival, when decorated boats move along the Agusan and Baug rivers.',
    ],
    highlights: [
      'Sunset over Butuan Bay — the reason most people come',
      'Fishing boats returning through the late afternoon',
      'Walking distance from the Magellan Shrine, the parish church and the public market',
      'The best public viewpoint for the Lisagan fluvial procession in October',
    ],
    access: 'Along the Poblacion waterfront, walking distance from the Municipal Hall.',
    season: 'Year-round; calmest and clearest from March to June',
    fee: 'Free and open to the public',
    gallery: [
      { name: 'bay-walk-1', alt: 'The Magallanes Bay Walk promenade along the Poblacion waterfront', caption: 'The promenade along the Poblacion waterfront' },
      { name: 'bay-walk-2', alt: 'The Bay Walk looking out over Butuan Bay', caption: 'Looking out over the bay' },
      { name: 'bay-walk-3', alt: 'The Magallanes sea wall protecting the Poblacion shoreline', caption: 'The sea wall — coastal defence as well as public space' },
    ],
  },
  {
    id: 'agusan-baug-delta',
    name: 'The Agusan & Baug River Delta',
    barangay: 'Across the municipality',
    category: 'Nature',
    summary:
      'Magallanes sits where the Agusan — the widest navigable river in Mindanao — meets the sea. The delta is the reason the town exists and still shapes daily life here.',
    details: [
      'The municipality occupies the mouth of the Agusan and Baug rivers, and the delta is the single geographic fact that explains everything else about it: the fishing, the dikes, the low-lying barangays, and the boats that still serve as everyday transport between settlements.',
      'The Agusan is described as the widest and most navigable river in Mindanao. Boat trips along the river and through the delta channels are arranged informally through the barangay fisherfolk associations rather than through any commercial operator.',
      'Seen from the air, the pattern of water, dike and settlement is the clearest picture of how this town is organised — which is why the aerial view is the image most often used to represent Magallanes.',
    ],
    highlights: [
      'Boat trips arranged through the barangay fisherfolk associations',
      'The Magallanes bridge crossing into Poblacion',
      'Mangrove channels along the delta edges',
      'Life vests are required for all passengers, including children',
    ],
    access: 'Boat trips are arranged locally — ask at the Municipal Tourism desk or directly at the Poblacion fish landing.',
    season: 'March to June for the calmest water; avoid the northeast monsoon',
    fee: 'Boat hire is negotiated directly with the fisherfolk association',
    gallery: [
      { name: 'river-delta-1', alt: 'Aerial view of Magallanes showing the river delta and town centre', caption: 'The delta from the air, October 2025' },
      { name: 'river-delta-4', alt: 'The Magallanes bridge crossing into Poblacion', caption: 'The bridge into Poblacion' },
      { name: 'river-delta-3', alt: 'View across the municipality of Magallanes and the surrounding waterways', caption: 'Water, dike and settlement' },
      { name: 'river-delta-2', alt: 'Aerial view of Magallanes and Butuan Bay', caption: 'Where the Agusan meets Butuan Bay' },
    ],
  },
  {
    id: 'rosario-parish',
    name: 'Nuestra Señora del Rosario Parish',
    barangay: 'Poblacion',
    category: 'Heritage',
    summary:
      'The parish church of the town patroness, and the centre of the October fiesta and the Lisagan Festival that follows it.',
    details: [
      'The parish honours Nuestra Señora del Rosario, patroness of Magallanes. Its fiesta falls on the third Saturday of October and is the largest gathering in the municipal calendar — a thanksgiving Mass, parades, and the return of families who work elsewhere.',
      'The Sunday after the fiesta brings the Lisagan Festival: street dancing through the Poblacion, followed by a fluvial procession along the Agusan and Baug rivers.',
    ],
    highlights: [
      'Fiesta of Nuestra Señora del Rosario — third Saturday of October',
      'Lisagan Festival street dancing and fluvial procession the following Sunday',
      'In Poblacion, a short walk from the Bay Walk and the Magellan Shrine',
    ],
    access: 'Poblacion town centre, walking distance from the Municipal Hall.',
    season: 'Third Saturday of October for the fiesta',
    fee: 'No entrance fee',
    gallery: [
      { name: 'parish-1', alt: 'Nuestra Señora del Rosario Parish church in Poblacion, Magallanes', caption: 'The parish church in Poblacion' },
    ],
  },
  {
    id: 'poblacion-town-centre',
    name: 'Poblacion Town Centre',
    barangay: 'Poblacion',
    category: 'Town life',
    summary:
      'The Municipal Hall, the public market and the welcome mark — the working centre of a 22,000-person municipality, and the place to start.',
    details: [
      'Everything in Magallanes radiates from Poblacion. The Municipal Hall houses the tourism desk and the Public Assistance Desk, and the public market is where the morning catch arrives from the fish landing.',
      'The market is the most honest introduction to the municipality: it is busiest early, and what is on the tables tells you what the delta produced that day.',
    ],
    highlights: [
      'Municipal Hall — start at the tourism desk for directions and boat contacts',
      'Public market, busiest in the early morning',
      'The Magallanes welcome mark on the way into town',
      'Walking distance to the shrine, the parish church and the Bay Walk',
    ],
    access: 'The town proper. Buses and vans from Butuan City stop at the Poblacion.',
    season: 'Year-round; the market is best before 8:00 AM',
    fee: 'Free',
    gallery: [
      { name: 'municipal-hall-1', alt: 'The Magallanes Municipal Hall in Poblacion', caption: 'The Municipal Hall, October 2025' },
      { name: 'public-market-1', alt: 'The Magallanes public market in Poblacion', caption: 'The public market' },
      { name: 'welcome-mark-1', alt: 'The Magallanes welcome mark at the entrance to the town', caption: 'The welcome mark on the way into town' },
      { name: 'municipal-hall-2', alt: 'Another view of the Magallanes Municipal Hall', caption: 'The hall from the plaza side' },
    ],
  },
  {
    id: 'guiasan-bridge',
    name: 'Guiasan Bridge',
    barangay: 'Guiasan',
    category: 'Nature',
    summary: 'The crossing into Barangay Guiasan, and one of the easiest places to stand over the delta channels.',
    details: [
      'The bridge carries the road into Barangay Guiasan across one of the delta channels. It is not a formal attraction, but it is a straightforward public vantage point over the waterways that define the municipality — and it is on the way to the coastal barangays.',
    ],
    highlights: [
      'An open view along the channel in both directions',
      'On the route between the Poblacion and the coastal barangays',
      'Quiet in the early morning',
    ],
    access: 'On the barangay road into Guiasan; any tricycle from the Poblacion can take you.',
    season: 'Year-round',
    fee: 'Free',
    gallery: [
      { name: 'guiasan-bridge-1', alt: 'Guiasan Bridge crossing a delta channel in Magallanes', caption: 'The crossing into Barangay Guiasan' },
    ],
  },
];

/** Municipality-wide events, distinct from places. */
export const FESTIVALS = [
  {
    name: 'Fiesta of Nuestra Señora del Rosario',
    day: '3rd',
    month: 'OCT',
    detail:
      'The feast of the town patroness, held on the third Saturday of October. Thanksgiving Mass, parades and the largest gathering of the municipal year.',
  },
  {
    name: 'Lisagan Festival',
    day: 'SUN',
    month: 'OCT',
    detail:
      'On the Sunday after the fiesta: street dancing through the Poblacion, followed by a fluvial procession along the Agusan and Baug rivers.',
  },
];

export const TRAVEL_NOTES = [
  { label: 'From Butuan City', value: 'Roughly 20 km by road. Buses and vans for Magallanes leave from the Butuan integrated terminal.' },
  { label: 'Nearest airport', value: 'Bancasi Airport, Butuan City — about 30 minutes by road.' },
  { label: 'Getting around', value: 'Tricycles serve the Poblacion and nearby barangays; habal-habal reaches the upland barangays.' },
  { label: 'Boat trips', value: 'Arranged through the barangay fisherfolk associations, not commercial operators. Life vests are required for all passengers.' },
];

/**
 * Attribution for the destination photography.
 *
 * This is not optional decoration. Every CC BY-SA image on this site carries a
 * licence condition requiring credit to the photographer and a statement of the
 * licence; omitting it would put the municipality in breach. Rendered on the
 * Tourism page and beside each gallery image.
 */
export const TOURISM_CREDITS: Record<string, { author: string; license: string; source: string }> = {
  'bay-walk-1': { author: 'Ronald Galope Barniso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:MagallanesBayWalk.jpg' },
  'bay-walk-2': { author: 'Lucky Ambago Purok Otso', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Magallanes_Bay_Walk_(September_2,_2018).jpg' },
  'bay-walk-3': { author: 'Lucky Ambago Purok Otso', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:MAGALLANES_SEA_WALL.jpg' },
  'centennial-tree-1': { author: 'FSUUpedia Restore Division', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:The_Philippine_Centennial_Tree,_July_2,_2017_(Original_Work).jpg' },
  'guiasan-bridge-1': { author: 'Lucky Ambago Purok Otso', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:Guiasan_Bridge.jpg' },
  'magellan-shrine-1': { author: 'Ronald Galope Barniso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Magellan_Shrine_in_Magallanes.jpg' },
  'magellan-shrine-2': { author: 'Ronald Galope Barniso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:MagellanShrine.jpg' },
  'municipal-hall-1': { author: 'Lucky Ambago Purok Otso', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:MAGALLANES_MUNICIPAL_HALL_(OCTOBER_17,_2025).jpg' },
  'municipal-hall-2': { author: 'Lucky Ambago Purok Otso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Magallanes_Municipal_Hall.jpg' },
  'parish-1': { author: 'FSUUpedia Restore Division', license: 'CC BY-SA 3.0', source: 'https://commons.wikimedia.org/wiki/File:Nuestra_Senora_del_Rosario_Parish_in_Magallanes,_Agusan_del_Norte_(Original_Work).jpg' },
  'public-market-1': { author: 'Lucky Ambago Purok Otso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:MAGALLANES_PUBLIC_MARKET_(AUGUST_19,_2019).jpg' },
  'public-market-2': { author: 'FSUUpedia Restore Division', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Magallanes_Public_Market_(Original_work).jpg' },
  'river-delta-1': { author: 'Lucky Ambago Purok Otso', license: 'CC0', source: 'https://commons.wikimedia.org/wiki/File:MAGALLANES_AERIAL_VIEW_(OCTOBER_18,_2025).jpg' },
  'river-delta-2': { author: 'Lucky Ambago Purok Otso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Magallanes_Aerial_View.jpg' },
  'river-delta-3': { author: 'FSUUpedia Restore Division', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:View_of_Magallanes,_Agusan_del_Norte_(Original_Work).jpg' },
  'river-delta-4': { author: 'Lucky Ambago Purok Otso', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:MAGALLANES_BRIDGE_TO_POBLACION.jpg' },
  'welcome-mark-1': { author: 'FSUUpedia Restore Division', license: 'CC BY-SA 4.0', source: 'https://commons.wikimedia.org/wiki/File:Magallanes_Welcome_Mark_(Original_Work).jpg' },
};
