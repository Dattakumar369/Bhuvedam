import { AgProductBrowseScreen, type CatalogBrowseConfig } from '@/features/catalog/components/AgProductBrowseScreen';
import { FUNG_TARGET_FILTERS } from '@/constants/agCatalogFilters';

const CONFIG: CatalogBrowseConfig = {
  type: 'fungicide',
  heroColor: '#E65100',
  heroIcon: 'water-opacity',
  basePath: '/fungicides',
  targetFilters: FUNG_TARGET_FILTERS,
};

export default function FungicidesScreen() {
  return <AgProductBrowseScreen config={CONFIG} />;
}
