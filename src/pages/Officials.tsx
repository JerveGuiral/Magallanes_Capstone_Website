import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { adminService, type OfficialItem } from '../services/adminService';

type GroupKey = 'Executive' | 'Sangguniang Bayan' | 'Department Heads';

const GROUPS: { key: GroupKey; title: string; eyebrow: string; description: string }[] = [
  {
    key: 'Executive',
    title: 'Executive',
    eyebrow: 'Elected officials',
    description: 'The Municipal Mayor heads the executive branch; the Vice Mayor presides over the Sangguniang Bayan.',
  },
  {
    key: 'Sangguniang Bayan',
    title: 'Sangguniang Bayan',
    eyebrow: 'Legislative council',
    description: 'Elected councillors enact municipal ordinances and approve the annual budget.',
  },
  {
    key: 'Department Heads',
    title: 'Department heads',
    eyebrow: 'Appointed officials',
    description: 'Appointed officials accountable for day-to-day municipal operations and frontline services.',
  },
];

// The officials table has no "group" column, so the executive / SB / department split is
// inferred from the position title — matches how LGU position names are conventionally phrased.
function groupOf(position: string): GroupKey {
  const p = position.toLowerCase();
  if (p.includes('mayor')) return 'Executive';
  if (p.includes('sb member') || p.includes('sangguniang') || p.includes('councilor') || p.includes('kagawad')) {
    return 'Sangguniang Bayan';
  }
  return 'Department Heads';
}

/** "Hon. Isidro C. Villanueva" → "IV". Skips honorifics and middle initials. */
function initialsOf(fullName: string): string {
  const parts = fullName
    .replace(/\b(hon|atty|engr|dr|arch|cpa)\.?\s*/gi, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && /[a-z]/i.test(w));
  if (parts.length === 0) return '—';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/**
 * Portrait, or a lettered monogram when no photo has been uploaded.
 * Replaces the previous grey box containing the literal word "Photo", which
 * read as a broken image rather than an intentional placeholder.
 */
function Portrait({ official, size }: { official: OfficialItem; size: 'lg' | 'sm' }) {
  const dims = size === 'lg' ? 'h-28 w-24' : 'h-12 w-12';
  const type = size === 'lg' ? 'text-2xl' : 'text-sm';

  if (official.photo_url) {
    return (
      <img
        src={official.photo_url}
        alt={`Official portrait of ${official.full_name}`}
        loading="lazy"
        className={`${dims} shrink-0 rounded-md object-cover object-top ring-1 ring-hairline`}
      />
    );
  }

  return (
    <span
      className={`${dims} ${type} grid shrink-0 place-items-center rounded-md bg-brand-50 font-display font-bold tracking-[0.04em] text-brand-600 ring-1 ring-brand-100`}
      role="img"
      aria-label={`No portrait on file for ${official.full_name}`}
    >
      {initialsOf(official.full_name)}
    </span>
  );
}

export function Officials() {
  const [officials, setOfficials] = React.useState<OfficialItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    adminService.getOfficials().then(({ data }) => {
      if (mounted) {
        setOfficials((data || []).filter((o) => o.is_current));
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const executive = officials.filter((o) => groupOf(o.position) === 'Executive');

  return (
    <>
      <PageHeader
        eyebrow="City Officials"
        title="Municipal officials"
        description="Elected and appointed officials of the Municipality of Magallanes, with the offices they are accountable for."
      />

      {loading && (
        <section className="w-full py-14">
          <div className="container-page grid gap-6 md:grid-cols-2">
            <div className="card flex gap-5 p-6">
              <div className="skeleton h-28 w-24 shrink-0 rounded-md" />
              <div className="flex-1">
                <div className="skeleton h-5 w-44" />
                <div className="skeleton mt-3 h-3.5 w-32" />
                <div className="skeleton mt-4 h-2.5 w-24" />
              </div>
            </div>
            <div className="card flex gap-5 p-6">
              <div className="skeleton h-28 w-24 shrink-0 rounded-md" />
              <div className="flex-1">
                <div className="skeleton h-5 w-44" />
                <div className="skeleton mt-3 h-3.5 w-32" />
                <div className="skeleton mt-4 h-2.5 w-24" />
              </div>
            </div>
          </div>
        </section>
      )}

      {!loading && officials.length === 0 && (
        <section className="w-full py-14">
          <div className="container-page">
            <p className="rounded-lg border border-dashed border-hairline bg-white p-10 text-center text-sm text-ink-muted">
              No officials posted yet.
            </p>
          </div>
        </section>
      )}

      {executive.length > 0 && (
        <section className="w-full py-14 lg:py-section" aria-labelledby="executive-title">
          <div className="container-page">
            <div id="executive-title">
              <SectionHeading eyebrow={GROUPS[0].eyebrow} title={GROUPS[0].title} description={GROUPS[0].description} />
            </div>

            <ul className="mt-9 grid gap-6 md:grid-cols-2">
              {executive.map((o, i) => (
                <Reveal as="li" key={o.id} delay={i * 0.04}>
                  <div className="card relative h-full overflow-hidden p-6">
                    {/* Brass rail marks the executive tier without a second colour. */}
                    <span className="absolute inset-y-0 left-0 w-1 bg-accent-600" aria-hidden="true" />
                    <div className="flex gap-5 pl-2">
                      <Portrait official={o} size="lg" />
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-bold leading-snug text-brand-800">{o.full_name}</h3>
                        <p className="mt-1 font-display text-[0.9375rem] font-semibold text-brand-600">{o.position}</p>
                        {o.term_start && (
                          <p className="mt-3 inline-flex rounded-full bg-surface px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-wider text-ink-muted">
                            Term {new Date(o.term_start).getFullYear()}
                            {o.term_end ? `–${new Date(o.term_end).getFullYear()}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {officials.length > 0 && <MotifDivider />}

      {GROUPS.slice(1).map((group) => {
        const members = officials.filter((o) => groupOf(o.position) === group.key);
        if (members.length === 0) return null;
        const headingId = `group-${group.key.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <section key={group.key} className="w-full py-14 lg:py-section" aria-labelledby={headingId}>
            <div className="container-page">
              <div id={headingId}>
                <SectionHeading eyebrow={group.eyebrow} title={group.title} description={group.description} />
              </div>

              <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((o, i) => (
                  <Reveal as="li" key={o.id} delay={Math.min(i, 8) * 0.03}>
                    <div className="card flex h-full items-center gap-4 p-4 transition-colors duration-150 hover:border-brand-300">
                      <Portrait official={o} size="sm" />
                      <div className="min-w-0">
                        <h3 className="font-display text-[0.9375rem] font-bold leading-snug text-brand-800">
                          {o.full_name}
                        </h3>
                        <p className="mt-1 text-[0.8125rem] leading-snug text-ink-muted">{o.position}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </>
  );
}
