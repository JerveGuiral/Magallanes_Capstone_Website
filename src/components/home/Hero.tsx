import React from 'react';
import { BitaugMotif } from '../BitaugMotif';
import { AdvisoryCard } from './AdvisoryCard';

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden border-b border-hairline bg-white" aria-label="Welcome">
      <BitaugMotif className="pointer-events-none absolute -right-4 top-0 hidden h-56 w-72 text-navy/[0.06] lg:block" />

      <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:py-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-teal">
            Office of the Municipal Mayor
          </p>
          <h1 className="mt-3 font-display text-display-lg font-bold leading-tight text-navy sm:text-display-xl">
            Serving 12 barangays along the Agusan delta.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink">
            “Our priority this year is simple and measurable: passable coastal roads before the monsoon, clean water
            in every barangay, and permits released within three working days. If a service falls short of that,
            report it here — my office reads every submission.”
          </p>

          <div className="mt-6 flex items-center gap-3 border-l-2 border-gold pl-4">
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-50 font-mono text-[10px] text-navy"
              role="img"
              aria-label="Portrait of the Municipal Mayor">

              PHOTO
            </span>
            <span className="text-sm leading-tight">
              <span className="block font-display font-bold text-navy">Hon. Isidro C. Villanueva</span>
              <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                Municipal Mayor · Term 2025–2028
              </span>
            </span>
          </div>
        </div>

        <AdvisoryCard />
      </div>
    </section>);

}