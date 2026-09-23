export type Destination = {
  id: string;
  name: string;
  barangay: string;
  summary: string;
  /** Longer-form paragraphs shown only on the destination's own detail page. */
  details: string[];
  /** Short, concrete things to do or watch for — shown as a bullet list on the detail page. */
  highlights: string[];
  /** How to actually get to this specific spot, as distinct from the municipality-wide travel notes. */
  access: string;
  image: string;
  alt: string;
  season: string;
  fee: string;
};

export const DESTINATIONS: Destination[] = [
{
  id: 'dest-bitaug',
  name: 'Bitaug Shoreline',
  barangay: 'Barangay Bitaug',
  summary:
  'A working stretch of grey-sand beach shaded by mature Bitaug trees, the heritage marker the municipality takes its motif from. Locals gather here in the late afternoon when the fishing boats return.',
  details: [
  'The shoreline runs for about a kilometer along Barangay Bitaug, backed by a stand of old Bitaug (Calophyllum inophyllum) trees old enough to have their own root systems exposed by decades of tide. It is not a resort beach — there are no cabanas or vendors — which is exactly why locals still treat it as their own.',
  'Late afternoon is when it comes alive: outrigger boats start coming in from the bay around 4:00 PM, and it is common to see the day’s catch sorted right on the sand before it goes to the Poblacion market the next morning. The hills visible across the water belong to the neighboring coastline toward Cabadbaran.'],

  highlights: [
  'Watch the fishing boats return, usually between 4:00 and 6:00 PM',
  'Shade from mature Bitaug trees along the entire stretch — bring a mat, not an umbrella',
  'Tide pools at low tide toward the northern end, good for children',
  'No food stalls on site; bring water and snacks from the Poblacion market'],

  access: 'A 10-minute tricycle ride from the Poblacion town proper. Ask any tricycle driver for "Bitaug shoreline" — there is no formal terminal.',
  image: "/589436ec-2378-4f84-8c6e-8a2f1f445b3f.jpg",
  alt: 'Grey-sand shoreline shaded by mature Bitaug trees, with low green hills across the bay',
  season: 'Best from March to June (calm seas)',
  fee: 'No entrance fee'
},
{
  id: 'dest-delta',
  name: 'Agusan Delta Mangroves',
  barangay: 'Barangay Guiasan',
  summary:
  'Guided paddle tours through the mangrove channels at the river mouth, run by the barangay fisherfolk association. Two-hour circuit; early morning departures.',
  details: [
  'The tour follows a tidal channel through mangrove forest at the mouth of the Agusan River, paddled in the same wooden outrigger boats the barangay uses for fishing. Guides are members of the Barangay Guiasan Fisherfolk Association, and the fee goes directly to the association rather than a third-party operator.',
  'Because the route is tide-dependent, departure times shift by about 45 minutes each day — the association will confirm the exact time when you book. Boats seat up to four passengers plus the guide, and the circuit takes roughly two hours at a slow paddle, with stops to point out nesting sites and the replanting areas from the municipality’s reforestation drive.'],

  highlights: [
  'Two-hour guided circuit through mangrove tidal channels',
  'Proceeds support the Barangay Guiasan Fisherfolk Association directly',
  'Best light for photos on the early-morning departure',
  'Life vests provided and required for all passengers, including children'],

  access: 'Boats depart from the small dock at Barangay Guiasan, about 20 minutes from the Poblacion by habal-habal. Book at least a day ahead through the barangay hall.',
  image: "/661ca88d-5f8f-40e9-9643-9d603f247154.jpg",
  alt: 'Mangrove-lined tidal channel with a small wooden outrigger boat moored at the edge',
  season: 'Year-round, tide-dependent',
  fee: '₱ 350 per boat (up to 4 pax)'
},
{
  id: 'dest-landing',
  name: 'Poblacion Fish Landing',
  barangay: 'Barangay Poblacion',
  summary:
  'The municipal wharf and morning market where the day’s catch is sorted and auctioned. The most direct look at how Magallanes actually makes its living.',
  details: [
  'Every morning before sunrise, outrigger boats line up along the concrete wharf to unload the night’s catch. By 5:00 AM the informal auction is already underway — buyers from as far as Butuan City come for the fish landing’s reputation for fresh catch, and it is common to see the sorting, weighing and haggling happen within arm’s reach of visitors.',
  'This is a working wharf, not a tourist attraction dressed up as one, so the usual courtesies apply: stay out of the way of boats and porters, and ask before photographing anyone directly. Most vendors are happy to explain what is being sold if you ask.'],

  highlights: [
  'Busiest and most photogenic between 5:00 and 6:30 AM',
  'Fresh catch available for purchase directly from boats, cheaper than the public market',
  'A short walk from the Municipal Hall — easy to combine with a morning visit',
  'Coffee and rice-meal stalls open nearby from 5:00 AM'],

  access: 'Walking distance from the Municipal Hall and the Poblacion town proper — no transport needed if you are already in the town center.',
  image: "/104500b7-e859-4c31-a2dc-5a44bde95241.jpg",
  alt: 'Municipal fish landing with colorful wooden outrigger boats moored along a concrete wharf',
  season: 'Daily, 5:00 – 8:00 AM',
  fee: 'No entrance fee'
}];


export type Festival = {
  day: string;
  month: string;
  name: string;
  detail: string;
};

export const FESTIVALS: Festival[] = [
{
  day: '12',
  month: 'FEB',
  name: 'Bitaug Festival',
  detail: 'Week-long municipal fiesta: street dancing, fluvial procession and the coastal clean-up drive.'
},
{
  day: '03',
  month: 'MAY',
  name: 'Kadagatan Sea Blessing',
  detail: 'Blessing of the fishing fleet at the Poblacion wharf, followed by the boat race across the channel.'
},
{
  day: '20',
  month: 'AUG',
  name: 'Araw ng Magallanes',
  detail: 'Founding anniversary rites, civic parade and the agri-fishery trade fair at the municipal plaza.'
},
{
  day: '08',
  month: 'DEC',
  name: 'Pasko sa Baybayon',
  detail: 'Lantern display along the shoreline barangays and the community Noche Buena at the plaza.'
}];


export const TRAVEL_NOTES = [
{ label: 'From Butuan City', value: '45 min · 28 km via the national highway' },
{ label: 'Nearest airport', value: 'Bancasi Airport (BXU) · 35 km' },
{ label: 'Public transport', value: 'Jeepney and multicab from Langihan terminal, 5:00 AM – 6:00 PM' },
{ label: 'Tourism office', value: '(085) 000-0000 · tourism@magallanes-adn.gov.ph' }];