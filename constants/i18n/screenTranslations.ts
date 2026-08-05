import type { LanguageCode } from '@/constants/languages';

export interface ScreenTranslations {
  weather: string;
  humidity: string;
  windSpeed: string;
  pressure: string;
  visibility: string;
  uvIndex: string;
  rainChance: string;
  forecast7Day: string;
  hourlyForecast: string;
  mandiRates: string;
  measureFieldTitle: string;
  measureFieldIntro: string;
  allCrops: string;
  catalogBanner: string;
  tryAgain: string;
  measureLastGps: string;
  measureSaved: string;
  mandiSearchPlaceholder: string;
  mandiSubtitle: string;
  mandiDataLabel: string;
  mandiUpdated: string;
  mandiSelectCrop: string;
  mandiSelectVariety: string;
  mandiAllVarietiesToday: (crop: string, count: number) => string;
  mandiSourceLive: (count: number) => string;
  mandiSourceCached: string;
  mandiSourceReference: string;
  mandiFooterNote: string;
  mandiHistoryTitle: string;
  mandiHistoryToday: string;
  mandiHistoryYesterday: string;
  mandiHistoryLastMonth: string;
  mandiHistoryLastYear: string;
  mandiHistoryMissing: string;
  mandiHistoryNote: string;
  cropProtTitle: string;
  cropProtSubtitle: string;
  cropProtSelectCrop: string;
  cropProtSelectVariety: string;
  cropProtVarietySearch: string;
  cropProtByStage: string;
  cropProtByDisease: string;
  cropProtStage: string;
  cropProtDiseaseSearch: string;
  cropProtSymptoms: string;
  cropProtFertilizers: string;
  cropProtSprays: string;
  cropProtNoDisease: string;
  cropProtNoSpray: string;
  cropProtDisclaimer: string;
  statFertilizers: string;
  statPesticides: string;
  statFungicides: string;
  statDiseases: string;
  statCrops: string;
  pathakaluTitle: string;
  pathakaluIntroTitle: string;
  pathakaluIntroBody: string;
  pathakaluUpdated: (date: string, count: number) => string;
  pathakaluSearch: string;
  pathakaluCategory: string;
  pathakaluRegion: string;
  pathakaluResultCount: (n: number) => string;
  pathakaluEmpty: string;
  pathakaluDisclaimer: string;
  aboutTitle: string;
  aboutPara1: string;
  aboutPara2: string;
  aboutMissionLabel: string;
  aboutMissionText: string;
  versionLabel: string;
}

const en: ScreenTranslations = {
  weather: 'Weather',
  humidity: 'Humidity',
  windSpeed: 'Wind Speed',
  pressure: 'Pressure',
  visibility: 'Visibility',
  uvIndex: 'UV Index',
  rainChance: 'Rain Chance',
  forecast7Day: '7-Day Forecast',
  hourlyForecast: 'Hourly Forecast',
  mandiRates: 'Mandi Rates',
  measureFieldTitle: 'Field Measure',
  measureFieldIntro: 'Measure your field with GPS',
  allCrops: 'All crops',
  catalogBanner: 'CIB&RC reference — verify dose on dealer pack label.',
  tryAgain: 'Try Again',
  measureLastGps: 'Last GPS measurement',
  measureSaved: '✓ Saved',
  mandiSearchPlaceholder: 'Variety search — Masoori, 1010, BPT, hybrid...',
  mandiSubtitle:
    'Each crop has 100+ varieties — we fetch all live from Agmarknet. One rate per variety.',
  mandiDataLabel: 'Mandi data',
  mandiUpdated: 'Updated',
  mandiSelectCrop: 'Select crop',
  mandiSelectVariety: 'Variety — select',
  mandiAllVarietiesToday: (crop, count) => `All ${crop} varieties today (${count})`,
  mandiSourceLive: (count) => `Live Agmarknet · ${count} varieties`,
  mandiSourceCached: 'Cached',
  mandiSourceReference: 'Reference avg — pull to refresh for live',
  mandiFooterNote:
    'Curated varieties (Full guide) = complete fertilizer & spray data. Other varieties = live Agmarknet rates + general crop advice. Data refreshes from government mandi records daily.',
  mandiHistoryTitle: 'Rate history (stored daily)',
  mandiHistoryToday: 'Today',
  mandiHistoryYesterday: 'Yesterday',
  mandiHistoryLastMonth: 'Last 30 days avg',
  mandiHistoryLastYear: 'Last year avg',
  mandiHistoryMissing: '—',
  mandiHistoryNote:
    'Rates are saved each sync day. Last month/year averages appear after enough daily records are stored.',
  cropProtTitle: 'Fertilizer & Spray Guide',
  cropProtSubtitle:
    'Each crop has 100+ varieties. Curated varieties get full guide; others get general advice + live mandi rates. Spray & fertilizer by crop age or disease.',
  cropProtSelectCrop: 'Select crop',
  cropProtSelectVariety: 'Variety — search & select',
  cropProtVarietySearch: 'Variety search — Masoori, 1010, BPT...',
  cropProtByStage: 'By crop age',
  cropProtByDisease: 'By disease',
  cropProtStage: 'Crop stage',
  cropProtDiseaseSearch: 'Disease search — blast, bollworm, whitefly...',
  cropProtSymptoms: 'Symptoms',
  cropProtFertilizers: 'Fertilizers',
  cropProtSprays: 'Spray advisory',
  cropProtNoDisease: 'No disease data for this crop yet.',
  cropProtNoSpray: 'No spray advice for this selection. Try another stage or ask AI chat.',
  cropProtDisclaimer:
    'Always follow product label & local agriculture officer advice. Prices are approximate market ranges. PHI = days before harvest when spray is not allowed.',
  statFertilizers: 'Fertilizers',
  statPesticides: 'Pesticides',
  statFungicides: 'Fungicides',
  statDiseases: 'Diseases',
  statCrops: 'Crops',
  pathakaluTitle: 'Government Schemes',
  pathakaluIntroTitle: 'Subsidy, Loans & Insurance',
  pathakaluIntroBody:
    'PM-KISAN, KCC, crop insurance, Rythu Bharosa, Annadata Sukhibhava — latest government schemes here. No need to add or update yourself.',
  pathakaluUpdated: (date, count) => `Last updated: ${date} · ${count} schemes`,
  pathakaluSearch: 'Search — PM-KISAN, KCC, insurance...',
  pathakaluCategory: 'Category',
  pathakaluRegion: 'State',
  pathakaluResultCount: (n) => `${n} schemes found`,
  pathakaluEmpty: 'Try a different search or filter',
  pathakaluDisclaimer:
    'Information only — verify exact eligibility & amounts on official government portals. Schemes are updated regularly.',
  aboutTitle: 'About',
  aboutPara1:
    'Bhuvedam is an AI-powered agriculture assistant designed to help farmers make smarter decisions. We combine weather intelligence, crop expertise, and conversational AI to deliver actionable insights right at your fingertips.',
  aboutPara2:
    'Our mission is to empower every farmer with technology that was once available only to large agribusinesses — making precision farming accessible, affordable, and easy to use.',
  aboutMissionLabel: 'OUR MISSION',
  aboutMissionText:
    'To democratize agricultural intelligence and help farmers increase yield, reduce waste, and build sustainable farming practices for future generations.',
  versionLabel: 'Version',
};

const te: ScreenTranslations = {
  ...en,
  weather: 'వాతావరణం',
  humidity: 'తేమ',
  windSpeed: 'గాలి వేగం',
  pressure: 'పీడనం',
  visibility: 'దృశ్యత',
  uvIndex: 'UV సూచిక',
  rainChance: 'వర్షం అవకాశం',
  forecast7Day: '7-రోజుల సూచన',
  hourlyForecast: 'గంటవారీ సూచన',
  mandiRates: 'మండి ధరలు',
  measureFieldTitle: 'పొలం కొలత',
  measureFieldIntro: 'GPS tho polam kolavandi',
  allCrops: 'అన్ని పంటలు',
  catalogBanner: 'CIB&RC reference — dealer pack label verify cheyandi.',
  tryAgain: 'మళ్లీ ప్రయత్నించండి',
  measureLastGps: 'Last GPS measurement',
  measureSaved: '✓ Saved',
  mandiSearchPlaceholder: 'Variety search — Masoori, 1010, BPT, hybrid...',
  mandiSubtitle:
    'Prati panta ki 100+ varieties untayi — Agmarknet nunchi live ga anni varieties fetch chestam. Okko rakam ki okko rate.',
  mandiDataLabel: 'Mandi data',
  mandiUpdated: 'Updated',
  mandiSelectCrop: 'Select crop / Panta',
  mandiSelectVariety: 'Variety / Rakam — select',
  mandiAllVarietiesToday: (crop, count) => `All ${crop} varieties today (${count})`,
  mandiSourceLive: (count) => `Live Agmarknet · ${count} varieties`,
  mandiSourceCached: 'Cached',
  mandiSourceReference: 'Reference avg — pull to refresh for live',
  mandiFooterNote:
    'Curated varieties (Full guide) = complete fertilizer & spray data. Other varieties = live Agmarknet rates + general crop advice. Data refreshes from government mandi records daily.',
  mandiHistoryTitle: 'Dhara charitra (roju roju save avutundi)',
  mandiHistoryToday: 'Iroju',
  mandiHistoryYesterday: 'Ninna',
  mandiHistoryLastMonth: '30 rojula avg',
  mandiHistoryLastYear: 'Last year avg',
  mandiHistoryMissing: '—',
  mandiHistoryNote:
    'Prati sync roju mandi rates save avutayi. Month/year avg ki konni rojulu data undali.',
  cropProtTitle: 'Fertilizer & Spray Guide',
  cropProtSubtitle:
    'Prati panta ki 100+ rakalu untayi. Curated varieties ki full guide; migata varieties ki general crop advice + live mandi rates. Panta vayasu leda rogam batti spray & eruvu cheppistam.',
  cropProtSelectCrop: 'Select crop / Panta',
  cropProtSelectVariety: 'Variety / Rakam — search & select',
  cropProtVarietySearch: 'Variety search — Masoori, 1010, BPT...',
  cropProtByStage: 'By crop age / Vayasu',
  cropProtByDisease: 'By disease / Rogam',
  cropProtStage: 'Crop stage / Panta dasa',
  cropProtDiseaseSearch: 'Rogam search — blast, bollworm, whitefly...',
  cropProtSymptoms: 'Symptoms / Lakshanaalu',
  cropProtFertilizers: 'Fertilizers / Eruvulu',
  cropProtSprays: 'Spray advisory / Mandu pichikari',
  cropProtNoDisease: 'No disease data for this crop yet.',
  cropProtNoSpray: 'No spray advice for this selection. Try another stage or ask AI chat.',
  cropProtDisclaimer:
    'Always follow product label & local agriculture officer advice. Prices are approximate market ranges. PHI = days before harvest when spray is not allowed.',
  pathakaluTitle: 'ప్రభుత్వ Pathakalu',
  pathakaluIntroTitle: 'Subsidy, Loans & Insurance',
  pathakaluIntroBody:
    'PM-KISAN, KCC, crop insurance, Rythu Bharosa, Annadata Sukhibhava — latest government pathakalu ikkada chudandi. Meeru add/update cheyalsina avasaram ledu.',
  pathakaluUpdated: (date, count) => `Last updated: ${date} · ${count} schemes`,
  pathakaluSearch: 'Search — PM-KISAN, KCC, insurance...',
  pathakaluCategory: 'రకం',
  pathakaluRegion: 'రాష్ట్రం',
  pathakaluResultCount: (n) => `${n} pathakalu kanipistunnayi`,
  pathakaluEmpty: 'Search or filter marchi try cheyandi',
  pathakaluDisclaimer:
    'Information only — exact eligibility & amounts official government portals lo verify cheyandi. Schemes update avuthu untayi.',
  aboutTitle: 'గురించి',
  aboutPara1:
    'Bhuvedam oka AI-powered agriculture assistant — farmers ki smart decisions teesukovadaniki. Weather, crop expertise, conversational AI kalipi actionable insights istam.',
  aboutPara2:
    'Pedda agribusinesses ki matrame available aina technology ippudu prati raitu ki — precision farming accessible, affordable, easy ga.',
  aboutMissionLabel: 'MAA DHEYAM',
  aboutMissionText:
    'Agricultural intelligence democratize cheyadam — yield penchadam, waste taggadam, sustainable farming future generations kosam.',
  versionLabel: 'Version',
};

const hi: ScreenTranslations = {
  ...en,
  weather: 'मौसम',
  humidity: 'नमी',
  windSpeed: 'हवा की गति',
  pressure: 'दबाव',
  visibility: 'दृश्यता',
  uvIndex: 'UV सूचकांक',
  rainChance: 'बारिश की संभावना',
  forecast7Day: '7-दिन का पूर्वानुमान',
  hourlyForecast: 'प्रति घंटा पूर्वानुमान',
  mandiRates: 'मंडी भाव',
  measureFieldTitle: 'खेत माप',
  measureFieldIntro: 'GPS से खेत मापें',
  allCrops: 'सभी फसलें',
  catalogBanner: 'CIB&RC संदर्भ — डीलर पैक लेबल जांचें।',
  tryAgain: 'फिर कोशिश करें',
  measureLastGps: 'पिछला GPS माप',
  measureSaved: '✓ सहेजा गया',
  mandiSearchPlaceholder: 'Variety खोजें — Masoori, 1010, BPT...',
  mandiSubtitle:
    'हर फसल में 100+ varieties — Agmarknet से live सभी rates। हर variety का अलग भाव।',
  mandiDataLabel: 'मंडी डेटा',
  mandiUpdated: 'अपडेट',
  mandiSelectCrop: 'फसल चुनें',
  mandiSelectVariety: 'Variety — चुनें',
  mandiAllVarietiesToday: (crop, count) => `आज सभी ${crop} varieties (${count})`,
  mandiSourceLive: (count) => `Live Agmarknet · ${count} varieties`,
  mandiSourceCached: 'Cached',
  mandiSourceReference: 'Reference avg — live के लिए refresh करें',
  mandiFooterNote:
    'Curated varieties = पूरा fertilizer & spray guide। बाकी = live mandi rates + general advice। Government mandi records से daily update।',
  cropProtTitle: 'उर्वरक और स्प्रे गाइड',
  cropProtSubtitle:
    'हर फसल में 100+ varieties। Curated = full guide; बाकी = general advice + live mandi। फसल उम्र या रोग के अनुसार spray & fertilizer।',
  cropProtSelectCrop: 'फसल चुनें',
  cropProtSelectVariety: 'Variety — खोजें और चुनें',
  cropProtVarietySearch: 'Variety खोजें — Masoori, 1010, BPT...',
  cropProtByStage: 'फसल उम्र के अनुसार',
  cropProtByDisease: 'रोग के अनुसार',
  cropProtStage: 'फसल अवस्था',
  cropProtDiseaseSearch: 'रोग खोजें — blast, bollworm, whitefly...',
  cropProtSymptoms: 'लक्षण',
  cropProtFertilizers: 'उर्वरक',
  cropProtSprays: 'स्प्रे सलाह',
  cropProtNoDisease: 'इस फसल के लिए अभी रोग डेटा नहीं।',
  cropProtNoSpray: 'इस चयन के लिए spray सलाह नहीं। दूसरी stage try करें या AI से पूछें।',
  cropProtDisclaimer:
    'Product label और local agriculture officer की सलाह follow करें। कीमतें approximate हैं। PHI = कटाई से पहले spray न करने के दिन।',
  pathakaluTitle: 'सरकारी योजनाएं',
  pathakaluIntroTitle: 'Subsidy, Loans & Insurance',
  pathakaluIntroBody:
    'PM-KISAN, KCC, crop insurance, Rythu Bharosa — latest government yojanayein yahan। Khud add/update karne ki zaroorat nahi।',
  pathakaluUpdated: (date, count) => `Last updated: ${date} · ${count} yojanayein`,
  pathakaluSearch: 'Search — PM-KISAN, KCC, insurance...',
  pathakaluCategory: 'श्रेणी',
  pathakaluRegion: 'राज्य',
  pathakaluResultCount: (n) => `${n} yojanayein mili`,
  pathakaluEmpty: 'Search ya filter badal kar try karein',
  pathakaluDisclaimer:
    'Sirf jankari — exact eligibility official portals par verify karein। Yojanayein update hoti rehti hain।',
  aboutTitle: 'के बारे में',
  aboutPara1:
    'Bhuvedam ek AI-powered krishi sahayak hai — kisanon ko smart faisle lene mein madad karta hai। Weather, fasal expertise aur AI se actionable insights deta hai।',
  aboutPara2:
    'Bade agribusinesses tak simit technology ab har kisan ke liye — precision farming accessible, affordable aur aasaan।',
  aboutMissionLabel: 'HAMARA MISSION',
  aboutMissionText:
    'Krishi intelligence sabke liye — upaj badhana, waste kam karna, sustainable farming future generations ke liye।',
  versionLabel: 'Version',
};

const mr: ScreenTranslations = {
  ...hi,
  weather: 'हवामान',
  humidity: 'आर्द्रता',
  windSpeed: 'वाऱ्याचा वेग',
  pressure: 'दाब',
  visibility: 'दृश्यमानता',
  uvIndex: 'UV निर्देशांक',
  rainChance: 'पाऊस शक्यता',
  forecast7Day: '7-दिवसांचा अंदाज',
  hourlyForecast: 'तासाभर अंदाज',
  mandiRates: 'मंडी भाव',
  measureFieldTitle: 'शेत मोजमाप',
  measureFieldIntro: 'GPS ने शेत मोजा',
  allCrops: 'सर्व पिके',
  catalogBanner: 'CIB&RC संदर्भ — dealer pack label तपासा.',
  tryAgain: 'पुन्हा प्रयत्न',
  measureLastGps: 'शेवटचे GPS मोजमाप',
  measureSaved: '✓ जतन केले',
  mandiSubtitle:
    'प्रत्येक पिकास 100+ varieties — Agmarknet वरून live rates. प्रत्येक variety चा वेगळा भाव.',
  mandiDataLabel: 'मंडी डेटा',
  mandiUpdated: 'अपडेट',
  mandiSelectCrop: 'पीक निवडा',
  mandiSelectVariety: 'Variety — निवडा',
  mandiAllVarietiesToday: (crop, count) => `आज सर्व ${crop} varieties (${count})`,
  cropProtTitle: 'खत आणि फवारणी मार्गदर्शक',
  cropProtSubtitle:
    'प्रत्येक पिकास 100+ varieties. Curated = full guide; इतर = general advice + live mandi. पिकाचे वय किंवा रोगानुसार spray & खत.',
  cropProtSelectCrop: 'पीक निवडा',
  cropProtByStage: 'पिकाच्या वयानुसार',
  cropProtByDisease: 'रोगानुसार',
  cropProtStage: 'पिकाचा टप्पा',
  cropProtSymptoms: 'लक्षणे',
  cropProtFertilizers: 'खते',
  cropProtSprays: 'फवारणी सल्ला',
  cropProtNoDisease: 'या पिकासाठी अद्याप रोग डेटा नाही.',
  cropProtNoSpray: 'या निवडीसाठी spray सल्ला नाही. दुसरा stage try करा किंवा AI विचारा.',
  pathakaluTitle: 'सरकारी योजना',
  pathakaluIntroBody:
    'PM-KISAN, KCC, crop insurance — latest government yojana ithe. Swatah add/update karaychi garaj nahi.',
  pathakaluResultCount: (n) => `${n} yojana sapadalya`,
  pathakaluEmpty: 'Search किंवा filter badla try kara',
  aboutTitle: 'बद्दल',
  aboutPara1:
    'Bhuvedam he AI-powered shati sahayyak aahe — shetakaryanna smart nirnay ghenyas madat karte. Weather, pik expertise ani AI.',
  aboutPara2:
    'Mothya agribusinesses la available technology aata pratyek shetakaryasathi.',
  aboutMissionLabel: 'AAMCHA DHYAS',
  aboutMissionText:
    'Krishi intelligence sarvansathi — utpadan vadhavne, waste kami karne, sustainable shati.',
};

const ta: ScreenTranslations = {
  ...en,
  weather: 'வானிலை',
  humidity: 'ஈரப்பதம்',
  windSpeed: 'காற்று வேகம்',
  pressure: 'அழுத்தம்',
  visibility: 'பார்வை',
  uvIndex: 'UV குறியீடு',
  rainChance: 'மழை வாய்ப்பு',
  forecast7Day: '7-நாள் முன்னறிவிப்பு',
  hourlyForecast: 'மணிநேர முன்னறிவிப்பு',
  mandiRates: 'மண்டி விலை',
  measureFieldTitle: 'வயல் அளவீடு',
  measureFieldIntro: 'GPS மூலம் வயல் அளவிடுங்கள்',
  allCrops: 'அனைத்து பயிர்கள்',
  catalogBanner: 'CIB&RC — dealer pack label சரிபார்க்கவும்.',
  tryAgain: 'மீண்டும் முயற்சி',
  measureLastGps: 'கடைசி GPS அளவீடு',
  measureSaved: '✓ சேமிக்கப்பட்டது',
  mandiSearchPlaceholder: 'Variety தேடல் — Masoori, 1010, BPT...',
  mandiSubtitle:
    'ஒவ்வொரு பயிருக்கும் 100+ varieties — Agmarknet-ல் இருந்து live rates. ஒவ்வொரு variety-க்கும் தனி விலை.',
  mandiDataLabel: 'Mandi தரவு',
  mandiUpdated: 'புதுப்பிக்கப்பட்டது',
  mandiSelectCrop: 'பயிர் தேர்ந்தெடுக்க',
  mandiSelectVariety: 'Variety — தேர்ந்தெடுக்க',
  mandiAllVarietiesToday: (crop, count) => `இன்று அனைத்து ${crop} varieties (${count})`,
  cropProtTitle: 'உரம் & தெளிப்பு வழிகாட்டி',
  cropProtSubtitle:
    'ஒவ்வொரு பயிருக்கும் 100+ varieties. Curated = full guide; மற்றவை = general advice + live mandi. பயிர் வயது அல்லது நோய் அடிப்படையில்.',
  cropProtSelectCrop: 'பயிர் தேர்ந்தெடுக்க',
  cropProtSelectVariety: 'Variety — தேடி தேர்ந்தெடுக்க',
  cropProtVarietySearch: 'Variety தேடல் — Masoori, 1010, BPT...',
  cropProtByStage: 'பயிர் வயது அடிப்படையில்',
  cropProtByDisease: 'நோய் அடிப்படையில்',
  cropProtStage: 'பயிர் நிலை',
  cropProtDiseaseSearch: 'நோய் தேடல் — blast, bollworm, whitefly...',
  cropProtSymptoms: 'அறிகுறிகள்',
  cropProtFertilizers: 'உரங்கள்',
  cropProtSprays: 'தெளிப்பு ஆலோசனை',
  cropProtNoDisease: 'இந்த பயிருக்கு நோய் தரவு இன்னும் இல்லை.',
  cropProtNoSpray: 'இந்த தேர்வுக்கு spray ஆலோசனை இல்லை. வேறு stage try செய்யுங்கள் அல்லது AI-யிடம் கேளுங்கள்.',
  pathakaluTitle: 'அரசு திட்டங்கள்',
  pathakaluIntroTitle: 'Subsidy, Loans & Insurance',
  pathakaluIntroBody:
    'PM-KISAN, KCC, crop insurance — latest government schemes இங்கே. நீங்கள் add/update செய்ய தேவையில்லை.',
  pathakaluCategory: 'வகை',
  pathakaluRegion: 'மாநிலம்',
  pathakaluResultCount: (n) => `${n} திட்டங்கள் கிடைத்தன`,
  pathakaluEmpty: 'Search அல்லது filter மாற்றி try செய்யுங்கள்',
  aboutTitle: 'பற்றி',
  aboutPara1:
    'Bhuvedam ஒரு AI-powered விவசாய உதவியாளர் — விவசாயிகள் smart முடிவுகள் எடுக்க. Weather, crop expertise, AI.',
  aboutPara2:
    'பெரிய agribusinesses-க்கு மட்டும் இருந்த technology இப்போது ஒவ்வொரு விவசாயிக்கும்.',
  aboutMissionLabel: 'எங்கள் நோக்கம்',
  aboutMissionText:
    'விவசாய intelligence அனைவருக்கும் — yield அதிகரிப்பு, waste குறைப்பு, sustainable farming.',
  versionLabel: 'Version',
};

const kn: ScreenTranslations = {
  ...en,
  weather: 'ಹವಾಮಾನ',
  humidity: 'ಆರ್ದ್ರತೆ',
  windSpeed: 'ಗಾಳಿ ವೇಗ',
  pressure: 'ಒತ್ತಡ',
  visibility: 'ದೃಶ್ಯತೆ',
  uvIndex: 'UV ಸೂಚ್ಯಂಕ',
  rainChance: 'ಮಳೆ ಸಾಧ್ಯತೆ',
  forecast7Day: '7-ದಿನ ಮುನ್ಸೂಚನೆ',
  hourlyForecast: 'ಗಂಟೆಯ ಮುನ್ಸೂಚನೆ',
  mandiRates: 'ಮಂಡಿ ಬೆಲೆ',
  measureFieldTitle: 'ಹೊಲ ಅಳತೆ',
  measureFieldIntro: 'GPS ನಿಂದ ಹೊಲ ಅಳೆಯಿರಿ',
  allCrops: 'ಎಲ್ಲಾ ಬೆಳೆಗಳು',
  catalogBanner: 'CIB&RC — dealer pack label ಪರಿಶೀಲಿಸಿ.',
  tryAgain: 'ಮತ್ತೆ ಪ್ರಯತ್ನ',
  measureLastGps: 'ಕೊನೆಯ GPS ಅಳತೆ',
  measureSaved: '✓ ಉಳಿಸಲಾಗಿದೆ',
  mandiSearchPlaceholder: 'Variety ಹುಡುಕಿ — Masoori, 1010, BPT...',
  mandiSubtitle:
    'ಪ್ರತಿ ಬೆಳೆಗೆ 100+ varieties — Agmarknet ನಿಂದ live rates. ಪ್ರತಿ variety ಗೆ ಬೇರೆ ಬೆಲೆ.',
  mandiDataLabel: 'Mandi ಡೇಟಾ',
  mandiUpdated: 'ಅಪ್‌ಡೇಟ್',
  mandiSelectCrop: 'ಬೆಳೆ ಆಯ್ಕೆ',
  mandiSelectVariety: 'Variety — ಆಯ್ಕೆ',
  mandiAllVarietiesToday: (crop, count) => `ಇಂದು ಎಲ್ಲಾ ${crop} varieties (${count})`,
  cropProtTitle: 'ರಸಗೊಬ್ಬರ & ಸಿಂಪಡಣೆ ಮಾರ್ಗದರ್ಶಿ',
  cropProtSubtitle:
    'ಪ್ರತಿ ಬೆಳೆಗೆ 100+ varieties. Curated = full guide; ಇತರ = general advice + live mandi. ಬೆಳೆ ವಯಸ್ಸು ಅಥವಾ ರೋಗದ ಆಧಾರದ ಮೇಲೆ.',
  cropProtSelectCrop: 'ಬೆಳೆ ಆಯ್ಕೆ',
  cropProtSelectVariety: 'Variety — ಹುಡುಕಿ ಆಯ್ಕೆ',
  cropProtVarietySearch: 'Variety ಹುಡುಕಿ — Masoori, 1010, BPT...',
  cropProtByStage: 'ಬೆಳೆ ವಯಸ್ಸಿನ ಆಧಾರದ ಮೇಲೆ',
  cropProtByDisease: 'ರೋಗದ ಆಧಾರದ ಮೇಲೆ',
  cropProtStage: 'ಬೆಳೆ ಹಂತ',
  cropProtDiseaseSearch: 'ರೋಗ ಹುಡುಕಿ — blast, bollworm, whitefly...',
  cropProtSymptoms: 'ಲಕ್ಷಣಗಳು',
  cropProtFertilizers: 'ರಸಗೊಬ್ಬರ',
  cropProtSprays: 'ಸಿಂಪಡಣೆ ಸಲಹೆ',
  cropProtNoDisease: 'ಈ ಬೆಳೆಗೆ ಇನ್ನೂ ರೋಗ ಡೇಟಾ ಇಲ್ಲ.',
  cropProtNoSpray: 'ಈ ಆಯ್ಕೆಗೆ spray ಸಲಹೆ ಇಲ್ಲ. ಬೇರೆ stage try ಮಾಡಿ ಅಥವಾ AI-ಗೆ ಕೇಳಿ.',
  pathakaluTitle: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
  pathakaluIntroTitle: 'Subsidy, Loans & Insurance',
  pathakaluIntroBody:
    'PM-KISAN, KCC, crop insurance — latest government schemes ಇಲ್ಲಿ. ನೀವು add/update ಮಾಡಬೇಕಿಲ್ಲ.',
  pathakaluCategory: 'ವರ್ಗ',
  pathakaluRegion: 'ರಾಜ್ಯ',
  pathakaluResultCount: (n) => `${n} ಯೋಜನೆಗಳು ಸಿಕ್ಕಿವೆ`,
  pathakaluEmpty: 'Search ಅಥವಾ filter ಬದಲಾಯಿಸಿ try ಮಾಡಿ',
  aboutTitle: 'ಬಗ್ಗೆ',
  aboutPara1:
    'Bhuvedam ಒಂದು AI-powered ಕೃಷಿ ಸಹಾಯಕ — ರೈತರು smart ನಿರ್ಧಾರಗಳು ತೆಗೆದುಕೊಳ್ಳಲು. Weather, crop expertise, AI.',
  aboutPara2:
    'ದೊಡ್ಡ agribusinesses ಗೆ ಮಾತ್ರ ಇದ್ದ technology ಈಗ ಪ್ರತಿ ರೈತರಿಗೂ.',
  aboutMissionLabel: 'ನಮ್ಮ ಧ್ಯೇಯ',
  aboutMissionText:
    'ಕೃಷಿ intelligence ಎಲ್ಲರಿಗೂ — yield ಹೆಚ್ಚಿಸುವುದು, waste ಕಡಿಮೆ, sustainable farming.',
  versionLabel: 'Version',
};

export const SCREEN_TRANSLATIONS: Record<LanguageCode, ScreenTranslations> = {
  en,
  te,
  hi,
  mr,
  ta,
  kn,
};

export function getScreenTranslations(language: LanguageCode): ScreenTranslations {
  return SCREEN_TRANSLATIONS[language] ?? en;
}

/** Pick localized catalog title (configs store te + en). */
export function catalogTitle(
  language: LanguageCode,
  titleTe: string,
  titleEn: string,
): string {
  if (language === 'te') return titleTe;
  return titleEn;
}

/** Pick localized filter label from te/en pair. */
export function filterLabel(
  language: LanguageCode,
  labelTe: string,
  labelEn: string,
): string {
  if (language === 'te') return labelTe;
  return labelEn;
}
