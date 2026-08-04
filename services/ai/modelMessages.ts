import type { ChatMessage } from '@/types/ai';

const OMITTED_ASSISTANT =
  '[Earlier reply omitted — use LIVE DATA in the system message for current facts; keep conversational flow from recent turns.]';

/**
 * Old assistant replies may contain stale facts (time, rates).
 * Keep user messages + the last two assistant replies for follow-ups like "that crop".
 */
export function trimMessagesForModel(messages: ChatMessage[], maxMessages = 15): ChatMessage[] {
  const cleaned = messages
    .filter(
      (m) =>
        m.role !== 'system' &&
        !m.isStreaming &&
        (m.content.trim() || m.imageUri),
    )
    .slice(-maxMessages);

  if (cleaned.length <= 2) return cleaned;

  const assistantIndices = cleaned
    .map((m, i) => (m.role === 'assistant' ? i : -1))
    .filter((i) => i >= 0);
  const keepAssistants = new Set(assistantIndices.slice(-2));

  return cleaned.map((m, idx) => {
    if (m.role !== 'assistant') return m;
    if (keepAssistants.has(idx)) return m;
    return { ...m, content: OMITTED_ASSISTANT };
  });
}
