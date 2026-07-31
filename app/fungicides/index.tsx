import { AgProductBrowseScreen, type CatalogBrowseConfig } from '@/features/catalog/components/AgProductBrowseScreen';
import { FUNG_TARGET_FILTERS } from '@/constants/agCatalogFilters';

const CONFIG: CatalogBrowseConfig = {
  type: 'fungicide',
  titleTe: 'రోగ నివారణ',
  titleEn: 'Fungicides',
  subtitle: 'Blight, Mildew, Rust — rogalu control ki fungicides chudandi',
  heroColor: '#E65100',
  heroIcon: 'water-opacity',
  searchPlaceholder: 'Search — Mancozeb, Carbendazim, Tricyclazole...',
  basePath: '/fungicides',
  sourceLabel: 'CIB&RC fungicide actives — real dose & target',
  targetFilters: FUNG_TARGET_FILTERS,
  targetFilterLabel: 'Rogam / Disease',
};

export default function FungicidesScreen() {
  return <AgProductBrowseScreen config={CONFIG} />;
}
