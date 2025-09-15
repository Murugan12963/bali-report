import React from 'react';
import { Article } from '@/lib/rss-parser';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

/**
 * Article Card component for displaying news articles.
 * 
 * Args:
 *   article (Article): The article data to display.
 *   featured (boolean): Whether this is a featured article.
 */
const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'BRICS':
        return 'bg-red-600 text-white';
      case 'Indonesia':
        return 'bg-yellow-600 text-white';
      case 'Bali':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <span className="text-sm text-gray-600">{article.source}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-red-700 transition-colors">
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="block">
              {article.title}
            </a>
          </h2>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between">
            <time className="text-sm text-gray-500">
              {formatDate(article.pubDate)}
            </time>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
            >
              Read More
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-500">{article.source}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-700 transition-colors line-clamp-2">
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="block">
            {article.title}
          </a>
        </h3>
        
        <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-3">
          {article.description}
        </p>
        
        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-400">
            {formatDate(article.pubDate)}
          </time>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
          >
            Read
            <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;