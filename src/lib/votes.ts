/**
 * Community Voting System
 * Allows users to upvote/downvote articles
 * Uses localStorage for persistence (can be upgraded to database)
 */

export interface ArticleVote {
  articleId: string;
  upvotes: number;
  downvotes: number;
  score: number; // upvotes - downvotes
  userVote?: 'up' | 'down' | null; // Current user's vote
}

export interface VoteStats {
  totalVotes: number;
  topArticles: Array<{
    articleId: string;
    title: string;
    score: number;
    upvotes: number;
  }>;
}

const STORAGE_KEY = 'bali-report-votes';
const USER_VOTES_KEY = 'bali-report-user-votes';

/**
 * Get all votes from storage
 */
function getAllVotes(): Record<string, ArticleVote> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load votes:', error);
    return {};
  }
}

/**
 * Save votes to storage
 */
function saveVotes(votes: Record<string, ArticleVote>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch (error) {
    console.error('Failed to save votes:', error);
  }
}

/**
 * Get user's votes
 */
function getUserVotes(): Record<string, 'up' | 'down'> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(USER_VOTES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load user votes:', error);
    return {};
  }
}

/**
 * Save user's votes
 */
function saveUserVotes(userVotes: Record<string, 'up' | 'down'>): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(USER_VOTES_KEY, JSON.stringify(userVotes));
  } catch (error) {
    console.error('Failed to save user votes:', error);
  }
}

/**
 * Get votes for a specific article
 */
export function getArticleVotes(articleId: string): ArticleVote {
  const allVotes = getAllVotes();
  const userVotes = getUserVotes();

  const votes = allVotes[articleId] || {
    articleId,
    upvotes: 0,
    downvotes: 0,
    score: 0,
  };

  return {
    ...votes,
    userVote: userVotes[articleId] || null,
  };
}

/**
 * Upvote an article
 */
export function upvoteArticle(articleId: string): ArticleVote {
  const allVotes = getAllVotes();
  const userVotes = getUserVotes();
  const currentVote = userVotes[articleId];

  // Initialize if doesn't exist
  if (!allVotes[articleId]) {
    allVotes[articleId] = {
      articleId,
      upvotes: 0,
      downvotes: 0,
      score: 0,
    };
  }

  const article = allVotes[articleId];

  if (currentVote === 'up') {
    // Remove upvote
    article.upvotes--;
    delete userVotes[articleId];
  } else {
    // Add upvote
    article.upvotes++;

    // Remove downvote if exists
    if (currentVote === 'down') {
      article.downvotes--;
    }

    userVotes[articleId] = 'up';
  }

  article.score = article.upvotes - article.downvotes;

  saveVotes(allVotes);
  saveUserVotes(userVotes);

  return getArticleVotes(articleId);
}

/**
 * Downvote an article
 */
export function downvoteArticle(articleId: string): ArticleVote {
  const allVotes = getAllVotes();
  const userVotes = getUserVotes();
  const currentVote = userVotes[articleId];

  // Initialize if doesn't exist
  if (!allVotes[articleId]) {
    allVotes[articleId] = {
      articleId,
      upvotes: 0,
      downvotes: 0,
      score: 0,
    };
  }

  const article = allVotes[articleId];

  if (currentVote === 'down') {
    // Remove downvote
    article.downvotes--;
    delete userVotes[articleId];
  } else {
    // Add downvote
    article.downvotes++;

    // Remove upvote if exists
    if (currentVote === 'up') {
      article.upvotes--;
    }

    userVotes[articleId] = 'down';
  }

  article.score = article.upvotes - article.downvotes;

  saveVotes(allVotes);
  saveUserVotes(userVotes);

  return getArticleVotes(articleId);
}

/**
 * Get top voted articles
 */
export function getTopVotedArticles(limit: number = 10): ArticleVote[] {
  const allVotes = getAllVotes();
  const userVotes = getUserVotes();

  return Object.values(allVotes)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(vote => ({
      ...vote,
      userVote: userVotes[vote.articleId] || null,
    }));
}

/**
 * Get vote statistics
 */
export function getVoteStats(): VoteStats {
  const allVotes = getAllVotes();
  const votes = Object.values(allVotes);

  const totalVotes = votes.reduce((sum, v) => sum + v.upvotes + v.downvotes, 0);

  return {
    totalVotes,
    topArticles: votes
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(v => ({
        articleId: v.articleId,
        title: '', // Will be filled by UI component
        score: v.score,
        upvotes: v.upvotes,
      })),
  };
}

/**
 * Clear all votes (for testing)
 */
export function clearAllVotes(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_VOTES_KEY);
}
