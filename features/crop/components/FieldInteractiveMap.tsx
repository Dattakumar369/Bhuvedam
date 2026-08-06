import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { SearchInput } from '@/components/ui';
import { Caption } from '@/components/ui/Typography';
import { isGoogleMapsConfigured } from '@/constants/mapsConfig';
import { searchPlaces } from '@/services/geo/placeSearchService';
import { requestLocationPermission } from '@/services/location/locationService';
import type { Coordinates, PlaceSearchResult } from '@/types/location';
import { colors, radius, spacing } from '@/theme';

export type FieldMapMode = 'draw' | 'corner' | 'walk';

interface FieldInteractiveMapProps {
  mode: FieldMapMode;
  points: Coordinates[];
  livePosition?: Coordinates | null;
  walking?: boolean;
  onAddPoint?: (point: Coordinates) => void;
  onMovePoint?: (index: number, point: Coordinates) => void;
}

const MAP_HEIGHT = 360;
const DEFAULT_REGION: Region = {
  latitude: 16.5062,
  longitude: 80.648,
  latitudeDelta: 0.004,
  longitudeDelta: 0.004,
};
const DEFAULT_DELTA = 0.0008;

function regionFromPoints(points: Coordinates[], live?: Coordinates | null): Region {
  const all = [...points];
  if (live) all.push(live);
  if (!all.length) return DEFAULT_REGION;

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

function FieldInteractiveMapInner({
  mode,
  points,
  livePosition,
  walking = false,
  onAddPoint,
  onMovePoint,
}: FieldInteractiveMapProps) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
  const [placeSearching, setPlaceSearching] = useState(false);

  const showSearch = mode === 'draw' || mode === 'corner';
  const tappable = mode === 'draw' && Boolean(onAddPoint);
  const editable =
    Boolean(onMovePoint) &&
    points.length > 0 &&
    (mode === 'draw' || mode === 'corner' || (mode === 'walk' && !walking));

  const polygonCoords = useMemo(
    () => points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    [points],
  );

  const pathCoords = useMemo(() => {
    const coords = [...polygonCoords];
    if (mode === 'walk' && walking && livePosition) {
      coords.push({ latitude: livePosition.latitude, longitude: livePosition.longitude });
    }
    return coords;
  }, [polygonCoords, mode, walking, livePosition]);

  const initialRegion = useMemo(
    () => regionFromPoints(points, livePosition),
    [points, livePosition],
  );

  const centerOnCoords = useCallback((coords: Coordinates, delta = 0.003) => {
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: delta, longitudeDelta: delta },
      500,
    );
  }, []);

  const centerOnUser = useCallback(async () => {
    try {
      const perm = await requestLocationPermission();
      if (perm !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      centerOnCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    } catch {
      // ignore
    }
  }, [centerOnCoords]);

  useEffect(() => {
    if (mode === 'draw' || mode === 'corner') void centerOnUser();
  }, [mode, centerOnUser]);

  useEffect(() => {
    const q = placeQuery.trim();
    if (!showSearch || q.length < 2) {
      setPlaceResults([]);
      setPlaceSearching(false);
      return;
    }

    setPlaceSearching(true);
    const timer = setTimeout(() => {
      void searchPlaces(q, { limit: 5, countryCode: 'in' }).then((results) => {
        setPlaceResults(results);
        setPlaceSearching(false);
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [placeQuery, showSearch]);

  useEffect(() => {
    if (!mapRef.current || !ready) return;
    try {
      if (pathCoords.length >= 2) {
        mapRef.current.fitToCoordinates(pathCoords, {
          edgePadding: { top: 56, right: 48, bottom: 48, left: 48 },
          animated: true,
        });
      } else if (livePosition && mode === 'walk') {
        centerOnCoords(livePosition);
      }
    } catch {
      // ignore
    }
  }, [pathCoords, ready, livePosition, mode, centerOnCoords]);

  const handleMapPress = (e: { nativeEvent: { coordinate: Coordinates } }) => {
    if (tappable) onAddPoint?.(e.nativeEvent.coordinate);
  };

  const selectPlace = (place: PlaceSearchResult) => {
    if (place.latitude == null || place.longitude == null) return;
    setPlaceQuery(place.label);
    setPlaceResults([]);
    centerOnCoords({ latitude: place.latitude, longitude: place.longitude }, 0.004);
  };

  if (!isGoogleMapsConfigured()) {
    return (
      <View style={[styles.box, styles.placeholder]}>
        <Caption style={styles.placeholderText}>
          Google Maps key ledu — satellite map + adjust ki new APK avasaram.
        </Caption>
      </View>
    );
  }

  const hintText =
    mode === 'draw'
      ? 'Village search chesi map center cheyandi · moolalu tap · pin drag chesi adjust'
      : mode === 'corner'
        ? 'Map lo chusi GPS pin chesaka marker drag chesi exact ga adjust cheyandi'
        : walking
          ? 'Polam chuttu tirugutunnaru — map lo live path kanipistundi'
          : 'Walk aipoyaka moolalu drag chesi adjust cheyochu';

  return (
    <View style={styles.wrap}>
      {showSearch ? (
        <View style={styles.searchBlock}>
          <SearchInput
            value={placeQuery}
            onChangeText={setPlaceQuery}
            placeholder="Village / mandal search — polam daggaraki map vellandi"
          />
          {placeSearching ? (
            <Caption style={styles.searchStatus}>Searching…</Caption>
          ) : null}
          {placeResults.length > 0 ? (
            <ScrollView style={styles.results} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {placeResults.map((place) => (
                <Pressable key={place.label} style={styles.resultRow} onPress={() => selectPlace(place)}>
                  <MaterialCommunityIcons name="map-marker" size={18} color={colors.primary} />
                  <Caption style={styles.resultText} numberOfLines={2}>
                    {place.label}
                  </Caption>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <Caption style={styles.hint}>{hintText}</Caption>
        <Pressable style={styles.locBtn} onPress={() => void centerOnUser()} accessibilityLabel="My location">
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.box}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType="satellite"
          initialRegion={initialRegion}
          onMapReady={() => setReady(true)}
          onPress={ready && tappable ? handleMapPress : undefined}
          showsUserLocation
          showsMyLocationButton={false}
          rotateEnabled={false}
          scrollEnabled
          zoomEnabled
          pitchEnabled={false}
          loadingEnabled
        >
          {pathCoords.length >= 2 ? (
            <Polyline
              coordinates={pathCoords}
              strokeColor={colors.primary}
              strokeWidth={mode === 'walk' ? 4 : 3}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {polygonCoords.length >= 3 && (mode !== 'walk' || !walking) ? (
            <Polygon
              coordinates={polygonCoords}
              fillColor="rgba(46, 125, 50, 0.35)"
              strokeColor={colors.primary}
              strokeWidth={2}
            />
          ) : null}

          {points.map((point, index) => (
            <Marker
              key={`pt-${index}-${point.latitude.toFixed(6)}-${point.longitude.toFixed(6)}`}
              coordinate={point}
              title={`Moola ${index + 1}`}
              description={editable ? 'Drag chesi adjust cheyandi' : undefined}
              pinColor={index === 0 ? 'green' : mode === 'walk' ? 'orange' : colors.primary}
              draggable={editable}
              onDragEnd={(e) => onMovePoint?.(index, e.nativeEvent.coordinate)}
              tracksViewChanges={false}
            />
          ))}

          {mode === 'walk' && walking && livePosition ? (
            <Marker
              coordinate={livePosition}
              title="Ippudu ikkada"
              pinColor="blue"
              tracksViewChanges={false}
            />
          ) : null}
        </MapView>
      </View>

      <Caption style={styles.footer}>
        {points.length} moolalu
        {editable ? ' · pin pattukoni drag chesi adjust cheyandi' : ''}
      </Caption>
    </View>
  );
}

export function FieldInteractiveMap(props: FieldInteractiveMapProps) {
  return (
    <MapErrorBoundary fallbackMessage="Map load avvaledu — GPS modes try cheyandi.">
      <FieldInteractiveMapInner {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  searchBlock: { gap: spacing.xxs },
  searchStatus: { color: colors.textTertiary, fontSize: 11, marginLeft: spacing.xs },
  results: {
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultText: { flex: 1, color: colors.textPrimary, lineHeight: 18 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  hint: { flex: 1, color: colors.textSecondary, lineHeight: 18, fontSize: 11 },
  locBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    height: MAP_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  },
  map: { flex: 1 },
  placeholder: {
    height: MAP_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: `${colors.primary}08`,
    borderRadius: radius.lg,
  },
  placeholderText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  footer: { textAlign: 'center', color: colors.textTertiary, fontSize: 11 },
});
