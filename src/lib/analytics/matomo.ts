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

  // Track page view and enable link tracking
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  
  // Configure tracker with Matomo Cloud setup
  const u = "https://balireport.matomo.cloud/";
  _paq.push(['setTrackerUrl', u + 'matomo.php']);
  _paq.push(['setSiteId', '1']);
  _paq.push(["setDoNotTrack", true]); // Respect DNT header

  // Load Matomo script from CDN
  const script = document.createElement("script");
  script.async = true;
  script.src = 'https://cdn.matomo.cloud/balireport.matomo.cloud/matomo.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  console.log("✅ Matomo Analytics initialized with balireport.matomo.cloud");
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
 * Track outbound link with additional context
 */
export function trackOutboundLink(
  linkCategory: string,
  additionalData?: Record<string, any>
): void {
  if (typeof window === "undefined" || !window._paq) return;

  const _paq = window._paq;
  
  // Track as event with category and additional context
  trackEvent({
    category: "Outbound Link",
    action: linkCategory,
    name: additionalData ? JSON.stringify(additionalData) : undefined,
  });
  
  console.log("📊 Matomo: Outbound link tracked", { linkCategory, additionalData });
}

/**
 * Track X.com social insights interaction
 */
export function trackXSocialInsights({
  action,
  category,
  tweetId,
  relevanceScore,
  engagement,
  source = 'social_insights'
}: {
  action: 'view' | 'click' | 'filter_change' | 'refresh' | 'category_switch';
  category: 'BRICS' | 'Indonesia' | 'Bali';
  tweetId?: string;
  relevanceScore?: number;
  engagement?: number;
  source?: string;
}): void {
  trackEvent({
    category: "X Social Insights",
    action: action,
    name: `${category}${tweetId ? ` - ${tweetId}` : ''}`,
    value: relevanceScore || engagement || undefined
  });

  // Set custom dimensions for social insights
  if (typeof window !== "undefined" && window._paq) {
    window._paq.push(["setCustomDimension", 5, category]); // Social insights category
    window._paq.push(["setCustomDimension", 6, source]); // Social insights source
    
    if (relevanceScore) {
      window._paq.push(["setCustomDimension", 7, relevanceScore.toString()]); // Relevance score
    }
  }
}

/**
 * Track social insights page performance
 */
export function trackSocialInsightsPerformance({
  category,
  tweetsLoaded,
  loadTime,
  cached,
  apiRemainingRequests
}: {
  category: string;
  tweetsLoaded: number;
  loadTime: number;
  cached: boolean;
  apiRemainingRequests?: number;
}): void {
  trackEvent({
    category: "Social Insights Performance",
    action: cached ? "Cache Hit" : "API Call",
    name: `${category} - ${tweetsLoaded} tweets`,
    value: loadTime
  });

  // Track API usage statistics
  if (apiRemainingRequests !== undefined) {
    trackEvent({
      category: "X API Usage",
      action: "Remaining Requests",
      name: category,
      value: apiRemainingRequests
    });
  }
}

/**
 * Track social insights error
 */
export function trackSocialInsightsError({
  errorType,
  errorMessage,
  category,
  context
}: {
  errorType: 'api_error' | 'rate_limit' | 'network_error' | 'parse_error';
  errorMessage: string;
  category?: string;
  context?: Record<string, any>;
}): void {
  trackEvent({
    category: "Social Insights Error",
    action: errorType,
    name: `${category || 'unknown'}: ${errorMessage.substring(0, 100)}`,
  });

  if (context) {
    console.log("📊 Matomo: Social insights error tracked", { errorType, errorMessage, category, context });
  }
}

/**
 * Get Matomo tracking instance
 */
export function getMatomoInstance() {
  if (typeof window === "undefined") return null;
  return window._paq;
}
