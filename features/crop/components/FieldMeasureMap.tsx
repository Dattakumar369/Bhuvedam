import { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { Caption } from '@/components/ui/Typography';
import type { Coordinates } from '@/types/location';
import { colors, radius, spacing } from '@/theme';

interface FieldMeasureMapProps {
  points: Coordinates[];
  livePosition?: Coordinates | null;
  walking: boolean;
}

const MAP_HEIGHT = 280;
const DEFAULT_DELTA = 0.0008;

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

export function FieldMeasureMap({ points, livePosition, walking }: FieldMeasureMapProps) {
  const mapRef = useRef<MapView>(null);

  const startPoint = points[0] ?? null;
  const endPoint = points.length > 1 ? points[points.length - 1] : null;
  const showEndMarker = !walking && endPoint != null && points.length > 1;

  const pathCoords = useMemo(() => {
    const coords = points.map((p) => ({
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
  }, [points, livePosition, walking]);

  const polygonCoords = useMemo(() => {
    if (points.length < 3) return [];
    return points.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
  }, [points]);

  const initialRegion = useMemo(
    () => regionFromPoints(points, livePosition),
    [points, livePosition],
  );

  useEffect(() => {
    if (!mapRef.current || pathCoords.length < 1) {
      if (walking && livePosition && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: livePosition.latitude,
            longitude: livePosition.longitude,
            latitudeDelta: DEFAULT_DELTA,
            longitudeDelta: DEFAULT_DELTA,
          },
          400,
        );
      }
      return;
    }
    mapRef.current.fitToCoordinates(pathCoords, {
      edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
      animated: true,
    });
  }, [pathCoords, walking, livePosition]);

  const visible = walking || points.length > 0;

  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <Caption style={styles.mapTitle}>Satellite map — mee polam chuttu tirigina path</Caption>
      <View style={styles.mapBox}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          mapType="satellite"
          initialRegion={initialRegion}
          showsUserLocation={walking}
          showsMyLocationButton={walking}
          rotateEnabled={false}
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

          {polygonCoords.length >= 3 && !walking ? (
            <Polygon
              coordinates={polygonCoords}
              fillColor="rgba(46, 125, 50, 0.35)"
              strokeColor={colors.primary}
              strokeWidth={2}
            />
          ) : null}

          {walking && polygonCoords.length >= 3 ? (
            <Polygon
              coordinates={polygonCoords}
              fillColor="rgba(46, 125, 50, 0.2)"
              strokeColor={`${colors.primary}99`}
              strokeWidth={2}
            />
          ) : null}

          {startPoint ? (
            <Marker
              coordinate={startPoint}
              title="Modalupettadam"
              description="Ekkada nunchi start chesaru"
              pinColor="green"
            />
          ) : null}

          {showEndMarker && endPoint ? (
            <Marker
              coordinate={endPoint}
              title="Aapadam"
              description="Ekkada aaparu"
              pinColor="red"
            />
          ) : null}

          {walking && livePosition && points.length === 0 ? (
            <Marker
              coordinate={livePosition}
              title="Ippudu ikkada"
              description="GPS fix avutundi..."
              pinColor="blue"
            />
          ) : null}
        </MapView>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotStart]} />
          <Caption style={styles.legendText}>🟢 Modalupettadam (start)</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotEnd]} />
          <Caption style={styles.legendText}>🔴 Aapadam (stop)</Caption>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotArea]} />
          <Caption style={styles.legendText}>Green = cover chesina bhumi</Caption>
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
