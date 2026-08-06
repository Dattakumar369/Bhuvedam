/**
 * Free map tile styles — no Google Maps API key required.
 * Satellite: Esri World Imagery (attribution required).
 * Street: OpenStreetMap raster tiles.
 */

export const MAP_ATTRIBUTION = '© OpenStreetMap · © Esri';

/** Satellite imagery — suitable for polam border walk */
export const SATELLITE_MAP_STYLE = {
  version: 8,
  sources: {
    esri_satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
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

/** OpenStreetMap street map — fallback */
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
