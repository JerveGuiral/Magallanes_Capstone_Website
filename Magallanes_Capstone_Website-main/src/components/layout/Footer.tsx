import React from 'react';
import { Link } from 'react-router-dom';
import { BitaugMotif } from '../BitaugMotif';

const COLUMNS = [
  {
    heading: 'About',
    links: ['The Municipality', 'Municipal Officials', 'History & Heritage', 'Geography', 'Careers']
  },
  {
    heading: 'Services',
    links: ['Business Permit', 'Barangay Clearance', 'Civil Registry', 'Real Property Tax', 'Report a Concern']
  },
  {
    heading: 'Government Links',
    links: ['DILG', 'Agusan del Norte Provincial Gov’t', 'Official Gazette', 'PhilGEPS', 'PAGASA Advisories']
  }];


export function Footer() {
  return (
    <footer className="mt-auto border-t-2 border-gold bg-navy text-navy-200">
      <div className="relative mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <BitaugMotif className="pointer-events-none absolute bottom-4 right-4 hidden h-32 w-44 text-white/[0.07] lg:block" />

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold text-white">Municipality of Magallanes</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed">
              Municipal Hall, Barangay Poblacion, Magallanes, Agusan del Norte 8604, Philippines
            </p>
            <p className="mt-3 font-mono text-xs text-navy-200">
              (085) 000-0000
              <br />
              info@magallanes-adn.gov.ph
            </p>
          </div>

          {COLUMNS.map((col) =>
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.12em] text-white">{col.heading}</h2>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) =>
                  <li key={link}>
                    <a
                      href="#footer-link"
                      className="text-sm transition-colors duration-150 hover:text-gold">

                      {link}
                    </a>
                  </li>
                )}
              </ul>
            </nav>
          )}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Local Government of Magallanes. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>
              <a href="#foi" className="transition-colors duration-150 hover:text-gold">
                Freedom of Information
              </a>
            </li>
            <li>
              <a href="#privacy" className="transition-colors duration-150 hover:text-gold">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#transparency" className="transition-colors duration-150 hover:text-gold">
                Transparency Seal
              </a>
            </li>
            <li>
              <Link to="/contact" className="transition-colors duration-150 hover:text-gold">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition-colors duration-150 font-semibold text-gold hover:underline">
                Admin Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>);

}