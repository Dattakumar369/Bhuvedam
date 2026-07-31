import { CROPS } from '@/constants/crops';

export type QueryTopic =
  | 'time'
  | 'weather'
  | 'mandi'
  | 'soil'
  | 'pest'
  | 'fertilizer'
  | 'crop'
  | 'general';

const TIME_RE =
  /\b(time|date|clock|samayam|samayam|eppudu|ippudu|entha time|ee roju|roju enti|day enti|today)\b|సమయ|ఎప్పుడు|ఇప్పుడు|రోజు/i;
const WEATHER_RE =
  /\b(weather|rain|varsham|mausam|temperature|humidity|wind|forecast|cyclone|drought|flood)\b|వాతావర|వర్ష|మబ్బ|ఎండ|గాల/i;
const MANDI_RE =
  /\b(mandi|market|rate|price|modal|qtl|sell|buy|entha rate|bhav|bhaav|arhatiya)\b|మండి|రేటు|ధర|బెల|modal/i;
const SOIL_RE =
  /\b(soil|ph|lime|gypsum|texture|organic|clay|sand|silt|land|acre|cent|patta)\b|నేల|మట్టి|ఎకర|సెంట/i;
const PEST_RE =
  /\b(pest|disease|insect|fungus|virus|blight|rust|bollworm|aphid|thrips|spray|pesticide|ipm|mandu|purugu|poda|tega|gaddam|rogam|rogalu|lakshana|vastayi|maccha)\b|తెగ|రోగ|పురుగ|పురుగు|పిచికారి|మంద|పొద|గడ్డ|మచ్చ|లక్ష/i;
const FERT_RE =
  /\b(fertilizer|fertiliser|urea|nano|dap|npk|micronutrient|zinc|boron|compost|manure|dose|dosage|alternative|ledu|lekapothe|badulu|em vadali|eruvu)\b|ఎరువ|యూరియా|డాప|బదుల|లేద|నానో|మంద/i;

function mentionsCrop(query: string): string[] {
  const lower = query.toLowerCase();
  return CROPS.filter(
    (c) =>
      lower.includes(c.id) ||
      lower.includes(c.name.toLowerCase()) ||
      lower.includes(c.nameTe.toLowerCase()),
  ).map((c) => c.id);
}

/** Which LIVE DATA blocks are relevant for this question */
export function detectQueryTopics(query: string): Set<QueryTopic> {
  const topics = new Set<QueryTopic>();
  const q = query.trim();
  if (!q) {
    topics.add('general');
    return topics;
  }

  if (TIME_RE.test(q)) topics.add('time');
  if (WEATHER_RE.test(q)) topics.add('weather');
  if (MANDI_RE.test(q)) topics.add('mandi');
  if (SOIL_RE.test(q)) topics.add('soil');
  if (PEST_RE.test(q)) topics.add('pest');
  if (FERT_RE.test(q)) topics.add('fertilizer');
  if (mentionsCrop(q).length) topics.add('crop');

  if (!topics.size) topics.add('general');
  return topics;
}

export function resolveCropIdsForQuery(query: string, farmerCrops: string[]): string[] {
  const fromQuery = mentionsCrop(query);
  if (fromQuery.length) return fromQuery;
  if (farmerCrops.length) return farmerCrops.slice(0, 2);
  return ['rice'];
}

export function isPestOrDiseaseQuery(query: string): boolean {
  return PEST_RE.test(query);
}

export function needsKnowledgeSearch(topics: Set<QueryTopic>): boolean {
  return (
    topics.has('pest') ||
    topics.has('fertilizer') ||
    topics.has('crop') ||
    topics.has('general')
  );
}
