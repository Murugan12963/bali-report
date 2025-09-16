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
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white';
      case 'Indonesia':
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white';
      case 'Bali':
        return 'bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500 text-white';
      default:
        return 'bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500 text-white';
    }
  };

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 dark:from-gray-800 dark:via-teal-900/10 dark:to-emerald-900/10 shadow-lg hover:shadow-2xl shadow-emerald-100/50 dark:shadow-emerald-900/20 hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/30 transition-all duration-300 theme-transition border border-emerald-100/50 dark:border-emerald-800/30 hover:scale-105">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(article.category)} theme-transition`}>
              {article.category}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 theme-transition">{article.source}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-teal-900 dark:text-teal-100 mb-3 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors theme-transition">
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="block">
              {article.title}
            </a>
          </h2>
          
          <p className="text-teal-800 dark:text-teal-200 mb-4 leading-relaxed theme-transition">
            {article.description}
          </p>
          
          <div className="flex items-center justify-between">
            <time className="text-sm text-teal-600 dark:text-teal-400 theme-transition font-medium">
              {formatDate(article.pubDate)}
            </time>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-400 dark:hover:to-teal-400 text-white px-3 py-1 rounded-full font-medium text-sm transition-all hover:scale-105 shadow-lg"
            >
              🌊 Read More
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
    <article className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:from-gray-800 dark:via-teal-900/5 dark:to-emerald-900/5 rounded-xl shadow-md hover:shadow-xl shadow-emerald-100/30 dark:shadow-emerald-900/10 hover:shadow-emerald-200/40 dark:hover:shadow-emerald-800/20 transition-all duration-300 overflow-hidden theme-transition border border-emerald-100/30 dark:border-emerald-800/20 hover:scale-102">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(article.category)} theme-transition`}>
            {article.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 theme-transition">{article.source}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors line-clamp-2 theme-transition">
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="block">
            {article.title}
          </a>
        </h3>
        
        <p className="text-teal-700 dark:text-teal-300 mb-3 text-sm leading-relaxed line-clamp-3 theme-transition">
          {article.description}
        </p>
        
        <div className="flex items-center justify-between">
          <time className="text-xs text-teal-600 dark:text-teal-400 theme-transition font-medium">
            {formatDate(article.pubDate)}
          </time>
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 hover:from-emerald-700 hover:to-teal-700 dark:hover:from-emerald-400 dark:hover:to-teal-400 text-white px-2 py-1 rounded-lg font-medium text-xs transition-all hover:scale-105 shadow-md"
          >
            🌺 Read
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