/**
 * Matomo Analytics Service
 * Privacy-focused analytics tracking for Bali Report
 */

declare global {
  interface Window {
    _paq?: any[];
  }
}

interface MatomoConfig {
  url: string;
  siteId: string | number;
  enabled?: boolean;
}

interface TrackEventParams {
  category: string;
  action: string;
  name?: string;
  value?: number;
}

interface TrackArticleParams {
  title: string;
  category: string;
  source: string;
  url: string;
}

interface TrackSiteSearchParams {
  query?: string;
  resultCount?: number;
}

/**
 * Initialize Matomo tracking
 */
export function initMatomo(config: MatomoConfig): void {
  if (!config.enabled || typeof window === "undefined") return;

  window._paq = window._paq || [];
  const _paq = window._paq;

  // Configure tracker
  _paq.push(["setTrackerUrl", `${config.url}/matomo.php`]);
  _paq.push(["setSiteId", config.siteId]);
  _paq.push(["enableLinkTracking"]);
  _paq.push(["setDoNotTrack", true]); // Respect DNT header

  // Load Matomo script
  const script = document.createElement("script");
  script.async = true;
  script.src = `${config.url}/matomo.js`;
  document.head.appendChild(script);

  console.log("✅ Matomo Analytics initialized");
}

/**
 * Track page view
 */
export function trackPageView(customTitle?: string): void {
  if (typeof window === "undefined" || !window._paq) return;

  const _paq = window._paq;

  if (customTitle) {
    _paq.push(["setDocumentTitle", customTitle]);
  }

  _paq.push(["trackPageView"]);
  console.log(
    "📊 Matomo: Page view tracked",
    customTitle || window.location.pathname,
  );
}

/**
 * Track custom event
 */
export function trackEvent({
  category,
  action,
  name,
  value,
}: TrackEventParams): void {
  if (typeof window === "undefined" || !window._paq) return;

  const _paq = window._paq!;
  _paq.push(["trackEvent", category, action, name || "", value || 0]);
  console.log("📊 Matomo: Event tracked", { category, action, name, value });
}

/**
 * Track site search
 */
export function trackSiteSearch({
  query,
  resultCount,
}: TrackSiteSearchParams): void {
  if (typeof window === "undefined" || !window._paq) return;

  const _paq = window._paq!;
  _paq.push(["trackSiteSearch", query || "", false, resultCount || 0]);
  console.log("📊 Matomo: Search tracked", { query, resultCount });
}

/**
 * Track article view
 */
export function trackArticleView({
  title,
  category,
  source,
  url,
}: TrackArticleParams): void {
  trackEvent({
    category: "Article",
    action: "View",
    name: `${category} - ${source}: ${title}`,
  });

  // Track as custom dimension if configured
  if (typeof window !== "undefined" && window._paq) {
    window._paq.push(["setCustomDimension", 1, category]); // Article category
    window._paq.push(["setCustomDimension", 2, source]); // Article source
  }
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultCount?: number): void {
  trackSiteSearch({ query, resultCount });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source: string): void {
  trackEvent({
    category: "Newsletter",
    action: "Signup",
    name: source,
  });
}

/**
 * Track donation/subscription conversion
 */
export function trackConversion(
  type: "donation" | "subscription",
  amount: number,
): void {
  trackEvent({
    category: "Conversion",
    action: type === "donation" ? "Donate" : "Subscribe",
    value: amount,
  });
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent({
    category: "CTA",
    action: "Click",
    name: `${ctaName} (${location})`,
  });
}

/**
 * Track user preferences (custom dimensions)
 */
export function trackUserPreferences(
  topics: string[],
  location?: string,
): void {
  if (typeof window === "undefined" || !window._paq) return;

  const _paq = window._paq;
  _paq.push(["setCustomDimension", 3, topics.join(",")]); // User topics
  if (location) {
    _paq.push(["setCustomDimension", 4, location]); // User location
  }
}

/**
 * Track outbound link
 */
export function trackOutboundLink(
  url: string,
  linkType: string = "outbound",
): void {
  if (typeof window === "undefined" || !window._paq) return;

  const _paq = window._paq;
  _paq.push(["trackLink", url, linkType]);
  console.log("📊 Matomo: Outbound link tracked", url);
}

/**
 * Get Matomo tracking instance
 */
export function getMatomoInstance() {
  if (typeof window === "undefined") return null;
  return window._paq;
}
