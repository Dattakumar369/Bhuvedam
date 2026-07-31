/** Backend Ollama client — uses same keys as Expo app (.env) */

export function getOllamaConfig() {
  return {
    url: (process.env.EXPO_PUBLIC_OLLAMA_API_URL ?? process.env.OLLAMA_API_URL ?? 'https://ollama.com').replace(
      /\/$/,
      '',
    ),
    apiKey: process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? process.env.OLLAMA_API_KEY ?? '',
    model: process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? process.env.OLLAMA_MODEL ?? 'llama3.2',
  };
}

export function hasOllama(): boolean {
  return Boolean(getOllamaConfig().apiKey);
}

export async function ollamaComplete(prompt: string, maxTokens = 120): Promise<string> {
  const { url, apiKey, model } = getOllamaConfig();
  if (!apiKey) return '';

  const response = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: 'user', content: prompt }],
      options: { temperature: 0.2, num_predict: maxTokens },
    }),
  });

  if (!response.ok) return '';

  const data = (await response.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() ?? '';
}
