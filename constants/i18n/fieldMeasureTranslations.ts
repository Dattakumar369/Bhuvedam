import type { LanguageCode } from '@/constants/languages';

export interface FieldMeasureMessages {
  title: string;
  modeWalk: string;
  modeDraw: string;
  modeCorner: string;
  helpWalk: string;
  helpDraw: string;
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
  gpsGoodWait: (m: number) => string;
  stableAlmost: string;
  cornerReading: (sec: number) => string;
  cornerSample: (i: number, total: number) => string;
  processing: string;
  gpsFixFailed: (m: number) => string;
  spreadUnstable: (m: number) => string;
  accuracyPoor: (m: number) => string;
  validateTooClose: string;
  validateNearFirst: string;
  walkStartFusion: string;
  walkStartPlain: string;
  gpsWeak: (m: number) => string;
  gpsWeakRetry: string;
  walkStartRecorded: string;
  walkJitterIgnore: string;
  walkNearStop: string;
  walkWalking: (dist: number, pts: number) => string;
  walkRecording: (dist: number, pts: number) => string;
  walkProgressMeta: (pts: number, dist: number, acc?: number) => string;
  walkGpsRecordingTitle: string;
  walkGpsRecordingHint: string;
  drawHint: string;
  deletePoint: (n: number) => string;
  applyWeakAvg: (avg: number) => string;
  applyWeakCorner: string;
  gpsCaptureFailed: string;
  locationFailed: string;
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
  mapNativeRequired: string;
  mapHintDraw: string;
  mapHintCorner: string;
  mapHintWalkLive: string;
  mapHintWalkDone: string;
  mapSearchPlaceholder: string;
  mapSearching: string;
  mapKeyMissing: string;
  mapLoadFailed: string;
  mapStreetView: string;
  mapStreetViewHint: string;
  mapRotateHint: string;
  adjustTitle: string;
  adjustHint: string;
  btnWalkAgain: string;
  fieldLocation: (label: string) => string;
  locationLoading: string;
  pathDistanceOsrm: (osrmM: number, walkedM: number) => string;
  pathDistanceWalked: (walkedM: number) => string;
  mapMinimize: string;
  mapExpand: string;
  mapEnlarge: string;
  mapShrink: string;
  mapLiveHint: string;
  mapCenterOnMe: string;
  mapZoomManual: string;
  areaPrimary: (cents: number) => string;
  areaSecondary: (acres: number) => string;
  areaFull: (cents: number, acres: number, badge: string) => string;
  badgeGps: string;
  badgeMap: string;
  badgeTape: string;
  badgePatta: string;
}

const en: FieldMeasureMessages = {
  title: '📍 GPS field measure',
  modeWalk: 'Walk',
  modeDraw: 'Map draw',
  modeCorner: 'GPS pin',
  helpWalk: 'Live path shows on the map — after you finish, drag corners to adjust.',
  helpDraw:
    'Tap field corners on the satellite map to draw the boundary. Drag any corner to adjust. Tap a line midpoint to add a corner.',
  helpCorner: 'Map stays open — after GPS pin, drag the marker to match the satellite view.',
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
  gpsGoodWait: (m) => `GPS good (±${m}m) — a few more seconds…`,
  stableAlmost: 'Stable reading — almost done…',
  cornerReading: (sec) => `Corner reading… ${sec}s`,
  cornerSample: (i, total) => `Corner reading ${i}/${total} — hold phone at the corner marker`,
  processing: 'Calculating stable point…',
  gpsFixFailed: (m) => `GPS not fixed (best ±${m}m). Open sky, hold still 3–5 sec at corner, try again.`,
  spreadUnstable: (m) => `GPS not stable (±${m}m spread). Hold still and try again.`,
  accuracyPoor: (m) => `GPS accuracy poor (±${m}m). Wait in open sky and try again.`,
  validateTooClose: 'Too close to previous corner — walk to next corner and add.',
  validateNearFirst: 'Too close to first corner — same place twice.',
  walkStartFusion: 'Walk field border — phone in hand (GPS + motion smooth ON)',
  walkStartPlain: 'Walk field border — phone in hand, open sky',
  gpsWeak: (m) => `GPS weak (±${m}m) — move to open sky`,
  gpsWeakRetry: 'GPS weak — stand in open sky and start again',
  walkStartRecorded: 'Start recorded — walk around the field',
  walkJitterIgnore: 'Standing still — ignoring GPS jitter, keep walking',
  walkNearStop: 'Near start — tap Stop to see area',
  walkWalking: (dist, pts) => `Walking… ${dist}m (${pts} points)`,
  walkRecording: (dist, pts) => `Recording… ${dist}m walked · ${pts} points`,
  walkProgressMeta: (pts, dist, acc) =>
    `${pts} points · ${dist}m walked${acc != null ? ` · ±${Math.round(acc)}m` : ''}`,
  walkGpsRecordingTitle: 'GPS recording — walk around the field',
  walkGpsRecordingHint: 'Map will show after the walk. Path is recording with GPS now.',
  drawHint: 'Tap corners on the map · drag numbered pins · tap a line to add a mid-corner',
  deletePoint: (n) => `Delete corner ${n}`,
  applyWeakAvg: (avg) =>
    `Corner GPS weak (avg ±${avg}m). Each corner needs ±3m or better — Undo the weak corner and add again.`,
  applyWeakCorner: 'One corner has weak GPS — Undo and add again under open sky.',
  gpsCaptureFailed: 'GPS capture failed',
  locationFailed: 'Could not get GPS location — check that Location is ON',
  accuracyGood: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — good` : `±${acc}m — good`,
  accuracyOk: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — wait in open sky for better` : `±${acc}m`,
  accuracyWeak: (acc) => `±${acc}m — weak signal`,
  accuracyUnknown: 'accuracy unknown',
  measureIntroTitle: 'Measure field with GPS',
  measureIntroBody:
    'Map draw — search your village, then tap the field boundary. Drag pins to match the shape. Tap a line midpoint to add a corner.',
  measureIntroNote: 'GPS ±2–5m error — use tape/patta for exact size. Open sky required.',
  mapTitle: 'Satellite map — path you walked',
  mapLegendStart: 'Start point',
  mapLegendEnd: 'Stop point',
  mapLegendArea: 'Green = covered land area',
  mapLiveMarker: 'You are here (live GPS)',
  mapFallback: 'Map not showing — GPS area measure still works below.',
  mapNativeRequired: 'Map not available now — your GPS points and area are shown below.',
  mapHintDraw: 'Map tap = add corner · tap line = mid corner · drag pin = adjust',
  mapHintCorner: 'GPS pin, then drag the marker to adjust',
  mapHintWalkLive: 'Walking the border — live path shows on the map',
  mapHintWalkDone: 'After walking, drag corners to adjust',
  mapSearchPlaceholder: 'Search village / road / mandal — move map near your field',
  mapSearching: 'Searching…',
  mapKeyMissing: 'Google Maps key missing — a new APK is needed for satellite map + adjust.',
  mapLoadFailed: 'Map failed to load — try GPS walk or corner modes.',
  mapStreetView: '360° view',
  mapStreetViewHint: 'Opens Google Street View near the map center (roads / nearby only)',
  mapRotateHint: 'Twist with two fingers to rotate the map 360°',
  adjustTitle: 'Adjust path',
  adjustHint: 'Undo wrong points or walk again if the border looks wrong on the map.',
  btnWalkAgain: 'Walk again',
  fieldLocation: (label) => `Near: ${label}`,
  locationLoading: 'Finding your village…',
  pathDistanceOsrm: (routeM, walkedM) => `Border path: ${routeM}m · walked ${walkedM}m`,
  pathDistanceWalked: (walkedM) => `Walked ${walkedM}m`,
  mapMinimize: 'Minimize map',
  mapExpand: 'Show map',
  mapEnlarge: 'Bigger map',
  mapShrink: 'Smaller map',
  mapLiveHint: 'Map follows you as you walk — like phone navigation',
  mapCenterOnMe: 'Go to my location',
  mapZoomManual: 'You moved the map — tap the GPS icon to follow you again',
  areaPrimary: (cents) => `${cents} cents`,
  areaSecondary: (acres) => `${acres} acres`,
  areaFull: (cents, acres, badge) =>
    `${cents} cents (${acres} acres)${badge ? ` · ${badge}` : ''}`,
  badgeGps: 'GPS estimate',
  badgeMap: 'Map draw',
  badgeTape: 'Exact — tape measure',
  badgePatta: 'Exact — patta',
};

const te: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS polam measure',
  modeWalk: 'Tiragandi',
  modeDraw: 'Map draw',
  modeCorner: 'GPS pin',
  helpWalk: 'Map lo live path kanipistundi — aipoyaka moolalu drag chesi adjust cheyochu.',
  helpDraw:
    'Satellite map lo polam moolalu tap chesi boundary giyandi — prati moola drag chesi exact ga adjust cheyochu. Line madhya tap cheste akkada kuda moola add avutundi.',
  helpCorner: 'Map open lo undi — GPS pin chesaka marker drag chesi satellite prakaram adjust cheyandi.',
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
  hintLoopGap: (m) =>
    `Start point daggaraki ${m}m undi — polam chuttu complete cheyandi, lekapothe area tappu vastundi`,
  btnStopWalk: 'Stop — polam chuttu aipoyindi',
  btnStartWalk: 'Polam chuttu tiragadam start',
  btnAddCorner: (n) => `Moolam ${n} add`,
  btnAddCornerLoading: 'GPS reading...',
  btnUseSize: 'Use GPS size / Ee size use cheyandi',
  qualityGood: '±1–2m bagundi ✓',
  qualityOk: '±2–3m ok',
  qualityPoor: 'weak — malli try',
  permissionDenied: 'Location permission ivvaledi — Settings lo Allow cheyandi',
  gpsOff: 'Phone lo Location/GPS OFF undi — Settings lo ON cheyandi',
  cornerWarmFast: 'Moola lo nilchondi — GPS reading (~2–3 sec)',
  cornerWarm: 'Moola lo nilchondi, phone shake cheyakandi — GPS reading',
  gpsFix: (sec) => `GPS fix avutundi… ${sec}s — moola daggarame nilchondi`,
  gpsGoodWait: (m) => `GPS bagundi (±${m}m) — inka konni sec…`,
  stableAlmost: 'Stable reading — almost done…',
  cornerReading: (sec) => `Moola reading… ${sec}s`,
  cornerSample: (i, total) => `Moola reading ${i}/${total} — phone ni moola marker pai pettandi`,
  processing: 'Stable GPS point calculate avutundi…',
  gpsFixFailed: (m) =>
    `GPS sariga fix avvaledu (best ±${m}m). Open sky lo nilchondi — ±3m kante baga ravali, lekapothe area tappu vastundi.`,
  spreadUnstable: (m) =>
    `GPS readings stable kaavu (±${m}m spread). Moola lo 15 sec nilchondi, malli try cheyandi.`,
  accuracyPoor: (m) => `GPS accuracy chaala taggindi (±${m}m). Open sky lo wait chesi malli add cheyandi.`,
  validateTooClose: 'I moola previous moola ki chaala daggaraga undi. Next moola ki walk chesi add cheyandi.',
  validateNearFirst: 'First moola ki daggaraga undi — okate place lo add avutundi.',
  walkStartFusion: 'Polam border chuttu tiragandi — phone chethulo pettandi (GPS + motion smooth ON)',
  walkStartPlain: 'Polam border chuttu tiragandi — phone chethulo pettandi, open sky chudali',
  gpsWeak: (m) => `GPS weak (±${m}m) — open sky daggaraki vellandi`,
  gpsWeakRetry: 'GPS weak — open sky lo nilchoni malli start cheyandi',
  walkStartRecorded: 'Start point record ayyindi — ippudu polam chuttu tiragandi',
  walkJitterIgnore: 'Nilchunnapudu GPS jitter ignore — tiragadam continue cheyandi',
  walkNearStop: 'Start point daggaraki vacharu — Stop nokki area kanipistundi',
  walkWalking: (dist, pts) => `Tirugutunnaru… ${dist}m (${pts} points)`,
  walkRecording: (dist, pts) => `Recording… ${dist}m tirigaru · ${pts} points`,
  walkProgressMeta: (pts, dist, acc) =>
    `${pts} points · ${dist}m tirigaru${acc != null ? ` · ±${Math.round(acc)}m` : ''}`,
  walkGpsRecordingTitle: 'GPS recording — polam chuttu tiragandi',
  walkGpsRecordingHint: 'Map walk aipoyaka chupistundi. Ippudu GPS tho path record avutundi.',
  drawHint: 'Map lo moolalu tap · numbered pin drag · line meeda tap = extra moola',
  deletePoint: (n) => `Moola ${n} delete`,
  applyWeakAvg: (avg) =>
    `Moolala GPS weak (avg ±${avg}m). Prati moola ±3m lopala ravali — weak moola Undo chesi malli add cheyandi.`,
  applyWeakCorner: 'Oka moola GPS weak undi — Undo chesi open sky lo malli add cheyandi.',
  gpsCaptureFailed: 'GPS capture failed',
  locationFailed: 'GPS location raaledu — Location ON unda chudandi',
  accuracyGood: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — bagundi` : `±${acc}m — bagundi`,
  accuracyOk: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — open sky lo inka wait cheste better` : `±${acc}m`,
  accuracyWeak: (acc) => `±${acc}m — weak signal`,
  measureIntroTitle: 'GPS tho polam kolavandi',
  measureIntroBody:
    'Map draw — village search chesi polam boundary giyandi. Prati moola tap chesi, pin drag chesi exact shape cover cheyandi. Line madhya tap cheste extra moola add avutundi.',
  measureIntroNote: 'GPS ±2–5m error — exact size ki patta/tape measure use cheyandi. Open sky must.',
  mapFallback: 'Map load avvaledu — GPS tho area measure avutundi.',
  mapNativeRequired: 'Map ippudu kanipinchadu — GPS points tho area kindha chupistundi.',
  mapHintDraw: 'Map tap = moola add · line meeda tap = madhya moola · pin drag = adjust',
  mapHintCorner: 'GPS pin chesi marker drag chesi adjust cheyandi',
  mapHintWalkLive: 'Polam chuttu tirugutunnaru — map lo live path kanipistundi',
  mapHintWalkDone: 'Walk aipoyaka moolalu drag chesi adjust cheyochu',
  mapSearchPlaceholder: 'Village / road / mandal search — polam daggaraki map vellandi',
  mapSearching: 'Searching…',
  mapKeyMissing: 'Google Maps key ledu — satellite map + adjust ki new APK avasaram.',
  mapLoadFailed: 'Map load avvaledu — GPS modes try cheyandi.',
  mapStreetView: '360° view',
  mapStreetViewHint: 'Map center daggar Street View open avutundi (roads / nearby only)',
  mapRotateHint: 'Rendu fingers tho map ni 360° rotate cheyandi',
  mapTitle: 'Satellite map — mee polam chuttu tirigina path',
  mapLegendStart: 'Modalupettadam (start)',
  mapLegendEnd: 'Aapadam (stop)',
  mapLegendArea: 'Green = cover chesina bhumi',
  mapLiveMarker: 'Ippudu ikkada (live GPS)',
  adjustTitle: 'Path adjust cheyandi',
  adjustHint: 'Map lo border sariga lekapothe last point undo cheyandi leda malli tiragandi.',
  btnWalkAgain: 'Malli tiragandi',
  fieldLocation: (label) => `Ikkada daggar: ${label}`,
  locationLoading: 'Gramam vetukutunnam…',
  pathDistanceOsrm: (routeM, walkedM) => `Polam chuttu: ${routeM}m · tirigi ${walkedM}m`,
  pathDistanceWalked: (walkedM) => `Tirigi ${walkedM}m`,
  mapMinimize: 'Map peddaga undakunda',
  mapExpand: 'Map chupinchu',
  mapEnlarge: 'Map peddaga',
  mapShrink: 'Map chinna ga',
  mapLiveHint: 'Nadustunte map mee direction tho follow avutundi — phone navigation laga',
  mapCenterOnMe: 'Na location ki velu',
  mapZoomManual: 'Map move chesaru — malli follow avvali ante GPS icon nokki',
  areaPrimary: (cents) => `${cents} cents / ${cents} సెంట్లు`,
  areaSecondary: (acres) => `${acres} acres / ${acres} ఎకరాలు`,
  areaFull: (cents, acres, badge) =>
    `${cents} cents (${acres} acres / ${acres} ఎకరాలు)${badge ? ` · ${badge}` : ''}`,
  badgeGps: 'GPS estimate / సుమారు',
  badgeMap: 'Map draw / మ్యాప్ లో గీసి',
  badgeTape: 'Exact — tape measure / లేఖీ exact',
  badgePatta: 'Exact — patta / పట్టా exact',
};

const hi: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS खेत माप',
  modeWalk: 'चलें',
  modeDraw: 'Map draw',
  modeCorner: 'GPS pin',
  helpWalk: 'मैप पर live path दिखेगा — खत्म होने के बाद कोने drag करके adjust करें।',
  helpDraw:
    'Satellite मैप पर खेत के कोने tap करके सीमा बनाएं। हर कोना drag करके सही करें। लाइन के बीच tap करें तो नया कोना जुड़ता है।',
  helpCorner: 'मैप खुला रहता है — GPS pin के बाद marker drag करके satellite से मिलाएं।',
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
  gpsGoodWait: (m) => `GPS अच्छा (±${m}m) — कुछ और सेकंड…`,
  stableAlmost: 'Stable reading — लगभग हो गया…',
  cornerReading: (sec) => `कोना reading… ${sec}s`,
  cornerSample: (i, total) => `कोना reading ${i}/${total} — फोन कोने के marker पर रखें`,
  processing: 'Stable point calculate…',
  gpsFixFailed: (m) => `GPS fix नहीं (best ±${m}m). Open sky में 3–5 sec रुकें, फिर try।`,
  spreadUnstable: (m) => `GPS stable नहीं (±${m}m spread). स्थिर रहकर फिर try।`,
  accuracyPoor: (m) => `GPS accuracy कम (±${m}m). Open sky में wait करें।`,
  validateTooClose: 'पिछले कोने के बहुत पास — अगले कोने पर walk करके add करें।',
  validateNearFirst: 'पहले कोने के पास — same जगह दो बार।',
  walkStartFusion: 'खेत border चलें — phone हाथ में (GPS + motion ON)',
  walkStartPlain: 'खेत border चलें — phone हाथ में, open sky',
  gpsWeak: (m) => `GPS weak (±${m}m) — open sky की ओर जाएं`,
  gpsWeakRetry: 'GPS weak — open sky में खड़े होकर फिर start करें',
  walkStartRecorded: 'Start record — अब border चलें',
  walkJitterIgnore: 'खड़े हैं — GPS jitter ignore, चलते रहें',
  walkNearStop: 'Start के पास — Stop दबाकर area देखें',
  walkWalking: (dist, pts) => `चल रहे… ${dist}m (${pts} points)`,
  walkRecording: (dist, pts) => `Recording… ${dist}m · ${pts} points`,
  walkProgressMeta: (pts, dist, acc) =>
    `${pts} points · ${dist}m${acc != null ? ` · ±${Math.round(acc)}m` : ''}`,
  walkGpsRecordingTitle: 'GPS recording — खेत के चारों ओर चलें',
  walkGpsRecordingHint: 'Walk खत्म होने पर मैप दिखेगा। अभी GPS से path record हो रहा है।',
  drawHint: 'मैप पर कोने tap · pin drag · लाइन पर tap = नया कोना',
  deletePoint: (n) => `कोना ${n} delete`,
  applyWeakAvg: (avg) =>
    `कोनों का GPS कमजोर (avg ±${avg}m)। हर कोना ±3m या बेहतर चाहिए — कमजोर कोना Undo करके फिर add करें।`,
  applyWeakCorner: 'एक कोने का GPS कमजोर है — Undo करके open sky में फिर add करें।',
  gpsCaptureFailed: 'GPS capture असफल',
  locationFailed: 'GPS location नहीं मिला — Location ON है या नहीं देखें',
  accuracyGood: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — अच्छा` : `±${acc}m — अच्छा`,
  accuracyOk: (acc, spread) =>
    spread != null ? `±${acc}m (spread ${spread}m) — open sky में wait करें` : `±${acc}m`,
  accuracyWeak: (acc) => `±${acc}m — weak signal`,
  accuracyUnknown: 'accuracy unknown',
  measureIntroTitle: 'GPS से खेत मापें',
  measureIntroBody:
    'Map draw — गांव खोजें, फिर खेत की सीमा tap करें। Pin drag करके shape मिलाएं। लाइन के बीच tap करें तो नया कोना जुड़ता है।',
  measureIntroNote: 'GPS ±2–5m error — exact size के लिए tape/patta use करें। Open sky जरूरी।',
  mapTitle: 'Satellite map — आपका चला हुआ path',
  mapLegendStart: 'शुरुआती point',
  mapLegendEnd: 'Stop point',
  mapLegendArea: 'Green = cover की हुई ज़मीन',
  mapLiveMarker: 'अभी यहाँ (live GPS)',
  mapHintDraw: 'Map tap = कोना add · लाइन tap = मध्य कोना · pin drag = adjust',
  mapHintCorner: 'GPS pin के बाद marker drag करके adjust करें',
  mapHintWalkLive: 'Border चल रहे हैं — मैप पर live path',
  mapHintWalkDone: 'Walk के बाद कोने drag करके adjust करें',
  mapSearchPlaceholder: 'गाँव / सड़क / मंडल खोजें — खेत के पास मैप ले जाएँ',
  mapSearching: 'खोज रहे…',
  mapKeyMissing: 'Google Maps key नहीं — satellite map के लिए नया APK चाहिए।',
  mapLoadFailed: 'मैप लोड नहीं हुआ — GPS walk या corner mode try करें।',
  mapStreetView: '360° view',
  mapStreetViewHint: 'मैप केंद्र के पास Google Street View खोलता है (सड़क / आसपास)',
  mapRotateHint: 'दो उंगलियों से मैप को 360° घुमाएं',
  adjustTitle: 'Path adjust करें',
  adjustHint: 'मैप पर border गलत हो तो undo करें या दोबारा चलें।',
  btnWalkAgain: 'दोबारा चलें',
  areaPrimary: (cents) => `${cents} cents`,
  areaSecondary: (acres) => `${acres} acres`,
  areaFull: (cents, acres, badge) =>
    `${cents} cents (${acres} acres)${badge ? ` · ${badge}` : ''}`,
  badgeGps: 'GPS अनुमान',
  badgeMap: 'Map draw',
  badgeTape: 'Exact — tape measure',
  badgePatta: 'Exact — patta',
};

const mr: FieldMeasureMessages = {
  ...hi,
  title: '📍 GPS शेत मोजमाप',
  modeWalk: 'फिरा',
  modeDraw: 'Map draw',
  modeCorner: 'GPS pin',
  helpWalk: 'शेताच्या border फिरा आणि start point जवळ Stop दाबा. Phone स्थिर ठेवा.',
  helpDraw: 'Satellite map वर शेताचे कोपरे tap करून सीमा काढा. Pin drag करून adjust करा.',
  helpCorner: 'प्रत्येक कोपऱ्यावर add — 3–5 sec स्थिर राहा, stable झाल्यावर auto save.',
  cornerCaptureStart: 'कोपऱ्यावर उभे राहा — GPS reading (~3–5 sec)',
  btnStopWalk: 'Stop — border पूर्ण',
  btnStartWalk: 'शेत border फिरणे सुरू',
  btnUseSize: 'हे GPS size वापरा',
  measureIntroTitle: 'GPS ने शेत मोजा',
  measureIntroBody: 'Map draw — गाव शोधा, नंतर शेताची सीमा tap करा. Walk mode — border फिरून Stop.',
  measureIntroNote: 'GPS ±2–5m — exact size साठी tape/patta. Open sky.',
};

const ta: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS வயல் அளவீடு',
  modeWalk: 'நடக்க',
  modeDraw: 'Map draw',
  modeCorner: 'GPS pin',
  helpWalk: 'வயல் எல்லையில் நடந்து start point-க்கு வந்து Stop அழுத்துங்கள்.',
  helpDraw: 'Satellite map-ல் வயல் மூலைகளை tap செய்து எல்லை வரையுங்கள். Pin drag செய்து சரிசெய்யுங்கள்.',
  helpCorner: 'ஒவ்வொரு மூலையிலும் add — 3–5 sec நில்லுங்கள், stable ஆனால் auto save.',
  mapWaiting: 'Map load — GPS fix 2–3 sec…',
  cornerCaptureStart: 'மூலையில் நில்லுங்கள் — GPS (~3–5 sec)',
  walkStartFailed: 'Walk tracking start ஆகவில்லை',
  btnStopWalk: 'Stop — border முடிந்தது',
  btnStartWalk: 'வயல் border நடக்க start',
  btnUseSize: 'இந்த GPS size use செய்ய',
  measureIntroTitle: 'GPS மூலம் வயல் அளவிடுங்கள்',
  measureIntroBody: 'Map draw — கிராமம் தேடி வயல் எல்லை tap செய்யுங்கள். Walk mode — border நடந்து Stop.',
  measureIntroNote: 'GPS ±2–5m — exact size-க்கு tape/patta. Open sky.',
};

const kn: FieldMeasureMessages = {
  ...en,
  title: '📍 GPS ಹೊಲ ಅಳತೆ',
  modeWalk: 'ನಡೆ',
  modeDraw: 'Map draw',
  modeCorner: 'GPS pin',
  helpWalk: 'ಹೊಲದ border ನಡೆದು start point ಬಳಿ Stop ಒತ್ತಿ.',
  helpDraw: 'Satellite map ನಲ್ಲಿ ಹೊಲದ ಮೂಲೆಗಳನ್ನು tap ಮಾಡಿ. Pin drag ಮಾಡಿ adjust ಮಾಡಿ.',
  helpCorner: 'ಪ್ರತಿ ಮೂಲೆಯಲ್ಲಿ add — 3–5 sec ನಿಶ್ಚಲ, stable ಆದ ನಂತರ auto save.',
  mapWaiting: 'Map load — GPS fix 2–3 sec…',
  cornerCaptureStart: 'ಮೂಲೆಯಲ್ಲಿ ನಿಲ್ಲಿ — GPS (~3–5 sec)',
  walkStartFailed: 'Walk tracking start ಆಗಲಿಲ್ಲ',
  btnStopWalk: 'Stop — border ಪೂರ್ಣ',
  btnStartWalk: 'ಹೊಲ border ನಡೆಯಲು start',
  btnUseSize: 'ಈ GPS size ಬಳಸಿ',
  measureIntroTitle: 'GPS ನಿಂದ ಹೊಲ ಅಳೆಯಿರಿ',
  measureIntroBody: 'Map draw — ಹಳ್ಳಿ ಹುಡುಕಿ, ಹೊಲದ ಗಡಿ tap ಮಾಡಿ. Walk mode — border ನಡೆದು Stop.',
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
