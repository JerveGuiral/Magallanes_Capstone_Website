import React from 'react';
import { MinusIcon, PlusIcon, ClockIcon } from 'lucide-react';
import { SocialLinks } from './SocialLinks';
import { SITE } from '../../data/site';

const PST_DATE = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const PST_TIME = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', hour: 'numeric', minute: '2-digit' });

/**
 * Philippine Standard Time, as government websites show it (DICT's government website
 * template). The date is dropped on small screens; the time always shows.
 */
function PhilippineTime() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time dateTime={now.toISOString()} className="flex shrink-0 items-center gap-1.5">
      <ClockIcon className="h-3.5 w-3.5 shrink-0 text-accent-600" aria-hidden="true" />
      <span className="whitespace-nowrap">
        <span className="font-semibold">
          <span className="hidden sm:inline">Philippine Standard Time:</span>
          <span className="sm:hidden" aria-hidden="true">PST</span>
        </span>{' '}
        <span className="hidden md:inline">{PST_DATE.format(now)}, </span>
        {PST_TIME.format(now)}
      </span>
    </time>
  );
}

const MIN_SCALE = 0.9;
const MAX_SCALE = 1.3;
const STEP = 0.1;
const STORAGE_KEY = 'magallanes_text_scale';

function applyScale(scale: number) {
  document.documentElement.style.setProperty('--text-scale', String(scale));
  try {
    localStorage.setItem(STORAGE_KEY, String(scale));
  } catch {
    // localStorage may be unavailable (private browsing) — scale still applies for this visit
  }
}

/**
 * Government utility strip: Philippine Standard Time on the left, accessibility and channels
 * on the right. Until the LGU adopts the site (VITE_OFFICIAL_SITE), it also says plainly that
 * this is a capstone project, so nobody mistakes it for the official website.
 */
export function UtilityBar() {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (saved && saved >= MIN_SCALE && saved <= MAX_SCALE) {
        setScale(saved);
        applyScale(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const adjust = (delta: number) => {
    const next = Math.round(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta)) * 100) / 100;
    setScale(next);
    applyScale(next);
  };

  const stepBtn =
    'grid h-6 w-6 place-items-center rounded text-brand-700 transition-colors duration-150 hover:bg-brand-100 hover:text-brand-900 disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="w-full border-b border-hairline bg-surface-muted text-brand-800">
      <div className="container-page flex items-center justify-between gap-4 py-2">
        <div className="flex min-w-0 items-center gap-3 text-[0.6875rem] leading-tight tracking-[0.02em]">
          <PhilippineTime />
          {!SITE.official && (
            <span className="shrink-0 rounded-full border border-brand-200 bg-white px-2 py-0.5 font-semibold text-brand-700">
              Capstone project<span className="hidden lg:inline"> · not yet the official LGU website</span>
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-1" role="group" aria-label="Adjust text size">
            <button
              type="button"
              onClick={() => adjust(-STEP)}
              disabled={scale <= MIN_SCALE}
              className={stepBtn}
              aria-label="Decrease text size"
            >
              <MinusIcon className="h-3 w-3" aria-hidden="true" />
            </button>
            <span className="select-none px-0.5 font-sans text-[0.625rem] font-bold uppercase tracking-[0.1em]" aria-hidden="true">
              A
            </span>
            <button
              type="button"
              onClick={() => adjust(STEP)}
              disabled={scale >= MAX_SCALE}
              className={stepBtn}
              aria-label="Increase text size"
            >
              <PlusIcon className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          {/* The navigation bar carries these from lg up; below that there is no
              nav bar, so the strip keeps them reachable — except on the narrowest phones,
              where the time and the capstone notice need the room (the footer has them). */}
          <span className="hidden h-4 w-px bg-brand-200 sm:block lg:hidden" aria-hidden="true" />
          <SocialLinks variant="light" className="hidden sm:flex lg:hidden" />
        </div>
      </div>
    </div>
  );
}
