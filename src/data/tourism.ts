export type Destination = {
  id: string;
  name: string;
  barangay: string;
  summary: string;
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
  image: "/589436ec-2378-4f84-8c6e-8a2f1f445b3f.jpg",
  alt: 'Grey-sand shoreline shaded by mature Bitaug trees, with low green hills across the bay',
  season: 'Best from March to June (calm seas)',
  fee: 'No entrance fee'
},
{
  id: 'dest-delta',
  name: 'Agusan Delta Mangroves',
  barangay: 'Barangay Guiapo',
  summary:
  'Guided paddle tours through the mangrove channels at the river mouth, run by the barangay fisherfolk association. Two-hour circuit; early morning departures.',
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