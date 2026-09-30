import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup, ScaleControl } from 'react-leaflet';
import { MAP_CENTER, MAP_POINTS } from '../../data/mapPoints';
import { SectionHeading } from '../ui/SectionHeading';

// Explicit cast to resolve react-leaflet v4 and React 18 JSX intrinsic types mismatch
const LeafletMapContainer = MapContainer as unknown as React.ComponentType<any>;
const LeafletTileLayer = TileLayer as unknown as React.ComponentType<any>;
const LeafletCircleMarker = CircleMarker as unknown as React.ComponentType<any>;
const LeafletTooltip = Tooltip as unknown as React.ComponentType<any>;
const LeafletPopup = Popup as unknown as React.ComponentType<any>;
const LeafletScaleControl = ScaleControl as unknown as React.ComponentType<any>;

/* The map is the one view where the `sea` family carries meaning rather than
 * decoration: teal marks the delta barangays, navy the upland ones, and the
 * reserved alert red marks the seat of government. */
const LEGEND = [
  { label: 'Municipal Hall (Seat of LGU)', className: 'bg-alert-600' },
  { label: 'Coastal Barangay (River delta)', className: 'bg-sea-700' },
  { label: 'Upland Barangay', className: 'bg-brand-800' },
];

/* Leaflet's SVG renderer sets `stroke`/`fill` as raw attributes, so it can't
 * take a Tailwind class — these are literal mirrors of the LEGEND swatches
 * above (alert-600, brand-800, sea-700 in tailwind.config.js). Keep every
 * value here byte-for-byte identical to its swatch's token, or the legend and
 * the markers it's supposed to key will silently disagree. */
function colorFor(point: (typeof MAP_POINTS)[number]) {
  if (point.role === 'hall') return '#B3261E'; // alert-600
  if (point.classification === 'Upland') return '#096478'; // brand-800
  return '#0F6B44'; // sea-700
}

export function MunicipalMap() {
  return (
    <section className="w-full py-14 lg:py-section" aria-labelledby="municipal-map-title">
      <div className="container-page">
        <div id="municipal-map-title">
          <SectionHeading
            eyebrow="Geographic Orientation"
            title="Jurisdiction & Barangay Map"
            description="Interactive GIS layout of the Municipal Hall and all 8 barangays situated along the mouth and delta of the Agusan and Baug Rivers."
          />
        </div>

        <div className="mt-8 rounded-xl border border-hairline bg-white p-2 shadow-card">
          <div
            className="h-[26rem] w-full overflow-hidden rounded-lg lg:h-[30rem]"
            role="region"
            aria-label="Interactive map of Magallanes, Agusan del Norte, showing the Municipal Hall and barangay locations"
          >
            <LeafletMapContainer
              center={MAP_CENTER}
              zoom={12}
              scrollWheelZoom={false}
              className="h-full w-full"
              attributionControl
            >
              <LeafletTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <LeafletScaleControl position="bottomleft" imperial={false} />

              {MAP_POINTS.map((point) => (
                <LeafletCircleMarker
                  key={point.name}
                  center={point.position}
                  radius={point.role === 'hall' ? 9 : 6}
                  pathOptions={{
                    color: colorFor(point),
                    fillColor: colorFor(point),
                    fillOpacity: point.role === 'hall' ? 0.95 : 0.65,
                    weight: 2,
                  }}
                >
                  <LeafletTooltip direction="top" offset={[0, -6]}>
                    <span className="font-sans text-xs font-semibold">{point.name}</span>
                  </LeafletTooltip>
                  <LeafletPopup>
                    <div className="p-1">
                      <span className="block font-display text-sm font-bold text-brand-800">{point.name}</span>
                      <span className="mt-0.5 block font-display text-[10px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                        {point.role === 'hall' ? 'Municipal Hall · Center of Governance' : `${point.classification} Barangay`}
                      </span>
                      {point.note && <span className="mt-1 block text-xs text-ink-muted">{point.note}</span>}
                    </div>
                  </LeafletPopup>
                </LeafletCircleMarker>
              ))}
            </LeafletMapContainer>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-ink-muted">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white ${item.className}`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle">
            MPDO Reference · Coordinates verified
          </p>
        </div>
      </div>
    </section>
  );
}