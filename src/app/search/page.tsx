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
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <span>›</span>
            <span className="font-medium text-red-600">Search</span>
            {query && (
              <>
                <span>›</span>
                <span className="font-medium text-gray-800">"{query}"</span>
              </>
            )}
          </div>
        </nav>

        {/* Search Header */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-4xl mr-4">🔍</span>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Search News
                </h1>
                <p className="text-red-200 mt-2">
                  Find articles from BRICS and Indonesian sources
                </p>
              </div>
            </div>
            
            {/* Search Form */}
            <div className="mt-6 max-w-2xl">
              <SearchBar 
                placeholder="Search articles, sources, or topics..." 
                className="w-full"
              />
            </div>
          </div>
        </section>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching through articles...</p>
          </div>
        }>
          {!query.trim() ? (
            /* No Query State */
            <div className="text-center py-16">
              <span className="text-8xl mb-6 block">📰</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Search Through Our News Archive
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Use the search bar above to find articles from our collection of BRICS-aligned and 
                Indonesian news sources. Search by title, content, or source name.
              </p>
              
              {/* Search Suggestions */}
              <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Try searching for:</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Topics</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>• Ukraine</div>
                      <div>• China economy</div>
                      <div>• Indonesia politics</div>
                      <div>• BRICS summit</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-amber-700 mb-2">Sources</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>• RT News</div>
                      <div>• TASS</div>
                      <div>• Xinhua</div>
                      <div>• Antara News</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">Regions</h4>
                    <div className="space-y-1 text-gray-600">
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
              <span className="text-8xl mb-6 block">🔍</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Results Found
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                We couldn't find any articles matching "{query}". Try different keywords 
                or browse our category pages.
              </p>
              
              {/* Search Tips */}
              <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Search Tips</h3>
                <div className="text-blue-800 text-sm space-y-2">
                  <p>• Try broader terms (e.g., "economy" instead of "economic policy")</p>
                  <p>• Check spelling and try alternative words</p>
                  <p>• Use single keywords rather than full phrases</p>
                  <p>• Browse our <Link href="/brics" className="underline font-medium">BRICS</Link>, {" "}
                     <Link href="/indonesia" className="underline font-medium">Indonesia</Link>, or {" "}
                     <Link href="/bali" className="underline font-medium">Bali</Link> categories</p>
                </div>
              </div>
            </div>
          ) : (
            /* Results Found */
            <>
              {/* Search Results Header */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results for "{query}"
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                
                {/* Results Statistics */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-red-600">
                        {filteredArticles.filter(a => a.category === 'BRICS').length}
                      </span> BRICS articles
                    </div>
                    <div>
                      <span className="font-medium text-yellow-600">
                        {filteredArticles.filter(a => a.category === 'Indonesia').length}
                      </span> Indonesia articles
                    </div>
                    <div>
                      <span className="font-medium text-amber-600">
                        {new Set(filteredArticles.map(a => a.source)).size}
                      </span> different sources
                    </div>
                  </div>
                </div>
              </section>

              {/* Featured Results */}
              {featuredResults.length > 0 && (
                <section className="mb-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-red-600 pb-2">
                    🔥 Top Results
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
                  <h3 className="text-xl font-bold text-gray-900 mb-6 border-b-2 border-amber-600 pb-2">
                    📰 All Results ({otherResults.length} more)
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