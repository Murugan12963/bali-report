"use client";

import { useEffect, useState } from "react";
import {
  getAnalyticsDashboardData,
  analyticsStorage,
  type AnalyticsDashboardData,
} from "@/lib/analytics/analytics-service";

/**
 * Advanced Analytics Dashboard
 * Comprehensive metrics visualization for Bali Report
 */
export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [timeRange, setTimeRange] = useState(30); // Days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = () => {
    setLoading(true);
    try {
      const analyticsData = getAnalyticsDashboardData(timeRange);
      setData(analyticsData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const jsonData = analyticsStorage.exportData();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bali-report-analytics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all analytics data? This cannot be undone.",
      )
    ) {
      analyticsStorage.clearAll();
      loadAnalytics();
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-teal-500 text-xl">Loading analytics...</div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-400 to-orange-400 bg-clip-text text-transparent">
              📊 Analytics Dashboard
            </h1>
            <p className="text-zinc-400 mt-2">
              Comprehensive metrics for Bali Report
            </p>
          </div>

          <div className="flex gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Export Data
            </button>

            {/* Clear Button */}
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Clear Data
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Events"
            value={formatNumber(data.summary.totalEvents)}
            icon="📈"
            trend="+12%"
          />
          <StatCard
            title="Page Views"
            value={formatNumber(data.pageViews.totalViews)}
            icon="👁️"
            trend="+8%"
          />
          <StatCard
            title="Article Views"
            value={formatNumber(data.articles.totalViews)}
            icon="📰"
            trend="+15%"
          />
          <StatCard
            title="User Engagement"
            value={formatNumber(
              data.engagement.totalVotes + data.engagement.totalShares,
            )}
            icon="💬"
            trend="+23%"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Page Views Section */}
          <DashboardCard title="📄 Top Pages">
            <div className="space-y-3">
              {data.pageViews.topPages.map((page, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-teal-400 font-mono text-sm">
                      #{idx + 1}
                    </span>
                    <span className="text-zinc-300 text-sm truncate max-w-xs">
                      {page.path}
                    </span>
                  </div>
                  <span className="text-orange-400 font-semibold">
                    {formatNumber(page.views)}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Top Articles Section */}
          <DashboardCard title="⭐ Top Articles">
            <div className="space-y-3">
              {data.articles.topArticles.slice(0, 5).map((article, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-zinc-300 text-sm font-medium line-clamp-2">
                      {article.title}
                    </span>
                    <span className="text-orange-400 font-semibold ml-2">
                      {formatNumber(article.views)}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-teal-900/50 text-teal-300 rounded">
                      {article.category}
                    </span>
                    <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded">
                      {article.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Views by Category */}
          <DashboardCard title="📊 Views by Category">
            <div className="space-y-3">
              {Object.entries(data.articles.viewsByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([category, count], idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{category}</span>
                      <span className="text-teal-400 font-semibold">
                        {formatNumber(count)}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-orange-500"
                        style={{
                          width: `${(count / data.articles.totalViews) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </DashboardCard>

          {/* Views by Source */}
          <DashboardCard title="📡 Views by Source">
            <div className="space-y-3">
              {Object.entries(data.articles.viewsBySource)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([source, count], idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-300">{source}</span>
                      <span className="text-orange-400 font-semibold">
                        {formatNumber(count)}
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-teal-500"
                        style={{
                          width: `${(count / data.articles.totalViews) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </DashboardCard>

          {/* User Engagement */}
          <DashboardCard title="💡 User Engagement">
            <div className="grid grid-cols-2 gap-4">
              <EngagementStat
                label="Total Votes"
                value={formatNumber(data.engagement.totalVotes)}
                icon="👍"
              />
              <EngagementStat
                label="Total Shares"
                value={formatNumber(data.engagement.totalShares)}
                icon="📤"
              />
              <EngagementStat
                label="Searches"
                value={formatNumber(data.engagement.totalSearches)}
                icon="🔍"
              />
              <EngagementStat
                label="Signups"
                value={formatNumber(data.engagement.newsletterSignups)}
                icon="✉️"
              />
            </div>
          </DashboardCard>

          {/* Conversions */}
          <DashboardCard title="💰 Conversions & Revenue">
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400 mb-1">Donations</div>
                <div className="text-2xl font-bold text-teal-400">
                  {formatCurrency(data.conversions.donations.totalAmount)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {data.conversions.donations.count} donations •{" "}
                  {formatCurrency(data.conversions.donations.avgAmount)} avg
                </div>
              </div>

              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400 mb-1">Subscriptions</div>
                <div className="text-2xl font-bold text-orange-400">
                  {formatCurrency(data.conversions.subscriptions.totalRevenue)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {data.conversions.subscriptions.count} subscriptions •{" "}
                  {formatCurrency(data.conversions.subscriptions.avgRevenue)}{" "}
                  avg
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-teal-900/30 to-orange-900/30 rounded-lg border border-teal-500/20">
                <div className="text-sm text-zinc-400 mb-1">
                  Conversion Rate
                </div>
                <div className="text-3xl font-bold text-white">
                  {data.conversions.conversionRate.toFixed(2)}%
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* System Health */}
        <DashboardCard title="🔧 System Health & RSS Performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-900 rounded-lg">
              <div className="text-sm text-zinc-400 mb-2">RSS Reliability</div>
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {data.system.rssFetchSuccess > data.system.rssFetchFailed
                    ? "✅"
                    : "⚠️"}
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-400">
                    {formatNumber(data.system.rssFetchSuccess)}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Success / {formatNumber(data.system.rssFetchFailed)} Failed
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 rounded-lg">
              <div className="text-sm text-zinc-400 mb-2">
                Articles Aggregated
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {formatNumber(data.system.totalArticlesAggregated)}
              </div>
              <div className="text-xs text-zinc-500">
                {formatNumber(data.system.avgArticlesPerFetch)} avg per fetch
              </div>
            </div>

            <div className="p-4 bg-zinc-900 rounded-lg">
              <div className="text-sm text-zinc-400 mb-2">System Errors</div>
              <div className="text-3xl font-bold text-red-400 mb-1">
                {formatNumber(
                  data.system.errors.reduce((sum, e) => sum + e.count, 0),
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {data.system.errors.length} error types
              </div>
            </div>
          </div>

          {data.system.errors.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-zinc-400 mb-2">Error Breakdown</div>
              {data.system.errors.slice(0, 5).map((error, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-red-900/20 border border-red-500/20 rounded"
                >
                  <span className="text-zinc-300 text-sm">{error.type}</span>
                  <span className="text-red-400 font-semibold">
                    {error.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        {/* Time Series Chart */}
        <DashboardCard title="📈 Activity Timeline">
          <div className="h-64 relative">
            <TimeSeriesChart data={data.timeSeries} />
          </div>
        </DashboardCard>

        {/* Footer Info */}
        <div className="mt-8 text-center text-zinc-500 text-sm">
          <p>
            Last updated:{" "}
            {new Date(data.summary.lastUpdated).toLocaleString()}
          </p>
          <p className="mt-1">
            Data retention: 90 days • Max events: 10,000
          </p>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTS ====================

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: string;
  trend?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      {trend && (
        <div className="text-sm text-teal-400 font-medium">{trend}</div>
      )}
    </div>
  );
}

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function EngagementStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="p-4 bg-zinc-800 rounded-lg text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-zinc-400">{label}</div>
    </div>
  );
}

function TimeSeriesChart({
  data,
}: {
  data: AnalyticsDashboardData["timeSeries"];
}) {
  const maxValue = Math.max(
    ...data.map((d) =>
      Math.max(d.pageViews, d.articleViews, d.votes, d.shares),
    ),
  );

  return (
    <div className="h-full flex items-end justify-between gap-1 p-4">
      {data.map((day, idx) => {
        const total = day.pageViews + day.articleViews + day.votes + day.shares;
        const height = maxValue > 0 ? (total / maxValue) * 100 : 0;

        return (
          <div
            key={idx}
            className="flex-1 relative group"
          >
            <div
              className="bg-gradient-to-t from-teal-500 to-orange-500 rounded-t transition-all hover:opacity-80"
              style={{ height: `${height}%` }}
            />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="text-white font-semibold">{day.date}</div>
              <div className="text-zinc-400">Views: {day.pageViews}</div>
              <div className="text-zinc-400">Articles: {day.articleViews}</div>
              <div className="text-zinc-400">Votes: {day.votes}</div>
              <div className="text-zinc-400">Shares: {day.shares}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
