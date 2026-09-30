import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRightIcon, ArrowLeftIcon, PrinterIcon } from 'lucide-react';
import { BitaugMotif } from '../components/BitaugMotif';
import { SealLoaderPanel } from '../components/ui/SealLoader';
import { adminService, type NewsAnnouncement } from '../services/adminService';

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General Update',
  advisory: 'MDRRMO / Public Advisory',
  event: 'Official Event / Program',
};

const CATEGORY_TONE: Record<string, string> = {
  general: 'bg-brand-800 text-white',
  advisory: 'bg-alert-600 text-white',
  event: 'bg-sea-700 text-white',
};

export function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = React.useState<NewsAnnouncement | null | undefined>(undefined);

  React.useEffect(() => {
    if (!id) return;
    let mounted = true;
    adminService.getNewsById(id).then(({ data }) => {
      if (mounted) setItem(data && data.is_published ? data : null);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (item === undefined) {
    return <SealLoaderPanel label="Loading release…" />;
  }

  if (item === null) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-display-md">Release not found</h1>
        <p className="mt-3 text-[0.9375rem] text-ink-muted">
          This news release may have been unpublished or removed.
        </p>
        <Link to="/news" className="btn btn-secondary mt-7">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to News
        </Link>
      </div>
    );
  }

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;
  const tone = CATEGORY_TONE[item.category] || CATEGORY_TONE.general;

  return (
    <>
      <div className="relative overflow-hidden border-b border-hairline bg-gradient-to-b from-brand-50 to-white">
        <BitaugMotif className="pointer-events-none absolute -right-4 top-1 hidden h-44 w-56 text-brand-800/[0.06] md:block" />

        <div className="container-page relative py-10 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-micro uppercase text-ink-muted">
              <li>
                <Link to="/" className="transition-colors duration-150 hover:text-brand-600 hover:underline hover:underline-offset-2">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3 w-3 text-ink-subtle" />
              </li>
              <li>
                <Link to="/news" className="transition-colors duration-150 hover:text-brand-600 hover:underline hover:underline-offset-2">
                  News
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRightIcon className="h-3 w-3 text-ink-subtle" />
              </li>
              <li className="font-semibold text-brand-800" aria-current="page">
                {categoryLabel}
              </li>
            </ol>
          </nav>

          <span
            className={`mt-5 inline-block rounded-md px-2.5 py-1 font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] ${tone}`}
          >
            {categoryLabel}
          </span>

          <h1 className="mt-3.5 max-w-3xl text-display-lg sm:text-display-xl">{item.title}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-4 text-[0.8125rem] text-ink-muted">
            <span>
              Magallanes LGU · <time className="font-mono">{date}</time>
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="ml-auto inline-flex items-center gap-1.5 font-display font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
            >
              <PrinterIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Print
            </button>
          </div>
        </div>
      </div>

      <article className="w-full py-12 lg:py-14">
        <div className="container-page">
          <div className="mx-auto max-w-prose">
            {/* Uploaded images have no known dimensions, so the aspect box reserves
                the space instead — without it the article text jumped down the page
                as the photo arrived. */}
            {item.image_url && (
              <figure className="mb-9 aspect-[16/9] w-full overflow-hidden rounded-lg border border-hairline bg-surface-sunken shadow-card">
                <img
                  src={item.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              </figure>
            )}

            <div className="prose-gov whitespace-pre-line">{item.body}</div>

            <div className="mt-12 border-t border-hairline pt-6">
              <Link to="/news" className="btn btn-secondary group">
                <ArrowLeftIcon
                  className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                Back to all releases
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
