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
];

export function About() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="The Municipality of Magallanes"
        description="Learn about the Municipality of Magallanes, Agusan del Norte — its history, its role as a local government unit, and its heritage."
      />

      {/* ---- Mandate ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="mandate-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div>
            <div id="mandate-title">
              <SectionHeading title="Role of the municipality" />
            </div>

            {/* Only what the Local Government Code establishes; priorities and a motto that appeared
                here earlier had no source and were removed until the LGU provides official text. */}
            <div className="prose-gov mt-7">
              <p>
                As a local government unit under the Local Government Code of 1991 (Republic Act No. 7160), the
                Municipality of Magallanes delivers basic services to its residents, including health, agriculture,
                social welfare, environmental management, and local infrastructure.
              </p>
              <p>
                The municipality is led by the Municipal Mayor, with the Sangguniang Bayan, presided over by the Vice
                Mayor, as its legislative body. Its eight barangays are Buhang, Caloc-an, Guiasan, Marcos, Poblacion,
                Santo Niño, Santo Rosario, and Taod-oy.
              </p>
            </div>
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
            <SectionHeading title="History of Magallanes" />
          </div>
          <div className="prose-gov mt-7">
            <p>
              Magallanes was created as a municipality on June 21, 1969 through Republic Act No. 5660. It was formerly
              part of the Municipality of Butuan (now Butuan City). The town is named after Ferdinand Magellan
              (Magallanes in Spanish), whose expedition is locally believed to have celebrated Mass here on April 8,
              1521 — the event marked by the Magellan Shrine in Poblacion.
            </p>
            <p>
              The municipality lies at the mouth of the Agusan and Baug Rivers. Much of the town centre is low-lying
              delta land protected by dikes, and fishing has long been one of the main sources of livelihood.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Mission & Vision ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="mission-vision-title">
        <div className="container-page">
          <div id="mission-vision-title">
            <SectionHeading title="Mission & Vision" />
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
      <section className="relative w-full overflow-hidden bg-surface-muted py-14 lg:py-section" aria-labelledby="heritage-title">
        <BitaugMotif className="pointer-events-none absolute -right-8 top-4 hidden h-56 w-72 text-brand-800/[0.06] md:block" />
        <div className="container-page relative">
          <SectionHeading
            title="The Bitaug tree"
            description="The Bitaug (Calophyllum inophyllum) is a coastal tree common along the Magallanes shoreline. A Bitaug in Barangay Caloc-an, estimated to be about 500 years old, was declared a Philippine Centennial Tree in 1998. Its outline is used as a design motif on this website."
          />
        </div>
      </section>
    </>
  );
}
