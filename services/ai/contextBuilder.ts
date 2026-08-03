import { AI_LOCAL_LANGUAGE_RULES_TE } from '@/constants/agLocalTerms';
import { getSystemPrompt } from '@/constants/aiConfig';
import { API_CONFIG } from '@/constants/app';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import { getSoilTypeLabel } from '@/constants/soilTypes';
import {
    AI_CONTEXT_PRIVACY_NOTE,
    AI_REFUSAL_STYLE,
} from '@/constants/trustPolicy';
import { WEATHER_CONDITIONS } from '@/constants/weather';
import { fetchKnowledgeContext, fetchWebResearchContext, shouldFetchWebResearch } from '@/services/agData/knowledgeService';
import { routeToAgent, type AgentDefinition, type AgentId } from '@/services/ai/agents';
import { isFarmerCorrection, wantsWebSearch } from '@/services/ai/farmerKnowledge';
import {
    detectQueryTopics,
    isPestOrDiseaseQuery,
    needsKnowledgeSearch,
    resolveCropIdsForQuery,
    type QueryTopic,
} from '@/services/ai/queryIntent';
import { analyticsKey } from '@/services/mandi/mandiService';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useMandiStore } from '@/store/mandiStore';
import { useUserStore } from '@/store/userStore';
import { useWeatherStore } from '@/store/weatherStore';
import type { Conversation } from '@/types/ai';
import { detectQueryLanguage } from '@/utils/detectQueryLanguage';
import { formatLiveClockBlock } from '@/utils/liveClock';

const STALE_WEATHER_MS = 30 * 60 * 1000;

export async function prepareContextBeforeChat(userQuery = ''): Promise<void> {
  const weather = useWeatherStore.getState();
  const mandi = useMandiStore.getState();
  const agent = routeToAgent(userQuery);

  const isStale =
    !weather.lastFetched ||
    Date.now() - new Date(weather.lastFetched).getTime() > STALE_WEATHER_MS;

  const tasks: Promise<void>[] = [];

  if (agent.context.weather && (!weather.data || isStale)) {
    tasks.push(weather.fetchWeather(!weather.data).catch(() => undefined));
  }

  if (agent.context.mandi && !mandi.analytics.length) {
    tasks.push(mandi.fetchRates().catch(() => undefined));
  }

  if (tasks.length) {
    await Promise.all(tasks);
  }
}

function formatWeatherBlock(): string {
  const { data, location } = useWeatherStore.getState();
  if (!data) {
    return 'Status: Not available — farmer should open Home tab with GPS enabled.';
  }

  const conditionLabel =
    WEATHER_CONDITIONS[data.current.condition]?.label ?? data.current.condition;

  const forecast = data.daily
    .slice(0, 3)
    .map(
      (d) =>
        `${d.day}: ${d.high}°/${d.low}°C, ${WEATHER_CONDITIONS[d.condition]?.label ?? d.condition}`,
    )
    .join('; ');

  return [
    `Location: ${data.location}${location?.region ? `, ${location.region}` : ''}`,
    `Current: ${data.current.temperature}°C (feels ${data.current.feelsLike}°C), ${conditionLabel}`,
    `Humidity: ${data.current.humidity}% | Wind: ${data.current.windSpeed} km/h | Rain: ${data.current.precipitation}%`,
    `Updated: ${new Date(data.updatedAt).toLocaleString()}`,
    forecast ? `Forecast: ${forecast}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

function formatSoilBlock(): string {
  const { soilType, village, soilProfile, setupComplete, areaCents, areaAcres, areaSource } =
    useFarmerContextStore.getState();

  if (!setupComplete && !soilType && !soilProfile) {
    return 'Status: Farm profile not saved — ask farmer to complete Crop tab.';
  }

  const lines: string[] = [];
  if (village) lines.push(`Village: ${village}`);
  if (areaCents != null && areaAcres != null) {
    lines.push(`Field area: ${areaCents} cents (${areaAcres} acres)${areaSource ? ` — ${areaSource}` : ''}`);
  }
  if (soilType) lines.push(`Reported soil: ${getSoilTypeLabel(soilType)}`);
  if (soilProfile?.ph != null) {
    lines.push(`GPS soil pH: ${soilProfile.ph}, texture: ${soilProfile.textureClass ?? 'unknown'}`);
  }
  return lines.length ? lines.join('\n') : 'Status: partial profile only.';
}

function formatMandiBlock(query: string, compact = false): string {
  const mandi = useMandiStore.getState();
  const { analytics, forecasts, source, lastFetched } = mandi;
  if (!analytics.length) {
    return 'Mandi rates not loaded yet — open Mandi Rates once or check internet connection.';
  }

  const cropIds = resolveCropIdsForQuery(query, useFarmerContextStore.getState().crops);
  let filtered = analytics;
  if (cropIds.length && !detectQueryTopics(query).has('general')) {
    const idSet = new Set(cropIds);
    const byCrop = analytics.filter((a) => idSet.has(a.cropId));
    if (byCrop.length) filtered = byCrop;
  }

  const sampleLimit = compact ? 6 : 12;
  const lines = filtered.slice(0, sampleLimit).map((a) => {
    const forecast = forecasts[analyticsKey(a.cropId, a.varietyId, a.varietyName)];
    const varietyLabel = a.varietyName ? ` [${a.varietyName}]` : '';
    const forecastLine = forecast ? ` | est ${forecast.monthsAhead}M ₹${forecast.estimatedPrice}/qtl` : '';
    return `- ${a.commodity}${varietyLabel}: ₹${a.currentModal}/qtl (${a.trend})${forecastLine}`;
  });

  return [
    `Source: ${source}${lastFetched ? `, ${new Date(lastFetched).toLocaleString()}` : ''}`,
    ...lines,
    filtered.length > sampleLimit ? `... ${filtered.length - sampleLimit} more in app` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Specialists always get their full context; general agent loads blocks only when the query asks. */
function shouldIncludeBlock(
  agent: AgentDefinition,
  block: 'weather' | 'soil' | 'mandi',
  topics: Set<QueryTopic>,
): boolean {
  if (!agent.context[block]) return false;
  if (agent.id === 'general') {
    const topicKey: Record<'weather' | 'soil' | 'mandi', QueryTopic> = {
      weather: 'weather',
      soil: 'soil',
      mandi: 'mandi',
    };
    return topics.has(topicKey[block]);
  }
  return true;
}

function findPriorUserQuestion(conversations: Conversation[], activeConversationId: string): string {
  const conv = conversations.find((c) => c.id === activeConversationId);
  if (!conv) return '';
  const users = conv.messages.filter((m) => m.role === 'user' && m.content.trim()).map((m) => m.content.trim());
  if (users.length >= 2) return users[users.length - 2] ?? '';
  return '';
}

export function buildFullSystemPrompt(
  language: LanguageCode,
  _conversations: Conversation[],
  _activeConversationId: string,
  voiceMode = false,
  userQuery = '',
  dbReferenceContext = '',
  effectiveLanguage?: LanguageCode,
  agent = routeToAgent(userQuery),
): string {
  const compact = voiceMode;
  const replyLang = effectiveLanguage ?? language;
  const base = getSystemPrompt(replyLang, voiceMode);
  const user = useUserStore.getState().user;
  const langLabel = LANGUAGES.find((l) => l.code === replyLang)?.nativeName ?? replyLang;
  const farmerSummary = useFarmerContextStore.getState().getSummary();
  const topics = detectQueryTopics(userQuery);
  const nowBlock = formatLiveClockBlock();
  const timeOnly = agent.id === 'time';
  const pestOrCropHealth = agent.id === 'pest' || (topics.has('crop') && isPestOrDiseaseQuery(userQuery));

  const sections: string[] = [
    `${base}`,
    '',
    `=== SPECIALIST MODE: ${agent.roleLabel} ===`,
    'Stay in this role only — do not mix unrelated topics unless the farmer asks.',
    '',
    '=== CONTEXT FOR THIS FARMER ===',
    `Language: ${langLabel}`,
    user?.name ? `Farmer name: ${user.name}` : 'Farmer name: not set',
    '',
    '--- CURRENT DATE & TIME ---',
    nowBlock,
  ];

  if (!timeOnly) {
    if (agent.context.farmerProfile) {
      sections.push('', '--- FARMER PROFILE & LEARNED FACTS ---', farmerSummary);
    }

    if (shouldIncludeBlock(agent, 'weather', topics)) {
      sections.push('', '--- LIVE WEATHER ---', formatWeatherBlock());
    }

    if (shouldIncludeBlock(agent, 'soil', topics)) {
      sections.push('', '--- SOIL & FIELD ---', formatSoilBlock());
    }

    if (shouldIncludeBlock(agent, 'mandi', topics)) {
      sections.push('', '--- MANDI RATES ---', formatMandiBlock(userQuery, compact));
    }

    const fetchLibrary =
      agent.context.library &&
      (needsKnowledgeSearch(topics) || agent.id === 'scheme' || agent.id === 'fertilizer');

    if (fetchLibrary) {
      if (dbReferenceContext.trim()) {
        sections.push(
          '',
          pestOrCropHealth
            ? '--- FARMING LIBRARY (MANDATORY for rogam/purugu/mandu — exact product name + dose) ---'
            : '--- FARMING LIBRARY (products & doses) ---',
          dbReferenceContext.trim(),
        );
      } else {
        sections.push(
          '',
          '--- FARMING LIBRARY ---',
          'No library match — use ONLINE AGRICULTURE SOURCES below if present. Give the best farming answer you can from those sources.',
        );
      }
    }
  }

  sections.push(
    '',
    '=== FARMER QUESTION (answer THIS — nothing else unless they asked) ===',
    `"${userQuery.trim().slice(0, 300)}"`,
    '',
    '=== HOW TO REPLY ===',
    '- Talk like a real person at the field — warm, simple, human.',
    '- Answer ONLY what they asked. No spray/mandu/dose/acre unless the question is about that.',
    `- ${AI_CONTEXT_PRIVACY_NOTE}`,
    `- ${AI_REFUSAL_STYLE}`,
    ...agent.rules.map((r) => `- ${r}`),
    '- If farmer says you were wrong, agree, search ONLINE AGRICULTURE SOURCES in context, and give corrected facts.',
    '- Time questions: answer ONLY from CURRENT DATE & TIME.',
  );

  if (replyLang === 'te') {
    sections.push('', AI_LOCAL_LANGUAGE_RULES_TE);
  }

  if (voiceMode) {
    sections.push('- Voice: short spoken answer, no markdown.');
  }

  return sections.join('\n');
}

export async function buildFullSystemPromptAsync(
  language: LanguageCode,
  conversations: Conversation[],
  activeConversationId: string,
  voiceMode: boolean,
  userQuery: string,
): Promise<{ prompt: string; dbContext: string; cropIds: string[]; agentId: AgentId }> {
  // Learn from farmer message BEFORE building prompt (corrections, local facts)
  await useFarmerContextStore.getState().learnFromUserMessage(userQuery);

  const agent = routeToAgent(userQuery);
  const topics = detectQueryTopics(userQuery);
  const cropIds = resolveCropIdsForQuery(userQuery, useFarmerContextStore.getState().crops);
  const effectiveLanguage = detectQueryLanguage(userQuery, language);
  let dbReferenceContext = '';

  const needsLibrary =
    agent.context.library &&
    (needsKnowledgeSearch(topics) || agent.id === 'scheme' || agent.id === 'fertilizer');

  if (needsLibrary) {
    dbReferenceContext = await fetchKnowledgeContext(userQuery, cropIds);
  }

  const correction = isFarmerCorrection(userQuery);
  const priorQuery = correction ? findPriorUserQuestion(conversations, activeConversationId) : '';
  const researchQuery = correction && priorQuery ? priorQuery : userQuery;
  const libraryEmpty = shouldFetchWebResearch(dbReferenceContext, userQuery);

  // No DB answer → search web FIRST before LLM sees the question.
  const needsWebResearch =
    API_CONFIG.useBackendData &&
    (correction ||
      wantsWebSearch(userQuery) ||
      libraryEmpty ||
      (needsLibrary && libraryEmpty));

  if (needsWebResearch) {
    const webContext = await fetchWebResearchContext(researchQuery, {
      cropIds,
      correction,
      priorQuery: priorQuery || undefined,
    });
    if (webContext.trim()) {
      dbReferenceContext = [dbReferenceContext, webContext].filter(Boolean).join('\n\n');
    }
  }

  const prompt = buildFullSystemPrompt(
    language,
    conversations,
    activeConversationId,
    voiceMode,
    userQuery,
    dbReferenceContext.slice(0, voiceMode ? 1500 : 3500),
    effectiveLanguage,
    agent,
  );

  return { prompt, dbContext: dbReferenceContext, cropIds, agentId: agent.id };
}
