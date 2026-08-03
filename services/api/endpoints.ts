export const ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    loginPassword: '/api/auth/login-password',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
    sendOtp: '/api/auth/send-otp',
    verifyOtp: '/api/auth/verify-otp',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
  },
  farmers: {
    me: '/api/farmers/me',
    sync: '/api/farmers/me/sync',
    lands: '/api/farmers/me/lands',
    land: (id: string) => `/api/farmers/me/lands/${id}`,
    surveyNumbers: (landId: string) => `/api/farmers/me/lands/${landId}/survey-numbers`,
    cropCalendar: '/api/farmers/me/crop-calendar',
    notifications: '/api/farmers/me/notifications',
    pushToken: '/api/farmers/me/push-token',
    pushAlert: '/api/farmers/me/notifications/push',
    notificationRead: (id: string) => `/api/farmers/me/notifications/${id}/read`,
    notificationsReadAll: '/api/farmers/me/notifications/read-all',
  },
  crops: {
    list: '/api/crops',
    detail: (cropId: string) => `/api/crops/${cropId}`,
    varieties: (cropId: string) => `/api/crops/${cropId}/varieties`,
    fertilizers: (cropId?: string) =>
      cropId ? `/api/fertilizer-products?crop=${cropId}` : '/api/fertilizer-products',
  },
  fertilizerProducts: {
    list: '/api/fertilizer-products',
    detail: (id: string) => `/api/fertilizer-products/${id}`,
    sync: '/api/fertilizer-products/sync',
  },
  plantDiseases: {
    list: '/api/plant-diseases',
    detail: (id: string) => `/api/plant-diseases/${id}`,
  },
  icar: {
    guidelines: '/api/icar/guidelines',
  },
  agAdvisories: {
    list: '/api/ag-advisories',
  },
  soilHealth: {
    recommendations: '/api/soil-health/recommendations',
  },
  agCatalog: {
    sync: '/api/ag-catalog/sync',
  },
  bulkCatalog: {
    stats: '/api/bulk-catalog/stats',
    sync: '/api/bulk-catalog/sync',
  },
  agProducts: {
    list: '/api/ag-products',
    detail: (id: string) => `/api/ag-products/${id}`,
    canonical: '/api/ag-products/canonical',
    canonicalDetail: (id: string) => `/api/ag-products/canonical/${id}`,
  },
  cropDiseases: {
    list: '/api/crop-diseases',
  },
  mandi: {
    prices: '/api/mandi/prices',
    pricesByCrop: (cropId: string) => `/api/mandi/prices?cropId=${cropId}`,
    forecast: '/mandi/forecast',
  },
  weather: {
    current: '/weather/current',
    forecast: '/weather/forecast',
    hourly: '/weather/hourly',
  },
  ai: {
    conversations: '/ai/conversations',
    conversation: (id: string) => `/ai/conversations/${id}`,
    send: '/api/ai/chat',
    stream: '/api/ai/chat/stream',
    predictions: '/ai/predictions',
  },
  soils: {
    query: '/api/soils',
  },
  sync: {
    status: '/api/sync/status',
    trigger: '/api/sync',
  },
  knowledge: {
    search: '/api/knowledge/search',
    ask: '/api/knowledge/ask',
    catalog: '/api/knowledge/catalog',
    cache: '/api/knowledge/cache',
  },
} as const;
