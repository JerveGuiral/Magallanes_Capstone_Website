import React from 'react';
import { Link } from 'react-router-dom';
import { FileTextIcon, DownloadIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/Reveal';
import { adminService, type DownloadableForm } from '../services/adminService';

/** Forms grouped by issuing office, offices in alphabetical order; forms without one come last. */
function byOffice(forms: DownloadableForm[]) {
  const groups = new Map<string, DownloadableForm[]>();
  for (const f of forms) {
    const office = f.office?.trim() || 'Other forms';
    groups.set(office, [...(groups.get(office) || []), f]);
  }
  return [...groups.entries()].sort(([a], [b]) =>
    a === 'Other forms' ? 1 : b === 'Other forms' ? -1 : a.localeCompare(b)
  );
}

export function Forms() {
  const [forms, setForms] = React.useState<DownloadableForm[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    adminService.getPublishedForms().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.warn('Could not load downloadable forms:', error);
      setForms((data || []) as DownloadableForm[]);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Downloadable Forms"
        description="Application forms you can download, print and fill in before going to the Municipal Hall. Submit each form to the office named on it."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="forms-title">
        <div className="container-page">
          <div id="forms-title">
            <SectionHeading
              title="Available forms"
              description="Forms are free. Bring the filled-in form together with the requirements listed on the Services page."
            />
          </div>

          {loading ? (
            <div className="mt-9 card overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-hairline p-5 last:border-b-0">
                  <div className="skeleton h-9 w-9 shrink-0 rounded-md" />
                  <div className="flex-1">
                    <div className="skeleton h-4 w-2/3" />
                    <div className="skeleton mt-2 h-2.5 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            /* Says where to get a form meanwhile, rather than a bare "nothing". */
            <div className="mt-9 rounded-lg border border-dashed border-hairline bg-white p-8 text-center sm:p-10">
              <FileTextIcon className="mx-auto h-8 w-8 text-ink-subtle" aria-hidden="true" />
              <p className="mt-3 font-display text-lg font-bold text-brand-800">Forms are being prepared for posting</p>
              <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
                Until they are posted here, get the form from the office that handles your transaction at the
                Municipal Hall.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link to="/services" className="btn btn-secondary">
                  See services and requirements
                </Link>
                <Link to="/offices" className="btn btn-secondary">
                  Office directory
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-9 space-y-8">
              {byOffice(forms).map(([office, list]) => (
                <div key={office}>
                  <h2 className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.08em] text-ink-muted">{office}</h2>
                  <ul className="mt-3 overflow-hidden rounded-lg border border-hairline bg-white shadow-subtle">
                    {list.map((form, i) => (
                      <Reveal as="li" key={form.id} delay={Math.min(i, 8) * 0.03}>
                        <a
                          href={form.file_url}
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
                                {form.title}
                              </span>
                              {form.title_bisaya && (
                                <span className="mt-0.5 block text-[0.875rem] text-ink-muted">{form.title_bisaya}</span>
                              )}
                              {form.description && (
                                <span className="mt-1 block text-[0.875rem] leading-relaxed text-ink">{form.description}</span>
                              )}
                            </span>
                          </span>

                          <span className="flex shrink-0 items-center gap-1.5 font-sans text-[0.8125rem] font-semibold text-ink-subtle transition-colors duration-150 group-hover:text-brand-600">
                            <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Download</span>
                            <span className="sr-only">{form.title} (opens in a new tab)</span>
                          </span>
                        </a>
                      </Reveal>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
