import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { BARANGAYS, type Barangay } from '../data/site';
import { supabaseAdmin } from '../admin/services/supabaseAdminService';

const FILTERS = ['All', 'Coastal', 'Upland', 'Poblacion'] as const;

const CLASS_STYLES: Record<Barangay['classification'], string> = {
  Coastal: 'border-teal-200 bg-teal-50 text-teal-900',
  Upland: 'border-navy-200 bg-navy-50 text-navy-900',
  Poblacion: 'border-gold-600 bg-gold-100 text-ink'
};

export function Barangays() {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>('All');
  const [dynamicBarangays, setDynamicBarangays] = React.useState<Barangay[]>(BARANGAYS);

  React.useEffect(() => {
    supabaseAdmin.getBarangays().then((data) => {
      if (data && data.length > 0) {
        const mapped: Barangay[] = data.map((b) => {
          let classification: Barangay['classification'] = 'Coastal';
          const nameLower = b.name.toLowerCase();
          if (nameLower.includes('poblacion')) classification = 'Poblacion';
          else if (nameLower.includes('taod') || nameLower.includes('marcos') || nameLower.includes('rosario')) classification = 'Upland';

          return {
            name: b.name.startsWith('Barangay') ? b.name : b.name,
            captain: b.captain_name || 'Hon. Punong Barangay',
            classification,
            households: b.population ? Math.round(b.population / 4.5) : 350,
          };
        });
        setDynamicBarangays(mapped);
      }
    });
  }, []);

  const rows = filter === 'All' ? dynamicBarangays : dynamicBarangays.filter((b) => b.classification === filter);
  const households = rows.reduce((sum, b) => sum + b.households, 0);

  return (
    <>
      <PageHeader
        eyebrow="Barangays"
        title="The 12 barangays of Magallanes"
        description="Barangay officials, household counts and geographic classification. Household figures are drawn from the 2024 Community-Based Monitoring System." />


      <section className="w-full py-12" aria-labelledby="barangay-table-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by classification">
              {FILTERS.map((f) =>
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 ${filter === f ?
                      'border-navy bg-navy text-white' :
                      'border-hairline bg-white text-ink-muted hover:border-teal hover:text-teal'}`
                  }>

                  {f}
                </button>
              )}
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">
              {rows.length} barangays · {households.toLocaleString()} households
            </p>
          </div>

          <h2 id="barangay-table-title" className="sr-only">
            Barangay directory
          </h2>

          <div className="mt-6 overflow-x-auto border border-hairline bg-white">
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="sr-only">
                Barangays of Magallanes with punong barangay, household count and classification
              </caption>
              <thead>
                <tr className="bg-navy text-white">
                  <th scope="col" className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                    Barangay
                  </th>
                  <th scope="col" className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                    Punong Barangay
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-mono text-[11px] uppercase tracking-[0.14em]">
                    Households
                  </th>
                  <th scope="col" className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em]">
                    Classification
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rows.map((b) =>
                  <tr key={b.name} className="transition-colors duration-150 hover:bg-surface">
                    <th scope="row" className="px-5 py-3.5 font-display text-base font-bold text-navy">
                      {b.name}
                    </th>
                    <td className="px-5 py-3.5 text-sm text-ink">{b.captain}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-sm text-ink">
                      {b.households.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${CLASS_STYLES[b.classification]}`
                        }>

                        {b.classification}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            Need a barangay certificate? Coordinate first with your barangay hall — the municipality only issues
            certifications that require municipal records.
          </p>
        </div>
      </section>
    </>);

}