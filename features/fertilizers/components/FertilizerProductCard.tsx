import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { BRAND_COLORS, categoryLabelTe } from '@/constants/fertilizerCatalog';
import { AgProductImage } from '@/features/catalog/components/AgProductImage';
import type { FertilizerProduct } from '@/types/fertilizerProduct';
import { colors, radius, spacing } from '@/theme';

interface FertilizerProductCardProps {
  product: FertilizerProduct;
  compact?: boolean;
  onPress?: () => void;
}

export function FertilizerProductCard({ product, compact, onPress }: FertilizerProductCardProps) {
  const brandColor = BRAND_COLORS[product.brand] ?? colors.primary;
  const displayName = product.nameTe?.trim() ? product.nameTe : product.name;
  const subtitle = product.nameTe?.trim() ? product.name : product.brand;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={compact ? styles.compactWrap : undefined}>
      <Card variant="elevated" style={[styles.card, compact && styles.compactCard]}>
        <View style={styles.imageWrap}>
          <AgProductImage
            type="fertilizer"
            name={displayName}
            subtitle={product.npk ? `NPK ${product.npk}` : product.brand}
            dose={product.dosage}
            imagePath={product.image}
            size="card"
          />
          {product.isSubsidized ? (
            <View style={styles.subsidyBadge}>
              <Caption style={styles.subsidyText}>Subsidy</Caption>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <View style={styles.brandRow}>
            <View style={[styles.brandPill, { backgroundColor: `${brandColor}18` }]}>
              <Label style={[styles.brandText, { color: brandColor }]}>{product.brand}</Label>
            </View>
            <Caption style={styles.category}>{categoryLabelTe(product.category)}</Caption>
          </View>

          <Title style={styles.name} numberOfLines={compact ? 2 : 3}>
            {displayName}
          </Title>
          {!compact && subtitle !== displayName ? (
            <Caption style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Caption>
          ) : null}

          {product.npk ? (
            <View style={styles.npkRow}>
              <MaterialCommunityIcons name="flask-outline" size={14} color={colors.textTertiary} />
              <Caption style={styles.npk}>NPK {product.npk}</Caption>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Body style={styles.price} numberOfLines={1}>
              {product.mrp ?? 'Price on enquiry'}
            </Body>
            {product.packSize ? <Caption style={styles.pack}>{product.packSize}</Caption> : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactWrap: { width: '48%' },
  card: { padding: 0, overflow: 'hidden' },
  compactCard: { flex: 1 },
  imageWrap: { position: 'relative' },
  imagePlaceholder: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  subsidyBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  subsidyText: { color: colors.white, fontSize: 9, fontFamily: 'Poppins_600SemiBold' },
  body: { padding: spacing.sm, gap: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  brandPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  brandText: { fontSize: 10 },
  category: { color: colors.textTertiary, fontSize: 10 },
  name: { fontSize: 14, lineHeight: 18 },
  subtitle: { color: colors.textSecondary },
  npkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  npk: { color: colors.textSecondary },
  footer: { marginTop: spacing.xs, gap: 2 },
  price: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  pack: { color: colors.textTertiary, fontSize: 11 },
});
