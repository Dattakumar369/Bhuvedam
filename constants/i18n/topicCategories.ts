import type { AiTopicCategory } from '@/constants/i18n/translations';

/** Shared topic categories — languages without their own copy fall back to English. */
export const EN_TOPIC_CATEGORIES: readonly AiTopicCategory[] = [
  {
    title: '🌾 Crops & Seeds',
    questions: [
      'What crops for this season in my region?',
      'Best seed varieties for high yield?',
      'Crop rotation plan for my field?',
    ],
  },
  {
    title: '🌤 Weather & Season',
    questions: [
      'How does this weather affect my crops?',
      'What is the weather today at my location?',
      'When to sow before monsoon?',
      'Protect crops from heavy rain or heat?',
    ],
  },
  {
    title: '🐛 Pests & Diseases',
    questions: [
      'Organic pest control methods?',
      'Identify and treat crop disease?',
      'Safe pesticide use guidelines?',
      'When to spray for my crop stage?',
      'Where to buy pesticide and estimated price?',
    ],
  },
  {
    title: '🪴 Soil & Fertilizer',
    questions: [
      'Improve soil fertility naturally?',
      'NPK fertilizer schedule for my crop?',
      'Soil testing — what to check?',
    ],
  },
  {
    title: '💧 Irrigation',
    questions: [
      'Drip vs flood irrigation — which is better?',
      'Water schedule for my crop stage?',
      'Save water during drought?',
    ],
  },
  {
    title: '📦 Harvest & Market',
    questions: [
      'When is the best time to harvest?',
      'How is my crop doing right now?',
      'Post-harvest storage tips?',
      'How to get better market price?',
      'What is today mandi rate for my crop?',
      'If I sow rice now, what rate after 3 months?',
      'Sona Masoori vs 1010 — which rate is better today?',
    ],
  },
  {
    title: '🏛 Schemes & Support',
    questions: [
      'PM-KISAN and subsidy eligibility?',
      'Crop insurance — how to apply?',
      'Kisan Credit Card benefits?',
    ],
  },
];

export const TE_TOPIC_CATEGORIES: readonly AiTopicCategory[] = [
  {
    title: '🌾 పంటలు & విత్తనాలు',
    questions: [
      'ఈ సీజన్‌లో నా ప్రాంతానికి ఏ పంటలు వేయాలి?',
      'అధిక దిగుబడికి ఉత్తమ విత్తన రకాలు?',
      'పంట మార్పిడి (crop rotation) ఎలా చేయాలి?',
    ],
  },
  {
    title: '🌤 వాతావరణం & సీజన్',
    questions: [
      'ఈ వాతావరణం నా పంటకు ఎలా ప్రభావం చూపుతుంది?',
      'ఈ రోజు నా location weather ఎలా ఉంది?',
      'వర్షాకాలానికి ముందు ఎప్పుడు విత్తాలి?',
      'గాలి, వర్షం, వేడికి పంట రక్షణ ఎలా?',
    ],
  },
  {
    title: '🐛 తెగులు & వ్యాధులు',
    questions: [
      'సహజ pest control పద్ధతులు?',
      'పంట రోగం గుర్తించి చికిత్స?',
      'కీటనాశకాలు ఎప్పుడు, ఎలా వాడాలి?',
      'నా పంట దశకు eppudu mandu pichikari?',
      'Mandu ekkada dorukutundi, dhara entha?',
    ],
  },
  {
    title: '🪴 మట్టి & ఎరువులు',
    questions: [
      'మట్టి సారవంతతను సహజంగా ఎలా పెంచాలి?',
      'నా పంటకు NPK ఎరువు schedule?',
      'Soil test — ఏం చూడాలి?',
    ],
  },
  {
    title: '💧 నీటిపారుదల',
    questions: [
      'Drip vs flood — ఏది మంచిది?',
      'పంట దశకు నీటి schedule?',
      'కరువు సమయంలో నీరు ఆదా ఎలా?',
    ],
  },
  {
    title: '📦 పంట & మార్కెట్',
    questions: [
      'పంట కోయడానికి సరైన సమయం?',
      'నా పంట ప్రస్తుతం ఎలా ఉంది?',
      'పండ్ల నిల్వ చిట్కాలు?',
      'మార్కెట్‌లో మంచి ధర ఎలా పొందాలి?',
      'ఈ రోజు నా పంట mandi rate ఎంత?',
      'ఇప్పుడు వరి నాటితే 3 నెలల తర్వాత rate ఎంత?',
      'Sona Masoori vs 1010 — evari rate ekkuva?',
    ],
  },
  {
    title: '🏛 పథకాలు & సబ్సిడీ',
    questions: [
      'PM-KISAN అర్హత ఎలా?',
      'Crop insurance apply ఎలా?',
      'Kisan Credit Card ప్రయోజనాలు?',
    ],
  },
];
