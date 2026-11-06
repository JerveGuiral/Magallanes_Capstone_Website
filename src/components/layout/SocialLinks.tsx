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
 * Accounts with no URL yet are not shown at all: a dimmed icon that does
 * nothing reads as a broken link to a visitor.
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

  return (
    <ul className={`flex items-center ${footer ? 'gap-2.5' : 'gap-1'} ${className}`} aria-label="Follow the Municipality of Magallanes">
      {SOCIAL_LINKS.map(({ label, href }) => {
        const Icon = ICONS[label];

        // No account yet: show nothing. Dimmed placeholder icons read as broken links.
        if (!href) return null;

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
