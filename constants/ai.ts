import { getTranslations } from '@/constants/i18n/translations';
import { DEFAULT_LANGUAGE } from '@/constants/languages';

const defaults = getTranslations(DEFAULT_LANGUAGE);

/** @deprecated Use useTranslation() or getTranslations(language) */
export const AI_SUGGESTIONS = defaults.aiSuggestions;

/** @deprecated Use useTranslation() or getTranslations(language) */
export const AI_WELCOME_MESSAGE = defaults.aiWelcome;
