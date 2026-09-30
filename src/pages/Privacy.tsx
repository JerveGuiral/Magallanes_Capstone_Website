import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import {
  PRIVACY_SECTIONS,
  DATA_PROTECTION_OFFICER,
  NPC_NOTE,
  PRIVACY_SUMMARY,
} from '../data/privacy';


export function Privacy() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy Policy"
        title="Privacy Policy"
        description={PRIVACY_SUMMARY}
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="privacy-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div id="privacy-title">
              <SectionHeading eyebrow="Data Privacy Act of 2012" title="How we handle your information" />
            </div>

            <div className="mt-8 space-y-7">
              {PRIVACY_SECTIONS.map((s) => (
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
              {DATA_PROTECTION_OFFICER.map((row) => (
                <div key={row.label} className="py-3">
                  <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    {row.label}
                  </dt>
                  <dd className={`mt-1 text-ink ${row.mono ? 'break-all font-mono text-[0.875rem]' : 'text-[0.9375rem]'}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-hairline pt-4 text-[0.8125rem] leading-relaxed text-ink-muted">
              {NPC_NOTE}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
