import React from 'react';
import { MapPinnedIcon, UsersIcon, LandPlotIcon, LandmarkIcon } from 'lucide-react';
import { CountUp } from '../ui/CountUp';

/**
 * Municipal facts at a glance.
 *
 * These are constants, not CMS content — a barangay count is a matter of law,
 * not something an editor should be able to mistype. They deliberately do NOT
 * read from the `barangays` table: an empty table would render "0 barangays",
 * which is worse than no figure at all.
 *
 * Figures verified against PhilAtlas, Wikipedia and the PSA censuses; they match the
 * municipal profile published on /about. (An "annual expenditure" figure was removed: no
 * source for it could be found.)
 */
const STATS = [
  { Icon: MapPinnedIcon, value: 8, label: 'Barangays', note: 'Coastal, upland and poblacion' },
  { Icon: UsersIcon, value: 22780, label: 'Residents', note: '2024 Census of Population' },
  { Icon: LandPlotIcon, value: 44.31, decimals: 2, suffix: ' km²', label: 'Land area', note: '1.62% of Agusan del Norte' },
  { Icon: LandmarkIcon, value: 1969, grouping: false, label: 'Year founded', note: 'Created under Republic Act No. 5660' },
];

export function MunicipalStats() {
  return (
    <section className="w-full border-y border-hairline bg-surface-muted py-12 lg:py-14" aria-labelledby="municipal-stats-title">
      <div className="container-page">
        <h2 id="municipal-stats-title" className="sr-only">
          Magallanes at a glance
        </h2>

        {/* Hairline grid: one rule between cells, none around the outside. The
            gap-px trick keeps the rules pixel-crisp at any zoom level. */}
        <dl className="grid gap-px overflow-hidden rounded-xl bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ Icon, value, decimals, suffix, grouping, label, note }, i) => (
            <div
              key={label}
              className="group flex flex-col bg-surface-muted p-6 transition-colors duration-200 hover:bg-white motion-safe:animate-rise-in lg:p-7"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <Icon
                className="h-5 w-5 text-brand-600 transition-transform duration-300 ease-gov group-hover:-translate-y-0.5"
                aria-hidden="true"
              />

              <dd className="mt-4 font-display text-display-lg font-extrabold leading-none tracking-[-0.03em] text-brand-800">
                <CountUp value={value} decimals={decimals ?? 0} suffix={suffix} grouping={grouping ?? true} />
              </dd>

              {/* Accent rule grows on hover — a small reward for pointing at a cell. */}
              <span
                className="mt-4 block h-[3px] w-8 rounded-full bg-accent-500 transition-all duration-300 ease-gov group-hover:w-14"
                aria-hidden="true"
              />

              <dt className="mt-3 font-sans text-[0.9375rem] font-semibold text-ink">{label}</dt>
              <p className="mt-0.5 text-[0.8125rem] leading-snug text-ink-muted">{note}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
