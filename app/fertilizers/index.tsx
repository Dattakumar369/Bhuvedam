import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip, Header, ListSkeleton, SearchInput } from '@/components/ui';
import { Body, Caption, Title } from '@/components/ui/Typography';
import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import { FERTILIZER_BRANDS, FERTILIZER_CATEGORIES } from '@/constants/fertilizerCatalog';
import { useLanguageStore } from '@/store/languageStore';
import { CROPS } from '@/constants/crops';
import { FertilizerProductCard } from '@/features/fertilizers/components/FertilizerProductCard';
import { fetchFertilizerProducts } from '@/services/fertilizers/fertilizerProductService';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import type { FertilizerCategory, FertilizerProduct } from '@/types/fertilizerProduct';
import { colors, layout, radius, spacing } from '@/theme';

export default function FertilizersScreen() {
  const insets = useSafeAreaInsets();
  const farmerCrops = useFarmerContextStore((s) => s.crops);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FertilizerCategory>('all');
  const [brand, setBrand] = useState('all');
  const [crop, setCrop] = useState<string>('all');
  const [products, setProducts] = useState<FertilizerProduct[]>([]);
  const [source, setSource] = useState<'catalog' | 'offline'>('catalog');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchFertilizerProducts({
        search: search.trim() || undefined,
        category,
        brand,
        crop: crop === 'all' ? undefined : crop,
        limit: 200,
      });
      setProducts(result.products);
      setSource(result.source);
      if (result.source === 'offline') {
        const lang = useLanguageStore.getState().language;
        setError(getUserErrorMessage('PRODUCTS_OFFLINE', lang));
      }
    } catch {
      const lang = useLanguageStore.getState().language;
      setError(getUserErrorMessage('PRODUCTS_LOAD_FAILED', lang));
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category, brand, crop]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(load, search.trim() ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const cropChips = useMemo(() => {
    const ids = farmerCrops.length ? farmerCrops.slice(0, 4) : ['rice', 'cotton', 'chilli', 'tomato'];
    return [
      { id: 'all', label: 'All crops' },
      ...ids.map((id) => {
        const cropInfo = CROPS.find((c) => c.id === id);
        return { id, label: cropInfo?.nameTe ?? cropInfo?.name ?? id };
      }),
    ];
  }, [farmerCrops]);

  const sourceLabel =
    source === 'catalog' ? 'IFFCO · Coromandel · NFL — official grades' : 'Offline — sync fertilizer catalog';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="ఎరువులు" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="leaf" size={28} color={colors.white} />
          </View>
          <View style={styles.heroText}>
            <Title style={styles.heroTitle}>Fertilizers</Title>
            <Body style={styles.heroBody}>
              Urea, DAP, NPK, Nano — mee panta ki correct eruvulu chudandi
            </Body>
          </View>
        </View>

        <View style={styles.banner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.info} />
          <Caption style={styles.bannerText}>
            IFFCO · Coromandel · NFL official grades — real MRP, dose, pack size. Order/cart ledu.
          </Caption>
        </View>

        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Peru tho search — Urea, DAP, Nano..."
        />

        <Caption style={styles.filterLabel}>రకం / Category</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {FERTILIZER_CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                label={c.labelTe}
                selected={category === c.id}
                onPress={() => setCategory(c.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Caption style={styles.filterLabel}>Brand</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {FERTILIZER_BRANDS.map((b) => (
              <Chip
                key={b.id}
                label={b.label}
                selected={brand === b.id}
                onPress={() => setBrand(b.id)}
              />
            ))}
          </View>
        </ScrollView>

        <Caption style={styles.filterLabel}>Panta / Crop</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {cropChips.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                selected={crop === c.id}
                onPress={() => setCrop(c.id)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.metaRow}>
          <Caption style={styles.resultCount}>
            {loading ? 'Loading...' : `${products.length} products`}
          </Caption>
          <Caption style={styles.source}>{sourceLabel}</Caption>
        </View>

        {error ? <Caption style={styles.error}>{error}</Caption> : null}

        {loading && !products.length ? (
          <ListSkeleton count={4} />
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <FertilizerProductCard
                key={product.id}
                product={product}
                compact
                onPress={() => router.push(`/fertilizers/${product.id}` as never)}
              />
            ))}
          </View>
        )}

        {!loading && !products.length ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify" size={40} color={colors.textTertiary} />
            <Body style={styles.emptyText}>Products kanipinchaledu</Body>
            <Caption>Search or filter marchi try cheyandi</Caption>
          </View>
        ) : null}

        {loading && products.length ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : null}
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
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: 4 },
  heroTitle: { color: colors.white, fontSize: 22 },
  heroBody: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${colors.info}12`,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  bannerText: { flex: 1, color: colors.textSecondary, lineHeight: 16 },
  filterLabel: { fontFamily: 'Poppins_600SemiBold', color: colors.textSecondary },
  chipRow: { flexDirection: 'row', gap: spacing.xs, paddingRight: spacing.md },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: { fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary },
  source: { color: colors.textTertiary },
  error: { color: colors.error, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyText: { color: colors.textSecondary },
  loader: { marginTop: spacing.md },
});
