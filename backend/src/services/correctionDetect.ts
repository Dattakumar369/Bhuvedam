const CORRECTION_RE =
  /\b(wrong|incorrect|not correct|that's wrong|actually|correct is|fix this|tappu|tappadu|kadu|kadhu|nijam|mari|cheppaledu)\b|తప్ప|కాదు|నిజం|మార/i;

const WEB_SEARCH_RE =
  /\b(search|find|google|internet|web|online|look up|browse)\b|search chey|web lo|internet lo|online lo|google lo|వెబ|ఇంటర్నెట|సెర్చ|వెత|ఆన్లైన/i;

const UNCERTAIN_ANSWER_RE =
  /\b(sorry|i don't|i do not|don't have|do not have|no information|not available|cannot find|unable to|i'm not sure|don't know|do not know|teliyadu|telisadu|ledu|kanipinchaledu|dorakaledu|naku telidu|information about that|ippudu cheppalemu)\b|క్షమ|తెలియ|లేదు|దొరక|సమాచారం లే/i;

export function isCorrectionMessage(text: string): boolean {
  return CORRECTION_RE.test(text.trim());
}

export function wantsWebSearch(text: string): boolean {
  return WEB_SEARCH_RE.test(text.trim());
}

export function isUncertainLlmAnswer(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.length < 25) return true;
  return UNCERTAIN_ANSWER_RE.test(t);
}

export function systemNeedsWebResearch(messages: { role: string; content: unknown }[]): boolean {
  const sys = messages.find((m) => m.role === 'system');
  const sysText = messageText(sys?.content ?? '');
  if (/ONLINE AGRICULTURE SOURCES/i.test(sysText)) return false;
  if (/No library match|No matching entries in Bhuvedam|could not be loaded/i.test(sysText)) {
    return true;
  }
  const lastUser = messageText(
    messages.filter((m) => m.role === 'user').at(-1)?.content ?? '',
  );
  return wantsWebSearch(lastUser);
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
