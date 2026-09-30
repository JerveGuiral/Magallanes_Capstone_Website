import React from 'react';

type CountUpProps = {
  /** Final value to land on. */
  value: number;
  /** Decimal places to render — 23684 → "23,684", 141.3 → "141.30". */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
};

const format = (n: number, decimals: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * Two things this deliberately gets right:
 *
 *  - Under `prefers-reduced-motion` it renders the final number immediately.
 *    A ticking number is exactly the kind of motion that triggers vestibular
 *    discomfort, and the figure itself is the content, not the animation.
 *  - The element carries the final value in `aria-label` from the first paint,
 *    so a screen reader announces "23,684" once rather than narrating every
 *    intermediate frame of a live-updating number.
 */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', durationMs = 1400, className = '' }: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = React.useState(0);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(value);
      setDone(true);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done) return;
        observer.disconnect();

        const step = (ts: number) => {
          if (start === null) start = ts;
          const p = Math.min((ts - start) / durationMs, 1);
          /* easeOutExpo: fast out of the gate, long settle — reads as a counter
           * coming to rest rather than a linear tick. */
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setDisplay(value * eased);
          if (p < 1) frame = requestAnimationFrame(step);
          else setDone(true);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs, done]);

  const final = `${prefix}${format(value, decimals)}${suffix}`;

  return (
    <span ref={ref} className={className} aria-label={final}>
      <span aria-hidden="true">
        {prefix}
        {format(done ? value : display, decimals)}
        {suffix}
      </span>
    </span>
  );
}
