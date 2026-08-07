/**
 * Official manufacturer product pages + verified pack-shot URLs.
 * Live fetch tries sourceUrl first; brandImage is the cached pack photo when known.
 */
export interface ManufacturerProductPage {
  sourceUrl: string;
  /** Direct HTTPS pack-shot — IFFCO S3 or Coromandel wp-content */
  brandImage?: string;
}

export const MANUFACTURER_PRODUCT_PAGES: Record<string, ManufacturerProductPage> = {
  // ── IFFCO ──
  'iffco-urea': {
    sourceUrl: 'https://www.iffco.in/en/urea-fertilizer',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2020-04/UREA_0.png',
  },
  'iffco-dap': {
    sourceUrl: 'https://www.iffco.in/en/dap-18-46-0',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2020-04/18-46-0-%28DAP%29_1.png',
  },
  'iffco-npk-10-26-26': {
    sourceUrl: 'https://www.iffco.in/en/npk-10-26-26',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2020-06/10-26-26-%28NPK%29.png',
  },
  'iffco-npk-12-32-16': {
    sourceUrl: 'https://www.iffco.in/en/npk-12-32-16',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2019-09/npk-12-32-16.png',
  },
  'iffco-np-20-20-0-13': {
    sourceUrl: 'https://www.iffco.in/en/np-20-20',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2019-09/np-20-20-0-13.png',
  },
  'iffco-npk-15-15-15': {
    sourceUrl: 'https://www.iffco.in/en/npk-15-15-15',
  },
  'iffco-np-28-28-0': {
    sourceUrl: 'https://www.iffco.in/en/np-28-28-0',
  },
  'iffco-nano-urea': {
    sourceUrl: 'https://www.iffco.in/en/nano-urea-liquid-fertilizer',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2021-08/Nano-Fertilizer-inside-Page-image.png',
  },
  'iffco-nano-dap': {
    sourceUrl: 'https://www.iffco.in/en/nano-dap-liquid',
    brandImage:
      'https://iffco-public-assets.s3.ap-south-1.amazonaws.com/s3fs-public/2021-08/Nano-Fertilizer-inside-Page-image.png',
  },
  'iffco-nano-zinc': {
    sourceUrl: 'https://www.iffco.in/en/nano-fertilisers',
  },

  // ── Coromandel Gromor ──
  'coromandel-gromor-urea': {
    sourceUrl: 'https://www.coromandel.biz/gromor-urea/',
  },
  'coromandel-gromor-dap': {
    sourceUrl: 'https://www.coromandel.biz/gromor-godavari-dap/',
    brandImage: 'https://www.coromandel.biz/wp-content/uploads/2025/03/c_DAP.webp',
  },
  'coromandel-gromor-mop': {
    sourceUrl: 'https://www.coromandel.biz/gromor-mop/',
    brandImage: 'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Bharat_MOP_Final.webp',
  },
  'coromandel-gromor-ssp': {
    sourceUrl: 'https://www.coromandel.biz/gromor-ssp/',
    brandImage: 'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Urea.webp',
  },
  'coromandel-gromor-28-28-0': {
    sourceUrl: 'https://www.coromandel.biz/gromor-28-28-0/',
    brandImage:
      'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_28-28-0_Side%20Number.webp',
  },
  'coromandel-gromor-20-20-0-13': {
    sourceUrl: 'https://www.coromandel.biz/gromor-20-20-0-13/',
    brandImage:
      'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_20-20-0-13_Side%20Number.webp',
  },
  'coromandel-gromor-15-15-15-09': {
    sourceUrl: 'https://www.coromandel.biz/gromor-15-15-15-09/',
    brandImage:
      'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_15-15-15-09_Side%20Number.webp',
  },
  'coromandel-gromor-12-32-16': {
    sourceUrl: 'https://www.coromandel.biz/gromor-12-32-16/',
    brandImage: 'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_12-32-16.webp',
  },
  'coromandel-gromor-10-26-26': {
    sourceUrl: 'https://www.coromandel.biz/gromor-10-26-26/',
    brandImage: 'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_10-10-26.webp',
  },
  'coromandel-gromor-ultra-10-26-26': {
    sourceUrl: 'https://www.coromandel.biz/gromor-ultra-10--26-26/',
    brandImage:
      'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_10-10-26-Zn.webp',
  },
  'coromandel-paramfos': {
    sourceUrl: 'https://www.coromandel.biz/paramfos/',
    brandImage: 'https://www.coromandel.biz/wp-content/uploads/2025/03/c_Packshot_Side_Paramfos.webp',
  },

  // ── NFL ──
  'nfl-urea': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/neem-coated-urea/',
  },
  'nfl-neem-urea': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/neem-coated-urea/',
  },
  'nfl-bio-rhizobium': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/rhizobium/',
  },
  'nfl-bio-azotobacter': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/azotobacter/',
  },
  'nfl-bio-psb': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/phosphate-solubilizing-bacteria/',
  },
  'nfl-zinc-sulphate': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/zinc-sulphate/',
  },
  'nfl-ferrous-sulphate': {
    sourceUrl: 'https://www.nationalfertilizers.com/product/ferrous-sulphate/',
  },

  // ── Nagarjuna ──
  'nagarjuna-urea': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/urea/',
  },
  'nagarjuna-dap': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/dap/',
  },
  'nagarjuna-map': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/map-12-61-00/',
  },
  'nagarjuna-polyfeed-19-19-19': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/poly-feed-19-19-19/',
  },
  'nagarjuna-mkp': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/mkp-00-52-34/',
  },
  'nagarjuna-multi-k': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/multi-k-13-0-46/',
  },
  'nagarjuna-zinc-sulphate': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/zinc-sulphate/',
  },
  'nagarjuna-borovin': {
    sourceUrl: 'https://www.nagarjunafertilizers.com/products/borovin/',
  },

  // ── Deepak Mahadhan ──
  'deepak-mahadhan-12-32-16': {
    sourceUrl: 'https://www.deepakfertiliser.com/mahadhan/mahadhan-12-32-16/',
  },
  'deepak-mahadhan-10-26-26': {
    sourceUrl: 'https://www.deepakfertiliser.com/mahadhan/mahadhan-10-26-26/',
  },
  'deepak-mahadhan-20-20-0-13': {
    sourceUrl: 'https://www.deepakfertiliser.com/mahadhan/mahadhan-20-20-0-13/',
  },
  'deepak-mahadhan-sop': {
    sourceUrl: 'https://www.deepakfertiliser.com/mahadhan/mahadhan-sop/',
  },
  'deepak-mahadhan-amruta-cn': {
    sourceUrl: 'https://www.deepakfertiliser.com/mahadhan/amruta-calcium-nitrate/',
  },
  'deepak-mahadhan-bentonite-s': {
    sourceUrl: 'https://www.deepakfertiliser.com/mahadhan/mahadhan-bentonite-sulphur/',
  },
};

export function getManufacturerPage(productId?: string): ManufacturerProductPage | null {
  if (!productId) return null;
  return MANUFACTURER_PRODUCT_PAGES[productId] ?? null;
}

export function mergeManufacturerSourceUrl(
  productId: string,
  existing?: string | null,
): string | undefined {
  return existing ?? getManufacturerPage(productId)?.sourceUrl;
}

export function getBrandPackImage(productId?: string): string | null {
  return getManufacturerPage(productId)?.brandImage ?? null;
}
