import React from 'react';

type BuntingProps = {
  className?: string;
  /** `sm` for chrome edges (header, footer), `md` for section dividers and the chat header. */
  size?: 'sm' | 'md';
};

/* Flag colours, in the order they hang. Rose and gold lead because that is how the
 * banderitas in front of the Municipal Hall read from the street; green and sky blue
 * come from the hall's roof and the municipal seal. */
const FLAGS = ['fill-brand-400', 'fill-fiesta-400', 'fill-accent-400', 'fill-sky-400', 'fill-brand-600'] as const;

/* One pattern tile: five flags hanging from a gently sagging string. The tile repeats
 * across any width, so the strip works from a phone to a wide monitor without
 * stretching the flags. */
const TILE = 140;
const SAG = 8; // depth of the string's dip, in tile units
const FLAG_W = 20;
const FLAG_H = 16;
const stringY = (x: number) => 2 + SAG * 0.5 * (1 - ((x - TILE / 2) / (TILE / 2)) ** 2);

/**
 * Banderitas — the fiesta bunting strung in front of the Magallanes Municipal Hall,
 * as a repeating SVG strip. The site's signature decoration: header and footer edges
 * and the section divider. Always decorative.
 */
export function Bunting({ className = '', size = 'sm' }: BuntingProps) {
  const id = React.useId().replace(/:/g, '');
  const height = size === 'sm' ? 16 : 24;
  const scale = height / (FLAG_H + SAG * 0.5 + 4);

  return (
    <svg
      className={`block w-full ${className}`}
      height={height}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <defs>
        <pattern
          id={`bunting-${id}`}
          width={TILE * scale}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <g transform={`scale(${scale})`}>
            <path d={`M0 2Q${TILE / 2} ${2 + SAG} ${TILE} 2`} className="stroke-brand-300" strokeWidth="1.2" fill="none" />
            {FLAGS.map((fill, i) => {
              const cx = TILE / 10 + (i * TILE) / 5;
              const y = stringY(cx);
              return (
                <path
                  key={fill}
                  d={`M${cx - FLAG_W / 2} ${y}L${cx + FLAG_W / 2} ${y}L${cx} ${y + FLAG_H}Z`}
                  className={fill}
                />
              );
            })}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height={height} fill={`url(#bunting-${id})`} />
    </svg>
  );
}
