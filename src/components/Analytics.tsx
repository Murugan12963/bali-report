'use client';

import { useEffect } from 'react';

/**
 * Analytics and monitoring component for production deployment.
 * Handles Google Analytics, performance monitoring, and error tracking.
 */

declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: object) => void;
    dataLayer?: object[];
  }
}

interface AnalyticsProps {
  measurementId?: string;
}

/**
 * Google Analytics 4 integration component.
 * 
 * Args:
 *   measurementId (string): GA4 measurement ID (G-XXXXXXXXXX).
 */
export function GoogleAnalytics({ measurementId }: AnalyticsProps) {
  useEffect(() => {
    if (!measurementId || process.env.NODE_ENV !== 'production') {
      console.log('Google Analytics: Disabled in development or missing ID');
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date() as any);
    gtag('config', measurementId, {
      // Enhanced privacy settings
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    console.log('Google Analytics initialized:', measurementId);
  }, [measurementId]);

  return null;
}

/**
 * Performance monitoring component.
 * Tracks Core Web Vitals and custom metrics.
 */
export function PerformanceMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        
        // Send to analytics if available
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: Math.round(lastEntry.startTime),
            custom_map: { metric_value: 'value' }
          });
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
        
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'FID',
            value: Math.round(fid),
          });
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
      // Track RSS fetch times
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;
          
          // Log RSS performance
          if (args[0] && typeof args[0] === 'string' && args[0].includes('rss')) {
            console.log(`RSS fetch duration: ${duration}ms for ${args[0]}`);
            
            if (window.gtag) {
              window.gtag('event', 'rss_performance', {
                event_category: 'Performance',
                event_label: 'RSS Fetch',
                value: Math.round(duration),
              });
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
 * Error tracking component.
 * Captures and reports JavaScript errors.
 */
export function ErrorTracking() {
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

      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: event.message,
          fatal: false,
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: `Unhandled Promise: ${event.reason}`,
          fatal: false,
        });
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
 * Complete analytics setup component.
 * Combines all monitoring features.
 */
export default function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  return (
    <>
      {measurementId && <GoogleAnalytics measurementId={measurementId} />}
      <PerformanceMonitoring />
      <ErrorTracking />
    </>
  );
}
