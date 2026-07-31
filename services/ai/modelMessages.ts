import type { ChatMessage } from '@/types/ai';

const OMITTED_ASSISTANT = '[Previous AI reply omitted — use LIVE DATA in system message, not old chat.]';

/**
 * Old assistant replies often contain wrong facts (time, rates, names).
 * Keep user messages for context but drop stale assistant content.
 */
export function trimMessagesForModel(messages: ChatMessage[], maxMessages = 6): ChatMessage[] {
  const cleaned = messages
    .filter(
      (m) =>
        m.role !== 'system' &&
        !m.isStreaming &&
        (m.content.trim() || m.imageUri),
    )
    .slice(-maxMessages);

  if (cleaned.length <= 2) return cleaned;

  const lastIdx = cleaned.length - 1;
  return cleaned.map((m, idx) => {
    if (m.role !== 'assistant') return m;
    // Keep only the most recent assistant message verbatim
    if (idx === lastIdx || (idx === lastIdx - 1 && cleaned[lastIdx]?.role === 'assistant')) {
      return m;
    }
    return { ...m, content: OMITTED_ASSISTANT };
  });
}
