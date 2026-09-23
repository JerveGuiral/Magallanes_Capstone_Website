import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'We collect only the personal data you provide directly: your name, barangay, contact number or email, and the details of a request or concern when you use the Contact form, apply for a service, or message our chatbot. We do not collect data from third-party brokers or track you across other websites.',
  },
  {
    title: 'Why we collect it',
    body: 'Personal data submitted through this site is processed solely to act on your request — routing a concern to the right office, following up on a service application, or responding to an inquiry. We do not use it for marketing, and we do not sell or rent it to any third party.',
  },
  {
    title: 'Legal basis',
    body: 'Processing is carried out under the mandate of the Local Government Code of 1991 and in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its Implementing Rules and Regulations.',
  },
  {
    title: 'Who can access it',
    body: 'Only authorized personnel of the office your request concerns can view your submission. Chat transcripts are reviewed only to improve the assistant’s answers and are never published with your identity attached.',
  },
  {
    title: 'Retention',
    body: 'Records are retained only as long as necessary to act on your request and to comply with the National Archives of the Philippines’ records retention schedule for local government units, after which they are securely disposed of.',
  },
  {
    title: 'Your rights',
    body: 'Under the Data Privacy Act, you have the right to be informed, to access your data, to correct inaccurate data, to object to processing, to data portability, and to file a complaint with the National Privacy Commission. To exercise any of these rights, contact our Data Protection Officer below.',
  },
];

export function Privacy() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy Policy"
        title="Privacy Policy"
        description="How the Municipality of Magallanes collects, uses, and protects personal data submitted through this website, in compliance with the Data Privacy Act of 2012 (RA 10173)."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="privacy-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div id="privacy-title">
              <SectionHeading eyebrow="Data Privacy Act of 2012" title="How we handle your information" />
            </div>

            <div className="mt-8 space-y-7">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="font-display text-lg font-bold text-brand-800">{s.title}</h2>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="card p-6 lg:sticky lg:top-24 lg:self-start" aria-labelledby="dpo-title">
            <h2 id="dpo-title" className="font-display text-lg font-bold text-brand-800">
              Data Protection Officer
            </h2>
            <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />
            <dl className="mt-5 divide-y divide-hairline">
              <div className="py-3">
                <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Office</dt>
                <dd className="mt-1 text-[0.9375rem] text-ink">Office of the Municipal Administrator</dd>
              </div>
              <div className="py-3">
                <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Email</dt>
                <dd className="mt-1 break-all font-mono text-[0.875rem] text-ink">dpo@magallanes-adn.gov.ph</dd>
              </div>
              <div className="py-3">
                <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">Phone</dt>
                <dd className="mt-1 break-all font-mono text-[0.875rem] text-ink">(085) 000-0000</dd>
              </div>
            </dl>
            <p className="mt-5 border-t border-hairline pt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              You may also file a complaint directly with the National Privacy Commission at privacy.gov.ph.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
