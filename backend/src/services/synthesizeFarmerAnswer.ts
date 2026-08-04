import type { ProxyChatMessage } from './aiProxyService';
import { completeOllamaChat, isOllamaConfigured } from './aiProxyService';
import { completeGeminiChat, isGeminiConfigured } from './geminiProxyService';
import type { WebResearchResult } from './webResearchService';

const SYNTHESIS_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('SYNTHESIS_TIMEOUT')), ms);
    }),
  ]);
}

/** Turn web/DB research into a human, on-topic farmer reply — never raw snippet dump. */
export async function synthesizeFarmerAnswer(
  query: string,
  research: WebResearchResult,
  opts: { voiceMode?: boolean } = {},
): Promise<string | null> {
  const sources = research.snippets
    .slice(0, 4)
    .map((s, i) => `${i + 1}. ${s.title}\n   ${s.snippet.slice(0, 320)}`)
    .join('\n');

  const dbHint = research.dbContext.trim().slice(0, 800);

  const instruction = opts.voiceMode
    ? `Reply in 2-4 spoken sentences. No markdown. Warm Telugu like talking at the field.`
    : `Reply in 1-3 short paragraphs. Simple Telugu or match the farmer's language. Minimal markdown.`;

  const prompt = `You are a friendly local agriculture advisor — talk like a REAL person, not a robot or product catalog.

FARMER ASKED:
"${query.slice(0, 400)}"

REFERENCE NOTES (may contain irrelevant items — use ONLY what answers their question):
${sources || '(no web notes)'}
${dbHint ? `\nLibrary note:\n${dbHint}` : ''}

HOW TO REPLY:
- First understand WHAT they are asking. Answer ONLY that.
- Do NOT mention pesticides, sprays, doses, ml/acre, or ekar/acres UNLESS they asked about those.
- Do NOT list random products. Do NOT copy-paste article titles.
- Analyze the reference notes — pick useful facts and explain simply.
- If notes don't match the question, answer from general farming knowledge naturally.
- ${instruction}

Your reply to the farmer:`;

  const messages: ProxyChatMessage[] = [{ role: 'user', content: prompt }];
  const chatOpts = { voiceMode: opts.voiceMode, temperature: 0.38 };

  if (isGeminiConfigured()) {
    try {
      const text = (await withTimeout(
        completeGeminiChat(messages, chatOpts),
        SYNTHESIS_TIMEOUT_MS,
      )).trim();
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

/** Rewrite a successful LLM draft into a warmer, ChatGPT-like farmer reply — keeps facts. */
export async function polishConversationalReply(
  draft: string,
  query: string,
  opts: { voiceMode?: boolean; recentTurns?: string } = {},
): Promise<string | null> {
  const trimmed = draft.trim();
  if (trimmed.length < 15) return null;

  const instruction = opts.voiceMode
    ? `Keep 2-4 spoken sentences. No markdown. Warm Telugu like talking at the field.`
    : `Keep 1-3 short paragraphs. Simple Telugu or match the farmer's language. Minimal markdown.`;

  const prompt = `You polish AI drafts into natural farmer-friendly replies — like a helpful local advisor, not a catalog.

FARMER ASKED:
"${query.slice(0, 400)}"
${opts.recentTurns ? `\nRECENT CHAT:\n${opts.recentTurns.slice(0, 700)}\n` : ''}
DRAFT (keep all correct facts — fix tone only):
"""
${trimmed.slice(0, 2800)}
"""

RULES:
- Talk like a real person — warm, simple, conversational.
- Answer ONLY what they asked. Remove product/spray/dose lists unless they asked about those.
- Keep numbers, product names, and doses from the draft if they belong to the question.
- Do NOT invent new facts. Do NOT mention being AI.
- ${instruction}

Polished reply:`;

  const messages: ProxyChatMessage[] = [{ role: 'user', content: prompt }];
  const chatOpts = { voiceMode: opts.voiceMode, temperature: 0.32 };

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

export function humanFallbackWhenNoSynthesis(query: string, voiceMode = false): string {
  return voiceMode
    ? `${query.slice(0, 60)} gurinchi inka details collect chestunnanu. Crop peru tho malli adagandi — meeku sariga cheptanu.`
    : `Mee prashna **"${query.slice(0, 100)}"** gurinchi inka clear ga research chestunnanu.\n\nCrop peru, village tho malli adagandi — meeku sariga, manishi la cheptanu.`;
}
