import React from 'react';
import { InfoIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { MunicipalMap } from '../components/home/MunicipalMap';
import { adminService, type BarangayItem } from '../services/adminService';

export function Barangays() {
  const [barangays, setBarangays] = React.useState<BarangayItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    adminService.getBarangays().then(({ data }) => {
      if (mounted) {
        setBarangays(data || []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const totalPopulation = barangays.reduce((sum, b) => sum + (b.population || 0), 0);
  const largest = barangays.reduce<BarangayItem | null>(
    (max, b) => ((b.population || 0) > (max?.population || 0) ? b : max),
    null
  );

  const stats = [
    { label: 'Barangays', value: barangays.length ? String(barangays.length) : '—' },
    { label: 'Total population', value: totalPopulation ? totalPopulation.toLocaleString() : '—' },
    { label: 'Largest barangay', value: largest?.name || '—' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Barangays"
        title="The barangays of Magallanes"
        description="Barangay officials, population and contact details as maintained by the Municipal Hall."
      />

      <section className="w-full py-14 lg:py-section" aria-labelledby="barangay-table-title">
        <div className="container-page">
          {/* ---- Summary figures ---- */}
          <dl className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="card p-5">
                <dt className="font-sans text-eyebrow uppercase text-ink-muted">{s.label}</dt>
                <dd className="mt-2 font-display text-display-md font-extrabold tracking-[-0.02em] text-brand-800">
                  {loading ? <span className="skeleton block h-8 w-24" /> : s.value}
                </dd>
              </div>
            ))}
          </dl>

          <h2 id="barangay-table-title" className="mt-12 font-display text-display-md text-brand-800">
            Barangay directory
          </h2>
          <span className="mt-3 block h-[3px] w-12 rounded-full bg-accent-600" aria-hidden="true" />

          {loading ? (
            <div className="mt-6 card overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 border-b border-hairline p-4 last:border-b-0">
                  <div className="skeleton h-4 w-32" />
                  <div className="skeleton h-3 w-44" />
                  <div className="skeleton ml-auto h-3 w-16" />
                </div>
              ))}
            </div>
          ) : barangays.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
              No barangay records posted yet.
            </p>
          ) : (
            <>
              {/* Phones get one card per barangay instead of a four-column table
                  that would need sideways scrolling to reach the phone number. */}
              <ul className="mt-6 grid grid-cols-1 gap-3 sm:hidden">
                {barangays.map((b) => (
                  <li key={b.id} className="card p-4">
                    <p className="font-sans text-[1rem] font-bold text-brand-800">{b.name}</p>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.875rem]">
                      <dt className="text-ink-muted">Punong Barangay</dt>
                      <dd className="text-ink">{b.captain_name || '—'}</dd>
                      <dt className="text-ink-muted">Population</dt>
                      <dd className="font-mono text-ink">{b.population != null ? b.population.toLocaleString() : '—'}</dd>
                      <dt className="text-ink-muted">Contact</dt>
                      <dd className="font-mono">
                        {b.contact_number ? (
                          <a href={`tel:${b.contact_number.replace(/[^\d+]/g, '')}`} className="text-brand-600 underline underline-offset-2">
                            {b.contact_number}
                          </a>
                        ) : (
                          <span className="text-ink">—</span>
                        )}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ul>
              <div className="mt-6 hidden overflow-x-auto rounded-lg border border-hairline bg-white shadow-subtle sm:block">
                <table className="w-full min-w-[40rem] border-collapse text-left">
                  <caption className="sr-only">
                    Barangays of Magallanes with punong barangay, population and contact information
                  </caption>
                  <thead>
                    <tr className="bg-brand-50 text-brand-800">
                      <th scope="col" className="px-5 py-3.5 font-sans text-eyebrow uppercase">
                        Barangay
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-sans text-eyebrow uppercase">
                        Punong Barangay
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-right font-sans text-eyebrow uppercase">
                        Population
                      </th>
                      <th scope="col" className="px-5 py-3.5 font-sans text-eyebrow uppercase">
                        Contact
                      </th>
                    </tr>
                  </thead>
                  {/* Zebra striping: twelve rows of similar-length names are easy to
                      lose your place in when scanning across to a phone number. */}
                  <tbody className="divide-y divide-hairline">
                    {barangays.map((b) => (
                      <tr key={b.id} className="transition-colors duration-150 odd:bg-white even:bg-surface hover:bg-brand-50">
                        <th scope="row" className="px-5 py-3.5 font-sans text-[0.9375rem] font-bold text-brand-800">
                          {b.name}
                        </th>
                        <td className="px-5 py-3.5 text-[0.9375rem] text-ink">{b.captain_name || '—'}</td>
                        <td className="px-5 py-3.5 text-right font-mono text-[0.875rem] text-ink">
                          {b.population != null ? b.population.toLocaleString() : '—'}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[0.8125rem] text-ink-muted">{b.contact_number || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="mt-5 flex max-w-2xl gap-2.5 rounded-md border border-brand-100 bg-brand-50 p-4 text-[0.875rem] leading-relaxed text-ink">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
            <span>
              Need a barangay certificate? Coordinate first with your barangay hall — the municipality only issues
              certifications that require municipal records.
            </span>
          </p>
        </div>
      </section>

      <div className="border-t border-hairline bg-surface-muted">
        <MunicipalMap
          title="Where the barangays are"
          description="Tap a pin or a name to see the punong barangay, the distance from the Municipal Hall, and directions."
          showDirectoryLink={false}
        />
      </div>
    </>
  );
}
