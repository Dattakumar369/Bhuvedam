/**
 * Bhuvedam app feature map for AI — lets the assistant guide farmers to the right screen.
 * Keep in sync with Home quick actions and bottom tabs.
 */
export function formatBhuvedamAppGuideBlock(compact = false): string {
  if (compact) {
    return [
      'Bhuvedam = Telugu/English farming app. Bottom tabs: Home | Crop (farm profile) | AI chat | Profile.',
      'Home: Weather, AI, Fertilizers, Pesticides, Fungicides, Spray guide, Mandi rates, Nearby shops, Schemes, Field measure, Crop guide.',
      'AI chat: type or mic; pause while speaking is OK; tap Done then edit & Send; voice mode reads replies aloud; long-press messages to edit/delete.',
      'Crop tab: save village, soil, field area, crops — unlocks personalized AI advice.',
      'Profile: language, dark mode, settings, logout.',
    ].join('\n');
  }

  return [
    '=== BHUvedam APP GUIDE (use when farmer asks how to use the app or where to find something) ===',
    '',
    'App: Bhuvedam — smart farming companion for Indian farmers (Telugu + English UI).',
    '',
    'BOTTOM NAVIGATION (always visible):',
    '- Home tab: dashboard with weather, farm alerts, quick actions, recent AI chats.',
    '- Crop tab: farm profile wizard — village, soil type, field area (cents/acres), crops grown. Complete this for personalized AI, weather, and mandi advice.',
    '- AI tab: Bhuvedam AI assistant — farming Q&A, voice input, optional voice replies.',
    '- Profile tab: account, language, dark mode, settings, privacy, about, logout.',
    '',
    'HOME QUICK ACTIONS (open from Home scroll):',
    '- Ask AI → AI chat (same as AI tab).',
    '- Weather → detailed forecast, hourly/daily, GPS location.',
    '- Fertilizers → searchable catalog with doses, NPK info, product details.',
    '- Pesticides → insecticide catalog with active ingredient, dose, safety.',
    '- Fungicides → fungicide catalog for crop diseases.',
    '- Crop protection / Spray guide → integrated pest & disease protection guidance.',
    '- Mandi rates → live market prices by crop/variety, trends, forecasts.',
    '- Nearby places → agri shops, dealers, mandis on map near farmer location.',
    '- Schemes (Pathakalu) → government schemes, subsidies, PM-KISAN, insurance info.',
    '- Field measure → walk GPS boundary to measure field area in cents/acres.',
    '- Crop guide → crop catalog with season, sowing, and cultivation basics.',
    '',
    'AI CHAT FEATURES:',
    '- Text or microphone input; farmer can pause while speaking — transcript is kept.',
    '- After mic: tap Done → review/edit message in the box → tap Send.',
    '- Voice mode (speaker icon): AI reads answers aloud; mic re-opens after reply.',
    '- Suggested questions on new chats; topic categories on AI home.',
    '- Long-press any message → Edit or Delete.',
    '- Optional photo attach: analyze crop disease/pest from farm photo (session only).',
    '',
    'HOW TO GUIDE FARMERS:',
    '- Give simple steps: "Home tab → Mandi rates" or "Crop tab → complete farm setup".',
    '- Do not mention servers, APIs, databases, or technical backend.',
    '- If data is missing (e.g. mandi rates), tell them to open that screen once with internet.',
  ].join('\n');
}
