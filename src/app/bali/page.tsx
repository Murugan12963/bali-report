import { Suspense } from "react";
import ArticleCard from "@/components/ArticleCard";
import { rssAggregator } from "@/lib/rss-parser";
import Link from "next/link";
import StockMarketTracker from "@/components/StockMarketTracker";

import { generateSEOMetadata } from "@/components/SEOHead";

/**
 * Bali category page - shows Bali-specific local news.
 */
export const metadata = generateSEOMetadata({
  title: "Bali Local News - Island of the Gods Coverage | Bali Report",
  description:
    "Local Bali news covering tourism updates, cultural events, Hindu festivals, Denpasar politics, Ubud developments, and environmental issues. Island of the Gods local perspective with dedicated Balinese sources.",
  keywords:
    "Bali local news, Bali tourism, Bali culture, Hindu festivals, Denpasar, Ubud, Canggu, Sanur, Balinese culture, Island of the Gods, Bali politics, Bali environment, Nyepi, Galungan, Kuningan",
  canonical: "https://bali.report/bali",
});

export default async function BaliPage() {
  // Fetch Bali-specific articles including scraped sources
  const articles = await rssAggregator.fetchByCategory("Bali", true); // Enable scrapers
  const allArticles = await rssAggregator.fetchAllSources();

  // If no dedicated Bali articles, show Indonesia articles that might mention Bali
  const baliRelatedArticles =
    articles.length > 0
      ? articles
      : allArticles.filter(
          (article) =>
            article.title.toLowerCase().includes("bali") ||
            article.description.toLowerCase().includes("bali"),
        );

  const featuredArticles = baliRelatedArticles.slice(0, 2);
  const latestArticles = baliRelatedArticles.slice(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-teal-900/20 dark:to-emerald-900/10 theme-transition">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-teal-700 dark:text-teal-300 theme-transition">
            <Link
              href="/"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 theme-transition"
            >
              🌊 Home
            </Link>
            <span>›</span>
            <span className="font-medium text-amber-600 dark:text-amber-400 theme-transition">
              ⛩️ Sacred Bali
            </span>
          </div>
        </nav>

        {/* Stock Market Tracker - Indonesian Markets for Bali */}
        <section className="mb-8">
          <StockMarketTracker markets="Indonesia" />
        </section>

        {/* Page Header */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 dark:from-amber-700 dark:via-orange-700 dark:to-red-700 text-white rounded-2xl p-8 shadow-2xl shadow-amber-500/20 relative overflow-hidden theme-transition">
            {/* Sacred Balinese decorative elements */}
            <div className="absolute top-0 right-0 opacity-15">
              <div className="text-8xl transform rotate-12">⛩️</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-15">
              <div className="text-6xl transform -rotate-12">🌺</div>
            </div>
            <div className="absolute top-1/2 right-1/4 opacity-10">
              <div className="text-5xl transform rotate-45">🕏</div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">⛩️</span>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-shadow-lg">
                    Real Bali Revealed
                  </h1>
                  <p className="text-amber-200 dark:text-orange-200 mt-2 theme-transition">
                    🌴 Beyond Tourist Traps: What's Really Happening in Paradise
                  </p>
                </div>
              </div>
              <p className="text-xl text-amber-100 dark:text-orange-100 mb-6 max-w-4xl theme-transition">
                4 million locals. 6 million tourists yearly. The world&apos;s
                most famous island that Instagram doesn&apos;t show you. Real
                news about overtourism, water crisis, cultural preservation, and
                local struggles for balance.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  ⛩️ Denpasar Temple • 🌺 Ubud Sacred • 🌊 Canggu Waves
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🕏 Divine Culture & Sacred Festivals
                </span>
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🌺 Holy Tourism & Temple Environment
                </span>
              </div>
            </div>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-teal-700 dark:text-teal-300 theme-transition">
                ⛩️ Loading sacred temple sources...
              </p>
            </div>
          }
        >
          {baliRelatedArticles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🌺</span>
              <p className="text-gray-600 mb-4">
                No Bali-specific articles available at the moment.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                We&apos;re working to add more local Bali news sources. Check
                back soon!
              </p>

              {/* Placeholder for future sources */}
              <div className="bg-amber-50 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">
                  📰 Coming Soon: Local Bali Sources
                </h3>
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
                      Currently showing articles mentioning Bali from our
                      general sources. Dedicated Bali local sources coming soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Featured Bali Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-amber-600 dark:border-amber-400 pb-2 theme-transition">
                    ⛩️ Featured Sacred Temple Stories
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        featured={true}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All Bali Articles */}
              {latestArticles.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-6 border-b-4 border-orange-600 dark:border-orange-400 pb-2 theme-transition">
                    🌺 All Sacred Wisdom ({latestArticles.length} divine
                    articles)
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* Sacred Bali Stats */}
              <section className="mt-12 bg-gradient-to-r from-white via-amber-50/30 to-orange-50/30 dark:from-gray-800 dark:via-amber-900/10 dark:to-orange-900/10 rounded-2xl shadow-xl shadow-amber-100/20 dark:shadow-amber-900/10 p-6 border border-amber-100 dark:border-amber-800/30 theme-transition">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 theme-transition">
                  ⛩️ Sacred Temple Coverage
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 theme-transition">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 theme-transition">
                      {baliRelatedArticles.length}
                    </div>
                    <div className="text-sm text-amber-700 dark:text-amber-300 theme-transition font-medium">
                      🌺 Divine Articles
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 theme-transition">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 theme-transition">
                      {articles.length}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300 theme-transition font-medium">
                      🕏 Sacred Sources
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 theme-transition">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400 theme-transition">
                      {
                        baliRelatedArticles.filter(
                          (a) =>
                            new Date(a.pubDate) >
                            new Date(Date.now() - 24 * 60 * 60 * 1000),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-300 theme-transition font-medium">
                      ⛩️ Temple Day
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 theme-transition">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 theme-transition">
                      9
                    </div>
                    <div className="text-sm text-amber-700 dark:text-amber-300 theme-transition font-medium">
                      🏝️ Sacred Regencies
                    </div>
                  </div>
                </div>
              </section>

              {/* Sacred Bali Temple Context */}
              <section className="mt-8 bg-gradient-to-r from-emerald-50/50 via-amber-50/50 to-orange-50/50 dark:from-emerald-900/10 dark:via-amber-900/10 dark:to-orange-900/10 rounded-2xl p-6 border border-amber-200/50 dark:border-amber-800/30 theme-transition">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 theme-transition">
                  ⛩️ About Sacred Bali Temple Island
                </h3>
                <p className="text-amber-800 dark:text-amber-200 mb-4 theme-transition">
                  Bali generates $20 billion in tourism but locals can&apos;t
                  afford rice. Sacred sites become Instagram backdrops. Water
                  tables drop while resorts fill pools. This is the Bali story
                  travel bloggers won&apos;t tell you — straight from local
                  sources.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm theme-transition">
                    <div className="font-semibold text-orange-700 dark:text-orange-300 theme-transition">
                      🕏 Sacred Cultural
                    </div>
                    <div className="text-amber-700 dark:text-amber-300 theme-transition">
                      Divine Hindu temples, blessed arts, holy ceremonies
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm theme-transition">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-300 theme-transition">
                      🌺 Paradise Tourism
                    </div>
                    <div className="text-amber-700 dark:text-amber-300 theme-transition">
                      Sacred beaches, temple resorts, blessed visitors
                    </div>
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm theme-transition">
                    <div className="font-semibold text-teal-700 dark:text-teal-300 theme-transition">
                      🌊 Sacred Environment
                    </div>
                    <div className="text-amber-700 dark:text-amber-300 theme-transition">
                      Temple sustainability, divine preservation, holy waters
                    </div>
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
