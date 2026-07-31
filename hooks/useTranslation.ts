import { getAppTranslations } from '@/constants/i18n/appTranslations';
import { getTranslations } from '@/constants/i18n/translations';
import { getFarmTranslations } from '@/constants/i18n/farmTranslations';
import { useLanguageStore } from '@/store/languageStore';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const t = getTranslations(language);
  const farm = getFarmTranslations(language);
  const app = getAppTranslations(language);

  return { t, farm, app, language };
}
