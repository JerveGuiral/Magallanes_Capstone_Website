import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { SectionHeading } from '../components/ui/SectionHeading';
import { MotifDivider } from '../components/ui/MotifDivider';
import { Reveal } from '../components/Reveal';
import { OFFICIALS, type Official } from '../data/government';
import { supabaseAdmin } from '../admin/services/supabaseAdminService';

const GROUPS: { key: Official['group']; title: string; eyebrow: string; description: string; }[] = [
  {
    key: 'Executive',
    title: 'Executive',
    eyebrow: 'Elected 2025–2028',
    description: 'The Municipal Mayor heads the executive branch; the Vice Mayor presides over the Sangguniang Bayan.'
  },
  {
    key: 'Sangguniang Bayan',
    title: 'Sangguniang Bayan',
    eyebrow: 'Legislative council',
    description: 'Eight elected councillors enact municipal ordinances and approve the annual budget.'
  },
  {
    key: 'Department Heads',
    title: 'Department heads',
    eyebrow: 'Appointed officials',
    description: 'Appointed officials accountable for day-to-day municipal operations and frontline services.'
  }];


export function Officials() {
  const [dynamicOfficials, setDynamicOfficials] = React.useState<any[]>(OFFICIALS);

  React.useEffect(() => {
    supabaseAdmin.getOfficials().then((data) => {
      if (data && data.length > 0) {
        const active = data.filter((o) => o.is_current);
        const mapped = active.map((o) => {
          let group: Official['group'] = 'Department Heads';
          const pos = (o.position || '').toLowerCase();
          if (pos.includes('mayor')) {
            group = 'Executive';
          } else if (pos.includes('sb') || pos.includes('councillor') || pos.includes('member')) {
            group = 'Sangguniang Bayan';
          }
          const term = o.term_start && o.term_end ? `${o.term_start.split('-')[0]}–${o.term_end.split('-')[0]}` : undefined;
          return {
            name: o.full_name,
            post: o.position,
            group,
            term,
            photo_url: o.photo_url,
          };
        });
        setDynamicOfficials(mapped);
      }
    });
  }, []);

  const executive = dynamicOfficials.filter((o) => o.group === 'Executive');

  return (
    <>
      <PageHeader
        eyebrow="City Officials"
        title="Municipal officials"
        description="Elected and appointed officials of the Municipality of Magallanes, with the offices they are accountable for." />


      <section className="w-full py-12" aria-labelledby="executive-title">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
          <div id="executive-title">
            <SectionHeading eyebrow={GROUPS[0].eyebrow} title={GROUPS[0].title} description={GROUPS[0].description} />
          </div>

          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {executive.map((o, i) =>
              <Reveal as="li" key={o.name} delay={i * 0.04}>
                <div className="flex h-full gap-5 border border-hairline bg-white p-6">
                  {o.photo_url ? (
                    <img src={o.photo_url} alt={o.name} className="h-24 w-20 shrink-0 object-cover rounded border border-hairline" />
                  ) : (
                    <span
                      className="grid h-24 w-20 shrink-0 place-items-center bg-navy-50 font-mono text-[10px] uppercase tracking-wider text-navy"
                      role="img"
                      aria-label={`Official portrait of ${o.name}`}>

                      Photo
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-display text-xl font-bold leading-snug text-navy">{o.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-teal">{o.post}</p>
                    {o.term &&
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">
                        Term {o.term}
                      </p>
                    }
                    <span className="mt-4 block h-[3px] w-10 bg-gold" aria-hidden="true" />
                  </div>
                </div>
              </Reveal>
            )}
          </ul>
        </div>
      </section>

      <MotifDivider />

      {GROUPS.slice(1).map((group) => {
        const members = dynamicOfficials.filter((o) => o.group === group.key);
        const headingId = `group-${group.key.replace(/\s+/g, '-').toLowerCase()}`;

        return (
          <section key={group.key} className="w-full py-12" aria-labelledby={headingId}>
            <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
              <div id={headingId}>
                <SectionHeading eyebrow={group.eyebrow} title={group.title} description={group.description} />
              </div>

              <ul className="mt-8 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
                {members.map((o) =>
                  <li key={o.name} className="bg-white p-5">
                    <h3 className="font-display text-base font-bold leading-snug text-navy">{o.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{o.post}</p>
                  </li>
                )}
              </ul>
            </div>
          </section>);

      })}
    </>);

}