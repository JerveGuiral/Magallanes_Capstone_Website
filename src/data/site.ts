/**
 * Site-wide identity. `official` stays false until the LGU formally adopts the site (set
 * VITE_OFFICIAL_SITE=true): until then the utility bar and the page titles say this is a capstone
 * project, so a public link is never mistaken for the municipality's official website.
 */
export const SITE = {
  official: import.meta.env.VITE_OFFICIAL_SITE === 'true',
  name: 'Municipality of Magallanes',
};

/**
 * Public contact details, used by every page that shows them (footer, Contact, Home, FOI,
 * Privacy, Tourism). Source: the Mayor's Office contact card supplied by the LGU (Oct 2026);
 * the chatbot uses the same values (server/services/officials.js). Only the contact person and
 * email the card marks for public use are listed.
 */
export const LGU_CONTACT = {
  address: 'Municipal Hall, Barangay Poblacion, Magallanes, Agusan del Norte 8604',
  phone: '0948-623-6977',
  phoneHref: 'tel:+639486236977',
  phoneLabel: "Mayor's Office (Cheryl S. Altura)",
  email: 'mayorsoffice2019.magallanesadn@gmail.com',
  sbEmail: '17sbmagallanes@gmail.com',
  emergency: '911',
  officeHours: 'Monday to Friday, 8:00 AM – 5:00 PM',
  officeHoursNote: 'Check LGU announcements for schedule changes, such as a compressed work week.',
};

/**
 * Local emergency hotlines, as painted on the LGU's "EMERGENCY HOTLINE No." sign photographed
 * by the capstone team (Oct 2026). The PNP number's first digit is hidden by a pole on the sign;
 * Philippine mobile numbers are 11 digits starting 09, and the 10 visible digits start with 9.
 * The chatbot gives the same numbers (server/services/generalInfo.js, HOTLINES).
 */
export const EMERGENCY_HOTLINES = [
  { label: 'MERT', detail: 'Rescue', number: '0938 759 1508', href: 'tel:+639387591508' },
  { label: 'BFP', detail: 'Fire', number: '0931 721 8881', href: 'tel:+639317218881' },
  { label: 'PNP', detail: 'Police', number: '0947 994 4405', href: 'tel:+639479944405' },
] as const;

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
  { label: 'Bids & Awards', to: '/bids', description: 'Invitations to bid and notices of award' },
  { label: 'Municipal Officials', to: '/officials', description: 'Elected and appointed officials' },
  { label: 'Municipal Offices', to: '/offices', description: 'Office directory and department heads' },
  { label: 'Barangays', to: '/barangays', description: 'The 8 barangays of Magallanes' }]

},
{ label: 'Tourism', to: '/tourism' },
{ label: 'News', to: '/news' },
{ label: 'Contact', to: '/contact' }];
/**
 * Official social accounts of the LGU.
 *
 * Leave `href` empty for any account that does not exist yet — the header and
 * footer both filter these out, so an unconfigured account is simply not shown
 * rather than rendering a link to "#facebook" that goes nowhere. Fill in the
 * real profile URLs here and both places pick them up.
 */
export type SocialLink = { label: 'Facebook' | 'YouTube' | 'Instagram'; href: string };

/**
 * Official social accounts, shown in the header strip and the footer.
 *
 * An entry with an empty `href` still renders its icon, but as a non-interactive,
 * dimmed placeholder marked "not yet available" — it is never a link to nowhere.
 * Paste the real URL in when the account exists and it becomes clickable with no
 * other change.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', href: 'https://www.facebook.com/MagallanesADNPIO' },
  { label: 'YouTube', href: '' },
  { label: 'Instagram', href: '' },
];
