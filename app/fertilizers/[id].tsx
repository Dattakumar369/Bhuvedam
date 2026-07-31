import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Header } from '@/components/ui';
import { Body, Caption, Label, Title } from '@/components/ui/Typography';
import { BRAND_COLORS, categoryLabelTe } from '@/constants/fertilizerCatalog';
import { AgProductImage } from '@/features/catalog/components/AgProductImage';
import { CROPS } from '@/constants/crops';
import { fetchFertilizerProductById } from '@/services/fertilizers/fertilizerProductService';
import type { FertilizerProduct } from '@/types/fertilizerProduct';
import { colors, layout, radius, spacing } from '@/theme';

function cropLabel(id: string): string {
  const crop = CROPS.find((c) => c.id === id);
  return crop?.nameTe ?? crop?.name ?? id;
}

export default function FertilizerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<FertilizerProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchFertilizerProductById(id)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [id]);

  const brandColor = product ? (BRAND_COLORS[product.brand] ?? colors.primary) : colors.primary;

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
            type="fertilizer"
            name={product.nameTe ?? product.name}
            subtitle={product.npk ? `NPK ${product.npk}` : product.brand}
            dose={product.dosage}
            imagePath={product.image}
            size="detail"
          />

          <View style={styles.headerBlock}>
            <View style={[styles.brandPill, { backgroundColor: `${brandColor}18` }]}>
              <Label style={[styles.brandText, { color: brandColor }]}>{product.brand}</Label>
            </View>
            <Title style={styles.name}>{product.nameTe ?? product.name}</Title>
            {product.nameTe ? <Caption>{product.name}</Caption> : null}
            <View style={styles.tags}>
              <Caption style={styles.tag}>{categoryLabelTe(product.category)}</Caption>
              {product.npk ? <Caption style={styles.tag}>NPK {product.npk}</Caption> : null}
              {product.isSubsidized ? (
                <Caption style={[styles.tag, styles.subsidyTag]}>Subsidy product</Caption>
              ) : null}
            </View>
          </View>

          <Card variant="elevated" style={styles.priceCard}>
            <Body style={styles.price}>{product.mrp ?? 'Price on enquiry'}</Body>
            {product.packSize ? <Caption>Pack: {product.packSize}</Caption> : null}
          </Card>

          {product.dosage ? <DetailRow icon="scale-balance" label="Motta / Dose" value={product.dosage} /> : null}
          {product.nutrient ? <DetailRow icon="flask-outline" label="Nutrient" value={product.nutrient} /> : null}
          {product.applicationMethod ? (
            <DetailRow icon="hand-back-right-outline" label="Vidhanam" value={product.applicationMethod} />
          ) : null}
          {product.application?.length ? (
            <DetailRow icon="calendar-check" label="Application" value={product.application.join(', ')} />
          ) : null}
          {product.benefits ? <DetailRow icon="star-outline" label="Upayogam" value={product.benefits} /> : null}
          {product.precautions ? (
            <DetailRow icon="alert-outline" label="Jagratta" value={product.precautions} warn />
          ) : null}

          {product.crops.length ? (
            <View style={styles.section}>
              <Label style={styles.sectionLabel}>Pantalu / Crops</Label>
              <View style={styles.cropRow}>
                {[...new Set(product.crops)].slice(0, 8).map((c) => (
                  <View key={c} style={styles.cropChip}>
                    <Caption>{cropLabel(c)}</Caption>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {product.sourceUrl ? (
            <Button
              label="Official source chudandi"
              variant="outline"
              onPress={() => Linking.openURL(product.sourceUrl!)}
              style={styles.linkBtn}
            />
          ) : null}

          <Caption style={styles.disclaimer}>
            Reference information only — in-app ordering is not available. Dealer or cooperative daggar
            stock & price verify cheyandi.
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
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={warn ? colors.warning : colors.primary}
        />
        <Label style={styles.detailLabel}>{label}</Label>
      </View>
      <Body style={[styles.detailValue, warn && { color: colors.textSecondary }]}>{value}</Body>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  heroImage: {
    height: 160,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  subsidyTag: { backgroundColor: `${colors.success}18`, color: colors.success },
  priceCard: { alignItems: 'center', gap: 4, paddingVertical: spacing.md },
  price: { fontSize: 20, color: colors.primary, fontFamily: 'Poppins_700Bold' },
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
  linkBtn: { marginTop: spacing.sm },
  disclaimer: {
    textAlign: 'center',
    color: colors.textTertiary,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
