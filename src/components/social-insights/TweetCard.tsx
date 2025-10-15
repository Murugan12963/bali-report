'use client';

/**
 * Tweet Card Component
 * Displays individual X.com tweets with engagement metrics
 * Includes Matomo tracking for clicks
 */

import { useState } from 'react';
import { XTweet } from '@/lib/x-api-service';
import { trackOutboundLink } from '@/lib/analytics/matomo';

interface TweetCardProps {
  tweet: XTweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Format tweet text with basic formatting
  const formatTweetText = (text: string) => {
    if (text.length <= 280 && !expanded) {
      return text;
    }
    
    if (!expanded && text.length > 280) {
      return text.slice(0, 280) + '...';
    }
    
    return text;
  };

  // Format engagement numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Handle tweet click (opens X.com)
  const handleTweetClick = () => {
    const tweetUrl = `https://x.com/i/status/${tweet.id}`;
    
    // Track click in Matomo
    trackOutboundLink('x_social_insights', {
      tweet_id: tweet.id,
      category: tweet.category,
      relevance_score: tweet.relevance_score,
      engagement: (tweet.public_metrics?.like_count || 0) + (tweet.public_metrics?.retweet_count || 0)
    });

    // Open tweet in new tab
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  // Get category colors
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'BRICS':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-700'
        };
      case 'Indonesia':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-700'
        };
      case 'Bali':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-700'
        };
      default:
        return {
          bg: 'bg-zinc-50 dark:bg-zinc-800',
          text: 'text-zinc-700 dark:text-zinc-300',
          border: 'border-zinc-200 dark:border-zinc-700'
        };
    }
  };

  const categoryColors = getCategoryColors(tweet.category);
  const hasImage = tweet.attachments?.media_keys?.length || tweet.entities?.media?.length;
  const tweetText = formatTweetText(tweet.text);
  const needsExpansion = tweet.text.length > 280;

  return (
    <article className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Author Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm">
                  {tweet.author_name || `@user_${tweet.author_id?.slice(-4)}`}
                </p>
                {tweet.author_verified && (
                  <div className="w-4 h-4 text-blue-500">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatDate(tweet.created_at)}
              </p>
            </div>
          </div>

          {/* Category Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} flex-shrink-0`}>
            {tweet.category}
          </span>
        </div>
      </div>

      {/* Tweet Content */}
      <div className="px-4">
        <div 
          className="text-zinc-800 dark:text-zinc-200 leading-relaxed cursor-pointer group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors"
          onClick={handleTweetClick}
        >
          <p className="whitespace-pre-wrap break-words">
            {tweetText}
          </p>
          
          {needsExpansion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm mt-2 font-medium"
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>

      {/* Image/Media */}
      {hasImage && !imageError && (
        <div className="px-4 mt-3">
          <div className="rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700">
            {/* Placeholder since we don't have direct image URLs from the basic response */}
            <div className="w-full h-48 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center">
              <div className="text-zinc-500 dark:text-zinc-400 text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">Media content</p>
                <p className="text-xs opacity-75">Click to view on X</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Metrics */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            {tweet.public_metrics && (
              <>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{formatNumber(tweet.public_metrics.like_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{formatNumber(tweet.public_metrics.reply_count)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{formatNumber(tweet.public_metrics.retweet_count)}</span>
                </div>
              </>
            )}
          </div>

          {/* Relevance Score */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              tweet.relevance_score >= 80 ? 'bg-emerald-500' :
              tweet.relevance_score >= 60 ? 'bg-yellow-500' :
              'bg-zinc-400'
            }`}></div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {tweet.relevance_score}% relevant
            </span>
          </div>
        </div>

        {/* Click to View CTA */}
        <button
          onClick={handleTweetClick}
          className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 border border-teal-200 dark:border-teal-700 rounded-lg text-teal-700 dark:text-teal-300 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-teal-800/40 dark:hover:to-emerald-800/40 transition-all duration-200 text-sm font-medium group-hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            <span>View on X</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </button>
      </div>
    </article>
  );
}