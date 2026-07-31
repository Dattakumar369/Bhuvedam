/** First chunk long enough to start TTS while the model is still generating. */
export function getEarlySpeakSnippet(text: string, minLen = 36): string | null {
  const trimmed = text.trim();
  if (trimmed.length < minLen) return null;

  const sentenceEnd = trimmed.match(/^[\s\S]{20,}?[.!?।\u0964]\s/u);
  if (sentenceEnd) return sentenceEnd[0].trim();

  if (trimmed.length >= 100) {
    const slice = trimmed.slice(0, 100);
    const lastSpace = slice.lastIndexOf(' ');
    return (lastSpace > 40 ? slice.slice(0, lastSpace) : slice).trim();
  }

  return null;
}
