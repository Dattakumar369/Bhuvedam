import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, UrlTile, type Region } from 'react-native-maps';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { Caption } from '@/components/ui/Typography';
import { isGoogleMapsConfigured } from '@/constants/mapsConfig';
import {
  FIELD_BASEMAP_LAYERS,
  getFieldBasemap,
  type FieldBasemapId,
} from '@/constants/mapStyles';
import type { Coordinates } from '@/types/location';
import { colors, radius, spacing } from '@/theme';

interface FieldMeasureMapProps {
  points: Coordinates[];
  livePosition?: Coordinates | null;
  walking: boolean;
  /** When false, map is not mounted (avoids native crash during walk on Android APK). */
  enabled?: boolean;
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

function FieldMeasureMapInner({ points, livePosition, walking }: FieldMeasureMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapLayer, setMapLayer] = useState<FieldBasemapId>('recent');
  const basemap = getFieldBasemap(mapLayer);
  const usesCustomTiles = Boolean(basemap.urlTemplate);

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
    if (!mapRef.current) return;
    try {
      if (pathCoords.length < 2) {
        if (walking && livePosition) {
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
    } catch {
      // Map native call failed — GPS path still works without camera animation.
    }
  }, [pathCoords, walking, livePosition]);

  if (!isGoogleMapsConfigured()) {
    return (
      <View style={styles.wrap}>
        <Caption style={styles.mapTitle}>GPS path record avutundi — map review taruvata chupistundi</Caption>
        <View style={[styles.mapBox, styles.mapPlaceholder]}>
          <Caption style={styles.placeholderText}>
            {points.length} GPS points · satellite map taruvata chupistundi
          </Caption>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Caption style={styles.mapTitle}>Satellite map — mee polam chuttu tirigina path</Caption>
      <View style={styles.layerRow}>
        {FIELD_BASEMAP_LAYERS.map((layer) => {
          const active = mapLayer === layer.id;
          return (
            <Pressable
              key={layer.id}
              style={[styles.layerChip, active && styles.layerChipActive]}
              onPress={() => setMapLayer(layer.id)}
            >
              <Caption style={[styles.layerText, active && styles.layerTextActive]}>
                {layer.label}
              </Caption>
            </Pressable>
          );
        })}
      </View>
      <Caption style={styles.layerHint}>{basemap.hint}</Caption>
      <View style={styles.mapBox}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType={basemap.googleMapType ?? 'satellite'}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          rotateEnabled={false}
          scrollEnabled
          zoomEnabled
          pitchEnabled={false}
          loadingEnabled
        >
          {usesCustomTiles && basemap.urlTemplate ? (
            <UrlTile
              key={basemap.id}
              urlTemplate={basemap.urlTemplate}
              maximumZ={basemap.maxZoom}
              flipY={false}
              zIndex={-1}
              shouldReplaceMapContent
            />
          ) : null}

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

          {startPoint ? (
            <Marker
              coordinate={startPoint}
              title="Modalupettadam"
              description="Ekkada nunchi start chesaru"
              pinColor="green"
              tracksViewChanges={false}
            />
          ) : null}

          {showEndMarker && endPoint ? (
            <Marker
              coordinate={endPoint}
              title="Aapadam"
              description="Ekkada aaparu"
              pinColor="red"
              tracksViewChanges={false}
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
        <Caption style={styles.attr}>{basemap.attribution}</Caption>
      </View>
    </View>
  );
}

export function FieldMeasureMap({ enabled = true, points, ...rest }: FieldMeasureMapProps) {
  if (!enabled || points.length === 0) return null;

  return (
    <MapErrorBoundary fallbackMessage="Map load avvaledu — GPS tho area measure avutundi kindha.">
      <FieldMeasureMapInner points={points} {...rest} />
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
  layerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  layerChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  layerChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  layerText: { fontFamily: 'Poppins_600SemiBold', color: colors.primary, fontSize: 11 },
  layerTextActive: { color: colors.surface },
  layerHint: {
    color: colors.textTertiary,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  mapBox: {
    height: MAP_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}08`,
    padding: spacing.md,
  },
  placeholderText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  attr: { color: colors.textTertiary, fontSize: 9, marginTop: spacing.xxs },
});
