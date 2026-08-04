import type { LanguageCode } from '@/constants/languages';
import { AI_LOCAL_LANGUAGE_RULES_TE } from '@/constants/agLocalTerms';

/** Extra AI instructions so voice/text replies sound like everyday local speech. */
export function getSpokenStylePrompt(language: LanguageCode, voiceMode: boolean): string {
  if (language === 'te') {
    const base = AI_LOCAL_LANGUAGE_RULES_TE;

    if (voiceMode) {
      return `
${base}

=== VOICE MODE (phone speaker — farmer is listening) ===
- 2-4 short spoken sentences ONLY — NO markdown, NO bullet lists, NO English words
- Pure Telugu script (తెలుగు) — TTS will read aloud; Roman letters sound wrong
- Warm village tone: "సరే అన్న", "మీకు చెప్పాలంటే...", "ఇలా చేయండి"
- Max 180 words — one idea per sentence`;
    }

    return `
${base}

=== TEXT CHAT ===
- Simple Telugu paragraphs — avoid formal/grandham style
- Product/disease names: Telugu first; English in brackets once only if needed
- Max 2-3 short paragraphs`;
  }

  if (language === 'hi') {
    return voiceMode
      ? 'Hindi: simple spoken kisan bhasha — short sentences, no markdown, friendly tone.'
      : 'Hindi: simple spoken kisan bhasha — avoid formal Sanskrit-heavy words.';
  }

  if (voiceMode) {
    return `
=== VOICE MODE ===
Farmer is listening via voice. Use natural spoken language — short clear sentences, no markdown headers, friendly tone like talking at the field. Max 250 words unless they ask for detail.`;
  }

  return '';
}
