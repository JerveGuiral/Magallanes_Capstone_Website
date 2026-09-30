import React from 'react';
import { useLocation } from 'react-router-dom';
import { SealLoader } from './SealLoader';

/** First paint gets a slightly longer beat; later navigations must feel instant. */
const INITIAL_MS = 620;
const NAVIGATE_MS = 420;
const FADE_MS = 260;

type Phase = 'hidden' | 'visible' | 'fading';

/**
 * Branded transition between routes.
 *
 * Every page here fetches from Supabase on mount, so without this the reader
 * sees a fully-rendered shell wrapped around empty states for a few hundred
 * milliseconds — which reads as "this page is broken", not "this page is
 * loading". The overlay covers exactly that window.
 *
 * Keyed on `pathname` alone: `/contact#offices` and `/services#bids` are
 * in-page jumps, and flashing a loader at someone scrolling to an anchor would
 * be pure noise.
 *
 * It is deliberately short. A branded loader that outstays the wait it is
 * covering makes a fast site feel slow.
 */
/** Matches at module scope so the first render already knows the answer. */
function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function RouteTransition() {
  const { pathname } = useLocation();
  const reduced = React.useRef(prefersReducedMotion());
  const [phase, setPhase] = React.useState<Phase>(reduced.current ? 'hidden' : 'visible');
  const firstRun = React.useRef(true);

  React.useEffect(() => {
    /* A full-bleed overlay appearing and vanishing on every navigation is a
     * flash, which is precisely what this preference asks us not to do. The
     * site is fully usable without it, so it is skipped rather than shortened. */
    if (reduced.current) {
      firstRun.current = false;
      setPhase('hidden');
      return;
    }

    const hold = firstRun.current ? INITIAL_MS : NAVIGATE_MS;
    firstRun.current = false;

    setPhase('visible');

    const toFade = window.setTimeout(() => setPhase('fading'), hold);
    const toHide = window.setTimeout(() => setPhase('hidden'), hold + FADE_MS);

    return () => {
      window.clearTimeout(toFade);
      window.clearTimeout(toHide);
    };
  }, [pathname]);

  if (phase === 'hidden') return null;

  return (
    <div
      /* aria-hidden while fading: the page underneath is already interactive by
       * then, and a screen reader should be reading that, not a stale status. */
      aria-hidden={phase === 'fading'}
      className={`fixed inset-0 z-[80] grid place-items-center bg-white/92 backdrop-blur-[3px] transition-opacity ease-gov ${
        phase === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <SealLoader size="lg" label="Loading…" hideLabel />
    </div>
  );
}
