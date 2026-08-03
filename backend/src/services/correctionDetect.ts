const CORRECTION_RE =
  /\b(wrong|incorrect|not correct|that's wrong|actually|correct is|fix this|tappu|tappadu|kadu|kadhu|nijam|mari|cheppaledu)\b|తప్ప|కాదు|నిజం|మార/i;

export function isCorrectionMessage(text: string): boolean {
  return CORRECTION_RE.test(text.trim());
}

/** Prior farmer question when they say the latest answer was wrong. */
export function extractPriorUserQuestion(
  messages: { role: string; content: string | unknown }[],
): string {
  const users = messages
    .filter((m) => m.role === 'user')
    .map((m) => messageText(m.content))
    .filter(Boolean);

  if (users.length >= 2 && isCorrectionMessage(users[users.length - 1] ?? '')) {
    return users[users.length - 2] ?? users[users.length - 1] ?? '';
  }
  return users[users.length - 1] ?? '';
}

export function messageText(content: string | unknown): string {
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: string }).text ?? '');
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  return '';
}
