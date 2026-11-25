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

/* The standard national footer of the government website template, worded as national
 * government sites word it (e.g. dbm.gov.ph): "Republic of the Philippines", "About GOVPH" and
 * "Government Links", in the template's order. It sits in its own band below the municipality's
 * footer, as on those sites. */
const ABOUT_GOVPH_LINKS = [
  { label: 'GOV.PH', href: 'https://www.gov.ph/' },
  { label: 'Open Data Portal', href: 'https://data.gov.ph/' },
  { label: 'Official Gazette', href: 'https://www.officialgazette.gov.ph/' },
];

const GOVERNMENT_LINKS = [
  { label: 'Office of the President', href: 'https://op-proper.gov.ph/' },
  { label: 'Office of the Vice President', href: 'https://www.ovp.gov.ph/' },
  { label: 'Senate of the Philippines', href: 'https://www.senate.gov.ph/' },
  { label: 'House of Representatives', href: 'https://www.congress.gov.ph/' },
  { label: 'Supreme Court', href: 'https://sc.judiciary.gov.ph/' },
  { label: 'Court of Appeals', href: 'https://ca.judiciary.gov.ph/' },
  { label: 'Sandiganbayan', href: 'https://sb.judiciary.gov.ph/' },
];

/* National agencies a Magallanes resident or supplier deals with most. */
const RELATED_AGENCIES = [
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

/* Transparency and FOI now have their own column above, so the strip keeps the rest. */
const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Contact', to: '/contact' },
];

/* "Transparency & accountability": the pages the Full Disclosure Policy and the FOI program
 * expect every LGU site to keep in plain view. */
const ACCOUNTABILITY_LINKS = [
  { label: 'Transparency Seal', to: '/transparency' },
  { label: 'Freedom of Information', to: '/foi' },
  { label: 'Bids & awards', to: '/bids' },
  { label: 'Privacy Policy', to: '/privacy' },
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
    <footer className="relative mt-auto overflow-hidden border-t border-hairline bg-surface-muted text-ink-muted">
      {/* The Municipal Hall itself, faded into the right side of the footer. */}
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

        {/* ---- Transparency & accountability, and the national agencies residents use ---- */}
        <nav aria-label="Transparency and accountability" className="col-span-2 md:col-span-1">
          <h2 className={heading}>Transparency &amp; accountability</h2>
          <ul className="mt-4 space-y-2.5">
            {ACCOUNTABILITY_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={`${link} hover:underline hover:underline-offset-4`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className={`${heading} mt-7`}>Related agencies</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {RELATED_AGENCIES.map((item) => (
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

      {/* ---- Standard national footer (government website template) ---- */}
      <div className="relative border-t border-hairline bg-white/75">
        <div className="container-page grid gap-x-10 gap-y-8 py-10 md:grid-cols-[1fr_1.2fr_1.3fr]">
          <div>
            <h2 className={heading}>Republic of the Philippines</h2>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-light">
              All content is in the public domain unless otherwise stated.
            </p>
          </div>
          <div>
            <h2 className={heading}>About GOVPH</h2>
            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-light">
              Learn more about the Philippine government, its structure, how government works and the people behind it.
            </p>
            <ul className="mt-3 space-y-2">
              {ABOUT_GOVPH_LINKS.map((item) => (
                <li key={item.label}>
                  <ExternalLink {...item} className={link} />
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Government links">
            <h2 className={heading}>Government Links</h2>
            <ul className="mt-3 space-y-2">
              {GOVERNMENT_LINKS.map((item) => (
                <li key={item.label}>
                  <ExternalLink {...item} className={link} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* ---- Legal strip ----
          Bottom padding clears the floating chat launcher, which otherwise sits
          on top of the last row of links once the page is scrolled to the end. */}
      <div className="relative border-t border-hairline bg-white/60">
        <div className="container-page flex flex-col gap-3 pb-24 pt-4 text-[0.75rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {SITE.official
              ? `© ${new Date().getFullYear()} Local Government Unit of Magallanes, Agusan del Norte`
              : 'A capstone project — not yet the official website of the Local Government Unit of Magallanes.'}
          </p>
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
