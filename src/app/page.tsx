import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import PropellerAds from '@/components/PropellerAds';
import { rssAggregator } from '@/lib/rss-parser';

/**
 * Homepage for Bali Report - BRICS-aligned news aggregation.
 */
export default async function Home() {
  // Fetch latest articles from RSS sources
  const articles = await rssAggregator.fetchAllSources();
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(2, 14);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl p-8 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Multi-Polar News Perspective
            </h1>
            <p className="text-xl text-red-100 mb-6 max-w-3xl">
              Breaking free from Western media monopoly. Get balanced perspectives from BRICS nations, 
              Indonesia insights, and Bali local coverage that mainstream media won't show you.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🇷🇺 Russia • 🇨🇳 China • 🇮🇳 India • 🇧🇷 Brazil • 🇿🇦 South Africa
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                🇮🇩 Indonesia • 🏝️ Bali Local
              </span>
            </div>
          </div>
        </section>

        {/* Leaderboard Ad */}
        <section className="mb-8">
          <PropellerAds type="leaderboard" className="mx-auto" />
        </section>

        {/* Loading State */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading latest news from BRICS sources...</p>
          </div>
        }>
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Unable to fetch news at the moment.</p>
              <p className="text-sm text-gray-500">
                This could be due to RSS feed issues or network connectivity. Please try again later.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-red-600 pb-2">
                    🔥 Featured Stories
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} featured={true} />
                    ))}
                  </div>
                </section>
              )}

              {/* Latest News Grid */}
              {latestArticles.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-4 border-amber-600 pb-2">
                    📰 Latest News
                  </h2>
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Articles */}
                    <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
                      {latestArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                    
                    {/* Sidebar with ads */}
                    <div className="lg:col-span-1 space-y-6">
                      <PropellerAds type="sidebar" />
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h3 className="font-bold text-red-800 mb-2">📢 Support Independent Media</h3>
                        <p className="text-red-700 text-sm">
                          Bali Report provides alternative perspectives free from Western media bias. 
                          Your support helps us maintain independence.
                        </p>
                      </div>
                      <PropellerAds type="native" />
                    </div>
                  </div>
                </section>
              )}

              {/* Stats Section */}
              <section className="mt-12 bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{articles.length}</div>
                    <div className="text-sm text-gray-600">Articles Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">
                      {articles.filter(a => a.category === 'BRICS').length}
                    </div>
                    <div className="text-sm text-gray-600">BRICS News</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {articles.filter(a => a.category === 'Indonesia').length}
                    </div>
                    <div className="text-sm text-gray-600">Indonesia</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {new Set(articles.map(a => a.source)).size}
                    </div>
                    <div className="text-sm text-gray-600">Sources</div>
                  </div>
                </div>
              </section>
            </>
          )}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Bali Report</h3>
              <p className="text-gray-300 text-sm">
                Independent news aggregation focused on BRICS perspectives and Indonesian insights. 
                Fighting information monopoly one article at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/brics" className="text-gray-300 hover:text-yellow-300">BRICS News</a></li>
                <li><a href="/indonesia" className="text-gray-300 hover:text-yellow-300">Indonesia</a></li>
                <li><a href="/bali" className="text-gray-300 hover:text-yellow-300">Bali Local</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Mission</h4>
              <p className="text-gray-300 text-sm">
                Providing alternative perspectives to Western mainstream media through 
                aggregation of BRICS-aligned sources and local Indonesian coverage.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-400">
            <p>© 2024 Bali Report. Content aggregated from external sources; views are those of original authors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
