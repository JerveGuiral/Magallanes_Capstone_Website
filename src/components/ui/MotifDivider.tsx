import React from 'react';
import { BitaugMotif } from '../BitaugMotif';

/** Section divider: a single hairline broken by the Bitaug motif. */
export function MotifDivider() {
  return (
    <div className="mx-auto flex max-w-content items-center gap-6 px-4 sm:px-6 lg:px-8" aria-hidden="true">
      <span className="h-px flex-1 bg-hairline" />
      <BitaugMotif className="h-12 w-16 text-teal/40" />
      <span className="h-px flex-1 bg-hairline" />
    </div>);

}