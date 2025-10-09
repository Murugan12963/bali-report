/**
 * Environment Variable Helper
 * Provides type-safe access to environment variables with validation
 */

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

/**
 * Get required environment variable (throws if missing)
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get boolean environment variable
 */
export function getBooleanEnv(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return fallback;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
export function getNumberEnv(key: string, fallback: number = 0): number {
  const value = process.env[key];
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get public environment variable (NEXT_PUBLIC_*)
 */
export function getPublicEnv(key: string, fallback: string = ''): string {
  const fullKey = key.startsWith('NEXT_PUBLIC_') ? key : `NEXT_PUBLIC_${key}`;
  return process.env[fullKey] || fallback;
}

/**
 * Get base URL for the application
 */
export function getBaseUrl(): string {
  // Server-side
  if (typeof window === 'undefined') {
    // Production
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL;
    }
    // Vercel deployment
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // Development
    return 'http://localhost:3000';
  }

  // Client-side
  return window.location.origin;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Validate required environment variables
 */
export function validateEnv(): { isValid: boolean; missing: string[] } {
  const required: string[] = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Environment configuration object (typed and validated)
 */
export const env = {
  // App
  nodeEnv: getEnv('NODE_ENV', 'development'),
  isProduction: isProduction(),
  isDevelopment: isDevelopment(),
  baseUrl: getBaseUrl(),

  // Database
  databaseUrl: getEnv('DATABASE_URL'),

  // Auth
  nextAuthSecret: getEnv('NEXTAUTH_SECRET'),
  nextAuthUrl: getEnv('NEXTAUTH_URL'),

  // OAuth Providers
  googleClientId: getEnv('GOOGLE_CLIENT_ID'),
  googleClientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
  githubId: getEnv('GITHUB_ID'),
  githubSecret: getEnv('GITHUB_SECRET'),
  vkClientId: getEnv('VK_CLIENT_ID'),
  vkClientSecret: getEnv('VK_CLIENT_SECRET'),
  yandexClientId: getEnv('YANDEX_CLIENT_ID'),
  yandexClientSecret: getEnv('YANDEX_CLIENT_SECRET'),

  // Mailchimp
  mailchimpApiKey: getEnv('MAILCHIMP_API_KEY'),
  mailchimpServerPrefix: getEnv('MAILCHIMP_SERVER_PREFIX'),
  mailchimpAudienceId: getEnv('MAILCHIMP_AUDIENCE_ID'),

  // Stripe
  stripePublicKey: getPublicEnv('STRIPE_PUBLISHABLE_KEY'),
  stripeSecretKey: getEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),

  // Analytics
  matomoUrl: getPublicEnv('MATOMO_URL'),
  matomoSiteId: getPublicEnv('MATOMO_SITE_ID'),

  // Advertising
  googleAdsenseClient: getPublicEnv('GOOGLE_ADSENSE_CLIENT'),
  adsterraBannerZone: getPublicEnv('ADSTERRA_BANNER_ZONE_ID'),
  adsterraNativeAds: getPublicEnv('ADSTERRA_NATIVE_ADS'),

  // AI Services
  xaiApiKey: getEnv('XAI_API_KEY'),
  openaiApiKey: getEnv('OPENAI_API_KEY'),

  // Market Data
  polygonApiKey: getEnv('POLYGON_API_KEY'),

  // Redis
  redisUrl: getEnv('REDIS_URL'),
  redisHost: getEnv('REDIS_HOST', 'localhost'),
  redisPort: getNumberEnv('REDIS_PORT', 6379),

  // Feature Flags
  enableWebsocket: getBooleanEnv('ENABLE_WEBSOCKET', true),
  enablePushNotifications: getBooleanEnv('ENABLE_PUSH_NOTIFICATIONS', true),
  enableAiPersonalization: getBooleanEnv('ENABLE_AI_PERSONALIZATION', true),
  enableNewsletter: getBooleanEnv('ENABLE_NEWSLETTER', true),
  enablePayments: getBooleanEnv('ENABLE_PAYMENTS', true),

  // Logging
  logLevel: getEnv('LOG_LEVEL', 'info'),
  debug: getBooleanEnv('DEBUG', false),
} as const;

/**
 * Type-safe environment variable access
 */
export type Env = typeof env;
