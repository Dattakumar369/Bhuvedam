import { getFieldMeasureMessages } from '@/constants/i18n/fieldMeasureTranslations';
import { getAppTranslations } from '@/constants/i18n/appTranslations';
import { getTranslations } from '@/constants/i18n/translations';
import { getFarmTranslations } from '@/constants/i18n/farmTranslations';
import { getScreenTranslations } from '@/constants/i18n/screenTranslations';
import { useLanguageStore } from '@/store/languageStore';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const t = getTranslations(language);
  const farm = getFarmTranslations(language);
  const app = getAppTranslations(language);
  const screens = getScreenTranslations(language);
  const fm = getFieldMeasureMessages(language);

  return { t, farm, app, screens, fm, language };
}
