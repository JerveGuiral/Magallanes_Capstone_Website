import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangleIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { NewsCard } from '../components/news/NewsCard';
import { Reveal } from '../components/Reveal';
import { adminService, type NewsAnnouncement } from '../services/adminService';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'event', label: 'Events' },
  { value: 'advisory', label: 'Advisories' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];

export function News() {
  const [news, setNews] = React.useState<NewsAnnouncement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<CategoryValue>('all');

  React.useEffect(() => {
    let mounted = true;
    adminService.getPublicNews().then(({ data }) => {
      if (mounted) {
        setNews((data || []).filter((n) => n.is_published));
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const items = active === 'all' ? news : news.filter((n) => n.category === active);
  const advisories = news.filter((n) => n.category === 'advisory').slice(0, 5);

  /* Counts on the filter chips tell the reader whether a tab is worth opening
     before they spend a tap on it. */
  const countFor = (value: CategoryValue) =>
    value === 'all' ? news.length : news.filter((n) => n.category === value).length;

  return (
    <>
      <PageHeader
        eyebrow="News"
        title="News, advisories and public notices"
        description="Official releases from the Local Government of Magallanes. Advisories are issued by the MDRRMO and take precedence."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="news-list-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div>
            <h2 id="news-list-title" className="sr-only">
              News releases
            </h2>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {CATEGORIES.map((cat) => {
                const selected = active === cat.value;
                const count = countFor(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setActive(cat.value)}
                    aria-pressed={selected}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-[0.8125rem] font-semibold transition-colors duration-150 ${
                      selected
                        ? 'border-brand-800 bg-brand-800 text-white'
                        : 'border-hairline bg-white text-ink-muted hover:border-brand-400 hover:text-brand-600'
                    }`}
                  >
                    {cat.label}
                    {!loading && (
                      <span
                        className={`rounded-full px-1.5 font-mono text-[0.6875rem] ${
                          selected ? 'bg-white/20 text-white' : 'bg-surface text-ink-subtle'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="mt-7 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card flex gap-5 p-5">
                    <div className="skeleton h-20 w-16 shrink-0 rounded-md" />
                    <div className="flex-1">
                      <div className="skeleton h-2.5 w-28" />
                      <div className="skeleton mt-3 h-5 w-4/5" />
                      <div className="skeleton mt-3 h-3 w-full" />
                      <div className="skeleton mt-1.5 h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="mt-7 rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
                No releases filed under this category yet.
              </p>
            ) : (
              <div className="mt-7 space-y-4">
                {items.map((item, i) => (
                  <Reveal key={item.id} delay={Math.min(i, 8) * 0.04}>
                    <NewsCard item={item} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>

          {/* ---- Advisory archive ---- */}
          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="advisory-archive-title">
            <div className="card overflow-hidden">
              <h2
                id="advisory-archive-title"
                className="flex items-center gap-2 border-b border-hairline bg-alert-50 px-5 py-4 font-display text-lg font-bold text-alert-900"
              >
                <AlertTriangleIcon className="h-4 w-4 shrink-0 text-alert-600" aria-hidden="true" />
                Advisory archive
              </h2>

              {advisories.length === 0 ? (
                <p className="px-5 py-6 text-sm text-ink-muted">No advisories posted yet.</p>
              ) : (
                <ul className="divide-y divide-hairline">
                  {advisories.map((a) => (
                    <li key={a.id}>
                      <Link
                        to={`/news/${a.id}`}
                        className="group block px-5 py-4 transition-colors duration-150 hover:bg-alert-50"
                      >
                        <h3 className="font-sans text-[0.9375rem] font-bold leading-snug text-brand-800 transition-colors duration-150 group-hover:text-alert-700">
                          {a.title}
                        </h3>
                        <time className="mt-1.5 block font-mono text-[0.6875rem] text-ink-muted">
                          {a.created_at
                            ? new Date(a.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : ''}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
