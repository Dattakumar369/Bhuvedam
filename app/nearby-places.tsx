import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapErrorBoundary } from '@/components/MapErrorBoundary';
import { Card, Header } from '@/components/ui';
import { Body, Caption } from '@/components/ui/Typography';
import { isGoogleMapsConfigured } from '@/constants/mapsConfig';
import { NearbyPlaceCard } from '@/features/places/components/NearbyPlaceCard';
import { useNearbyPlaces } from '@/hooks/useNearbyPlaces';
import type { NearbyPlaceFilter } from '@/types/nearbyPlace';
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
}: {
  latitude: number;
  longitude: number;
  places: Array<{ id: string; name: string; latitude: number; longitude: number; placeType: string }>;
}) {
  const region = useMemo(
    () => ({
      latitude,
      longitude,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    }),
    [latitude, longitude],
  );

  if (!isGoogleMapsConfigured()) {
    return (
      <Card variant="outlined" style={styles.mapPlaceholder}>
        <Caption style={styles.mapPlaceholderText}>Map preview — list lo directions tap cheyandi</Caption>
      </Card>
    );
  }

  return (
    <MapErrorBoundary fallbackMessage="Map load avvaledu — list nunchi directions use cheyandi.">
      <View style={styles.mapBox}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType="standard"
          initialRegion={region}
          showsUserLocation
          rotateEnabled={false}
        >
          {places.map((place) => (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              title={place.name}
              pinColor={place.placeType === 'mandi' ? 'orange' : 'green'}
            />
          ))}
        </MapView>
      </View>
    </MapErrorBoundary>
  );
}

export default function NearbyPlacesScreen() {
  const insets = useSafeAreaInsets();
  const { places, latitude, longitude, locationLabel, isLoading, error, filter, setFilter, refresh } =
    useNearbyPlaces();
  const [refreshing, setRefreshing] = useState(false);

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
          <NearbyPlacesMap latitude={latitude} longitude={longitude} places={places} />
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
  mapBox: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: { flex: 1 },
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
