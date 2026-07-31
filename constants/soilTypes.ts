export const SOIL_TYPE_OPTIONS = [
  { id: 'black_cotton', label: 'Black cotton soil', labelTe: 'నల్ల రేగడి' },
  { id: 'red', label: 'Red soil', labelTe: 'ఎర్ర రేగడి' },
  { id: 'alluvial', label: 'Alluvial', labelTe: 'ముఖ్య నేల' },
  { id: 'sandy_loam', label: 'Sandy loam', labelTe: 'ఇసుక మట్టి' },
  { id: 'clay_loam', label: 'Clay loam', labelTe: 'బంకమట్టి' },
  { id: 'laterite', label: 'Laterite', labelTe: 'ముదురు రేగడి' },
  { id: 'unknown', label: 'Not sure', labelTe: 'తెలీదు' },
] as const;

export type SoilTypeId = (typeof SOIL_TYPE_OPTIONS)[number]['id'];

import type { LanguageCode } from '@/constants/languages';

export function getSoilTypeLabel(id?: string, language: LanguageCode = 'te'): string {
  const opt = SOIL_TYPE_OPTIONS.find((s) => s.id === id);
  if (!opt) return language === 'te' ? 'ఇవ్వలేదు' : 'Not set';
  return language === 'te' ? (opt.labelTe ?? opt.label) : opt.label;
}
