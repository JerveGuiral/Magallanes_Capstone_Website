import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  ArrowRightIcon,
  ReceiptTextIcon,
  SearchIcon,
  Building2Icon,
  WalletIcon,
  TimerIcon,
  ClipboardListIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { askBitoy } from '../lib/askBitoy';
import { PageHeader } from '../components/ui/PageHeader';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/Reveal';
import { MotifDivider } from '../components/ui/MotifDivider';
import { adminService, type ServiceItem } from '../services/adminService';

const PERMIT_STEPS = [
  { step: '01', title: 'Secure barangay clearance', detail: 'Obtain clearance from the barangay where the business is located.' },
  { step: '02', title: 'File the unified application form', detail: 'Submit to the BPLO with proof of registration (DTI, SEC or CDA).' },
  { step: '03', title: 'Assessment and payment', detail: 'Treasurer’s Office computes fees; pay at the cashier or via bank deposit.' },
  { step: '04', title: 'Inspection and release', detail: 'Sanitary, fire and zoning inspection, then release of the mayor’s permit.' },
];

const REQUIREMENTS = [
  'Two valid government-issued IDs',
  'Latest community tax certificate (cedula)',
  'Barangay clearance from your place of residence',
  'Proof of payment of real property tax, if applicable',
];

function ServiceSkeleton() {
  return (
    <div className="card flex h-full gap-4 p-5">
      <div className="skeleton h-10 w-10 shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton mt-3 h-3 w-full" />
        <div className="skeleton mt-1.5 h-3 w-5/6" />
        <div className="skeleton mt-4 h-2.5 w-32" />
      </div>
    </div>
  );
}

const ALL = '__all__';

/* "Tax — community tax" → "Tax": the part before the dash names the filter group. */
const categoryLabel = (c: string) => c.split(/\s+[—–-]\s+/)[0].trim();

/* Same keyword groups as ServiceIcon, so a service's colour and icon always agree. */
const TONE_MAP: [RegExp, string][] = [
  [/permit/i, 'tone-rose'],
  [/clearance|tax|treasur/i, 'tone-gold'],
  [/civil|registry/i, 'tone-sky'],
  [/health|sanit|assist|welfare|social/i, 'tone-green'],
];
const toneFor = (c?: string | null) => (c && TONE_MAP.find(([re]) => re.test(c))?.[1]) || 'tone-rose';

/* Requirements are stored as one text block, usually a numbered list, sometimes with a
 * lead-in line ("For both bride and groom:") or a closing note ("Benefits: …"). The
 * numbered lines become the checklist; the rest stays prose around it. A block with no
 * numbering at all is treated as a list, one line per item. */
const ITEM = /^\s*(\d+[.)]|[-•*])\s*/;
function parseRequirements(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.some((l) => ITEM.test(l))) return { intro: [], items: lines, notes: [] };
  const first = lines.findIndex((l) => ITEM.test(l));
  const intro = lines.slice(0, first);
  const items: string[] = [];
  const notes: string[] = [];
  for (const l of lines.slice(first)) {
    if (ITEM.test(l)) items.push(l.replace(ITEM, ''));
    else notes.push(l);
  }
  return { intro, items, notes };
}

export function Services() {
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [category, setCategory] = React.useState(ALL);
  const [query, setQuery] = React.useState('');

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of services) {
      if (s.category) counts.set(categoryLabel(s.category), (counts.get(categoryLabel(s.category)) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([label, count]) => ({ key: label, label, count }));
  }, [services]);

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter(
      (s) =>
        (category === ALL || (s.category && categoryLabel(s.category) === category)) &&
        (!q || [s.name, s.category, s.office, s.requirements].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [services, category, query]);

  React.useEffect(() => {
    let mounted = true;
    adminService.getServices().then(({ data }) => {
      if (!mounted) return;
      setServices(data || []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        image="municipal-hall-1"
        eyebrow="Services"
        title="Citizen and business services"
        description="Requirements, fees, and processing times for the frontline services of the Municipality of Magallanes."
      />

      {/* ---- Directory ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="service-directory-title">
        <div className="container-page">
          <div id="service-directory-title">
            <SectionHeading
              title="Service directory"
              description="Each entry names the responsible office, the fee, and how long processing takes."
            />
          </div>

          {!loading && services.length > 0 && (
            <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <ul className="flex flex-wrap gap-2" aria-label="Filter by type of service">
                {[{ key: ALL, label: 'All services', count: services.length }, ...categories].map((c) => {
                  const active = category === c.key;
                  return (
                    <li key={c.key}>
                      <button
                        type="button"
                        onClick={() => setCategory(c.key)}
                        aria-pressed={active}
                        className={`rounded-full border px-4 py-2 text-[0.875rem] font-semibold transition-colors duration-150 ${
                          active
                            ? 'border-brand-600 bg-brand-600 text-white shadow-subtle'
                            : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50'
                        }`}
                      >
                        {c.label}
                        <span className={`ml-1.5 tabular-nums ${active ? 'text-brand-100' : 'text-ink-subtle'}`}>{c.count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <label className="relative block w-full sm:w-80 xl:shrink-0">
                <span className="sr-only">Find a service</span>
                <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a service, e.g. cedula"
                  className="field rounded-full pl-10"
                />
              </label>
            </div>
          )}

          {loading ? (
            <div className="mt-9 grid gap-5 md:grid-cols-2">
              <ServiceSkeleton />
              <ServiceSkeleton />
              <ServiceSkeleton />
              <ServiceSkeleton />
            </div>
          ) : services.length === 0 ? (
            <p className="mt-9 rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
              No services posted yet.
            </p>
          ) : shown.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-brand-200 bg-surface-muted p-10 text-center">
              <p className="font-display text-lg font-bold text-brand-800">No service matches “{query}”.</p>
              <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
                Try another word, or{' '}
                <button type="button" onClick={() => askBitoy(query)} className="font-semibold text-brand-600 underline underline-offset-2 hover:text-brand-800">
                  ask Bitoy
                </button>
                .
              </p>
            </div>
          ) : (
            <ul className="mt-8 grid items-start gap-5 md:grid-cols-2">
              {shown.map((service, i) => {
                const { intro, items: steps, notes } = parseRequirements(service.requirements);
                return (
                  <Reveal as="li" key={service.id} delay={(i % 6) * 0.03}>
                    <article className="card card-interactive group flex h-full flex-col p-5 sm:p-6">
                      <div className="flex items-start gap-4">
                        <span className={`icon-tile ${toneFor(service.category)}`} aria-hidden="true">
                          <ServiceIcon category={service.category} className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          {service.category && (
                            <p className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-accent-700">
                              {categoryLabel(service.category)}
                            </p>
                          )}
                          <h3 className="mt-0.5 font-display text-[1.1875rem] font-bold leading-snug text-brand-800">
                            {service.name}
                          </h3>
                        </div>
                      </div>

                      {(service.office || service.fee || service.processing_time) && (
                        <dl className="mt-5 grid gap-2.5 text-[0.875rem] sm:grid-cols-[auto_1fr] sm:gap-x-3">
                          {service.office && (
                            <>
                              <dt className="flex items-start gap-1.5 font-semibold text-ink-muted">
                                <Building2Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
                                Office
                              </dt>
                              <dd className="text-ink">{service.office}</dd>
                            </>
                          )}
                          {service.fee && (
                            <>
                              <dt className="flex items-start gap-1.5 font-semibold text-ink-muted">
                                <WalletIcon className="mt-0.5 h-4 w-4 shrink-0 text-fiesta-600" aria-hidden="true" />
                                Fee
                              </dt>
                              <dd className="tabular-nums text-ink">{service.fee}</dd>
                            </>
                          )}
                          {service.processing_time && (
                            <>
                              <dt className="flex items-start gap-1.5 font-semibold text-ink-muted">
                                <TimerIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                                Processing
                              </dt>
                              <dd className="text-ink">{service.processing_time}</dd>
                            </>
                          )}
                        </dl>
                      )}

                      {steps.length > 0 && (
                        <details className="group/req mt-5 rounded-xl border border-hairline bg-surface-muted open:bg-white">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-[0.9375rem] font-semibold text-brand-700 transition-colors duration-150 hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
                            <span className="flex items-center gap-2">
                              <ClipboardListIcon className="h-4 w-4" aria-hidden="true" />
                              Requirements
                              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[0.75rem] tabular-nums text-brand-700">{steps.length}</span>
                            </span>
                            <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-open/req:rotate-180" aria-hidden="true" />
                          </summary>
                          <div className="px-4 pb-4 pt-1 text-[0.9375rem] leading-relaxed text-ink">
                            {intro.map((line, n) => (
                              <p key={n} className="mb-2 font-semibold text-ink-light">{line}</p>
                            ))}
                            <ol className="space-y-2">
                              {steps.map((line, n) => (
                                <li key={n} className="flex gap-2.5">
                                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                                  <span>{line}</span>
                                </li>
                              ))}
                            </ol>
                            {notes.map((line, n) => (
                              <p key={n} className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-[0.875rem] text-ink-light">{line}</p>
                            ))}
                          </div>
                        </details>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <MotifDivider />

      {/* ---- Worked example ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="permit-process-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <div id="permit-process-title">
              <SectionHeading
                title="How to file a business permit"
                description="Steps must be completed in order; each stage requires the output of the previous one."
              />
            </div>

            {/* Numbered rail — the connecting line makes the sequence legible
                without asking the reader to infer it from stacked cards. */}
            <ol className="mt-9 space-y-0">
              {PERMIT_STEPS.map((s, i) => (
                <li key={s.step} className="relative flex gap-5 pb-7 last:pb-0">
                  {i < PERMIT_STEPS.length - 1 && (
                    <span className="absolute left-[1.1875rem] top-10 h-[calc(100%-1.75rem)] w-0.5 rounded-full bg-gradient-to-b from-brand-300 to-brand-100" aria-hidden="true" />
                  )}
                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 font-sans text-[0.875rem] font-bold tabular-nums text-white shadow-glow ring-4 ring-brand-50">
                    {s.step}
                  </span>
                  <div className="pt-1">
                    <h3 className="font-display text-[1.0625rem] font-bold text-brand-800">{s.title}</h3>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="requirements-title">
            <div className="card p-6">
              <h2 id="requirements-title" className="font-display text-lg font-bold text-brand-800">
                Bring these for most transactions
              </h2>
              <span className="mt-3 block h-[3px] w-12 rounded-full bg-brand-400" aria-hidden="true" />

              <ul className="mt-5 space-y-3">
                {REQUIREMENTS.map((req) => (
                  <li key={req} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {req}
                  </li>
                ))}
              </ul>

              <p className="mt-6 flex gap-2.5 rounded-md border border-accent-200 bg-accent-50 p-3.5 text-[0.8125rem] leading-relaxed text-ink">
                <ReceiptTextIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-700" aria-hidden="true" />
                <span>
                  Fees are governed by the Revised Revenue Code of Magallanes. An official receipt is issued for every
                  payment — <strong className="font-semibold">never pay without one.</strong>
                </span>
              </p>

              <Link
                to="/contact"
                className="group mt-5 inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                Ask the Public Assistance Desk
                <ArrowRightIcon
                  className="h-3.5 w-3.5 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
