/** Facts the farmer taught us — corrections, local practices, availability — not scripted Q&A */

export interface FarmerLearnedFact {
  id: string;
  text: string;
  topic: string;
  source: 'user' | 'correction';
  learnedAt: string;
}

const CORRECTION_RE =
  /\b(wrong|incorrect|not correct|that's wrong|actually|correct is|fix this|tappu|tappadu|kadu|kadhu|nijam|mari|cheppaledu)\b|తప్ప|కాదు|నిజం|మార/i;

export function isFarmerCorrection(message: string): boolean {
  return CORRECTION_RE.test(message.trim());
}

const WEB_SEARCH_RE =
  /\b(search|find|google|internet|web|online|look up|browse)\b|search chey|web lo|internet lo|online lo|google lo|వెబ|ఇంటర్నెట|సెర్చ|వెత|ఆన్లైన/i;

export function wantsWebSearch(message: string): boolean {
  return WEB_SEARCH_RE.test(message.trim());
}

const TEACHING_RE =
  /\b(we use|we always|in our village|in my field|maaku|memu|manam|ikkada|maku telusu|gurtu pettuk|naku telisina|ma deggara|local shop)\b|మాకు|మేము|ఇక్కడ|గుర్త/i;

const AG_RE =
  /\b(urea|nano|fertilizer|eruvu|pesticide|spray|crop|panta|disease|rogam|soil|mandi|variety|rakam|dose|acre|irrigat|patt|dealer)\b|ఎరువ|పంట|రోగ|మంద|వరి/i;

const QUESTION_RE = /\?|^(em|enti|how|what|why|when|where|ela|evaru|eppudu)\b|ఏం|ఎలా|ఎప్పుడు|ఎంత/i;

function detectTopic(text: string): string {
  const t = text.toLowerCase();
  if (/urea|nano|fertilizer|eruvu|dap|npk|ఎరువ/.test(t)) return 'fertilizer';
  if (/pest|spray|mandu|disease|rogam|పురుగ|రోగ/.test(t)) return 'crop_protection';
  if (/mandi|rate|price|modal|మండి|రేటు/.test(t)) return 'mandi';
  if (/soil|ph|acre|cent|patta|నేల/.test(t)) return 'farm';
  if (/variety|rakam|rakalu/.test(t)) return 'variety';
  return 'general';
}

function factId(text: string): string {
  return `f-${text.slice(0, 40).replace(/\W+/g, '-').toLowerCase()}-${Date.now()}`;
}

/** Pull storable knowledge from a farmer message (not questions). */
export function extractFarmerKnowledge(message: string): FarmerLearnedFact[] {
  const text = message.trim().slice(0, 220);
  if (text.length < 12) return [];
  if (QUESTION_RE.test(text)) return [];

  const isCorrection = CORRECTION_RE.test(text);
  const isTeaching = TEACHING_RE.test(text);
  const isAgFact = AG_RE.test(text) && text.length >= 18;

  if (!isCorrection && !isTeaching && !isAgFact) return [];

  return [
    {
      id: factId(text),
      text,
      topic: detectTopic(text),
      source: isCorrection ? 'correction' : 'user',
      learnedAt: new Date().toISOString(),
    },
  ];
}

export function mergeLearnedFacts(
  existing: FarmerLearnedFact[],
  incoming: FarmerLearnedFact[],
  max = 40,
): FarmerLearnedFact[] {
  const map = new Map<string, FarmerLearnedFact>();
  for (const f of [...incoming, ...existing]) {
    const key = f.text.toLowerCase().slice(0, 80);
    if (!map.has(key)) map.set(key, f);
  }
  return [...map.values()].slice(0, max);
}

export function formatLearnedFactsForAI(facts: FarmerLearnedFact[]): string {
  if (!facts.length) return '';

  const corrections = facts.filter((f) => f.source === 'correction');
  const taught = facts.filter((f) => f.source === 'user');

  const lines = [
    'FARMER-TAUGHT KNOWLEDGE (this farmer corrected or taught the app — ALWAYS prefer over generic advice):',
  ];

  if (corrections.length) {
    lines.push('', 'Corrections from this farmer:');
    corrections.slice(0, 8).forEach((f, i) => lines.push(`  ${i + 1}. ${f.text}`));
  }

  if (taught.length) {
    lines.push('', 'Local practices / facts this farmer shared:');
    taught.slice(0, 8).forEach((f, i) => lines.push(`  ${i + 1}. ${f.text}`));
  }

  lines.push('', 'If a correction conflicts with older advice, the correction wins.');

  return lines.join('\n');
}
