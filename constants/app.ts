export const APP = {
  name: 'Bhuvedam',
  tagline: 'AI Agriculture Assistant',
  version: '1.0.0',
  supportEmail: 'support@bhuvedam.com',
  website: 'https://bhuvedam.com',
} as const;

/** Live backend — OTA can change this; baked EXPO_PUBLIC_* env vars cannot. */
export const PRODUCTION_API_URL = 'https://bhuvedam.vercel.app';

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();

  // Release APKs may have been built with api.bhuvedam.com — always use Vercel in production.
  if (!__DEV__) {
    return PRODUCTION_API_URL;
  }

  return (fromEnv || 'http://localhost:3001').replace(/\/$/, '');
}

/** OTA updates may omit EXPO_PUBLIC_* — default on in production APK. */
function resolveUseBackendData(): boolean {
  const flag = process.env.EXPO_PUBLIC_USE_BACKEND_DATA?.trim().toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  if (!__DEV__) return true;
  const url = resolveApiBaseUrl();
  return url.includes('vercel.app') || url.includes('bhuvedam.com');
}

export const API_CONFIG = {
  baseUrl: resolveApiBaseUrl(),
  useBackendData: resolveUseBackendData(),
  timeout: 45000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const STORAGE_KEYS = {
  authToken: 'bhuvedam_auth_token',
  user: 'bhuvedam_user',
  language: 'bhuvedam_language',
  onboardingComplete: 'bhuvedam_onboarding_complete',
  themeMode: 'bhuvedam_theme_mode',
  farmerContext: 'bhuvedam_farmer_context',
  conversations: 'bhuvedam_ai_conversations',
  /** Last user id that wrote chat backup — used to recover orphaned scoped keys. */
  conversationsOwner: 'bhuvedam_ai_conversations_owner',
  farmAlerts: 'bhuvedam_farm_alerts',
  mandiSnapshot: 'bhuvedam_mandi_snapshot',
  alertPrefs: 'bhuvedam_alert_prefs',
  pushToken: 'bhuvedam_push_token',
  lastUserId: 'bhuvedam_last_user_id',
  productCacheFertilizers: 'bhuvedam_product_cache_fertilizers',
  productCachePesticides: 'bhuvedam_product_cache_pesticides',
  productCacheFungicides: 'bhuvedam_product_cache_fungicides',
} as const;
