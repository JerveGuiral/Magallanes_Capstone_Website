import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, NewspaperIcon } from 'lucide-react';
import type { NewsAnnouncement } from '../../services/adminService';

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Update',
  advisory: 'MDRRMO / Public Advisory',
  event: 'Official Event / Program',
};

const CATEGORY_TONE: Record<string, string> = {
  general: 'bg-brand-800 text-white',
  advisory: 'bg-alert-600 text-white',
  event: 'bg-accent-500 text-white',
};

const shortDate = (v?: string) =>
  v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

/**
 * Lead story plus a secondary rail.
 *
 * A uniform grid of four identical cards gives the reader no way in — every
 * item shouts equally, so none of them lands. Promoting the newest release to a
 * full-bleed lead and demoting the rest to a compact rail creates the entry
 * point the grid was missing, and costs no extra data.
 */
export function FeaturedNews({ items }: { items: NewsAnnouncement[] }) {
  if (items.length === 0) return null;

  const [lead, ...rest] = items;
  const secondary = rest.slice(0, 3);
  const leadDate = shortDate(lead.created_at);
  const leadExcerpt = lead.body.length > 190 ? `${lead.body.slice(0, 190).trim()}…` : lead.body;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8">
      {/* ---- Lead ---- */}
      <Link
        to={`/news/${lead.id}`}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-hairline bg-white shadow-card transition-all duration-300 ease-gov hover:-translate-y-1 hover:shadow-raised motion-safe:animate-rise-in"
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-surface-sunken">
          {lead.image_url ? (
            <img
              src={lead.image_url}
              alt=""
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-gov group-hover:scale-[1.05]"
              loading="lazy"
            />
          ) : (
            /* No photo on the lead story is common early on — a tinted panel with
               the mark reads as intentional where a grey box reads as broken. */
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-50 to-surface-sunken">
              <NewspaperIcon className="h-12 w-12 text-brand-300" aria-hidden="true" />
            </div>
          )}

          <span
            className={`absolute left-4 top-4 rounded-md px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] shadow-subtle ${
              CATEGORY_TONE[lead.category] || CATEGORY_TONE.general
            }`}
          >
            {CATEGORY_LABELS[lead.category] || lead.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <p className="font-sans text-eyebrow uppercase text-accent-700">Latest release</p>
          <h3 className="mt-2 font-display text-display-md leading-tight text-brand-800 transition-colors duration-200 group-hover:text-brand-600">
            {lead.title}
          </h3>
          <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">{leadExcerpt}</p>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-hairline pt-4">
            <p className="text-[0.8125rem] text-ink-muted">
              Magallanes LGU · <time className="font-mono">{leadDate}</time>
            </p>
            <span className="inline-flex items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-brand-600">
              Read release
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-200 ease-gov group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>

      {/* ---- Secondary rail ---- */}
      {secondary.length > 0 && (
        <ul className="flex flex-col gap-4">
          {secondary.map((item, i) => (
            <li key={item.id} className="flex-1 motion-safe:animate-rise-in" style={{ animationDelay: `${120 + i * 90}ms` }}>
              <Link
                to={`/news/${item.id}`}
                className="group flex h-full gap-4 rounded-xl border border-hairline bg-white p-4 shadow-subtle transition-all duration-200 ease-gov hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 ease-gov group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-brand-50">
                      <NewspaperIcon className="h-5 w-5 text-brand-300" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-subtle">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-[0.9375rem] font-bold leading-snug text-brand-800 transition-colors duration-200 group-hover:text-brand-600">
                    {item.title}
                  </h3>
                  <time className="mt-auto pt-2 font-mono text-[0.6875rem] text-ink-muted">
                    {shortDate(item.created_at)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
