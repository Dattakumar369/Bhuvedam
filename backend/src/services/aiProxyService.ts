type ChatRole = 'system' | 'user' | 'assistant';

export interface ProxyChatMessage {
  role: ChatRole;
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

function ollamaConfig() {
  return {
    url: (process.env.OLLAMA_API_URL ?? process.env.EXPO_PUBLIC_OLLAMA_API_URL ?? 'https://ollama.com').replace(
      /\/$/,
      '',
    ),
    key: process.env.OLLAMA_API_KEY ?? process.env.EXPO_PUBLIC_OLLAMA_API_KEY ?? '',
    model: process.env.OLLAMA_MODEL ?? process.env.EXPO_PUBLIC_OLLAMA_MODEL ?? 'llama3.2',
  };
}

export async function streamOllamaChat(
  messages: ProxyChatMessage[],
  opts: { voiceMode?: boolean; signal?: AbortSignal },
): Promise<ReadableStream<Uint8Array>> {
  const { url, key, model } = ollamaConfig();
  if (!key) {
    throw new Error('OLLAMA_API_KEY not configured on server');
  }

  const response = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        temperature: opts.voiceMode ? 0.25 : 0.15,
        top_p: 0.85,
        repeat_penalty: 1.15,
        num_predict: opts.voiceMode ? 512 : 1024,
      },
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Ollama error ${response.status}`);
  }

  const body = response.body;
  if (!body) throw new Error('Ollama stream unavailable');

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();
      let buffer = '';
      let full = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const parsed = JSON.parse(trimmed) as { message?: { content?: string } };
              const token = parsed.message?.content;
              if (token) {
                full += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content: full })}\n\n`),
                );
              }
            } catch {
              /* skip */
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
