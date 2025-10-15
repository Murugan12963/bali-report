import ArticleCard from "@/components/ArticleCard";
import { Article, fetchIndonesiaArticles, fetchBaliArticles } from "@/lib/rss-parser";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getArticles(): Promise<Article[]> {
  try {
    console.log('🌏 Asia Page: Fetching articles from RSS.app feeds...');
    
    // Fetch Indonesia and Bali articles for Asia region
    const [indonesiaArticles, baliArticles] = await Promise.all([
      fetchIndonesiaArticles(),
      fetchBaliArticles()
    ]);
    
    const allArticles = [...indonesiaArticles, ...baliArticles];
    
    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    console.log(`📊 Asia Page: Got ${allArticles.length} articles from RSS.app feeds (Indonesia: ${indonesiaArticles.length}, Bali: ${baliArticles.length})`);
    
    return allArticles;
  } catch (err) {
    console.error('❌ Asia Page: Error fetching RSS.app articles:', err);
    return [];
  }
}

export default async function AsiaPage() {
  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🌏 Asia News & Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Regional perspectives from Indonesia, Bali, and Southeast Asia. Powered by RSS.app for reliable content delivery.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No Asian articles available at the moment. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: Article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}