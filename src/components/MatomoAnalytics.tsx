'use client';

import { useEffect } from 'react';

/**
 * Matomo Analytics integration component.
 *
 * Args:
 *   siteId (string): Matomo site ID for tracking.
 *   matomoUrl (string): URL of your Matomo instance.
 */
interface MatomoAnalyticsProps {
  siteId?: string;
  matomoUrl?: string;
}

/**
 * Matomo Analytics component for privacy-focused analytics.
 * Provides page tracking, event tracking, and performance monitoring.
 */
export function MatomoAnalytics({ siteId, matomoUrl }: MatomoAnalyticsProps) {
  useEffect(() => {
    if (!siteId || !matomoUrl || process.env.NODE_ENV !== 'production') {
      console.log('Matomo Analytics: Disabled in development or missing configuration');
      return;
    }

    // Load Matomo script
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = `${matomoUrl}/matomo.js`;
    document.head.appendChild(script);

    // Initialize Matomo
    const _paq = (window._paq = window._paq || []);

    // Privacy-focused configuration
    _paq.push(['requireConsent']);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    _paq.push(['setTrackerUrl', `${matomoUrl}/matomo.php`]);
    _paq.push(['setSiteId', siteId]);

    // Enhanced privacy settings
    _paq.push(['disableCookies']);
    _paq.push(['setDoNotTrack', true]);
    _paq.push(['setSecureCookie', true]);
    _paq.push(['setCookieSameSite', 'Strict']);

    // Performance tracking
    _paq.push(['enableHeartBeatTimer', 15]); // Track active time

    console.log('Matomo Analytics initialized:', { siteId, matomoUrl });
  }, [siteId, matomoUrl]);

  return null;
}

/**
 * Matomo event tracking hook.
 * Provides functions to track custom events, page views, and user interactions.
 */
export function useMatomoAnalytics() {
  const trackEvent = (category: string, action: string, name?: string, value?: number) => {
    if (typeof window !== 'undefined' && window._paq) {
      const _paq = window._paq;
      if (name && value !== undefined) {
        _paq.push(['trackEvent', category, action, name, value]);
      } else if (name) {
        _paq.push(['trackEvent', category, action, name]);
      } else {
        _paq.push(['trackEvent', category, action]);
      }
    }
  };

  const trackPageView = (customTitle?: string) => {
    if (typeof window !== 'undefined' && window._paq) {
      const _paq = window._paq;
      if (customTitle) {
        _paq.push(['setCustomUrl', window.location.href]);
        _paq.push(['setDocumentTitle', customTitle]);
      }
      _paq.push(['trackPageView']);
    }
  };

  const trackSiteSearch = (keyword: string, category?: string, resultsCount?: number) => {
    if (typeof window !== 'undefined' && window._paq) {
      const _paq = window._paq;
      if (category && resultsCount !== undefined) {
        _paq.push(['trackSiteSearch', keyword, category, resultsCount]);
      } else if (category) {
        _paq.push(['trackSiteSearch', keyword, category]);
      } else {
        _paq.push(['trackSiteSearch', keyword]);
      }
    }
  };

  const trackGoal = (goalId: string | number, revenue?: number) => {
    if (typeof window !== 'undefined' && window._paq) {
      const _paq = window._paq;
      if (revenue !== undefined) {
        _paq.push(['trackGoal', goalId, revenue]);
      } else {
        _paq.push(['trackGoal', goalId]);
      }
    }
  };

  const setCustomVariable = (index: number, name: string, value: string, scope: 'visit' | 'page') => {
    if (typeof window !== 'undefined' && window._paq) {
      const _paq = window._paq;
      _paq.push(['setCustomVariable', index, name, value, scope]);
    }
  };

  return {
    trackEvent,
    trackPageView,
    trackSiteSearch,
    trackGoal,
    setCustomVariable,
  };
}

/**
 * Matomo performance monitoring component.
 * Tracks Core Web Vitals and custom performance metrics.
 */
export function MatomoPerformanceMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);

        // Send to Matomo
        if (window._paq) {
          window._paq.push(['trackEvent', 'Web Vitals', 'LCP', 'Largest Contentful Paint', Math.round(lastEntry.startTime)]);
        }
      });

      if ('PerformanceObserver' in window) {
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observer not supported');
        }
      }

      // First Input Delay (FID) - via event listener
      ['mousedown', 'keydown', 'touchstart', 'pointerdown'].forEach((type) => {
        addEventListener(type, () => measureFID(), { once: true, passive: true });
      });
    };

    const measureFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as PerformanceEventTiming;
        const fid = firstInput.processingStart - firstInput.startTime;

        console.log('FID:', fid);

        if (window._paq) {
          window._paq.push(['trackEvent', 'Web Vitals', 'FID', 'First Input Delay', Math.round(fid)]);
        }
      });

      try {
        observer.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }
    };

    // RSS performance monitoring
    const monitorRSSPerformance = () => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;

          // Log RSS performance
          if (args[0] && typeof args[0] === 'string' && args[0].includes('rss')) {
            console.log(`RSS fetch duration: ${duration}ms for ${args[0]}`);

            if (window._paq) {
              window._paq.push(['trackEvent', 'Performance', 'RSS Fetch', args[0].toString(), Math.round(duration)]);
            }
          }

          return response;
        } catch (error) {
          const duration = performance.now() - start;
          console.error(`RSS fetch failed after ${duration}ms:`, error);
          return Promise.reject(error);
        }
      };
    };

    observeWebVitals();
    monitorRSSPerformance();
  }, []);

  return null;
}

/**
 * Matomo error tracking component.
 * Captures and reports JavaScript errors to Matomo.
 */
export function MatomoErrorTracking() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const handleError = (event: ErrorEvent) => {
      console.error('JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });

      // Send to Matomo
      if (window._paq) {
        window._paq.push(['trackEvent', 'Errors', 'JavaScript Error', event.message]);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);

      if (window._paq) {
        window._paq.push(['trackEvent', 'Errors', 'Unhandled Promise Rejection', event.reason.toString()]);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

/**
 * Complete Matomo analytics setup component.
 * Combines all Matomo monitoring features.
 */
export default function MatomoAnalyticsSetup() {
  const siteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;

  return (
    <>
      {siteId && matomoUrl && <MatomoAnalytics siteId={siteId} matomoUrl={matomoUrl} />}
      <MatomoPerformanceMonitoring />
      <MatomoErrorTracking />
    </>
  );
}

// Type definitions for Matomo
declare global {
  interface Window {
    _paq: any[];
  }
}
