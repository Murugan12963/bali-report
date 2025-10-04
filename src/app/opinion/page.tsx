'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/rss-parser';

interface OpinionArticle extends Article {
  author: string;
  readTime: number;
  type: 'editorial' | 'op-ed' | 'analysis' | 'commentary';
  authorBio?: string;
  authorImage?: string;
}

// Mock opinion articles data
const OPINION_ARTICLES: OpinionArticle[] = [
  {
    id: 'op-1',
    title: 'The BRICS Alternative: Why Multipolar News Matters More Than Ever',
    link: '/opinion/op-1',
    description: 'As Western media consolidation reaches unprecedented levels, the need for diverse perspectives from BRICS nations has never been more critical. This analysis examines why multipolar journalism is essential for global understanding.',
    pubDate: '2025-10-03T10:00:00Z',
    author: 'Dr. Maya Sari',
    readTime: 8,
    type: 'editorial',
    category: 'Media Analysis',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Dr. Maya Sari is a media studies professor at University of Indonesia and expert on Southeast Asian journalism.',
    authorImage: '/authors/maya-sari.jpg'
  },
  {
    id: 'op-2',
    title: 'Indonesia\'s Strategic Role in the New Global Order',
    link: '/opinion/op-2',
    description: 'As BRICS expansion continues, Indonesia finds itself at a crucial crossroads. Can the archipelago nation balance its traditional Western partnerships with emerging multipolar opportunities?',
    pubDate: '2025-10-02T14:30:00Z',
    author: 'Ahmad Rizki',
    readTime: 12,
    type: 'analysis',
    category: 'Geopolitics',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Ahmad Rizki is a senior analyst specializing in ASEAN-BRICS relations and economic policy.',
  },
  {
    id: 'op-3',
    title: 'Beyond Tourism: Bali\'s Potential as a Tech Hub',
    link: '/opinion/op-3',
    description: 'While known for its beaches and culture, Bali is quietly positioning itself as Indonesia\'s next major technology center. Here\'s why global investors should pay attention.',
    pubDate: '2025-10-01T16:45:00Z',
    author: 'Sarah Wijaya',
    readTime: 6,
    type: 'commentary',
    category: 'Technology',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Sarah Wijaya is a technology journalist and startup advisor based in Denpasar.',
  },
  {
    id: 'op-4',
    title: 'The Digital Silk Road: China\'s Information Infrastructure in Southeast Asia',
    link: '/opinion/op-4',
    description: 'China\'s Belt and Road Initiative extends beyond physical infrastructure to digital networks. What does this mean for information sovereignty in the region?',
    pubDate: '2025-09-30T11:20:00Z',
    author: 'Dr. Liu Wei',
    readTime: 10,
    type: 'op-ed',
    category: 'Digital Policy',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Dr. Liu Wei is a visiting scholar at the Center for Strategic Studies, focusing on digital diplomacy.',
  },
  {
    id: 'op-5',
    title: 'Climate Action Through BRICS Cooperation: Lessons from Brazil and India',
    link: '/opinion/op-5',
    description: 'As COP negotiations continue, BRICS nations are pioneering innovative approaches to climate action. Indonesia can learn from successful initiatives in Brazil and India.',
    pubDate: '2025-09-29T09:15:00Z',
    author: 'Dr. Priya Sharma',
    readTime: 9,
    type: 'analysis',
    category: 'Environment',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Dr. Priya Sharma is an environmental economist specializing in South-South cooperation mechanisms.',
  },
  {
    id: 'op-6',
    title: 'Decoding Media Bias: A Reader\'s Guide to Information Literacy',
    link: '/opinion/op-6',
    description: 'In an era of information warfare, how can readers navigate competing narratives? This guide provides practical tools for identifying bias and finding truth.',
    pubDate: '2025-09-28T13:40:00Z',
    author: 'Prof. James Mitchell',
    readTime: 7,
    type: 'editorial',
    category: 'Media Literacy',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Prof. James Mitchell teaches journalism ethics and media literacy at various institutions across Asia.',
  }
];

interface OpinionFilters {
  type?: OpinionArticle['type'];
  category?: string;
  author?: string;
  searchQuery?: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getTypeColor = (type: OpinionArticle['type']) => {
  switch (type) {
    case 'editorial':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'op-ed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'analysis':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'commentary':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function OpinionPage() {
  const [filters, setFilters] = useState<OpinionFilters>({});

  const types: OpinionArticle['type'][] = ['editorial', 'op-ed', 'analysis', 'commentary'];
  const categories = [...new Set(OPINION_ARTICLES.map(article => article.category).filter(Boolean))];
  const authors = [...new Set(OPINION_ARTICLES.map(article => article.author))];

  const filteredArticles = OPINION_ARTICLES.filter(article => {
    if (filters.type && article.type !== filters.type) return false;
    if (filters.category && article.category !== filters.category) return false;
    if (filters.author && article.author !== filters.author) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const featuredArticle = filteredArticles[0];
  const remainingArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Opinion & Analysis
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Diverse perspectives on global affairs from BRICS nations and beyond. 
            Editorial content, op-eds, and in-depth analysis from leading voices 
            in multipolar journalism.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {filteredArticles.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Opinion Pieces</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {authors.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Contributors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {categories.length}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(OPINION_ARTICLES.reduce((sum, article) => sum + article.readTime, 0) / OPINION_ARTICLES.length)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Avg. Read Time</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  type: (e.target.value || undefined) as OpinionArticle['type']
                }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.value || undefined
                }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <select
                value={filters.author || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  author: e.target.value || undefined
                }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Authors</option>
                {authors.map(author => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search opinions..."
                value={filters.searchQuery || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  searchQuery: e.target.value || undefined
                }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Opinion
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(featuredArticle.type)}`}>
                    {featuredArticle.type.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {featuredArticle.readTime} min read
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {featuredArticle.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {featuredArticle.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {featuredArticle.authorImage && (
                      <img
                        src={featuredArticle.authorImage}
                        alt={featuredArticle.author}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {featuredArticle.author}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(featuredArticle.pubDate)}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={featuredArticle.link}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200 inline-block"
                  >
                    Read Full Article
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Articles Grid */}
        {remainingArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Latest Opinions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingArticles.map(article => (
                <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(article.type)}`}>
                        {article.type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {article.readTime} min
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {article.author}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(article.pubDate)}
                        </p>
                      </div>
                      <Link 
                        href={article.link}
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium transition-colors duration-200"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              No opinion pieces found
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-teal-50 dark:bg-teal-900/20 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Share Your Perspective
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            We welcome diverse viewpoints from BRICS nations and the Global South. 
            Submit your op-ed or analysis piece to join the conversation.
          </p>
          <button className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors duration-200">
            Submit Article
          </button>
        </div>
      </div>
    </div>
  );
}