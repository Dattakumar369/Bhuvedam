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

export const HI_TOPIC_CATEGORIES: readonly AiTopicCategory[] = [
  { title: '🌾 फसलें और बीज', questions: ['इस मौसम में मेरे क्षेत्र के लिए कौन सी फसल?', 'उच्च उपज के लिए सर्वोत्तम बीज?', 'खेत के लिए crop rotation योजना?'] },
  { title: '🌤 मौसम और सीजन', questions: ['यह मौसम मेरी फसल को कैसे प्रभावित करता है?', 'आज मेरे स्थान पर मौसम?', 'मानसून से पहले बुवाई कब?', 'भारी बारिश/गर्मी से फसल की सुरक्षा?'] },
  { title: '🐛 कीट और रोग', questions: ['जैविक कीट नियंत्रण?', 'फसल रोग पहचान और उपचार?', 'सुरक्षित कीटनाशक उपयोग?', 'मेरी फसल की अवस्था में छिड़काव कब?', 'कीटनाशक कहाँ मिलेगा, कीमत?'] },
  { title: '🪴 मिट्टी और उर्वरक', questions: ['प्राकृतिक रूप से मिट्टी की उर्वरता बढ़ाएं?', 'मेरी फसल के लिए NPK schedule?', 'मिट्टी परीक्षण — क्या जांचें?'] },
  { title: '💧 सिंचाई', questions: ['Drip vs flood — कौन बेहतर?', 'फसल अवस्था के लिए पानी schedule?', 'सूखे में पानी बचाएं?'] },
  { title: '📦 कटाई और बाजार', questions: ['कटाई का सबसे अच्छा समय?', 'मेरी फसल अभी कैसी है?', 'कटाई के बाद भंडारण सुझाव?', 'बेहतर mandi भाव कैसे?', 'आज मेरी फसल का mandi rate?', '3 महीने बाद चावल की कीमत?', 'Sona Masoori vs 1010 — आज कौन बेहतर?'] },
  { title: '🏛 योजनाएं', questions: ['PM-KISAN पात्रता?', 'फसल बीमा — आवेदन?', 'Kisan Credit Card लाभ?'] },
];

export const MR_TOPIC_CATEGORIES: readonly AiTopicCategory[] = [
  { title: '🌾 पिके आणि बियाणे', questions: ['या हंगामात कोणती पिके?', 'उच्च उत्पादनासाठी सर्वोत्तम बियाणे?', 'शेतासाठी crop rotation?'] },
  { title: '🌤 हवामान', questions: ['हवामानाचा पिकांवर परिणाम?', 'आज माझ्या ठिकाणी हवामान?', 'पाऊसापूर्वी पेरणी कधी?', 'पिकांचे संरक्षण?'] },
  { title: '🐛 कीड आणि रोग', questions: ['सेंद्रिय कीड नियंत्रण?', 'रोग ओळख आणि उपचार?', 'सुरक्षित कीटकनाशक?', 'फवारणी वेळ?', 'कीटकनाशक कुठे, किंमत?'] },
  { title: '🪴 माती आणि खते', questions: ['माती सुपीकता वाढवा?', 'NPK वेळापत्रक?', 'माती चाचणी?'] },
  { title: '💧 सिंचन', questions: ['Drip vs flood?', 'पाणी schedule?', 'दुष्काळात पाणी वाचवा?'] },
  { title: '📦 कापणी आणि बाजार', questions: ['कापणीची वेळ?', 'पीक स्थिती?', 'साठवण सूचना?', 'Mandi भाव?', 'आज mandi rate?', '3 महिन्यात भाव?', 'Sona Masoori vs 1010?'] },
  { title: '🏛 योजना', questions: ['PM-KISAN?', 'Crop insurance?', 'KCC?'] },
];

export const TA_TOPIC_CATEGORIES: readonly AiTopicCategory[] = [
  { title: '🌾 பயிர்கள் & விதை', questions: ['இந்த பருவத்தில் எந்த பயிர்?', 'அதிக மகசூல் variety?', 'Crop rotation?'] },
  { title: '🌤 வானிலை', questions: ['வானிலை பயிர் பாதிப்பு?', 'இன்று என் location weather?', 'மழைக்கு முன் விதைப்பு?', 'பயிர் பாதுகாப்பு?'] },
  { title: '🐛 பூச்சி & நோய்', questions: ['Organic pest control?', 'நோய் கண்டறிதல்?', 'Pesticide பயன்பாடு?', 'தெளிப்பு நேரம்?', 'Mandu எங்கே, விலை?'] },
  { title: '🪴 மண் & உரம்', questions: ['மண் வளம்?', 'NPK schedule?', 'Soil test?'] },
  { title: '💧 பாசனம்', questions: ['Drip vs flood?', 'நீர் schedule?', 'வறட்சியில் சேமிப்பு?'] },
  { title: '📦 அறுவடை & சந்தை', questions: ['அறுவடை நேரம்?', 'பயிர் நிலை?', 'Storage tips?', 'Mandi விலை?', 'இன்று rate?', '3 மாதம் rate?', 'Sona Masoori vs 1010?'] },
  { title: '🏛 திட்டங்கள்', questions: ['PM-KISAN?', 'Crop insurance?', 'KCC?'] },
];

export const KN_TOPIC_CATEGORIES: readonly AiTopicCategory[] = [
  { title: '🌾 ಬೆಳೆಗಳು & ಬೀಜ', questions: ['ಈ ಋತುವಿನ ಯಾವ ಬೆಳೆ?', 'ಹೆಚ್ಚಿನ ಇಳುವರಿ variety?', 'Crop rotation?'] },
  { title: '🌤 ಹವಾಮಾನ', questions: ['ಹವಾಮಾನ ಪರಿಣಾಮ?', 'ಇಂದು ನನ್ನ location weather?', 'ಮಳೆಗ ಮುಂಚೆ ಬಿತ್ತನೆ?', 'ಬೆಳೆ ರಕ್ಷಣೆ?'] },
  { title: '🐛 ಕೀಟ & ರೋಗ', questions: ['Organic pest control?', 'ರೋಗ ಗುರುತಿಸಿ?', 'Pesticide?', 'ಸಿಂಪಡಣೆ ಸಮಯ?', 'Mandu ಎಲ್ಲಿ, ಬೆಲೆ?'] },
  { title: '🪴 ಮಣ್ಣು & ರಸಗೊಬ್ಬರ', questions: ['ಮಣ್ಣು ಫಲವತ್ತತೆ?', 'NPK schedule?', 'Soil test?'] },
  { title: '💧 ನೀರಾವರಿ', questions: ['Drip vs flood?', 'ನೀರು schedule?', 'ಬರಗಾಲದಲ್ಲಿ ಉಳಿಸಿ?'] },
  { title: '📦 ಕೊಯ್ಲು & ಮಾರುಕಟ್ಟೆ', questions: ['ಕೊಯ್ಲು ಸಮಯ?', 'ಬೆಳೆ ಸ್ಥಿತಿ?', 'Storage?', 'Mandi ಬೆಲೆ?', 'ಇಂದು rate?', '3 ತಿಂಗಳ rate?', 'Sona Masoori vs 1010?'] },
  { title: '🏛 ಯೋಜನೆಗಳು', questions: ['PM-KISAN?', 'Crop insurance?', 'KCC?'] },
];

export const TOPIC_CATEGORIES_BY_LANG = {
  en: EN_TOPIC_CATEGORIES,
  te: TE_TOPIC_CATEGORIES,
  hi: HI_TOPIC_CATEGORIES,
  mr: MR_TOPIC_CATEGORIES,
  ta: TA_TOPIC_CATEGORIES,
  kn: KN_TOPIC_CATEGORIES,
} as const;
