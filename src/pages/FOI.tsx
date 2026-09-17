import React from 'react';
import { CheckIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';

const STEPS = [
  { step: '01', title: 'File a written request', detail: 'Submit a request specifying the records you need and your contact details, addressed to the FOI Receiving Officer.' },
  { step: '02', title: 'Receive an acknowledgment', detail: 'The Receiving Officer logs your request and confirms receipt within the same working day.' },
  { step: '03', title: 'Decision within 15 working days', detail: 'You will be notified whether the request is granted, denied, or requires an extension, as allowed under EO No. 2, s. 2016.' },
  { step: '04', title: 'Release of records', detail: 'Approved records are released in the format requested where feasible, subject to reasonable reproduction fees.' },
];

const EXCEPTIONS = [
  'Information classified as confidential or privileged under existing law (e.g., ongoing investigations, personnel records)',
  'Records that would violate the privacy rights of individuals under the Data Privacy Act of 2012',
  'National security, law enforcement, and public order information as defined by law',
  'Trade secrets and other confidential business information submitted to the municipality',
];

export function FOI() {
  return (
    <>
      <PageHeader
        eyebrow="Freedom of Information"
        title="Freedom of Information"
        description="Any citizen may request access to official records of the Municipality of Magallanes, in compliance with Executive Order No. 2, s. 2016."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="foi-process-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div id="foi-process-title">
              <SectionHeading eyebrow="How to request" title="Filing an FOI request" description="Requests not already posted on the Transparency page can be filed directly with our office." />
            </div>

            <ol className="mt-9 overflow-hidden rounded-lg border border-hairline bg-white shadow-subtle">
              {STEPS.map((s) => (
                <li key={s.step} className="flex gap-5 border-b border-hairline bg-white p-5 last:border-b-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-brand-200 bg-white font-mono text-[0.8125rem] font-semibold text-brand-600">{s.step}</span>
                  <div>
                    <h3 className="font-display text-[1.0625rem] font-bold text-brand-800">{s.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="card p-6 lg:sticky lg:top-24 lg:self-start" aria-labelledby="foi-officer-title">
            <h2 id="foi-officer-title" className="font-display text-lg font-bold text-brand-800">
              FOI Receiving Officer
            </h2>
            <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />
            <dl className="mt-5 divide-y divide-hairline">
              <div className="py-3">
                <dt className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Office</dt>
                <dd className="mt-1 text-[0.9375rem] text-ink">Office of the Municipal Administrator</dd>
              </div>
              <div className="py-3">
                <dt className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Email</dt>
                <dd className="mt-1 break-all font-mono text-[0.875rem] text-ink">foi@magallanes-adn.gov.ph</dd>
              </div>
              <div className="py-3">
                <dt className="font-display text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Walk-in</dt>
                <dd className="mt-1 text-[0.9375rem] text-ink">Municipal Hall, Ground Floor, Monday to Friday, 8:00 AM – 5:00 PM</dd>
              </div>
            </dl>
            <p className="mt-5 border-t border-hairline pt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              Requests may also be filed online through the national eFOI portal at foi.gov.ph.
            </p>
          </aside>
        </div>
      </section>

      <MotifDivider />

      <section className="w-full py-14 lg:py-section" aria-labelledby="foi-exceptions-title">
        <div className="container-page">
          <div id="foi-exceptions-title">
            <SectionHeading eyebrow="Exceptions" title="Information not covered by this policy" />
          </div>
          <ul className="mt-6 space-y-3">
            {EXCEPTIONS.map((item) => (
              <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-sea-700" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.8125rem] leading-relaxed text-ink-muted">
            A denial of access will always state the specific legal basis and inform you of your right to appeal.
          </p>
        </div>
      </section>
    </>
  );
}
