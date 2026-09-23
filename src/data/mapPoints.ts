export type MapPoint = {
  name: string;
  role: 'hall' | 'barangay';
  classification?: 'Coastal' | 'Upland' | 'Poblacion';
  note?: string;
  position: [number, number];
};

/**
 * Magallanes, Agusan del Norte has exactly 8 barangays — Poblacion, Caloc-an,
 * Guiasan, Buhang, Marcos, Santo Niño, Santo Rosario and Taod-oy — plus the
 * municipal hall. Every position below is real-world, geocoded against
 * OpenStreetMap/Nominatim and cross-checked against PhilAtlas, not estimated.
 * Magallanes sits at the delta of the Agusan and Baug Rivers, fronting Butuan
 * Bay to the east; Cabadbaran borders it to the north, Butuan City to the
 * south, and Remedios T. Romualdez to the west.
 *
 * An earlier version of this file invented 4 additional barangays that don't
 * exist in the real municipality — removed. If new development ever adds a
 * barangay in Supabase that isn't in this list, it just won't get a map pin
 * until someone adds a surveyed coordinate for it here.
 */
export const MAP_CENTER: [number, number] = [9.026, 125.541];

export const MAP_POINTS: MapPoint[] = [
{
  name: 'Magallanes Municipal Hall',
  role: 'hall',
  note: 'Barangay Poblacion · Mon–Fri, 8:00 AM – 5:00 PM',
  position: [9.0184, 125.5173]
},
{ name: 'Poblacion', role: 'barangay', classification: 'Poblacion', position: [9.0193, 125.5183] },
{ name: 'Caloc-an', role: 'barangay', classification: 'Coastal', position: [9.0490, 125.5302] },
{ name: 'Guiasan', role: 'barangay', classification: 'Coastal', position: [9.0034, 125.5452] },
{ name: 'Buhang', role: 'barangay', classification: 'Coastal', position: [9.0274, 125.5220] },
{ name: 'Marcos', role: 'barangay', classification: 'Upland', position: [9.0270, 125.5176] },
{ name: 'Santo Niño', role: 'barangay', classification: 'Upland', position: [9.0309, 125.5138] },
{ name: 'Santo Rosario', role: 'barangay', classification: 'Upland', position: [9.0231, 125.5168] },
{ name: 'Taod-oy', role: 'barangay', classification: 'Upland', position: [9.0182, 125.5682] }];