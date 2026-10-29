import React from 'react';
import type { MunicipalMap as MunicipalMapComponent } from './MunicipalMap';

/* The map library (Leaflet) is the heaviest part of the site; it now loads only on the pages
 * that show the map, after the rest of the page. */
const MunicipalMap = React.lazy(() => import('./MunicipalMap').then((m) => ({ default: m.MunicipalMap })));

export function LazyMunicipalMap(props: React.ComponentProps<typeof MunicipalMapComponent>) {
  return (
    <React.Suspense
      fallback={
        <div className="container-page py-14 lg:py-section" aria-hidden="true">
          <div className="skeleton h-[28rem] w-full rounded-xl" />
        </div>
      }
    >
      <MunicipalMap {...props} />
    </React.Suspense>
  );
}
