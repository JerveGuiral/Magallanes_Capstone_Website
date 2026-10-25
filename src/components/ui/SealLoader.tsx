import React from 'react';
import { SealImage } from './Picture';

type Size = 'sm' | 'md' | 'lg';

type SealLoaderProps = {
  size?: Size;
  /** Announced to screen readers and, unless `hideLabel`, shown beneath the mark. */
  label?: string;
  hideLabel?: boolean;
  className?: string;
};

/* The seal sits at ~76% of the box. The orbiting arcs ride at r=22 of a 48
 * viewBox (~92% of the box), which leaves a consistent ring gap at every size
 * — so the mark reads the same whether it is 40px in a button or 128px
 * centred on a route transition. `stroke` is in viewBox units and therefore
 * scales with the box, which is why the largest size uses the thinnest value. */
const DIMENSIONS: Record<Size, { box: string; seal: string; stroke: number; label: string }> = {
  sm: { box: 'h-10 w-10', seal: 'h-[1.875rem] w-[1.875rem]', stroke: 3, label: 'text-[0.6875rem]' },
  md: { box: 'h-16 w-16', seal: 'h-12 w-12', stroke: 2.5, label: 'text-[0.8125rem]' },
  lg: { box: 'h-32 w-32', seal: 'h-24 w-24', stroke: 1.75, label: 'text-[0.9375rem]' },
};

/**
 * Loading indicator built from the municipal seal.
 *
 * Three layers on deliberately different rhythms so it reads as a crafted mark
 * rather than a stock spinner: a brass arc sweeping clockwise, a fainter teal
 * arc drifting counter-clockwise behind it, and the seal itself breathing.
 *
 * Under `prefers-reduced-motion` the global reset in index.css freezes every
 * animation, which would leave a silent, static image — so the label is not
 * optional to the accessibility tree. `role="status"` plus the visually-hidden
 * text means the state is always announced whether or not anything moves.
 */
export function SealLoader({ size = 'md', label = 'Loading…', hideLabel = false, className = '' }: SealLoaderProps) {
  const d = DIMENSIONS[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
      <span className={`relative grid ${d.box} place-items-center`}>
        {/* Expanding halo — the slowest layer, gives the mark a pulse. */}
        <span
          className="absolute inset-0 rounded-full bg-accent-500/25 motion-safe:animate-halo"
          aria-hidden="true"
        />

        {/* Counter-rotating teal arc, sitting behind the brass one. */}
        <svg className="absolute inset-0 h-full w-full motion-safe:animate-orbit-slow" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="currentColor"
            className="text-brand-200"
            strokeWidth={d.stroke}
            strokeLinecap="round"
            strokeDasharray="20 118"
          />
        </svg>

        {/* Leading brass arc. */}
        <svg className="absolute inset-0 h-full w-full motion-safe:animate-orbit" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="currentColor"
            className="text-accent-500"
            strokeWidth={d.stroke}
            strokeLinecap="round"
            strokeDasharray="34 104"
          />
        </svg>

        <SealImage className={`${d.seal} object-contain motion-safe:animate-breathe`} />
      </span>

      {hideLabel ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className={`font-sans ${d.label} font-medium text-ink-muted`}>{label}</span>
      )}
    </div>
  );
}
