import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { rssAggregator } from '@/lib/rss-parser';
import Link from 'next/link';

import { generateSEOMetadata } from '@/components/SEOHead';

/**
 * Indonesia category page - shows Indonesian and Asia-focused news sources.
 */
export const metadata = generateSEOMetadata({
  title: 'Indonesia News - Southeast Asian Perspectives | Bali Report',
  description: 'Comprehensive Indonesia news coverage from Antara News, BBC Asia, and regional sources. Indonesian politics, economy, culture, ASEAN developments, and archipelago insights. Updated daily with 67+ articles.',
  keywords: 'Indonesia news, Indonesian politics, Jakarta news, Southeast Asia, ASEAN, archipelago, Indonesian economy, Indonesian culture, Antara News, BBC Asia, regional news, Jokowi, Indonesian democracy',
  canonical: 'https://bali.report/indonesia'
});

export default async function IndonesiaPage() {
  // Fetch Indonesia-specific articles
  const articles = await rssAggregator.fetchByCategory('Indonesia');
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-yellow-600">Home</Link>
            <span>›</span>
            <span className="font-medium text-yellow-600">Indonesia News</span>
          </div>
        </nav>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🇮🇩</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Indonesia News
                </h1>
                <p className="text-yellow-200 mt-2">
                  Archipelago insights and Southeast Asian perspectives
                </p>
              </div>
            </div>
            <p className="text-xl text-yellow-100 mb-6 max-w-4xl">
              Comprehensive coverage of Indonesian politics, economy, culture, and regional developments 
              from local and international sources focused on the world's largest archipelago nation.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                📰 Antara News
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🌏 BBC Asia
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🏝️ Southeast Asia Focus
              </span>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Indonesia news sources...</p>
          </div>
        }>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🏝️</span>
              <p className="text-gray-600 mb-4">No Indonesian articles available at the moment.</p>
              <p className="text-sm text-gray-500">
                Our RSS feeds might be updating. Please check back shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Indonesia Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-yellow-600 pb-2">
                    🔥 Featured Indonesia Stories
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} featured={true} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Indonesia Articles */}
              {latestArticles.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-amber-600 pb-2">
                    📰 All Indonesia News ({latestArticles.length} articles)
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* Indonesia Stats */}
              <section className="mt-12 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Indonesia Coverage</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{articles.length}</div>
                    <div className="text-sm text-gray-600">Total Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {new Set(articles.map(a => a.source)).size}
                    </div>
                    <div className="text-sm text-gray-600">Sources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-700">
                      {articles.filter(a => new Date(a.pubDate) > new Date(Date.now() - 24*60*60*1000)).length}
                    </div>
                    <div className="text-sm text-gray-600">Last 24h</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(articles.length / new Set(articles.map(a => a.source)).size)}
                    </div>
                    <div className="text-sm text-gray-600">Avg/Source</div>
                  </div>
                </div>
              </section>

              {/* Regional Context */}
              <section className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🌏 Regional Context</h3>
                <p className="text-gray-700 mb-4">
                  Indonesia, the world's fourth-most populous country and largest archipelago, plays a crucial role 
                  in Southeast Asian geopolitics and the global economy. As a member of ASEAN, G20, and emerging 
                  middle power, Indonesia's developments significantly impact regional stability and growth.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold text-amber-700">🏛️ Political</div>
                    <div className="text-gray-600">Democratic transitions, regional autonomy</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold text-yellow-700">💰 Economic</div>
                    <div className="text-gray-600">Natural resources, manufacturing growth</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold text-orange-700">🌍 Geopolitical</div>
                    <div className="text-gray-600">ASEAN leadership, China-US balance</div>
                  </div>
                </div>
              </section>
            </>
          )}
        </Suspense>
      </main>
    </div>
  );
}