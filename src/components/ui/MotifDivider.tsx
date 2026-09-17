import React from 'react';
import { BitaugMotif } from '../BitaugMotif';

/**
 * Section divider: a hairline broken by the Bitaug motif.
 *
 * Use sparingly — at most once per page, at the single most meaningful break.
 * It previously sat between nearly every section, which turned the municipality's
 * one piece of signature iconography into wallpaper.
 */
export function MotifDivider() {
  return (
    <div className="container-page flex items-center gap-6 py-2" aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-hairline" />
      <BitaugMotif className="h-11 w-14 shrink-0 text-brand-300" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-hairline" />
    </div>
  );
}
