import { Link } from 'react-router-dom';
import {
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

type Action = { to: string; label: string; hint: string; Icon: LucideIcon };

/* One calm style for every tile — blue icon on a pale blue chip, turning
 * mangrove green on hover — so the grid reads as a set, not a rainbow. */
const ACTIONS: Action[] = [
  { to: '/services', label: 'Business permits', hint: 'New and renewal', Icon: BriefcaseIcon },
  { to: '/services', label: 'Clearance & cedula', hint: 'Barangay and community tax', Icon: FileTextIcon },
  { to: '/services', label: 'Civil registry', hint: 'Birth, marriage, death', Icon: ScrollTextIcon },
  { to: '/officials', label: 'Officials', hint: 'Mayor, Vice Mayor, SB', Icon: UsersIcon },
  { to: '/offices', label: 'Offices', hint: 'Who handles what', Icon: Building2Icon },
  { to: '/news', label: 'News & notices', hint: 'Latest from the LGU', Icon: MegaphoneIcon },
  { to: '/tourism', label: 'Tourist spots', hint: 'Shrine, Bay Walk, delta', Icon: PalmtreeIcon },
  { to: '/report', label: 'Report a concern', hint: 'Send it to the Municipal Hall', Icon: MessageSquareWarningIcon },
];

/** "What do you need today?" — one-tap shortcuts to the most common errands. */
export function QuickActions() {
  return (
    <section className="w-full bg-surface-muted py-14 lg:py-16" aria-labelledby="quick-actions-title">
      <div className="container-page">
        <h2 id="quick-actions-title" className="text-display-lg text-brand-800">
          What do you need today?
        </h2>
        <p className="mt-2 text-[1.0625rem] text-ink-muted">Unsa'y imong kinahanglan karon?</p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {ACTIONS.map(({ to, label, hint, Icon }, i) => (
            <Reveal as="li" key={label} delay={i * 0.03}>
              <Link
                to={to}
                className="group flex h-full flex-col gap-3 rounded-xl border border-hairline bg-white p-4 shadow-subtle transition-all duration-150 ease-gov hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-raised sm:flex-row sm:items-center sm:p-5"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-150 group-hover:bg-accent-100 group-hover:text-accent-800"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-sans text-[0.9375rem] font-bold leading-snug text-brand-800">{label}</span>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-muted">{hint}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
