"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initMatomo, trackPageView } from "@/lib/analytics/matomo";

/**
 * Matomo Analytics Tracker Component
 * Inner component that uses useSearchParams
 */
function MatomoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Matomo Analytics Component
 * Automatically tracks page views on route changes
 */
export default function MatomoAnalytics() {
  useEffect(() => {
    // Check if Matomo is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_MATOMO === 'true') {
      console.log('✅ Matomo Analytics: Disabled via NEXT_PUBLIC_DISABLE_MATOMO');
      return;
    }

    // Initialize Matomo on first load
    const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
    const matomoSiteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

    if (!matomoUrl || !matomoSiteId) {
      console.warn(
        "⚠️ Matomo Analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID",
      );
      return;
    }

    initMatomo({
      url: matomoUrl,
      siteId: matomoSiteId,
      enabled: true,
    });
  }, []);

  // Wrap the tracker in Suspense for Next.js 15 compatibility
  return (
    <Suspense fallback={null}>
      <MatomoTracker />
    </Suspense>
  );
}
