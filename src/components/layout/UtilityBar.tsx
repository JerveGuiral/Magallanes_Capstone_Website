import React from 'react';
import { MinusIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { SocialLinks } from './SocialLinks';

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
 * Government utility strip: provenance on the left, accessibility and channels
 * on the right. Deliberately the darkest surface on the page — it frames the
 * masthead below it and is never competed with for attention.
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
    'grid h-6 w-6 place-items-center rounded text-brand-200 transition-colors duration-150 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent';

  return (
    <div className="w-full bg-brand-950 text-brand-200">
      <div className="container-page flex items-center justify-between gap-4 py-2">
        <p className="flex items-center gap-2 text-[0.6875rem] leading-tight tracking-[0.02em]">
          <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-accent-400" aria-hidden="true" />
          <span>
            <span className="font-semibold text-white">Capstone prototype</span>
            <span className="hidden sm:inline"> · a website concept for the Municipality of Magallanes, Agusan del Norte</span>
          </span>
        </p>

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
              nav bar, so the strip keeps them reachable. */}
          <span className="h-4 w-px bg-white/15 lg:hidden" aria-hidden="true" />
          <SocialLinks className="lg:hidden" />
        </div>
      </div>
    </div>
  );
}
