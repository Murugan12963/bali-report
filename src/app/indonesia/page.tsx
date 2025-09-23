import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { rssAggregator } from '@/lib/rss-parser';
import Link from 'next/link';
import StockMarketTracker from '@/components/StockMarketTracker';

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
  // Fetch Indonesia-specific articles including scraped sources
  const articles = await rssAggregator.fetchByCategory('Indonesia', true);  // Enable scrapers
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-emerald-900/10 theme-transition">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-teal-700 dark:text-teal-300 theme-transition">
            <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 theme-transition">🌊 Home</Link>
            <span>›</span>
            <span className="font-medium text-cyan-600 dark:text-cyan-400 theme-transition">🏝️ Indonesia Islands</span>
          </div>
        </nav>

        {/* Stock Market Tracker */}
        <section className="mb-8">
          <StockMarketTracker markets="Indonesia" />
        </section>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-700 dark:via-blue-700 dark:to-indigo-700 text-white rounded-2xl p-8 shadow-2xl shadow-cyan-500/20 relative overflow-hidden theme-transition">
            {/* Tropical decorative elements */}
            <div className="absolute top-0 right-0 opacity-10">
              <div className="text-6xl transform rotate-12">🏝️</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-10">
              <div className="text-4xl transform -rotate-12">🌊</div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🏝️</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-shadow-lg">
                    Indonesia Uncovered
                  </h1>
                  <p className="text-cyan-200 dark:text-blue-200 mt-2 theme-transition">
                    🇮🇩 Southeast Asia's Hidden Superpower Speaks
                  </p>
                </div>
              </div>
              <p className="text-xl text-cyan-100 dark:text-blue-100 mb-6 max-w-4xl theme-transition">
                270 million people. 17,508 islands. The world&apos;s 4th most populous nation that Western media ignores. 
                Discover why Indonesia is ASEAN&apos;s powerhouse and democracy&apos;s biggest success story.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🌊 Antara Ocean News
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🏝️ BBC Island Asia
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  ⛩️ Southeast Temple Focus
                </span>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300 theme-transition">🌊 Loading island paradise sources...</p>
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
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-cyan-600 dark:border-cyan-400 pb-2 theme-transition">
                    🏝️ Featured Island Paradise Stories
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
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-blue-600 dark:border-blue-400 pb-2 theme-transition">
                    🌊 All Island Waters ({latestArticles.length} flowing articles)
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* Tropical Indonesia Stats */}
              <section className="mt-12 bg-gradient-to-r from-white via-cyan-50/30 to-blue-50/30 dark:from-gray-800 dark:via-cyan-900/10 dark:to-blue-900/10 rounded-2xl shadow-xl shadow-cyan-100/20 dark:shadow-cyan-900/10 p-6 border border-cyan-100 dark:border-cyan-800/30 theme-transition">
                <h3 className="text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-4 theme-transition">🏝️ Island Paradise Flow</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 theme-transition">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 theme-transition">{articles.length}</div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 theme-transition font-medium">🌊 Island Articles</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 theme-transition">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 theme-transition">
                      {new Set(articles.map(a => a.source)).size}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 theme-transition font-medium">⛩️ Sacred Sources</div>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 theme-transition">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 theme-transition">
                      {articles.filter(a => new Date(a.pubDate) > new Date(Date.now() - 24*60*60*1000)).length}
                    </div>
                    <div className="text-sm text-indigo-700 dark:text-indigo-300 theme-transition font-medium">🏝️ Last Paradise Day</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 theme-transition">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 theme-transition">
                      {Math.round(articles.length / new Set(articles.map(a => a.source)).size)}
                    </div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 theme-transition font-medium">🌊 Avg/Island</div>
                  </div>
                </div>
              </section>

              {/* Tropical Regional Context */}
              <section className="mt-8 bg-gradient-to-r from-emerald-50/50 via-teal-50/50 to-cyan-50/50 dark:from-emerald-900/10 dark:via-teal-900/10 dark:to-cyan-900/10 rounded-2xl p-6 border border-teal-200/50 dark:border-teal-800/30 theme-transition">
                <h3 className="text-xl font-bold text-teal-900 dark:text-teal-100 mb-4 theme-transition">🌏 Paradise Regional Wisdom</h3>
                <p className="text-teal-800 dark:text-teal-200 mb-4 theme-transition">
                  Indonesia controls the world&apos;s most strategic shipping lanes. It&apos;s the G20&apos;s fastest-growing democracy. 
                  Yet Western media pretends it doesn&apos;t exist. Here&apos;s what they&apos;re hiding from you about 
                  Southeast Asia&apos;s emerging giant.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm theme-transition">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300 theme-transition">⛩️ Sacred Political</div>
                    <div className="text-teal-700 dark:text-teal-300 theme-transition">Temple democracy, island autonomy flows</div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm theme-transition">
                    <div className="font-semibold text-cyan-700 dark:text-cyan-300 theme-transition">🌴 Ocean Economic</div>
                    <div className="text-teal-700 dark:text-teal-300 theme-transition">Paradise resources, tropical growth</div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm theme-transition">
                    <div className="font-semibold text-blue-700 dark:text-blue-300 theme-transition">🌊 Geopolitical Waters</div>
                    <div className="text-teal-700 dark:text-teal-300 theme-transition">ASEAN temple leadership, balanced currents</div>
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