import React from 'react';
import { Article } from '@/lib/rss-parser';
import SaveButton from './SaveForLater/SaveButton';
import { NewContentIndicator } from './NewContentIndicator';
import { ShareBar } from './SocialShare';

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
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700/50';
      case 'Indonesia':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700/50';
      case 'Bali':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-700/50';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700';
    }
  };

  if (featured) {
    return (
      <article className="relative overflow-hidden rounded-xl bg-white dark:bg-zinc-800 shadow-sm hover:shadow-md border border-zinc-200 dark:border-zinc-700 transition-all duration-200 theme-transition hover:border-zinc-300 dark:hover:border-zinc-600">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 text-sm font-medium rounded-lg ${getCategoryColor(article.category)} theme-transition`}>
                  {article.category}
                </span>
                <NewContentIndicator 
                  article={article} 
                  variant="badge" 
                  threshold={6}
                />
              </div>
              <SaveButton 
                article={article} 
                size="sm" 
                showQuickActions={true}
                className="hover:bg-zinc-100 dark:hover:bg-zinc-700"
              />
            </div>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium theme-transition">{article.source}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors theme-transition leading-tight">
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="block">
              {article.title}
            </a>
          </h2>
          
          <p className="text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed theme-transition">
            {article.description}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <time className="text-sm text-zinc-500 dark:text-zinc-400 theme-transition font-medium">
                {formatDate(article.pubDate)}
              </time>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Read More
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            
            <ShareBar article={article} className="pt-3 border-t border-zinc-200 dark:border-zinc-700" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md border border-zinc-200 dark:border-zinc-700 transition-all duration-200 overflow-hidden theme-transition hover:border-zinc-300 dark:hover:border-zinc-600">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(article.category)} theme-transition`}>
                {article.category}
              </span>
              <NewContentIndicator 
                article={article} 
                variant="pulse" 
                threshold={6}
                className="ml-1"
              />
            </div>
            <SaveButton 
              article={article} 
              size="sm"
              showQuickActions={false}
              className="hover:bg-zinc-100 dark:hover:bg-zinc-700"
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium theme-transition">{article.source}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 theme-transition leading-tight">
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="block">
            {article.title}
          </a>
        </h3>
        
        <p className="text-zinc-600 dark:text-zinc-300 mb-3 text-sm leading-relaxed line-clamp-3 theme-transition">
          {article.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <time className="text-xs text-zinc-500 dark:text-zinc-400 theme-transition font-medium">
              {formatDate(article.pubDate)}
            </time>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 shadow-sm"
            >
              Read
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          
          <ShareBar article={article} className="pt-2 border-t border-zinc-200 dark:border-zinc-700" />
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;