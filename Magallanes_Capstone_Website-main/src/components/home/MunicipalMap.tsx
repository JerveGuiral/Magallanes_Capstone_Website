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

const LEGEND = [
  { label: 'Municipal Hall (Seat of LGU)', className: 'bg-alert' },
  { label: 'Coastal Barangay (River delta)', className: 'bg-teal' },
  { label: 'Upland Barangay', className: 'bg-indigo' },
];

function colorFor(point: (typeof MAP_POINTS)[number]) {
  if (point.role === 'hall') return '#C0392B';
  if (point.classification === 'Upland') return '#1E2A4A';
  return '#17A398';
}

export function MunicipalMap() {
  return (
    <section className="w-full py-12" aria-labelledby="municipal-map-title">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div id="municipal-map-title">
          <SectionHeading
            eyebrow="Geographic Orientation"
            title="Jurisdiction & Barangay Map"
            description="Interactive GIS layout of the Municipal Hall and all 12 barangays situated along the mouth and delta of the Agusan and Baug Rivers."
          />
        </div>

        <div className="mt-6 rounded border border-slate-200 bg-surface-raised p-2 shadow-subtle">
          <div
            className="h-[24rem] w-full rounded overflow-hidden"
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
                      <span className="block font-display text-sm font-bold text-indigo">{point.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                        {point.role === 'hall' ? 'Municipal Hall · Center of Governance' : `${point.classification} Barangay`}
                      </span>
                      {point.note && <span className="mt-1 block text-xs text-slate-700">{point.note}</span>}
                    </div>
                  </LeafletPopup>
                </LeafletCircleMarker>
              ))}
            </LeafletMapContainer>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-xs text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
            MPDO Reference · Coordinates verified
          </p>
        </div>
      </div>
    </section>
  );
}