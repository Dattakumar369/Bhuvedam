/**
 * Satellite / basemap layer configs for Polam Koluvu.
 *
 * Google Maps satellite is high-detail but NOT live — rural India mosaics
 * are often several years old. Sentinel-2 cloudless is fresher (~yearly mosaic
 * from recent Copernicus data) at ~10 m. Esri World Imagery is another mosaic
 * that can differ by region/date.
 */

export type FieldBasemapId = 'hybrid' | 'satellite' | 'recent' | 'esri';

export interface FieldBasemapLayer {
  id: FieldBasemapId;
  label: string;
  /** Short Telugu/English hint under the map. */
  hint: string;
  /** Native Google mapType when not using UrlTile. */
  googleMapType?: 'hybrid' | 'satellite' | 'none';
  /** XYZ template with {z}/{x}/{y} or {z}/{y}/{x}. */
  urlTemplate?: string;
  maxZoom: number;
  attribution: string;
}

/** Prefer 2025 mosaic; 2024 is a stable fallback if 2025 tiles 404 in some regions. */
const SENTINEL_RECENT_URL =
  'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2025_3857/default/g/{z}/{y}/{x}.jpg';

const ESRI_WORLD_IMAGERY_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

export const FIELD_BASEMAP_LAYERS: FieldBasemapLayer[] = [
  {
    id: 'hybrid',
    label: 'Hybrid',
    hint: 'Google satellite + names — sharp, but photo date can be old',
    googleMapType: 'hybrid',
    maxZoom: 21,
    attribution: '© Google',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    hint: 'Google satellite only — sharp detail, not live',
    googleMapType: 'satellite',
    maxZoom: 21,
    attribution: '© Google',
  },
  {
    id: 'recent',
    label: 'Recent',
    hint: 'Sentinel-2 2025 cloudless — fresher (~10m), less sharp than Google',
    googleMapType: 'none',
    urlTemplate: SENTINEL_RECENT_URL,
    maxZoom: 18,
    attribution:
      'Sentinel-2 cloudless © EOX (Copernicus Sentinel data 2025) — s2maps.eu',
  },
  {
    id: 'esri',
    label: 'Esri',
    hint: 'Esri World Imagery — alternate mosaic (date varies by area)',
    googleMapType: 'none',
    urlTemplate: ESRI_WORLD_IMAGERY_URL,
    maxZoom: 19,
    attribution: '© Esri',
  },
];

export function getFieldBasemap(id: FieldBasemapId): FieldBasemapLayer {
  return FIELD_BASEMAP_LAYERS.find((l) => l.id === id) ?? FIELD_BASEMAP_LAYERS[0]!;
}

/** @deprecated Prefer FIELD_BASEMAP_LAYERS / getFieldBasemap */
export const MAP_ATTRIBUTION = '© OpenStreetMap · © Esri · © EOX Sentinel-2';

/** @deprecated MapLibre style object — kept for reference */
export const SATELLITE_MAP_STYLE = {
  version: 8,
  sources: {
    esri_satellite: {
      type: 'raster',
      tiles: [ESRI_WORLD_IMAGERY_URL],
      tileSize: 256,
      attribution: '© Esri',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'esri_satellite',
      type: 'raster',
      source: 'esri_satellite',
    },
  ],
};

/** @deprecated MapLibre style object — kept for reference */
export const OSM_MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
    },
  ],
};
