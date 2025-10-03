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
 * BRICS category page - shows BRICS-aligned news sources.
 */
export const metadata: Metadata = generateCategoryMetadata("BRICS");

export default async function BRICSPage() {
  // Fetch BRICS-specific articles including scraped sources
  const articles = await rssAggregator.fetchByCategory("BRICS", true); // Enable scrapers
  const featuredArticles = articles.slice(0, 2);
  const latestArticles = articles.slice(2);
  const topArticle = articles[0] || null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://bali.report" },
    { name: "BRICS News", url: "https://bali.report/brics" },
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
              BRICS
            </span>
          </div>
        </nav>

        {/* Stock Market Tracker */}
        <section className="mb-8">
          <StockMarketTracker markets="BRICS" />
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
                      BRICS Alliance News
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 theme-transition font-medium">
                      The New Multipolar World Order
                    </p>
                  </div>
                  <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6 max-w-4xl theme-transition leading-relaxed">
                    Direct reports from nations representing 42% of the world's population and 31% of global GDP. These are the voices shaping tomorrow while Western media sleeps.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      RT News & TASS
                    </span>
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      Xinhua & CGTN
                    </span>
                    <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      Al Jazeera
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-teal-700 dark:text-teal-300 theme-transition">
                🌊 Loading paradise BRICS sources...
              </p>
            </div>
          }
        >
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📡</span>
              <p className="text-gray-600 mb-4">
                No BRICS articles available at the moment.
              </p>
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
                      <ArticleCard
                        key={article.id}
                        article={article}
                        featured={true}
                      />
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
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-4 theme-transition">
                  🌺 Paradise BRICS Flow
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">
                      {articles.length}
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">
                      🌊 Sacred Articles
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 theme-transition">
                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 theme-transition">
                      {new Set(articles.map((a) => a.source)).size}
                    </div>
                    <div className="text-sm text-teal-700 dark:text-teal-300 theme-transition font-medium">
                      ⛩️ Temple Sources
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 theme-transition">
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 theme-transition">
                      {
                        articles.filter(
                          (a) =>
                            new Date(a.pubDate) >
                            new Date(Date.now() - 24 * 60 * 60 * 1000),
                        ).length
                      }
                    </div>
                    <div className="text-sm text-cyan-700 dark:text-cyan-300 theme-transition font-medium">
                      🌴 Last Paradise Day
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 theme-transition">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 theme-transition">
                      {Math.round(
                        articles.length /
                          new Set(articles.map((a) => a.source)).size,
                      )}
                    </div>
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 theme-transition font-medium">
                      🦋 Avg/Source
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
