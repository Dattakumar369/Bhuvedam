import type { LanguageCode } from '@/constants/languages';

export interface FieldMeasureMessages {
  title: string;
  modeWalk: string;
  modeCorner: string;
  helpWalk: string;
  helpCorner: string;
  mapWaiting: string;
  cornerCaptureStart: string;
  walkStartFailed: string;
  walkTooFewPoints: string;
  walkLoopGap: (m: number) => string;
  bestSignal: string;
  bestSignalWait: string;
  bestSignalWeak: string;
  pointsWalk: (n: number) => string;
  pointsCorner: (n: number) => string;
  cornerLabel: (n: number) => string;
  resultTitle: string;
  resultSubWalk: (n: number, sqm: number) => string;
  resultSubCorner: (n: number, sqm: number) => string;
  uncertainty: (pct: number) => string;
  hintNeedCorners: (n: number) => string;
  hintLoopGap: (m: number) => string;
  btnStopWalk: string;
  btnStartWalk: string;
  btnAddCorner: (n: number) => string;
  btnAddCornerLoading: string;
  btnUseSize: string;
  undo: string;
  clear: string;
  qualityGood: string;
  qualityOk: string;
  qualityPoor: string;
  permissionDenied: string;
  gpsOff: string;
  cornerWarmFast: string;
  cornerWarm: string;
  gpsFix: (sec: number) => string;
  stableAlmost: string;
  cornerReading: (sec: number) => string;
  processing: string;
  gpsFixFailed: (m: number) => string;
  spreadUnstable: (m: number) => string;
  accuracyPoor: (m: number) => string;
  validateTooClose: string;
  validateNearFirst: string;
  walkStartFusion: string;
  walkStartPlain: string;
  gpsWeak: (m: number) => string;
  walkStartRecorded: string;
  walkJitterIgnore: string;
  walkNearStop: string;
  walkWalking: (dist: number, pts: number) => string;
  walkRecording: (dist: number, pts: number) => string;
  walkProgressMeta: (pts: number, dist: number, acc?: number) => string;
  accuracyGood: (acc: number, spread?: number) => string;
  accuracyOk: (acc: number, spread?: number) => string;
  accuracyWeak: (acc: number) => string;
  accuracyUnknown: string;
  measureIntroTitle: string;
  measureIntroBody: string;
  measureIntroNote: string;
  mapTitle: string;
  mapLegendStart: string;
  mapLegendEnd: string;
  mapLegendArea: string;
  mapLiveMarker: string;
  mapFallback: string;
  adjustTitle: string;
  adjustHint: string;
  btnWalkAgain: string;
}

const en: FieldMeasureMessages = {
  title: '📍 GPS field measure',
  modeWalk: 'Walk',
  modeCorner: 'Corner pin ★',
  helpWalk: 'Walk the field border and tap Stop when back at the start. Keep phone steady — GPS + motion smoothing ON.',
  helpCorner: 'Tap add at each corner — hold still 3–5 sec, auto-saves when stable. Tape measure best for small fields.',
  mapWaiting: 'Loading map — wait 2–3 sec for GPS fix…',
  cornerCaptureStart: 'Stand at corner — GPS reading (~3–5 sec, auto save when stable)',
  walkStartFailed: 'Could not start walk tracking',
  walkTooFewPoints: 'Walk the full border — need more points, try again',
  walkLoopGap: (m) => `Return to start — ${m}m away. Complete the loop then tap Stop.`,
  bestSignal: 'Best signal:',
  bestSignalWait: ' — wait a bit more',
  bestSignalWeak: ' — weak',
  pointsWalk: (n) => `${n} GPS points recorded`,
  pointsCorner: (n) => `${n} corners`,
  cornerLabel: (n) => `Corner ${n}`,
  resultTitle: 'GPS area estimate',
  resultSubWalk: (n, sqm) => `${Math.round(sqm)} sq.m · ${n} walk points`,
  resultSubCorner: (n, sqm) => `${Math.round(sqm)} sq.m · ${n} corners`,
  uncertainty: (pct) => `Approx ±${pct}% (depends on GPS signal)`,
  hintNeedCorners: (n) => `Add ${n} more corner(s) to see area`,
  hintLoopGap: (m) => `${m}m from start — complete the loop or area will be wrong`,
  btnStopWalk: 'Stop — finished walking border',
  btnStartWalk: 'Start walking field border',
  btnAddCorner: (n) => `Add corner ${n}`,
  btnAddCornerLoading: 'GPS reading…',
  btnUseSize: 'Use this GPS size',
  undo: 'Undo',
  clear: 'Clear',
  qualityGood: '±1–2m good ✓',
  qualityOk: '±2–3m ok',
  qualityPoor: 'GPS weak',
  permissionDenied: 'Location permission denied — allow in Settings',
  gpsOff: 'GPS is OFF — turn on Location in Settings',
  cornerWarmFast: 'Stand at corner — GPS reading (~2–3 sec)',
  cornerWarm: 'Stand at corner, hold phone still — GPS reading',
  gpsFix: (sec) => `Getting GPS fix… ${sec}s — stay at corner`,
  stableAlmost: 'Stable reading — almost done…',
  cornerReading: (sec) => `Corner reading… ${sec}s`,
  processing: 'Calculating stable point…',
  gpsFixFailed: (m) => `GPS not fixed (best ±${m}m). Open sky, hold still 3–5 sec at corner, try again.`,
  spreadUnstable: (m) => `GPS not stable (±${m}m spread). Hold still and try again.`,
  accuracyPoor: (m) => `GPS accuracy poor (±${m}m). Wait in open sky and try again.`,
  validateTooClose: 'Too close to previous corner — walk to next corner and add.',
  validateNearFirst: 'Too close to first corner — same place twice.',
  walkStartFusion: 'Walk field border — phone in hand (GPS + motion smooth ON)',
  walkStartPlain: 'Walk field border — phone in hand, open sky',
  gpsWeak: (m) => `GPS weak (±${m}m) — move to open sky`,
  walkStartRecorded: 'Start recorded — walk around the field',
  walkJitterIgnore: 'Standing still — ignoring GPS jitter, keep walking',
  walkNearStop: 'Near start — tap Stop to see area',
  walkWalking: (dist, pts) => `Walking… ${dist}m (${pts} points)`,
  walkRecording: (dist, pts) => `Recording… ${dist}m walked · ${pts} points`,
  walkProgressMeta: (pts, dist, acc) =>
    `${pts} points · ${dist}m walked${acc != null ? ` · ±${Math.round(acc)}m` : ''}`,
  accuracyGood: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — good` : `±${acc}m — good`,
  accuracyOk: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — wait in open sky for better` : `±${acc}m`,
  accuracyWeak: (acc) => `±${acc}m — weak signal`,
  accuracyUnknown: 'accuracy unknown',
  measureIntroTitle: 'Measure field with GPS',
  measureIntroBody:
    'Corner pin (★) — tap add at each corner, hold 3–5 sec (auto save). Walk mode — walk border and Stop at start.',
  measureIntroNote: 'GPS ±2–5m error — use tape/patta for exact size. Open sky required.',
  mapTitle: 'Satellite map — path you walked',
  mapLegendStart: 'Start point',
  mapLegendEnd: 'Stop point',
  mapLegendArea: 'Green = covered land area',
  mapLiveMarker: 'You are here (live GPS)',
  mapFallback: 'Map unavailable — GPS path and area still work. Try again.',
  adjustTitle: 'Adjust path',
  adjustHint: 'Undo wrong points or walk again if the border looks wrong on the map.',
  btnWalkAgain: 'Walk again',
};

const te: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS polam measure',
  modeWalk: 'Tiragandi',
  modeCorner: 'Moolalu pin ★',
  helpWalk: 'Polam border chuttu tirigi start point daggariki vachaka Stop nokki. Phone shake cheyakandi — GPS + motion smooth ON.',
  helpCorner: 'Prati moola daggar “add” nokki — 3–5 sec nilchondi, stable ayyaka auto save. Chinna polam ki tape/patta best.',
  mapWaiting: 'Map load avutundi — GPS fix kosam 2–3 sec wait…',
  cornerCaptureStart: 'Moola lo nilchondi — GPS reading (~3–5 sec, stable ayyaka auto save)',
  walkStartFailed: 'Walk tracking start avvaledu',
  walkTooFewPoints: 'Polam chuttu polamaina tiragali — inka konni steps tirigi malli try cheyandi',
  walkLoopGap: (m) => `Start point daggaraki tiragali — ippudu ${m}m dooram. Loop complete chesi Stop nokki.`,
  bestSignalWait: ' — inka wait cheyandi',
  pointsWalk: (n) => `${n} GPS points record ayyayi`,
  pointsCorner: (n) => `${n} moolalu`,
  cornerLabel: (n) => `Moola ${n}`,
  resultTitle: 'GPS estimate / సుమారు విస్తీర్ణం',
  uncertainty: (pct) => `Approx ±${pct}% (GPS signal batti)`,
  hintNeedCorners: (n) => `Inka ${n} moola add cheyandi area kanipinchadaniki`,
  hintLoopGap: (m) => `Start point daggaraki ${m}m undi — polam chuttu complete cheyandi`,
  btnStopWalk: 'Stop — polam chuttu aipoyindi',
  btnStartWalk: 'Polam chuttu tiragadam start',
  btnAddCorner: (n) => `Moolam ${n} add cheyandi`,
  btnAddCornerLoading: 'GPS reading...',
  btnUseSize: 'Ee GPS size use cheyandi',
  qualityGood: '±1–2m bagundi ✓',
  qualityOk: '±2–3m ok',
  permissionDenied: 'Location permission ivvaledi — Settings lo Allow cheyandi',
  gpsOff: 'Phone lo Location/GPS OFF undi — Settings lo ON cheyandi',
  cornerWarmFast: 'Moola lo nilchondi — GPS reading (~2–3 sec)',
  cornerWarm: 'Moola lo nilchondi, phone shake cheyakandi — GPS reading',
  gpsFix: (sec) => `GPS fix avutundi… ${sec}s — moola daggarame nilchondi`,
  stableAlmost: 'Stable reading — almost done…',
  cornerReading: (sec) => `Moola reading… ${sec}s`,
  processing: 'Stable point calculate avutundi…',
  gpsFixFailed: (m) => `GPS sariga fix avvaledu (best ±${m}m). Open sky lo 3–5 sec nilchondi, malli try cheyandi.`,
  spreadUnstable: (m) => `GPS readings stable kaavu (±${m}m spread). Koncham nilchondi, malli try cheyandi.`,
  accuracyPoor: (m) => `GPS accuracy taggindi (±${m}m). Open sky lo wait chesi malli add cheyandi.`,
  validateTooClose: 'I moola previous moola ki chaala daggaraga undi. Next moola ki walk chesi add cheyandi.',
  validateNearFirst: 'First moola ki daggaraga undi — okate place lo add avutundi.',
  walkStartFusion: 'Polam border chuttu tiragandi — phone chethulo pettandi (GPS + motion smooth ON)',
  walkStartPlain: 'Polam border chuttu tiragandi — open sky chudali',
  gpsWeak: (m) => `GPS weak (±${m}m) — open sky daggaraki vellandi`,
  walkStartRecorded: 'Start point record ayyindi — ippudu polam chuttu tiragandi',
  walkJitterIgnore: 'Nilchunnapudu GPS jitter ignore — tiragadam continue cheyandi',
  walkNearStop: 'Start point daggaraki vacharu — Stop nokki area kanipistundi',
  walkWalking: (dist, pts) => `Tirugutunnaru… ${dist}m (${pts} points)`,
  walkRecording: (dist, pts) => `Recording… ${dist}m tirigaru · ${pts} points`,
  walkProgressMeta: (pts, dist, acc) =>
    `${pts} points · ${dist}m tirigaru${acc != null ? ` · ±${Math.round(acc)}m` : ''}`,
  accuracyGood: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — bagundi` : `±${acc}m — bagundi`,
  accuracyOk: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — open sky lo inka wait cheste better` : `±${acc}m`,
  accuracyWeak: (acc) => `±${acc}m — weak signal`,
  measureIntroTitle: 'GPS tho polam kolavandi',
  measureIntroBody:
    'Moolalu pin (★) — prati corner daggar “add” nokki, 3–5 sec nilchondi (stable ayyaka auto save). Walk mode — border tirigi start daggaraki Stop.',
  measureIntroNote: 'GPS ±2–5m error — exact size ki patta/tape measure use cheyandi. Open sky must.',
  mapFallback: 'Map load avvaledu — GPS path & area inka work avutundi. Malli try cheyandi.',
  mapTitle: 'Satellite map — mee polam chuttu tirigina path',
  mapLegendStart: 'Modalupettadam (start)',
  mapLegendEnd: 'Aapadam (stop)',
  mapLegendArea: 'Green = cover chesina bhumi',
  mapLiveMarker: 'Ippudu ikkada (live GPS)',
  adjustTitle: 'Path adjust cheyandi',
  adjustHint: 'Map lo border sariga lekapothe last point undo cheyandi leda malli tiragandi.',
  btnWalkAgain: 'Malli tiragandi',
};

const hi: FieldMeasureMessages = {
  title: '📍 GPS खेत माप',
  modeWalk: 'चलें',
  modeCorner: 'कोना पिन ★',
  helpWalk: 'खेत की सीमा पर चलें और शुरुआती बिंदु पर वापस आकर Stop दबाएं। फोन स्थिर रखें — GPS + motion smooth ON।',
  helpCorner: 'हर कोने पर add दबाएं — 3–5 सेकंड स्थिर रहें, stable होने पर auto save। छोटे खेत के लिए tape measure बेहतर।',
  mapWaiting: 'मैप लोड हो रहा है — GPS fix के लिए 2–3 सेकंड…',
  cornerCaptureStart: 'कोने पर खड़े रहें — GPS reading (~3–5 सेकंड, stable पर auto save)',
  walkStartFailed: 'वॉक ट्रैकिंग शुरू नहीं हुई',
  walkTooFewPoints: 'पूरा border चलें — और points चाहिए, फिर कोशिश करें',
  walkLoopGap: (m) => `शुरुआती बिंदु पर लौटें — ${m}m दूर। Loop पूरा करके Stop दबाएं।`,
  bestSignal: 'सबसे अच्छा signal:',
  bestSignalWait: ' — थोड़ा और wait',
  bestSignalWeak: ' — कमजोर',
  pointsWalk: (n) => `${n} GPS points record हुए`,
  pointsCorner: (n) => `${n} कोने`,
  cornerLabel: (n) => `कोना ${n}`,
  resultTitle: 'GPS क्षेत्र अनुमान',
  resultSubWalk: (n, sqm) => `${Math.round(sqm)} sq.m · ${n} walk points`,
  resultSubCorner: (n, sqm) => `${Math.round(sqm)} sq.m · ${n} कोने`,
  uncertainty: (pct) => `लगभग ±${pct}% (GPS signal पर निर्भर)`,
  hintNeedCorners: (n) => `क्षेत्र देखने के लिए ${n} और कोना add करें`,
  hintLoopGap: (m) => `शुरुआत से ${m}m दूर — loop पूरा करें वरना area गलत होगा`,
  btnStopWalk: 'Stop — border पूरा',
  btnStartWalk: 'खेत border चलना शुरू',
  btnAddCorner: (n) => `कोना ${n} add करें`,
  btnAddCornerLoading: 'GPS reading…',
  btnUseSize: 'यह GPS size use करें',
  undo: 'Undo',
  clear: 'Clear',
  qualityGood: '±1–2m अच्छा ✓',
  qualityOk: '±2–3m ठीक',
  qualityPoor: 'GPS कमजोर',
  permissionDenied: 'Location permission नहीं — Settings में Allow करें',
  gpsOff: 'GPS OFF है — Settings में Location ON करें',
  cornerWarmFast: 'कोने पर खड़े रहें — GPS (~2–3 सेकंड)',
  cornerWarm: 'कोने पर खड़े रहें, फोन हिलाएं नहीं — GPS reading',
  gpsFix: (sec) => `GPS fix… ${sec}s — कोने पर ही रहें`,
  stableAlmost: 'Stable reading — लगभग हो गया…',
  cornerReading: (sec) => `कोना reading… ${sec}s`,
  processing: 'Stable point calculate…',
  gpsFixFailed: (m) => `GPS fix नहीं (best ±${m}m). Open sky में 3–5 sec रुकें, फिर try।`,
  spreadUnstable: (m) => `GPS stable नहीं (±${m}m spread). स्थिर रहकर फिर try।`,
  accuracyPoor: (m) => `GPS accuracy कम (±${m}m). Open sky में wait करें।`,
  validateTooClose: 'पिछले कोने के बहुत पास — अगले कोने पर walk करके add करें।',
  validateNearFirst: 'पहले कोने के पास — same जगह दो बार।',
  walkStartFusion: 'खेत border चलें — phone हाथ में (GPS + motion ON)',
  walkStartPlain: 'खेत border चलें — open sky',
  gpsWeak: (m) => `GPS weak (±${m}m) — open sky की ओर जाएं`,
  walkStartRecorded: 'Start record — अब border चलें',
  walkJitterIgnore: 'खड़े हैं — GPS jitter ignore, चलते रहें',
  walkNearStop: 'Start के पास — Stop दबाकर area देखें',
  walkWalking: (dist, pts) => `चल रहे… ${dist}m (${pts} points)`,
  walkRecording: (dist, pts) => `Recording… ${dist}m · ${pts} points`,
  walkProgressMeta: (pts, dist, acc) =>
    `${pts} points · ${dist}m${acc != null ? ` · ±${Math.round(acc)}m` : ''}`,
  accuracyGood: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — अच्छा` : `±${acc}m — अच्छा`,
  accuracyOk: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — open sky में wait करें` : `±${acc}m`,
  accuracyWeak: (acc) => `±${acc}m — weak signal`,
  accuracyUnknown: 'accuracy unknown',
  measureIntroTitle: 'GPS से खेत मापें',
  measureIntroBody:
    'Corner pin (★) — हर corner पर add, 3–5 sec रुकें (auto save). Walk mode — border चलकर start पर Stop।',
  measureIntroNote: 'GPS ±2–5m error — exact size के लिए tape/patta use करें। Open sky जरूरी।',
  mapTitle: 'Satellite map — aapka chala hua path',
  mapLegendStart: 'Shuruati point',
  mapLegendEnd: 'Stop point',
  mapLegendArea: 'Green = cover ki hui zameen',
  mapLiveMarker: 'Abhi yahan (live GPS)',
  adjustTitle: 'Path adjust karein',
  adjustHint: 'Map par border galat ho to undo karein ya dubara chalen.',
  btnWalkAgain: 'Dubara chalen',
};

const mr: FieldMeasureMessages = {
  ...hi,
  title: '📍 GPS शेत मोजमाप',
  modeWalk: 'फिरा',
  modeCorner: 'कोपरा pin ★',
  helpWalk: 'शेताच्या border फिरा आणि start point जवळ Stop दाबा. Phone स्थिर ठेवा.',
  helpCorner: 'प्रत्येक कोपऱ्यावर add — 3–5 sec स्थिर राहा, stable झाल्यावर auto save.',
  cornerCaptureStart: 'कोपऱ्यावर उभे राहा — GPS reading (~3–5 sec)',
  btnStopWalk: 'Stop — border पूर्ण',
  btnStartWalk: 'शेत border फिरणे सुरू',
  btnUseSize: 'हे GPS size वापरा',
  measureIntroTitle: 'GPS ने शेत मोजा',
  measureIntroBody: 'Corner pin — प्रत्येक कोपऱ्यावर add, 3–5 sec. Walk mode — border फिरून Stop.',
  measureIntroNote: 'GPS ±2–5m — exact size साठी tape/patta. Open sky.',
};

const ta: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS வயல் அளவீடு',
  modeWalk: 'நடக்க',
  modeCorner: 'மூலை pin ★',
  helpWalk: 'வயல் எல்லையில் நடந்து start point-க்கு வந்து Stop அழுத்துங்கள்.',
  helpCorner: 'ஒவ்வொரு மூலையிலும் add — 3–5 sec நில்லுங்கள், stable ஆனால் auto save.',
  mapWaiting: 'Map load — GPS fix 2–3 sec…',
  cornerCaptureStart: 'மூலையில் நில்லுங்கள் — GPS (~3–5 sec)',
  walkStartFailed: 'Walk tracking start ஆகவில்லை',
  btnStopWalk: 'Stop — border முடிந்தது',
  btnStartWalk: 'வயல் border நடக்க start',
  btnUseSize: 'இந்த GPS size use செய்ய',
  measureIntroTitle: 'GPS மூலம் வயல் அளவிடுங்கள்',
  measureIntroBody: 'Corner pin — ஒவ்வொரு மூலையிலும் add, 3–5 sec. Walk mode — border நடந்து Stop.',
  measureIntroNote: 'GPS ±2–5m — exact size-க்கு tape/patta. Open sky.',
};

const kn: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS ಹೊಲ ಅಳತೆ',
  modeWalk: 'ನಡೆ',
  modeCorner: 'ಮೂಲೆ pin ★',
  helpWalk: 'ಹೊಲದ border ನಡೆದು start point ಬಳಿ Stop ಒತ್ತಿ.',
  helpCorner: 'ಪ್ರತಿ ಮೂಲೆಯಲ್ಲಿ add — 3–5 sec ನಿಶ್ಚಲ, stable ಆದ ನಂತರ auto save.',
  mapWaiting: 'Map load — GPS fix 2–3 sec…',
  cornerCaptureStart: 'ಮೂಲೆಯಲ್ಲಿ ನಿಲ್ಲಿ — GPS (~3–5 sec)',
  walkStartFailed: 'Walk tracking start ಆಗಲಿಲ್ಲ',
  btnStopWalk: 'Stop — border ಪೂರ್ಣ',
  btnStartWalk: 'ಹೊಲ border ನಡೆಯಲು start',
  btnUseSize: 'ಈ GPS size ಬಳಸಿ',
  measureIntroTitle: 'GPS ನಿಂದ ಹೊಲ ಅಳೆಯಿರಿ',
  measureIntroBody: 'Corner pin — ಪ್ರತಿ ಮೂಲೆಯಲ್ಲಿ add, 3–5 sec. Walk mode — border ನಡೆದು Stop.',
  measureIntroNote: 'GPS ±2–5m — exact size ಗೆ tape/patta. Open sky.',
};

const TABLE: Record<LanguageCode, FieldMeasureMessages> = {
  en,
  te,
  hi,
  mr,
  ta,
  kn,
};

export function getFieldMeasureMessages(language: LanguageCode): FieldMeasureMessages {
  return TABLE[language] ?? en;
}
