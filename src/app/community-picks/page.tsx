'use client';

import { useEffect, useState } from 'react';
import { getTopVotedArticles, ArticleVote, getVoteStats } from '@/lib/votes';
import VoteButtons from '@/components/VoteButtons';
import Link from 'next/link';

interface ArticleWithVotes extends ArticleVote {
  title?: string;
  description?: string;
  source?: string;
  category?: string;
  pubDate?: Date;
  link?: string;
}

export default function CommunityPicksPage() {
  const [topArticles, setTopArticles] = useState<ArticleWithVotes[]>([]);
  const [stats, setStats] = useState({ totalVotes: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load top voted articles
    const votes = getTopVotedArticles(20);
    const voteStats = getVoteStats();

    // In production, fetch article metadata from API or cache
    // For now, using mock data for demonstration
    const articlesWithMetadata = votes.map(vote => ({
      ...vote,
      title: `Article ${vote.articleId.slice(0, 8)}`, // Mock title
      description: 'Community-voted article from Bali Report',
      source: 'Community Pick',
      category: 'BRICS',
    }));

    setTopArticles(articlesWithMetadata);
    setStats(voteStats);
    setIsLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading">
            🏆 Community Picks
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-6 max-w-3xl">
            Articles voted by our community. The best stories rise to the top through democratic engagement.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{stats.totalVotes.toLocaleString()}</div>
              <div className="text-sm opacity-80">Total Votes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{topArticles.length}</div>
              <div className="text-sm opacity-80">Top Articles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 col-span-2 md:col-span-1">
              <div className="text-3xl font-bold">🌍</div>
              <div className="text-sm opacity-80">Community Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            💡 How Community Voting Works
          </h2>
          <div className="text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>Upvote (👍)</strong> articles you find valuable, informative, or important.
              <strong>Downvote (👎)</strong> articles that are misleading, low-quality, or irrelevant.
            </p>
            <p>
              The score is calculated as: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">upvotes - downvotes</code>.
              Articles with higher scores appear at the top.
            </p>
          </div>
        </div>
      </section>

      {/* Top Voted Articles */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Top Voted Articles
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl">🔄</div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading community picks...</p>
          </div>
        ) : topArticles.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🗳️</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              No votes yet!
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Be the first to vote on articles. Browse <Link href="/" className="text-teal-600 dark:text-teal-400 hover:underline">homepage</Link> to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {topArticles.map((article, index) => (
              <div
                key={article.articleId}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 text-center">
                    <div className={`
                      text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                      ${index === 1 ? 'bg-gray-300 text-gray-800' : ''}
                      ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                      ${index > 2 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : ''}
                    `}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {article.title || `Article ${article.articleId}`}
                    </h3>

                    {article.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {article.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      {article.source && (
                        <span className="font-medium">{article.source}</span>
                      )}
                      {article.category && (
                        <>
                          <span>•</span>
                          <span>{article.category}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">
                        Score: {article.score > 0 ? '+' : ''}{article.score}
                      </span>
                      <span>•</span>
                      <span>{article.upvotes} upvotes, {article.downvotes} downvotes</span>
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex-shrink-0">
                    <VoteButtons articleId={article.articleId} size="lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Call to Action */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Help Shape the News</h2>
          <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
            Your vote matters! Help the community discover the most important stories by voting on articles.
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Browse Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
