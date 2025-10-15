'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DisqusComments from '@/components/DisqusComments';

interface OpinionArticle {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  pubDate: string;
  author: string;
  readTime: number;
  type: 'editorial' | 'op-ed' | 'analysis' | 'commentary';
  category: string;
  source: string;
  sourceUrl: string;
  authorBio?: string;
  authorImage?: string;
  rating?: number;
  votes?: number;
}

// Extended mock articles with full content
const OPINION_ARTICLES: OpinionArticle[] = [
  {
    id: 'op-1',
    title: 'The BRICS Alternative: Why Multipolar News Matters More Than Ever',
    slug: 'brics-multipolar-news-alternative',
    description: 'As Western media consolidation reaches unprecedented levels, the need for diverse perspectives from BRICS nations has never been more critical. This analysis examines why multipolar journalism is essential for global understanding.',
    content: `The media landscape has undergone a dramatic transformation over the past two decades. What we're witnessing today is not merely technological disruption, but a fundamental shift in how information flows across the globe—and who controls those flows.

## The Consolidation Crisis

Western media consolidation has reached alarming levels. A handful of multinational corporations now control the vast majority of news outlets across North America and Europe. This concentration of ownership has led to a homogenization of perspectives that poorly serves global audiences seeking comprehensive understanding of world events.

The implications extend far beyond mere market dynamics. When news is filtered through a limited number of editorial perspectives—all sharing similar cultural, economic, and political assumptions—the result is a form of information monoculture that leaves audiences with incomplete pictures of reality.

## The BRICS Response

The BRICS nations—Brazil, Russia, India, China, and South Africa—have recognized this challenge and are developing alternative information ecosystems. These aren't merely "propaganda outlets" as Western critics often claim, but legitimate journalistic enterprises offering perspectives that have been systematically marginalized in Western media.

Consider coverage of economic development in Africa. Western outlets often frame Chinese investment through the lens of "debt diplomacy" or "neocolonialism." BRICS media sources provide additional context about infrastructure development, job creation, and South-South cooperation that challenges these simplified narratives.

## Why Diversity Matters

Multipolar journalism serves several crucial functions:

1. **Perspective Diversity**: Different cultural and historical contexts lead to different interpretations of the same events.

2. **Source Diversity**: BRICS media often have access to sources and stories that Western outlets ignore or can't reach.

3. **Agenda Diversity**: The issues that matter to audiences in São Paulo, Mumbai, or Johannesburg may differ significantly from those prioritized in New York or London.

4. **Methodological Diversity**: Different journalistic traditions bring different approaches to investigation and reporting.

## The Indonesian Context

Indonesia's position within this landscape is particularly interesting. As the world's largest Muslim-majority democracy and a key player in ASEAN, Indonesia offers unique insights into how multipolar journalism can serve regional audiences.

Indonesian media outlets are increasingly looking beyond traditional Western sources for international coverage. This shift reflects not anti-Western sentiment, but rather a growing recognition that comprehensive understanding requires multiple perspectives.

## Moving Forward

The future of global journalism lies not in the dominance of any single perspective, but in the healthy competition and complementarity of diverse voices. BRICS media initiatives represent one important component of this emerging ecosystem.

For audiences serious about understanding our complex world, consuming news from multiple perspectives—including but not limited to Western sources—is no longer optional. It's essential.

The rise of multipolar journalism doesn't threaten quality reporting; it enhances it by forcing all outlets to be more rigorous, more comprehensive, and more accountable to global rather than parochial standards.

As we navigate an increasingly interconnected world, the voices from BRICS nations aren't alternatives to Western media—they're necessary complements that help complete the picture of our shared reality.`,
    pubDate: '2025-01-03T10:00:00Z',
    author: 'Dr. Maya Sari',
    readTime: 8,
    type: 'editorial',
    category: 'Media Analysis',
    source: 'Bali Report Editorial',
    sourceUrl: 'https://bali.report',
    authorBio: 'Dr. Maya Sari is a media studies professor at University of Indonesia and expert on Southeast Asian journalism.',
    authorImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    rating: 4.5,
    votes: 124
  }
];

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

export default function OpinionArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<OpinionArticle | null>(null);
  const [rating, setRating] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Find article by slug
    const foundArticle = OPINION_ARTICLES.find(a => a.slug === params.slug);
    if (foundArticle) {
      setArticle(foundArticle);
      setRating(foundArticle.rating || 0);
    }
  }, [params.slug]);

  const handleVote = (newRating: number) => {
    if (!hasVoted && article) {
      setRating(newRating);
      setHasVoted(true);
      console.log(`Voted ${newRating} stars for article ${article.id}`);
    }
  };

  const shareArticle = (platform: 'twitter' | 'linkedin' | 'telegram') => {
    if (!article) return;
    
    const url = `https://bali.report/opinion/${article.slug}`;
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

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The opinion article you're looking for doesn't exist.
          </p>
          <Link 
            href="/opinion"
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors duration-200"
          >
            Back to Opinion Section
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8">
          <Link 
            href="/opinion"
            className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            ← Back to Opinion
          </Link>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(article.type)}`}>
              {article.type.replace('-', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {article.category}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {article.readTime} min read
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              {article.authorImage && (
                <img
                  src={article.authorImage}
                  alt={article.author}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {article.author}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(article.pubDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
              <button
                onClick={() => shareArticle('twitter')}
                className="p-2 text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Share on X/Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button
                onClick={() => shareArticle('linkedin')}
                className="p-2 text-gray-600 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-300 transition-colors"
                title="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={() => shareArticle('telegram')}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Share on Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Rate this article:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleVote(star)}
                    disabled={hasVoted}
                    className={`w-6 h-6 ${
                      star <= rating 
                        ? 'text-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'
                    } ${hasVoted ? 'cursor-not-allowed' : 'hover:text-yellow-400 cursor-pointer'} transition-colors`}
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({article.votes || 0} votes)
              </span>
            </div>
          </div>
        </header>

        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: article.content
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br/>')
                .replace(/## /g, '<h2>')
                .replace(/<p><h2>/g, '<h2>')
                .replace(/<\/h2><\/p>/g, '</h2>')
                .replace(/(\d+\.)\s/g, '<li>') 
            }} />
          </div>
        </article>

        {article.authorBio && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              About the Author
            </h3>
            <div className="flex items-start gap-4">
              {article.authorImage && (
                <img
                  src={article.authorImage}
                  alt={article.author}
                  className="w-16 h-16 rounded-full flex-shrink-0"
                />
              )}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {article.author}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {article.authorBio}
                </p>
              </div>
            </div>
          </div>
        )}

        <DisqusComments
          shortname="bali-report"
          config={{
            url: `https://bali.report/opinion/${article.slug}`,
            identifier: article.id,
            title: article.title,
            language: 'en'
          }}
        />
      </div>
    </div>
  );
}