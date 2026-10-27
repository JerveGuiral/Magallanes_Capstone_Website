import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, CalendarIcon, TicketIcon, LifeBuoyIcon, ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { Picture } from '../components/ui/Picture';
import { PhotoCreditNotice } from '../components/tourism/DestinationGallery';
import { ImagesIcon } from 'lucide-react';
import { DESTINATIONS, FESTIVALS, TRAVEL_NOTES } from '../data/tourism';

/**
 * Tourism is the one public section where the `sea` family leads instead of the
 * navy — it marks geography, and this page is entirely about the shoreline.
 */
export function Tourism() {
  const [featured, ...supporting] = DESTINATIONS;

  return (
    <>
      <PageHeader
        eyebrow="Tourism"
        title="Visit Magallanes"
        description="Tourist spots, festivals, and travel information for visitors to Magallanes, Agusan del Norte."
      />

      {/* ---- Destinations ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="destinations-title">
        <div className="container-page">
          <div id="destinations-title">
            <SectionHeading title="Tourist spots" />
          </div>

          <div className="mt-6 max-w-3xl">
            <PhotoCreditNotice />
          </div>

          {/* Featured runs full width as a horizontal card. It previously sat in a
              1.35fr column beside a stack of six, and because grid rows stretch to
              the tallest sibling the single featured card was being pulled to the
              height of all six — leaving ~460px of empty white inside it. */}
          <Reveal>
            <Link
              to={`/tourism/${featured.id}`}
              className="card card-interactive group mt-9 grid overflow-hidden lg:grid-cols-[1.1fr_1fr]"
            >
              <div className="relative overflow-hidden">
                <Picture
                  name={featured.gallery[0].name}
                  alt={featured.gallery[0].alt}
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="block h-56 w-full sm:h-72 lg:h-full lg:min-h-[20rem]"
                  imgClassName="h-full w-full object-cover transition-transform duration-500 ease-gov group-hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-brand-800 px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-white shadow-subtle">
                  Featured
                </span>
                {featured.gallery.length > 1 && (
                  <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-md bg-brand-950/70 px-2.5 py-1 font-mono text-[0.6875rem] text-white backdrop-blur-sm">
                    <ImagesIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.gallery.length}
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-center p-6 lg:p-8">
                <p className="flex items-center gap-1.5 font-sans text-eyebrow uppercase text-accent-700">
                  <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {featured.barangay}
                </p>
                <h3 className="mt-2 font-display text-display-md leading-tight text-brand-800 transition-colors duration-150 group-hover:text-brand-600">
                  {featured.name}
                </h3>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink">{featured.summary}</p>

                <dl className="mt-5 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
                  <div>
                    <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-subtle">Season</dt>
                    <dd className="mt-0.5 text-[0.9375rem] text-ink">{featured.season}</dd>
                  </div>
                  <div>
                    <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-subtle">Fees</dt>
                    <dd className="mt-0.5 text-[0.9375rem] text-ink">{featured.fee}</dd>
                  </div>
                </dl>

                <span className="mt-5 inline-flex w-fit items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600">
                  See full details
                  <ArrowRightIcon
                    className="h-3.5 w-3.5 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* The rest in an even grid — equal cards, equal weight, no stretching. */}
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {supporting.map((dest, i) => (
              <Reveal as="li" key={dest.id} delay={Math.min(i, 5) * 0.05}>
                <Link
                  to={`/tourism/${dest.id}`}
                  className="card card-interactive group flex h-full flex-col overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <Picture
                      name={dest.gallery[0].name}
                      alt={dest.gallery[0].alt}
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="block aspect-[16/10] w-full"
                      imgClassName="h-full w-full object-cover transition-transform duration-300 ease-gov group-hover:scale-[1.04]"
                    />
                    {dest.gallery.length > 1 && (
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-brand-950/70 px-2 py-0.5 font-mono text-[0.625rem] text-white backdrop-blur-sm">
                        <ImagesIcon className="h-3 w-3" aria-hidden="true" />
                        {dest.gallery.length}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex items-center gap-1.5 font-sans text-eyebrow uppercase text-accent-700">
                      <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      {dest.barangay}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-brand-800 transition-colors duration-150 group-hover:text-brand-600">
                      {dest.name}
                    </h3>
                    <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">{dest.summary}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-3">
                      <p className="flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
                        <TicketIcon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                        {dest.fee}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 font-sans text-[0.8125rem] font-semibold text-brand-600">
                        Details
                        <ArrowRightIcon
                          className="h-3.5 w-3.5 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <MotifDivider />

      {/* ---- Calendar ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="festivals-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div id="festivals-title">
              <SectionHeading
                title="Fiestas and festivals"
                description="Municipal-wide events. Barangay fiestas are announced separately through the barangay halls."
              />
            </div>

            <ul className="mt-9 overflow-hidden rounded-lg border border-hairline bg-white shadow-subtle">
              {FESTIVALS.map((f) => (
                <li key={f.name} className="flex gap-5 border-b border-hairline p-5 last:border-b-0">
                  <div className="flex w-16 shrink-0 flex-col items-center rounded-md bg-accent-50 py-2.5 text-center">
                    <span className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em] text-brand-800">
                      {f.day}
                    </span>
                    <span className="mt-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em] text-brand-600">
                      {f.month}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-[1.0625rem] font-bold text-brand-800">{f.name}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="travel-title">
            <div className="card overflow-hidden">
              <h2
                id="travel-title"
                className="flex items-center gap-2 border-b border-hairline bg-surface px-6 py-4 font-display text-lg font-bold text-brand-800"
              >
                <CalendarIcon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                Getting here
              </h2>

              <dl className="divide-y divide-hairline px-6">
                {TRAVEL_NOTES.map((note) => (
                  <div key={note.label} className="py-3.5">
                    <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                      {note.label}
                    </dt>
                    <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink">{note.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="m-6 mt-0 flex gap-2.5 rounded-md border border-accent-200 bg-accent-50 p-3.5 text-[0.8125rem] leading-relaxed text-ink">
                <LifeBuoyIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" aria-hidden="true" />
                <span>
                  Boat tours must be booked through the barangay fisherfolk association. Life vests are required for
                  all passengers, <strong className="font-semibold">including children.</strong>
                </span>
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
