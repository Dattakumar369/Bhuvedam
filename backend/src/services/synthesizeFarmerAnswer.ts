import type { ProxyChatMessage } from './aiProxyService';
import { completeOllamaChat, isOllamaConfigured } from './aiProxyService';
import { completeGeminiChat, isGeminiConfigured } from './geminiProxyService';
import type { WebResearchResult } from './webResearchService';

const SYNTHESIS_TIMEOUT_MS = 18000;

type ReplyLanguage = 'en' | 'te' | 'hi' | 'mr' | 'ta' | 'kn';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('SYNTHESIS_TIMEOUT')), ms);
    }),
  ]);
}

function normalizeLang(lang?: string): ReplyLanguage {
  const code = (lang ?? 'te').toLowerCase().slice(0, 2);
  if (code === 'en' || code === 'hi' || code === 'mr' || code === 'ta' || code === 'kn') {
    return code;
  }
  return 'te';
}

function languageLabel(lang: ReplyLanguage): string {
  switch (lang) {
    case 'en':
      return 'English';
    case 'hi':
      return 'Hindi (Devanagari script only)';
    case 'mr':
      return 'Marathi (Devanagari script only)';
    case 'ta':
      return 'Tamil (Tamil script only)';
    case 'kn':
      return 'Kannada (Kannada script only)';
    default:
      return 'Telugu (తెలుగు script only — never Roman like meeku/mandu)';
  }
}

function voiceInstruction(lang: ReplyLanguage): string {
  return `Reply in 2-4 short spoken sentences in ${languageLabel(lang)}. No markdown. No Romanized Indian languages. Warm field-advisor tone. Give a clear practical next step.`;
}

function textInstruction(lang: ReplyLanguage): string {
  return `Reply in 1-3 short paragraphs in ${languageLabel(lang)}. Minimal markdown. Clear practical advice — diagnosis + what to do.`;
}

/** Turn web/DB research into a human, on-topic farmer reply — never raw snippet dump. */
export async function synthesizeFarmerAnswer(
  query: string,
  research: WebResearchResult,
  opts: { voiceMode?: boolean; language?: string } = {},
): Promise<string | null> {
  const lang = normalizeLang(opts.language);
  const sources = research.snippets
    .slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.title}\n   ${s.snippet.slice(0, 360)}`)
    .join('\n');

  const dbHint = research.dbContext.trim().slice(0, 1000);
  const instruction = opts.voiceMode ? voiceInstruction(lang) : textInstruction(lang);

  const prompt = `You are a skilled local agriculture advisor for Indian farmers. Talk like a real person at the field — accurate and useful.

FARMER ASKED:
"${query.slice(0, 400)}"

REFERENCE NOTES (use matching facts; ignore unrelated catalog noise):
${sources || '(no web notes)'}
${dbHint ? `\nLibrary note:\n${dbHint}` : ''}

HOW TO REPLY:
- Understand the exact question and answer THAT first.
- If it is pest/disease/yellow leaves/crop problem: say likely cause + what to do now (cultural steps and, when relevant, medicine name + dose).
- If they asked for spray/dose/product: include product + dose clearly.
- Do NOT dump random product catalogs. Do NOT copy article titles.
- Prefer actionable steps over vague "wait and see".
- If notes are weak, still give best general farming guidance for that crop/problem — do not refuse.
- ${instruction}

Your reply to the farmer:`;

  const messages: ProxyChatMessage[] = [{ role: 'user', content: prompt }];
  const chatOpts = { voiceMode: opts.voiceMode, temperature: 0.35 };

  if (isGeminiConfigured()) {
    try {
      const text = (
        await withTimeout(completeGeminiChat(messages, chatOpts), SYNTHESIS_TIMEOUT_MS)
      ).trim();
      if (text.length >= 20) return text;
    } catch {
      /* fall through */
    }
  }

  if (isOllamaConfigured()) {
    try {
      const text = (await completeOllamaChat(messages, chatOpts)).trim();
      if (text.length >= 20) return text;
    } catch {
      /* ignore */
    }
  }

  return null;
}

/** Rewrite a successful LLM draft into a warmer farmer reply — keeps facts. */
export async function polishConversationalReply(
  draft: string,
  query: string,
  opts: { voiceMode?: boolean; recentTurns?: string; language?: string } = {},
): Promise<string | null> {
  const trimmed = draft.trim();
  if (trimmed.length < 15) return null;

  const lang = normalizeLang(opts.language);
  const instruction = opts.voiceMode ? voiceInstruction(lang) : textInstruction(lang);

  const prompt = `Polish this draft into a clear farmer-friendly reply. Keep all correct facts and doses.

FARMER ASKED:
"${query.slice(0, 400)}"
${opts.recentTurns ? `\nRECENT CHAT:\n${opts.recentTurns.slice(0, 700)}\n` : ''}
DRAFT:
"""
${trimmed.slice(0, 2800)}
"""

RULES:
- Warm, simple, conversational — like a local advisor.
- Language: ${languageLabel(lang)}. Never use Romanized Telugu/Hindi (meeku, mandu, raithu).
- Keep useful diagnosis + solution steps. Do not strip advice into vague filler.
- Keep numbers, product names, and doses when they belong to the question.
- Do NOT invent new chemicals. Do NOT mention being AI.
- ${instruction}

Polished reply:`;

  const messages: ProxyChatMessage[] = [{ role: 'user', content: prompt }];
  const chatOpts = { voiceMode: opts.voiceMode, temperature: 0.3 };

  if (isGeminiConfigured()) {
    try {
      const text = (
        await withTimeout(completeGeminiChat(messages, chatOpts), SYNTHESIS_TIMEOUT_MS)
      ).trim();
      if (text.length >= 15) return text;
    } catch {
      /* fall through */
    }
  }

  if (isOllamaConfigured()) {
    try {
      const text = (await completeOllamaChat(messages, chatOpts)).trim();
      if (text.length >= 15) return text;
    } catch {
      /* ignore */
    }
  }

  return null;
}

export function humanFallbackWhenNoSynthesis(
  query: string,
  voiceMode = false,
  language?: string,
): string {
  const lang = normalizeLang(language);
  const shortQ = query.slice(0, 60);

  if (lang === 'en') {
    return voiceMode
      ? `I am still gathering the best answer for "${shortQ}". Please ask again with your crop name and village — I will explain clearly.`
      : `I am still researching **"${query.slice(0, 100)}"**.\n\nAsk again with crop name and village — I will give a clear practical answer.`;
  }

  if (lang === 'hi') {
    return voiceMode
      ? `"${shortQ}" के बारे में सही जवाब जमा कर रहा हूँ। फसल का नाम और गाँव बताकर फिर पूछें — साफ बताऊँगा।`
      : `आपका सवाल **"${query.slice(0, 100)}"** अभी और शोध में है।\n\nफसल का नाम और गाँव के साथ फिर पूछें।`;
  }

  // Default Telugu — pure script (speakable by te-IN TTS)
  return voiceMode
    ? `"${shortQ}" గురించి సరిగ్గా చెప్పడానికి ఇంకా వివరాలు చూస్తున్నాను. పంట పేరు, ఊరు చెప్పి మళ్లీ అడగండి — స్పష్టంగా చెప్తాను.`
    : `మీ ప్రశ్న **"${query.slice(0, 100)}"** గురించి ఇంకా స్పష్టంగా చూస్తున్నాను.\n\nపంట పేరు, ఊరు తో మళ్లీ అడగండి — సరిగ్గా, మనిషిలా చెప్తాను.`;
}
