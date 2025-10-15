'use client';

/**
 * Social Insights Content Component
 * Displays X.com tweets with filtering and category switching
 */

import { useState, useEffect, useCallback } from 'react';
import { XTweet } from '@/lib/x-api-service';
import TweetCard from './TweetCard';
import CategoryTabs from './CategoryTabs';
import SocialInsightsFilters from './SocialInsightsFilters';
import ErrorBoundary from '@/components/ErrorBoundary';
import { trackXSocialInsights, trackSocialInsightsPerformance, trackSocialInsightsError } from '@/lib/analytics/matomo';

interface SocialInsightsData {
  tweets: XTweet[];
  cached: boolean;
  remaining_requests: number;
  processing_time_ms: number;
}

interface ApiResponse {
  success: boolean;
  data?: {
    tweets: XTweet[];
    metadata: {
      category: string;
      total_tweets: number;
      cached: boolean;
      processing_time_ms: number;
      filters: {
        include_images: boolean;
        min_engagement: number;
        limit: number;
      };
    };
  };
  x_api_status?: {
    remaining_requests: number;
    reset_time: string | null;
    cache_entries: number;
  };
  fallback?: {
    tweets: XTweet[];
    message: string;
  };
  error?: string;
  message?: string;
}

type Category = 'BRICS' | 'Indonesia' | 'Bali';

export default function SocialInsightsContent() {
  const [activeCategory, setActiveCategory] = useState<Category>('BRICS');
  const [data, setData] = useState<SocialInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeImages, setIncludeImages] = useState(true);
  const [minEngagement, setMinEngagement] = useState(5);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSocialInsights = useCallback(async (
    category: Category = activeCategory,
    images: boolean = includeImages,
    engagement: number = minEngagement
  ) => {
    try {
      setError(null);
      const params = new URLSearchParams({
        category,
        limit: '20',
        images: images.toString(),
        min_engagement: engagement.toString()
      });

      const response = await fetch(`/api/x-news?${params}`);
      const result: ApiResponse = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (result.fallback && result.fallback.tweets.length === 0) {
          setError(result.message || 'Social insights temporarily unavailable');
          setData({ tweets: [], cached: false, remaining_requests: 0, processing_time_ms: 0 });
        } else {
          throw new Error(result.message || 'Failed to fetch social insights');
        }
        return;
      }

      if (result.success && result.data) {
        setData({
          tweets: result.data.tweets,
          cached: result.data.metadata.cached,
          remaining_requests: result.x_api_status?.remaining_requests || 0,
          processing_time_ms: result.data.metadata.processing_time_ms
        });
        
        // Track performance in Matomo
        trackSocialInsightsPerformance({
          category,
          tweetsLoaded: result.data.tweets.length,
          loadTime: result.data.metadata.processing_time_ms,
          cached: result.data.metadata.cached,
          apiRemainingRequests: result.x_api_status?.remaining_requests
        });
        
        // Show success message if cached
        if (result.data.metadata.cached && !refreshing) {
          console.log('✅ Loaded from cache for better performance');
        }
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('❌ Error fetching social insights:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load social insights';
      
      // Track error in Matomo
      trackSocialInsightsError({
        errorType: errorMessage.includes('rate limit') ? 'rate_limit' : 
                  errorMessage.includes('ENOTFOUND') ? 'network_error' : 'api_error',
        errorMessage,
        category,
        context: { images, engagement }
      });
      
      setError(errorMessage);
      setData({ tweets: [], cached: false, remaining_requests: 0, processing_time_ms: 0 });
    }
  }, [activeCategory, includeImages, minEngagement, refreshing]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchSocialInsights().finally(() => {
      setLoading(false);
    });
  }, [fetchSocialInsights]);

  // Handle category change
  const handleCategoryChange = useCallback((category: Category) => {
    if (category === activeCategory) return;
    
    // Track category switch in Matomo
    trackXSocialInsights({
      action: 'category_switch',
      category,
    });
    
    setActiveCategory(category);
    setLoading(true);
    fetchSocialInsights(category).finally(() => {
      setLoading(false);
    });
  }, [activeCategory, fetchSocialInsights]);

  // Handle filter changes
  const handleFiltersChange = useCallback((filters: { includeImages: boolean; minEngagement: number }) => {
    // Track filter change in Matomo
    trackXSocialInsights({
      action: 'filter_change',
      category: activeCategory,
      engagement: filters.minEngagement
    });
    
    setIncludeImages(filters.includeImages);
    setMinEngagement(filters.minEngagement);
    setLoading(true);
    fetchSocialInsights(activeCategory, filters.includeImages, filters.minEngagement).finally(() => {
      setLoading(false);
    });
  }, [activeCategory, fetchSocialInsights]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    // Track refresh in Matomo
    trackXSocialInsights({
      action: 'refresh',
      category: activeCategory,
    });
    
    setRefreshing(true);
    await fetchSocialInsights();
    setRefreshing(false);
  }, [fetchSocialInsights, activeCategory]);

  // Render loading state
  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-600 dark:text-zinc-300">
              Loading social insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Category Navigation */}
        <CategoryTabs 
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          loading={loading}
        />

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SocialInsightsFilters
            includeImages={includeImages}
            minEngagement={minEngagement}
            onFiltersChange={handleFiltersChange}
            disabled={loading}
          />
          
          {/* Refresh Button & Stats */}
          <div className="flex items-center gap-4">
            {data && (
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                {data.tweets.length} insights
                {data.cached && ' (cached)'}
                {data.processing_time_ms > 0 && ` • ${data.processing_time_ms}ms`}
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg transition-colors text-sm"
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-500 mt-0.5">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Social Insights Unavailable
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  {error}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setError(null)}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 px-3 py-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Grid */}
        {data && data.tweets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        ) : !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-300 mb-2">
              No insights found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              Try adjusting the filters or switching to a different category.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Content
            </button>
          </div>
        )}

        {/* Loading Overlay for Refresh */}
        {loading && data && (
          <div className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-zinc-700 dark:text-zinc-300">
                  Loading {activeCategory} insights...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}