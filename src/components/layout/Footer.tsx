import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';
import { SealImage } from '../ui/Picture';
import { SocialLinks } from './SocialLinks';

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
      { label: 'Report a concern', to: '/contact' },
      { label: 'Office directory', to: '/contact#offices' },
      { label: 'News & advisories', to: '/news' },
    ],
  },
];

/* Genuine national portals — the only outbound links on the site. */
const GOV_LINKS = [
  { label: 'DILG', href: 'https://www.dilg.gov.ph/' },
  { label: 'Official Gazette', href: 'https://www.officialgazette.gov.ph/' },
  { label: 'PhilGEPS', href: 'https://www.philgeps.gov.ph/' },
  { label: 'PAGASA advisories', href: 'https://www.pagasa.dost.gov.ph/' },
  { label: 'eFOI Portal', href: 'https://www.foi.gov.ph/' },
];

const LEGAL_LINKS = [
  { label: 'Freedom of Information', to: '/foi' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Transparency Seal', to: '/transparency' },
  { label: 'Contact', to: '/contact' },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-brand-900 text-brand-200">
      {/* Brass rule: the one place the accent runs the full page width. */}
      <div className="h-1 w-full bg-accent-500" aria-hidden="true" />

      <div className="relative">
        <BitaugMotif className="pointer-events-none absolute bottom-6 right-6 hidden h-36 w-48 text-white/[0.06] lg:block" />

        <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* ---- Identity & contact ---- */}
          <div>
            <div className="flex items-center gap-3.5">
              <SealImage alt="Municipal seal of Magallanes" className="h-16 w-16 shrink-0 object-contain" />
              <p className="font-display text-lg font-extrabold leading-tight tracking-[-0.015em] text-white">
                Municipality of
                <br />
                Magallanes
              </p>
            </div>

            <address className="mt-5 space-y-3 text-[0.8125rem] not-italic leading-relaxed">
              <p className="flex gap-2.5">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                Municipal Hall, Barangay Poblacion, Magallanes, Agusan del Norte 8604, Philippines
              </p>
              <p className="flex gap-2.5">
                <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                <span className="font-mono">(085) 000-0000</span>
              </p>
              <p className="flex gap-2.5">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                <span className="font-mono break-all">info@magallanes-adn.gov.ph</span>
              </p>
            </address>

            <SocialLinks variant="footer" className="mt-6" />
          </div>

          {/* ---- Internal columns ---- */}
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-sans text-eyebrow uppercase text-accent-400">{col.heading}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[0.875rem] transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* ---- National portals ---- */}
          <nav aria-label="Government links">
            <h2 className="font-sans text-eyebrow uppercase text-accent-400">Government links</h2>
            <ul className="mt-4 space-y-2.5">
              {GOV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[0.875rem] transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                    <ExternalLinkIcon
                      className="h-3 w-3 shrink-0 text-brand-300 transition-colors duration-150 group-hover:text-accent-400"
                      aria-hidden="true"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* ---- Legal strip ---- */}
      <div className="border-t border-white/15">
        <div className="container-page flex flex-col gap-3 py-4 text-[0.75rem] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Local Government of Magallanes. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition-colors duration-150 hover:text-white hover:underline hover:underline-offset-4">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/admin"
                className="font-mono text-[0.6875rem] text-brand-300 transition-colors duration-150 hover:text-white"
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
