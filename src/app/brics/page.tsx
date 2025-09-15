import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { rssAggregator } from '@/lib/rss-parser';
import Link from 'next/link';

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
  // Fetch BRICS-specific articles
  const articles = await rssAggregator.fetchByCategory('BRICS');
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span>›</span>
            <span className="font-medium text-red-600">BRICS News</span>
          </div>
        </nav>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-red-700 to-red-800 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🌍</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  BRICS News
                </h1>
                <p className="text-red-200 mt-2">
                  Multipolar perspectives from emerging economies
                </p>
              </div>
            </div>
            <p className="text-xl text-red-100 mb-6 max-w-4xl">
              News and analysis from Russia, China, India, Brazil, South Africa, Iran, and other 
              nations building an alternative to Western-dominated global order.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🇷🇺 Russia Today & TASS
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🇨🇳 Xinhua News
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🌍 Al Jazeera
              </span>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading BRICS news sources...</p>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-red-600 pb-2">
                    🔥 Featured BRICS Stories
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-red-500 pb-2">
                    📰 All BRICS News ({latestArticles.length} articles)
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* BRICS Stats */}
              <section className="mt-12 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 BRICS Coverage</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{articles.length}</div>
                    <div className="text-sm text-gray-600">Total Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-700">
                      {new Set(articles.map(a => a.source)).size}
                    </div>
                    <div className="text-sm text-gray-600">Sources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-800">
                      {articles.filter(a => new Date(a.pubDate) > new Date(Date.now() - 24*60*60*1000)).length}
                    </div>
                    <div className="text-sm text-gray-600">Last 24h</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {Math.round(articles.length / new Set(articles.map(a => a.source)).size)}
                    </div>
                    <div className="text-sm text-gray-600">Avg/Source</div>
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