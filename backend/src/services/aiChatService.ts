import {
  completeOllamaChat,
  isOllamaConfigured,
  type ProxyChatMessage,
} from './aiProxyService';
import {
  completeGeminiChat,
  getGeminiConfigIssue,
  isGeminiConfigured,
} from './geminiProxyService';
import { resolveAgentTemperature } from './agents/agentTemperature';
import { cacheAiKnowledgeAnswer } from './aiKnowledgeCache';
import {
  extractPriorUserQuestion,
  hasThinLibraryInSystem,
  isCorrectionMessage,
  isUncertainLlmAnswer,
  messageText,
  shouldSearchWebFirst,
  wantsWebSearch,
} from './correctionDetect';
import {
  researchAgricultureOnline,
  type WebResearchResult,
} from './webResearchService';
import {
  humanFallbackWhenNoSynthesis,
  polishConversationalReply,
  synthesizeFarmerAnswer,
} from './synthesizeFarmerAnswer';
import { historyHasVisionImage } from './visionMessageUtils';

const CATALOG_AGENTS = new Set(['pest', 'fertilizer', 'crop', 'scheme']);

function wantsFullCatalog(agentId?: string): boolean {
  return Boolean(agentId && CATALOG_AGENTS.has(agentId));
}

export type AiProvider = 'gemini' | 'ollama';

export interface AiChatOptions {
  voiceMode?: boolean;
  signal?: AbortSignal;
  agentId?: string;
  temperature?: number;
  cropIds?: string[];
  language?: string;
}

function resolveTemperature(opts: AiChatOptions): number {
  if (opts.temperature != null) return opts.temperature;
  return resolveAgentTemperature(opts.agentId, opts.voiceMode);
}

const GEMINI_ATTEMPT_MS = 12000;
const GEMINI_VISION_ATTEMPT_MS = 45000;

function isGeminiAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /401|UNAUTHENTICATED|invalid authentication|API key/i.test(msg);
}

async function tryVisionLlmProviders(
  messages: ProxyChatMessage[],
  chatOpts: AiChatOptions & { temperature: number },
): Promise<{ text: string | null; configIssue: string | null; authFailed: boolean }> {
  const geminiIssue = getGeminiConfigIssue();
  if (geminiIssue) {
    return { text: null, configIssue: geminiIssue, authFailed: false };
  }

  let authFailed = false;

  if (isGeminiConfigured()) {
    try {
      const text = (
        await withTimeout(
          completeGeminiChat(messages, chatOpts),
          GEMINI_VISION_ATTEMPT_MS,
          'GEMINI_VISION',
        )
      ).trim();
      if (text.length >= 10) return { text, configIssue: null, authFailed: false };
    } catch (err) {
      authFailed = isGeminiAuthError(err);
      console.error('[ai/vision] Gemini failed:', String(err instanceof Error ? err.message : err).slice(0, 300));
    }
  }

  if (isOllamaConfigured()) {
    try {
      const text = (await completeOllamaChat(messages, chatOpts)).trim();
      if (text.length >= 10) return { text, configIssue: null, authFailed: false };
    } catch (err) {
      console.error('[ai/vision] Ollama vision failed:', err instanceof Error ? err.message : err);
    }
  }

  if (authFailed) {
    console.error(
      '[ai/vision] Gemini key rejected (401). Regenerate at https://aistudio.google.com/apikey — check key is not Blocked.',
    );
  }

  return { text: null, configIssue: null, authFailed };
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), ms);
    }),
  ]);
}

export function getAiProvider(): AiProvider {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (isOllamaConfigured() && explicit !== 'gemini') return 'ollama';
  if (explicit === 'gemini' && isGeminiConfigured()) return 'gemini';
  if (explicit === 'ollama' && isOllamaConfigured()) return 'ollama';
  if (isGeminiConfigured()) return 'gemini';
  if (isOllamaConfigured()) return 'ollama';
  return 'ollama';
}

export function isAiConfigured(): boolean {
  return true;
}

function extractResearchQuery(messages: ProxyChatMessage[]): {
  query: string;
  correction: boolean;
  correctionNote: string;
} {
  const lastUser = messageText(messages.filter((m) => m.role === 'user').at(-1)?.content ?? '');
  const correction = isCorrectionMessage(lastUser);
  const query = correction ? extractPriorUserQuestion(messages) : lastUser;
  return { query: query || lastUser, correction, correctionNote: lastUser };
}

function emptyResearch(query: string): WebResearchResult {
  return { query, snippets: [], formattedContext: '', dbContext: '' };
}

function appendResearchToSystem(
  messages: ProxyChatMessage[],
  research: WebResearchResult,
): ProxyChatMessage[] {
  if (!research.formattedContext.trim()) return messages;

  const block =
    '\n\n--- REFERENCE NOTES (analyze — use only parts relevant to farmer question; ignore unrelated products) ---\n' +
    research.formattedContext;

  const out = messages.map((m) => ({ ...m }));
  const sysIdx = out.findIndex((m) => m.role === 'system');
  if (sysIdx >= 0) {
    const prev = messageText(out[sysIdx].content);
    out[sysIdx] = { ...out[sysIdx], content: `${prev}${block}` };
  } else {
    out.unshift({ role: 'system', content: block.trim() });
  }
  return out;
}

function isThinDbContext(context: string): boolean {
  const t = context.trim();
  if (!t) return true;
  if (/no matching entries in bhuvedam farming library/i.test(t)) return true;
  if (/no library match/i.test(t)) return true;
  return t.length < 120;
}

async function tryAllLlmProviders(
  messages: ProxyChatMessage[],
  chatOpts: AiChatOptions & { temperature: number },
): Promise<string | null> {
  const attempts: (() => Promise<string>)[] = [];

  if (isGeminiConfigured()) {
    attempts.push(() =>
      withTimeout(completeGeminiChat(messages, chatOpts), GEMINI_ATTEMPT_MS, 'GEMINI'),
    );
  }
  if (isOllamaConfigured()) {
    attempts.push(() => completeOllamaChat(messages, chatOpts));
  }

  for (const attempt of attempts) {
    try {
      const text = (await attempt()).trim();
      if (text.length >= 15) return text;
    } catch {
      /* try next provider */
    }
  }
  return null;
}

function cacheAnswerAsync(
  query: string,
  answer: string,
  research: WebResearchResult,
  opts: AiChatOptions,
  provider: string,
): void {
  void cacheAiKnowledgeAnswer(query, answer, {
    cropIds: opts.cropIds,
    provider,
    dbContext: research.dbContext,
    webSnippets: research.snippets,
    forceStore: provider.includes('web') || provider.includes('correction'),
  }).catch(() => undefined);
}

function extractRecentTurns(messages: ProxyChatMessage[]): string {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-6)
    .map((m) => {
      const label = m.role === 'user' ? 'Farmer' : 'You';
      return `${label}: ${messageText(m.content).slice(0, 200)}`;
    })
    .join('\n');
}

function looksConversationalEnough(text: string, query: string): boolean {
  if (text.length > 850) return false;
  const bulletCount = (text.match(/^[\s]*[-•*]/gm) ?? []).length;
  if (bulletCount >= 4) return false;
  const doseSpam = (text.match(/\d+\s*ml\s*\/\s*acre/gi) ?? []).length;
  if (doseSpam >= 2 && !/mandu|spray|dose|purugu|rogam|pest|fertil/i.test(query)) return false;
  return text.length < 380 && bulletCount <= 1;
}

async function finalizeAnswer(
  draft: string,
  query: string,
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
  research: WebResearchResult,
  provider: string,
): Promise<{ answer: string; provider: string; research: WebResearchResult }> {
  if (opts.agentId === 'time' || looksConversationalEnough(draft, query)) {
    cacheAnswerAsync(query, draft, research, opts, provider);
    return { answer: draft, provider, research };
  }

  const polished = await polishConversationalReply(draft, query, {
    voiceMode: opts.voiceMode,
    recentTurns: extractRecentTurns(messages),
    language: opts.language,
  });

  const answer =
    polished && !isUncertainLlmAnswer(polished) && polished.length >= 15 ? polished : draft;
  cacheAnswerAsync(query, answer, research, opts, provider);
  return { answer, provider, research };
}

async function loadWebResearch(
  query: string,
  opts: AiChatOptions,
  correction: boolean,
  correctionNote: string,
): Promise<WebResearchResult> {
  return researchAgricultureOnline(query, {
    correction,
    correctionNote,
    cropIds: opts.cropIds,
    fullCatalog: wantsFullCatalog(opts.agentId),
  });
}

async function answerFromResearch(
  query: string,
  research: WebResearchResult,
  opts: AiChatOptions,
  provider: string,
): Promise<{ answer: string; provider: string; research: WebResearchResult }> {
  const synthesized = await synthesizeFarmerAnswer(query, research, {
    voiceMode: opts.voiceMode,
    language: opts.language,
  });
  if (synthesized && !isUncertainLlmAnswer(synthesized)) {
    cacheAnswerAsync(query, synthesized, research, opts, provider);
    return { answer: synthesized, provider, research };
  }
  const human = humanFallbackWhenNoSynthesis(query, opts.voiceMode, opts.language);
  cacheAnswerAsync(query, human, research, opts, provider);
  return { answer: human, provider, research };
}

async function completeWithResearchFallback(
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
): Promise<{ answer: string; provider: string; research: WebResearchResult }> {
  const { query, correction, correctionNote } = extractResearchQuery(messages);

  // Photo attached — vision model analyzes the image directly (Gemini 2.5 Flash).
  if (historyHasVisionImage(messages)) {
    const visionOpts = { ...opts, temperature: 0.25 };
    const { text: answer, configIssue, authFailed } = await tryVisionLlmProviders(messages, visionOpts);
    if (answer) {
      return { answer, provider: 'gemini', research: emptyResearch(query) };
    }

    if (configIssue || authFailed) {
      console.error('[ai/vision] Photo scan unavailable:', configIssue ?? 'Gemini auth failed');
      const fallback = opts.voiceMode
        ? 'ఫోటో స్కాన్ ఇప్పుడు పని చేయడం లేదు. కొన్ని నిమిషాల తర్వాత మళ్లీ ప్రయత్నించండి.'
        : '**ఫోటో స్కాన్ ఇప్పుడు పని చేయడం లేదు**\n\nకొన్ని నిమిషాల తర్వాత మళ్లీ ప్రయత్నించండి. సమస్య కొనసాగితే యాప్ టీమ్‌కు చెప్పండి.';
      return { answer: fallback, provider: 'vision_unavailable', research: emptyResearch(query) };
    }

    const fallback = opts.voiceMode
      ? 'ఫోటో సరిగ్గా చూడలేకపోయాను. మంచి వెలుతురులో క్లియర్ ఫోటో మళ్లీ పంపండి.'
      : '**ఫోటో సరిగ్గా చూడలేకపోయాను**\n\nమంచి వెలుతురులో క్లియర్ ఫోటో మళ్లీ పంపండి.';
    return { answer: fallback, provider: 'vision_fallback', research: emptyResearch(query) };
  }

  const chatOpts = { ...opts, temperature: resolveTemperature(opts) };

  let research = emptyResearch(query);
  let workingMessages = messages;

  // STEP 1: No library answer yet → search web FIRST (before LLM).
  if (shouldSearchWebFirst(messages) || correction || wantsWebSearch(query)) {
    research = await loadWebResearch(query, opts, correction, correctionNote);
    if (research.formattedContext.trim()) {
      workingMessages = appendResearchToSystem(messages, research);
    }
  }

  const dbEmpty = isThinDbContext(research.dbContext) || hasThinLibraryInSystem(messages);

  // STEP 2: Web found info + DB had nothing → answer from web (no "sorry").
  if (research.snippets.length > 0 && dbEmpty) {
    const llmWithWeb = await tryAllLlmProviders(workingMessages, chatOpts);
    if (llmWithWeb && !isUncertainLlmAnswer(llmWithWeb)) {
      return finalizeAnswer(
        llmWithWeb,
        query,
        messages,
        opts,
        research,
        getAiProvider(),
      );
    }
    return answerFromResearch(
      query,
      research,
      opts,
      correction ? 'correction_research' : 'web_research',
    );
  }

  // STEP 3: Normal LLM with whatever context we have.
  let answer = await tryAllLlmProviders(workingMessages, chatOpts);

  if (answer && isUncertainLlmAnswer(answer)) {
    if (!research.formattedContext.trim()) {
      research = await loadWebResearch(query, opts, correction, correctionNote);
      workingMessages = appendResearchToSystem(messages, research);
    }
    if (research.snippets.length > 0) {
      const retry = await tryAllLlmProviders(workingMessages, chatOpts);
      if (retry && !isUncertainLlmAnswer(retry)) {
        return finalizeAnswer(retry, query, messages, opts, research, getAiProvider());
      }
      return answerFromResearch(
        query,
        research,
        opts,
        correction ? 'correction_research' : 'web_research',
      );
    }
  }

  if (answer && !isUncertainLlmAnswer(answer)) {
    if (correction) {
      return finalizeAnswer(answer, query, messages, opts, research, 'correction');
    }
    return finalizeAnswer(answer, query, messages, opts, research, getAiProvider());
  }

  // STEP 4: LLM failed — final web search + direct web answer.
  if (!research.formattedContext.trim()) {
    research = await loadWebResearch(query, opts, correction, correctionNote);
    workingMessages = appendResearchToSystem(messages, research);
  }

  if (research.snippets.length > 0) {
    const llmLast = await tryAllLlmProviders(workingMessages, chatOpts);
    if (llmLast && !isUncertainLlmAnswer(llmLast)) {
      return finalizeAnswer(llmLast, query, messages, opts, research, getAiProvider());
    }
    return answerFromResearch(
      query,
      research,
      opts,
      correction ? 'correction_research' : 'web_research',
    );
  }

  return answerFromResearch(query, research, opts, 'web_research');
}

export async function completeAiChat(
  messages: ProxyChatMessage[],
  opts: AiChatOptions = {},
): Promise<string> {
  const result = await completeWithResearchFallback(messages, opts);
  return result.answer;
}

export async function streamAiChat(
  messages: ProxyChatMessage[],
  opts: AiChatOptions,
): Promise<ReadableStream<Uint8Array>> {
  const { answer } = await completeWithResearchFallback(messages, opts);
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: answer })}\n\n`));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
}

export { type ProxyChatMessage };
