export type Advisory = {
  id: string;
  category: 'Weather' | 'Public Health' | 'Public Notice';
  urgent: boolean;
  title: string;
  body: string;
  reference: string;
  issued: string;
};

export type Service = {
  id: string;
  label: string;
  description: string;
  office: string;
  code: string;
  icon: 'permit' | 'clearance' | 'civil' | 'tax' | 'health' | 'concern' | 'assistance' | 'bidding';
};

export type NewsItem = {
  id: string;
  day: string;
  month: string;
  year: string;
  category: string;
  title: string;
  excerpt: string;
};

export type Barangay = {
  name: string;
  captain: string;
  households: number;
  classification: 'Coastal' | 'Upland' | 'Poblacion';
};

export const ADVISORIES: Advisory[] = [
{
  id: 'adv-1',
  category: 'Weather',
  urgent: true,
  title: 'Tropical Depression Signal No. 1 raised over Agusan del Norte',
  body: 'Fisherfolk in Barangays Poblacion, Caloc-an and Guiapo are advised not to venture out to sea. Evacuation centers at Magallanes Central School are on standby.',
  reference: 'MDRRMO-2026-0814',
  issued: 'Aug 26, 2026 · 5:00 AM'
},
{
  id: 'adv-2',
  category: 'Public Notice',
  urgent: false,
  title: 'Business permit renewal window opens January 2 to 20',
  body: 'Renewals filed within the window are exempt from surcharge. The Business One-Stop Shop will operate at the Municipal Hall lobby on weekdays, 8:00 AM to 5:00 PM.',
  reference: 'BPLO-2026-0031',
  issued: 'Aug 24, 2026 · 9:30 AM'
},
{
  id: 'adv-3',
  category: 'Public Health',
  urgent: false,
  title: 'Free anti-rabies vaccination in all 12 barangays',
  body: 'The Municipal Agriculture Office will conduct house-to-house vaccination of dogs and cats. Coordinate with your barangay health worker for the schedule in your purok.',
  reference: 'MAO-2026-0117',
  issued: 'Aug 21, 2026 · 2:15 PM'
}];


export const SERVICES: Service[] = [
{
  id: 'svc-permit',
  label: 'Business Permit',
  description: 'New applications and annual renewal of mayor’s permit.',
  office: 'Business Permits & Licensing Office',
  code: 'BPLO-01',
  icon: 'permit'
},
{
  id: 'svc-clearance',
  label: 'Barangay Clearance',
  description: 'Residency certification issued through your barangay hall.',
  office: 'Office of the Barangay Secretary',
  code: 'BRGY-04',
  icon: 'clearance'
},
{
  id: 'svc-civil',
  label: 'Civil Registry',
  description: 'Birth, marriage and death certificates; late registration.',
  office: 'Municipal Civil Registrar',
  code: 'MCR-02',
  icon: 'civil'
},
{
  id: 'svc-tax',
  label: 'Real Property Tax',
  description: 'Assessment, payment and tax clearance for land and improvements.',
  office: 'Municipal Treasurer’s Office',
  code: 'MTO-07',
  icon: 'tax'
},
{
  id: 'svc-health',
  label: 'Health & Sanitation',
  description: 'Health certificates, sanitary permits, immunization records.',
  office: 'Rural Health Unit',
  code: 'RHU-03',
  icon: 'health'
},
{
  id: 'svc-concern',
  label: 'Report a Concern',
  description: 'Road, drainage, streetlight and peace-and-order reports.',
  office: 'Public Assistance Desk',
  code: 'PAD-11',
  icon: 'concern'
},
{
  id: 'svc-assistance',
  label: 'Social Assistance',
  description: 'Financial, medical and burial assistance intake.',
  office: 'MSWDO',
  code: 'SWD-05',
  icon: 'assistance'
},
{
  id: 'svc-bidding',
  label: 'Bids & Awards',
  description: 'Invitations to bid, notices of award, procurement records.',
  office: 'BAC Secretariat',
  code: 'BAC-09',
  icon: 'bidding'
}];


export const NEWS: NewsItem[] = [
{
  id: 'news-1',
  day: '26',
  month: 'AUG',
  year: '2026',
  category: 'Infrastructure',
  title: 'Concreting of the Caloc-an coastal road reaches 68% completion',
  excerpt:
  'The 2.4-kilometer farm-to-market road linking Caloc-an to the Poblacion fish landing is targeted for turnover before the northeast monsoon.'
},
{
  id: 'news-2',
  day: '22',
  month: 'AUG',
  year: '2026',
  category: 'Governance',
  title: 'Sangguniang Bayan approves 2027 Annual Investment Program',
  excerpt:
  'Priority allocations cover coastal resource management, the municipal water system expansion, and scholarship slots for 120 students.'
},
{
  id: 'news-3',
  day: '15',
  month: 'AUG',
  year: '2026',
  category: 'Environment',
  title: 'Mangrove reforestation adds 4,000 propagules along the Agusan delta',
  excerpt:
  'Volunteers from four coastal barangays joined the Municipal Environment Office in the second planting cycle of the year.'
},
{
  id: 'news-4',
  day: '08',
  month: 'AUG',
  year: '2026',
  category: 'Public Service',
  title: 'Civil registry begins mobile registration for senior citizens',
  excerpt:
  'Teams will visit upland barangays to process delayed registration of births and to issue certified true copies on site.'
}];


export const BARANGAYS: Barangay[] = [
{ name: 'Poblacion', captain: 'Hon. Ramon L. Dizon', households: 1240, classification: 'Poblacion' },
{ name: 'Caloc-an', captain: 'Hon. Melba S. Tagalog', households: 682, classification: 'Coastal' },
{ name: 'Guiapo', captain: 'Hon. Arturo P. Sabio', households: 514, classification: 'Coastal' },
{ name: 'Buhang', captain: 'Hon. Cristina M. Elpa', households: 431, classification: 'Coastal' },
{ name: 'Marcos', captain: 'Hon. Danilo R. Uy', households: 388, classification: 'Upland' },
{ name: 'Santo Niño', captain: 'Hon. Julieta B. Cantos', households: 356, classification: 'Upland' },
{ name: 'Taod-oy', captain: 'Hon. Efren G. Balala', households: 297, classification: 'Upland' },
{ name: 'Sinamu-an', captain: 'Hon. Norma D. Vergara', households: 264, classification: 'Coastal' },
{ name: 'Cabinet', captain: 'Hon. Rogelio T. Amper', households: 231, classification: 'Upland' },
{ name: 'Sinicgan', captain: 'Hon. Lourdes A. Yap', households: 208, classification: 'Coastal' },
{ name: 'Buenavista', captain: 'Hon. Samuel K. Roa', households: 176, classification: 'Upland' },
{ name: 'Bitaug', captain: 'Hon. Teresita F. Lim', households: 149, classification: 'Coastal' }];


export type NavLinkItem = {
  label: string;
  to: string;
  description?: string;
};

export type NavItem = {
  label: string;
  to?: string;
  children?: NavLinkItem[];
};

export const NAV_LINKS: NavItem[] = [
{ label: 'Home', to: '/' },
{ label: 'About', to: '/about' },
{
  label: 'Government',
  children: [
  { label: 'Services', to: '/services', description: 'Frontline transactions and requirements' },
  { label: 'Transparency', to: '/transparency', description: 'Full disclosure reports and FOI' },
  { label: 'Bids & Awards', to: '/services#bids', description: 'Invitations to bid and notices of award' },
  { label: 'City Officials', to: '/officials', description: 'Elected and appointed officials' },
  { label: 'City Offices', to: '/contact#offices', description: 'Office directory and locals' },
  { label: 'City Barangay', to: '/barangays', description: 'The 12 barangays of Magallanes' }]

},
{ label: 'Tourism', to: '/tourism' },
{ label: 'News', to: '/news' },
{ label: 'Contact', to: '/contact' }];