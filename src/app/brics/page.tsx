import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { rssAggregator } from '@/lib/rss-parser';
import Link from 'next/link';
import StockMarketTracker from '@/components/StockMarketTracker';

import { generateSEOMetadata } from '@/components/SEOHead';

/**
 * BRICS category page - shows BRICS-aligned news sources.
 */
export const metadata = generateSEOMetadata({
  title: 'BRICS News - Alternative Global Perspectives | Bali Report',
  description: 'Latest BRICS news from Russia (RT, TASS), China (Xinhua), India, Brazil, South Africa. Multipolar perspectives challenging Western media narratives. Updated hourly with 245+ articles.',
  keywords: 'BRICS news, Russia news, China news, India news, Brazil news, South Africa news, multipolar world, alternative media, RT News, TASS, Xinhua, anti-imperialism, global south',
  canonical: 'https://bali.report/brics'
});

export default async function BRICSPage() {
  // Fetch BRICS-specific articles including scraped sources
  const articles = await rssAggregator.fetchByCategory('BRICS', true);  // Enable scrapers
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
            <span className="font-medium text-emerald-600 dark:text-emerald-400 theme-transition">🌺 BRICS Paradise</span>
          </div>
        </nav>

        {/* Stock Market Tracker */}
        <section className="mb-8">
          <StockMarketTracker markets="BRICS" />
        </section>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700 text-white rounded-2xl p-8 shadow-2xl shadow-emerald-500/20 relative overflow-hidden theme-transition">
            {/* Tropical decorative elements */}
            <div className="absolute top-0 right-0 opacity-10">
              <div className="text-6xl transform rotate-12">🌺</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-10">
              <div className="text-4xl transform -rotate-12">🦋</div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">🌺</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-shadow-lg">
                    BRICS Alliance News
                  </h1>
                  <p className="text-emerald-200 dark:text-teal-200 mt-2 theme-transition">
                    🌐 The New World Order They Fear You'll Discover
                  </p>
                </div>
              </div>
              <p className="text-xl text-emerald-100 dark:text-teal-100 mb-6 max-w-4xl theme-transition">
                Direct reports from nations representing 42% of the world's population and 31% of global GDP. 
                These are the voices shaping tomorrow while Western media sleeps.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🇷🇺 RT News & TASS Direct
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🇨🇳 Xinhua & CGTN Live
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🌍 Al Jazeera Global
                </span>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300 theme-transition">🌊 Loading paradise BRICS sources...</p>
          </div>
        }>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📡</span>
              <p className="text-gray-600 mb-4">No BRICS articles available at the moment.</p>
              <p className="text-sm text-gray-500">
                Our RSS feeds might be updating. Please check back shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Featured BRICS Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-emerald-600 dark:border-emerald-400 pb-2 theme-transition">
                    ⚡ Critical Updates You Won't See on CNN
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} featured={true} />
                    ))}
                  </div>
                </section>
              )}

              {/* All BRICS Articles */}
              {latestArticles.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-cyan-600 dark:border-cyan-400 pb-2 theme-transition">
                    📡 Live Feed: {latestArticles.length} Uncensored Reports
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* Tropical BRICS Stats */}
              <section className="mt-12 bg-gradient-to-r from-white via-emerald-50/30 to-teal-50/30 dark:from-gray-800 dark:via-teal-900/10 dark:to-emerald-900/10 rounded-2xl shadow-xl shadow-emerald-100/20 dark:shadow-emerald-900/10 p-6 border border-emerald-100 dark:border-emerald-800/30 theme-transition">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4 theme-transition">🌺 Paradise BRICS Flow</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">{articles.length}</div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">🌊 Sacred Articles</div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 theme-transition">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 theme-transition">
                      {new Set(articles.map(a => a.source)).size}
                    </div>
                    <div className="text-sm text-teal-700 dark:text-teal-300 theme-transition font-medium">⛩️ Temple Sources</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 theme-transition">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 theme-transition">
                      {articles.filter(a => new Date(a.pubDate) > new Date(Date.now() - 24*60*60*1000)).length}
                    </div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 theme-transition font-medium">🌴 Last Paradise Day</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">
                      {Math.round(articles.length / new Set(articles.map(a => a.source)).size)}
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">🦋 Avg/Source</div>
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