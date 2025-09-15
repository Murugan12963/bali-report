import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import { rssAggregator } from '@/lib/rss-parser';
import Link from 'next/link';

import { generateSEOMetadata } from '@/components/SEOHead';

/**
 * Bali category page - shows Bali-specific local news.
 */
export const metadata = generateSEOMetadata({
  title: 'Bali Local News - Island of the Gods Coverage | Bali Report',
  description: 'Local Bali news covering tourism updates, cultural events, Hindu festivals, Denpasar politics, Ubud developments, and environmental issues. Island of the Gods local perspective with dedicated Balinese sources.',
  keywords: 'Bali local news, Bali tourism, Bali culture, Hindu festivals, Denpasar, Ubud, Canggu, Sanur, Balinese culture, Island of the Gods, Bali politics, Bali environment, Nyepi, Galungan, Kuningan',
  canonical: 'https://bali.report/bali'
});

export default async function BaliPage() {
  // Fetch Bali-specific articles
  const articles = await rssAggregator.fetchByCategory('Bali');
  const allArticles = await rssAggregator.fetchAllSources();
  
  // If no dedicated Bali articles, show Indonesia articles that might mention Bali
  const baliRelatedArticles = articles.length > 0 ? articles : 
    allArticles.filter(article => 
      article.title.toLowerCase().includes('bali') || 
      article.description.toLowerCase().includes('bali')
    );
  
  const featuredArticles = baliRelatedArticles.slice(0, 2);
  const latestArticles = baliRelatedArticles.slice(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-amber-600">Home</Link>
            <span>›</span>
            <span className="font-medium text-amber-600">Bali Local</span>
          </div>
        </nav>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🏝️</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Bali Local News
                </h1>
                <p className="text-amber-200 mt-2">
                  Island of the Gods • Local perspectives and developments
                </p>
              </div>
            </div>
            <p className="text-xl text-amber-100 mb-6 max-w-4xl">
              Covering local developments in Bali including tourism updates, cultural events, 
              festivals, environmental issues, and community news from across the island's regencies.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🏛️ Denpasar • Ubud • Canggu
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🎭 Culture & Festivals
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🏖️ Tourism & Environment
              </span>
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Bali local sources...</p>
          </div>
        }>
          {baliRelatedArticles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🌺</span>
              <p className="text-gray-600 mb-4">No Bali-specific articles available at the moment.</p>
              <p className="text-sm text-gray-500 mb-6">
                We're working to add more local Bali news sources. Check back soon!
              </p>
              
              {/* Placeholder for future sources */}
              <div className="bg-amber-50 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">📰 Coming Soon: Local Bali Sources</h3>
                <div className="text-sm text-amber-700 space-y-2">
                  <p>• Bali Post - Local news and events</p>
                  <p>• Bali Discovery - Tourism and culture</p>
                  <p>• Regional government announcements</p>
                  <p>• Cultural calendar and festival updates</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {articles.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">ℹ️</span>
                    <p className="text-blue-800 text-sm">
                      Currently showing articles mentioning Bali from our general sources. 
                      Dedicated Bali local sources coming soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Featured Bali Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-amber-600 pb-2">
                    🔥 Featured Bali Stories
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} featured={true} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Bali Articles */}
              {latestArticles.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-orange-500 pb-2">
                    📰 All Bali Coverage ({latestArticles.length} articles)
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* Bali Stats */}
              <section className="mt-12 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Bali Coverage</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-amber-600">{baliRelatedArticles.length}</div>
                    <div className="text-sm text-gray-600">Related Articles</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {articles.length}
                    </div>
                    <div className="text-sm text-gray-600">Direct Sources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-700">
                      {baliRelatedArticles.filter(a => new Date(a.pubDate) > new Date(Date.now() - 24*60*60*1000)).length}
                    </div>
                    <div className="text-sm text-gray-600">Last 24h</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-700">9</div>
                    <div className="text-sm text-gray-600">Regencies</div>
                  </div>
                </div>
              </section>

              {/* Bali Context */}
              <section className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🏝️ About Bali</h3>
                <p className="text-gray-700 mb-4">
                  Bali, known as the "Island of the Gods," is Indonesia's premier tourist destination and cultural heartland. 
                  Home to over 4 million people, the island balances traditional Hindu-Balinese culture with modern tourism 
                  and development challenges.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold text-orange-700">🎭 Cultural</div>
                    <div className="text-gray-600">Hindu temples, traditional arts, ceremonies</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold text-amber-700">🏖️ Tourism</div>
                    <div className="text-gray-600">Beaches, resorts, international visitors</div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <div className="font-semibold text-red-700">🌱 Environment</div>
                    <div className="text-gray-600">Sustainability, waste management, preservation</div>
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