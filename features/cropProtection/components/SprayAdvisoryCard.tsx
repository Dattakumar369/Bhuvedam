import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Title } from '@/components/ui/Typography';
import type { SprayRecommendation } from '@/types/cropProtection';
import { colors, radius, spacing } from '@/theme';

const TYPE_COLORS: Record<SprayRecommendation['type'], string> = {
  insecticide: colors.error,
  fungicide: colors.warning,
  herbicide: '#795548',
  bio: colors.success,
  fertilizer_foliar: colors.info,
};

interface SprayAdvisoryCardProps {
  item: SprayRecommendation;
  showTelugu?: boolean;
}

export function SprayAdvisoryCard({ item, showTelugu = true }: SprayAdvisoryCardProps) {
  const typeColor = TYPE_COLORS[item.type];

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: `${typeColor}15` }]}>
          <MaterialCommunityIcons name="spray" size={22} color={typeColor} />
        </View>
        <View style={styles.headerText}>
          <Title>{item.productName}</Title>
          <Caption>{item.productNameTe}</Caption>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}18` }]}>
            <Caption style={{ color: typeColor, textTransform: 'capitalize' }}>{item.type}</Caption>
          </View>
        </View>
        <View style={styles.priceBox}>
          <Caption>Est. price</Caption>
          <Body style={styles.price}>{item.estimatedPrice}</Body>
        </View>
      </View>

      <Section title="Target / ఎదURu" text={showTelugu ? `${item.target} (${item.targetTe})` : item.target} />
      <Section title="Dose / మోతాదు" text={item.dose} />
      <Section
        title="How to spray / Pichikari ela"
        text={showTelugu ? `${item.howToSpray}\n${item.howToSprayTe}` : item.howToSpray}
      />
      <Section title="Best time / Samayam" text={item.bestTime} />

      <View style={styles.section}>
        <Body style={styles.sectionTitle}>⚠️ Precautions / Jagrathalu</Body>
        {(showTelugu ? item.precautionsTe : item.precautions).map((p) => (
          <View key={p} style={styles.bulletRow}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color={colors.warning} />
            <Caption style={styles.bulletText}>{p}</Caption>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Body style={styles.sectionTitle}>📍 Where to buy / Ekkada dorukutundi</Body>
        {item.whereToBuy.map((place) => (
          <View key={place} style={styles.bulletRow}>
            <MaterialCommunityIcons name="store-outline" size={14} color={colors.primary} />
            <Caption style={styles.bulletText}>{place}</Caption>
          </View>
        ))}
      </View>
    </Card>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.section}>
      <Body style={styles.sectionTitle}>{title}</Body>
      <Caption style={styles.sectionText}>{text}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  header: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 4 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginTop: 4,
  },
  priceBox: { alignItems: 'flex-end' },
  price: { fontFamily: 'Poppins_600SemiBold', color: colors.primary, fontSize: 13 },
  section: { gap: spacing.xs },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  sectionText: { lineHeight: 20 },
  bulletRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'flex-start' },
  bulletText: { flex: 1, lineHeight: 18 },
});
