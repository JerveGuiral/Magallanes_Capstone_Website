import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { Picture, SealImage } from '../ui/Picture';
import { Bunting } from '../ui/Bunting';
import { SocialLinks } from './SocialLinks';
import { LGU_CONTACT, SITE } from '../../data/site';

/* Every entry resolves to a route that exists. The previous footer pointed all
 * fifteen links at "#footer-link", which is worse than having fewer links. */
const COLUMNS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: 'The Municipality',
    links: [
      { label: 'About Magallanes', to: '/about' },
      { label: 'History & heritage', to: '/about#history-title' },
      { label: 'Municipal officials', to: '/officials' },
      { label: 'The 8 barangays', to: '/barangays' },
      { label: 'Visit Magallanes', to: '/tourism' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { label: 'Service directory', to: '/services' },
      { label: 'Downloadable forms', to: '/forms' },
      { label: 'Bids & awards', to: '/bids' },
      { label: 'Report a concern', to: '/report' },
      { label: 'Office directory', to: '/offices' },
      { label: 'News & advisories', to: '/news' },
    ],
  },
];

/* Genuine national sites — the only outbound links on the site. The standard government footer
 * (DICT's government website template) asks for the branches of government and the GOV.PH
 * portals; they share one column: the branches as links, the portals as chips. */
const GOV_BRANCHES = [
  { label: 'Office of the President', href: 'https://op-proper.gov.ph/' },
  { label: 'Office of the Vice President', href: 'https://www.ovp.gov.ph/' },
  { label: 'Senate', href: 'https://www.senate.gov.ph/' },
  { label: 'House of Representatives', href: 'https://www.congress.gov.ph/' },
  { label: 'Supreme Court', href: 'https://sc.judiciary.gov.ph/' },
];

const GOV_PORTALS = [
  { label: 'GOV.PH', href: 'https://www.gov.ph/' },
  { label: 'Open Data Portal', href: 'https://data.gov.ph/' },
  { label: 'Official Gazette', href: 'https://www.officialgazette.gov.ph/' },
  { label: 'DILG', href: 'https://www.dilg.gov.ph/' },
  { label: 'PhilGEPS', href: 'https://www.philgeps.gov.ph/' },
  { label: 'PAGASA', href: 'https://www.pagasa.dost.gov.ph/' },
  { label: 'eFOI Portal', href: 'https://www.foi.gov.ph/' },
];

function ExternalLink({ label, href, className = '' }: { label: string; href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-1.5 transition-colors duration-150 hover:underline hover:underline-offset-4 ${className}`}
    >
      {label}
      <ExternalLinkIcon className="h-3 w-3 shrink-0 opacity-60 transition-opacity duration-150 group-hover:opacity-100" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

const LEGAL_LINKS = [
  { label: 'Freedom of Information', to: '/foi' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Transparency Seal', to: '/transparency' },
  { label: 'Contact', to: '/contact' },
];

/** The email, allowed to wrap after "@" rather than in the middle of a word. */
function EmailText({ email }: { email: string }) {
  const at = email.indexOf('@');
  if (at < 0) return <>{email}</>;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}

const heading = 'font-sans text-eyebrow uppercase text-brand-700';
const link = 'text-[0.9375rem] text-ink-light transition-colors duration-150 hover:text-brand-700';

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-brand-50 via-brand-50 to-brand-100 text-ink-muted">
      {/* The fiesta bunting runs the full width of the page along the footer's top edge. */}
      <Bunting size="md" />

      {/* The pink Municipal Hall itself, faded into the right side of the footer. */}
      <Picture
        name="municipal-hall-1"
        alt=""
        sizes="50vw"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        imgClassName="h-full w-full object-cover opacity-[0.16] [mask-image:linear-gradient(to_left,black_35%,transparent)]"
      />

      <div className="container-page relative grid grid-cols-2 gap-x-6 gap-y-10 pb-14 pt-12 md:grid-cols-3 lg:grid-cols-[1.45fr_1fr_1fr_1.35fr]">
        {/* ---- Identity & contact ---- (full width until the columns fit beside it) */}
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white shadow-card ring-4 ring-white/60">
              <SealImage alt="Municipal seal of Magallanes" className="h-16 w-16 object-contain" />
            </span>
            <p className="font-display text-xl font-extrabold leading-tight tracking-[-0.015em] text-brand-800">
              Municipality of
              <br />
              Magallanes
              <span className="mt-1 block font-sans text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-accent-700">
                Agusan del Norte
              </span>
            </p>
          </div>

          <address className="mt-6 space-y-3 text-[0.875rem] not-italic leading-relaxed text-ink-light">
            <p className="flex gap-2.5">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              {LGU_CONTACT.address}, Philippines
            </p>
            <p className="flex gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <span>
                <a href={LGU_CONTACT.phoneHref} className="font-semibold tabular-nums transition-colors duration-150 hover:text-brand-700">
                  {LGU_CONTACT.phone}
                </a>
                <span className="block text-[0.75rem] text-ink-muted">{LGU_CONTACT.phoneLabel}</span>
              </span>
            </p>
            <p className="flex gap-2.5">
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
              <a href={`mailto:${LGU_CONTACT.email}`} className="min-w-0 transition-colors duration-150 hover:text-brand-700">
                <EmailText email={LGU_CONTACT.email} />
              </a>
            </p>
          </address>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <SocialLinks variant="footer" />
            <Link
              to="/transparency"
              className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-white px-3.5 py-2 shadow-subtle transition-colors duration-150 hover:border-accent-400 hover:bg-accent-50"
            >
              <ShieldCheckIcon className="h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
              <span className="text-[0.8125rem] font-semibold text-accent-800">Transparency Seal</span>
            </Link>
          </div>
        </div>

        {/* ---- Internal columns ---- */}
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h2 className={heading}>{col.heading}</h2>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={`${link} hover:underline hover:underline-offset-4`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* ---- National government: the branches as links, the GOV.PH portals as chips ---- */}
        <nav aria-label="National government" className="col-span-2 md:col-span-1">
          <h2 className={heading}>Government links</h2>
          <ul className="mt-4 space-y-2.5">
            {GOV_BRANCHES.map((item) => (
              <li key={item.label}>
                <ExternalLink {...item} className={link} />
              </li>
            ))}
          </ul>
          <h2 className={`${heading} mt-7`}>Government portals</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {GOV_PORTALS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-[0.8125rem] font-medium text-brand-700 transition-colors duration-150 hover:border-brand-400 hover:bg-white"
                >
                  {item.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ---- Legal strip ----
          Bottom padding clears the floating chat launcher, which otherwise sits
          on top of the last row of links once the page is scrolled to the end. */}
      <div className="relative border-t border-brand-200/70 bg-white/40">
        <div className="container-page flex flex-col gap-3 pb-24 pt-4 text-[0.75rem] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>
              {SITE.official
                ? `© ${new Date().getFullYear()} Local Government Unit of Magallanes, Agusan del Norte`
                : 'A capstone project — not yet the official website of the Local Government Unit of Magallanes.'}
            </p>
            <p>Republic of the Philippines · All content is in the public domain unless otherwise stated.</p>
          </div>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="transition-colors duration-150 hover:text-brand-700 hover:underline hover:underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/admin" className="text-[0.6875rem] text-ink-muted transition-colors duration-150 hover:text-brand-700">
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
