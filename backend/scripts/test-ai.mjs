import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
config({ path: resolve(root, '.env') });
config({ path: resolve(root, 'backend/.env') });

const url = (process.env.OLLAMA_API_URL ?? 'https://ollama.com').replace(/\/$/, '');
const key = process.env.OLLAMA_API_KEY ?? process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? '';
const model = process.env.OLLAMA_MODEL ?? process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? 'llama3.2';

console.log('Ollama URL:', url);
console.log('Model:', model);
console.log('Key configured:', Boolean(key));

if (!key) {
  console.error('No OLLAMA_API_KEY');
  process.exit(1);
}

const started = Date.now();
const bigSystem = 'You are Bhuvedam AI.\n' + 'CONTEXT LINE.\n'.repeat(400);
const res = await fetch(`${url}/api/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    model,
    messages: [
      { role: 'system', content: bigSystem },
      { role: 'user', content: 'paddy ki fertilizer emi ivvali?' },
    ],
    stream: false,
    think: 'low',
    options: { num_predict: 1024 },
  }),
});

console.log('Status:', res.status, 'Time ms:', Date.now() - started);
const data = JSON.parse(await res.text());
const msg = data.message ?? {};
console.log('content length:', (msg.content ?? '').length);
console.log('thinking length:', (msg.thinking ?? '').length);
console.log('content preview:', String(msg.content ?? '').slice(0, 200));
console.log('thinking preview:', String(msg.thinking ?? '').slice(0, 200));
if (data.error) console.log('error:', data.error);
