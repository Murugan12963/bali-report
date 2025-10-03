"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initMatomo, trackPageView } from "@/lib/analytics/matomo";

/**
 * Matomo Analytics Component
 * Automatically tracks page views on route changes
 */
export default function MatomoAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
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

  useEffect(() => {
    // Track page views on route changes
    if (pathname) {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  // No UI rendered - this is a tracking-only component
  return null;
}
