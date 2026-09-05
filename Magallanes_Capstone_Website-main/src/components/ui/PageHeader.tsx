import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';
import { BitaugMotif } from '../BitaugMotif';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden border-b border-hairline bg-white">
      <BitaugMotif className="pointer-events-none absolute -right-2 top-2 hidden h-40 w-52 text-navy/[0.05] md:block" />
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
            <li>
              <Link to="/" className="transition-colors duration-150 hover:text-navy">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRightIcon className="h-3 w-3" />
            </li>
            <li className="text-navy">{eyebrow}</li>
          </ol>
        </nav>
        <h1 className="mt-4 max-w-3xl font-display text-display-lg font-bold leading-tight text-navy">{title}</h1>
        <span className="mt-4 block h-[3px] w-12 bg-gold" aria-hidden="true" />
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">{description}</p>
      </div>
    </div>);

}