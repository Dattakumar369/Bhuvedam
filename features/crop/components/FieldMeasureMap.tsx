import Constants from 'expo-constants';
import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
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
  mapKey: string;
}

const MAP_HEIGHT = 280;
const DEFAULT_DELTA = 0.0008;
const MAX_MAP_POINTS = 32;

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

function hasGoogleMapsApiKey(): boolean {
  const key =
    Constants.expoConfig?.android?.config?.googleMaps?.apiKey ??
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
    '';
  return Boolean(String(key).trim());
}

function FieldMeasureMapInner({
  points,
  livePosition,
  walking,
  reviewing = false,
  mapKey,
}: FieldMeasureMapProps) {
  const { fm } = useTranslation();
  const useGoogleProvider = Platform.OS === 'android' && hasGoogleMapsApiKey();

  const renderPoints = useMemo(() => mapRenderPoints(points), [points]);

  const mapRegion = useMemo(
    () => regionFromPoints(renderPoints, walking ? livePosition : null),
    [renderPoints, livePosition, walking, mapKey],
  );

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

  const showPolygon = reviewing && !walking && renderPoints.length >= 3;
  const polygonCoords = showPolygon
    ? renderPoints.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))
    : [];

  const startPoint = renderPoints[0] ?? null;
  const endPoint = renderPoints.length > 1 ? renderPoints[renderPoints.length - 1] : null;
  const showEndMarker = reviewing && !walking && endPoint != null && renderPoints.length > 1;

  return (
    <View style={styles.wrap}>
      <Caption style={styles.mapTitle}>{fm.mapTitle}</Caption>
      <View style={styles.mapBox}>
        <MapView
          key={mapKey}
          style={styles.map}
          provider={useGoogleProvider ? PROVIDER_GOOGLE : undefined}
          mapType="satellite"
          initialRegion={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          rotateEnabled={false}
          scrollEnabled={!walking}
          zoomEnabled={!walking}
          pitchEnabled={false}
          moveOnMarkerPress={false}
          loadingEnabled
          cacheEnabled
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

          {showPolygon ? (
            <Polygon
              coordinates={polygonCoords}
              fillColor="rgba(46, 125, 50, 0.35)"
              strokeColor={colors.primary}
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
