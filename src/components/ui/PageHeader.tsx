import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';
import { usePageTitle } from '../../lib/usePageTitle';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional trailing slot — a count, a download, a filter. */
  aside?: React.ReactNode;
};

/**
 * Page entry band.
 *
 * A tinted gradient rather than a solid navy slab: every interior page carries
 * one of these, and a full-strength band on all twelve would flatten the
 * hierarchy the homepage hero depends on.
 */
export function PageHeader({ eyebrow, title, description, aside }: PageHeaderProps) {
  // Every interior page renders one of these, so its title names the browser tab too.
  usePageTitle(title);
  return (
    <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-b from-surface-muted to-white">
      <BitaugMotif className="pointer-events-none absolute -right-4 top-1 hidden h-44 w-56 text-brand-800/[0.06] md:block" />

      <div className="container-page relative py-10 lg:py-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-micro uppercase text-ink-muted">
            <li>
              <Link
                to="/"
                className="-my-2.5 inline-block py-2.5 transition-colors duration-150 hover:text-brand-600 hover:underline hover:underline-offset-2"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="h-3 w-3 text-ink-subtle" />
            </li>
            <li className="font-semibold text-brand-800" aria-current="page">
              {eyebrow}
            </li>
          </ol>
        </nav>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <h1 className="max-w-3xl text-display-lg sm:text-display-xl">{title}</h1>
            <span className="mt-4 block h-[3px] w-14 rounded-full bg-accent-600" aria-hidden="true" />
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-muted">{description}</p>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      </div>
    </div>
  );
}
