import { Article, fetchAllArticles } from "@/lib/rss-parser";
import ArticleCard from "@/components/ArticleCard";
import AdsterraAds from "@/components/AdsterraAds";
import MarketTicker from "@/components/MarketTicker";
import {
  HeroNewsletterSignup,
  CompactNewsletterSignup,
  FloatingNewsletterSignup,
} from "@/components/NewsletterSignup";
import {
  StructuredData,
  websiteStructuredData,
  organizationStructuredData,
} from "@/components/SEOHead";
import { generateBreadcrumbSchema } from "@/lib/metadata";

// Force dynamic rendering with revalidation
export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getArticles(): Promise<Article[]> {
  try {
    console.log('🌺 Homepage: Fetching articles from RSS.app feeds...');
    
    // Use RSS.app-only feeds for simplified, reliable news aggregation
    const articles = await fetchAllArticles();
    
    console.log(`📊 Homepage: Got ${articles.length} articles from RSS.app feeds`);
    
    return articles;
  } catch (err) {
    console.error('❌ Homepage: Error fetching RSS.app articles:', err);
    return [];
  }
}

export default async function Home() {
  const articles = await getArticles();
  const featuredArticles = articles.slice(0, 6);
  const recentArticles = articles.slice(6, 16);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
  ]);

  return (
    <>
      {/* Structured Data */}
      <StructuredData type="WebSite" data={websiteStructuredData} />
      <StructuredData type="Organization" data={organizationStructuredData} />
      <StructuredData type="WebSite" data={breadcrumbSchema} />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="relative pt-8 pb-16 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-teal-400 dark:via-blue-400 dark:to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
                Multi-polar News Perspectives
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-4xl mx-auto">
                Reliable news aggregation powered by RSS.app • Real-time
                insights from BRICS nations and Indonesia
              </p>

              {/* Hero Newsletter Signup */}
              <HeroNewsletterSignup />
            </div>

            {/* Market Ticker */}
            <MarketTicker />
          </div>
        </section>

        {/* Featured Articles Section */}
        <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                📈 Featured Stories
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Compact Newsletter Signup */}
            <CompactNewsletterSignup />
          </div>
        </section>

        {/* Adsterra Ads Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <AdsterraAds
              type="native"
              zoneId={process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ADS}
            />
          </div>
        </section>

        {/* Recent Articles Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                🌍 Latest Updates
              </h2>
              <a
                href="/search"
                className="text-blue-600 hover:text-blue-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold transition-colors"
              >
                View All →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>

        {/* Floating Newsletter Signup */}
        <FloatingNewsletterSignup />
      </div>
    </>
  );
}
