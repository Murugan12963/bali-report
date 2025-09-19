'use client';

import React, { useState, useEffect } from 'react';
import { 
  Share, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Send,
  Copy,
  Check,
  ExternalLink,
  Users 
} from 'lucide-react';
import { Article } from '@/lib/rss-parser';

interface SocialShareProps {
  article?: Article;
  url?: string;
  title?: string;
  description?: string;
  variant?: 'horizontal' | 'vertical' | 'floating' | 'compact';
  showLabel?: boolean;
  className?: string;
}

interface SharePlatform {
  name: string;
  icon: React.ElementType;
  color: string;
  shareUrl: (params: ShareParams) => string;
  label: string;
}

interface ShareParams {
  url: string;
  title: string;
  description: string;
}

/**
 * Social sharing component with native share API and multiple platforms.
 * 
 * Args:
 *   article (Article): Article to share.
 *   url (string): Custom URL to share.
 *   title (string): Custom title.
 *   description (string): Custom description.
 *   variant (string): Display variant.
 *   showLabel (boolean): Show platform labels.
 *   className (string): Additional CSS classes.
 */
export function SocialShare({ 
  article, 
  url, 
  title, 
  description, 
  variant = 'horizontal',
  showLabel = false,
  className = '' 
}: SocialShareProps) {
  const [isNativeShareSupported, setIsNativeShareSupported] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // Derive share data from article or props
  const shareData = {
    url: url || article?.link || (typeof window !== 'undefined' ? window.location.href : ''),
    title: title || article?.title || 'Bali Report - Tropical News Paradise',
    description: description || article?.description || 'Multi-polar news from the paradise of Bali covering BRICS, Indonesia, and tropical perspectives.'
  };

  // Check for native share API support
  useEffect(() => {
    setIsNativeShareSupported(
      typeof window !== 'undefined' && 
      'navigator' in window && 
      'share' in navigator
    );
  }, []);

  // Social media platforms configuration with X.com prioritized
  const platforms: SharePlatform[] = [
    {
      name: 'x',
      icon: Twitter,
      color: 'hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black',
      label: 'Post on X',
      shareUrl: ({ url, title }: ShareParams) => {
        // Optimize for X.com with tropical news focus
        const xText = `🏝️ ${title}\n\n🌊 Multi-polar tropical news from Bali\n\n#BaliReport #BRICS #Indonesia #TropicalNews #Multipolar`;
        return `https://x.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(url)}`;
      }
    },
    {
      name: 'whatsapp',
      icon: MessageCircle,
      color: 'hover:bg-green-100 hover:text-green-600',
      label: 'WhatsApp',
      shareUrl: ({ url, title }: ShareParams) => 
        `https://wa.me/?text=${encodeURIComponent(`🏝️ ${title}\n\nTropical news from Bali Report: ${url}`)}`
    },
    {
      name: 'telegram',
      icon: Send,
      color: 'hover:bg-blue-100 hover:text-blue-500',
      label: 'Telegram',
      shareUrl: ({ url, title }: ShareParams) => 
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🌺 ${title} - Bali Report`)}`
    },
    {
      name: 'facebook',
      icon: Facebook,
      color: 'hover:bg-blue-100 hover:text-blue-700',
      label: 'Facebook',
      shareUrl: ({ url }: ShareParams) => 
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'linkedin',
      icon: Linkedin,
      color: 'hover:bg-blue-100 hover:text-blue-800',
      label: 'LinkedIn',
      shareUrl: ({ url, title, description }: ShareParams) => 
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
    }
  ];

  /**
   * Handle native share API.
   */
  const handleNativeShare = async () => {
    if (!isNativeShareSupported) return;

    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.description,
        url: shareData.url
      });
      
      incrementShareCount();
      console.log('🌺 Content shared via native API');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.warn('⚠️ Native share failed:', error);
      }
    }
  };

  /**
   * Handle platform-specific sharing.
   */
  const handlePlatformShare = (platform: SharePlatform) => {
    const shareUrl = platform.shareUrl(shareData);
    
    // Open share URL in new window
    const shareWindow = window.open(
      shareUrl,
      `share-${platform.name}`,
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );

    // Focus the share window
    if (shareWindow) {
      shareWindow.focus();
      incrementShareCount();
      console.log(`🌊 Content shared via ${platform.name}`);
    }
  };

  /**
   * Copy URL to clipboard.
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopiedToClipboard(true);
      incrementShareCount();
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedToClipboard(false), 2000);
      
      console.log('🔗 URL copied to clipboard');
    } catch (error) {
      console.warn('⚠️ Copy to clipboard failed:', error);
      
      // Fallback: select text for manual copy
      const textArea = document.createElement('textarea');
      textArea.value = shareData.url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  /**
   * Increment share count for analytics.
   */
  const incrementShareCount = () => {
    setShareCount(prev => prev + 1);
    
    // Store in localStorage for basic analytics
    if (typeof window !== 'undefined') {
      const articleId = article?.id || 'unknown';
      const shares = JSON.parse(localStorage.getItem('bali-report-shares') || '{}');
      shares[articleId] = (shares[articleId] || 0) + 1;
      localStorage.setItem('bali-report-shares', JSON.stringify(shares));
    }
  };

  // Render variants
  const renderButtons = () => {
    const buttons = [
      // Native share button (if supported)
      ...(isNativeShareSupported ? [{
        name: 'native',
        icon: Share,
        color: 'hover:bg-emerald-100 hover:text-emerald-600',
        label: 'Share',
        onClick: handleNativeShare
      }] : []),
      
      // Platform-specific buttons
      ...platforms.map(platform => ({
        ...platform,
        onClick: () => handlePlatformShare(platform)
      })),
      
      // Copy link button
      {
        name: 'copy',
        icon: copiedToClipboard ? Check : Copy,
        color: copiedToClipboard ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 hover:text-gray-600',
        label: copiedToClipboard ? 'Copied!' : 'Copy',
        onClick: handleCopyLink
      }
    ];

    const baseButtonClass = "flex items-center justify-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1";
    
    // Modern Grok-style button styling
    const getButtonClass = (button: any, index: number) => {
      if (button.name === 'x') {
        return `${baseButtonClass} bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border border-zinc-700 dark:border-zinc-300 shadow-sm hover:shadow-md`;
      }
      return `${baseButtonClass} bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 shadow-sm hover:shadow-md`;
    };
    
    const variantClasses = {
      horizontal: "flex-row gap-2",
      vertical: "flex-col gap-2",
      floating: "fixed bottom-4 right-4 flex-col gap-2 bg-white shadow-lg rounded-xl p-2 z-40",
      compact: "flex-row gap-1"
    };

    const buttonSize = variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10';
    const iconSize = variant === 'compact' ? 16 : 20;

    return (
      <div className={`flex ${variantClasses[variant]} ${className}`}>
        {buttons.map((button, index) => {
          const Icon = button.icon;
          
          return (
            <button
              key={button.name}
              onClick={button.onClick}
              className={`
                ${getButtonClass(button, index)} 
                ${buttonSize}
                ${variant === 'floating' ? 'shadow-md hover:shadow-lg' : ''}
              `}
              title={`Share via ${button.label}`}
              aria-label={`Share via ${button.label}`}
            >
              <Icon size={iconSize} />
              {showLabel && (
                <span className="ml-2 text-sm font-medium">
                  {button.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="social-share">
      {variant !== 'floating' && (
        <div className="mb-3 flex items-center gap-2">
          <Users size={16} className="text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
            Share this article
          </span>
          <span className="text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-md font-medium border border-zinc-300 dark:border-zinc-600">
            X first
          </span>
          {shareCount > 0 && (
            <span className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-700">
              {shareCount} share{shareCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
      
      {renderButtons()}
    </div>
  );
}

/**
 * Floating share button that expands on hover.
 */
export function FloatingShare({ article, className = '' }: { article?: Article; className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 ${className}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
              {!isExpanded ? (
        <button
          className="
            w-14 h-14 bg-blue-600 hover:bg-blue-700 
            text-white rounded-full shadow-lg hover:shadow-xl 
            flex items-center justify-center
            transition-all duration-200
          "
          onClick={() => setIsExpanded(true)}
          aria-label="Share this article"
        >
          <Share size={24} />
        </button>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-4 border border-zinc-200 dark:border-zinc-700">
          <SocialShare 
            article={article} 
            variant="vertical" 
            showLabel={false}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Compact share bar for article cards.
 */
export function ShareBar({ article, className = '' }: { article?: Article; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <SocialShare 
        article={article} 
        variant="compact" 
        showLabel={false}
        className="opacity-70 hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

/**
 * Hook for tracking share analytics.
 */
export function useShareAnalytics() {
  const [totalShares, setTotalShares] = useState(0);
  const [topSharedArticles, setTopSharedArticles] = useState<Array<{id: string; shares: number}>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shares = JSON.parse(localStorage.getItem('bali-report-shares') || '{}');
      const total = Object.values(shares).reduce((sum: number, count: any) => sum + count, 0);
      
      const sorted = Object.entries(shares)
        .map(([id, shares]) => ({ id, shares: shares as number }))
        .sort((a, b) => b.shares - a.shares)
        .slice(0, 5);
      
      setTotalShares(total);
      setTopSharedArticles(sorted);
    }
  }, []);

  return {
    totalShares,
    topSharedArticles
  };
}