"use client";

import { useEffect, useState } from "react";

/**
 * GoogleAds component for displaying Google AdSense ads.
 * Supports development placeholders and production Google AdSense integration.
 */
interface GoogleAdsProps {
  type: "banner" | "leaderboard" | "sidebar" | "native" | "responsive";
  className?: string;
  adSlot?: string; // Google AdSense ad slot ID for production
}

const GoogleAds: React.FC<GoogleAdsProps> = ({
  type,
  className = "",
  adSlot,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  /**
   * Load Google AdSense script and initialize ad.
   *
   * Returns:
   *   void: Initializes Google AdSense in production.
   */
  const loadGoogleAd = async () => {
    try {
      // Check if Google AdSense script is already loaded
      if (!(window as Window & { adsbygoogle?: unknown[] }).adsbygoogle) {
        // Load Google AdSense script
        const script = document.createElement("script");
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}`;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => initializeAd();
        script.onerror = () => setHasError(true);
        document.head.appendChild(script);
      } else {
        initializeAd();
      }
    } catch (error) {
      console.error("Failed to load Google AdSense:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    // Production Google AdSense integration
    if (process.env.NODE_ENV === "production" && adSlot) {
      loadGoogleAd();
    } else {
      // Development logging
      console.log(
        `Google AdSense ${type} ad would load here with slot ID: ${adSlot || "NOT_SET"}`,
      );
      setIsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, adSlot]);

  /**
   * Initialize Google AdSense ad unit.
   *
   * Returns:
   *   void: Creates ad unit in the container.
   */
  const initializeAd = () => {
    try {
      if (adSlot) {
        // Push ad to AdSense queue
        const w = window as Window & { adsbygoogle?: unknown[] };
        (w.adsbygoogle = w.adsbygoogle || []).push({});
        console.log(`Initializing Google AdSense ${type} with slot ${adSlot}`);
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to initialize Google AdSense:", error);
      setHasError(true);
    }
  };

  // Get ad configuration based on type
  const getAdConfig = () => {
    switch (type) {
      case "banner":
        return {
          dimensions: "728x90",
          position: "Banner Advertisement",
          defaultSlot: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_BANNER_SLOT,
          format: "horizontal" as const,
          style: { display: "inline-block", width: "728px", height: "90px" },
        };
      case "leaderboard":
        return {
          dimensions: "728x90",
          position: "Leaderboard Advertisement",
          defaultSlot: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT,
          format: "horizontal" as const,
          style: { display: "inline-block", width: "728px", height: "90px" },
        };
      case "sidebar":
        return {
          dimensions: "300x250",
          position: "Sidebar Advertisement",
          defaultSlot: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT,
          format: "rectangle" as const,
          style: { display: "inline-block", width: "300px", height: "250px" },
        };
      case "native":
        return {
          dimensions: "Native",
          position: "Native Advertisement",
          defaultSlot: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT,
          format: "fluid" as const,
          style: { display: "block" },
        };
      case "responsive":
        return {
          dimensions: "Responsive",
          position: "Responsive Advertisement",
          defaultSlot: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_RESPONSIVE_SLOT,
          format: "auto" as const,
          style: { display: "block" },
        };
      default:
        return {
          dimensions: "300x250",
          position: "Advertisement",
          defaultSlot: process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_DEFAULT_SLOT,
          format: "rectangle" as const,
          style: { display: "inline-block", width: "300px", height: "250px" },
        };
    }
  };

  const adConfig = getAdConfig();
  const effectiveAdSlot = adSlot || adConfig.defaultSlot;

  // Error state
  if (hasError) {
    return (
      <div
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-sm p-4 theme-transition ${className}`}
      >
        <div className="text-center">
          <div className="font-medium mb-1">⚠️ Ad Load Error</div>
          <div className="text-xs text-red-500 dark:text-red-400">
            Google AdSense failed to load
          </div>
        </div>
      </div>
    );
  }

  // Development placeholder
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-sm theme-transition ${className}`}
        style={{
          minHeight:
            type === "banner" || type === "leaderboard"
              ? "90px"
              : type === "responsive"
                ? "100px"
                : type === "native"
                  ? "120px"
                  : "250px",
          width: type === "sidebar" ? "300px" : "100%",
        }}
        onClick={() => console.log(`Clicked on ${type} ad placeholder`)}
      >
        <div className="text-center p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors theme-transition">
          <div className="font-medium mb-1">📢 {adConfig.position}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {adConfig.dimensions}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Slot:{" "}
            {effectiveAdSlot ? effectiveAdSlot.slice(0, 10) + "..." : "Not Set"}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            ✅ Google AdSense Ready
          </div>
        </div>
      </div>
    );
  }

  // Production ad container
  return (
    <div
      className={`google-ads-container ${className} ${!isLoaded ? "animate-pulse bg-gray-100 dark:bg-gray-800" : ""} theme-transition`}
      data-ad-type={type}
      data-ad-slot={effectiveAdSlot}
    >
      <ins
        className="adsbygoogle"
        style={{
          ...adConfig.style,
          minHeight:
            type === "banner" || type === "leaderboard"
              ? "90px"
              : type === "responsive"
                ? "100px"
                : type === "native"
                  ? "120px"
                  : "250px",
          width: type === "sidebar" ? "300px" : "100%",
        }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT}
        data-ad-slot={effectiveAdSlot}
        data-ad-format={adConfig.format}
        data-full-width-responsive={type === "responsive" ? "true" : "false"}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm theme-transition">
          Loading Google Ad...
        </div>
      )}
    </div>
  );
};

export default GoogleAds;
