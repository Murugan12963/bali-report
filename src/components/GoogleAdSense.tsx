"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseConfig {
  client: string;
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense Ad Unit Component
 *
 * Args:
 *   client: Your AdSense client ID (ca-pub-XXXXXXXXXXXXXXXX)
 *   slot: The ad unit ID
 *   format: Ad format type
 *   responsive: Whether the ad should be responsive
 */
export function GoogleAdSense({
  client,
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = {},
}: AdSenseConfig) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  if (!client || !slot) {
    console.warn("AdSense: Missing client or slot ID");
    return null;
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{
        display: "block",
        ...style,
      }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}

/**
 * AdSense Script Loader
 * Add this once in your layout or _app file
 */
export function AdSenseScript({ client }: { client: string }) {
  useEffect(() => {
    if (!client) return;

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    // Check if script is already loaded
    if (!document.querySelector(`script[src*="${client}"]`)) {
      document.head.appendChild(script);
    }
  }, [client]);

  if (!client) return null;

  return null; // Script is loaded via useEffect
}

/**
 * Pre-configured Ad Components for common placements
 */

// Leaderboard Banner (728x90)
export function LeaderboardAd() {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT;

  if (!client || !slot) return null;

  return (
    <div className="ad-container leaderboard-ad my-4">
      <GoogleAdSense
        client={client}
        slot={slot}
        format="horizontal"
        style={{ minHeight: "90px" }}
      />
    </div>
  );
}

// Sidebar Rectangle (300x250)
export function SidebarAd() {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT;

  if (!client || !slot) return null;

  return (
    <div className="ad-container sidebar-ad my-4">
      <GoogleAdSense
        client={client}
        slot={slot}
        format="rectangle"
        style={{ minHeight: "250px" }}
      />
    </div>
  );
}

// Native In-feed Ad
export function InFeedAd() {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT;

  if (!client || !slot) return null;

  return (
    <div className="ad-container in-feed-ad my-4">
      <GoogleAdSense
        client={client}
        slot={slot}
        format="fluid"
        style={{ minHeight: "100px" }}
      />
    </div>
  );
}

// Responsive Display Ad
export function ResponsiveAd() {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
  const slot = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_RESPONSIVE_SLOT;

  if (!client || !slot) return null;

  return (
    <div className="ad-container responsive-ad my-4">
      <GoogleAdSense
        client={client}
        slot={slot}
        format="auto"
        responsive={true}
      />
    </div>
  );
}
