import React from 'react';
import { MapPinnedIcon, UsersIcon, LandPlotIcon, LandmarkIcon } from 'lucide-react';
import { CountUp } from '../ui/CountUp';
import { BitaugMotif } from '../BitaugMotif';

/**
 * Municipal facts at a glance, on the page's one seal-blue band.
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
    <section className="band-brand relative w-full overflow-hidden py-14 lg:py-16" aria-labelledby="municipal-stats-title">
      <BitaugMotif className="pointer-events-none absolute -bottom-6 -right-8 h-56 w-72 text-white/10" />

      <div className="container-page relative">
        <h2 id="municipal-stats-title" className="flex items-center gap-2.5 font-sans text-eyebrow uppercase text-fiesta-300">
          <span className="h-[3px] w-7 rounded-full bg-fiesta-400" aria-hidden="true" />
          Magallanes at a glance
        </h2>

        <dl className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map(({ Icon, value, decimals, suffix, grouping, label, note }) => (
            <div key={label} className="group relative border-l-2 border-white/20 pl-5 transition-colors duration-200 hover:border-fiesta-400">
              <Icon className="h-5 w-5 text-brand-200" aria-hidden="true" />
              <dd className="mt-3 font-display text-[2.75rem] font-extrabold leading-none tracking-[-0.03em] text-fiesta-300 lg:text-[3.25rem]">
                <CountUp value={value} decimals={decimals ?? 0} suffix={suffix} grouping={grouping ?? true} />
              </dd>
              <dt className="mt-3 font-sans text-[1rem] font-bold text-white">{label}</dt>
              <p className="mt-0.5 text-[0.8125rem] leading-snug text-brand-50">{note}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
