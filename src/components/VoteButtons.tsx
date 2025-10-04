'use client';

import { useState, useEffect } from 'react';
import { getArticleVotes, upvoteArticle, downvoteArticle, ArticleVote } from '@/lib/votes';
import { trackEvent } from '@/lib/analytics/matomo';
// Note: Toast functionality temporarily commented out for build compatibility
// import { toast } from '@/components/ui/use-toast';

interface VoteButtonsProps {
  articleId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function VoteButtons({
  articleId,
  showCount = true,
  size = 'md'
}: VoteButtonsProps) {
  const [votes, setVotes] = useState<ArticleVote>({
    articleId,
    upvotes: 0,
    downvotes: 0,
    score: 0,
    userVote: null,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setVotes(getArticleVotes(articleId));
  }, [articleId]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpvote = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Get or create anonymous user ID
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = `anon_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      localStorage.setItem('anonymous_user_id', userId);
    }
    
    try {
      // Validate vote through moderation API
      const response = await fetch('/api/moderation/validate-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId,
          voteType: 'up',
        }),
      });
      
      const result = await response.json();
      
      if (!result.allowed) {
        // Vote was rejected by moderation service
        setErrorMessage(result.error || 'Vote not allowed at this time');
        console.warn('Vote restricted:', result.error || 'Please try again later');
        // toast({
        //   title: 'Vote Restricted',
        //   description: result.error || 'Please try again later',
        //   variant: 'destructive',
        // } as any);
        setIsLoading(false);
        return;
      }
      
      // Vote is allowed - process it
      const newVotes = upvoteArticle(articleId);
      setVotes(newVotes);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      trackEvent({
        category: 'Community',
        action: 'Upvote',
        name: articleId,
      });
    } catch (error) {
      console.error('Error validating vote:', error);
      // Allow vote even if validation fails (fallback)
      const newVotes = upvoteArticle(articleId);
      setVotes(newVotes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownvote = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    // Get or create anonymous user ID
    let userId = localStorage.getItem('anonymous_user_id');
    if (!userId) {
      userId = `anon_${Math.random().toString(36).substring(2)}_${Date.now()}`;
      localStorage.setItem('anonymous_user_id', userId);
    }
    
    try {
      // Validate vote through moderation API
      const response = await fetch('/api/moderation/validate-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          articleId,
          voteType: 'down',
        }),
      });
      
      const result = await response.json();
      
      if (!result.allowed) {
        // Vote was rejected by moderation service
        setErrorMessage(result.error || 'Vote not allowed at this time');
        console.warn('Vote restricted:', result.error || 'Please try again later');
        // toast({
        //   title: 'Vote Restricted',
        //   description: result.error || 'Please try again later',
        //   variant: 'destructive',
        // } as any);
        setIsLoading(false);
        return;
      }
      
      // Vote is allowed - process it
      const newVotes = downvoteArticle(articleId);
      setVotes(newVotes);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      trackEvent({
        category: 'Community',
        action: 'Downvote',
        name: articleId,
      });
    } catch (error) {
      console.error('Error validating vote:', error);
      // Allow vote even if validation fails (fallback)
      const newVotes = downvoteArticle(articleId);
      setVotes(newVotes);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'text-sm p-1',
    md: 'text-base p-2',
    lg: 'text-lg p-3',
  };

  const buttonClass = `
    ${sizeClasses[size]}
    rounded-lg transition-all duration-200
    hover:scale-110 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="flex items-center gap-2">
      {/* Upvote Button */}
      <button
        onClick={handleUpvote}
        disabled={isLoading}
        className={`
          ${buttonClass}
          ${votes.userVote === 'up'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
        title="Upvote"
        aria-label="Upvote article"
      >
        <span className={isAnimating && votes.userVote === 'up' ? 'animate-bounce' : ''}>
          👍
        </span>
      </button>

      {/* Score Display */}
      {showCount && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {votes.score > 0 ? '+' : ''}{votes.score}
          </span>
        </div>
      )}

      {/* Downvote Button */}
      <button
        onClick={handleDownvote}
        disabled={isLoading}
        className={`
          ${buttonClass}
          ${votes.userVote === 'down'
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
        title="Downvote"
        aria-label="Downvote article"
      >
        <span className={isAnimating && votes.userVote === 'down' ? 'animate-bounce' : ''}>
          👎
        </span>
      </button>

      {/* Detailed Stats (optional) */}
      {showCount && (votes.upvotes > 0 || votes.downvotes > 0) && (
        <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-1">
          <span>({votes.upvotes}↑ {votes.downvotes}↓)</span>
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="text-xs text-red-500 dark:text-red-400 ml-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
