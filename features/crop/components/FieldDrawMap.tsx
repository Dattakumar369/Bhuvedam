import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, Polyline, PROVIDER_GOOGLE, type Region } from 'react-native-maps';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { Caption } from '@/components/ui/Typography';
import { isGoogleMapsConfigured } from '@/constants/mapsConfig';
import { requestLocationPermission } from '@/services/location/locationService';
import type { Coordinates } from '@/types/location';
import { colors, radius, spacing } from '@/theme';

interface FieldDrawMapProps {
  points: Coordinates[];
  onAddPoint: (point: Coordinates) => void;
}

const DRAW_HEIGHT = 360;
const DEFAULT_REGION: Region = {
  latitude: 16.5062,
  longitude: 80.648,
  latitudeDelta: 0.004,
  longitudeDelta: 0.004,
};

function FieldDrawMapInner({ points, onAddPoint }: FieldDrawMapProps) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const polygonCoords = useMemo(
    () => points.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    [points],
  );

  const centerOnUser = useCallback(async () => {
    try {
      const perm = await requestLocationPermission();
      if (perm !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setUserLocation(coords);
      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        500,
      );
    } catch {
      // map still usable without GPS center
    }
  }, []);

  useEffect(() => {
    void centerOnUser();
  }, [centerOnUser]);

  const handleMapPress = (e: { nativeEvent: { coordinate: Coordinates } }) => {
    onAddPoint(e.nativeEvent.coordinate);
  };

  if (!isGoogleMapsConfigured()) {
    return (
      <View style={[styles.box, styles.placeholder]}>
        <Caption style={styles.placeholderText}>
          Google Maps key ledu — Map draw mode ki new APK build avasaram. GPS modes use cheyandi.
        </Caption>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <Caption style={styles.hint}>Satellite map lo polam moolalu tap cheyandi (min 3)</Caption>
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
          initialRegion={DEFAULT_REGION}
          onMapReady={() => setReady(true)}
          onPress={ready ? handleMapPress : undefined}
          showsUserLocation
          showsMyLocationButton={false}
          rotateEnabled={false}
          loadingEnabled
        >
          {polygonCoords.length >= 2 ? (
            <Polyline
              coordinates={polygonCoords}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {polygonCoords.length >= 3 ? (
            <Polygon
              coordinates={polygonCoords}
              fillColor="rgba(46, 125, 50, 0.35)"
              strokeColor={colors.primary}
              strokeWidth={2}
            />
          ) : null}

          {points.map((point, index) => (
            <Marker
              key={`draw-${point.latitude}-${point.longitude}-${index}`}
              coordinate={point}
              title={`Moola ${index + 1}`}
              pinColor={index === 0 ? 'green' : colors.primary}
              tracksViewChanges={false}
            />
          ))}

          {userLocation ? (
            <Marker
              coordinate={userLocation}
              title="Meeru ikkada"
              pinColor="blue"
              tracksViewChanges={false}
            />
          ) : null}
        </MapView>
      </View>
      <Caption style={styles.footer}>
        {points.length} moolalu · pinch zoom chesi exact ga mark cheyandi
      </Caption>
    </View>
  );
}

export function FieldDrawMap(props: FieldDrawMapProps) {
  return (
    <MapErrorBoundary fallbackMessage="Map load avvaledu — GPS modes try cheyandi.">
      <FieldDrawMapInner {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hint: { flex: 1, color: colors.textSecondary, lineHeight: 18 },
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
    height: DRAW_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  },
  map: { flex: 1 },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: `${colors.primary}08`,
  },
  placeholderText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  footer: { textAlign: 'center', color: colors.textTertiary, fontSize: 11 },
});
