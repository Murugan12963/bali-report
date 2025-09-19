import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import GoogleAds from '@/components/GoogleAds';
import { HeroNewsletterSignup, CompactNewsletterSignup, FloatingNewsletterSignup } from '@/components/NewsletterSignup';
import { rssAggregator } from '@/lib/rss-parser';
import { contentPersonalizationEngine } from '@/lib/content-personalization';
import { StructuredData, websiteStructuredData, organizationStructuredData } from '@/components/SEOHead';

/**
 * Homepage for Bali Report - BRICS-aligned news aggregation.
 */
export default async function Home() {
  // Fetch latest articles from RSS sources
  const rawArticles = await rssAggregator.fetchAllSources();
  
  // Apply personalization (will fall back to default sorting if no preferences)
  // Use AI enhancement for better personalization (only for featured articles to manage API costs)
  const personalizedArticles = await contentPersonalizationEngine.personalizeContent(rawArticles);
  const featuredArticles = await contentPersonalizationEngine.getFeaturedArticles(rawArticles, 2);
  const latestArticles = personalizedArticles.slice(0, 12); // Get top 12 personalized articles

  return (
    <>
      <StructuredData type="WebSite" data={websiteStructuredData} />
      <StructuredData type="Organization" data={organizationStructuredData} />
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 theme-transition">
        <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Modern Hero Section */}
        <section className="mb-16">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 rounded-3xl"></div>
            
            {/* Content */}
            <div className="relative px-8 py-16 md:py-24 text-center">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700/50">
                    ✨ Multi-polar News Platform
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 tracking-tight">
                  Authentic
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                    Global Perspectives
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Discover balanced coverage from BRICS nations, Indonesia, and Bali. 
                  Get the stories mainstream media overlooks.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <div className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Live Updates</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">BRICS • Indonesia • Bali</span>
                  </div>
                  <div className="flex items-center px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Independent Journalism</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subtle decorative elements */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
          </div>
        </section>

        {/* Newsletter Signup Hero */}
        <section className="mb-12">
          <HeroNewsletterSignup />
        </section>

        {/* Leaderboard Ad */}
        <section className="mb-8">
          <GoogleAds type="leaderboard" className="mx-auto" />
        </section>

        {/* Loading State */}
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400 theme-transition">Loading latest news...</p>
          </div>
        }>
          {rawArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">Unable to fetch news at the moment.</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500">
                This could be due to RSS feed issues or network connectivity. Please try again later.
              </p>
            </div>
          ) : (
            <>
              {/* Featured Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                    Featured Stories
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
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-3">
                    <span className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></span>
                    Latest News
                  </h2>
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Articles */}
                    <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
                      {latestArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                    
                    {/* Sidebar with ads and newsletter */}
                    <div className="lg:col-span-1 space-y-6">
                      <GoogleAds type="sidebar" />
                      <CompactNewsletterSignup />
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
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">{rawArticles.length}</div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">🌊 Articles Today</div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 theme-transition">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 theme-transition">
                      {rawArticles.filter(a => a.category === 'BRICS').length}
                    </div>
                    <div className="text-sm text-teal-700 dark:text-teal-300 theme-transition font-medium">🌺 BRICS Paradise</div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 theme-transition">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 theme-transition">
                      {rawArticles.filter(a => a.category === 'Indonesia').length}
                    </div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 theme-transition font-medium">🏝️ Indonesia Islands</div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">
                      {new Set(rawArticles.map(a => a.source)).size}
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
          <div className="grid md:grid-cols-4 gap-8">
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
            <div>
              <h4 className="font-semibold mb-4 text-emerald-100">📧 Join Paradise</h4>
              <p className="text-emerald-200 dark:text-teal-200 text-xs mb-3 theme-transition">
                Subscribe to get tropical news delivered to your inbox! 🌺
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <CompactNewsletterSignup className="bg-transparent border-white/30" />
              </div>
            </div>
          </div>
          <div className="border-t border-emerald-700/50 dark:border-teal-800/50 mt-8 pt-4 text-center text-sm text-emerald-300 dark:text-teal-300 theme-transition">
            <p>© 2024 Bali Report 🌺 Content flows from sacred sources; views reflect original temple wisdom.</p>
          </div>
        </div>
      </footer>
      
      {/* Floating Newsletter Signup */}
      <FloatingNewsletterSignup />
      </div>
    </>
  );
}
