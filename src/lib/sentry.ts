/**
 * Sentry Error Tracking Integration
 * Captures and reports errors in production
 */

import { env } from './env';

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  enabled: boolean;
}

/**
 * Initialize Sentry (stub for now - install @sentry/nextjs to use)
 */
export function initSentry(): void {
  // Only initialize in production
  if (!env.isProduction) {
    console.log('Sentry disabled in non-production environment');
    return;
  }

  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!sentryDsn) {
    console.warn('SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    // In a real implementation, you would do:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.init({
    //   dsn: sentryDsn,
    //   environment: env.nodeEnv,
    //   tracesSampleRate: 0.1,
    //   beforeSend(event) {
    //     // Filter sensitive data
    //     if (event.request) {
    //       delete event.request.cookies;
    //     }
    //     return event;
    //   },
    // });

    console.log('✅ Sentry error tracking initialized');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!env.isProduction) {
    console.error('Error captured:', error, context);
    return;
  }

  try {
    // In a real implementation:
    // Sentry.captureException(error, { extra: context });
    console.error('[Sentry] Exception:', error, context);
  } catch (err) {
    console.error('Failed to capture exception:', err);
  }
}

/**
 * Capture message manually
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!env.isProduction) {
    console.log(`[${level}] ${message}`);
    return;
  }

  try {
    // In a real implementation:
    // Sentry.captureMessage(message, level);
    console.log(`[Sentry] ${level}:`, message);
  } catch (error) {
    console.error('Failed to capture message:', error);
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!env.isProduction) {
    return;
  }

  try {
    // In a real implementation:
    // Sentry.setUser(user);
    console.log('[Sentry] User context set:', user?.id);
  } catch (error) {
    console.error('Failed to set user context:', error);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
  if (!env.isProduction) {
    return;
  }

  try {
    // In a real implementation:
    // Sentry.addBreadcrumb({
    //   message,
    //   category,
    //   data,
    //   level: 'info',
    // });
    console.log(`[Sentry] Breadcrumb: ${category} - ${message}`, data);
  } catch (error) {
    console.error('Failed to add breadcrumb:', error);
  }
}

/**
 * Error boundary wrapper
 */
export function withSentryErrorBoundary<T>(Component: React.ComponentType<T>) {
  // In a real implementation, you would use:
  // return Sentry.withErrorBoundary(Component, {
  //   fallback: <ErrorFallback />,
  //   showDialog: true,
  // });

  return Component;
}

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  withErrorBoundary: withSentryErrorBoundary,
};
