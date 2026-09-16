import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import type { NewsItem } from '../../data/site';

type NewsCardProps = {
  item: NewsItem;
};

export function NewsCard({ item }: NewsCardProps) {
  return (
    <article className="group flex gap-5 border border-hairline bg-white p-5 transition-colors duration-150 hover:border-teal-200">
      <div className="flex w-16 shrink-0 flex-col items-center border-r border-hairline pr-4 text-center">
        <span className="font-display text-3xl font-bold leading-none text-navy">{item.day}</span>
        <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-teal">{item.month}</span>
        <span className="font-mono text-[11px] text-ink-muted">{item.year}</span>
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">{item.category}</p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug text-navy">
          <a href="#article" className="transition-colors duration-150 hover:text-teal">
            {item.title}
          </a>
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.excerpt}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal">
          Read full release
          <ArrowRightIcon
            className="h-3.5 w-3.5 transition-opacity duration-150 group-hover:opacity-100"
            aria-hidden="true" />

        </span>
      </div>
    </article>);

}