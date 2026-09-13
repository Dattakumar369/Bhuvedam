import { AgProductBrowseScreen, type CatalogBrowseConfig } from '@/features/catalog/components/AgProductBrowseScreen';
import { PEST_TARGET_FILTERS } from '@/constants/agCatalogFilters';

const CONFIG: CatalogBrowseConfig = {
  type: 'pesticide',
  heroColor: '#1565C0',
  heroIcon: 'spray',
  basePath: '/pesticides',
  targetFilters: PEST_TARGET_FILTERS,
};

export default function PesticidesScreen() {
  return <AgProductBrowseScreen config={CONFIG} />;
}
