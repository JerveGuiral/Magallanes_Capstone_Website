import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, ArrowRightIcon, ReceiptTextIcon } from 'lucide-react';
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

export function Services() {
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);

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
          ) : (
            <ul className="mt-9 grid gap-5 md:grid-cols-2">
              {services.map((service, i) => (
                <Reveal as="li" key={service.id} delay={i * 0.03}>
                  <div className="card group flex h-full gap-4 p-5 transition-colors duration-150 hover:border-brand-300">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-brand-100"
                      aria-hidden="true"
                    >
                      <ServiceIcon category={service.category} className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <h3 className="font-display text-[1.0625rem] font-bold leading-snug text-brand-800">
                        {service.name}
                      </h3>
                      <p className="mt-1.5 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-muted">{service.requirements}</p>

                      {(service.office || service.fee || service.processing_time) && (
                        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-hairline pt-3.5 text-[0.75rem]">
                          {service.office && (
                            <div>
                              <dt className="font-sans font-bold uppercase tracking-[0.06em] text-ink-subtle">Office</dt>
                              <dd className="mt-0.5 text-ink">{service.office}</dd>
                            </div>
                          )}
                          {service.fee && (
                            <div>
                              <dt className="font-sans font-bold uppercase tracking-[0.06em] text-ink-subtle">Fee</dt>
                              <dd className="mt-0.5 font-mono text-ink">{service.fee}</dd>
                            </div>
                          )}
                          {service.processing_time && (
                            <div>
                              <dt className="font-sans font-bold uppercase tracking-[0.06em] text-ink-subtle">Processing</dt>
                              <dd className="mt-0.5 text-ink">{service.processing_time}</dd>
                            </div>
                          )}
                        </dl>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
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
                    <span className="absolute left-[1.1875rem] top-10 h-[calc(100%-1.75rem)] w-px bg-hairline" aria-hidden="true" />
                  )}
                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-brand-200 bg-white font-mono text-[0.8125rem] font-semibold text-brand-600">
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
              <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />

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
