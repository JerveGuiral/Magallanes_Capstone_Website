import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, HomeIcon, SearchIcon } from 'lucide-react';
import { BitaugMotif } from '../components/BitaugMotif';

const SUGGESTIONS = [
  { label: 'Municipal services', to: '/services' },
  { label: 'News & advisories', to: '/news' },
  { label: 'Transparency Seal', to: '/transparency' },
  { label: 'Municipal officials', to: '/officials' },
];

export function NotFound() {
  return (
    <section
      className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden py-20"
      aria-labelledby="not-found-title"
    >
      <BitaugMotif className="pointer-events-none absolute right-[8%] top-10 hidden h-56 w-72 text-brand-800/[0.05] lg:block" />

      <div className="container-page relative max-w-xl text-center">
        <p className="font-mono text-[3.5rem] font-semibold leading-none tracking-[-0.03em] text-brand-100" aria-hidden="true">
          404
        </p>
        <p className="mt-2 font-display text-eyebrow uppercase text-accent-700">Error 404</p>

        <h1 id="not-found-title" className="mt-3 text-display-lg">
          Page not found
        </h1>
        <span className="mx-auto mt-4 block h-[3px] w-14 rounded-full bg-accent-600" aria-hidden="true" />

        <p className="mt-5 text-[1.0625rem] leading-relaxed text-ink-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist, may have moved, or the link may be outdated. Try the
          homepage, search the site, or reach the Public Assistance Desk if you were following a link from another site.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn btn-primary btn-lg">
            <HomeIcon className="h-4 w-4" aria-hidden="true" />
            Return home
          </Link>
          <Link to="/contact" className="btn btn-secondary btn-lg group">
            Contact us
            <ArrowRightIcon
              className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-10 border-t border-hairline pt-6">
          <p className="flex items-center justify-center gap-1.5 font-display text-eyebrow uppercase text-ink-muted">
            <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Or try one of these
          </p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  className="inline-block rounded-full border border-hairline bg-white px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink-muted transition-colors duration-150 hover:border-brand-400 hover:text-brand-600"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
