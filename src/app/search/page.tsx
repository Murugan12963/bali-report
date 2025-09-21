import { Suspense } from 'react';
import Header from '@/components/Header';
import ArticleCard from '@/components/ArticleCard';
import SearchBar from '@/components/SearchBar';
import { rssAggregator } from '@/lib/rss-parser';
import Link from 'next/link';

/**
 * Search results page for finding articles by query.
 */
export const metadata = {
  title: 'Search Results - Bali Report',
  description: 'Search through BRICS and Indonesian news articles from multiple international sources.',
  keywords: 'search, news, articles, BRICS, Indonesia, Bali, find news',
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const allArticles = await rssAggregator.fetchAllSources();
  
  // Enhanced search functionality with better scoring and filtering
  const filteredArticles = query.trim() 
    ? allArticles.filter(article => {
        const searchQuery = query.toLowerCase();
        const titleMatch = article.title.toLowerCase().includes(searchQuery);
        const descMatch = article.description.toLowerCase().includes(searchQuery);
        const sourceMatch = article.source.toLowerCase().includes(searchQuery);
        const categoryMatch = article.category?.toLowerCase().includes(searchQuery);
        const authorMatch = article.author?.toLowerCase().includes(searchQuery) || false;
        
        return titleMatch || descMatch || sourceMatch || categoryMatch || authorMatch;
      })
      // Sort by relevance: title matches first, then description, then other fields
      .sort((a, b) => {
        const searchQuery = query.toLowerCase();
        const aTitle = a.title.toLowerCase().includes(searchQuery) ? 3 : 0;
        const bTitle = b.title.toLowerCase().includes(searchQuery) ? 3 : 0;
        const aDesc = a.description.toLowerCase().includes(searchQuery) ? 2 : 0;
        const bDesc = b.description.toLowerCase().includes(searchQuery) ? 2 : 0;
        const aSource = a.source.toLowerCase().includes(searchQuery) ? 1 : 0;
        const bSource = b.source.toLowerCase().includes(searchQuery) ? 1 : 0;
        
        const aScore = aTitle + aDesc + aSource;
        const bScore = bTitle + bDesc + bSource;
        
        if (aScore !== bScore) return bScore - aScore;
        // If relevance is equal, sort by date (newest first)
        return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
      })
    : [];

  const featuredResults = filteredArticles.slice(0, 2);
  const otherResults = filteredArticles.slice(2);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 theme-transition">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-zinc-600 dark:text-zinc-400 theme-transition">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 theme-transition">Home</Link>
            <span>›</span>
            <span className="font-medium text-blue-600 dark:text-blue-400 theme-transition">Search</span>
            {query && (
              <>
                <span>›</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">"{query}"</span>
              </>
            )}
          </div>
        </nav>

        {/* Search Header */}
        <section className="mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700 theme-transition">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm mr-4">
                <span className="text-2xl text-white">🔍</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                  Dig Deeper
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  Search 530+ daily articles the mainstream media ignores
                </p>
              </div>
            </div>
            
            {/* Search Form */}
            <div className="max-w-2xl">
              <SearchBar 
                placeholder="Search articles, sources, or topics..." 
                className="w-full"
              />
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400 theme-transition">Searching through articles...</p>
          </div>
        }>
          {!query.trim() ? (
            /* No Query State */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
                <span className="text-4xl text-white">📰</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                What Story Are You Looking For?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
                Search through thousands of unfiltered reports from Russia, China, Indonesia, and beyond. 
                Find the truth they don't want you to see.
              </p>
              
              {/* Search Suggestions */}
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center"><span className="mr-2">🔥</span> Hot Topics Right Now:</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">Topics</h4>
                    <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                      <div>• Ukraine</div>
                      <div>• China economy</div>
                      <div>• Indonesia politics</div>
                      <div>• BRICS summit</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-2">Sources</h4>
                    <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                      <div>• RT News</div>
                      <div>• TASS</div>
                      <div>• Xinhua</div>
                      <div>• Antara News</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-600 dark:text-indigo-400 mb-2">Regions</h4>
                    <div className="space-y-1 text-zinc-600 dark:text-zinc-400">
                      <div>• Russia</div>
                      <div>• Southeast Asia</div>
                      <div>• Middle East</div>
                      <div>• Bali tourism</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredArticles.length === 0 ? (
            /* No Results State */
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-zinc-400 to-zinc-600 rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-6">
                <span className="text-4xl text-white">🔍</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                No Results Found
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
                No matches for "{query}" yet. The story might be developing, or try searching 
                with different terms to uncover what you're looking for.
              </p>
              
              {/* Search Tips */}
              <div className="bg-blue-50 dark:bg-zinc-800 rounded-lg p-6 max-w-2xl mx-auto border border-blue-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3 flex items-center"><span className="mr-2">💡</span> Search Tips</h3>
                <div className="text-blue-800 dark:text-blue-300 text-sm space-y-2">
                  <p>• Try broader terms (e.g., "economy" instead of "economic policy")</p>
                  <p>• Check spelling and try alternative words</p>
                  <p>• Use single keywords rather than full phrases</p>
                  <p>• Browse our <Link href="/brics" className="underline font-medium hover:text-blue-600 dark:hover:text-blue-300">BRICS</Link>, {" "}
                     <Link href="/indonesia" className="underline font-medium hover:text-blue-600 dark:hover:text-blue-300">Indonesia</Link>, or {" "}
                     <Link href="/bali" className="underline font-medium hover:text-blue-600 dark:hover:text-blue-300">Bali</Link> categories</p>
                </div>
              </div>
            </div>
          ) : (
            /* Results Found */
            <>
              {/* Search Results Header */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Search Results for "{query}"
                  </h2>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                
                {/* Results Statistics */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-4">
                  <div className="flex flex-wrap gap-6 text-sm text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {filteredArticles.filter(a => a.category === 'BRICS').length}
                      </span> BRICS articles
                    </div>
                    <div>
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {filteredArticles.filter(a => a.category === 'Indonesia').length}
                      </span> Indonesia articles
                    </div>
                    <div>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {new Set(filteredArticles.map(a => a.source)).size}
                      </span> different sources
                    </div>
                  </div>
                </div>
              </section>

              {/* Featured Results */}
              {featuredResults.length > 0 && (
                <section className="mb-12">
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b-2 border-blue-600 pb-2 flex items-center">
                    <span className="mr-2">🔥</span> Top Results
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    {featuredResults.map((article) => (
                      <ArticleCard key={article.id} article={article} featured={true} />
                    ))}
                  </div>
                </section>
              )}

              {/* All Results */}
              {otherResults.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 border-b-2 border-purple-600 pb-2 flex items-center">
                    <span className="mr-2">📰</span> All Results ({otherResults.length} more)
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherResults.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </Suspense>
      </main>
    </div>
  );
}