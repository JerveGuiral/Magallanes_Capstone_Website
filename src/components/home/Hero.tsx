import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, HandHeartIcon } from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';
import { AdvisoryCard } from './AdvisoryCard';
import { QuickActions } from './QuickActions';
import { Picture } from '../ui/Picture';
import { Bitoy } from '../Bitoy';
import { askBitoy } from '../../lib/askBitoy';

/**
 * Homepage opening sequence.
 *
 *   1. Photograph — establishes place before anything else.
 *   2. Advisory — promoted to directly under the fold. It previously sat inside
 *      the mayor's column, three folds down; a storm-signal notice is the single
 *      most time-critical thing this site publishes and cannot be buried.
 *   3. Welcome — who the municipality is and who leads it, with routes to act.
 *      This used to be a "message from the mayor" quoting an invented mayor; a
 *      quote cannot be put in a real official's mouth, so it states facts instead.
 */
export function Hero() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-brand-800" aria-label="Aerial view of the Poblacion town center, Magallanes">
        <div className="relative h-[460px] w-full sm:h-[540px] lg:h-[620px]">
          {/* LCP element: eager, high priority, never lazy. 93 KB at phone
              width instead of the 1,019 KB original. */}
          <Picture
            name="magallanes-aerial-hero"
            alt="Aerial view of the Poblacion town center of Magallanes, where the coastal barangay meets the Agusan delta"
            sizes="100vw"
            priority
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover"
            style={{ objectPosition: 'center 42%' }}
          />

          {/* Three layers, all restrained — the photograph is the point, and a
              near-opaque scrim was burying the town in it.

              1. Floor: carries the headline. 2. Top wash: separates the sticky
              nav bar. 3. Vignette: a soft corner falloff that gives the frame
              depth without darkening the centre, where the town actually is.

              Lightened in Oct 2026 so the town stays bright; a soft text shadow
              keeps the white headline legible over the lighter floor. */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/35 via-50% to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-950/25 to-transparent" />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_38%,rgba(10,58,82,0.16)_100%)]"
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-end">
            <div className="container-page pb-12 lg:pb-16">
              <p
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-sans text-[0.8125rem] font-semibold text-accent-300 backdrop-blur-sm motion-safe:animate-reveal-up"
                style={{ animationDelay: '40ms' }}
              >
                <HandHeartIcon className="h-4 w-4" aria-hidden="true" />
                Magallanes, Agusan del Norte
              </p>

              <h1
                className="mt-4 max-w-4xl text-display-xl text-white [text-shadow:0_2px_16px_rgba(10,58,82,0.45)] sm:text-display-2xl motion-safe:animate-reveal-up"
                style={{ animationDelay: '100ms' }}
              >
                Maayong <span className="whitespace-nowrap">pag-abot</span> sa Magallanes!
              </h1>

              <p
                className="mt-4 max-w-xl text-base leading-relaxed text-white [text-shadow:0_1px_8px_rgba(10,58,82,0.5)] motion-safe:animate-reveal-up sm:text-lg"
                style={{ animationDelay: '160ms' }}
              >
                Welcome! Find services, officials, news and tourist spots — or chat with Bitoy, our Municipal
                Assistant, in English or Bisaya.
              </p>

              <div
                className="mt-7 flex flex-wrap items-center gap-3 motion-safe:animate-reveal-up"
                style={{ animationDelay: '220ms' }}
              >
                <Link
                  to="/services"
                  className="btn btn-lg bg-white text-brand-800 shadow-raised transition-colors duration-150 hover:bg-brand-50"
                >
                  Browse services
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/report"
                  className="btn btn-lg border-white/40 bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 hover:border-white/70 hover:bg-white/20"
                >
                  Report a concern
                </Link>
                <button
                  type="button"
                  onClick={() => askBitoy()}
                  className="btn btn-lg gap-2 border-transparent bg-transparent pl-2 text-white transition-colors duration-150 hover:bg-white/10"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white" aria-hidden="true">
                    <Bitoy className="h-7 w-7" />
                  </span>
                  Ask Bitoy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advisory — rides the seam between the photograph and the page body. */}
      <AdvisoryCard />

      <QuickActions />

      <section
        className="relative w-full overflow-hidden border-b border-hairline bg-white"
        aria-label="Welcome to Magallanes"
      >
        <BitaugMotif className="pointer-events-none absolute -right-6 top-4 hidden h-60 w-72 text-brand-800/[0.05] lg:block" />

        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-section">
          <div className="relative mx-auto w-full max-w-[19rem] lg:mx-0">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg shadow-raised ring-1 ring-hairline">
              <Picture
                name="mags"
                alt="A flag-raising ceremony in front of the Municipal Hall of Magallanes"
                sizes="(min-width: 1024px) 19rem, 19rem"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </div>
            {/* Accent corner mark, used once per view. */}
            <span
              className="absolute -bottom-2.5 -right-2.5 hidden h-14 w-14 rounded-br-lg border-b-[3px] border-r-[3px] border-accent-600 sm:block"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-2.5 font-sans text-eyebrow uppercase text-accent-700">
              <span className="h-[2px] w-7 shrink-0 rounded-full bg-accent-600" aria-hidden="true" />
              Welcome to Magallanes
            </p>

            <h2 className="mt-5 text-display-md font-semibold leading-snug text-brand-800">
              A coastal municipality at the mouth of the Agusan River, home to about 22,800 residents across eight
              barangays.
            </h2>

            <div className="mt-6 flex items-center gap-3.5 border-l-[3px] border-accent-600 pl-4">
              <span className="text-sm leading-tight">
                <span className="block font-display text-base font-bold text-brand-800">Hon. Cesar C. Cumba, Jr.</span>
                <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">Local Chief Executive (Municipal Mayor)</span>
              </span>
            </div>

            <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
              Questions about permits, clearances, officials or office hours? Ask Bitoy, the Municipal Assistant, in
              English or Bisaya, or send a concern to the Municipal Hall.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                to="/officials"
                className="group inline-flex w-fit items-center gap-2 font-sans text-[0.9375rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                Meet the municipal officials
                <ArrowRightIcon
                  className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/report"
                className="group inline-flex w-fit items-center gap-2 font-sans text-[0.9375rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                Report a concern
                <ArrowRightIcon
                  className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
