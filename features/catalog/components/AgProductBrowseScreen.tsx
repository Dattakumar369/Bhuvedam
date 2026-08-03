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
import { AGRO_BRAND_FILTERS } from '@/constants/agCatalogFilters';
import { getUserErrorMessage } from '@/constants/i18n/userErrorMessages';
import { useLanguageStore } from '@/store/languageStore';
import { CROPS } from '@/constants/crops';
import { AgProductCard } from '@/features/catalog/components/AgProductCard';
import { fetchAgCatalogProducts } from '@/services/catalog/agProductCatalogService';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import type { AgCatalogProduct, AgCatalogType } from '@/types/agCatalogProduct';
import { colors, layout, radius, spacing } from '@/theme';

export interface TargetFilter {
  id: string;
  labelTe: string;
  label: string;
}

export interface CatalogBrowseConfig {
  type: AgCatalogType;
  titleTe: string;
  titleEn: string;
  subtitle: string;
  heroColor: string;
  heroIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  searchPlaceholder: string;
  basePath: string;
  sourceLabel: string;
  targetFilters?: TargetFilter[];
  targetFilterLabel?: string;
  showBrandFilter?: boolean;
}

interface AgProductBrowseScreenProps {
  config: CatalogBrowseConfig;
}

export function AgProductBrowseScreen({ config }: AgProductBrowseScreenProps) {
  const insets = useSafeAreaInsets();
  const farmerCrops = useFarmerContextStore((s) => s.crops);

  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [crop, setCrop] = useState('all');
  const [target, setTarget] = useState('all');
  const [products, setProducts] = useState<AgCatalogProduct[]>([]);
  const [source, setSource] = useState<'reference' | 'offline'>('reference');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchAgCatalogProducts(config.type, {
        search: search.trim() || undefined,
        brand,
        crop: crop === 'all' ? undefined : crop,
        target: target === 'all' ? undefined : target,
        limit: 200,
      });
      setProducts(result.products);
      setSource(result.source);
      if (result.source === 'offline' && result.products.length > 0) {
        const lang = useLanguageStore.getState().language;
        setError(getUserErrorMessage('PRODUCTS_OFFLINE', lang));
      } else if (result.source === 'offline' && !result.products.length) {
        const lang = useLanguageStore.getState().language;
        setError(getUserErrorMessage('PRODUCTS_LOAD_FAILED', lang));
      }
    } catch {
      const lang = useLanguageStore.getState().language;
      setError(getUserErrorMessage('PRODUCTS_LOAD_FAILED', lang));
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [config.type, search, brand, crop, target]);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(load, search.trim() ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={config.titleTe} showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} />
        }
      >
        <View style={[styles.hero, { backgroundColor: config.heroColor }]}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name={config.heroIcon} size={28} color={colors.white} />
          </View>
          <View style={styles.heroText}>
            <Title style={styles.heroTitle}>{config.titleEn}</Title>
            <Body style={styles.heroBody}>{config.subtitle}</Body>
          </View>
        </View>

        <View style={styles.banner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={colors.info} />
          <Caption style={styles.bannerText}>
            CIB&RC reference — active ingredient, dose, target. Dealer brand pack label verify cheyandi.
          </Caption>
        </View>

        <SearchInput value={search} onChangeText={setSearch} placeholder={config.searchPlaceholder} />

        {config.targetFilters?.length ? (
          <>
            <Caption style={styles.filterLabel}>{config.targetFilterLabel ?? 'Target'}</Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {config.targetFilters.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.labelTe}
                    selected={target === t.id}
                    onPress={() => setTarget(t.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </>
        ) : null}

        {config.showBrandFilter ? (
          <>
            <Caption style={styles.filterLabel}>Brand</Caption>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {AGRO_BRAND_FILTERS.map((b) => (
                  <Chip key={b.id} label={b.label} selected={brand === b.id} onPress={() => setBrand(b.id)} />
                ))}
              </View>
            </ScrollView>
          </>
        ) : null}

        <Caption style={styles.filterLabel}>Panta / Crop</Caption>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {cropChips.map((c) => (
              <Chip key={c.id} label={c.label} selected={crop === c.id} onPress={() => setCrop(c.id)} />
            ))}
          </View>
        </ScrollView>

        <View style={styles.metaRow}>
          <Caption style={styles.resultCount}>
            {loading ? 'Loading...' : `${products.length} products`}
          </Caption>
          <Caption style={styles.source}>{source === 'reference' ? config.sourceLabel : 'Offline'}</Caption>
        </View>

        {error ? <Caption style={styles.error}>{error}</Caption> : null}

        {loading && !products.length ? (
          <ListSkeleton count={4} />
        ) : (
          <View style={styles.grid}>
            {products.map((product) => (
              <AgProductCard
                key={product.id}
                product={product}
                compact
                onPress={() => router.push(`${config.basePath}/${product.id}` as never)}
              />
            ))}
          </View>
        )}

        {!loading && !products.length ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify" size={40} color={colors.textTertiary} />
            <Body style={styles.emptyText}>Products kanipinchaledu</Body>
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
  content: { paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, gap: spacing.md },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultCount: { fontFamily: 'Poppins_600SemiBold', color: colors.textPrimary },
  source: { color: colors.textTertiary },
  error: { color: colors.error, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyText: { color: colors.textSecondary },
  loader: { marginTop: spacing.md },
});
