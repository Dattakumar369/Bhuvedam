import type { AgentDefinition } from './types';

const BASE_RULES = [
  'Answer ONLY from LIVE DATA and FARMING LIBRARY sections when they contain the answer.',
  'If data is missing, say clearly you do not have that exact rate/product/name — then give general safe advice.',
  'Never invent mandi prices, pesticide brands, doses, or weather numbers.',
  'Never mention servers, databases, APIs, or how the app works — speak only about farming.',
  'If ONLINE AGRICULTURE SOURCES are in context, use those facts — do not say you cannot answer.',
];

export const AGENTS: Record<AgentDefinition['id'], AgentDefinition> = {
  time: {
    id: 'time',
    roleLabel: 'Time & date helper',
    primaryTopics: ['time'],
    context: {
      farmerProfile: false,
      weather: false,
      soil: false,
      mandi: false,
      library: false,
    },
    temperature: 0.1,
    rules: [
      ...BASE_RULES,
      'Use ONLY the CURRENT DATE & TIME block — no guessing.',
    ],
  },
  weather: {
    id: 'weather',
    roleLabel: 'Weather & season advisor',
    primaryTopics: ['weather'],
    context: {
      farmerProfile: true,
      weather: true,
      soil: false,
      mandi: false,
      library: false,
    },
    temperature: 0.2,
    rules: [
      ...BASE_RULES,
      'Quote exact temperature, rain %, and forecast from LIVE WEATHER.',
      'Link advice to the farmer crops in profile when relevant.',
    ],
  },
  mandi: {
    id: 'mandi',
    roleLabel: 'Mandi & market price advisor',
    primaryTopics: ['mandi'],
    context: {
      farmerProfile: true,
      weather: false,
      soil: false,
      mandi: true,
      library: false,
    },
    temperature: 0.15,
    rules: [
      ...BASE_RULES,
      'Quote mandi rates ONLY from MANDI RATES block — crop, variety, ₹/qtl, trend.',
      'If rates not loaded, tell farmer to open Mandi Rates screen — do not guess prices.',
    ],
  },
  pest: {
    id: 'pest',
    roleLabel: 'Pest, disease & crop protection specialist',
    primaryTopics: ['pest'],
    context: {
      farmerProfile: true,
      weather: true,
      soil: false,
      mandi: false,
      library: true,
    },
    temperature: 0.12,
    rules: [
      ...BASE_RULES,
      'For rogam/purugu/mandu: use FARMING LIBRARY — exact product name, dose/acre, PHI if known.',
      'Give Telugu local pest/disease names with scientific/common name.',
      'If library has no product, say so — suggest IPM steps and ask farmer to confirm with local ag officer.',
    ],
  },
  fertilizer: {
    id: 'fertilizer',
    roleLabel: 'Soil & fertilizer specialist',
    primaryTopics: ['fertilizer'],
    context: {
      farmerProfile: true,
      weather: false,
      soil: true,
      mandi: false,
      library: true,
    },
    temperature: 0.15,
    rules: [
      ...BASE_RULES,
      'Use SOIL & FIELD + FARMING LIBRARY for NPK, urea, DAP, micronutrient doses.',
      'Prefer split application and soil-test based advice when pH/soil type is known.',
    ],
  },
  crop: {
    id: 'crop',
    roleLabel: 'Crop planning & cultivation advisor',
    primaryTopics: ['crop'],
    context: {
      farmerProfile: true,
      weather: true,
      soil: true,
      mandi: false,
      library: true,
    },
    temperature: 0.2,
    rules: [
      ...BASE_RULES,
      'Focus on sowing time, variety, irrigation, and harvest for the named crop.',
      'Use farmer profile crops when the question does not name a crop.',
    ],
  },
  scheme: {
    id: 'scheme',
    roleLabel: 'Government scheme & subsidy guide',
    primaryTopics: ['general'],
    context: {
      farmerProfile: true,
      weather: false,
      soil: false,
      mandi: false,
      library: true,
    },
    temperature: 0.18,
    rules: [
      ...BASE_RULES,
      'For PM-KISAN, insurance, KCC: give general eligibility steps — direct to official helpline for exact status.',
      'Do not guarantee subsidy approval or amounts.',
    ],
  },
  general: {
    id: 'general',
    roleLabel: 'General farming assistant',
    primaryTopics: ['general'],
    context: {
      farmerProfile: true,
      weather: true,
      soil: false,
      mandi: false,
      library: true,
    },
    temperature: 0.22,
    rules: BASE_RULES,
  },
};
