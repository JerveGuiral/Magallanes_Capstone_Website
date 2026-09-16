import React from 'react';
import { FileTextIcon, DownloadIcon, CheckIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { DISCLOSURES, SEAL_REQUIREMENTS } from '../data/government';

export function Transparency() {
  return (
    <>
      <PageHeader
        eyebrow="Transparency"
        title="Transparency Seal"
        description="Documents posted in compliance with the Full Disclosure Policy of the Department of the Interior and Local Government, and with the Freedom of Information program." />


      <section className="w-full py-12" aria-labelledby="disclosures-title">
        <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <div>
            <div id="disclosures-title">
              <SectionHeading
                eyebrow="Full disclosure"
                title="Posted documents"
                description="Reports are posted within 30 days of the close of each reporting period. Certified copies may be requested from the Municipal Accountant." />

            </div>

            <ul className="mt-8 space-y-px bg-hairline">
              {DISCLOSURES.map((doc, i) =>
                <Reveal as="li" key={doc.title} delay={i * 0.03}>
                  <a
                    href="#disclosure-document"
                    className="group flex items-center justify-between gap-4 bg-white p-5 transition-colors duration-150 hover:bg-navy-50">

                    <span className="flex min-w-0 gap-4">
                      <FileTextIcon className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block font-display text-base font-bold leading-snug text-navy">
                          {doc.title}
                        </span>
                        <span className="mt-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                          {doc.period} · {doc.format}
                        </span>
                      </span>
                    </span>
                    <DownloadIcon
                      className="h-4 w-4 shrink-0 text-ink-muted transition-colors duration-150 group-hover:text-teal"
                      aria-hidden="true" />

                  </a>
                </Reveal>
              )}
            </ul>
          </div>

          <aside className="space-y-6">
            <div className="border border-hairline bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">What the Seal covers</h2>
              <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
              <ul className="mt-5 space-y-3">
                {SEAL_REQUIREMENTS.map((req) =>
                  <li key={req} className="flex gap-3 text-sm leading-relaxed text-ink">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    {req}
                  </li>
                )}
              </ul>
            </div>

            <div className="border border-hairline bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">Freedom of Information</h2>
              <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
              <p className="mt-5 text-sm leading-relaxed text-ink">
                Any citizen may request records not posted here. File a written request with the FOI Receiving Officer
                at the Municipal Hall; a decision is issued within 15 working days.
              </p>
              <dl className="mt-5 divide-y divide-hairline border-t border-hairline">
                <div className="py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">FOI Receiving Officer</dt>
                  <dd className="mt-1 text-sm text-ink">Office of the Municipal Administrator</dd>
                </div>
                <div className="py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Email</dt>
                  <dd className="mt-1 font-mono text-sm text-ink">foi@magallanes-adn.gov.ph</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <MotifDivider />

      <section className="w-full py-12" aria-labelledby="anti-fixer-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="border-l-2 border-gold bg-white p-6">
            <h2 id="anti-fixer-title" className="font-display text-display-md font-bold text-navy">
              No fixers. No unofficial fees.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink">
              Every payment to the municipality is covered by an official receipt. If any person offers to expedite a
              transaction for a fee, report it to the Office of the Municipal Mayor or through the Public Assistance
              Desk — reports may be filed anonymously.
            </p>
          </div>
        </div>
      </section>
    </>);

}