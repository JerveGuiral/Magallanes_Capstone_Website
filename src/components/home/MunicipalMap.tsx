import React from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip, ScaleControl, useMap } from 'react-leaflet';
import { divIcon, latLngBounds } from 'leaflet';
import {
  ClockIcon,
  ExpandIcon,
  ExternalLinkIcon,
  LandmarkIcon,
  LocateFixedIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  ShrinkIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { MAP_CENTER, MAP_POINTS, type MapPoint } from '../../data/mapPoints';
import { LGU_CONTACT } from '../../data/site';
import { adminService, type BarangayItem } from '../../services/adminService';
import { SectionHeading } from '../ui/SectionHeading';

// Explicit cast to resolve react-leaflet v4 and React 18 JSX intrinsic types mismatch
const LeafletMapContainer = MapContainer as unknown as React.ComponentType<any>;
const LeafletTileLayer = TileLayer as unknown as React.ComponentType<any>;
const LeafletMarker = Marker as unknown as React.ComponentType<any>;
const LeafletTooltip = Tooltip as unknown as React.ComponentType<any>;
const LeafletScaleControl = ScaleControl as unknown as React.ComponentType<any>;

type Kind = 'hall' | 'coastal' | 'upland';
type Place = MapPoint & { id: string; kind: Kind };

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^sto\.?\s/, 'santo ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/* Poblacion sits on the shore, so it keys as coastal. */
const PLACES: Place[] = MAP_POINTS.map((p) => ({
  ...p,
  id: slug(p.name),
  kind: p.role === 'hall' ? 'hall' : p.classification === 'Upland' ? 'upland' : 'coastal',
}));
const HALL = PLACES.find((p) => p.kind === 'hall')!;
const ALL_BOUNDS = latLngBounds(PLACES.map((p) => p.position));

const LEGEND: { kind: Kind; label: string; dot: string }[] = [
  { kind: 'hall', label: 'Municipal Hall', dot: 'bg-alert-600' },
  { kind: 'coastal', label: 'Coastal / delta barangay', dot: 'bg-accent-700' },
  { kind: 'upland', label: 'Upland barangay', dot: 'bg-brand-800' },
];
const DOT = Object.fromEntries(LEGEND.map((l) => [l.kind, l.dot])) as Record<Kind, string>;

const typeLabel = (p: Place) =>
  p.kind === 'hall' ? 'Seat of the local government' : p.classification === 'Poblacion' ? 'Town centre · coastal' : `${p.classification} barangay`;

/* Pins are plain HTML styled in index.css (.map-pin) so they can use the palette and animate. */
const makePin = (kind: Kind, selected: boolean) =>
  divIcon({
    className: '',
    html: `<span class="map-pin map-pin--${kind}${selected ? ' is-selected' : ''}"><span class="map-pin__dot"></span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    tooltipAnchor: [0, -30],
  });
const PINS = Object.fromEntries(
  (['hall', 'coastal', 'upland'] as const).map((k) => [k, { idle: makePin(k, false), selected: makePin(k, true) }])
) as Record<Kind, { idle: ReturnType<typeof divIcon>; selected: ReturnType<typeof divIcon> }>;

/** Straight-line distance in km (haversine). */
function distanceKm(a: [number, number], b: [number, number]) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const BASEMAPS = {
  map: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
  },
} as const;
const SATELLITE_LABELS =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Moves the camera: to the selected place, or back out to every place. */
function CameraController({ selected, fitKey }: { selected: Place | null; fitKey: number }) {
  const map = useMap();
  React.useEffect(() => {
    if (!selected) return;
    const zoom = Math.max(map.getZoom(), 15);
    /* On narrow screens the details card covers the lower half of the map, so aim the
     * camera below the pin — the pin then sits in the clear space above the card. */
    const size = map.getSize();
    const offsetY = size.x < 640 ? size.y * 0.24 : 0;
    const target = map.unproject(map.project(selected.position, zoom).add([0, offsetY]), zoom);
    if (prefersReducedMotion()) map.setView(target, zoom);
    else map.flyTo(target, zoom, { duration: 0.8 });
  }, [map, selected]);
  React.useEffect(() => {
    map.fitBounds(ALL_BOUNDS, { padding: [48, 48], animate: !prefersReducedMotion() });
  }, [map, fitKey]);
  return null;
}

/** Leaflet measures its box once; tell it when the box changes size (expand / collapse). */
function SizeWatcher({ expanded }: { expanded: boolean }) {
  const map = useMap();
  React.useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 60);
    if (expanded) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
    return () => window.clearTimeout(id);
  }, [map, expanded]);
  return null;
}

type MunicipalMapProps = {
  title?: string;
  description?: string;
  /** Hide the "barangay directory" link when the map already sits on that page. */
  showDirectoryLink?: boolean;
};

export function MunicipalMap({
  title = 'Map of Magallanes',
  description = 'Tap a pin to see who leads each barangay, how far it is from the Municipal Hall, and how to get there.',
  showDirectoryLink = true,
}: MunicipalMapProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [basemap, setBasemap] = React.useState<keyof typeof BASEMAPS>('map');
  const [expanded, setExpanded] = React.useState(false);
  const [fitKey, setFitKey] = React.useState(0);
  const [records, setRecords] = React.useState<Record<string, BarangayItem>>({});

  /* Live barangay records, so captain / population / contact edits made in the admin show here. */
  React.useEffect(() => {
    let mounted = true;
    adminService.getBarangays().then(({ data }) => {
      if (mounted) setRecords(Object.fromEntries((data || []).map((b) => [slug(b.name), b])));
    });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  const mapBoxRef = React.useRef<HTMLDivElement>(null);
  /* From the list (which sits below the map on phones), bring the map back into view. */
  const selectFromList = (id: string) => {
    setSelectedId(id);
    mapBoxRef.current?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const selected = PLACES.find((p) => p.id === selectedId) ?? null;
  const record = selected ? records[selected.id] : undefined;
  const showAll = () => {
    setSelectedId(null);
    setFitKey((k) => k + 1);
  };

  const ctrlBtn =
    'inline-flex h-9 items-center gap-1.5 rounded-md border border-hairline bg-white px-2.5 text-[0.8125rem] font-semibold text-brand-800 shadow-subtle transition-colors duration-150 hover:bg-brand-50';

  return (
    <section className="w-full py-14 lg:py-section" aria-labelledby="municipal-map-title">
      <div className="container-page">
        <div id="municipal-map-title">
          <SectionHeading eyebrow="Location" title={title} description={description} />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
          {/* ---- Map ---- */}
          <div
            ref={mapBoxRef}
            className={
              expanded
                ? 'fixed inset-2 z-[80] flex flex-col rounded-xl border border-hairline bg-white p-2 shadow-overlay sm:inset-6'
                : 'relative rounded-xl border border-hairline bg-white p-2 shadow-card'
            }
          >
            <div
              className={`relative w-full overflow-hidden rounded-lg ${expanded ? 'min-h-0 flex-1' : 'h-[26rem] lg:h-[34rem]'}`}
              role="region"
              aria-label="Interactive map of Magallanes, Agusan del Norte, showing the Municipal Hall and the eight barangays"
            >
              <LeafletMapContainer center={MAP_CENTER} zoom={12} scrollWheelZoom={false} className="h-full w-full" attributionControl>
                <LeafletTileLayer key={basemap} url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} />
                {basemap === 'satellite' && <LeafletTileLayer key="labels" url={SATELLITE_LABELS} />}
                <LeafletScaleControl position="bottomleft" imperial={false} />
                <CameraController selected={selected} fitKey={fitKey} />
                <SizeWatcher expanded={expanded} />

                {PLACES.map((p) => {
                  const isSelected = p.id === selectedId;
                  return (
                    <LeafletMarker
                      key={p.id}
                      position={p.position}
                      icon={isSelected ? PINS[p.kind].selected : PINS[p.kind].idle}
                      zIndexOffset={isSelected ? 1000 : p.kind === 'hall' ? 500 : 0}
                      title={p.name}
                      alt={p.name}
                      eventHandlers={{ click: () => setSelectedId(p.id) }}
                    >
                      {/* Re-keyed so the label stays pinned open while selected. */}
                      <LeafletTooltip key={String(isSelected)} direction="top" permanent={isSelected} className="map-label">
                        {p.kind === 'hall' ? 'Municipal Hall' : p.name}
                      </LeafletTooltip>
                    </LeafletMarker>
                  );
                })}
              </LeafletMapContainer>

              {/* ---- Map controls ---- */}
              <div className="absolute right-2.5 top-2.5 z-[400] flex flex-col items-end gap-2">
                <div className="flex rounded-md border border-hairline bg-white p-0.5 shadow-subtle" role="group" aria-label="Map style">
                  {(['map', 'satellite'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBasemap(b)}
                      aria-pressed={basemap === b}
                      className={`rounded px-2.5 py-1.5 text-[0.75rem] font-semibold capitalize transition-colors duration-150 ${
                        basemap === b ? 'bg-brand-800 text-white' : 'text-brand-800 hover:bg-brand-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={showAll} className={ctrlBtn} title="Show all places">
                    <LocateFixedIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Show all</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className={ctrlBtn}
                    aria-label={expanded ? 'Exit full screen' : 'View map full screen'}
                  >
                    {expanded ? <ShrinkIcon className="h-4 w-4" aria-hidden="true" /> : <ExpandIcon className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* ---- Selected place card ---- */}
              {selected && (
                <div
                  className="absolute inset-x-2.5 bottom-2.5 z-[400] animate-scale-in rounded-xl border border-hairline bg-white p-4 shadow-overlay sm:inset-x-auto sm:left-2.5 sm:w-[22rem]"
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-2 ring-white ${DOT[selected.kind]}`} aria-hidden="true" />
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold leading-tight text-brand-800">
                          {selected.kind === 'hall' ? selected.name : `Barangay ${selected.name}`}
                        </h3>
                        <p className="mt-0.5 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-accent-700">{typeLabel(selected)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-muted hover:text-brand-800"
                      aria-label="Close details"
                    >
                      <XIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <dl className="mt-3 space-y-2 text-[0.8125rem]">
                    {selected.kind === 'hall' ? (
                      <>
                        <Detail Icon={ClockIcon} label="Office hours" value={LGU_CONTACT.officeHours} />
                        <Detail
                          Icon={PhoneIcon}
                          label="Mayor's Office"
                          value={
                            <a href={LGU_CONTACT.phoneHref} className="font-mono text-brand-600 hover:text-brand-800">
                              {LGU_CONTACT.phone}
                            </a>
                          }
                        />
                        <Detail Icon={MapPinIcon} label="Address" value="Barangay Poblacion, Magallanes" />
                      </>
                    ) : (
                      <>
                        <Detail Icon={UserIcon} label="Punong Barangay" value={record?.captain_name || 'Not yet posted'} />
                        {record?.population ? (
                          <Detail Icon={UsersIcon} label="Population" value={record.population.toLocaleString()} />
                        ) : null}
                        {record?.contact_number ? (
                          <Detail
                            Icon={PhoneIcon}
                            label="Barangay hall"
                            value={
                              <a href={`tel:${record.contact_number.replace(/[^\d+]/g, '')}`} className="font-mono text-brand-600 hover:text-brand-800">
                                {record.contact_number}
                              </a>
                            }
                          />
                        ) : null}
                        <Detail
                          Icon={LandmarkIcon}
                          label="From the Municipal Hall"
                          value={`About ${distanceKm(HALL.position, selected.position).toFixed(1)} km (straight line)`}
                        />
                      </>
                    )}
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selected.position[0]},${selected.position[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary px-3 py-2 text-[0.8125rem]"
                    >
                      <NavigationIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Get directions
                      <span className="sr-only">(opens Google Maps in a new tab)</span>
                    </a>
                    {selected.kind !== 'hall' && showDirectoryLink && (
                      <Link to="/barangays" className="btn btn-secondary px-3 py-2 text-[0.8125rem]">
                        Barangay directory
                      </Link>
                    )}
                    {selected.kind === 'hall' && (
                      <Link to="/contact" className="btn btn-secondary px-3 py-2 text-[0.8125rem]">
                        Contact the Hall
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---- Place list: the keyboard- and list-friendly way into the map ---- */}
          <div className="rounded-xl border border-hairline bg-white shadow-card lg:flex lg:max-h-[35rem] lg:flex-col">
            <div className="border-b border-hairline px-4 py-3">
              <h3 className="font-display text-base font-bold text-brand-800">Places on the map</h3>
              <p className="text-[0.75rem] text-ink-muted">Select one to zoom in.</p>
            </div>
            <ul className="admin-scroll grid gap-0.5 p-2 sm:grid-cols-2 lg:flex-1 lg:grid-cols-1 lg:overflow-y-auto">
              {PLACES.map((p) => {
                const active = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => selectFromList(p.id)}
                      aria-pressed={active}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-150 ${
                        active ? 'bg-brand-50 ring-1 ring-brand-200' : 'hover:bg-surface-muted'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white ${DOT[p.kind]}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.875rem] font-semibold text-brand-800">{p.name}</span>
                        <span className="block truncate text-[0.75rem] text-ink-muted">
                          {p.kind === 'hall' ? 'Seat of government' : records[p.id]?.captain_name || typeLabel(p)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {LEGEND.map((item) => (
              <li key={item.kind} className="flex items-center gap-2 text-xs text-ink-muted">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white ${item.dot}`} aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
          <a
            href="https://www.openstreetmap.org/#map=13/9.026/125.541"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            Open in OpenStreetMap
            <ExternalLinkIcon className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Detail({ Icon, label, value }: { Icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-subtle">{label}</dt>
        <dd className="text-ink">{value}</dd>
      </div>
    </div>
  );
}
