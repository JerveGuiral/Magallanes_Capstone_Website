import React from 'react';
import { AlertTriangleIcon, InfoIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { ADVISORIES } from '../../data/site';

export function AdvisoryCard() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % ADVISORIES.length), reduced ? 12000 : 7000);
    return () => window.clearInterval(id);
  }, [paused]);

  const advisory = ADVISORIES[index];
  const urgent = advisory.urgent;

  return (
    <section
      className="border border-hairline bg-white shadow-card"
      aria-label="Advisories and announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}>

      <header
        className={`flex items-center gap-2 px-5 py-3 ${urgent ? 'bg-alert text-white' : 'bg-navy text-white'}`}>

        {urgent ?
          <AlertTriangleIcon className="h-4 w-4 shrink-0" aria-hidden="true" /> :

          <InfoIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        }
        <h2 className="font-mono text-[11px] uppercase tracking-[0.16em]">
          {urgent ? 'Emergency advisory' : advisory.category}
        </h2>
      </header>

      <div className="px-5 py-5" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{advisory.issued}</p>
        <h3 className="mt-2 font-display text-xl font-bold leading-snug text-navy">{advisory.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink">{advisory.body}</p>

        <dl className="mt-4 flex items-center gap-2 border-t border-hairline pt-3 text-[11px]">
          <dt className="font-mono uppercase tracking-wider text-ink-muted">Ref. no.</dt>
          <dd className="font-mono text-ink">{advisory.reference}</dd>
        </dl>
      </div>

      <footer className="flex items-center justify-between border-t border-hairline px-5 py-3">
        <ul className="flex items-center gap-2" aria-label="Select advisory">
          {ADVISORIES.map((a, i) =>
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show advisory ${i + 1} of ${ADVISORIES.length}`}
                aria-current={i === index}
                className={`h-2 w-6 transition-colors duration-150 ${i === index ? 'bg-gold' : 'bg-hairline hover:bg-ink-muted'}`
                } />

            </li>
          )}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + ADVISORIES.length) % ADVISORIES.length)}
            className="grid h-8 w-8 place-items-center border border-hairline text-navy transition-colors duration-150 hover:bg-navy-50"
            aria-label="Previous advisory">

            <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % ADVISORIES.length)}
            className="grid h-8 w-8 place-items-center border border-hairline text-navy transition-colors duration-150 hover:bg-navy-50"
            aria-label="Next advisory">

            <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </section>);

}