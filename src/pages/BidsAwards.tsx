import React from 'react';
import { DownloadIcon, ExternalLinkIcon, GavelIcon, InfoIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Reveal } from '../components/Reveal';
import { adminService, type BidAwardItem } from '../services/adminService';

type Filter = 'all' | BidAwardItem['status'];

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Under evaluation' },
  { value: 'awarded', label: 'Awarded' },
];

const STATUS_LABEL: Record<BidAwardItem['status'], string> = {
  open: 'Open for bidding',
  closed: 'Closed / under evaluation',
  awarded: 'Awarded',
};

/* Only "open" is actionable, so only "open" gets a filled badge. The other two
 * are historical record and stay quiet. */
const STATUS_TONE: Record<BidAwardItem['status'], string> = {
  open: 'border-accent-800 bg-accent-700 text-white',
  closed: 'border-hairline bg-surface text-ink-muted',
  awarded: 'border-brand-200 bg-brand-50 text-brand-700',
};

function formatDate(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function BidsAwards() {
  const [bids, setBids] = React.useState<BidAwardItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<Filter>('all');

  React.useEffect(() => {
    let mounted = true;
    adminService.getBidsAwards().then(({ data }) => {
      if (mounted) {
        setBids(data || []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const items = active === 'all' ? bids : bids.filter((b) => b.status === active);
  const countFor = (value: Filter) => (value === 'all' ? bids.length : bids.filter((b) => b.status === value).length);
  const openCount = countFor('open');

  return (
    <>
      <PageHeader
        eyebrow="Bids & Awards"
        title="Bids and awards"
        description="Invitations to bid, bid results and notices of award posted by the BAC Secretariat of the Municipality of Magallanes."
        aside={
          !loading && bids.length > 0 ? (
            <div className="rounded-lg border border-hairline bg-white px-5 py-4 text-center shadow-subtle">
              <p className="font-display text-display-md font-extrabold tracking-[-0.02em] text-accent-700">{openCount}</p>
              <p className="mt-0.5 font-sans text-eyebrow uppercase text-ink-muted">
                Open for bidding
              </p>
            </div>
          ) : undefined
        }
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="bids-list-title">
        <div className="container-page">
          <h2 id="bids-list-title" className="sr-only">
            Procurement notices
          </h2>

          {/* ---- Statutory notice ---- */}
          <p className="flex max-w-3xl gap-2.5 rounded-md border border-brand-100 bg-brand-50 p-4 text-[0.875rem] leading-relaxed text-ink">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span>
              All procurement of the municipality is conducted under Republic Act No. 9184 and is also published on the{' '}
              <a
                href="https://www.philgeps.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800"
              >
                Philippine Government Electronic Procurement System (PhilGEPS)
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              . Where a posting here differs from PhilGEPS, the PhilGEPS record governs.
            </span>
          </p>

          {/* ---- Filters ---- */}
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter by procurement status">
            {FILTERS.map((f) => {
              const selected = active === f.value;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setActive(f.value)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-[0.8125rem] font-semibold transition-colors duration-150 ${
                    selected
                      ? 'border-brand-800 bg-brand-800 text-white'
                      : 'border-hairline bg-white text-ink-muted hover:border-brand-400 hover:text-brand-600'
                  }`}
                >
                  {f.label}
                  {!loading && (
                    <span
                      className={`rounded-full px-1.5 font-mono text-[0.6875rem] ${
                        selected ? 'bg-white/20 text-white' : 'bg-surface text-ink-subtle'
                      }`}
                    >
                      {countFor(f.value)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ---- Listing ---- */}
          {loading ? (
            <div className="card mt-7 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-b border-hairline p-5 last:border-b-0">
                  <div className="skeleton h-2.5 w-32" />
                  <div className="skeleton mt-3 h-5 w-2/3" />
                  <div className="skeleton mt-3 h-3 w-48" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-7 rounded-lg border border-dashed border-hairline bg-white p-12 text-center">
              <GavelIcon className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden="true" />
              <p className="mt-3 text-[0.9375rem] text-ink-muted">
                {bids.length === 0
                  ? 'No procurement notices posted here yet.'
                  : 'No procurement notices under this status.'}
              </p>
              {bids.length === 0 && (
                <a
                  href="https://www.philgeps.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-brand-600 hover:text-brand-800"
                >
                  Government bids are also published on PhilGEPS
                  <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          ) : (
            <ul className="mt-7 overflow-hidden rounded-lg border border-hairline bg-white shadow-subtle">
              {items.map((bid, i) => {
                const posted = formatDate(bid.posting_date);
                const opening = formatDate(bid.bid_opening_date);
                const awarded = formatDate(bid.award_date);

                return (
                  <Reveal as="li" key={bid.id} delay={Math.min(i, 8) * 0.03}>
                    <article className="border-b border-hairline p-5 transition-colors duration-150 last:border-b-0 hover:bg-brand-50 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          {bid.reference_number && (
                            <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-ink-subtle">
                              {bid.reference_number}
                            </p>
                          )}
                          <h3 className="mt-1 font-display text-[1.0625rem] font-bold leading-snug text-brand-800 sm:text-lg">
                            {bid.title}
                          </h3>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] ${STATUS_TONE[bid.status]}`}
                        >
                          {STATUS_LABEL[bid.status]}
                        </span>
                      </div>

                      {/* Dates as a definition list: a contractor scans for the
                          opening date, and a label/value pair is faster to scan
                          than the same facts run together in a sentence. */}
                      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-hairline pt-3.5">
                        {posted && (
                          <div>
                            <dt className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-subtle">
                              Posted
                            </dt>
                            <dd className="mt-0.5 font-mono text-[0.8125rem] text-ink">{posted}</dd>
                          </div>
                        )}
                        {opening && (
                          <div>
                            <dt className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-subtle">
                              Bid opening
                            </dt>
                            <dd className="mt-0.5 font-mono text-[0.8125rem] text-ink">{opening}</dd>
                          </div>
                        )}
                        {awarded && (
                          <div>
                            <dt className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-subtle">
                              Award date
                            </dt>
                            <dd className="mt-0.5 font-mono text-[0.8125rem] text-ink">{awarded}</dd>
                          </div>
                        )}
                        {bid.status === 'awarded' && bid.awarded_to && (
                          <div className="min-w-0">
                            <dt className="font-sans text-[0.625rem] font-bold uppercase tracking-[0.08em] text-ink-subtle">
                              Awarded to
                            </dt>
                            <dd className="mt-0.5 text-[0.8125rem] font-medium text-ink">{bid.awarded_to}</dd>
                          </div>
                        )}
                      </dl>

                      {bid.document_url && (
                        <a
                          href={bid.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group mt-4 inline-flex items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
                        >
                          <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Download bid documents
                          <span className="sr-only">for {bid.title} (opens in a new tab)</span>
                        </a>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </ul>
          )}

          {/* ---- BAC contact ---- */}
          <div className="card mt-10 flex flex-wrap items-center justify-between gap-5 p-6">
            <div>
              <h2 className="font-display text-lg font-bold text-brand-800">BAC Secretariat</h2>
              <p className="mt-1.5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-muted">
                Clarifications on any posting, and requests for bid documents, are handled by the Bids and Awards
                Committee Secretariat at the Municipal Hall.
              </p>
            </div>
            <a
              href="https://www.philgeps.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary shrink-0"
            >
              View on PhilGEPS
              <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
