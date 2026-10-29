import React from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ClockIcon,
  MegaphoneIcon,
  Building2Icon,
  ArrowRightIcon,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { EmergencyHotlines } from '../components/ui/EmergencyHotlines';
import { LGU_CONTACT } from '../data/site';

const HALL_DETAILS: { Icon: typeof PhoneIcon; label: string; value: string; note?: string; href?: string; mono?: boolean }[] = [
  { Icon: MapPinIcon, label: 'Address', value: LGU_CONTACT.address },
  { Icon: PhoneIcon, label: LGU_CONTACT.phoneLabel, value: LGU_CONTACT.phone, href: LGU_CONTACT.phoneHref, mono: true },
  { Icon: MailIcon, label: "Mayor's Office email", value: LGU_CONTACT.email, href: `mailto:${LGU_CONTACT.email}`, mono: true },
  { Icon: MailIcon, label: 'Vice Mayor & Sangguniang Bayan email', value: LGU_CONTACT.sbEmail, href: `mailto:${LGU_CONTACT.sbEmail}`, mono: true },
  { Icon: ClockIcon, label: 'Office hours', value: LGU_CONTACT.officeHours, note: LGU_CONTACT.officeHoursNote },
];

/* The report form and the office directory each have their own page now (/report, /offices);
 * this page is the overview of how to reach the Municipal Hall and routes to both. */
const NEXT_ROUTES = [
  {
    to: '/report',
    Icon: MegaphoneIcon,
    title: 'Report a concern',
    detail: 'Damaged road, flooding, streetlight outage or another problem in your barangay. You get a reference number for follow-up.',
  },
  {
    to: '/offices',
    Icon: Building2Icon,
    title: 'Municipal offices',
    detail: 'Every municipal office, who heads it, and how to reach it.',
  },
];

export function Contact() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Contact the Municipal Hall"
        description="How to reach the Municipality of Magallanes by phone, email, or in person."
      />

      <section className="w-full py-14 lg:py-section" aria-label="Contact details">
        <div className="container-page grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          {/* ---- Municipal Hall ---- */}
          <div className="card overflow-hidden">
            <h2 className="border-b border-hairline bg-surface px-6 py-4 font-display text-lg font-bold text-brand-800">
              Municipal Hall
            </h2>
            <dl className="divide-y divide-hairline px-6">
              {HALL_DETAILS.map(({ Icon, label, value, note, href, mono }) => (
                <div key={label} className="flex gap-3.5 py-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="font-sans text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-ink-muted">
                      {label}
                    </dt>
                    <dd className={`mt-0.5 leading-relaxed text-ink ${mono ? 'break-all font-mono text-[0.875rem]' : 'text-[0.9375rem]'}`}>
                      {href ? (
                        <a href={href} className="transition-colors duration-150 hover:text-brand-600">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                    {note && <p className="mt-1 text-[0.8125rem] leading-snug text-ink-muted">{note}</p>}
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* ---- Where to go next ---- */}
          <div className="space-y-5">
            {/* Emergencies first: someone in one should never have to read past the
                regular channels to find out they are the wrong ones. */}
            <EmergencyHotlines lead={<><strong className="font-semibold text-alert-900">Emergency?</strong> Call right away:</>} />

            {NEXT_ROUTES.map(({ to, Icon, title, detail }) => (
              <Link key={to} to={to} className="card card-interactive group flex items-start gap-4 p-5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-brand-100"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
                    {title}
                    <ArrowRightIcon
                      className="h-4 w-4 transition-transform duration-150 ease-gov group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1 block text-[0.875rem] leading-relaxed text-ink-muted">{detail}</span>
                </span>
              </Link>
            ))}

            <p className="px-1 text-[0.875rem] leading-relaxed text-ink-muted">
              Questions about permits, clearances, officials or office hours? Open the{' '}
              <span className="font-semibold text-brand-700">Ask Bitoy</span> chat at the bottom of the page — it
              answers in English or Bisaya.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
