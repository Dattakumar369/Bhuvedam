/** Romanized Telugu + English synonyms for crop search (English or Telugu typing) */
export const CROP_SEARCH_ALIASES: Record<string, string[]> = {
  rice: ['vari', 'vri', 'paddy', 'dhan', 'bhatt', 'వరి', 'బiyyam', 'dhanyam'],
  wheat: ['godhuma', 'godum', 'గోధుమ'],
  maize: ['mokka jonna', 'corn', 'makka', 'మొక్కజొన్న'],
  jowar: ['jonna', 'sorghum', 'జొన్న'],
  bajra: ['sajja', 'pearl millet', 'సజ్జ'],
  ragi: ['finger millet', 'రాగి'],
  korra: ['foxtail', 'కొర్ర'],
  barley: ['barley', 'బార్లీ'],
  redgram: ['kandi', 'tur', 'arhar', 'pigeon pea', 'కంది', 'pappu'],
  greengram: ['pesara', 'moong', 'పెసర'],
  blackgram: ['minumulu', 'urad', 'మినుములు'],
  chickpea: ['senaga', 'chan', 'gram', 'శనగ'],
  horsegram: ['ulav', 'horse gram', 'ఉలవ'],
  cowpea: ['alasanda', 'bobbarlu', 'అలసంద'],
  lentil: ['masoor', 'misur pappu', 'మసూర్'],
  groundnut: ['verusenaga', 'peanut', 'వేరుశనగ'],
  sunflower: ['puvvu ginj', 'sunflower', 'పువ్వు గింజ'],
  safflower: ['kusuma', 'కుసుమ'],
  sesame: ['nuvvulu', 'til', 'నువ్వulu'],
  castor: ['amudam', 'ఆమudamu'],
  soybean: ['soya', 'సోయా'],
  mustard: ['avalu', 'sarson', 'ఆవalu'],
  cotton: ['patti', 'patt', 'పత్తి'],
  chilli: ['mirap', 'mirchi', 'mirchi', 'మిరప'],
  tobacco: ['pogaku', 'పొగాకu'],
  turmeric: ['pasupu', 'haldi', 'పసుపు'],
  sugarcane: ['cheraku', 'chekka', 'చెరకు'],
  tomato: ['tamata', 'tamato', 'టమాట'],
  onion: ['ulli', 'ullipaya', 'ఉల్లి'],
  potato: ['bangala dumpa', 'alu', 'బంగాళాదుంప'],
  brinjal: ['vankaya', 'eggplant', 'వంకాయ'],
  okra: ['bendakaya', 'lady finger', 'బెండకాయ'],
  cabbage: ['kosu', 'కోసు'],
  cauliflower: ['floriko', 'ఫ్లారికో'],
  beans: ['chikkudu', 'చిక్కుడు'],
  cucumber: ['dosakaya', 'దోసకాయ'],
  bottlegourd: ['sorakaya', 'సొరకాయ'],
  bittergourd: ['kakarakaya', 'కాకరకాయ'],
  ridgegourd: ['beerakaya', 'బీరకాయ'],
  pumpkin: ['gummadikaya', 'గుమ్మడికాయ'],
  carrot: ['carrot', 'క్యారట్'],
  beetroot: ['beet', 'బీట్రూట్'],
  spinach: ['palakura', 'పాలకూర'],
  drumstick: ['munagaku', 'మునగాకు'],
  mango: ['mamidi', 'mango', 'మామిడి'],
  banana: ['arati', 'banana', 'అరటి'],
  papaya: ['boppayi', 'బొప్పాయి'],
  watermelon: ['puchakaya', 'పుచ్చకాయ'],
  muskmelon: ['kharbuja', 'ఖర్బూజ'],
  citrus: ['nimma', 'orange', 'lemon', 'నిమ్మ'],
  pomegranate: ['danima', 'దానిమ్మ'],
  guava: ['jama', 'జామ'],
  sapota: ['sapota', 'సపోటా'],
  grapes: ['draksha', 'ద్రాక్ష'],
  coconut: ['kobbari', 'కొబ్బరి'],
  coriander: ['dhaniyalu', 'kothimira', 'ధనియాలు'],
  cumin: ['jeelakarra', 'జీలకర్ర'],
  fenugreek: ['menthulu', 'మెంతులు'],
  cashew: ['jeedipappu', 'జీడిపappu'],
  arecanut: ['pakka chekka', 'adaka'],
  tamarind: ['chintapandu', 'చintapandu'],
};

export function cropMatchesQuery(
  crop: { id: string; name: string; nameTe: string; category?: string },
  rawQuery: string,
): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;

  if (crop.id.includes(q)) return true;
  if (crop.name.toLowerCase().includes(q)) return true;
  if (crop.nameTe.toLowerCase().includes(q)) return true;
  if (crop.category?.toLowerCase().includes(q)) return true;

  const aliases = CROP_SEARCH_ALIASES[crop.id] ?? [];
  return aliases.some((a) => {
    const al = a.toLowerCase();
    return al.includes(q) || q.includes(al);
  });
}
