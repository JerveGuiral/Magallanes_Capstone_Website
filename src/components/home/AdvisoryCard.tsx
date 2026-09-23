import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { adminService, type NewsAnnouncement } from '../../services/adminService';

/**
 * Public advisory band.
 *
 * Runs full-bleed directly beneath the hero rather than inside a column, because
 * an MDRRMO storm-signal notice outranks every other thing on this page. Uses
 * the reserved alert family — the one place on the public site it appears — so
 * an advisory can never be mistaken for ordinary navigation chrome.
 */
export function AdvisoryCard() {
  const [advisories, setAdvisories] = React.useState<NewsAnnouncement[]>([]);
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    adminService.getNews().then(({ data }) => {
      if (mounted) {
        setAdvisories((data || []).filter((n) => n.is_published && n.category === 'advisory'));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (paused || advisories.length <= 1) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % advisories.length), reduced ? 12000 : 7000);
    return () => window.clearInterval(id);
  }, [paused, advisories.length]);

  if (advisories.length === 0) return null;

  const advisory = advisories[index % advisories.length];
  const issued = advisory.created_at
    ? new Date(advisory.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  const navBtn =
    'grid h-8 w-8 place-items-center rounded-md border border-alert-600/25 text-alert-800 transition-colors duration-150 hover:border-alert-600/60 hover:bg-white';

  return (
    <section
      className="w-full border-b border-alert-600/20 bg-alert-50"
      aria-label="Public advisories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-page py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
          {/* ---- Standing label rail ---- */}
          <div className="flex shrink-0 items-center gap-2.5 lg:w-40 lg:flex-col lg:items-start lg:gap-2 lg:border-r lg:border-alert-600/20 lg:pr-6">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-alert-600 px-2.5 py-1 font-sans text-eyebrow uppercase text-white">
              <AlertTriangleIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Advisory
            </span>
            {issued && <time className="font-mono text-[0.6875rem] text-alert-800/80">{issued}</time>}
          </div>

          {/* ---- Rotating content ---- */}
          <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
            <h2 className="font-display text-[1.0625rem] font-bold leading-snug text-alert-900 sm:text-lg">
              {advisory.title}
            </h2>
            <p className="mt-1.5 line-clamp-3 text-[0.9375rem] leading-relaxed text-alert-800">{advisory.body}</p>
            <Link
              to={`/news/${advisory.id}`}
              className="group mt-2.5 inline-flex items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-alert-700 transition-colors duration-150 hover:text-alert-900"
            >
              Read the full advisory
              <ArrowRightIcon
                className="h-3.5 w-3.5 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* ---- Transport controls ---- */}
          {advisories.length > 1 && (
            <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">
              <ul className="flex items-center gap-1.5" aria-label="Select advisory">
                {advisories.map((a, i) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Show advisory ${i + 1} of ${advisories.length}`}
                      aria-current={i === index}
                      className={`h-1.5 rounded-full transition-all duration-200 ease-gov ${
                        i === index ? 'w-7 bg-alert-600' : 'w-3 bg-alert-600/30 hover:bg-alert-600/60'
                      }`}
                    />
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className={navBtn}
                  aria-label={paused ? 'Resume advisory rotation' : 'Pause advisory rotation'}
                >
                  {paused ? <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <PauseIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + advisories.length) % advisories.length)}
                  className={navBtn}
                  aria-label="Previous advisory"
                >
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % advisories.length)}
                  className={navBtn}
                  aria-label="Next advisory"
                >
                  <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
