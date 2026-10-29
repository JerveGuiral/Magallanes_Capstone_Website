import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon, MapPinIcon, CalendarIcon, TicketIcon, NavigationIcon, CheckIcon } from 'lucide-react';
import { BitaugMotif } from '../components/BitaugMotif';
import { DestinationGallery } from '../components/tourism/DestinationGallery';
import { DESTINATIONS } from '../data/tourism';
import { LGU_CONTACT } from '../data/site';
import { usePageTitle } from '../lib/usePageTitle';

/**
 * Destination detail page. Tourism content is static (no admin CRUD behind it),
 * so unlike NewsDetail this looks the item up synchronously from DESTINATIONS
 * rather than fetching — a genuine 404 is the only "not found" state.
 */
export function TourismDetail() {
  const { id } = useParams<{ id: string }>();
  const destination = DESTINATIONS.find((d) => d.id === id);
  usePageTitle(destination ? destination.name : 'Destination not found');

  if (!destination) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-display-md">Destination not found</h1>
        <p className="mt-3 text-[0.9375rem] text-ink-muted">
          This page may have moved. Browse the current list of destinations instead.
        </p>
        <Link to="/tourism" className="btn btn-secondary mt-7">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to Tourism
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-b from-surface-muted to-white">
        <BitaugMotif className="pointer-events-none absolute -right-4 top-1 hidden h-44 w-56 text-brand-800/[0.06] md:block" />

        <div className="container-page relative py-10 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-micro uppercase text-ink-muted">
              <li>
                <Link to="/" className="-my-2.5 inline-block py-2.5 transition-colors duration-150 hover:text-brand-600 hover:underline hover:underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3 w-3 text-ink-subtle" />
              </li>
              <li>
                <Link to="/tourism" className="-my-2.5 inline-block py-2.5 transition-colors duration-150 hover:text-brand-600 hover:underline hover:underline-offset-2">
                  Tourism
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3 w-3 text-ink-subtle" />
              </li>
              <li className="font-semibold text-brand-800" aria-current="page">
                {destination.name}
              </li>
            </ol>
          </nav>

          <p className="mt-5 flex items-center gap-1.5 font-sans text-eyebrow uppercase text-accent-700">
            <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {destination.barangay}
          </p>

          <h1 className="mt-2 max-w-3xl text-display-lg sm:text-display-xl">{destination.name}</h1>
          <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">{destination.summary}</p>
        </div>
      </div>

      <article className="w-full py-12 lg:py-14">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <div className="min-w-0">
              <DestinationGallery images={destination.gallery} name={destination.name} />

              <div className="prose-gov mt-8">
                {destination.details.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              <h2 className="mt-10 font-display text-lg font-bold text-brand-800">What to know before you go</h2>
              <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />
              <ul className="mt-5 space-y-3">
                {destination.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-12 border-t border-hairline pt-6">
                <Link to="/tourism" className="btn btn-secondary group">
                  <ArrowLeftIcon
                    className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  />
                  Back to all destinations
                </Link>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="visit-info-title">
              <div className="card overflow-hidden">
                <h2
                  id="visit-info-title"
                  className="flex items-center gap-2 border-b border-hairline bg-surface px-6 py-4 font-display text-lg font-bold text-brand-800"
                >
                  <CalendarIcon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  Plan your visit
                </h2>

                <dl className="divide-y divide-hairline px-6">
                  <div className="py-3.5">
                    <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                      Best time
                    </dt>
                    <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink">{destination.season}</dd>
                  </div>
                  <div className="py-3.5">
                    <dt className="flex items-center gap-1.5 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                      <TicketIcon className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                      Fee
                    </dt>
                    <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink">{destination.fee}</dd>
                  </div>
                  <div className="py-3.5">
                    <dt className="flex items-center gap-1.5 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                      <NavigationIcon className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                      Getting there
                    </dt>
                    <dd className="mt-1 text-[0.9375rem] leading-relaxed text-ink">{destination.access}</dd>
                  </div>
                </dl>

                <div className="m-6 mt-2 rounded-md border border-accent-200 bg-accent-50 p-3.5 text-[0.8125rem] leading-relaxed text-ink">
                  Questions about this site or booking a guide? Contact the Mayor's Office at{' '}
                  <a href={LGU_CONTACT.phoneHref} className="font-mono underline underline-offset-2">{LGU_CONTACT.phone}</a> or{' '}
                  <a href={`mailto:${LGU_CONTACT.email}`} className="font-mono underline underline-offset-2 [overflow-wrap:anywhere]">
                    {LGU_CONTACT.email}
                  </a>
                  .
                </div>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
