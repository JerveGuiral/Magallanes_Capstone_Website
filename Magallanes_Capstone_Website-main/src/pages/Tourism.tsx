import React from 'react';
import { MapPinIcon, CalendarIcon, TicketIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { DESTINATIONS, FESTIVALS, TRAVEL_NOTES } from '../data/tourism';

export function Tourism() {
  const [featured, ...supporting] = DESTINATIONS;

  return (
    <>
      <PageHeader
        eyebrow="Tourism"
        title="Visit Magallanes"
        description="A small coastal municipality at the mouth of the Agusan River. What there is to see here is working shoreline, mangrove delta, and a fiesta calendar built around the sea." />


      <section className="w-full py-12" aria-labelledby="destinations-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div id="destinations-title">
            <SectionHeading eyebrow="Where to go" title="Destinations" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Reveal>
              <article className="flex h-full flex-col border border-hairline bg-white">
                <img
                  src={featured.image}
                  alt={featured.alt}
                  className="h-72 w-full object-cover lg:h-96"
                  loading="lazy" />

                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-teal">
                    <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {featured.barangay}
                  </p>
                  <h3 className="mt-2 font-display text-display-md font-bold leading-tight text-navy">
                    {featured.name}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-ink">{featured.summary}</p>
                  <dl className="mt-auto grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Season</dt>
                      <dd className="mt-0.5 text-sm text-ink">{featured.season}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Fees</dt>
                      <dd className="mt-0.5 text-sm text-ink">{featured.fee}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            </Reveal>

            <ul className="grid gap-6">
              {supporting.map((dest, i) =>
                <Reveal as="li" key={dest.id} delay={0.05 + i * 0.05}>
                  <article className="flex h-full flex-col border border-hairline bg-white sm:flex-row">
                    <img
                      src={dest.image}
                      alt={dest.alt}
                      className="h-44 w-full object-cover sm:h-auto sm:w-40 sm:shrink-0"
                      loading="lazy" />

                    <div className="flex flex-1 flex-col p-5">
                      <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-teal">
                        <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {dest.barangay}
                      </p>
                      <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-navy">{dest.name}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{dest.summary}</p>
                      <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                        <TicketIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {dest.fee}
                      </p>
                    </div>
                  </article>
                </Reveal>
              )}
            </ul>
          </div>
        </div>
      </section>

      <MotifDivider />

      <section className="w-full py-12" aria-labelledby="festivals-title">
        <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <div id="festivals-title">
              <SectionHeading
                eyebrow="Annual calendar"
                title="Fiestas and observances"
                description="Municipal-wide events. Barangay fiestas are announced separately through the barangay halls." />

            </div>

            <ul className="mt-8 space-y-px bg-hairline">
              {FESTIVALS.map((f) =>
                <li key={f.name} className="flex gap-5 bg-white p-5">
                  <div className="flex w-16 shrink-0 flex-col items-center border-r border-hairline pr-4 text-center">
                    <span className="font-display text-3xl font-bold leading-none text-navy">{f.day}</span>
                    <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-teal">{f.month}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-navy">{f.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{f.detail}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <aside className="border border-hairline bg-white p-6" aria-labelledby="travel-title">
            <h2 id="travel-title" className="flex items-center gap-2 font-display text-lg font-bold text-navy">
              <CalendarIcon className="h-4 w-4 text-teal" aria-hidden="true" />
              Getting here
            </h2>
            <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
            <dl className="mt-5 divide-y divide-hairline">
              {TRAVEL_NOTES.map((note) =>
                <div key={note.label} className="py-3">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{note.label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink">{note.value}</dd>
                </div>
              )}
            </dl>
            <p className="mt-5 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
              Boat tours must be booked through the barangay fisherfolk association. Life vests are required for all
              passengers, including children.
            </p>
          </aside>
        </div>
      </section>
    </>);

}