import { Link } from 'react-router-dom';
import {
  ArrowUpRightIcon,
  BriefcaseIcon,
  Building2Icon,
  FileTextIcon,
  MegaphoneIcon,
  MessageSquareWarningIcon,
  PalmtreeIcon,
  ScrollTextIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from '../Reveal';
import { AdvisoryCard } from './AdvisoryCard';

type Tone = 'blue' | 'gold' | 'red' | 'green';
type Action = { to: string; label: string; hint: string; Icon: LucideIcon; tone: Tone };

/* The tones rotate through the seal's blue, gold, red and green —
 * so no two neighbours match in either a 2- or 4-column grid. */
const ACTIONS: Action[] = [
  { to: '/services', label: 'Business permits', hint: 'New and renewal', Icon: BriefcaseIcon, tone: 'blue' },
  { to: '/services', label: 'Clearance & cedula', hint: 'Barangay and community tax', Icon: FileTextIcon, tone: 'gold' },
  { to: '/services', label: 'Civil registry', hint: 'Birth, marriage, death', Icon: ScrollTextIcon, tone: 'red' },
  { to: '/officials', label: 'Officials', hint: 'Mayor, Vice Mayor, SB', Icon: UsersIcon, tone: 'green' },
  { to: '/offices', label: 'Offices', hint: 'Who handles what', Icon: Building2Icon, tone: 'red' },
  { to: '/news', label: 'News & notices', hint: 'Latest from the LGU', Icon: MegaphoneIcon, tone: 'green' },
  { to: '/tourism', label: 'Tourist spots', hint: 'Shrine, Bay Walk, delta', Icon: PalmtreeIcon, tone: 'blue' },
  { to: '/report', label: 'Report a concern', hint: 'Send it to the Municipal Hall', Icon: MessageSquareWarningIcon, tone: 'gold' },
];

/**
 * "What do you need today?" — one-tap shortcuts to the most common errands, on a white
 * panel lifted onto the bottom edge of the hero photograph. Any public advisory opens the
 * panel, ahead of the shortcuts.
 */
export function QuickActions() {
  return (
    <section className="relative w-full bg-surface-muted pb-14 lg:pb-16" aria-labelledby="quick-actions-title">
      <div className="container-page">
        <div className="relative z-10 -mt-20 rounded-3xl bg-white p-5 shadow-raised ring-1 ring-brand-100 sm:p-8 lg:-mt-24 lg:p-10">
          <AdvisoryCard inset />

          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
            <h2 id="quick-actions-title" className="text-display-md text-brand-800 sm:text-display-lg">
              What do you need today?
            </h2>
            <p className="text-[1.0625rem] italic text-brand-600" lang="ceb">
              Unsa&apos;y imong kinahanglan karon?
            </p>
          </div>

          {/* One column on the narrowest phones, two from 400px, four on desktop. */}
          <ul className="mt-7 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {ACTIONS.map(({ to, label, hint, Icon, tone }, i) => (
              <Reveal as="li" key={label} delay={i * 0.04}>
                <Link
                  to={to}
                  className="group relative flex h-full flex-row items-center gap-3 rounded-2xl border border-hairline bg-white p-4 transition-all duration-200 ease-gov hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow min-[400px]:flex-col min-[400px]:items-start sm:flex-row sm:items-center sm:p-5 lg:flex-col lg:items-start xl:flex-row xl:items-center"
                >
                  <span className={`icon-tile tone-${tone}`} aria-hidden="true">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 pr-4">
                    <span className="block font-sans text-[0.9375rem] font-bold leading-snug text-brand-800">{label}</span>
                    <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-muted">{hint}</span>
                  </span>
                  <ArrowUpRightIcon
                    className="absolute right-3 top-3 h-4 w-4 text-brand-300 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
