import React from 'react';
import { ClockIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { BitaugMotif } from '../components/BitaugMotif';

const PROFILE = [
  { label: 'Income class', value: '4th class municipality' },
  { label: 'Land area', value: '44.31 km²' },
  { label: 'Barangays', value: '8' },
  { label: 'Population (2020 CPH)', value: '22,293' },
  { label: 'Population (2024 est.)', value: '22,780' },
  { label: 'Founded', value: 'June 21, 1969 (R.A. 5660)' },
  { label: 'Annual expenditure', value: '₱ 137.3 M (2024)' },
];

export function About() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The Municipality of Magallanes"
        description="A coastal municipality at the mouth of the Agusan River, named for the navigator whose route passed these waters — and known locally for the Bitaug trees that line its shore."
      />

      {/* ---- Mandate ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="mandate-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div>
            <div id="mandate-title">
              <SectionHeading eyebrow="Mandate" title="What this local government is for" />
            </div>

            <div className="prose-gov mt-7">
              <p>
                Under the Local Government Code of 1991, the municipality delivers basic services in health,
                agriculture, social welfare, environmental management, and infrastructure. In Magallanes, that mandate
                is shaped by geography: most of our residents live within two kilometres of water, and livelihood
                follows the tide.
              </p>
              <p>
                Priorities for the current term are coastal resilience, potable water coverage in all 8 barangays,
                and a frontline service standard of three working days for routine permits and certifications.
              </p>
            </div>

            {/* Motto — the one piece of Cebuano on the page, given room to be read. */}
            <figure className="mt-9 overflow-hidden rounded-lg border border-hairline bg-white shadow-subtle">
              <span className="block h-1 w-full bg-accent-600" aria-hidden="true" />
              <blockquote className="px-6 py-6">
                <p className="font-display text-display-md font-bold italic leading-snug text-brand-800">
                  “Matarong nga pagdumala, sigurado nga serbisyo.”
                </p>
              </blockquote>
              <figcaption className="border-t border-hairline px-6 py-3 font-sans text-eyebrow uppercase text-ink-muted">
                Official motto of the Municipality
              </figcaption>
            </figure>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="profile-title">
            <div className="card overflow-hidden">
              <h2 id="profile-title" className="border-b border-hairline bg-surface px-6 py-4 font-display text-lg font-bold text-brand-800">
                Municipal profile
              </h2>
              <dl className="divide-y divide-hairline px-6">
                {PROFILE.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-[0.875rem] text-ink-muted">{row.label}</dt>
                    <dd className="text-right font-mono text-[0.875rem] font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <MotifDivider />

      {/* ---- History ---- */}
      <section className="w-full bg-white py-14 lg:py-section" aria-labelledby="history-title">
        <div className="container-page">
          <div id="history-title">
            <SectionHeading eyebrow="Origin" title="History of Magallanes" />
          </div>
          <div className="prose-gov mt-7">
            <p>
              Magallanes was created as an independent municipality on June 21, 1969 through Republic Act No. 5660,
              carved out of the Municipality of Butuan (now Butuan City) as one of the newer towns organized in
              Agusan del Norte. It takes its name from the Hispanized surname of Ferdinand Magellan, the
              Portuguese-born navigator whose expedition passed through these waters in 1521 — a history the
              municipality still marks locally today.
            </p>
            <p>
              Sitting at the mouth of the Agusan and Baug Rivers, the town&rsquo;s low-lying delta terrain has long
              shaped daily life here: dikes hold back the tide, and livelihoods have historically followed the water —
              fishing and aquaculture first, with plywood and match manufacturing developing alongside agriculture in
              the decades since.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Mission & Vision ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="mission-vision-title">
        <div className="container-page">
          <div id="mission-vision-title">
            <SectionHeading eyebrow="Governance" title="Mission & Vision" />
          </div>

          {/* Explicitly marked as pending rather than left looking unfinished —
              an empty dashed box reads as a bug; a dated status note reads as process. */}
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {['Mission', 'Vision'].map((label) => (
              <div key={label} className="rounded-lg border border-dashed border-hairline bg-white p-6">
                <p className="flex items-center gap-2 font-sans text-eyebrow uppercase text-ink-muted">
                  <ClockIcon className="h-3.5 w-3.5 text-accent-700" aria-hidden="true" />
                  {label} — awaiting confirmation
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                  The official {label.toLowerCase()} statement will be published here once confirmed with the Office of
                  the Municipal Mayor and the Sangguniang Bayan.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Heritage ---- */}
      <section className="relative w-full overflow-hidden bg-brand-800 py-14 text-white lg:py-section" aria-labelledby="heritage-title">
        <BitaugMotif className="pointer-events-none absolute -right-8 top-4 hidden h-56 w-72 text-white/[0.07] md:block" />
        <div className="container-page relative">
          <SectionHeading
            tone="dark"
            eyebrow="Local heritage"
            title="The Bitaug tree"
            description="Bitaug (Calophyllum inophyllum) grows along the Magallanes shoreline, anchoring sand against storm surge and shading the fish landings where the day’s catch is sorted. It appears throughout this site as a single line drawing — a quiet marker of where we are, and what we are protecting."
          />
        </div>
      </section>
    </>
  );
}
