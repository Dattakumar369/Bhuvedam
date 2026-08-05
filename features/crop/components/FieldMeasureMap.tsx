import { useEffect, useMemo, useRef } from 'react';
import { InteractionManager, Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { Caption } from '@/components/ui/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { simplifyWalkPoints } from '@/services/location/fieldMeasureService';
import type { Coordinates } from '@/types/location';
import { colors, radius, spacing } from '@/theme';

interface FieldMeasureMapProps {
  points: Coordinates[];
  livePosition?: Coordinates | null;
  walking: boolean;
  reviewing?: boolean;
}

const MAP_HEIGHT = 280;
const DEFAULT_DELTA = 0.0008;
const WALK_CAMERA_INTERVAL_MS = 1000;
const MAX_MAP_POINTS = 48;

function regionFromPoints(points: Coordinates[], live?: Coordinates | null): Region {
  const all = [...points];
  if (live) all.push(live);
  if (!all.length) {
    return {
      latitude: 16.5062,
      longitude: 80.648,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const lats = all.map((p) => p.latitude);
  const lons = all.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const pad = 0.00025;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max(maxLat - minLat + pad, DEFAULT_DELTA),
    longitudeDelta: Math.max(maxLon - minLon + pad, DEFAULT_DELTA),
  };
}

/** Keep native map overlays small — large polylgons crash some Android devices on stop. */
function mapRenderPoints(points: Coordinates[]): Coordinates[] {
  if (points.length <= MAX_MAP_POINTS) return points;
  const simplified = simplifyWalkPoints(points, 5);
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

export function FieldMeasureMap({
  points,
  livePosition,
  walking,
  reviewing = false,
}: FieldMeasureMapProps) {
  const { fm } = useTranslation();
  const mapRef = useRef<MapView>(null);
  const lastCameraUpdateRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const renderPoints = useMemo(() => mapRenderPoints(points), [points]);

  const safeFitCamera = (coords: { latitude: number; longitude: number }[], force = false) => {
    if (!mapRef.current || coords.length < 1 || reviewing) return;
    const now = Date.now();
    if (!force && walking && now - lastCameraUpdateRef.current < WALK_CAMERA_INTERVAL_MS) {
      return;
    }
    lastCameraUpdateRef.current = now;
    InteractionManager.runAfterInteractions(() => {
      if (!mountedRef.current || !mapRef.current) return;
      try {
        if (coords.length === 1) {
          const c = coords[0]!;
          mapRef.current.animateToRegion(
            {
              latitude: c.latitude,
              longitude: c.longitude,
              latitudeDelta: DEFAULT_DELTA,
              longitudeDelta: DEFAULT_DELTA,
            },
            300,
          );
          return;
        }
        const fitCoords =
          coords.length > MAX_MAP_POINTS
            ? mapRenderPoints(coords as Coordinates[]).map((p) => ({
                latitude: p.latitude,
                longitude: p.longitude,
              }))
            : coords;
        mapRef.current.fitToCoordinates(fitCoords, {
          edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
          animated: true,
        });
      } catch {
        // Map native calls can fail during GPS teardown — ignore
      }
    });
  };

  const startPoint = renderPoints[0] ?? null;
  const endPoint = renderPoints.length > 1 ? renderPoints[renderPoints.length - 1] : null;
  const showEndMarker = !walking && endPoint != null && renderPoints.length > 1;

  const pathCoords = useMemo(() => {
    const coords = renderPoints.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));
    if (walking && livePosition) {
      coords.push({
        latitude: livePosition.latitude,
        longitude: livePosition.longitude,
      });
    }
    return coords;
  }, [renderPoints, livePosition, walking]);

  const polygonCoords = useMemo(() => {
    if (renderPoints.length < 3) return [];
    return renderPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
  }, [renderPoints]);

  const initialRegion = useMemo(
    () => regionFromPoints(renderPoints, livePosition),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only set map region on first mount
    [],
  );

  // Camera follow only while walking — never refit on Stop (that was crashing native map).
  useEffect(() => {
    if (!walking || reviewing) return;
    if (!pathCoords.length && !livePosition) return;
    const coords =
      pathCoords.length > 0
        ? pathCoords
        : livePosition
          ? [{ latitude: livePosition.latitude, longitude: livePosition.longitude }]
          : [];
    safeFitCamera(coords);
  }, [pathCoords, livePosition, walking, reviewing]);

  useEffect(() => {
    if (renderPoints.length === 1 && walking) {
      safeFitCamera(
        [{ latitude: renderPoints[0]!.latitude, longitude: renderPoints[0]!.longitude }],
        true,
      );
    }
  }, [renderPoints.length, walking]);

  const visible = walking || points.length > 0;

  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <Caption style={styles.mapTitle}>{fm.mapTitle}</Caption>
      <View style={styles.mapBox}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          mapType="satellite"
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          rotateEnabled={false}
          moveOnMarkerPress={false}
          loadingEnabled
        >
          {pathCoords.length >= 2 ? (
            <Polyline
              coordinates={pathCoords}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {polygonCoords.length >= 3 ? (
            <Polygon
              coordinates={polygonCoords}
              fillColor={walking ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.35)'}
              strokeColor={walking ? `${colors.primary}99` : colors.primary}
              strokeWidth={2}
            />
          ) : null}

          {startPoint ? (
            <Marker
              coordinate={startPoint}
              title={fm.mapLegendStart}
              pinColor="green"
              tracksViewChanges={false}
            />
          ) : null}

          {showEndMarker && endPoint ? (
            <Marker
              coordinate={endPoint}
              title={fm.mapLegendEnd}
              pinColor="red"
              tracksViewChanges={false}
            />
          ) : null}

          {walking && livePosition ? (
            <Marker
              coordinate={livePosition}
              title={fm.mapLiveMarker}
              pinColor="blue"
              tracksViewChanges={false}
            />
          ) : null}
        </MapView>
      </View>

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
