export const APP = {
  name: 'Bhuvedam',
  tagline: 'AI Agriculture Assistant',
  version: '1.0.0',
  supportEmail: 'support@bhuvedam.com',
  website: 'https://bhuvedam.com',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.bhuvedam.com',
  useBackendData: process.env.EXPO_PUBLIC_USE_BACKEND_DATA === 'true',
  timeout: 30000,
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
  farmAlerts: 'bhuvedam_farm_alerts',
  mandiSnapshot: 'bhuvedam_mandi_snapshot',
  alertPrefs: 'bhuvedam_alert_prefs',
  pushToken: 'bhuvedam_push_token',
  lastUserId: 'bhuvedam_last_user_id',
} as const;
