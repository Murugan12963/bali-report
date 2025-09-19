'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Clock, TrendingUp } from 'lucide-react';
import { Article } from '@/lib/rss-parser';

interface NewContentIndicatorProps {
  article?: Article;
  publishedAt?: string;
  className?: string;
  showAnimation?: boolean;
  variant?: 'badge' | 'banner' | 'pulse' | 'glow';
  threshold?: number; // Hours to consider "new"
}

interface NewBadgeProps {
  count?: number;
  variant?: 'subtle' | 'prominent' | 'floating';
  onClick?: () => void;
  className?: string;
}

/**
 * New Content Indicator for individual articles.
 * 
 * Args:
 *   article (Article): Article to check for newness.
 *   publishedAt (string): Alternative timestamp to check.
 *   className (string): Additional CSS classes.
 *   showAnimation (boolean): Enable pulse/glow animations.
 *   variant (string): Display style variant.
 *   threshold (number): Hours to consider content "new".
 */
export function NewContentIndicator({ 
  article, 
  publishedAt, 
  className = '', 
  showAnimation = true, 
  variant = 'badge',
  threshold = 6 // 6 hours default
}: NewContentIndicatorProps) {
  const [isNew, setIsNew] = useState(false);
  const [timeSincePublished, setTimeSincePublished] = useState<string>('');

  useEffect(() => {
    const checkIfNew = () => {
      const timestamp = article?.pubDate || publishedAt;
      if (!timestamp) {
        setIsNew(false);
        return;
      }

      const publishTime = new Date(timestamp).getTime();
      const now = new Date().getTime();
      const hoursDiff = (now - publishTime) / (1000 * 60 * 60);

      setIsNew(hoursDiff <= threshold);
      
      // Update time display
      if (hoursDiff < 1) {
        const minutesDiff = Math.floor((now - publishTime) / (1000 * 60));
        setTimeSincePublished(`${minutesDiff}m ago`);
      } else if (hoursDiff < 24) {
        setTimeSincePublished(`${Math.floor(hoursDiff)}h ago`);
      } else {
        const daysDiff = Math.floor(hoursDiff / 24);
        setTimeSincePublished(`${daysDiff}d ago`);
      }
    };

    checkIfNew();
    
    // Update every minute for accurate timing
    const interval = setInterval(checkIfNew, 60000);
    
    return () => clearInterval(interval);
  }, [article, publishedAt, threshold]);

  if (!isNew) return null;

  const baseClasses = "inline-flex items-center gap-1 text-xs font-medium rounded-full transition-all duration-300";
  
  const variantClasses = {
    badge: "px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md",
    banner: "px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg",
    pulse: "px-2 py-1 bg-blue-100 text-blue-800 border border-blue-300",
    glow: "px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 shadow-purple-200 shadow-md"
  };

  const animationClasses = showAnimation ? {
    badge: "animate-pulse",
    banner: "animate-bounce",
    pulse: "animate-ping",
    glow: "animate-pulse shadow-lg"
  } : {};

  return (
    <span 
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${showAnimation ? animationClasses[variant] || '' : ''} 
        ${className}
      `}
      title={`Published ${timeSincePublished}`}
    >
      {variant === 'badge' && <Sparkles size={10} />}
      {variant === 'banner' && <Zap size={12} />}
      {variant === 'pulse' && <TrendingUp size={10} />}
      {variant === 'glow' && <Clock size={10} />}
      
      {variant === 'banner' ? 'BREAKING' : 'NEW'}
    </span>
  );
}

/**
 * New Badge for showing count of new articles.
 * 
 * Args:
 *   count (number): Number of new articles.
 *   variant (string): Badge style variant.
 *   onClick (function): Click handler.
 *   className (string): Additional CSS classes.
 */
export function NewBadge({ 
  count = 0, 
  variant = 'subtle', 
  onClick, 
  className = '' 
}: NewBadgeProps) {
  if (count <= 0) return null;

  const baseClasses = "inline-flex items-center justify-center min-w-[1.5rem] h-6 text-xs font-bold rounded-full transition-all duration-300";
  
  const variantClasses = {
    subtle: "bg-blue-100 text-blue-800 border border-blue-200",
    prominent: "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md animate-pulse",
    floating: "bg-emerald-500 text-white shadow-lg transform -translate-y-1 hover:scale-110"
  };

  const clickableClasses = onClick ? "cursor-pointer hover:scale-105 active:scale-95" : "";

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${className}`}
      onClick={onClick}
      title={`${count} new article${count > 1 ? 's' : ''}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/**
 * Floating New Content Banner for page-wide new content notifications.
 */
interface FloatingNewBannerProps {
  isVisible: boolean;
  articleCount: number;
  onRefresh: () => void;
  onDismiss: () => void;
}

export function FloatingNewBanner({ 
  isVisible, 
  articleCount, 
  onRefresh, 
  onDismiss 
}: FloatingNewBannerProps) {
  if (!isVisible || articleCount <= 0) return null;

  return (
    <div 
      className={`
        fixed top-20 left-1/2 transform -translate-x-1/2 z-50
        bg-gradient-to-r from-emerald-600 to-teal-600 text-white
        px-6 py-3 rounded-full shadow-lg
        flex items-center gap-3
        animate-slide-down
        transition-all duration-500 ease-out
        hover:scale-105 hover:shadow-xl
      `}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        <Sparkles size={16} className="text-yellow-300" />
        <span className="font-semibold">
          {articleCount} new article{articleCount > 1 ? 's' : ''} available
        </span>
      </div>
      
      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={onRefresh}
          className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={onDismiss}
          className="bg-white/20 hover:bg-white/30 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * New Content Counter for navigation or headers.
 */
interface NewContentCounterProps {
  categories: {
    BRICS?: number;
    Indonesia?: number;
    Bali?: number;
  };
  className?: string;
}

export function NewContentCounter({ categories, className = '' }: NewContentCounterProps) {
  const totalNew = Object.values(categories).reduce((sum, count) => sum + (count || 0), 0);
  
  if (totalNew === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Sparkles size={16} className="text-emerald-600" />
      <span className="text-sm text-gray-700 dark:text-gray-300">
        {totalNew} new
      </span>
      
      <div className="flex items-center gap-1">
        {categories.BRICS && categories.BRICS > 0 && (
          <NewBadge count={categories.BRICS} variant="subtle" />
        )}
        {categories.Indonesia && categories.Indonesia > 0 && (
          <NewBadge count={categories.Indonesia} variant="subtle" />
        )}
        {categories.Bali && categories.Bali > 0 && (
          <NewBadge count={categories.Bali} variant="subtle" />
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing new content state across the application.
 */
export function useNewContent() {
  const [newArticles, setNewArticles] = useState<Article[]>([]);
  const [newCounts, setNewCounts] = useState<{
    BRICS: number;
    Indonesia: number;
    Bali: number;
  }>({
    BRICS: 0,
    Indonesia: 0,
    Bali: 0
  });
  const [showBanner, setShowBanner] = useState(false);

  const addNewArticles = (articles: Article[]) => {
    setNewArticles(prev => {
      // Avoid duplicates
      const existingIds = new Set(prev.map(a => a.id));
      const uniqueNew = articles.filter(a => !existingIds.has(a.id));
      return [...prev, ...uniqueNew];
    });

    // Update category counts
    setNewCounts(prev => {
      const counts = { ...prev };
      articles.forEach(article => {
        if (article.category === 'BRICS') counts.BRICS += 1;
        else if (article.category === 'Indonesia') counts.Indonesia += 1;
        else if (article.category === 'Bali') counts.Bali += 1;
      });
      return counts;
    });

    // Show banner if we have new content
    if (articles.length > 0) {
      setShowBanner(true);
    }
  };

  const clearNewArticles = () => {
    setNewArticles([]);
    setNewCounts({ BRICS: 0, Indonesia: 0, Bali: 0 });
    setShowBanner(false);
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  return {
    newArticles,
    newCounts,
    showBanner,
    totalNewCount: newArticles.length,
    addNewArticles,
    clearNewArticles,
    dismissBanner,
  };
}