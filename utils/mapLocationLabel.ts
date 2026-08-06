import * as Location from 'expo-location';

/** Build a readable village / road / area label from reverse geocode. */
export async function reverseGeocodeMapLabel(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!geo) return null;

    const parts: string[] = [];
    const push = (value?: string | null) => {
      const v = value?.trim();
      if (!v) return;
      if (parts.some((p) => p.toLowerCase() === v.toLowerCase())) return;
      parts.push(v);
    };

    push(geo.name);
    push(geo.streetNumber ? `${geo.streetNumber} ${geo.street ?? ''}`.trim() : geo.street);
    push(geo.district);
    push(geo.subregion);
    push(geo.city);
    push(geo.region);

    return parts.length ? parts.join(' · ') : null;
  } catch {
    return null;
  }
}
