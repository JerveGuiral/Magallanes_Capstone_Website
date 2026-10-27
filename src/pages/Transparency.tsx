import React from 'react';
import { FileTextIcon, DownloadIcon, CheckIcon, ShieldAlertIcon, ExternalLinkIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { adminService, type TransparencyDoc } from '../services/adminService';
import { LGU_CONTACT } from '../data/site';

const SEAL_REQUIREMENTS = [
  'Annual budget report posted within 30 days of enactment',
  'Quarterly statement of cash flow and debt service',
  'Procurement records, including bid results and notices of award',
  'Itemized utilization of the Local Disaster Risk Reduction and Management Fund',
  'Statement of assets, liabilities and net worth filing compliance',
];

const CATEGORY_LABELS: Record<TransparencyDoc['category'], string> = {
  budget: 'Annual Budget & Financials',
  procurement: 'Procurement & APP',
  'org-chart': 'Organizational Structure',
  saln: 'SALN Compliance',
  other: 'Other Official Reports',
};

export function Transparency() {
  const [docs, setDocs] = React.useState<TransparencyDoc[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    adminService.getTransparencyDocs().then(({ data }) => {
      if (mounted) {
        setDocs((data || []).filter((d) => !d.is_archived));
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Transparency"
        title="Transparency Seal"
        description="Documents posted in compliance with the Full Disclosure Policy of the Department of the Interior and Local Government, and with the Freedom of Information program."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="disclosures-title">
        <div className="container-page grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div>
            <div id="disclosures-title">
              <SectionHeading
                title="Posted documents"
                description="Reports are posted within 30 days of the close of each reporting period. Certified copies may be requested from the Municipal Accountant."
              />
            </div>

            {loading ? (
              <div className="mt-9 card overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-hairline p-5 last:border-b-0">
                    <div className="skeleton h-9 w-9 shrink-0 rounded-md" />
                    <div className="flex-1">
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton mt-2 h-2.5 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docs.length === 0 ? (
              <p className="mt-9 rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
                No documents posted yet.
              </p>
            ) : (
              <ul className="mt-9 overflow-hidden rounded-lg border border-hairline bg-white shadow-subtle">
                {docs.map((doc, i) => (
                  <Reveal as="li" key={doc.id} delay={Math.min(i, 8) * 0.03}>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-4 border-b border-hairline p-5 transition-colors duration-150 hover:bg-brand-50"
                    >
                      <span className="flex min-w-0 items-start gap-4">
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-brand-100"
                          aria-hidden="true"
                        >
                          <FileTextIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-[1.0625rem] font-bold leading-snug text-brand-800">
                            {doc.title}
                          </span>
                          <span className="mt-1 block font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                            {[doc.fiscal_year, CATEGORY_LABELS[doc.category]].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-ink-subtle transition-colors duration-150 group-hover:text-brand-600">
                        <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Open</span>
                        <span className="sr-only">{doc.title} (opens in a new tab)</span>
                      </span>
                    </a>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-brand-800">What the Seal covers</h2>
              <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />
              <ul className="mt-5 space-y-3">
                {SEAL_REQUIREMENTS.map((req) => (
                  <li key={req} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink">
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-brand-800">Freedom of Information</h2>
              <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />
              <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink">
                Any citizen may request records not posted here. File a written request with the FOI Receiving Officer
                at the Municipal Hall; a decision is issued within 15 working days.
              </p>
              <dl className="mt-5 divide-y divide-hairline border-t border-hairline">
                <div className="py-3">
                  <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    FOI Receiving Officer
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink">Office of the Mayor</dd>
                </div>
                <div className="py-3">
                  <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                    Email
                  </dt>
                  <dd className="mt-1 break-all font-mono text-[0.875rem] text-ink">
                    <a href={`mailto:${LGU_CONTACT.email}`} className="hover:text-brand-600">{LGU_CONTACT.email}</a>
                  </dd>
                </div>
              </dl>
              <a
                href="https://www.foi.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-1.5 font-sans text-[0.875rem] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-800"
              >
                National eFOI portal
                <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </aside>
        </div>
      </section>

      <MotifDivider />

      {/* ---- Anti-fixer notice ---- */}
      <section className="w-full py-14 lg:py-section" aria-labelledby="anti-fixer-title">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-lg border border-alert-600/25 bg-alert-50 p-6 sm:p-8">
            <span className="absolute inset-y-0 left-0 w-1 bg-alert-600" aria-hidden="true" />
            <div className="flex gap-4 pl-2">
              <ShieldAlertIcon className="mt-1 hidden h-7 w-7 shrink-0 text-alert-600 sm:block" aria-hidden="true" />
              <div>
                <h2 id="anti-fixer-title" className="font-display text-display-md text-alert-900">
                  No fixers. No unofficial fees.
                </h2>
                <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-alert-800">
                  Every payment to the municipality is covered by an official receipt. If any person offers to expedite
                  a transaction for a fee, report it to the Office of the Municipal Mayor or through the Public
                  Assistance Desk — reports may be filed anonymously.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
