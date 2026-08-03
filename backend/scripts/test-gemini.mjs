import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(root, 'backend/.env') });

const key = process.env.GEMINI_API_KEY ?? '';
const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

if (!key) {
  console.error('Set GEMINI_API_KEY in backend/.env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });
const started = Date.now();

const response = await ai.interactions.create({
  model,
  input: 'paddy ki fertilizer emi ivvali? Reply in one short Telugu sentence.',
});

console.log('Model:', model);
console.log('Time ms:', Date.now() - started);
console.log('Reply:', response.output_text?.slice(0, 300) ?? JSON.stringify(response).slice(0, 400));
