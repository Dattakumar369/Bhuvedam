import { secureStorage } from '@/utils/storage';

const CHUNK_BYTES = 1800;

function metaKey(baseKey: string): string {
  return `${baseKey}__chunks_meta`;
}

function chunkKey(baseKey: string, index: number): string {
  return `${baseKey}__chunk_${index}`;
}

/** SecureStore values are ~2KB max on Android — split large JSON across keys. */
export const chunkedSecureStorage = {
  async get(baseKey: string): Promise<string | null> {
    const metaRaw = await secureStorage.get(metaKey(baseKey));
    if (!metaRaw) {
      return secureStorage.get(baseKey);
    }

    try {
      const meta = JSON.parse(metaRaw) as { chunks?: number };
      const chunkCount = meta.chunks ?? 0;
      if (chunkCount <= 0) return null;

      const parts: string[] = [];
      for (let i = 0; i < chunkCount; i++) {
        const part = await secureStorage.get(chunkKey(baseKey, i));
        if (part == null) return null;
        parts.push(part);
      }
      return parts.join('');
    } catch {
      return secureStorage.get(baseKey);
    }
  },

  async set(baseKey: string, value: string): Promise<void> {
    if (value.length <= CHUNK_BYTES) {
      await secureStorage.set(baseKey, value);
      await secureStorage.remove(metaKey(baseKey));
      return;
    }

    const chunks = Math.ceil(value.length / CHUNK_BYTES);
    await secureStorage.set(metaKey(baseKey), JSON.stringify({ chunks, v: 1 }));

    for (let i = 0; i < chunks; i++) {
      await secureStorage.set(
        chunkKey(baseKey, i),
        value.slice(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES),
      );
    }

    for (let i = chunks; i < chunks + 8; i++) {
      await secureStorage.remove(chunkKey(baseKey, i));
    }
  },

  async remove(baseKey: string): Promise<void> {
    const metaRaw = await secureStorage.get(metaKey(baseKey));
    if (metaRaw) {
      try {
        const meta = JSON.parse(metaRaw) as { chunks?: number };
        const chunkCount = meta.chunks ?? 0;
        for (let i = 0; i < chunkCount; i++) {
          await secureStorage.remove(chunkKey(baseKey, i));
        }
      } catch {
        // ignore bad meta
      }
      await secureStorage.remove(metaKey(baseKey));
    }
    await secureStorage.remove(baseKey);
  },
};
