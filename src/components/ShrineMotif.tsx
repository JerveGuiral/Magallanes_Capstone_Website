import React from 'react';

type ShrineMotifProps = {
  className?: string;
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

/**
 * Signature motif: line-art rendering of the Magellan Shrine in Poblacion — the stepped stone
 * pedestal with its inscription plaque and the obelisk on top — by the water where the Agusan
 * River meets Butuan Bay. The same monument Magi, the chatbot, is drawn from.
 * Single stroke color (currentColor), no fills, no gradients.
 */
export function ShrineMotif({ className = '', title }: ShrineMotifProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {/* obelisk and its pointed cap */}
      <path d="M66 72L72 22h16l6 50" />
      <path d="M72 22l8-12 8 12" />
      <path d="M67.5 66h25" />
      {/* plaque block, with the inscription */}
      <path d="M62 88V72h36v16" />
      <path d="M71 76h18v8H71z" />
      <path d="M74 79h12M74 81.5h8" />
      {/* stepped pedestal and platform */}
      <path d="M54 98V88h52v10" />
      <path d="M44 108V98h72v10" />
      {/* the river beside it */}
      <path d="M120 103c4-3 8-3 12 0s8 3 12 0M126 97c3-2 6-2 9 0" />
      <path d="M17 103c3-2 6-2 9 0s6 2 9 0" />
      {/* ground line / shoreline */}
      <path d="M18 108h124" strokeDasharray="1 6" />
    </svg>
  );
}
