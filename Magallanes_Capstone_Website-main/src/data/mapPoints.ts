export type MapPoint = {
  name: string;
  role: 'hall' | 'barangay';
  classification?: 'Coastal' | 'Upland' | 'Poblacion';
  note?: string;
  position: [number, number];
};

/**
 * Indicative locations around the Magallanes town center (approx. 9.0167 N, 125.5167 E).
 * Coordinates are approximate and for orientation only — replace with surveyed
 * barangay centroids from the Municipal Planning and Development Office.
 */
export const MAP_CENTER: [number, number] = [9.0167, 125.5167];

export const MAP_POINTS: MapPoint[] = [
{
  name: 'Magallanes Municipal Hall',
  role: 'hall',
  note: 'Barangay Poblacion · Mon–Fri, 8:00 AM – 5:00 PM',
  position: [9.0167, 125.5167]
},
{ name: 'Poblacion', role: 'barangay', classification: 'Poblacion', position: [9.0175, 125.5185] },
{ name: 'Caloc-an', role: 'barangay', classification: 'Coastal', position: [9.0285, 125.5062] },
{ name: 'Guiapo', role: 'barangay', classification: 'Coastal', position: [9.0062, 125.5285] },
{ name: 'Buhang', role: 'barangay', classification: 'Coastal', position: [9.0312, 125.5241] },
{ name: 'Marcos', role: 'barangay', classification: 'Upland', position: [8.9958, 125.4988] },
{ name: 'Santo Niño', role: 'barangay', classification: 'Upland', position: [8.9885, 125.5312] },
{ name: 'Taod-oy', role: 'barangay', classification: 'Upland', position: [9.0041, 125.4872] },
{ name: 'Sinamu-an', role: 'barangay', classification: 'Coastal', position: [9.0398, 125.5138] },
{ name: 'Cabinet', role: 'barangay', classification: 'Upland', position: [8.9812, 125.5062] },
{ name: 'Sinicgan', role: 'barangay', classification: 'Coastal', position: [9.0241, 125.5372] },
{ name: 'Buenavista', role: 'barangay', classification: 'Upland', position: [8.9925, 125.5205] },
{ name: 'Bitaug', role: 'barangay', classification: 'Coastal', position: [9.0362, 125.4972] }];