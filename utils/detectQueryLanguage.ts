import type { LanguageCode } from '@/constants/languages';

const TELUGU_SCRIPT = /[\u0C00-\u0C7F]/;
const HINDI_SCRIPT = /[\u0900-\u097F]/;

/** Romanized Telugu words farmers type in chat */
const TELUGU_WORDS =
  /\b(rogam|rogalu|purugu|purugulu|mandu|mandu|patti|vari|mirchi|mirap|verusenaga|mokkajonna|gaddam|gaddama|tega|poda|pichikari|eruvu|yuriya|ledu|em|ela|cheyali|vadali|panikira|raithu|panta|cheppu|vastayi|lakshana|maccha|pasupu|akulu)\b/i;

/** Romanized Hindi */
const HINDI_WORDS =
  /\b(kisan|fasal|keeda|rog|dawai|kya|kaise|nahi|mandi|khet|mitti)\b/i;

/** Prefer farmer's spoken language over app UI setting when obvious from message */
export function detectQueryLanguage(query: string, fallback: LanguageCode): LanguageCode {
  const q = query.trim();
  if (!q) return fallback;

  if (TELUGU_SCRIPT.test(q) || TELUGU_WORDS.test(q)) return 'te';
  if (HINDI_SCRIPT.test(q) || HINDI_WORDS.test(q)) return 'hi';

  return fallback;
}
