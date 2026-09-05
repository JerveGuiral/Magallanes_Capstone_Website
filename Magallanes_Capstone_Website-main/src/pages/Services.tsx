import React from 'react';
import { CheckIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Reveal } from '../components/Reveal';
import { MotifDivider } from '../components/ui/MotifDivider';
import { SERVICES } from '../data/site';
import { supabaseAdmin } from '../admin/services/supabaseAdminService';

const PERMIT_STEPS = [
  { step: '01', title: 'Secure barangay clearance', detail: 'Obtain clearance from the barangay where the business is located.' },
  { step: '02', title: 'File the unified application form', detail: 'Submit to the BPLO with proof of registration (DTI, SEC or CDA).' },
  { step: '03', title: 'Assessment and payment', detail: 'Treasurer’s Office computes fees; pay at the cashier or via bank deposit.' },
  { step: '04', title: 'Inspection and release', detail: 'Sanitary, fire and zoning inspection, then release of the mayor’s permit.' }];


const STATIC_BIDS = [
  {
    ref: 'ITB-2026-041',
    title: 'Supply and delivery of one (1) unit rescue ambulance',
    abc: '₱ 3,450,000.00',
    status: 'Open until Sep 8, 2026',
    open: true
  },
  {
    ref: 'ITB-2026-038',
    title: 'Concreting of Caloc-an farm-to-market road, Phase 3',
    abc: '₱ 18,900,000.00',
    status: 'Bid opening Sep 2, 2026',
    open: true
  },
  {
    ref: 'NOA-2026-034',
    title: 'Rehabilitation of Poblacion municipal water reservoir',
    abc: '₱ 6,215,400.00',
    status: 'Awarded · Jul 30, 2026',
    open: false
  }];


const REQUIREMENTS = [
  'Two valid government-issued IDs',
  'Latest community tax certificate (cedula)',
  'Barangay clearance from your place of residence',
  'Proof of payment of real property tax, if applicable'];


export function Services() {
  const [dynamicServices, setDynamicServices] = React.useState<any[]>(SERVICES);
  const [dynamicBids, setDynamicBids] = React.useState<any[]>(STATIC_BIDS);

  React.useEffect(() => {
    supabaseAdmin.getServices().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((s) => {
          let icon: any = 'permit';
          const cat = (s.category || '').toLowerCase();
          const name = (s.name || '').toLowerCase();
          if (cat.includes('civil') || name.includes('birth') || name.includes('marriage')) icon = 'civil';
          else if (cat.includes('health') || name.includes('health') || name.includes('medical')) icon = 'health';
          else if (cat.includes('tax') || name.includes('cedula') || name.includes('treasury')) icon = 'tax';
          else if (cat.includes('clearance') || name.includes('clearance')) icon = 'clearance';
          else if (cat.includes('bidding') || name.includes('bid')) icon = 'bidding';

          return {
            id: s.id,
            label: s.name,
            description: `${s.requirements} (Processing: ${s.processing_time || '1-2 days'}, Fee: ${s.fee || 'None'})`,
            office: s.office || 'Municipal Hall',
            code: s.category || 'Charter',
            icon,
          };
        });
        setDynamicServices(mapped);
      }
    });

    supabaseAdmin.getBids().then((bids) => {
      if (bids && bids.length > 0) {
        const mapped = bids.map((b) => ({
          ref: b.reference_number || 'ITB-LGU',
          title: b.title,
          abc: b.awarded_to ? `Awarded to: ${b.awarded_to}` : `Posted: ${b.posting_date}`,
          status: b.status === 'open' ? 'Open for Bidding' : b.status === 'awarded' ? 'Awarded Contract' : 'Closed',
          open: b.status === 'open',
        }));
        setDynamicBids(mapped);
      }
    });
  }, []);
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Citizen and business services"
        description="Every frontline transaction, the office accountable for it, and what to bring before you travel to the Municipal Hall." />


      <section className="w-full py-12" aria-labelledby="service-directory-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div id="service-directory-title">
            <SectionHeading eyebrow="Directory" title="Service directory" />
          </div>

          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {dynamicServices.map((service, i) =>
              <Reveal as="li" key={service.id} delay={i * 0.03}>
                <div className="group flex h-full gap-4 border border-hairline bg-white p-5 transition-colors duration-150 hover:border-teal">
                  <ServiceIcon
                    name={service.icon}
                    className="mt-0.5 h-6 w-6 shrink-0 text-navy transition-colors duration-150 group-hover:text-teal" />

                  <div>
                    <h3 className="font-display text-base font-bold text-navy">{service.label}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{service.description}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                      {service.office} · {service.code}
                    </p>
                  </div>
                </div>
              </Reveal>
            )}
          </ul>
        </div>
      </section>

      <MotifDivider />

      <section id="bids" className="w-full scroll-mt-28 py-12" aria-labelledby="bids-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div id="bids-title">
            <SectionHeading
              eyebrow="Procurement"
              title="Bids & awards"
              description="Invitations to bid and notices of award posted by the BAC Secretariat. All procurement is also published on PhilGEPS." />

          </div>

          <ul className="mt-8 space-y-px bg-hairline">
            {dynamicBids.map((bid) =>
              <li key={bid.ref} className="flex flex-wrap items-start justify-between gap-4 bg-white p-5">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{bid.ref}</p>
                  <h3 className="mt-1 font-display text-base font-bold leading-snug text-navy">{bid.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    Approved budget for the contract:{' '}
                    <span className="font-mono text-ink">{bid.abc}</span>
                  </p>
                </div>
                <span
                  className={`shrink-0 border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${bid.open ? 'border-teal-200 bg-teal-50 text-teal-900' : 'border-hairline bg-surface text-ink-muted'}`
                  }>

                  {bid.status}
                </span>
              </li>
            )}
          </ul>
        </div>
      </section>

      <MotifDivider />

      <section className="w-full py-12" aria-labelledby="permit-process-title">
        <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-8">
          <div>
            <div id="permit-process-title">
              <SectionHeading
                eyebrow="Sequential process"
                title="How to file a business permit"
                description="Steps must be completed in order; each stage requires the output of the previous one." />

            </div>

            <ol className="mt-8 space-y-px bg-hairline">
              {PERMIT_STEPS.map((s) =>
                <li key={s.step} className="flex gap-5 bg-white p-5">
                  <span className="font-mono text-sm font-semibold text-teal">{s.step}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-navy">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.detail}</p>
                  </div>
                </li>
              )}
            </ol>
          </div>

          <aside className="border border-hairline bg-white p-6" aria-labelledby="requirements-title">
            <h2 id="requirements-title" className="font-display text-lg font-bold text-navy">
              Bring these for most transactions
            </h2>
            <span className="mt-3 block h-[3px] w-12 bg-gold" aria-hidden="true" />
            <ul className="mt-5 space-y-3">
              {REQUIREMENTS.map((req) =>
                <li key={req} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                  {req}
                </li>
              )}
            </ul>
            <p className="mt-6 border-t border-hairline pt-4 text-xs leading-relaxed text-ink-muted">
              Fees are governed by the Revised Revenue Code of Magallanes. Official receipts are issued for every
              payment — never pay without one.
            </p>
          </aside>
        </div>
      </section>
    </>);

}