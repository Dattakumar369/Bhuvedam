import { getSystemPrompt } from '@/constants/aiConfig';
import { AI_LOCAL_LANGUAGE_RULES_TE } from '@/constants/agLocalTerms';
import {
  AI_CONTEXT_PRIVACY_NOTE,
  AI_REFUSAL_STYLE,
} from '@/constants/trustPolicy';
import { fetchKnowledgeContext } from '@/services/agData/knowledgeService';
import {
  detectQueryTopics,
  isPestOrDiseaseQuery,
  needsKnowledgeSearch,
  resolveCropIdsForQuery,
  type QueryTopic,
} from '@/services/ai/queryIntent';
import { getSoilTypeLabel } from '@/constants/soilTypes';
import { CROPS } from '@/constants/crops';
import { analyticsKey } from '@/services/mandi/mandiService';
import { WEATHER_CONDITIONS } from '@/constants/weather';
import { LANGUAGES, type LanguageCode } from '@/constants/languages';
import { useFarmerContextStore } from '@/store/farmerContextStore';
import { useMandiStore } from '@/store/mandiStore';
import { useUserStore } from '@/store/userStore';
import { useWeatherStore } from '@/store/weatherStore';
import type { Conversation } from '@/types/ai';
import { formatLiveClockBlock } from '@/utils/liveClock';
import { detectQueryLanguage } from '@/utils/detectQueryLanguage';

const STALE_WEATHER_MS = 30 * 60 * 1000;

export async function prepareContextBeforeChat(userQuery = ''): Promise<void> {
  const weather = useWeatherStore.getState();
  const mandi = useMandiStore.getState();
  const topics = detectQueryTopics(userQuery);

  const isStale =
    !weather.lastFetched ||
    Date.now() - new Date(weather.lastFetched).getTime() > STALE_WEATHER_MS;

  const tasks: Promise<void>[] = [];

  const needsWeather =
    topics.has('weather') || topics.has('general') || topics.has('crop') || !userQuery.trim();

  if (needsWeather && (!weather.data || isStale)) {
    tasks.push(weather.fetchWeather(!weather.data).catch(() => undefined));
  }

  const needsMandi = topics.has('mandi') || topics.has('general') || topics.has('crop');
  if (needsMandi && !mandi.analytics.length) {
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
    return 'Status: Not loaded — open Mandi Rates screen or check backend/WiFi.';
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

function shouldInclude(topics: Set<QueryTopic>, topic: QueryTopic): boolean {
  if (topics.has(topic)) return true;
  if (topics.has('general')) return topic === 'weather' || topic === 'soil';
  if (topics.has('crop')) return topic === 'weather' || topic === 'soil' || topic === 'pest' || topic === 'fertilizer';
  return false;
}

export function buildFullSystemPrompt(
  language: LanguageCode,
  _conversations: Conversation[],
  _activeConversationId: string,
  voiceMode = false,
  userQuery = '',
  dbReferenceContext = '',
  effectiveLanguage?: LanguageCode,
): string {
  const compact = voiceMode;
  const replyLang = effectiveLanguage ?? language;
  const base = getSystemPrompt(replyLang, voiceMode);
  const user = useUserStore.getState().user;
  const langLabel = LANGUAGES.find((l) => l.code === replyLang)?.nativeName ?? replyLang;
  const farmerSummary = useFarmerContextStore.getState().getSummary();
  const topics = detectQueryTopics(userQuery);
  const nowBlock = formatLiveClockBlock();
  const timeOnly = topics.has('time') && topics.size === 1;
  const pestOrCropHealth = topics.has('pest') || (topics.has('crop') && isPestOrDiseaseQuery(userQuery));

  const sections: string[] = [
    `${base}`,
    '',
    '=== CONTEXT FOR THIS FARMER ===',
    `Language: ${langLabel}`,
    user?.name ? `Farmer name: ${user.name}` : 'Farmer name: not set',
    '',
    '--- CURRENT DATE & TIME ---',
    nowBlock,
  ];

  if (!timeOnly) {
    sections.push('', '--- FARMER PROFILE & LEARNED FACTS ---', farmerSummary);

    if (shouldInclude(topics, 'weather')) {
      sections.push('', '--- LIVE WEATHER ---', formatWeatherBlock());
    }

    if (shouldInclude(topics, 'soil')) {
      sections.push('', '--- SOIL & FIELD ---', formatSoilBlock());
    }

    if (shouldInclude(topics, 'mandi')) {
      sections.push('', '--- MANDI RATES ---', formatMandiBlock(userQuery, compact));
    }

    if (dbReferenceContext.trim()) {
      sections.push(
        '',
        pestOrCropHealth
          ? '--- DATABASE REFERENCE (MANDATORY — rogam/purugu/mandu ki ivi use cheyandi; exact peru + dose cheppandi) ---'
          : '--- DATABASE REFERENCE (products & doses from DB) ---',
        dbReferenceContext.trim(),
      );
    } else if (needsKnowledgeSearch(topics)) {
      sections.push(
        '',
        '--- DATABASE REFERENCE ---',
        'Status: Backend catalog not loaded. Use your agriculture knowledge + farmer profile above.',
      );
    }
  }

  sections.push(
    '',
    '=== HOW TO REPLY ===',
    `- ${AI_CONTEXT_PRIVACY_NOTE}`,
    `- ${AI_REFUSAL_STYLE}`,
    '- Think and answer naturally — local agriculture expert, not a lookup table.',
    '- Use farmer profile, corrections, and local facts they taught you.',
    '- For rogam/purugu/mandu: use DATABASE REFERENCE — exact product, dose, Telugu local name.',
    '- If farmer says you were wrong, agree and follow their correction.',
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
): Promise<string> {
  // Learn from farmer message BEFORE building prompt (corrections, local facts)
  await useFarmerContextStore.getState().learnFromUserMessage(userQuery);

  const topics = detectQueryTopics(userQuery);
  const cropIds = resolveCropIdsForQuery(userQuery, useFarmerContextStore.getState().crops);
  const effectiveLanguage = detectQueryLanguage(userQuery, language);
  let dbReferenceContext = '';

  if (needsKnowledgeSearch(topics)) {
    dbReferenceContext = await fetchKnowledgeContext(userQuery, cropIds);
  }

  return buildFullSystemPrompt(
    language,
    conversations,
    activeConversationId,
    voiceMode,
    userQuery,
    dbReferenceContext.slice(0, voiceMode ? 1500 : 3500),
    effectiveLanguage,
  );
}
