import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import type { NewsAnnouncement } from '../../services/adminService';

type NewsCardProps = {
  item: NewsAnnouncement;
};

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Update',
  advisory: 'MDRRMO / Public Advisory',
  event: 'Official Event / Program',
};

/* Advisories carry the reserved alert colour even in list view, so a storm
 * notice is distinguishable from a fiesta announcement at a glance. */
const CATEGORY_TONE: Record<string, string> = {
  general: 'bg-brand-800 text-white',
  advisory: 'bg-alert-600 text-white',
  event: 'bg-accent-500 text-white',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function NewsCard({ item }: NewsCardProps) {
  const date = item.created_at ? new Date(item.created_at) : null;
  const dateLabel = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const excerpt = item.body.length > 160 ? `${item.body.slice(0, 160).trim()}…` : item.body;
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const tone = CATEGORY_TONE[item.category] || CATEGORY_TONE.general;

  const readMore = (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-brand-600">
      Read full release
      <ArrowRightIcon
        className="h-3.5 w-3.5 transition-transform duration-150 ease-gov group-hover:translate-x-1"
        aria-hidden="true"
      />
    </span>
  );

  /* ---- Illustrated variant ---- */
  if (item.image_url) {
    return (
      <Link
        to={`/news/${item.id}`}
        className="card card-interactive group flex h-full flex-col overflow-hidden"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-sunken">
          <img
            src={item.image_url}
            alt=""
            className="h-full w-full object-cover object-top transition-transform duration-300 ease-gov group-hover:scale-[1.04]"
            loading="lazy"
          />
          <span
            className={`absolute left-3 top-3 rounded-md px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] shadow-subtle ${tone}`}
          >
            {categoryLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-bold leading-snug text-brand-800 transition-colors duration-150 group-hover:text-brand-600">
            {item.title}
          </h3>
          <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">{excerpt}</p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-3.5">
            <p className="text-[0.75rem] text-ink-muted">
              Magallanes LGU · <time className="font-mono">{dateLabel}</time>
            </p>
            {readMore}
          </div>
        </div>
      </Link>
    );
  }

  /* ---- Datestamp variant ---- */
  return (
    <Link to={`/news/${item.id}`} className="card card-interactive group flex h-full gap-5 p-5">
      <div className="flex w-16 shrink-0 flex-col items-center rounded-md bg-brand-50 py-3 text-center">
        <span className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.02em] text-brand-800">
          {date ? String(date.getDate()).padStart(2, '0') : '—'}
        </span>
        <span className="mt-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em] text-accent-800">
          {date ? MONTHS[date.getMonth()] : ''}
        </span>
        <span className="font-mono text-[0.6875rem] text-ink-muted">{date ? date.getFullYear() : ''}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-muted">
          {categoryLabel}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-bold leading-snug text-brand-800 transition-colors duration-150 group-hover:text-brand-600">
          {item.title}
        </h3>
        <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">{excerpt}</p>
        <span className="mt-3.5">{readMore}</span>
      </div>
    </Link>
  );
}
