import React from 'react';
import { BitaugMotif } from '../BitaugMotif';
import { Bunting } from './Bunting';

/**
 * Section divider: the fiesta bunting broken by the Bitaug tree.
 *
 * Use sparingly — at most once per page, at the single most meaningful break —
 * so the municipality's signature marks stay marks, not wallpaper.
 */
export function MotifDivider() {
  return (
    <div className="container-page flex items-center gap-5 py-4" aria-hidden="true">
      <Bunting size="md" className="flex-1 opacity-80" />
      <BitaugMotif className="h-14 w-[4.5rem] shrink-0 text-brand-400" />
      <Bunting size="md" className="flex-1 opacity-80" />
    </div>
  );
}
