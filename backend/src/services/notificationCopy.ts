/** Localized push notification strings (server). Fallback: te → en. */

export type NotifLang = 'en' | 'hi' | 'te' | 'mr' | 'ta' | 'kn';

type Dict = Record<string, string>;

const EN: Dict = {
  dailyTitle: 'Bhuvedam — Your farm update',
  dailyBody: 'Check weather, mandi rates and crop alerts for today.',
  dailyBodyCrops: 'Check weather & mandi for your crops: {crops}.',
  heavyRainTitle: '⛈️ Heavy rain expected',
  heavyRainBody:
    'Next few hours {rain}% rain chance — avoid spraying, postpone fertilizer.',
  rainTitle: '🌧️ Rain possible today',
  rainBody: '{rain}% rain chance — not good for pesticide spray. Check irrigation plan.',
  heatTitle: '🌡️ High temperature',
  heatBody: 'Current {temp}°C — avoid midday spray; irrigate morning/evening.',
  windTitle: '💨 Strong wind',
  windBody: 'Wind {wind} km/h — spraying will not be effective.',
  mandiUpTitle: '📈 {crop} price rose',
  mandiDownTitle: '📉 {crop} price fell',
  mandiBody: '{crop}{variety}: ₹{old} → ₹{new}/qtl ({change}%)',
};

const HI: Dict = {
  dailyTitle: 'Bhuvedam — आपके खेत का अपडेट',
  dailyBody: 'आज मौसम, मंडी भाव और फसल अलर्ट देखें।',
  dailyBodyCrops: 'आपकी फसलों के लिए मौसम और मंडी देखें: {crops}।',
  heavyRainTitle: '⛈️ भारी बारिश की संभावना',
  heavyRainBody: 'अगले कुछ घंटों में {rain}% बारिश — छिड़काव न करें, खाद टालें।',
  rainTitle: '🌧️ आज बारिश संभव',
  rainBody: '{rain}% बारिश — कीटनाशक छिड़काव ठीक नहीं। सिंचाई योजना जाँचें।',
  heatTitle: '🌡️ तेज़ गर्मी',
  heatBody: 'अभी {temp}°C — दोपहर में छिड़काव न करें; सुबह/शाम सिंचाई करें।',
  windTitle: '💨 तेज़ हवा',
  windBody: 'हवा {wind} km/h — छिड़काव असरदार नहीं होगा।',
  mandiUpTitle: '📈 {crop} भाव बढ़ा',
  mandiDownTitle: '📉 {crop} भाव घटा',
  mandiBody: '{crop}{variety}: ₹{old} → ₹{new}/qtl ({change}%)',
};

const TE: Dict = {
  dailyTitle: 'Bhuvedam — మీ పొలం update',
  dailyBody: 'ఈరోజు వాతావరణం, మార్కెట్ రేట్లు & పంట alerts చూడండి.',
  dailyBodyCrops: 'మీ పంటలకు వాతావరణం & మార్కెట్ చూడండి: {crops}.',
  heavyRainTitle: '⛈️ భారీ వర్షం అవకాశం',
  heavyRainBody: 'తర్వాతి గంటల్లో {rain}% వర్షం — స్ప్రే చేయవద్దు, ఎరువు వాయిదా వేయండి.',
  rainTitle: '🌧️ ఈరోజు వర్షం అవకాశం',
  rainBody: '{rain}% వర్షం — పురుగుమందు స్ప్రేకి మంచిది కాదు. నీటిపారుదల ప్లాన్ చూడండి.',
  heatTitle: '🌡️ ఎక్కువ ఉష్ణోగ్రత',
  heatBody: 'ప్రస్తుతం {temp}°C — మధ్యాహ్నం స్ప్రే చేయవద్దు; ఉదయం/సాయంత్రం నీరు పెట్టండి.',
  windTitle: '💨 బలమైన గాలి',
  windBody: 'గాలి {wind} km/h — స్ప్రే పని చేయదు.',
  mandiUpTitle: '📈 {crop} రేటు పెరిగింది',
  mandiDownTitle: '📉 {crop} రేటు తగ్గింది',
  mandiBody: '{crop}{variety}: ₹{old} → ₹{new}/qtl ({change}%)',
};

const BY_LANG: Record<string, Dict> = {
  en: EN,
  hi: HI,
  te: TE,
  mr: HI,
  ta: TE,
  kn: TE,
};

export function normalizeNotifLang(code?: string | null): string {
  const c = (code ?? 'te').trim().toLowerCase().slice(0, 2);
  return c in BY_LANG ? c : 'te';
}

export function tNotif(
  lang: string | null | undefined,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const code = normalizeNotifLang(lang);
  const dict = BY_LANG[code] ?? TE;
  let out = dict[key] ?? EN[key] ?? TE[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(String(v));
    }
  }
  return out;
}

export function dailyReminderCopy(
  lang: string | null | undefined,
  cropNames?: string[],
): { title: string; body: string } {
  const crops = (cropNames ?? []).filter(Boolean).slice(0, 4).join(', ');
  return {
    title: tNotif(lang, 'dailyTitle'),
    body: crops
      ? tNotif(lang, 'dailyBodyCrops', { crops })
      : tNotif(lang, 'dailyBody'),
  };
}
