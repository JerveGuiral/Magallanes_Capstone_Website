import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, QuoteIcon } from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';
import { AdvisoryCard } from './AdvisoryCard';

/**
 * Homepage opening sequence.
 *
 *   1. Photograph — establishes place before anything else.
 *   2. Advisory — promoted to directly under the fold. It previously sat inside
 *      the mayor's column, three folds down; a storm-signal notice is the single
 *      most time-critical thing this site publishes and cannot be buried.
 *   3. Mayor's message — commitment and accountability, with a route to act on it.
 */
export function Hero() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-brand-950" aria-label="Poblacion fish landing, Magallanes">
        <div className="relative h-[460px] w-full sm:h-[540px] lg:h-[620px]">
          <img
            src="/104500b7-e859-4c31-a2dc-5a44bde95241.jpg"
            alt="Fisherfolk sorting the morning catch beside wooden outrigger boats at the Poblacion fish landing"
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center 64%' }}
          />

          {/* Two stacked gradients: a deep floor for the headline to sit on, and a
              light top wash so the sticky navy nav bar has something to separate from. */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 via-45% to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-950/60 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="container-page pb-12 lg:pb-16">
              <p
                className="flex items-center gap-2.5 font-display text-eyebrow uppercase text-accent-400 motion-safe:animate-reveal-up"
                style={{ animationDelay: '40ms' }}
              >
                <span className="h-[2px] w-7 rounded-full bg-accent-500" aria-hidden="true" />
                Agusan del Norte
              </p>

              <h1
                className="mt-4 max-w-3xl text-display-xl text-white sm:text-display-2xl motion-safe:animate-reveal-up"
                style={{ animationDelay: '100ms' }}
              >
                Twelve barangays along the Agusan delta, still living off the tide.
              </h1>

              <p
                className="mt-5 flex max-w-xl items-start gap-2.5 text-sm leading-relaxed text-brand-200 motion-safe:animate-reveal-up sm:text-base"
                style={{ animationDelay: '160ms' }}
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                Poblacion fish landing, first light — the day&rsquo;s catch coming in.
              </p>

              <div
                className="mt-8 flex flex-wrap items-center gap-3 motion-safe:animate-reveal-up"
                style={{ animationDelay: '220ms' }}
              >
                <Link
                  to="/services"
                  className="btn btn-lg bg-white text-brand-800 shadow-raised transition-colors duration-150 hover:bg-accent-100"
                >
                  Municipal services
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-lg border-white/30 bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 hover:border-white/60 hover:bg-white/20"
                >
                  Report a concern
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory — rides the seam between the photograph and the page body. */}
      <AdvisoryCard />

      <section
        className="relative w-full overflow-hidden border-b border-hairline bg-white"
        aria-label="Message from the Mayor"
      >
        <BitaugMotif className="pointer-events-none absolute -right-6 top-4 hidden h-60 w-72 text-brand-800/[0.05] lg:block" />

        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-section">
          <div className="relative mx-auto w-full max-w-[19rem] lg:mx-0">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg shadow-raised ring-1 ring-hairline">
              <img
                src="/mags.jpg"
                alt="Mayor Isidro C. Villanueva speaking at a flag-raising ceremony in front of the Municipal Hall of Magallanes"
                className="h-full w-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </div>
            {/* Brass corner mark — the seal colour, used once per view. */}
            <span
              className="absolute -bottom-2.5 -right-2.5 hidden h-14 w-14 rounded-br-lg border-b-[3px] border-r-[3px] border-accent-600 sm:block"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-2.5 font-display text-eyebrow uppercase text-accent-700">
              <span className="h-[2px] w-7 shrink-0 rounded-full bg-accent-600" aria-hidden="true" />
              From the Office of the Mayor
            </p>

            <blockquote className="relative mt-5">
              <QuoteIcon
                className="absolute -left-1 -top-2 h-8 w-8 text-brand-100"
                aria-hidden="true"
              />
              <p className="relative text-display-md font-semibold leading-snug text-brand-800">
                Our priority this year is simple and measurable: passable coastal roads before the monsoon, clean
                water in every barangay, and permits released within three working days.
              </p>
            </blockquote>

            <div className="mt-6 flex items-center gap-3.5 border-l-[3px] border-accent-600 pl-4">
              <span className="text-sm leading-tight">
                <span className="block font-display text-base font-bold text-brand-800">Hon. Isidro C. Villanueva</span>
                <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">Municipal Mayor, term 2025–2028</span>
              </span>
            </div>

            <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
              If a service falls short of that, report it here — my office reads every submission.
            </p>

            <Link
              to="/contact"
              className="group mt-5 inline-flex w-fit items-center gap-2 font-display text-[0.9375rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
            >
              File a report with the Public Assistance Desk
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
