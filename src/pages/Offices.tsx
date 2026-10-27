import React from 'react';
import { Link } from 'react-router-dom';
import { Building2Icon, UserIcon, MapPinIcon, PhoneIcon, MailIcon, ClockIcon, ArrowRightIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Reveal } from '../components/Reveal';
import { adminService, type OfficeItem } from '../services/adminService';
import { LGU_CONTACT } from '../data/site';

/** "0948-623-6977" → "tel:+639486236977" (Philippine local format to international). */
function telHref(number: string) {
  const digits = number.replace(/\D/g, '');
  return `tel:${digits.startsWith('0') ? `+63${digits.slice(1)}` : digits}`;
}

const hasContact = (o: OfficeItem) => Boolean(o.contact_number || o.email);

/* Offices people can actually reach come first (the Mayor's Office and the Sangguniang Bayan),
 * then the rest alphabetically. A plain A–Z list buried the Mayor's Office near the bottom. */
function byReachability(a: OfficeItem, b: OfficeItem) {
  if (hasContact(a) !== hasContact(b)) return hasContact(a) ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function OfficeCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton mt-3 h-3.5 w-1/2" />
      <div className="skeleton mt-5 h-3 w-2/3" />
    </div>
  );
}

export function Offices() {
  const [offices, setOffices] = React.useState<OfficeItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    adminService.getOffices().then(({ data }) => {
      if (mounted) {
        setOffices([...(data || [])].sort(byReachability));
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
        eyebrow="Municipal Offices"
        title="Municipal offices"
        description="The offices of the Municipality of Magallanes, who heads each one, and how to reach them."
      />

      <section className="w-full py-14 lg:py-section" aria-label="Office directory">
        <div className="container-page">
          {/* Most offices have no published direct line yet, so how to reach them is said once,
              up front — not repeated as a dash or a note on every card. */}
          <div className="mb-9 flex flex-col gap-4 rounded-xl border border-brand-100 bg-brand-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.9375rem] leading-relaxed text-ink">
              <span className="font-semibold text-brand-800">Most offices have no direct line yet.</span> Visit them at
              the Municipal Hall, or call the Mayor's Office at{' '}
              <a href={LGU_CONTACT.phoneHref} className="whitespace-nowrap font-mono font-semibold text-brand-600 hover:text-brand-800">
                {LGU_CONTACT.phone}
              </a>{' '}
              and they will point you to the right office.
            </p>
            <Link to="/report" className="btn btn-primary shrink-0">
              Report a concern
              <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>
                  <OfficeCardSkeleton />
                </li>
              ))}
            </ul>
          ) : offices.length === 0 ? (
            <p className="rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
              No office directory posted yet.
            </p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offices.map((o, i) => (
                <Reveal as="li" key={o.id} delay={Math.min(i, 8) * 0.03}>
                  <article className="card flex h-full flex-col p-5">
                    <div className="flex items-start gap-3">
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600"
                        aria-hidden="true"
                      >
                        <Building2Icon className="h-5 w-5" />
                      </span>
                      <h2 className="font-display text-[1.0625rem] font-bold leading-snug text-brand-800">{o.name}</h2>
                    </div>

                    <dl className="mt-4 space-y-2 text-[0.875rem] text-ink">
                      {o.head_name && (
                        <div className="flex gap-2.5">
                          <dt className="sr-only">Head of office</dt>
                          <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                          <dd>{o.head_name}</dd>
                        </div>
                      )}
                      {o.location && (
                        <div className="flex gap-2.5">
                          <dt className="sr-only">Location</dt>
                          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                          <dd>{o.location}</dd>
                        </div>
                      )}
                      {o.office_hours && (
                        <div className="flex gap-2.5">
                          <dt className="sr-only">Office hours</dt>
                          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                          <dd>{o.office_hours}</dd>
                        </div>
                      )}
                    </dl>

                    {/* Wrapper pins the contacts to the card bottom (mt-auto) while pt-4 keeps a
                        gap above the rule on the tallest card in a row. */}
                    {hasContact(o) && (
                      <div className="mt-auto pt-4">
                        <ul className="space-y-1.5 border-t border-hairline pt-4 text-[0.8125rem]">
                          {o.contact_number && (
                            <li className="flex items-center gap-2">
                              <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                              <a href={telHref(o.contact_number)} className="font-mono text-brand-600 hover:text-brand-800">
                                {o.contact_number}
                              </a>
                            </li>
                          )}
                          {o.email && (
                            <li className="flex items-center gap-2">
                              <MailIcon className="h-3.5 w-3.5 shrink-0 text-brand-600" aria-hidden="true" />
                              <a
                                href={`mailto:${o.email}`}
                                className="font-mono text-brand-600 [overflow-wrap:anywhere] hover:text-brand-800"
                              >
                                {o.email}
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </article>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
