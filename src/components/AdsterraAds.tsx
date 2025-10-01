"use client";

import { useEffect, useState } from "react";

interface AdsterraAdsProps {
  type: "banner" | "social-bar" | "native" | "popunder";
  className?: string;
  zoneId?: string; // Adsterra zone ID for the specific ad unit
}

/**
 * AdsterraAds component for displaying different types of Adsterra ads.
 * Supports development placeholders and production Adsterra integration.
 */
const AdsterraAds: React.FC<AdsterraAdsProps> = ({
  type,
  className = "",
  zoneId,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  /**
   * Load Adsterra script and initialize ad.
   *
   * Returns:
   *   void: Initializes Adsterra in production.
   */
  const loadAdsterraAd = async () => {
    try {
      // Check if atag script is already loaded
      if (!document.querySelector('script[src*="atTag"]')) {
        const script = document.createElement("script");
        script.src = "//www.highperformancedformats.com/atTag.js";
        script.async = true;
        script.onload = () => initializeAd();
        script.onerror = () => setHasError(true);
        document.head.appendChild(script);
      } else {
        initializeAd();
      }
    } catch (error) {
      console.error("Failed to load Adsterra:", error);
      setHasError(true);
    }
  };

  useEffect(() => {
    // Production Adsterra integration
    if (process.env.NODE_ENV === "production" && zoneId) {
      loadAdsterraAd();
    } else {
      // Development logging
      console.log(
        `Adsterra ${type} ad would load here with zone ID: ${zoneId || "NOT_SET"}`,
      );
      setIsLoaded(true);
    }
  }, [type, zoneId]);

  /**
   * Initialize Adsterra ad unit.
   *
   * Returns:
   *   void: Creates ad unit in the container.
   */
  const initializeAd = () => {
    try {
      if (zoneId) {
        // Create the specific atag element based on ad type
        const atagScript = document.createElement("script");
        atagScript.textContent = `atag.init(${getAdConfig().script});`;
        document.head.appendChild(atagScript);
        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to initialize Adsterra:", error);
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
          defaultZone: process.env.NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID,
          script: `{ key: "${zoneId}" }`,
          style: { display: "inline-block", width: "728px", height: "90px" },
        };
      case "social-bar":
        return {
          dimensions: "Responsive Social Bar",
          position: "Social Bar Advertisement",
          defaultZone: process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_ZONE_ID,
          script: `{ key: "${zoneId}", format: "social-bar" }`,
          style: { display: "block", width: "100%" },
        };
      case "native":
        return {
          dimensions: "Native Ad",
          position: "Native Advertisement",
          defaultZone: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ZONE_ID,
          script: `{ key: "${zoneId}", format: "native" }`,
          style: { display: "block", width: "100%" },
        };
      case "popunder":
        return {
          dimensions: "Popunder",
          position: "Popunder Advertisement",
          defaultZone: process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_ZONE_ID,
          script: `{ key: "${zoneId}", format: "popunder" }`,
          style: { display: "none" },
        };
      default:
        return {
          dimensions: "300x250",
          position: "Advertisement",
          defaultZone: process.env.NEXT_PUBLIC_ADSTERRA_DEFAULT_ZONE_ID,
          script: `{ key: "${zoneId}" }`,
          style: { display: "inline-block", width: "300px", height: "250px" },
        };
    }
  };

  const adConfig = getAdConfig();
  const effectiveZoneId = zoneId || adConfig.defaultZone;

  // Error state
  if (hasError) {
    return (
      <div
        className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-sm p-4 theme-transition ${className}`}
      >
        <div className="text-center">
          <div className="font-medium mb-1">⚠️ Ad Load Error</div>
          <div className="text-xs text-red-500 dark:text-red-400">
            Adsterra failed to load
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
            type === "banner"
              ? "90px"
              : type === "social-bar" || type === "native"
                ? "120px"
                : "250px",
          width: "100%",
        }}
        onClick={() => console.log(`Clicked on ${type} ad placeholder`)}
      >
        <div className="text-center p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors theme-transition">
          <div className="font-medium mb-1">📢 {adConfig.position}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {adConfig.dimensions}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Zone:{" "}
            {effectiveZoneId ? effectiveZoneId.slice(0, 10) + "..." : "Not Set"}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            ✅ Adsterra Ready
          </div>
        </div>
      </div>
    );
  }

  // Production ad container
  return (
    <div
      className={`adsterra-container ${className} ${!isLoaded ? "animate-pulse bg-gray-100 dark:bg-gray-800" : ""} theme-transition`}
      data-ad-type={type}
      data-ad-zone={effectiveZoneId}
      style={adConfig.style}
    >
      {!isLoaded && (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm theme-transition">
          Loading Adsterra Ad...
        </div>
      )}
    </div>
  );
};

export default AdsterraAds;