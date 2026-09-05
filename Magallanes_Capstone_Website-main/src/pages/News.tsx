import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { NewsCard } from '../components/news/NewsCard';
import { Reveal } from '../components/Reveal';
import { NEWS, ADVISORIES } from '../data/site';

import { supabaseAdmin } from '../admin/services/supabaseAdminService';

const CATEGORIES = ['All', 'Infrastructure', 'Governance', 'Environment', 'Public Service', 'Advisory'] as const;

export function News() {
  const [active, setActive] = React.useState<(typeof CATEGORIES)[number]>('All');
  const [dynamicNews, setDynamicNews] = React.useState(NEWS);

  React.useEffect(() => {
    supabaseAdmin.getNews().then((data) => {
      if (data && data.length > 0) {
        const published = data.filter((d) => d.is_published);
        const mapped = published.map((n) => {
          const d = new Date(n.created_at || Date.now());
          return {
            id: n.id,
            title: n.title,
            excerpt: n.body,
            category: n.category === 'advisory' ? 'Advisory' : n.category === 'event' ? 'Governance' : 'Public Service',
            day: d.getDate().toString().padStart(2, '0'),
            month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
            year: d.getFullYear().toString(),
          };
        });
        setDynamicNews(mapped);
      }
    });
  }, []);

  const items = active === 'All' ? dynamicNews : dynamicNews.filter((n) => n.category === active);

  return (
    <>
      <PageHeader
        eyebrow="News"
        title="News, advisories and public notices"
        description="Official releases from the Local Government of Magallanes. Advisories with a red header are issued by the MDRRMO and take precedence." />


      <section className="w-full py-12" aria-labelledby="news-list-title">
        <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
          <div>
            <h2 id="news-list-title" className="sr-only">
              News releases
            </h2>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {CATEGORIES.map((cat) =>
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActive(cat)}
                  aria-pressed={active === cat}
                  className={`border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${active === cat ?
                      'border-navy bg-navy text-white' :
                      'border-hairline bg-white text-ink-muted hover:border-teal hover:text-teal'}`
                  }>

                  {cat}
                </button>
              )}
            </div>

            {items.length === 0 ?
              <p className="mt-8 border border-dashed border-hairline bg-white p-8 text-center text-sm text-ink-muted">
                No releases filed under “{active}” yet.
              </p> :

              <div className="mt-6 space-y-4">
                {items.map((item, i) =>
                  <Reveal key={item.id} delay={i * 0.04}>
                    <NewsCard item={item} />
                  </Reveal>
                )}
              </div>
            }
          </div>

          <aside aria-labelledby="advisory-archive-title">
            <h2
              id="advisory-archive-title"
              className="font-display text-lg font-bold text-navy">

              Advisory archive
            </h2>
            <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />

            <ul className="mt-5 space-y-3">
              {ADVISORIES.map((a) =>
                <li key={a.id} className="border border-hairline bg-white p-4">
                  <p
                    className={`font-mono text-[10px] uppercase tracking-[0.14em] ${a.urgent ? 'text-alert' : 'text-teal'}`
                    }>

                    {a.urgent ? 'Emergency · ' : ''}
                    {a.category}
                  </p>
                  <h3 className="mt-1.5 font-display text-sm font-bold leading-snug text-navy">{a.title}</h3>
                  <p className="mt-2 font-mono text-[11px] text-ink-muted">
                    {a.reference} · {a.issued}
                  </p>
                </li>
              )}
            </ul>
          </aside>
        </div>
      </section>
    </>);

}