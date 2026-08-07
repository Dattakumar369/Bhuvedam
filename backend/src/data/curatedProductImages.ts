/**
 * Curated real product / pack images (Wikimedia Commons + manufacturer CDNs).
 * Used when DB stores relative filenames or synthetic ag/* paths.
 */

const W = 'https://upload.wikimedia.org/wikipedia/commons';

/** Shared fertilizer pack photos */
export const FERTILIZER_PACK_IMAGES = {
  urea: `${W}/4/4f/Urea_fertilizer.jpg`,
  dap: `${W}/e/e7/Diammonium_phosphate.jpg`,
  npk: `${W}/3/3d/NPK_fertilizer.jpg`,
  mop: `${W}/5/5a/Potassium_chloride.jpg`,
  ssp: `${W}/8/8a/Superphosphate_fertilizer.jpg`,
  ammoniumSulphate: `${W}/a/a4/Ammonium_sulfate.jpg`,
  zincSulphate: `${W}/4/4e/Zinc_sulfate.jpg`,
  ferrousSulphate: `${W}/2/23/Iron%28II%29_sulfate.jpg`,
  compost: `${W}/4/4c/Compost.jpg`,
  vermicompost: `${W}/1/1e/Vermicompost.jpg`,
  bioInoculant: `${W}/8/8d/Rhizobium_leguminosarum.jpg`,
  boron: `${W}/9/93/Borax.jpg`,
  nanoFertilizer: `${W}/9/9a/Fertilizer_bags.jpg`,
  waterSoluble: `${W}/3/3d/NPK_fertilizer.jpg`,
  map: `${W}/e/e7/Diammonium_phosphate.jpg`,
  sop: `${W}/5/5a/Potassium_chloride.jpg`,
} as const;

/** Pesticide / fungicide bottle & pack photos */
export const AGROCHEM_PACK_IMAGES = {
  insecticide: `${W}/b/b3/Pesticide.jpg`,
  insecticideSpray: `${W}/6/6f/Pesticide_application.jpg`,
  fungicide: `${W}/thumb/4/4a/Copper(II)_sulfate.jpg/440px-Copper(II)_sulfate.jpg`,
  fungicideWp: `${W}/thumb/4/4a/Copper(II)_sulfate.jpg/440px-Copper(II)_sulfate.jpg`,
  herbicide: `${W}/b/b3/Pesticide.jpg`,
  bioFungicide: `${W}/1/1e/Vermicompost.jpg`,
} as const;

/** Map seed filename → HTTPS image */
export const FERTILIZER_FILENAME_IMAGES: Record<string, string> = {
  'urea.png': FERTILIZER_PACK_IMAGES.urea,
  'dap.png': FERTILIZER_PACK_IMAGES.dap,
  'npk-10-26-26.png': FERTILIZER_PACK_IMAGES.npk,
  'npk-12-32-16.png': FERTILIZER_PACK_IMAGES.npk,
  'npk-15-15-15.png': FERTILIZER_PACK_IMAGES.npk,
  'np-20-20-0-13.png': FERTILIZER_PACK_IMAGES.npk,
  'np-28-28-0.png': FERTILIZER_PACK_IMAGES.npk,
  'nano-urea.png': FERTILIZER_PACK_IMAGES.nanoFertilizer,
  'nano-dap.png': FERTILIZER_PACK_IMAGES.nanoFertilizer,
  'nano-zinc.png': FERTILIZER_PACK_IMAGES.zincSulphate,
  'gromor-urea.png': FERTILIZER_PACK_IMAGES.urea,
  'gromor-dap.png': FERTILIZER_PACK_IMAGES.dap,
  'gromor-mop.png': FERTILIZER_PACK_IMAGES.mop,
  'gromor-ssp.png': FERTILIZER_PACK_IMAGES.ssp,
  'gromor-28-28-0.png': FERTILIZER_PACK_IMAGES.npk,
  'gromor-20-20-0-13.png': FERTILIZER_PACK_IMAGES.npk,
  'gromor-15-15-15-09.png': FERTILIZER_PACK_IMAGES.npk,
  'gromor-12-32-16.png': FERTILIZER_PACK_IMAGES.npk,
  'gromor-10-26-26.png': FERTILIZER_PACK_IMAGES.npk,
  'gromor-ultra-10-26-26.png': FERTILIZER_PACK_IMAGES.npk,
  'paramfos.png': FERTILIZER_PACK_IMAGES.ssp,
  'nfl-urea.png': FERTILIZER_PACK_IMAGES.urea,
  'nfl-neem-urea.png': FERTILIZER_PACK_IMAGES.urea,
  'nfl-rhizobium.png': FERTILIZER_PACK_IMAGES.bioInoculant,
  'nfl-azotobacter.png': FERTILIZER_PACK_IMAGES.bioInoculant,
  'nfl-psb.png': FERTILIZER_PACK_IMAGES.bioInoculant,
  'zinc-sulphate.png': FERTILIZER_PACK_IMAGES.zincSulphate,
  'ferrous-sulphate.png': FERTILIZER_PACK_IMAGES.ferrousSulphate,
  'mop.png': FERTILIZER_PACK_IMAGES.mop,
  'ammonium-sulphate.png': FERTILIZER_PACK_IMAGES.ammoniumSulphate,
  'ssp.png': FERTILIZER_PACK_IMAGES.ssp,
  'tsp.png': FERTILIZER_PACK_IMAGES.dap,
  'map.png': FERTILIZER_PACK_IMAGES.map,
  'npk-19-19-19.png': FERTILIZER_PACK_IMAGES.waterSoluble,
  'boron.png': FERTILIZER_PACK_IMAGES.boron,
  'compost.png': FERTILIZER_PACK_IMAGES.compost,
  'nagarjuna-urea.png': FERTILIZER_PACK_IMAGES.urea,
  'nagarjuna-dap.png': FERTILIZER_PACK_IMAGES.dap,
  'nagarjuna-map.png': FERTILIZER_PACK_IMAGES.map,
  'nagarjuna-polyfeed-19-19-19.png': FERTILIZER_PACK_IMAGES.waterSoluble,
  'nagarjuna-mkp.png': FERTILIZER_PACK_IMAGES.mop,
  'nagarjuna-multi-k.png': FERTILIZER_PACK_IMAGES.mop,
  'nagarjuna-zinc-sulphate.png': FERTILIZER_PACK_IMAGES.zincSulphate,
  'nagarjuna-borovin.png': FERTILIZER_PACK_IMAGES.boron,
  'deepak-mahadhan-12-32-16.png': FERTILIZER_PACK_IMAGES.npk,
  'deepak-mahadhan-10-26-26.png': FERTILIZER_PACK_IMAGES.npk,
  'deepak-mahadhan-20-20-0-13.png': FERTILIZER_PACK_IMAGES.npk,
  'deepak-mahadhan-sop.png': FERTILIZER_PACK_IMAGES.sop,
  'deepak-mahadhan-amruta-cn.png': FERTILIZER_PACK_IMAGES.ammoniumSulphate,
  'deepak-mahadhan-bentonite-s.png': FERTILIZER_PACK_IMAGES.ssp,
};

/** Active ingredient slug → pack photo (CIB&RC reference products) */
export const ACTIVE_INGREDIENT_IMAGES: Record<string, string> = {
  'imidacloprid-17-8-sl': AGROCHEM_PACK_IMAGES.insecticide,
  'lambda-cyhalothrin-5-ec': AGROCHEM_PACK_IMAGES.insecticideSpray,
  'chlorpyriphos-20-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'monocrotophos-36-sl': AGROCHEM_PACK_IMAGES.insecticide,
  'quinalphos-25-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'dimethoate-30-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'triazophos-40-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'profenofos-50-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'spinosad-45-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'emamectin-benzoate-5-sg': AGROCHEM_PACK_IMAGES.insecticide,
  'indoxacarb-14-5-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'thiamethoxam-25-wg': AGROCHEM_PACK_IMAGES.insecticide,
  'acetamiprid-20-sp': AGROCHEM_PACK_IMAGES.insecticide,
  'fipronil-5-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'cartap-hydrochloride-50-sp': AGROCHEM_PACK_IMAGES.insecticide,
  'buprofezin-25-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'pymetrozine-50-wg': AGROCHEM_PACK_IMAGES.insecticide,
  'flubendiamide-39-35-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'chlorantraniliprole-18-5-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'abamectin-1-9-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'spiromesifen-22-9-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'diafenthiuron-50-wp': AGROCHEM_PACK_IMAGES.insecticide,
  'novaluron-10-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'lufenuron-5-4-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'metaflumizone-22-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'cyantraniliprole-10-26-od': AGROCHEM_PACK_IMAGES.insecticide,
  'spinetoram-11-7-sc': AGROCHEM_PACK_IMAGES.insecticide,
  'malathion-50-ec': AGROCHEM_PACK_IMAGES.insecticideSpray,
  'dichlorvos-76-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'phosalone-35-ec': AGROCHEM_PACK_IMAGES.insecticide,
  'mancozeb-75-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'carbendazim-50-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'tricyclazole-75-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'propiconazole-25-ec': AGROCHEM_PACK_IMAGES.fungicide,
  'tebuconazole-25-ec': AGROCHEM_PACK_IMAGES.fungicide,
  'hexaconazole-5-sc': AGROCHEM_PACK_IMAGES.fungicide,
  'difenoconazole-25-ec': AGROCHEM_PACK_IMAGES.fungicide,
  'azoxystrobin-23-sc': AGROCHEM_PACK_IMAGES.fungicide,
  'copper-oxychloride-50-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'chlorothalonil-75-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'metalaxyl-mancozeb-72-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'validamycin-3-l': AGROCHEM_PACK_IMAGES.fungicide,
  'kasugamycin-3-sl': AGROCHEM_PACK_IMAGES.fungicide,
  'streptocycline-copper': AGROCHEM_PACK_IMAGES.fungicideWp,
  'sulphur-80-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'captan-50-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'thiophanate-methyl-70-wp': AGROCHEM_PACK_IMAGES.fungicideWp,
  'pseudomonas-fluorescens-2-wp': AGROCHEM_PACK_IMAGES.bioFungicide,
  'trichoderma-viride-1-wp': AGROCHEM_PACK_IMAGES.bioFungicide,
  'bordeaux-mixture-1': AGROCHEM_PACK_IMAGES.fungicideWp,
};

export function slugActiveIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function lookupCuratedImage(input: {
  id?: string;
  imagePath?: string | null;
  type?: string;
  activeIngredient?: string | null;
  category?: string | null;
}): string | null {
  const path = input.imagePath?.trim();
  if (path?.startsWith('http://') || path?.startsWith('https://')) return path;

  if (path) {
    const file = path.split('/').pop() ?? path;
    if (FERTILIZER_FILENAME_IMAGES[file]) return FERTILIZER_FILENAME_IMAGES[file];
    if (FERTILIZER_FILENAME_IMAGES[path]) return FERTILIZER_FILENAME_IMAGES[path];

    const agMatch = path.match(/^ag\/(pesticide|fungicide)\/(.+)\.png$/);
    if (agMatch) {
      const slug = agMatch[2]!;
      if (ACTIVE_INGREDIENT_IMAGES[slug]) return ACTIVE_INGREDIENT_IMAGES[slug];
    }
  }

  if (input.activeIngredient) {
    const slug = slugActiveIngredient(input.activeIngredient);
    if (ACTIVE_INGREDIENT_IMAGES[slug]) return ACTIVE_INGREDIENT_IMAGES[slug];
  }

  if (input.id) {
    const idSlug = input.id.replace(/^ref-(pest|fung)-/, '');
    if (ACTIVE_INGREDIENT_IMAGES[idSlug]) return ACTIVE_INGREDIENT_IMAGES[idSlug];
  }

  const type = input.type?.toLowerCase();
  if (type === 'pesticide') return AGROCHEM_PACK_IMAGES.insecticide;
  if (type === 'fungicide') return AGROCHEM_PACK_IMAGES.fungicide;

  const cat = input.category?.toLowerCase() ?? '';
  if (cat.includes('nitrogen') || cat.includes('nano')) return FERTILIZER_PACK_IMAGES.urea;
  if (cat.includes('phosphatic')) return FERTILIZER_PACK_IMAGES.dap;
  if (cat.includes('potassic')) return FERTILIZER_PACK_IMAGES.mop;
  if (cat.includes('npk') || cat.includes('complex')) return FERTILIZER_PACK_IMAGES.npk;
  if (cat.includes('bio')) return FERTILIZER_PACK_IMAGES.bioInoculant;
  if (cat.includes('micro')) return FERTILIZER_PACK_IMAGES.zincSulphate;
  if (cat.includes('organic')) return FERTILIZER_PACK_IMAGES.compost;

  return FERTILIZER_PACK_IMAGES.npk;
}
