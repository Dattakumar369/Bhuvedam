import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Header } from '@/components/ui';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { BRAND_COLORS } from '@/constants/agCatalogFilters';
import { CROPS } from '@/constants/crops';
import { AgProductImage } from '@/features/catalog/components/AgProductImage';
import { fetchAgCatalogProductById } from '@/services/catalog/agProductCatalogService';
import type { AgCatalogProduct } from '@/types/agCatalogProduct';
import { colors, layout, radius, spacing } from '@/theme';

function cropLabel(id: string): string {
  const crop = CROPS.find((c) => c.id === id);
  return crop?.nameTe ?? crop?.name ?? id;
}

export function AgProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<AgCatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAgCatalogProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const brandColor = product ? (BRAND_COLORS[product.brand ?? ''] ?? colors.primary) : colors.primary;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Product Details" showBack onBack={() => router.back()} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !product ? (
        <View style={styles.center}>
          <Body>Product kanipinchaledu</Body>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          <AgProductImage
            type={product.type}
            name={product.name}
            subtitle={product.targetPest ?? product.targetDisease}
            dose={product.dosage}
            imagePath={product.image}
            size="detail"
          />

          <View style={styles.headerBlock}>
            {product.brand ? (
              <View style={[styles.brandPill, { backgroundColor: `${brandColor}18` }]}>
                <Label style={[styles.brandText, { color: brandColor }]}>{product.brand}</Label>
              </View>
            ) : null}
            <Title style={styles.name}>{product.nameTe ?? product.name}</Title>
            {product.nameTe ? <Caption>{product.name}</Caption> : null}
            <View style={styles.tags}>
              {product.activeIngredient ? (
                <Caption style={styles.tag}>{product.activeIngredient}</Caption>
              ) : null}
              {product.targetPest ? (
                <Caption style={styles.tag}>Purugu: {product.targetPest}</Caption>
              ) : null}
              {product.targetDisease ? (
                <Caption style={styles.tag}>Rogam: {product.targetDisease}</Caption>
              ) : null}
            </View>
          </View>

          <Card variant="elevated" style={styles.doseCard}>
            <Label style={styles.doseLabel}>Motta / Dose</Label>
            <Body style={styles.doseValue}>{product.dosage}</Body>
            <Caption style={styles.sourceTag}>Source: {product.source ?? 'CIB&RC reference'}</Caption>
          </Card>

          {product.applicationMethod ? (
            <DetailRow icon="hand-back-right-outline" label="Vidhanam" value={product.applicationMethod} />
          ) : null}
          {product.description ? (
            <DetailRow icon="star-outline" label="Upayogam" value={product.description} />
          ) : null}
          {product.precautions ? (
            <DetailRow icon="alert-outline" label="Jagratta" value={product.precautions} warn />
          ) : null}

          {product.crops.length ? (
            <View style={styles.section}>
              <Label style={styles.sectionLabel}>Pantalu / Crops</Label>
              <View style={styles.cropRow}>
                {[...new Set(product.crops)].slice(0, 10).map((c) => (
                  <View key={c} style={styles.cropChip}>
                    <Caption>{cropLabel(c)}</Caption>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {product.sourceUrl ? (
            <Button
              label="CIB&RC registered products chudandi"
              variant="outline"
              onPress={() => Linking.openURL(product.sourceUrl!)}
            />
          ) : null}

          <Caption style={styles.disclaimer}>
            Active ingredient reference — dealer daggar exact brand pack & label verify cheyandi.
          </Caption>
        </ScrollView>
      )}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  warn,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <Card variant="outlined" style={styles.detailRow}>
      <View style={styles.detailHeader}>
        <MaterialCommunityIcons name={icon} size={18} color={warn ? colors.warning : colors.primary} />
        <Label style={styles.detailLabel}>{label}</Label>
      </View>
      <Body style={styles.detailValue}>{value}</Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, gap: spacing.md },
  headerBlock: { gap: spacing.xs },
  brandPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  brandText: { fontSize: 11 },
  name: { fontSize: 22, lineHeight: 28 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
    color: colors.textSecondary,
  },
  doseCard: { alignItems: 'center', gap: 6, paddingVertical: spacing.md },
  doseLabel: { color: colors.textSecondary },
  doseValue: { fontSize: 20, color: colors.primary, fontFamily: 'Poppins_700Bold', textAlign: 'center' },
  sourceTag: { color: colors.textTertiary, textAlign: 'center' },
  detailRow: { gap: spacing.sm },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailLabel: { color: colors.textSecondary },
  detailValue: { lineHeight: 22 },
  section: { gap: spacing.sm },
  sectionLabel: { color: colors.textSecondary },
  cropRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  cropChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  disclaimer: { textAlign: 'center', color: colors.textTertiary, lineHeight: 18, marginTop: spacing.sm },
});
