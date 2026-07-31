/** In-memory only — cleared on app restart. Never persisted to storage or backend. */
const base64ByMessageId = new Map<string, string>();

export const imageSessionCache = {
  set(messageId: string, base64: string): void {
    base64ByMessageId.set(messageId, base64);
  },

  getBase64(messageId: string): string | undefined {
    return base64ByMessageId.get(messageId);
  },

  has(messageId: string): boolean {
    return base64ByMessageId.has(messageId);
  },

  remove(messageId: string): void {
    base64ByMessageId.delete(messageId);
  },

  clear(): void {
    base64ByMessageId.clear();
  },
};
