import { Metadata } from "next";
import { Suspense } from "react";
import ArticleCard from "@/components/ArticleCard";
import { rssAggregator } from "@/lib/rss-parser";
import Link from "next/link";
import StockMarketTracker from "@/components/StockMarketTracker";

import { generateSEOMetadata } from "@/components/SEOHead";
import {
  generateCategoryMetadata,
  generateBreadcrumbSchema,
} from "@/lib/metadata";

/**
 * Bali category page - shows Bali-specific local news.
 */
export const metadata: Metadata = generateCategoryMetadata("Bali");

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
  const topArticle = baliRelatedArticles[0] || null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bali.report" },
    { name: "Bali News", url: "https://bali.report/bali" },
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 theme-transition">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400 theme-transition">
            <Link
              href="/"
              className="hover:text-blue-600 dark:hover:text-teal-400 theme-transition"
            >
              Home
            </Link>
            <span>›</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100 theme-transition">
              Bali
            </span>
          </div>
        </nav>

        {/* Stock Market Tracker - Indonesian Markets for Bali */}
        <section className="mb-8">
          <StockMarketTracker markets="Indonesia" />
        </section>

        {/* Page Header - Modern Hero */}
        <section className="mb-12">
          <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 theme-transition">
            <div className="relative">
              {topArticle ? (
                <>
                  {/* Featured Image */}
                  {topArticle.imageUrl && (
                    <div className="relative w-full h-64 md:h-80 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={topArticle.imageUrl}
                        alt={topArticle.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>
                  )}
                  <div className="p-8">
                    <div className="mb-4">
                      <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 theme-transition leading-tight">
                        {topArticle.title}
                      </h1>
                      <p className="text-zinc-600 dark:text-zinc-400 theme-transition font-medium text-sm">
                        {topArticle.source} • {new Date(topArticle.pubDate).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6 max-w-4xl theme-transition leading-relaxed">
                      {topArticle.description?.substring(0, 200)}...
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a
                        href={topArticle.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm"
                      >
                        Read Full Story
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8">
                  <div className="mb-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 theme-transition leading-tight">
                      Bali News & Updates
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 theme-transition font-medium">
                      Beyond Tourist Traps: What's Really Happening in Paradise
                    </p>
                  </div>
                  <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6 max-w-4xl theme-transition leading-relaxed">
                    4 million locals. 6 million tourists yearly. The world's most famous island that Instagram doesn't show you. Real news about overtourism, water crisis, cultural preservation, and local struggles for balance.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      Tourism & Culture
                    </span>
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      Environment & Sustainability
                    </span>
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      Local Communities
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <Suspense
          fallback={
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-teal-600 mx-auto mb-4"></div>
              <p className="text-zinc-700 dark:text-zinc-300 theme-transition">
                Loading articles...
              </p>
            </div>
          }
        >
          {baliRelatedArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                No Bali-specific articles available at the moment.
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6">
                We're working to add more local Bali news sources. Check back soon!
              </p>

              {/* Placeholder for future sources */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                  Coming Soon: Local Bali Sources
                </h3>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
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
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      Currently showing articles mentioning Bali from our general sources. Dedicated Bali local sources coming soon!
                    </p>
                  </div>
                </div>
              )}

              {/* Featured Bali Articles */}
              {featuredArticles.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b-2 border-zinc-200 dark:border-zinc-800 pb-3 theme-transition">
                    Featured Stories
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
                  <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b-2 border-zinc-200 dark:border-zinc-800 pb-3 theme-transition">
                    All Articles ({latestArticles.length})
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latestArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}

              {/* Bali Stats */}
              <section className="mt-12 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800 theme-transition">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 theme-transition">
                  Coverage Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="text-2xl font-bold text-blue-600 dark:text-teal-400 theme-transition">
                      {baliRelatedArticles.length}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 theme-transition font-medium">
                      Total Articles
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="text-2xl font-bold text-blue-600 dark:text-teal-400 theme-transition">
                      {articles.length}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 theme-transition font-medium">
                      Direct Sources
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="text-2xl font-bold text-blue-600 dark:text-teal-400 theme-transition">
                      {
                        baliRelatedArticles.filter(
                          (a) =>
                            new Date(a.pubDate) >
                            new Date(Date.now() - 24 * 60 * 60 * 1000),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 theme-transition font-medium">
                      Last 24 Hours
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="text-2xl font-bold text-blue-600 dark:text-teal-400 theme-transition">
                      9
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 theme-transition font-medium">
                      RSS Sources
                    </div>
                  </div>
                </div>
              </section>

              {/* About Bali */}
              <section className="mt-8 bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 theme-transition">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 theme-transition">
                  About Bali
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4 theme-transition leading-relaxed">
                  Bali generates $20 billion in tourism but locals can't afford rice. Sacred sites become Instagram backdrops. Water tables drop while resorts fill pools. This is the Bali story travel bloggers won't tell you — straight from local sources.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 theme-transition">
                      Culture & Heritage
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 theme-transition">
                      Hindu temples, traditional arts, ceremonies
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 theme-transition">
                      Tourism & Economy
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 theme-transition">
                      Beaches, resorts, local businesses
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700 theme-transition">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 theme-transition">
                      Environment
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 theme-transition">
                      Sustainability, water resources, preservation
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
