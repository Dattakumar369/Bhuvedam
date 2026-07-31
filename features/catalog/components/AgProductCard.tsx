import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { BRAND_COLORS } from '@/constants/agCatalogFilters';
import { AgProductImage } from '@/features/catalog/components/AgProductImage';
import type { AgCatalogProduct } from '@/types/agCatalogProduct';
import { colors, radius, spacing } from '@/theme';

interface AgProductCardProps {
  product: AgCatalogProduct;
  compact?: boolean;
  categoryLabel?: string;
  onPress?: () => void;
}

export function AgProductCard({ product, compact, categoryLabel, onPress }: AgProductCardProps) {
  const brandColor = BRAND_COLORS[product.brand ?? ''] ?? colors.primary;
  const displayName = product.nameTe?.trim() ? product.nameTe : product.name;
  const target = product.targetPest ?? product.targetDisease;
  const subtitle = target ?? product.activeIngredient ?? product.brand;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={compact ? styles.compactWrap : undefined}>
      <Card variant="elevated" style={[styles.card, compact && styles.compactCard]}>
        <View style={styles.imageWrap}>
          <AgProductImage
            type={product.type}
            name={displayName}
            subtitle={subtitle}
            dose={product.dosage}
            imagePath={product.image}
            size="card"
          />
        </View>

        <View style={styles.body}>
          {product.brand ? (
            <View style={styles.brandRow}>
              <View style={[styles.brandPill, { backgroundColor: `${brandColor}18` }]}>
                <Label style={[styles.brandText, { color: brandColor }]}>{product.brand}</Label>
              </View>
              {categoryLabel ? <Caption style={styles.category}>{categoryLabel}</Caption> : null}
            </View>
          ) : null}

          <Title style={styles.name} numberOfLines={compact ? 2 : 3}>
            {displayName}
          </Title>

          {target ? <Caption style={styles.meta} numberOfLines={2}>Target: {target}</Caption> : null}
          {product.dosage ? <Caption style={styles.dose}>{product.dosage}</Caption> : null}

          {product.crops.length ? (
            <Caption style={styles.crops} numberOfLines={1}>
              {product.crops.slice(0, 4).join(', ')}
            </Caption>
          ) : null}
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
  body: { padding: spacing.sm, gap: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  brandPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  brandText: { fontSize: 10 },
  category: { color: colors.textTertiary, fontSize: 10 },
  name: { fontSize: 13, lineHeight: 17 },
  meta: { color: colors.textSecondary, lineHeight: 15 },
  dose: { color: colors.primary, fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  crops: { color: colors.textTertiary, fontSize: 10 },
});
