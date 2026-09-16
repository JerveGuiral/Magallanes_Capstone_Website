import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { BitaugMotif } from '../components/BitaugMotif';

const PROFILE = [
  { label: 'Income class', value: '5th class municipality' },
  { label: 'Land area', value: '141.30 km²' },
  { label: 'Barangays', value: '12' },
  { label: 'Population (2020 CPH)', value: '23,684' },
  { label: 'Founded', value: '1959' },
  { label: 'Fiscal year budget', value: '₱ 214.6 M (2026)' }];


export function About() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The Municipality of Magallanes"
        description="A coastal municipality at the mouth of the Agusan River, named for the navigator whose route passed these waters — and known locally for the Bitaug trees that line its shore." />


      <section className="w-full py-12" aria-labelledby="mandate-title">
        <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <div id="mandate-title">
              <SectionHeading eyebrow="Mandate" title="What this local government is for" />
            </div>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink">
              <p>
                Under the Local Government Code of 1991, the municipality delivers basic services in health,
                agriculture, social welfare, environmental management, and infrastructure. In Magallanes, that mandate
                is shaped by geography: most of our residents live within two kilometres of water, and livelihood
                follows the tide.
              </p>
              <p>
                Priorities for the current term are coastal resilience, potable water coverage in all 12 barangays,
                and a frontline service standard of three working days for routine permits and certifications.
              </p>
            </div>

            <div className="mt-8 border-l-2 border-gold bg-white p-5">
              <p className="font-display text-lg font-bold italic leading-snug text-navy">
                “Matarong nga pagdumala, sigurado nga serbisyo.”
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                Official motto of the Municipality
              </p>
            </div>
          </div>

          <aside className="border border-hairline bg-white p-6" aria-labelledby="profile-title">
            <h2 id="profile-title" className="font-display text-lg font-bold text-navy">
              Municipal profile
            </h2>
            <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
            <dl className="mt-5 divide-y divide-hairline">
              {PROFILE.map((row) =>
                <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-ink-muted">{row.label}</dt>
                  <dd className="font-mono text-sm text-ink">{row.value}</dd>
                </div>
              )}
            </dl>
          </aside>
        </div>
      </section>

      <MotifDivider />

      <section className="relative w-full overflow-hidden bg-navy py-12 text-white" aria-labelledby="heritage-title">
        <BitaugMotif className="pointer-events-none absolute -right-6 top-2 hidden h-48 w-64 text-white/[0.07] md:block" />
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-gold">Local heritage</p>
          <h2 id="heritage-title" className="mt-2 max-w-2xl font-display text-display-md font-bold">
            The Bitaug tree
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-200">
            Bitaug (Calophyllum inophyllum) grows along the Magallanes shoreline, anchoring sand against storm surge
            and shading the fish landings where the day’s catch is sorted. It appears throughout this site as a single
            line drawing — a quiet marker of where we are, and what we are protecting.
          </p>
        </div>
      </section>
    </>);

}