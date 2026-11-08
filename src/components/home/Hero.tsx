import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, HandHeartIcon } from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';
import { QuickActions } from './QuickActions';
import { Picture } from '../ui/Picture';

/**
 * Homepage opening sequence.
 *
 *   1. Photograph — establishes place before anything else, drifting slowly in.
 *   2. Quick actions — a white panel lifted onto the photograph's edge. Any MDRRMO
 *      advisory opens the panel: a storm-signal notice is the single most
 *      time-critical thing this site publishes and cannot be buried.
 *   3. Welcome — who the municipality is and who leads it, with routes to act.
 */
export function Hero() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-brand-900" aria-label="Aerial view of the Poblacion town center, Magallanes">
        <div className="relative h-[560px] w-full sm:h-[600px] lg:h-[660px]">
          {/* LCP element: eager, high priority, never lazy. 93 KB at phone width. */}
          <Picture
            name="magallanes-aerial-hero"
            alt="Aerial view of the Poblacion town center of Magallanes, where the coastal barangay meets the Agusan delta"
            sizes="100vw"
            priority
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover motion-safe:animate-ken-burns"
            style={{ objectPosition: 'center 42%' }}
          />

          {/* Warm scrim, never navy: a rose-plum floor carries the headline, a light top wash
              separates the nav bar, and a soft corner falloff gives the frame depth without
              darkening the town in the centre. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/56 via-black/20 via-50% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="container-page pb-28 lg:pb-32">
              <p
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-sans text-[0.8125rem] font-semibold text-fiesta-300 ring-1 ring-white/20 backdrop-blur-sm motion-safe:animate-reveal-up"
                style={{ animationDelay: '40ms' }}
              >
                <HandHeartIcon className="h-4 w-4" aria-hidden="true" />
                Magallanes, Agusan del Norte
              </p>

              <h1
                className="mt-4 max-w-4xl text-display-xl text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] sm:text-display-2xl motion-safe:animate-reveal-up"
                style={{ animationDelay: '100ms' }}
              >
                Maayong <span className="whitespace-nowrap">pag-abot</span> sa{' '}
                <span className="relative whitespace-nowrap">
                  Magallanes!
                  <span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-fiesta-400/90" aria-hidden="true" />
                </span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base leading-relaxed text-white/95 [text-shadow:0_1px_10px_rgba(0,0,0,0.6)] motion-safe:animate-reveal-up sm:text-lg"
                style={{ animationDelay: '160ms' }}
              >
                Welcome! Find services, officials, news and the places that make our coastal town home.
              </p>

              <div
                className="mt-7 flex flex-wrap items-center gap-3 motion-safe:animate-reveal-up"
                style={{ animationDelay: '220ms' }}
              >
                <Link to="/services" className="btn btn-lg rounded-full bg-white text-brand-700 shadow-raised hover:bg-brand-50">
                  Browse services
                  <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/report"
                  className="btn btn-lg rounded-full border-white/50 bg-white/10 text-white backdrop-blur-sm hover:border-white hover:bg-white/20"
                >
                  Report a concern
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions, lifted onto the photograph's edge. Any MDRRMO advisory opens that
          panel, so it is still the first thing under the fold. */}
      <QuickActions />


      <section className="relative w-full overflow-hidden bg-white" aria-label="Welcome to Magallanes">
        {/* Wide screens only: at laptop width (1024px) it ran through the heading. */}
        <BitaugMotif className="pointer-events-none absolute -right-6 top-6 hidden h-60 w-72 text-brand-200 xl:block" />

        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-section">
          <div className="relative mx-auto w-full max-w-[19rem] lg:mx-0">
            {/* A blush card set behind the photo, offset, gives the portrait a little depth. */}
            <span className="absolute -left-4 -top-4 h-full w-full rounded-2xl bg-surface-sunken" aria-hidden="true" />
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-raised ring-4 ring-white">
              <Picture
                name="mags"
                alt="A flag-raising ceremony in front of the Municipal Hall of Magallanes"
                sizes="(min-width: 1024px) 19rem, 19rem"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover"
                style={{ objectPosition: 'center 30%' }}
              />
            </div>
            <span
              className="absolute -bottom-3 -right-3 hidden rounded-full bg-fiesta-400 px-3.5 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.08em] text-brand-900 shadow-card sm:block"
              aria-hidden="true"
            >
              Since 1969
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-2.5 font-sans text-eyebrow uppercase text-accent-700">
              <span className="h-[3px] w-7 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
              Welcome to Magallanes
            </p>

            <h2 className="mt-5 text-display-md font-semibold leading-snug text-brand-800">
              A coastal municipality at the mouth of the Agusan River, home to about 22,800 residents across eight
              barangays.
            </h2>

            <div className="mt-6 flex items-center gap-3.5 border-l-[3px] border-brand-400 pl-4">
              <span className="text-sm leading-tight">
                <span className="block font-display text-base font-bold text-brand-800">Hon. Cesar C. Cumba, Jr.</span>
                <span className="mt-0.5 block text-[0.8125rem] text-ink-muted">Local Chief Executive (Municipal Mayor)</span>
              </span>
            </div>

            <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink-muted">
              The Municipal Hall in Poblacion serves residents of all eight barangays — from business permits and
              the civil registry to health, social welfare and disaster preparedness.
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
                to="/about"
                className="group inline-flex w-fit items-center gap-2 font-sans text-[0.9375rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                Our history
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
