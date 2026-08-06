import type { FeatureCollection, LineString, Point, Polygon } from 'geojson';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
} from '@maplibre/maplibre-react-native';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { Caption } from '@/components/ui/Typography';
import { MAP_ATTRIBUTION, SATELLITE_MAP_STYLE } from '@/constants/mapStyles';
import { useTranslation } from '@/hooks/useTranslation';
import { simplifyWalkPoints } from '@/services/location/fieldMeasureService';
import type { Coordinates } from '@/types/location';
import { colors, radius, spacing } from '@/theme';

interface FieldMeasureMapProps {
  points: Coordinates[];
  livePosition?: Coordinates | null;
  walking: boolean;
  reviewing?: boolean;
  mapKey: string;
}

const MAP_HEIGHT = 280;
const MAX_MAP_POINTS = 32;

function toLngLat(point: Coordinates): [number, number] {
  return [point.longitude, point.latitude];
}

function mapRenderPoints(points: Coordinates[]): Coordinates[] {
  if (points.length <= MAX_MAP_POINTS) return points;
  const simplified = simplifyWalkPoints(points, 6);
  if (simplified.length <= MAX_MAP_POINTS) return simplified;
  const step = Math.ceil(simplified.length / MAX_MAP_POINTS);
  const sampled: Coordinates[] = [];
  for (let i = 0; i < simplified.length; i += step) {
    sampled.push(simplified[i]!);
  }
  const last = simplified[simplified.length - 1]!;
  const tail = sampled[sampled.length - 1]!;
  if (tail.latitude !== last.latitude || tail.longitude !== last.longitude) {
    sampled.push(last);
  }
  return sampled.length >= 2 ? sampled : simplified.slice(0, MAX_MAP_POINTS);
}

function viewStateFromCoords(points: Coordinates[], live?: Coordinates | null) {
  const all = [...points];
  if (live) all.push(live);
  if (!all.length) {
    return { center: [80.648, 16.5062] as [number, number], zoom: 14 };
  }
  const lats = all.map((p) => p.latitude);
  const lons = all.map((p) => p.longitude);
  const center: [number, number] = [
    (Math.min(...lons) + Math.max(...lons)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lonSpan = Math.max(...lons) - Math.min(...lons);
  const span = Math.max(latSpan, lonSpan, 0.0008);
  const zoom = Math.min(18, Math.max(14, 17 - Math.log2(span / 0.002)));
  return { center, zoom };
}

function FieldMeasureMapInner({
  points,
  livePosition,
  walking,
  reviewing = false,
  mapKey,
}: FieldMeasureMapProps) {
  const { fm } = useTranslation();
  const renderPoints = useMemo(() => mapRenderPoints(points), [points]);

  const pathCoords = useMemo(() => {
    const coords = [...renderPoints];
    if (walking && livePosition) coords.push(livePosition);
    return coords;
  }, [renderPoints, livePosition, walking]);

  const viewState = useMemo(
    () => viewStateFromCoords(renderPoints, walking ? livePosition : null),
    [renderPoints, livePosition, walking, mapKey],
  );

  const pathGeoJson = useMemo((): FeatureCollection<LineString> => {
    if (pathCoords.length < 2) {
      return { type: 'FeatureCollection', features: [] };
    }
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: pathCoords.map(toLngLat),
          },
        },
      ],
    };
  }, [pathCoords]);

  const polygonGeoJson = useMemo((): FeatureCollection<Polygon> => {
    if (!reviewing || walking || renderPoints.length < 3) {
      return { type: 'FeatureCollection', features: [] };
    }
    const ring = renderPoints.map(toLngLat);
    const first = ring[0]!;
    const last = ring[ring.length - 1]!;
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push(first);
    }
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [ring],
          },
        },
      ],
    };
  }, [renderPoints, reviewing, walking]);

  const markerGeoJson = useMemo((): FeatureCollection<Point> => {
    const features: FeatureCollection<Point>['features'] = [];
    const start = renderPoints[0];
    if (start) {
      features.push({
        type: 'Feature',
        properties: { role: 'start' },
        geometry: { type: 'Point', coordinates: toLngLat(start) },
      });
    }
    if (reviewing && !walking && renderPoints.length > 1) {
      const end = renderPoints[renderPoints.length - 1]!;
      features.push({
        type: 'Feature',
        properties: { role: 'end' },
        geometry: { type: 'Point', coordinates: toLngLat(end) },
      });
    }
    if (walking && livePosition) {
      features.push({
        type: 'Feature',
        properties: { role: 'live' },
        geometry: { type: 'Point', coordinates: toLngLat(livePosition) },
      });
    }
    return { type: 'FeatureCollection', features };
  }, [renderPoints, livePosition, walking, reviewing]);

  return (
    <View style={styles.wrap}>
      <Caption style={styles.mapTitle}>{fm.mapTitle}</Caption>
      <View style={styles.mapBox}>
        <Map mapStyle={SATELLITE_MAP_STYLE} style={styles.map}>
          <Camera
            key={mapKey}
            initialViewState={{
              center: viewState.center,
              zoom: viewState.zoom,
            }}
          />

          {polygonGeoJson.features.length > 0 ? (
            <GeoJSONSource id="field-polygon" data={polygonGeoJson}>
              <Layer
                id="field-polygon-fill"
                type="fill"
                paint={{ 'fill-color': 'rgba(46, 125, 50, 0.35)' }}
              />
              <Layer
                id="field-polygon-line"
                type="line"
                paint={{ 'line-color': colors.primary, 'line-width': 2 }}
              />
            </GeoJSONSource>
          ) : null}

          {pathGeoJson.features.length > 0 ? (
            <GeoJSONSource id="field-path" data={pathGeoJson}>
              <Layer
                id="field-path-line"
                type="line"
                paint={{
                  'line-color': colors.primary,
                  'line-width': 4,
                  'line-cap': 'round',
                  'line-join': 'round',
                }}
              />
            </GeoJSONSource>
          ) : null}

          {markerGeoJson.features.length > 0 ? (
            <GeoJSONSource id="field-markers" data={markerGeoJson}>
              <Layer
                id="field-marker-circles"
                type="circle"
                paint={{
                  'circle-radius': 7,
                  'circle-color': [
                    'match',
                    ['get', 'role'],
                    'start',
                    '#2E7D32',
                    'end',
                    colors.error,
                    'live',
                    '#1E88E5',
                    '#2E7D32',
                  ],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                }}
              />
            </GeoJSONSource>
          ) : null}
        </Map>
      </View>

      <Caption style={styles.attribution}>{MAP_ATTRIBUTION}</Caption>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotStart]} />
          <Caption style={styles.legendText}>🟢 {fm.mapLegendStart}</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotEnd]} />
          <Caption style={styles.legendText}>🔴 {fm.mapLegendEnd}</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotArea]} />
          <Caption style={styles.legendText}>{fm.mapLegendArea}</Caption>
        </View>
      </View>
    </View>
  );
}

export function FieldMeasureMap(props: FieldMeasureMapProps) {
  const { fm } = useTranslation();
  const visible = props.walking || props.points.length > 0;
  if (!visible) return null;

  return (
    <MapErrorBoundary fallbackMessage={fm.mapFallback}>
      <FieldMeasureMapInner {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  mapTitle: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mapBox: {
    height: MAP_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  },
  map: { flex: 1 },
  attribution: {
    color: colors.textTertiary,
    fontSize: 10,
    textAlign: 'center',
  },
  legend: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotStart: { backgroundColor: '#2E7D32' },
  dotEnd: { backgroundColor: colors.error },
  dotArea: { backgroundColor: 'rgba(46, 125, 50, 0.5)' },
  legendText: { color: colors.textTertiary, fontSize: 11 },
});
