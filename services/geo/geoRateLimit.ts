import { NOMINATIM_MIN_INTERVAL_MS } from '@/services/geo/geoConfig';

let lastNominatimCallAt = 0;

export async function waitForNominatimSlot(): Promise<void> {
  const now = Date.now();
  const waitMs = lastNominatimCallAt + NOMINATIM_MIN_INTERVAL_MS - now;
  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
  lastNominatimCallAt = Date.now();
}
