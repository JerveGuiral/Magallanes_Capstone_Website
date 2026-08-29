import React from 'react';

type BitaugMotifProps = {
  className?: string;
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

/**
 * Signature motif: line-art rendering of the coastal Bitaug tree, the heritage
 * marker of Magallanes. Single stroke color (currentColor), no fills, no gradients.
 */
export function BitaugMotif({ className = '', title }: BitaugMotifProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false">
      
      {title ? <title>{title}</title> : null}
      {/* trunk and buttress roots */}
      <path d="M80 108V64" />
      <path d="M80 108c-6 0-11-3-16-8M80 108c6 0 11-3 16-8" />
      {/* primary limbs */}
      <path d="M80 70c-9-5-15-13-19-22M80 70c9-5 15-13 19-22" />
      <path d="M80 82c-7-3-13-8-17-15M80 82c7-3 13-8 17-15" />
      {/* canopy, drawn as overlapping arcs rather than a solid mass */}
      <path d="M34 46c-4-13 5-25 18-26 3-10 13-16 23-13 7-7 19-7 26 1 13-2 23 8 22 21 8 5 9 17 1 23" />
      <path d="M124 52c-8 7-20 8-29 2-8 7-21 7-29 0-9 6-21 5-28-3" />
      {/* leaf ticks */}
      <path d="M56 34l-5-6M72 26l-3-7M94 27l3-7M110 36l6-6" />
      {/* ground line / shoreline */}
      <path d="M18 108h124" strokeDasharray="1 6" />
    </svg>);

}