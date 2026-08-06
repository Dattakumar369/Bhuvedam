import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui';
import { Body, Caption } from '@/components/ui/Typography';
import type { NearbyPlace } from '@/types/nearbyPlace';
import { colors, radius, spacing } from '@/theme';

function typeLabel(placeType: string): string {
  if (placeType === 'mandi') return 'Mandi';
  if (placeType === 'fertilizer_shop') return 'Fertilizer shop';
  if (placeType === 'seed_shop') return 'Seed shop';
  return 'Ag dealer';
}

function typeIcon(placeType: string): keyof typeof MaterialCommunityIcons.glyphMap {
  if (placeType === 'mandi') return 'storefront-outline';
  return 'sprout-outline';
}

function openDirections(place: NearbyPlace) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
  void Linking.openURL(url);
}

interface NearbyPlaceCardProps {
  place: NearbyPlace;
}

export function NearbyPlaceCard({ place }: NearbyPlaceCardProps) {
  return (
    <Pressable onPress={() => openDirections(place)}>
      <Card variant="outlined" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name={typeIcon(place.placeType)}
              size={22}
              color={place.placeType === 'mandi' ? colors.warning : colors.primary}
            />
          </View>
          <View style={styles.body}>
            <Body style={styles.name} numberOfLines={2}>
              {place.name}
            </Body>
            <Caption style={styles.meta}>
              {typeLabel(place.placeType)}
              {place.district ? ` · ${place.district}` : ''}
            </Caption>
            {place.address ? (
              <Caption style={styles.address} numberOfLines={2}>
                {place.address}
              </Caption>
            ) : null}
          </View>
          <View style={styles.side}>
            <Caption style={styles.distance}>{place.distanceKm} km</Caption>
            <MaterialCommunityIcons name="directions" size={20} color={colors.primary} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  name: { fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary, lineHeight: 20 },
  meta: { color: colors.textSecondary, fontSize: 11 },
  address: { color: colors.textTertiary, fontSize: 11, lineHeight: 16 },
  side: { alignItems: 'center', gap: spacing.xxs },
  distance: { fontFamily: 'Poppins_600SemiBold', color: colors.primary, fontSize: 11 },
});
