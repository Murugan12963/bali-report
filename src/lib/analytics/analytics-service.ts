/**
 * Advanced Analytics Service
 * Comprehensive analytics data collection, storage, and aggregation
 */

import { trackEvent } from "./matomo";

// ==================== TYPES ====================

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  type: EventType;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export type EventType =
  | "pageview"
  | "article_view"
  | "search"
  | "vote"
  | "share"
  | "newsletter_signup"
  | "donation"
  | "subscription"
  | "campaign_view"
  | "rss_fetch"
  | "error";

export interface PageViewMetrics {
  totalViews: number;
  uniquePages: number;
  topPages: Array<{ path: string; views: number }>;
  avgTimeOnPage: number;
}

export interface ArticleMetrics {
  totalViews: number;
  topArticles: Array<{
    title: string;
    views: number;
    category: string;
    source: string;
  }>;
  viewsByCategory: Record<string, number>;
  viewsBySource: Record<string, number>;
}

export interface UserEngagementMetrics {
  totalVotes: number;
  totalShares: number;
  totalSearches: number;
  newsletterSignups: number;
  savedArticles: number;
  avgSessionDuration: number;
}

export interface ConversionMetrics {
  donations: {
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  subscriptions: {
    count: number;
    totalRevenue: number;
    avgRevenue: number;
  };
  conversionRate: number;
}

export interface SystemMetrics {
  rssFetchSuccess: number;
  rssFetchFailed: number;
  totalArticlesAggregated: number;
  avgArticlesPerFetch: number;
  errors: Array<{ type: string; count: number }>;
}

export interface AnalyticsDashboardData {
  summary: {
    totalEvents: number;
    dateRange: { start: number; end: number };
    lastUpdated: number;
  };
  pageViews: PageViewMetrics;
  articles: ArticleMetrics;
  engagement: UserEngagementMetrics;
  conversions: ConversionMetrics;
  system: SystemMetrics;
  timeSeries: {
    date: string;
    pageViews: number;
    articleViews: number;
    votes: number;
    shares: number;
  }[];
}

// ==================== STORAGE ====================

const STORAGE_KEY = "bali_report_analytics";
const MAX_EVENTS = 10000; // Keep last 10k events
const RETENTION_DAYS = 90; // Keep data for 90 days

class AnalyticsStorage {
  /**
   * Get all analytics events
   */
  getEvents(): AnalyticsEvent[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const events = JSON.parse(data) as AnalyticsEvent[];
      return this.cleanupOldEvents(events);
    } catch (error) {
      console.error("Failed to load analytics events:", error);
      return [];
    }
  }

  /**
   * Add new analytics event
   */
  addEvent(event: Omit<AnalyticsEvent, "id" | "timestamp">): void {
    if (typeof window === "undefined") return;

    try {
      const events = this.getEvents();

      const newEvent: AnalyticsEvent = {
        ...event,
        id: this.generateId(),
        timestamp: Date.now(),
      };

      events.push(newEvent);

      // Keep only the most recent events
      const trimmedEvents =
        events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error("Failed to save analytics event:", error);
    }
  }

  /**
   * Clear all analytics data
   */
  clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export analytics data
   */
  exportData(): string {
    const events = this.getEvents();
    return JSON.stringify(events, null, 2);
  }

  /**
   * Import analytics data
   */
  importData(jsonData: string): boolean {
    try {
      const events = JSON.parse(jsonData) as AnalyticsEvent[];
      if (!Array.isArray(events)) return false;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
      return true;
    } catch (error) {
      console.error("Failed to import analytics data:", error);
      return false;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up events older than retention period
   */
  private cleanupOldEvents(events: AnalyticsEvent[]): AnalyticsEvent[] {
    const cutoffTime = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return events.filter((event) => event.timestamp > cutoffTime);
  }
}

export const analyticsStorage = new AnalyticsStorage();

// ==================== TRACKING FUNCTIONS ====================

/**
 * Track page view
 */
export function trackAnalyticsPageView(path: string, title?: string): void {
  analyticsStorage.addEvent({
    type: "pageview",
    category: "Page",
    action: "View",
    label: path,
    metadata: { title, path },
  });

  // Also send to Matomo
  trackEvent({
    category: "Page",
    action: "View",
    name: path,
  });
}

/**
 * Track article view
 */
export function trackAnalyticsArticleView(
  title: string,
  category: string,
  source: string,
  url: string,
): void {
  analyticsStorage.addEvent({
    type: "article_view",
    category: "Article",
    action: "View",
    label: title,
    metadata: { title, category, source, url },
  });

  trackEvent({
    category: "Article",
    action: "View",
    name: `${category} - ${source}`,
  });
}

/**
 * Track search query
 */
export function trackAnalyticsSearch(query: string, resultCount: number): void {
  analyticsStorage.addEvent({
    type: "search",
    category: "Search",
    action: "Query",
    label: query,
    value: resultCount,
    metadata: { query, resultCount },
  });

  trackEvent({
    category: "Search",
    action: "Query",
    name: query,
    value: resultCount,
  });
}

/**
 * Track vote
 */
export function trackAnalyticsVote(
  articleId: string,
  voteType: "upvote" | "downvote",
): void {
  analyticsStorage.addEvent({
    type: "vote",
    category: "Engagement",
    action: "Vote",
    label: voteType,
    metadata: { articleId, voteType },
  });

  trackEvent({
    category: "Engagement",
    action: "Vote",
    name: voteType,
  });
}

/**
 * Track share
 */
export function trackAnalyticsShare(
  platform: string,
  articleTitle: string,
): void {
  analyticsStorage.addEvent({
    type: "share",
    category: "Engagement",
    action: "Share",
    label: platform,
    metadata: { platform, articleTitle },
  });

  trackEvent({
    category: "Engagement",
    action: "Share",
    name: platform,
  });
}

/**
 * Track newsletter signup
 */
export function trackAnalyticsNewsletterSignup(source: string): void {
  analyticsStorage.addEvent({
    type: "newsletter_signup",
    category: "Conversion",
    action: "Newsletter Signup",
    label: source,
    metadata: { source },
  });

  trackEvent({
    category: "Conversion",
    action: "Newsletter Signup",
    name: source,
  });
}

/**
 * Track donation
 */
export function trackAnalyticsDonation(amount: number, campaign?: string): void {
  analyticsStorage.addEvent({
    type: "donation",
    category: "Conversion",
    action: "Donation",
    value: amount,
    metadata: { amount, campaign },
  });

  trackEvent({
    category: "Conversion",
    action: "Donation",
    name: campaign,
    value: amount,
  });
}

/**
 * Track subscription
 */
export function trackAnalyticsSubscription(
  plan: string,
  amount: number,
): void {
  analyticsStorage.addEvent({
    type: "subscription",
    category: "Conversion",
    action: "Subscription",
    label: plan,
    value: amount,
    metadata: { plan, amount },
  });

  trackEvent({
    category: "Conversion",
    action: "Subscription",
    name: plan,
    value: amount,
  });
}

/**
 * Track campaign view
 */
export function trackAnalyticsCampaignView(campaignId: string, title: string): void {
  analyticsStorage.addEvent({
    type: "campaign_view",
    category: "Campaign",
    action: "View",
    label: title,
    metadata: { campaignId, title },
  });

  trackEvent({
    category: "Campaign",
    action: "View",
    name: title,
  });
}

/**
 * Track RSS fetch
 */
export function trackAnalyticsRSSFetch(
  source: string,
  success: boolean,
  articleCount: number,
): void {
  analyticsStorage.addEvent({
    type: "rss_fetch",
    category: "System",
    action: success ? "RSS Fetch Success" : "RSS Fetch Failed",
    label: source,
    value: articleCount,
    metadata: { source, success, articleCount },
  });
}

/**
 * Track error
 */
export function trackAnalyticsError(
  errorType: string,
  message: string,
  context?: string,
): void {
  analyticsStorage.addEvent({
    type: "error",
    category: "System",
    action: "Error",
    label: errorType,
    metadata: { errorType, message, context },
  });

  trackEvent({
    category: "System",
    action: "Error",
    name: errorType,
  });
}

// ==================== ANALYTICS AGGREGATION ====================

/**
 * Get comprehensive analytics dashboard data
 */
export function getAnalyticsDashboardData(
  daysBack: number = 30,
): AnalyticsDashboardData {
  const events = analyticsStorage.getEvents();
  const cutoffTime = Date.now() - daysBack * 24 * 60 * 60 * 1000;
  const filteredEvents = events.filter((e) => e.timestamp > cutoffTime);

  return {
    summary: {
      totalEvents: filteredEvents.length,
      dateRange: {
        start: cutoffTime,
        end: Date.now(),
      },
      lastUpdated: Date.now(),
    },
    pageViews: calculatePageViewMetrics(filteredEvents),
    articles: calculateArticleMetrics(filteredEvents),
    engagement: calculateEngagementMetrics(filteredEvents),
    conversions: calculateConversionMetrics(filteredEvents),
    system: calculateSystemMetrics(filteredEvents),
    timeSeries: calculateTimeSeries(filteredEvents, daysBack),
  };
}

function calculatePageViewMetrics(events: AnalyticsEvent[]): PageViewMetrics {
  const pageViews = events.filter((e) => e.type === "pageview");
  const pathCounts: Record<string, number> = {};

  pageViews.forEach((event) => {
    const path = event.label || "unknown";
    pathCounts[path] = (pathCounts[path] || 0) + 1;
  });

  const topPages = Object.entries(pathCounts)
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return {
    totalViews: pageViews.length,
    uniquePages: Object.keys(pathCounts).length,
    topPages,
    avgTimeOnPage: 0, // Would need session tracking
  };
}

function calculateArticleMetrics(events: AnalyticsEvent[]): ArticleMetrics {
  const articleViews = events.filter((e) => e.type === "article_view");
  const articleCounts: Record<string, any> = {};
  const categoryCounts: Record<string, number> = {};
  const sourceCounts: Record<string, number> = {};

  articleViews.forEach((event) => {
    const { title, category, source } = event.metadata || {};
    
    // Article counts
    if (title) {
      if (!articleCounts[title]) {
        articleCounts[title] = { title, views: 0, category, source };
      }
      articleCounts[title].views++;
    }

    // Category counts
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    // Source counts
    if (source) {
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }
  });

  const topArticles = Object.values(articleCounts)
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 10);

  return {
    totalViews: articleViews.length,
    topArticles,
    viewsByCategory: categoryCounts,
    viewsBySource: sourceCounts,
  };
}

function calculateEngagementMetrics(
  events: AnalyticsEvent[],
): UserEngagementMetrics {
  const votes = events.filter((e) => e.type === "vote");
  const shares = events.filter((e) => e.type === "share");
  const searches = events.filter((e) => e.type === "search");
  const signups = events.filter((e) => e.type === "newsletter_signup");

  return {
    totalVotes: votes.length,
    totalShares: shares.length,
    totalSearches: searches.length,
    newsletterSignups: signups.length,
    savedArticles: 0, // Would need separate tracking
    avgSessionDuration: 0, // Would need session tracking
  };
}

function calculateConversionMetrics(
  events: AnalyticsEvent[],
): ConversionMetrics {
  const donations = events.filter((e) => e.type === "donation");
  const subscriptions = events.filter((e) => e.type === "subscription");
  const totalEvents = events.length;

  const donationAmounts = donations.map((e) => e.value || 0);
  const subscriptionAmounts = subscriptions.map((e) => e.value || 0);

  const totalDonations = donationAmounts.reduce((sum, val) => sum + val, 0);
  const totalSubscriptions = subscriptionAmounts.reduce(
    (sum, val) => sum + val,
    0,
  );

  const totalConversions = donations.length + subscriptions.length;
  const conversionRate =
    totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;

  return {
    donations: {
      count: donations.length,
      totalAmount: totalDonations,
      avgAmount:
        donations.length > 0 ? totalDonations / donations.length : 0,
    },
    subscriptions: {
      count: subscriptions.length,
      totalRevenue: totalSubscriptions,
      avgRevenue:
        subscriptions.length > 0
          ? totalSubscriptions / subscriptions.length
          : 0,
    },
    conversionRate,
  };
}

function calculateSystemMetrics(events: AnalyticsEvent[]): SystemMetrics {
  const rssFetches = events.filter((e) => e.type === "rss_fetch");
  const errors = events.filter((e) => e.type === "error");

  const successFetches = rssFetches.filter(
    (e) => e.metadata?.success === true,
  );
  const failedFetches = rssFetches.filter((e) => e.metadata?.success === false);

  const totalArticles = rssFetches.reduce(
    (sum, e) => sum + (e.value || 0),
    0,
  );
  const avgArticles =
    successFetches.length > 0 ? totalArticles / successFetches.length : 0;

  const errorCounts: Record<string, number> = {};
  errors.forEach((e) => {
    const type = e.label || "unknown";
    errorCounts[type] = (errorCounts[type] || 0) + 1;
  });

  return {
    rssFetchSuccess: successFetches.length,
    rssFetchFailed: failedFetches.length,
    totalArticlesAggregated: totalArticles,
    avgArticlesPerFetch: avgArticles,
    errors: Object.entries(errorCounts).map(([type, count]) => ({
      type,
      count,
    })),
  };
}

function calculateTimeSeries(
  events: AnalyticsEvent[],
  daysBack: number,
): AnalyticsDashboardData["timeSeries"] {
  const series: Record<string, any> = {};

  // Initialize all dates
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    series[dateStr] = {
      date: dateStr,
      pageViews: 0,
      articleViews: 0,
      votes: 0,
      shares: 0,
    };
  }

  // Aggregate events by date
  events.forEach((event) => {
    const date = new Date(event.timestamp).toISOString().split("T")[0];
    if (!series[date]) return;

    if (event.type === "pageview") series[date].pageViews++;
    if (event.type === "article_view") series[date].articleViews++;
    if (event.type === "vote") series[date].votes++;
    if (event.type === "share") series[date].shares++;
  });

  return Object.values(series);
}

/**
 * Get analytics summary for quick display
 */
export function getAnalyticsSummary() {
  const data = getAnalyticsDashboardData(7); // Last 7 days

  return {
    weeklyPageViews: data.pageViews.totalViews,
    weeklyArticleViews: data.articles.totalViews,
    weeklyVotes: data.engagement.totalVotes,
    weeklyShares: data.engagement.totalShares,
    weeklyNewsletterSignups: data.engagement.newsletterSignups,
    totalDonations: data.conversions.donations.totalAmount,
    totalSubscriptions: data.conversions.subscriptions.totalRevenue,
    conversionRate: data.conversions.conversionRate.toFixed(2),
  };
}
