import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import GoogleAds from '@/components/GoogleAds';
import { rssAggregator } from '@/lib/rss-parser';
import { StructuredData, websiteStructuredData, organizationStructuredData } from '@/components/SEOHead';

/**
 * Homepage for Bali Report - BRICS-aligned news aggregation.
 */
export default async function Home() {
  // Fetch latest articles from RSS sources
  const articles = await rssAggregator.fetchAllSources();
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(2, 14);

  return (
    <>
      <StructuredData type="WebSite" data={websiteStructuredData} />
      <StructuredData type="Organization" data={organizationStructuredData} />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-emerald-900/10 theme-transition">
        <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Tropical Bali Hero Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-700 dark:via-teal-700 dark:to-cyan-700 text-white rounded-2xl p-8 shadow-2xl shadow-emerald-500/20 relative overflow-hidden theme-transition">
            {/* Tropical decorative elements */}
            <div className="absolute top-0 right-0 opacity-10">
              <div className="text-6xl transform rotate-12">🌺</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-10">
              <div className="text-4xl transform -rotate-12">🌴</div>
            </div>
            <div className="absolute top-1/2 right-1/4 opacity-10">
              <div className="text-5xl transform rotate-45">🦋</div>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-shadow-lg">
                🏝️ Tropical News Paradise
              </h1>
              <p className="text-xl text-emerald-100 dark:text-teal-100 mb-6 max-w-3xl theme-transition">
                  Discover balanced perspectives from the Islands of Gods. Get authentic BRICS insights, 
                  Indonesian depth, and authentic Bali coverage that mainstream media misses.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🌺 BRICS Nations • 🦋 Multi-Polar Views
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🇮🇩 Indonesia • 🏝️ Bali Paradise • 🌊 Island Insights
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Ad */}
        <section className="mb-8">
          <GoogleAds type="leaderboard" className="mx-auto" />
        </section>

        {/* Loading State */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-teal-700 dark:text-teal-300 theme-transition">🌊 Loading tropical news from paradise sources...</p>
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
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-emerald-600 dark:border-emerald-400 pb-2 theme-transition">
                    🌺 Featured Paradise Stories
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
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-cyan-600 dark:border-cyan-400 pb-2 theme-transition">
                    🌊 Latest Island News
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
                      <GoogleAds type="sidebar" />
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800 theme-transition shadow-lg shadow-emerald-100/50 dark:shadow-emerald-900/20">
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-2 theme-transition">🌺 Support Paradise Media</h3>
                        <p className="text-emerald-700 dark:text-emerald-300 text-sm theme-transition">
                          Bali Report brings you tropical perspectives from the Island of Gods. 
                          Your support helps us share authentic Balinese and multi-polar insights.
                        </p>
                      </div>
                      <GoogleAds type="native" />
                    </div>
                  </div>
                </section>
              )}

              {/* Tropical Stats Section */}
              <section className="mt-12 bg-gradient-to-r from-white via-emerald-50/30 to-teal-50/30 dark:from-gray-800 dark:via-teal-900/10 dark:to-emerald-900/10 rounded-2xl shadow-xl shadow-emerald-100/20 dark:shadow-emerald-900/10 p-6 border border-emerald-100 dark:border-emerald-800/30 theme-transition">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">{articles.length}</div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">🌊 Articles Today</div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 theme-transition">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 theme-transition">
                      {articles.filter(a => a.category === 'BRICS').length}
                    </div>
                    <div className="text-sm text-teal-700 dark:text-teal-300 theme-transition font-medium">🌺 BRICS Paradise</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 theme-transition">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 theme-transition">
                      {articles.filter(a => a.category === 'Indonesia').length}
                    </div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 theme-transition font-medium">🏝️ Indonesia Islands</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">
                      {new Set(articles.map(a => a.source)).size}
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">⛩️ Sacred Sources</div>
                  </div>
                </div>
              </section>
            </>
          )}
        </Suspense>
      </main>

      {/* Tropical Bali Footer */}
      <footer className="bg-gradient-to-r from-teal-900 via-emerald-900 to-cyan-900 dark:from-teal-950 dark:via-emerald-950 dark:to-cyan-950 text-white py-8 mt-12 theme-transition relative overflow-hidden">
        {/* Tropical decorative elements */}
        <div className="absolute top-0 left-0 opacity-5">
          <div className="text-8xl transform -rotate-12">🌺</div>
        </div>
        <div className="absolute bottom-0 right-0 opacity-5">
          <div className="text-6xl transform rotate-12">🌴</div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-emerald-100">🏝️ Bali Report</h3>
              <p className="text-emerald-200 dark:text-teal-200 text-sm theme-transition">
                Independent tropical journalism from the Island of Gods. Bringing you authentic BRICS perspectives 
                and Indonesian wisdom that flows like sacred temple waters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-teal-100">🌊 Paradise Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/brics" className="text-teal-200 dark:text-emerald-200 hover:text-emerald-300 dark:hover:text-teal-300 theme-transition flex items-center">🌺 BRICS Paradise</a></li>
                <li><a href="/indonesia" className="text-teal-200 dark:text-emerald-200 hover:text-emerald-300 dark:hover:text-teal-300 theme-transition flex items-center">🏝️ Indonesia Islands</a></li>
                <li><a href="/bali" className="text-teal-200 dark:text-emerald-200 hover:text-emerald-300 dark:hover:text-teal-300 theme-transition flex items-center">⛩️ Sacred Bali</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-cyan-100">🦋 Sacred Mission</h4>
              <p className="text-cyan-200 dark:text-teal-200 text-sm theme-transition">
                Like the gentle waves of Bali beaches, we bring you flowing perspectives from 
                multi-polar sources and the wisdom of Indonesian archipelago journalism.
              </p>
            </div>
          </div>
          <div className="border-t border-emerald-700/50 dark:border-teal-800/50 mt-8 pt-4 text-center text-sm text-emerald-300 dark:text-teal-300 theme-transition">
            <p>© 2024 Bali Report 🌺 Content flows from sacred sources; views reflect original temple wisdom.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
