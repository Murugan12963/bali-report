'use client';

/**
 * Social Insights Component
 * Displays X/Twitter insights blended with RSS feeds for BRICS-aligned content
 * Features Indonesian regulation compliance and BPD values alignment
 */

import React, { useState, useEffect } from 'react';
import { GrokXInsight, XTweet } from '@/lib/grok-enhanced-service';

interface SocialInsightsProps {
  category: 'brics' | 'indonesia' | 'bali';
  className?: string;
}

interface InsightData {
  insights: GrokXInsight[];
  fallback: boolean;
  disclaimer?: string;
  compliance?: boolean;
  timestamp?: string;
}

export default function SocialInsights({ 
  category, 
  className = '' 
}: SocialInsightsProps) {
  const [insights, setInsights] = useState<InsightData>({
    insights: [],
    fallback: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<number>(0);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Category display names
  const categoryNames = {
    brics: 'BRICS Partnership',
    indonesia: 'Indonesia Focus',
    bali: 'Bali & Local'
  };

  // Category colors for styling
  const categoryColors = {
    brics: 'from-orange-500 to-red-600',
    indonesia: 'from-red-600 to-orange-500', 
    bali: 'from-green-500 to-teal-600'
  };

  useEffect(() => {
    fetchSocialInsights();
    
    // Auto-refresh every 30 minutes if enabled
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(fetchSocialInsights, 30 * 60 * 1000);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [category, autoRefresh]);

  const fetchSocialInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/grok-enhanced?action=social-insights&category=${category}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: InsightData = await response.json();
      setInsights(data);
      
      // Track analytics event
      if (typeof window !== 'undefined' && (window as any)._paq) {
        (window as any)._paq.push([
          'trackEvent', 
          'Grok Integration', 
          'Social Insights', 
          category.toUpperCase(),
          data.insights.length
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch social insights:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Use fallback data
      setInsights({
        insights: [],
        fallback: true,
        disclaimer: 'Konten ini mematuhi regulasi Indonesia dan nilai-nilai BPD.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSocialInsights();
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      });
    } catch {
      return 'Unknown time';
    }
  };

  const getTweetEngagementColor = (engagement: number) => {
    if (engagement > 100) return 'text-green-600 dark:text-green-400';
    if (engagement > 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getRelevanceColor = (score: number) => {
    if (score > 0.8) return 'bg-green-500';
    if (score > 0.6) return 'bg-yellow-500';
    if (score > 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading && insights.insights.length === 0) {
    return (
      <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            🌐 Social Insights - {categoryNames[category]}
          </h3>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && insights.insights.length === 0) {
    return (
      <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 border-l-4 border-red-500 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            ⚠️ Social Insights Unavailable
          </h3>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
        <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Using RSS feeds only. Social insights from X/Twitter are temporarily unavailable.
        </p>
        {insights.disclaimer && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
            {insights.disclaimer}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoryColors[category]}`}></div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            🌐 Social Insights - {categoryNames[category]}
          </h3>
          {insights.fallback && (
            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
              Fallback Mode
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoRefresh}
            className={`p-2 rounded transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400'
            }`}
            title={autoRefresh ? 'Auto-refresh enabled (30min)' : 'Enable auto-refresh'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors disabled:opacity-50"
            title="Refresh insights"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {insights.insights.length > 0 ? (
        <div className="space-y-6">
          {/* Insight Tabs */}
          {insights.insights.length > 1 && (
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-zinc-700">
              {insights.insights.map((insight, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedInsight(index)}
                  className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    selectedInsight === index
                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-b-2 border-teal-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Query {index + 1}
                </button>
              ))}
            </div>
          )}

          {/* Selected Insight */}
          {insights.insights[selectedInsight] && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-zinc-900 dark:text-white">
                    Search Query
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>BRICS Relevance:</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getRelevanceColor(insights.insights[selectedInsight].bricsRelevance)}`}></div>
                        <span>{Math.round(insights.insights[selectedInsight].bricsRelevance * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Sustainability:</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getRelevanceColor(insights.insights[selectedInsight].sustainabilityScore)}`}></div>
                        <span>{Math.round(insights.insights[selectedInsight].sustainabilityScore * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 font-mono bg-white dark:bg-zinc-900 px-3 py-2 rounded">
                  {insights.insights[selectedInsight].query}
                </p>
              </div>

              {/* AI Analysis */}
              <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-zinc-900 dark:text-white mb-2">
                  🤖 AI Analysis
                </h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {insights.insights[selectedInsight].analysis}
                </p>
                
                {insights.insights[selectedInsight].multipolarPerspective && (
                  <div className="mt-3 p-3 bg-white dark:bg-zinc-800 rounded border-l-4 border-orange-500">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="font-medium text-orange-700 dark:text-orange-300">Multipolar Perspective: </span>
                      {insights.insights[selectedInsight].multipolarPerspective}
                    </p>
                  </div>
                )}
              </div>

              {/* Tweets */}
              {insights.insights[selectedInsight].tweets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-zinc-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    Social Media Insights ({insights.insights[selectedInsight].tweets.length})
                  </h4>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    {insights.insights[selectedInsight].tweets.slice(0, 6).map((tweet, tweetIndex) => (
                      <div key={tweetIndex} className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {tweet.author.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-zinc-900 dark:text-white">
                                {tweet.author}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimestamp(tweet.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className={`text-xs font-medium ${getTweetEngagementColor(tweet.engagement)}`}>
                            {tweet.engagement}+ interactions
                          </div>
                        </div>
                        
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                          {tweet.text}
                        </p>
                        
                        {tweet.url && (
                          <a
                            href={tweet.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            View on X/Twitter →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-2 2m0 0l-2 2m2-2v6" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No social insights available for {categoryNames[category]}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {insights.fallback ? 'AI service unavailable. Using RSS feeds only.' : 'No relevant social media conversations found.'}
          </p>
        </div>
      )}

      {/* Footer with metadata */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {insights.timestamp && (
              <span>
                Last updated: {new Date(insights.timestamp).toLocaleString('id-ID')}
              </span>
            )}
            {insights.compliance !== undefined && (
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${insights.compliance ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>UU ITE Compliant</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span>Powered by</span>
            <span className="font-medium text-teal-600 dark:text-teal-400">Grok AI</span>
            <span>+</span>
            <span className="font-medium text-orange-600 dark:text-orange-400">X API</span>
          </div>
        </div>
        
        {insights.disclaimer && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
            <p>{insights.disclaimer}</p>
          </div>
        )}
      </div>
    </div>
  );
}