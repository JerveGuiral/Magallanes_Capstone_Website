import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { Picture, SealImage } from '../components/ui/Picture';
import { adminService, type OfficialItem } from '../services/adminService';

type GroupKey = 'Executive' | 'Sangguniang Bayan' | 'Department Heads';

const GROUPS: { key: GroupKey; title: string; description: string }[] = [
  {
    key: 'Executive',
    title: 'Executive',
    description: 'The Municipal Mayor heads the executive branch; the Vice Mayor presides over the Sangguniang Bayan.',
  },
  {
    key: 'Sangguniang Bayan',
    title: 'Sangguniang Bayan',
    description: 'The municipal council, which passes ordinances and approves the annual budget.',
  },
  {
    key: 'Department Heads',
    title: 'Department heads',
    description: 'Appointed heads of the municipal offices.',
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

/** "Hon. Reynaldo T. Salon" → "RS", "Hon. Cesar C. Cumba, Jr." → "CC". Skips honorifics,
 * middle initials and name suffixes. */
function initialsOf(fullName: string): string {
  const parts = fullName
    .replace(/\b(hon|atty|engr|enp|dr|arch|cpa)\.?\s*/gi, '')
    .split(/[\s,]+/)
    .filter((w) => w.length > 1 && /[a-z]/i.test(w) && !/^(jr|sr|ii|iii|iv)\.?$/i.test(w));
  if (parts.length === 0) return '—';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/* Placeholder tones — the hall's rose, the roof's green, the bunting's gold and the seal's
 * sky — picked from the name, so the same person always gets the same colour and a row of
 * placeholders never reads as one repeated grey block. */
const PORTRAIT_TONES = [
  'from-brand-100 to-brand-200 text-brand-700',
  'from-accent-50 to-accent-200 text-accent-800',
  'from-fiesta-50 to-fiesta-200 text-fiesta-700',
  'from-sky-50 to-sky-200 text-sky-700',
];
const toneOf = (name: string) => PORTRAIT_TONES[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % PORTRAIT_TONES.length];

/**
 * Portrait, or a designed monogram until a photo is uploaded in Admin → Officials (which
 * fills `photo_url`; the photo then replaces the monogram with no code change). The
 * monogram sits on a soft tone with the municipal seal faded behind it, so it reads as
 * intentional rather than as a missing image.
 */
function Portrait({ official, size }: { official: OfficialItem; size: 'lg' | 'sm' }) {
  const dims = size === 'lg' ? 'h-36 w-32 rounded-2xl' : 'h-14 w-14 rounded-xl';
  const type = size === 'lg' ? 'text-4xl' : 'text-base';
  const frame = size === 'lg' ? 'ring-4 ring-white shadow-raised' : 'ring-2 ring-white shadow-subtle';

  if (official.photo_url) {
    return (
      <img
        src={official.photo_url}
        alt={`Official portrait of ${official.full_name}`}
        loading="lazy"
        className={`${dims} ${frame} shrink-0 object-cover object-top`}
      />
    );
  }

  return (
    <span
      className={`${dims} ${type} ${frame} relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br font-display font-bold tracking-[0.04em] ${toneOf(official.full_name)}`}
      role="img"
      aria-label={`No portrait on file for ${official.full_name}`}
    >
      <SealImage className={`absolute object-contain opacity-[0.12] ${size === 'lg' ? '-bottom-4 -right-4 h-24 w-24' : '-bottom-2 -right-2 h-9 w-9'}`} />
      <span className="relative">{initialsOf(official.full_name)}</span>
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
        // Former officials (is_current = false) are kept for the chatbot's history answers,
        // not listed on this page.
        setOfficials((data || []).filter((o) => o.is_current));
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Mayor first, then Vice Mayor, whatever order the table returns them in.
  const executive = officials
    .filter((o) => groupOf(o.position) === 'Executive')
    .sort((a, b) => Number(/vice/i.test(a.position)) - Number(/vice/i.test(b.position)));

  return (
    <>
      <PageHeader
        image="municipal-hall-2"
        eyebrow="Municipal Officials"
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
              <SectionHeading title={GROUPS[0].title} description={GROUPS[0].description} />
            </div>

            <ul className="mt-9 grid gap-6 md:grid-cols-2">
              {executive.map((o, i) => (
                <Reveal as="li" key={o.id} delay={i * 0.04}>
                  <article className="card relative h-full overflow-hidden">
                    {/* The same Municipal Hall photograph behind both leaders, so the pair reads as a set. */}
                    <div className="relative h-32 overflow-hidden">
                      <Picture
                        name="municipal-hall-1"
                        alt=""
                        sizes="(min-width: 768px) 40vw, 100vw"
                        className="block h-full w-full"
                        imgClassName="h-full w-full object-cover"
                        style={{ objectPosition: 'center 40%' }}
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-800/30 to-brand-700/10" aria-hidden="true" />
                      <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-brand-700">
                        {/vice/i.test(o.position) ? 'Legislative' : 'Executive'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-5">
                      {/* relative + z-10: an uploaded photo is a plain <img>, which would otherwise
                          paint underneath the positioned banner and lose its top half. */}
                      <div className="relative z-10 -mt-16 shrink-0">
                        <Portrait official={o} size="lg" />
                      </div>
                      <div className="min-w-0 pb-1">
                        <h3 className="font-display text-[1.375rem] font-bold leading-snug text-brand-800">{o.full_name}</h3>
                        <p className="mt-1 font-sans text-[0.9375rem] font-semibold text-brand-600">{o.position}</p>
                        {o.term_start && (
                          <p className="mt-3 inline-flex rounded-full bg-fiesta-100 px-3 py-1 text-[0.75rem] font-semibold tabular-nums text-fiesta-700">
                            Term {new Date(o.term_start).getFullYear()}
                            {o.term_end ? `–${new Date(o.term_end).getFullYear()}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
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
                <SectionHeading title={group.title} description={group.description} />
              </div>

              <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((o, i) => (
                  <Reveal as="li" key={o.id} delay={Math.min(i, 8) * 0.03}>
                    <div className="card card-interactive flex h-full items-center gap-4 p-4">
                      <Portrait official={o} size="sm" />
                      <div className="min-w-0">
                        <h3 className="font-sans text-[0.9375rem] font-bold leading-snug text-brand-800">
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
