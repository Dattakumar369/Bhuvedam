import { AgProductBrowseScreen, type CatalogBrowseConfig } from '@/features/catalog/components/AgProductBrowseScreen';
import { PEST_TARGET_FILTERS } from '@/constants/agCatalogFilters';

const CONFIG: CatalogBrowseConfig = {
  type: 'pesticide',
  titleTe: 'పురుగు మందulu',
  titleEn: 'Pesticides',
  subtitle: 'Bollworm, BPH, Aphids — mee panta ki correct insecticides chudandi',
  heroColor: '#1565C0',
  heroIcon: 'spray',
  searchPlaceholder: 'Search — Monocil, Confidor, Imidacloprid...',
  basePath: '/pesticides',
  sourceLabel: 'CIB&RC insecticides — Neon catalog',
  targetFilters: PEST_TARGET_FILTERS,
  targetFilterLabel: 'Purugu / Pest',
};

export default function PesticidesScreen() {
  return <AgProductBrowseScreen config={CONFIG} />;
}
