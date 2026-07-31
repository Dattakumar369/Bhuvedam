import type { FertilizerCategory } from '@/types/fertilizerProduct';

export const FERTILIZER_CATEGORIES: Array<{ id: FertilizerCategory; labelTe: string; labelEn: string }> = [
  { id: 'all', labelTe: 'అన్నీ', labelEn: 'All' },
  { id: 'Nitrogen', labelTe: 'నత్రజని', labelEn: 'Nitrogen' },
  { id: 'Phosphatic', labelTe: 'భాస్వరం', labelEn: 'Phosphatic' },
  { id: 'Potassic', labelTe: 'పొటాష్', labelEn: 'Potassic' },
  { id: 'NPK Complex', labelTe: 'NPK', labelEn: 'NPK Complex' },
  { id: 'Nano', labelTe: 'నానో', labelEn: 'Nano' },
  { id: 'Micronutrient', labelTe: 'సూక్ష్మ', labelEn: 'Micronutrient' },
  { id: 'Bio-fertilizer', labelTe: 'బయో', labelEn: 'Bio-fertilizer' },
  { id: 'Organic', labelTe: 'సేంద్రియ', labelEn: 'Organic' },
];

export const FERTILIZER_BRANDS = [
  { id: 'all', label: 'All brands' },
  { id: 'IFFCO', label: 'IFFCO' },
  { id: 'Coromandel', label: 'Coromandel' },
  { id: 'NFL', label: 'NFL' },
  { id: 'Nagarjuna', label: 'Nagarjuna' },
  { id: 'Deepak', label: 'Deepak' },
] as const;

export const BRAND_COLORS: Record<string, string> = {
  IFFCO: '#2E7D32',
  Coromandel: '#1565C0',
  NFL: '#E65100',
  Nagarjuna: '#6A1B9A',
  Deepak: '#00838F',
  DoF: '#455A64',
};

export function categoryLabelTe(category: string): string {
  return FERTILIZER_CATEGORIES.find((c) => c.id === category)?.labelTe ?? category;
}
