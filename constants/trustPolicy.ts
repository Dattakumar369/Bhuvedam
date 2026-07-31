/**
 * Trust, privacy, and legal compliance — used in AI system prompts and legal screens.
 * Keep in sync: changes here affect farmer-facing AI behaviour and Privacy/Terms pages.
 */

/** Core rules injected into every Bhuvedam AI system prompt */
export const AI_TRUST_AND_LEGAL_RULES = `TRUST, PRIVACY & LEGAL COMPLIANCE (mandatory — never break):

PRIVACY & DATA ISOLATION
1. You serve ONLY the farmer in this chat session. You have NO access to any other user's name, phone, farm, location, chat history, or profile.
2. NEVER share, quote, compare, or imply knowledge of another farmer's personal information — even if asked.
3. If asked about other users, say clearly: "Bhuvedam does not share one farmer's information with another. I can only help you with your own farm details."
4. Use profile data in LIVE DATA only for THIS farmer. Do not repeat their phone number or exact GPS coordinates in replies unless they explicitly ask for it.
5. Chat and farm data stay on the farmer's device; do not claim you send their private data to other farmers.

LAWFUL USE ONLY
6. Give guidance ONLY for legal, legitimate farming in India. Do not encourage or instruct illegal activity.
7. REFUSE politely (with a safe legal alternative) requests involving:
   - Unregistered / banned / smuggled pesticides, seeds, or chemicals
   - Doses above label limits, off-label use meant to evade law, or hiding spray records
   - Fraud (fake mandi receipts, subsidy fraud, forged soil/organic certificates)
   - Theft (electricity, water, land encroachment), poaching, or environmental crimes
   - Circumventing government inspections, quarantine, or export/import rules
8. Pesticides & chemicals: recommend ONLY registered products used per label, Pre-Harvest Interval (PHI), and local agriculture department / CIB&RC guidelines. Mention PPE and safe disposal when relevant.
9. Fertilizers: follow Fertilizer Control Order (FCO) and state rules — no adulteration or unapproved formulations.
10. Seeds: prefer certified / licensed seed sources; do not advise using banned GM or smuggled seed where prohibited.
11. Water & land: advise lawful water use and land-use rules; do not help with illegal borewells or encroachment.

HONEST LIMITS
12. You are an information assistant, not a lawyer or government officer. For legal disputes, licensing, or criminal matters, direct the farmer to the local agriculture officer, Krishi Vigyan Kendra, or official helpline.
13. When a request may be illegal or unsafe, decline briefly, explain why (one sentence), and offer a lawful farming alternative.`;

/** Short reminder appended to context builder reply rules */
export const AI_CONTEXT_PRIVACY_NOTE =
  'This session is private to THIS farmer only. Never reference or invent other users\' data.';

/** Refusal tone guidance for the model */
export const AI_REFUSAL_STYLE =
  'When refusing illegal or unsafe requests: be respectful, brief, in the farmer\'s language, and suggest a legal option (e.g. registered product, local ag officer).';

export const PRIVACY_POLICY_EXTRA = `
## Your Data Stays Yours

- **No cross-user sharing:** We never show one farmer's name, phone, location, farm size, crops, soil data, or chat messages to another farmer.
- **On-device storage:** Your profile, farm setup, and AI chat history are stored securely on your device (encrypted secure storage where supported).
- **Session isolation:** The AI assistant only uses **your** profile and **your** chat in the current session. It cannot access other users' accounts.

## What We Do Not Do

- We do **not** sell your personal information to other farmers or third parties for marketing.
- We do **not** publish your farm location or contact details to a public directory.
- We do **not** use your private chat to answer another user's questions.

## AI Assistant & Third-Party Services

When you use AI chat, your messages may be processed by our AI provider to generate a reply. We send only what is needed for **your** answer (your question and relevant context such as weather or your saved farm profile). Providers are required to handle data confidentially and not use it to identify or contact other users.

Weather, mandi, and soil data come from public or licensed agricultural data sources — not from other Bhuvedam users.

## Data Retention & Deletion

You may clear app data by logging out or uninstalling the app. Contact **support@bhuvedam.com** to request deletion of any server-side logs tied to your account (if applicable).

## Children's Privacy

Bhuvedam is intended for farmers and adults. We do not knowingly collect data from children under 13.
`;

export const TERMS_LEGAL_EXTRA = `
## Lawful Use Required

You agree to use {{APP_NAME}} only for **lawful agricultural purposes** in accordance with applicable laws in India, including but not limited to:

- Insecticides Act, 1968 and registered pesticide label directions
- Fertilizer Control Order (FCO) and state fertilizer rules
- Seeds Act and certified seed regulations
- Environmental and water-use regulations in your state

You must **not** use the app to plan, request, or obtain help with illegal activities, including fraud, use of banned agrochemicals, evasion of government rules, or harm to people, animals, or the environment.

## AI Assistant Disclaimer

AI responses are **general farming information**, not legal, medical, or professional agronomic advice. Always verify critical decisions (pesticide choice, dose, PHI, subsidies, land use) with your local agriculture officer, licensed dealer, or Krishi Vigyan Kendra.

Bhuvedam AI will **refuse** requests that appear illegal or unsafe and may suggest lawful alternatives.

## User Conduct

You agree not to:

- Attempt to extract other users' private information through the app or AI
- Misrepresent your identity or farm details to commit fraud
- Use the service to harass, abuse, or mislead others
- Reverse engineer or disrupt the service

## Regulatory Compliance

Farmers remain responsible for complying with state and central laws on pesticides, fertilizers, seeds, water, labour, and market regulations. {{APP_NAME}} does not guarantee regulatory approval of any suggestion.
`;

export function getTermsLegalExtra(appName: string): string {
  return TERMS_LEGAL_EXTRA.replace(/\{\{APP_NAME\}\}/g, appName);
}

export function getPrivacyPolicyExtra(): string {
  return PRIVACY_POLICY_EXTRA;
}

/** One-line trust reminder shown in AI chat */
export const AI_TRUST_UI_NOTE: Record<'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn', string> = {
  en: 'Private — your farm data is never shared with other users. Lawful farming guidance only.',
  te: 'గోప్యం — మీ వివరాలు ఇతర రైతులతో పంచుకోము. చట్టబద్ధమైన వ్యవసాయ సలహా మాత్రమే.',
  hi: 'निजी — आपका डेटा दूसरे किसानों के साथ साझा नहीं होता। केवल lawful खेती सलाह।',
  mr: 'गोपनीय — तुमचा डेटा इतर शेतकऱ्यांसोबत शेअर होत नाही. फक्त कायदेशीर शेती सल्ला.',
  ta: 'தனிப்பட்டது — உங்கள் தரவு மற்ற விவசாயிகளுடன் பகிரப்படாது. சட்டப்பூர்வ விவசாய ஆலோசனை மட்டும்.',
  kn: 'ಖಾಸಗಿ — ನಿಮ್ಮ ಡೇಟಾ ಇತರ ರೈತರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ. ಕಾನೂನುಬದ್ಧ ಕೃಷಿ ಸಲಹೆ ಮಾತ್ರ.',
};
