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
      'A stone marker in Poblacion commemorating the Mass held by Magellan’s expedition on 8 April 1521. The town is named after Magellan.',
    details: [
      'The shrine stands in Poblacion, a short walk from the Municipal Hall, close to where the Agusan River meets Butuan Bay. The marker was erected in 1872 during the term of the Spanish district governor José María Carvallo, and commemorates a Mass held on 8 April 1521 by Ferdinand Magellan’s expedition.',
      'This claim is debated. Magallanes and Butuan have long claimed the first Catholic Mass in Mindanao, while the National Historical Commission recognises Limasawa in Southern Leyte as the site of the first Mass in the Philippines.',
      'Church ruins near the river bank nearby have been cited as supporting evidence for early Spanish presence in the area.',
    ],
    highlights: [
      'Marker erected in 1872',
      'Near the Municipal Hall and the Bay Walk',
      'No entrance fee',
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
      'A Bitaug tree about 500 years old in Barangay Caloc-an, declared a Philippine Centennial Tree in 1998.',
    details: [
      'The tree stands in Barangay Caloc-an and is a Bitaug (Calophyllum inophyllum), the salt-tolerant hardwood that grows along this coastline. The Department of Environment and Natural Resources declared it a Philippine Centennial Tree in June 1998; its trunk measures about 290 centimetres in diameter and it is estimated at over 500 years old, which would make it among the oldest known trees in the country.',
      'Fireflies gather in the area at dusk.',
      'The tree lost large branches in June 2017.',
    ],
    highlights: [
      'Trunk about 290 cm in diameter',
      'Declared a Philippine Centennial Tree in 1998',
      'Fireflies at dusk',
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
      'A waterfront promenade and sea wall in Poblacion, popular in the late afternoon and at sunset.',
    details: [
      'The Bay Walk runs along the Poblacion waterfront where the Agusan River meets Butuan Bay. It is used for jogging in the morning and is busiest in the late afternoon, when families gather and fishing boats return.',
      'The adjoining sea wall also protects the low-lying Poblacion from high tides.',
      'During the Lisagan Festival in October, the fluvial procession on the Agusan and Baug rivers can be viewed from here.',
    ],
    highlights: [
      'Sunset view over Butuan Bay',
      'Walking distance from the Magellan Shrine, the parish church and the public market',
      'Viewing point for the Lisagan fluvial procession in October',
    ],
    access: 'Along the Poblacion waterfront, walking distance from the Municipal Hall.',
    season: 'Year-round; calmest and clearest from March to June',
    fee: 'Free and open to the public',
    gallery: [
      { name: 'bay-walk-2', alt: 'Residents relaxing along the Magallanes Bay Walk, looking out over Butuan Bay', caption: 'Looking out over the bay' },
      { name: 'bay-walk-1', alt: 'The Magallanes Bay Walk promenade along the Poblacion waterfront', caption: 'The promenade along the Poblacion waterfront' },
      { name: 'bay-walk-3', alt: 'The Magallanes sea wall protecting the Poblacion shoreline', caption: 'The sea wall — coastal defence as well as public space' },
    ],
  },
  {
    id: 'agusan-baug-delta',
    name: 'The Agusan & Baug River Delta',
    barangay: 'Across the municipality',
    category: 'Nature',
    summary:
      'Magallanes lies at the mouth of the Agusan River, the widest navigable river in Mindanao. Boat trips through the delta can be arranged locally.',
    details: [
      'The municipality is located at the mouth of the Agusan and Baug rivers. Fishing, the dikes, and the low-lying barangays are all part of life in the delta.',
      'Boat trips along the river and through the delta channels are arranged through the barangay fisherfolk associations rather than commercial operators.',
    ],
    highlights: [
      'Boat trips arranged through the barangay fisherfolk associations',
      'The Magallanes bridge crossing into Poblacion',
      'Mangrove channels along the delta edges',
      'Life vests are required for all passengers, including children',
    ],
    access: 'Boat trips are arranged locally — ask at the Poblacion fish landing or at the Municipal Hall.',
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
      'The parish church of Nuestra Señora del Rosario, patroness of Magallanes, and the centre of the October fiesta.',
    details: [
      'The parish honours Nuestra Señora del Rosario, patroness of Magallanes. Her fiesta is held every third Saturday of October, with a thanksgiving Mass, parades and other events.',
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
      'The town centre, with the Municipal Hall, the public market and the welcome mark.',
    details: [
      'Poblacion is the town centre of Magallanes. It has the Municipal Hall and the public market, where the morning catch from the fish landing is sold.',
      'The public market is busiest in the early morning.',
    ],
    highlights: [
      'Municipal Hall',
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
    summary: 'The bridge into Barangay Guiasan, with a view over the delta channels.',
    details: [
      'The bridge carries the road into Barangay Guiasan across one of the delta channels. It offers an open view of the waterways and is on the way to the coastal barangays.',
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
