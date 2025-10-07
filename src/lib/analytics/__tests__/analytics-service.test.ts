/**
 * Unit tests for Analytics Service
 */

import {
  analyticsStorage,
  trackAnalyticsPageView,
  trackAnalyticsArticleView,
  trackAnalyticsSearch,
  trackAnalyticsVote,
  trackAnalyticsShare,
  trackAnalyticsDonation,
  trackAnalyticsSubscription,
  trackAnalyticsRSSFetch,
  getAnalyticsDashboardData,
  getAnalyticsSummary,
  type AnalyticsEvent,
} from "../analytics-service";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock Matomo trackEvent
jest.mock("../matomo", () => ({
  trackEvent: jest.fn(),
}));

describe("AnalyticsStorage", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("should store and retrieve events", () => {
    analyticsStorage.addEvent({
      type: "pageview",
      category: "Page",
      action: "View",
      label: "/test",
    });

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("pageview");
    expect(events[0].label).toBe("/test");
  });

  test("should generate unique IDs for events", () => {
    analyticsStorage.addEvent({
      type: "pageview",
      category: "Page",
      action: "View",
    });

    analyticsStorage.addEvent({
      type: "pageview",
      category: "Page",
      action: "View",
    });

    const events = analyticsStorage.getEvents();
    expect(events[0].id).not.toBe(events[1].id);
  });

  test("should add timestamps to events", () => {
    const beforeTime = Date.now();

    analyticsStorage.addEvent({
      type: "pageview",
      category: "Page",
      action: "View",
    });

    const afterTime = Date.now();
    const events = analyticsStorage.getEvents();

    expect(events[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(events[0].timestamp).toBeLessThanOrEqual(afterTime);
  });

  test("should clear all analytics data", () => {
    analyticsStorage.addEvent({
      type: "pageview",
      category: "Page",
      action: "View",
    });

    expect(analyticsStorage.getEvents()).toHaveLength(1);

    analyticsStorage.clearAll();
    expect(analyticsStorage.getEvents()).toHaveLength(0);
  });

  test("should export and import data", () => {
    analyticsStorage.addEvent({
      type: "pageview",
      category: "Page",
      action: "View",
      label: "/test",
    });

    const exported = analyticsStorage.exportData();
    expect(exported).toContain("pageview");
    expect(exported).toContain("/test");

    analyticsStorage.clearAll();
    expect(analyticsStorage.getEvents()).toHaveLength(0);

    const imported = analyticsStorage.importData(exported);
    expect(imported).toBe(true);
    expect(analyticsStorage.getEvents()).toHaveLength(1);
  });

  test("should limit events to MAX_EVENTS", () => {
    // Add 10,005 events (max is 10,000)
    for (let i = 0; i < 10005; i++) {
      analyticsStorage.addEvent({
        type: "pageview",
        category: "Page",
        action: "View",
        label: `/page-${i}`,
      });
    }

    const events = analyticsStorage.getEvents();
    expect(events.length).toBeLessThanOrEqual(10000);
  });
});

describe("Analytics Tracking Functions", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("trackAnalyticsPageView should store page view event", () => {
    trackAnalyticsPageView("/test-page", "Test Page");

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("pageview");
    expect(events[0].label).toBe("/test-page");
    expect(events[0].metadata?.title).toBe("Test Page");
  });

  test("trackAnalyticsArticleView should store article view event", () => {
    trackAnalyticsArticleView(
      "Test Article",
      "BRICS",
      "RT News",
      "https://example.com/article",
    );

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("article_view");
    expect(events[0].metadata?.category).toBe("BRICS");
    expect(events[0].metadata?.source).toBe("RT News");
  });

  test("trackAnalyticsSearch should store search event with result count", () => {
    trackAnalyticsSearch("BRICS summit", 42);

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("search");
    expect(events[0].label).toBe("BRICS summit");
    expect(events[0].value).toBe(42);
  });

  test("trackAnalyticsVote should store vote events", () => {
    trackAnalyticsVote("article-123", "upvote");
    trackAnalyticsVote("article-456", "downvote");

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe("vote");
    expect(events[0].metadata?.voteType).toBe("upvote");
    expect(events[1].metadata?.voteType).toBe("downvote");
  });

  test("trackAnalyticsShare should store share events", () => {
    trackAnalyticsShare("twitter", "Amazing Article");

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("share");
    expect(events[0].label).toBe("twitter");
    expect(events[0].metadata?.articleTitle).toBe("Amazing Article");
  });

  test("trackAnalyticsDonation should store donation with amount", () => {
    trackAnalyticsDonation(50, "BRICS Harvest Challenge");

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("donation");
    expect(events[0].value).toBe(50);
    expect(events[0].metadata?.campaign).toBe("BRICS Harvest Challenge");
  });

  test("trackAnalyticsSubscription should store subscription with amount", () => {
    trackAnalyticsSubscription("Premium", 5);

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("subscription");
    expect(events[0].value).toBe(5);
    expect(events[0].metadata?.plan).toBe("Premium");
  });

  test("trackAnalyticsRSSFetch should store RSS fetch events", () => {
    trackAnalyticsRSSFetch("RT News", true, 125);
    trackAnalyticsRSSFetch("TASS", false, 0);

    const events = analyticsStorage.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].metadata?.success).toBe(true);
    expect(events[0].value).toBe(125);
    expect(events[1].metadata?.success).toBe(false);
  });
});

describe("Analytics Aggregation", () => {
  beforeEach(() => {
    localStorageMock.clear();

    // Create mock data
    const now = Date.now();

    // Page views
    for (let i = 0; i < 100; i++) {
      analyticsStorage.addEvent({
        type: "pageview",
        category: "Page",
        action: "View",
        label: i < 50 ? "/" : "/brics",
        timestamp: now - i * 60 * 1000, // Spread over last 100 minutes
      } as any);
    }

    // Article views
    for (let i = 0; i < 50; i++) {
      analyticsStorage.addEvent({
        type: "article_view",
        category: "Article",
        action: "View",
        label: `Article ${i}`,
        metadata: {
          title: `Article ${i}`,
          category: i < 25 ? "BRICS" : "Indonesia",
          source: i < 15 ? "RT News" : "TASS",
        },
        timestamp: now - i * 60 * 1000,
      } as any);
    }

    // Votes
    for (let i = 0; i < 30; i++) {
      analyticsStorage.addEvent({
        type: "vote",
        category: "Engagement",
        action: "Vote",
        label: i < 20 ? "upvote" : "downvote",
        timestamp: now - i * 60 * 1000,
      } as any);
    }

    // Donations
    analyticsStorage.addEvent({
      type: "donation",
      category: "Conversion",
      action: "Donation",
      value: 50,
      timestamp: now - 60 * 1000,
    } as any);

    analyticsStorage.addEvent({
      type: "donation",
      category: "Conversion",
      action: "Donation",
      value: 100,
      timestamp: now - 120 * 1000,
    } as any);

    // RSS Fetches
    analyticsStorage.addEvent({
      type: "rss_fetch",
      category: "System",
      action: "RSS Fetch Success",
      value: 125,
      metadata: { success: true },
      timestamp: now - 30 * 1000,
    } as any);
  });

  test("getAnalyticsDashboardData should return complete metrics", () => {
    const data = getAnalyticsDashboardData(30);

    expect(data.summary.totalEvents).toBeGreaterThan(0);
    expect(data.pageViews.totalViews).toBe(100);
    expect(data.articles.totalViews).toBe(50);
    expect(data.engagement.totalVotes).toBe(30);
  });

  test("should calculate top pages correctly", () => {
    const data = getAnalyticsDashboardData(30);

    expect(data.pageViews.topPages).toHaveLength(2);
    expect(data.pageViews.topPages[0].path).toBe("/");
    expect(data.pageViews.topPages[0].views).toBe(50);
  });

  test("should calculate views by category", () => {
    const data = getAnalyticsDashboardData(30);

    expect(data.articles.viewsByCategory["BRICS"]).toBe(25);
    expect(data.articles.viewsByCategory["Indonesia"]).toBe(25);
  });

  test("should calculate views by source", () => {
    const data = getAnalyticsDashboardData(30);

    expect(data.articles.viewsBySource["RT News"]).toBe(15);
    expect(data.articles.viewsBySource["TASS"]).toBe(35);
  });

  test("should calculate conversion metrics", () => {
    const data = getAnalyticsDashboardData(30);

    expect(data.conversions.donations.count).toBe(2);
    expect(data.conversions.donations.totalAmount).toBe(150);
    expect(data.conversions.donations.avgAmount).toBe(75);
  });

  test("should calculate system metrics", () => {
    const data = getAnalyticsDashboardData(30);

    expect(data.system.rssFetchSuccess).toBe(1);
    expect(data.system.totalArticlesAggregated).toBe(125);
    expect(data.system.avgArticlesPerFetch).toBe(125);
  });

  test("should generate time series data", () => {
    const data = getAnalyticsDashboardData(7);

    expect(data.timeSeries).toHaveLength(7);
    expect(data.timeSeries[0]).toHaveProperty("date");
    expect(data.timeSeries[0]).toHaveProperty("pageViews");
    expect(data.timeSeries[0]).toHaveProperty("articleViews");
  });

  test("getAnalyticsSummary should return 7-day summary", () => {
    const summary = getAnalyticsSummary();

    expect(summary).toHaveProperty("weeklyPageViews");
    expect(summary).toHaveProperty("weeklyArticleViews");
    expect(summary).toHaveProperty("weeklyVotes");
    expect(summary).toHaveProperty("conversionRate");
  });
});

describe("Data Retention", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("should filter out events older than retention period", () => {
    const now = Date.now();
    const ninetyOneDaysAgo = now - 91 * 24 * 60 * 60 * 1000;

    // Manually add old event to localStorage to simulate old data
    const oldEvent = {
      id: "old-event-123",
      type: "pageview",
      category: "Page",
      action: "View",
      label: "/old-page",
      timestamp: ninetyOneDaysAgo,
    };

    const newEvent = {
      id: "new-event-456",
      type: "pageview",
      category: "Page",
      action: "View",
      label: "/new-page",
      timestamp: now,
    };

    // Directly set both events in storage
    localStorageMock.setItem(
      "bali_report_analytics",
      JSON.stringify([oldEvent, newEvent]),
    );

    // When we retrieve events, old ones should be filtered out
    const events = analyticsStorage.getEvents();

    // Should only have the recent event (old one filtered out)
    expect(events).toHaveLength(1);
    expect(events[0].label).toBe("/new-page");
  });
});
