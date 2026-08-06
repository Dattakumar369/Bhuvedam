import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { Card, Header } from '@/components/ui';
import { Body, Caption } from '@/components/ui/Typography';
import { isGoogleMapsConfigured } from '@/constants/mapsConfig';
import { FIELD_DEFAULT_ZOOM, NEARBY_MAP_MAX_ZOOM, NEARBY_OVERVIEW_DELTA, regionAt } from '@/constants/mapViewConfig';
import { NearbyPlaceCard } from '@/features/places/components/NearbyPlaceCard';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import type { NearbyPlaceFilter } from '@/types/nearbyPlace';
import { centerMapAtZoom, stepMapZoom } from '@/utils/mapCameraZoom';
import { reverseGeocodeMapLabel } from '@/utils/mapLocationLabel';
import { colors, layout, radius, spacing } from '@/theme';

const FILTERS: { id: NearbyPlaceFilter; label: string }[] = [
  { id: 'all', label: 'Anni' },
  { id: 'mandi', label: 'Mandi' },
  { id: 'shop', label: 'Shops' },
];

function NearbyPlacesMap({
  latitude,
  longitude,
  places,
  areaLabel,
}: {
  latitude: number;
  longitude: number;
  places: Array<{ id: string; name: string; latitude: number; longitude: number; placeType: string }>;
  areaLabel: string | null;
}) {
  const mapRef = useRef<MapView>(null);
  const [ready, setReady] = useState(false);
  const [mapRegion, setMapRegion] = useState(regionAt(latitude, longitude, NEARBY_OVERVIEW_DELTA));

  const region = useMemo(
    () => regionAt(latitude, longitude, NEARBY_OVERVIEW_DELTA),
    [latitude, longitude],
  );

  useEffect(() => {
    if (!mapRef.current || !ready || places.length === 0) return;
    const coords = [
      { latitude, longitude },
      ...places.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    ];
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 48, right: 40, bottom: 40, left: 40 },
      animated: true,
    });
  }, [ready, places, latitude, longitude]);

  if (!isGoogleMapsConfigured()) {
    return (
      <Card variant="outlined" style={styles.mapPlaceholder}>
        <Caption style={styles.mapPlaceholderText}>Map preview — list lo directions tap cheyandi</Caption>
      </Card>
    );
  }

  return (
    <View style={styles.mapSection}>
      {areaLabel ? (
        <View style={styles.areaLabelBox}>
          <MaterialCommunityIcons name="map-marker-radius" size={16} color={colors.primary} />
          <Caption style={styles.areaLabelText} numberOfLines={2}>
            {areaLabel}
          </Caption>
        </View>
      ) : null}
      <MapErrorBoundary fallbackMessage="Map load avvaledu — list nunchi directions use cheyandi.">
        <View style={styles.mapBox}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            mapType="standard"
            initialRegion={region}
            onMapReady={() => {
              setReady(true);
              centerMapAtZoom(mapRef, latitude, longitude, FIELD_DEFAULT_ZOOM);
            }}
            onRegionChangeComplete={setMapRegion}
            showsUserLocation
            rotateEnabled={false}
            zoomEnabled
            scrollEnabled
            minZoomLevel={12}
            maxZoomLevel={NEARBY_MAP_MAX_ZOOM}
          >
            {places.map((place) => (
              <Marker
                key={place.id}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                title={place.name}
                description={place.placeType === 'mandi' ? 'Mandi market' : 'Ag shop'}
                pinColor={place.placeType === 'mandi' ? 'orange' : 'green'}
              />
            ))}
          </MapView>
          <View style={styles.zoomRow}>
            <Pressable
              style={styles.zoomBtn}
              onPress={() => void stepMapZoom(mapRef, 'in', mapRegion)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              style={[styles.zoomBtn, styles.ultraZoomBtn]}
              onPress={() => void stepMapZoom(mapRef, 'ultra', mapRegion)}
            >
              <MaterialCommunityIcons name="magnify-plus" size={18} color={colors.surface} />
            </Pressable>
            <Pressable
              style={styles.zoomBtn}
              onPress={() => void stepMapZoom(mapRef, 'out', mapRegion)}
            >
              <MaterialCommunityIcons name="minus" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </MapErrorBoundary>
    </View>
  );
}

export default function NearbyPlacesScreen() {
  const insets = useSafeAreaInsets();
  const { places, latitude, longitude, locationLabel, isLoading, error, filter, setFilter, refresh } =
    useNearbyPlaces();
  const [refreshing, setRefreshing] = useState(false);
  const [areaLabel, setAreaLabel] = useState<string | null>(locationLabel);

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    void reverseGeocodeMapLabel(latitude, longitude).then((label) => {
      if (label) setAreaLabel(label);
    });
  }, [latitude, longitude]);

  useEffect(() => {
    if (locationLabel) setAreaLabel(locationLabel);
  }, [locationLabel]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Mandi & Shops" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="elevated" style={styles.intro}>
          <Body style={styles.introTitle}>Daggara unna mandi & fertilizer shops</Body>
          <Caption style={styles.introBody}>
            Mee location batti daggaralo unna APMC markets mariyu fertilizer/seed dealers chupistam.
            Card tap chesi Google Maps directions open avutayi.
          </Caption>
          {locationLabel ? (
            <View style={styles.locRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
              <Caption style={styles.locText}>{locationLabel}</Caption>
            </View>
          ) : null}
        </Card>

        <View style={styles.filterRow}>
          {FILTERS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
            >
              <Caption style={[styles.filterText, filter === item.id && styles.filterTextActive]}>
                {item.label}
              </Caption>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Caption style={styles.loadingText}>Daggara mandi/shops search avutunnayi…</Caption>
          </View>
        ) : null}

        {!isLoading && latitude != null && longitude != null ? (
          <NearbyPlacesMap
            latitude={latitude}
            longitude={longitude}
            places={places}
            areaLabel={areaLabel}
          />
        ) : null}

        {!isLoading && places.length > 0 ? (
          <Caption style={styles.count}>{places.length} places — tap chesi directions</Caption>
        ) : null}

        {places.map((place) => (
          <NearbyPlaceCard key={place.id} place={place} />
        ))}

        {error && !isLoading ? <Caption style={styles.error}>{error}</Caption> : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  intro: { gap: spacing.sm, padding: spacing.lg },
  introTitle: { fontFamily: 'Poppins_700Bold', color: colors.primary, fontSize: 18 },
  introBody: { color: colors.textSecondary, lineHeight: 20 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  locText: { color: colors.textTertiary },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontFamily: 'Poppins_600SemiBold', color: colors.primary, fontSize: 12 },
  filterTextActive: { color: colors.surface },
  loadingBox: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  loadingText: { color: colors.textSecondary },
  mapSection: { gap: spacing.xs },
  areaLabelBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: `${colors.primary}10`,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
  },
  areaLabelText: { flex: 1, color: colors.textPrimary, lineHeight: 18, fontSize: 12 },
  mapBox: {
    height: 280,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
  zoomRow: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    gap: spacing.xs,
  },
  ultraZoomBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  mapPlaceholderText: { color: colors.textSecondary, textAlign: 'center' },
  count: { color: colors.textTertiary, textAlign: 'center' },
  error: { color: colors.error, textAlign: 'center', lineHeight: 18 },
});
