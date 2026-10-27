import React from 'react';
import { FacebookIcon, YoutubeIcon, InstagramIcon } from 'lucide-react';
import { SOCIAL_LINKS, type SocialLink } from '../../data/site';

const ICONS: Record<SocialLink['label'], React.ComponentType<{ className?: string }>> = {
  Facebook: FacebookIcon,
  YouTube: YoutubeIcon,
  Instagram: InstagramIcon,
};

type Variant = 'nav' | 'footer' | 'light';

/**
 * The municipality's social channels.
 *
 * One component for all three placements — the navigation bar, the mobile menu
 * and the footer — so a new account is added in `site.ts` and appears
 * everywhere at once.
 *
 * Accounts with no URL yet render as a dimmed `<span>`, never an `<a>`. There
 * is no href for a keyboard user to land on and `aria-disabled` plus the title
 * explains why, rather than shipping an icon that looks clickable and is not.
 */
export function SocialLinks({ variant = 'nav', className = '' }: { variant?: Variant; className?: string }) {
  const footer = variant === 'footer';
  const light = variant === 'light';

  const box = footer
    ? 'grid h-9 w-9 place-items-center rounded-full border'
    : 'grid h-8 w-8 place-items-center rounded-md';
  const icon = footer ? 'h-4 w-4' : 'h-4 w-4';

  const live = footer
    ? 'border-hairline bg-white text-brand-700 transition-colors duration-150 hover:border-brand-400 hover:text-brand-900'
    : light
      ? 'text-brand-700 transition-colors duration-150 hover:bg-brand-100 hover:text-brand-900'
      : 'text-brand-200 transition-colors duration-150 hover:bg-white/10 hover:text-white';
  const pending = footer
    ? 'border-hairline bg-white/60 text-brand-700/35 cursor-not-allowed'
    : light
      ? 'text-brand-700/35 cursor-not-allowed'
      : 'text-brand-200/35 cursor-not-allowed';

  return (
    <ul className={`flex items-center ${footer ? 'gap-2.5' : 'gap-1'} ${className}`} aria-label="Follow the Municipality of Magallanes">
      {SOCIAL_LINKS.map(({ label, href }) => {
        const Icon = ICONS[label];

        if (!href) {
          return (
            <li key={label}>
              <span
                role="img"
                aria-disabled="true"
                aria-label={`${label} — not yet available`}
                title={`The Magallanes LGU ${label} account is not yet available`}
                className={`${box} ${pending}`}
              >
                <Icon className={icon} />
              </span>
            </li>
          );
        }

        return (
          <li key={label}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${box} ${live}`}
              aria-label={`Magallanes LGU on ${label} (opens in a new tab)`}
            >
              <Icon className={icon} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
