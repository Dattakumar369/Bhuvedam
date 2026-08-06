/** Days-after-sowing reminders spoken by the voice companion (Telugu-first). */
export interface CropVoiceTask {
  day: number;
  /** Match if days since sowing is within day ± tolerance */
  tolerance: number;
  messageTe: string;
  messageEn: string;
}

export const CROP_VOICE_TASKS: Record<string, CropVoiceTask[]> = {
  cotton: [
    {
      day: 10,
      tolerance: 3,
      messageTe: 'pindi malli challali — rendu sarlu pindi veyadam gap filling ki manchidi',
      messageEn: 'time for second cotton sowing / gap filling (~10 days after first)',
    },
    {
      day: 25,
      tolerance: 5,
      messageTe: 'purugu mandu spray gurinchi AAO tho confirm chesi kottandi',
      messageEn: 'check bollworm spray timing with local AAO',
    },
  ],
  groundnut: [
    {
      day: 10,
      tolerance: 3,
      messageTe: 'pindi gap filling cheyandi — rendu sarlu pindi veyadam common',
      messageEn: 'groundnut gap filling ~10 days after sowing',
    },
  ],
  rice: [
    {
      day: 20,
      tolerance: 5,
      messageTe: 'urea first dose — 20–25 rojula vayasu lo apply cheyandi',
      messageEn: 'first urea dose around 20–25 days',
    },
  ],
  chilli: [
    {
      day: 10,
      tolerance: 3,
      messageTe: 'pindi malli challali — mirapa lo rendu sarlu pindi veyadam baguntundi',
      messageEn: 'mirapa / chilli second sowing ~10 days',
    },
  ],
};

/** Aliases farmers use in speech → crop id */
export const CROP_SPEECH_ALIASES: Record<string, string> = {
  mirapa: 'chilli',
  mirchi: 'chilli',
  patti: 'cotton',
  patthi: 'cotton',
  verusenaga: 'groundnut',
  palli: 'groundnut',
  vari: 'rice',
  paddy: 'rice',
  tomato: 'tomato',
  tamata: 'tomato',
};
