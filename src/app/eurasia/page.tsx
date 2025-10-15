import ArticleCard from "@/components/ArticleCard";
import { Article } from "@/lib/rss-parser";

export const dynamic = "force-dynamic";
export const revalidate = 60;

async function getArticles(): Promise<Article[]> {
  try {
    const baseUrl = "http://localhost:3000"; // Use localhost for dev
    const response = await fetch(`${baseUrl}/api/articles/eurasia`, {
      next: { revalidate: 60 },
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.success ? data.articles : [];
  } catch (err) {
    return [];
  }
}

export default async function EurasiaPage() {
  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🌍 Eurasia News & Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          News and analysis from Russia, Central Asian states, Caucasus region, and the broader Eurasian economic space.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No Eurasian articles available at the moment. Please check back later.
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