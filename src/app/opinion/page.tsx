'use client';

import { useState, useEffect } from 'react';
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
    link: '/opinion/brics-multipolar-news-alternative',
    description: 'As Western media consolidation reaches unprecedented levels, the need for diverse perspectives from BRICS nations has never been more critical. This analysis examines why multipolar journalism is essential for global understanding.',
    pubDate: '2025-10-03T10:00:00Z',
    author: 'Dr. Maya Sari',
    readTime: 8,
    type: 'editorial',
    category: 'Media Analysis',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Dr. Maya Sari is a media studies professor at University of Indonesia and expert on Southeast Asian journalism.',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
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
  const [opinionArticles, setOpinionArticles] = useState<OpinionArticle[]>(OPINION_ARTICLES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real opinion articles from RSS.app
  useEffect(() => {
    const fetchOpinionArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🗞️ Fetching opinion articles from RSS.app...');
        const response = await fetch('/api/opinions?limit=50');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch opinions: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
          // Convert API articles to OpinionArticle format
          const convertedArticles: OpinionArticle[] = data.articles.map((article: Article, index: number) => ({
            id: article.id,
            title: article.title,
            link: article.link,
            description: article.description,
            pubDate: article.pubDate,
            author: article.author || 'Editorial Team',
            readTime: Math.max(3, Math.ceil(article.description.split(' ').length / 200)),
            type: getOpinionType(article.source, article.title),
            category: getOpinionCategory(article.source, article.title),
            source: article.source,
            sourceUrl: article.sourceUrl,
            authorBio: getAuthorBio(article.source),
            authorImage: article.imageUrl
          }));
          
          // Combine with mock articles for now
          setOpinionArticles([...OPINION_ARTICLES, ...convertedArticles]);
          console.log(`✅ Loaded ${convertedArticles.length} opinion articles from RSS.app`);
        } else {
          console.log('⚠️ No opinion articles found, using mock data');
        }
        
      } catch (err) {
        console.error('❌ Error fetching opinion articles:', err);
        setError('Failed to load latest opinions. Showing cached content.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpinionArticles();
  }, []);

  // Helper functions for article conversion
  const getOpinionType = (source: string, title: string): OpinionArticle['type'] => {
    if (title.toLowerCase().includes('editorial') || source.includes('Editorial')) return 'editorial';
    if (title.toLowerCase().includes('op-ed') || title.toLowerCase().includes('opinion')) return 'op-ed';
    if (title.toLowerCase().includes('analysis')) return 'analysis';
    return 'commentary';
  };

  const getOpinionCategory = (source: string, title: string): string => {
    if (source.includes('SCMP') || source.includes('Global Times')) return 'China Analysis';
    if (source.includes('NDTV')) return 'India Perspective';
    if (source.includes('RT')) return 'Russia Perspective';
    if (source.includes('Jakarta')) return 'Indonesia Focus';
    return 'Global Affairs';
  };

  const getAuthorBio = (source: string): string => {
    const bios: {[key: string]: string} = {
      'SCMP': 'South China Morning Post editorial team specializing in Asian geopolitics',
      'NDTV': 'NDTV opinion writers covering Indian and South Asian affairs',
      'Global Times': 'Global Times editorial staff focusing on Chinese international relations',
      'RT': 'RT opinion contributors providing alternative perspectives on global events',
      'Jakarta Post': 'Jakarta Post editorial team covering Indonesian and ASEAN affairs'
    };
    
    for (const [key, bio] of Object.entries(bios)) {
      if (source.includes(key)) return bio;
    }
    
    return 'International correspondent specializing in multipolar analysis';
  };

  // Social sharing function
  const shareArticle = (article: OpinionArticle, platform: 'twitter' | 'linkedin' | 'telegram') => {
    const url = `https://bali.report${article.link}`;
    const text = `${article.title} by ${article.author} - Multipolar perspective from Bali Report #MultipolarBali #BRICS`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const types: OpinionArticle['type'][] = ['editorial', 'op-ed', 'analysis', 'commentary'];
  const categories = [...new Set(opinionArticles.map(article => article.category).filter(Boolean))];
  const authors = [...new Set(opinionArticles.map(article => article.author))];

  const filteredArticles = opinionArticles.filter(article => {
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 mb-8">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-teal-500 hover:bg-teal-400 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading latest opinions from RSS.app...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

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
                {Math.round(opinionArticles.reduce((sum, article) => sum + article.readTime, 0) / opinionArticles.length)}
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

        {/* Highlights Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🌟 Community Highlights
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                  4.5★
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Highest Rated This Week
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  "BRICS Alternative"
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {Math.max(...opinionArticles.map(a => a.description.split(' ').length))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Most Discussed
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Comments This Month
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Active Perspectives
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Diverse Viewpoints
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  📈 Trending Discussions
                </h3>
                <Link 
                  href="/opinion/highlights"
                  className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔥</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        China's Digital Silk Road Impact
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        47 comments • 4.2★ rating
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 px-2 py-1 rounded">
                    Hot
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💡</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Indonesia's Strategic Balancing Act
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        32 comments • 4.4★ rating
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                    Rising
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

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
                  <div className="flex items-center gap-3">
                    <Link 
                      href={featuredArticle.link}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200 inline-block"
                    >
                      Read Full Article
                    </Link>
                    
                    {/* Social Sharing */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
                      <button
                        onClick={() => shareArticle(featuredArticle, 'twitter')}
                        className="p-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Share on X/Twitter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => shareArticle(featuredArticle, 'linkedin')}
                        className="p-2 text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                        title="Share on LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => shareArticle(featuredArticle, 'telegram')}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Share on Telegram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
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
                    <div className="flex items-center justify-between mb-3">
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
                    
                    {/* Social Sharing Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Share:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => shareArticle(article, 'twitter')}
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Share on X/Twitter"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => shareArticle(article, 'linkedin')}
                          className="p-1.5 text-gray-400 hover:text-blue-700 transition-colors"
                          title="Share on LinkedIn"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => shareArticle(article, 'telegram')}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Share on Telegram"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </button>
                      </div>
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