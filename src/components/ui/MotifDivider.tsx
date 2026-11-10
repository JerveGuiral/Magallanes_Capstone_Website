import React from 'react';
import { ShrineMotif } from '../ShrineMotif';

/**
 * Section divider: a hairline broken by the Bitaug tree.
 *
 * Use sparingly — at most once per page, at the single most meaningful break —
 * so the municipality's signature mark stays a mark, not wallpaper.
 */
export function MotifDivider() {
  return (
    <div className="container-page flex items-center gap-6 py-4" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline" />
      <ShrineMotif className="h-12 w-16 shrink-0 text-brand-300" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline" />
    </div>
  );
}
