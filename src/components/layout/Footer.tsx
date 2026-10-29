import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';
import { SealImage } from '../ui/Picture';
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
      { label: 'Bids & awards', to: '/bids' },
      { label: 'Report a concern', to: '/report' },
      { label: 'Office directory', to: '/offices' },
      { label: 'News & advisories', to: '/news' },
    ],
  },
];

/* Genuine national portals — the only outbound links on the site. */
const GOV_LINKS = [
  { label: 'DILG', href: 'https://www.dilg.gov.ph/' },
  { label: 'PhilGEPS', href: 'https://www.philgeps.gov.ph/' },
  { label: 'PAGASA advisories', href: 'https://www.pagasa.dost.gov.ph/' },
  { label: 'eFOI Portal', href: 'https://www.foi.gov.ph/' },
];

/* The standard government footer (DICT's government website template): the Republic, the
 * GOV.PH portals and the branches of government. */
const GOVPH_COLUMNS = [
  {
    heading: 'About GOVPH',
    links: [
      { label: 'GOV.PH', href: 'https://www.gov.ph/' },
      { label: 'Open Data Portal', href: 'https://data.gov.ph/' },
      { label: 'Official Gazette', href: 'https://www.officialgazette.gov.ph/' },
    ],
  },
  {
    heading: 'Government links',
    links: [
      { label: 'Office of the President', href: 'https://op-proper.gov.ph/' },
      { label: 'Office of the Vice President', href: 'https://www.ovp.gov.ph/' },
      { label: 'Senate of the Philippines', href: 'https://www.senate.gov.ph/' },
      { label: 'House of Representatives', href: 'https://www.congress.gov.ph/' },
      { label: 'Supreme Court', href: 'https://sc.judiciary.gov.ph/' },
    ],
  },
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

export function Footer() {
  return (
    <footer className="mt-auto bg-surface-muted text-ink-muted">
      {/* Accent rule: the one place the accent runs the full page width. */}
      <div className="h-1 w-full bg-accent-500" aria-hidden="true" />

      <div className="relative">
        <BitaugMotif className="pointer-events-none absolute bottom-6 right-6 hidden h-36 w-48 text-brand-800/[0.05] lg:block" />

        <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* ---- Identity & contact ---- */}
          <div>
            <div className="flex items-center gap-3.5">
              <SealImage alt="Municipal seal of Magallanes" className="h-16 w-16 shrink-0 object-contain" />
              <p className="font-display text-lg font-extrabold leading-tight tracking-[-0.015em] text-brand-800">
                Municipality of
                <br />
                Magallanes
              </p>
            </div>

            <address className="mt-5 space-y-3 text-[0.8125rem] not-italic leading-relaxed">
              <p className="flex gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                {LGU_CONTACT.address}, Philippines
              </p>
              <p className="flex gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  <a href={LGU_CONTACT.phoneHref} className="font-mono transition-colors duration-150 hover:text-brand-800">
                    {LGU_CONTACT.phone}
                  </a>
                  <span className="block text-[0.75rem] opacity-80">{LGU_CONTACT.phoneLabel}</span>
                </span>
              </p>
              <p className="flex gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                <a href={`mailto:${LGU_CONTACT.email}`} className="font-mono break-all transition-colors duration-150 hover:text-brand-800">
                  {LGU_CONTACT.email}
                </a>
              </p>
            </address>

            <SocialLinks variant="footer" className="mt-6" />
          </div>

          {/* ---- Internal columns ---- */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-sans text-eyebrow uppercase text-accent-700">{col.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.875rem] transition-colors duration-150 hover:text-brand-800 hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* ---- Agencies residents deal with ---- */}
          <nav aria-label="Useful portals">
            <h2 className="font-sans text-eyebrow uppercase text-accent-700">Useful portals</h2>
            <ul className="mt-4 space-y-2.5">
              {GOV_LINKS.map((link) => (
                <li key={link.label}>
                  <ExternalLink {...link} className="text-[0.875rem] hover:text-brand-800" />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* ---- Standard government footer ---- */}
      <div className="bg-brand-950 text-brand-100">
        <div className="container-page grid gap-8 py-10 text-[0.8125rem] md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h2 className="font-sans text-eyebrow uppercase text-white">Republic of the Philippines</h2>
            <p className="mt-3 max-w-sm leading-relaxed">All content is in the public domain unless otherwise stated.</p>
            <Link
              to="/transparency"
              className="mt-5 inline-flex items-center gap-2.5 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2.5 font-semibold text-white transition-colors duration-150 hover:border-white/40 hover:bg-white/10"
            >
              <ShieldCheckIcon className="h-5 w-5 text-accent-300" aria-hidden="true" />
              <span>
                Transparency Seal
                <span className="block text-[0.6875rem] font-normal text-brand-200">Budget, plans and procurement disclosures</span>
              </span>
            </Link>
          </div>
          {GOVPH_COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-sans text-eyebrow uppercase text-white">{col.heading}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <ExternalLink {...link} className="hover:text-white" />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* ---- Legal strip ----
          Bottom padding clears the floating chat launcher, which otherwise sits
          on top of the last row of links once the page is scrolled to the end. */}
      <div className="border-t border-hairline">
        <div className="container-page flex flex-col gap-3 pb-24 pt-4 text-[0.75rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {SITE.official
              ? `© ${new Date().getFullYear()} Local Government Unit of Magallanes, Agusan del Norte`
              : 'A capstone project — not yet the official website of the Local Government Unit of Magallanes.'}
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition-colors duration-150 hover:text-brand-800 hover:underline hover:underline-offset-4">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/admin"
                className="font-mono text-[0.6875rem] text-ink-subtle transition-colors duration-150 hover:text-brand-800"
              >
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
