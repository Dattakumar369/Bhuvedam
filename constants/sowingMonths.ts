export const SOWING_MONTHS = [
  { id: '1', labelTe: 'జనవరి', labelEn: 'January' },
  { id: '2', labelTe: 'ఫిబ్రవరి', labelEn: 'February' },
  { id: '3', labelTe: 'మార్చి', labelEn: 'March' },
  { id: '4', labelTe: 'ఏప్రిల్', labelEn: 'April' },
  { id: '5', labelTe: 'మే', labelEn: 'May' },
  { id: '6', labelTe: 'జూన్', labelEn: 'June' },
  { id: '7', labelTe: 'జూలై', labelEn: 'July' },
  { id: '8', labelTe: 'ఆగస్టు', labelEn: 'August' },
  { id: '9', labelTe: 'సెప్టెంబర్', labelEn: 'September' },
  { id: '10', labelTe: 'అక్టోబర్', labelEn: 'October' },
  { id: '11', labelTe: 'నవంబర్', labelEn: 'November' },
  { id: '12', labelTe: 'డిసెంబర్', labelEn: 'December' },
] as const;

export function sowingMonthLabel(monthId: string, language: 'en' | 'te' | 'hi' | 'mr' | 'ta' | 'kn' = 'te'): string {
  const row = SOWING_MONTHS.find((m) => m.id === monthId);
  if (!row) return monthId;
  return language === 'te' ? row.labelTe : row.labelEn;
}
