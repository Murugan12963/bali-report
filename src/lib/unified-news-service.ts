import { Article } from './rss-parser';
import { rssAggregator } from './rss-parser';

/**
 * Unified News Service with Priority-based Fallback System
 * Priority: NewsData.io API -> RSS -> Web Scraper
 */

interface FetchOptions {
  includeScrapers?: boolean;
  limit?: number;
  category?: 'BRICS' | 'Indonesia' | 'Bali';
}

interface NewsResponse {
  success: boolean;
  articles: Article[];
  metadata: {
    source: 'newsdata' | 'rss' | 'scraper' | 'mixed';
    total: number;
    fetchTime: number;
    timestamp: string;
    fallbacksUsed: string[];
  };
}

class UnifiedNewsService {
  /**
   * Fetch all articles with priority-based fallback system.
   * 
   * Returns:
   *   Promise<NewsResponse>: Articles with metadata about sources used.
   */
  async fetchAllArticles(options: FetchOptions = {}): Promise<NewsResponse> {
    const startTime = Date.now();
    const fallbacksUsed: string[] = [];
    
    const { includeScrapers = false, limit = 100 } = options;
    
    try {
      console.log('🎯 Unified News Service: Starting priority-based news fetching...');
      
      // Use the RSS aggregator which already implements the priority system
      // Priority: NewsData.io API -> RSS -> Web Scraper
      const articles = await rssAggregator.fetchAllSources(includeScrapers);
      
      // Determine primary source based on article sources
      const sources = new Set(articles.map(article => {
        if (article.source.includes('NewsData.io')) return 'newsdata';
        if (article.source.includes('Scraper')) return 'scraper';
        return 'rss';
      }));
      
      const primarySource = sources.has('newsdata') ? 'newsdata' : 
                           sources.has('rss') ? 'rss' : 
                           sources.has('scraper') ? 'scraper' : 'mixed';

      if (sources.has('newsdata')) fallbacksUsed.push('NewsData.io API');
      if (sources.has('rss')) fallbacksUsed.push('RSS Feeds');
      if (sources.has('scraper')) fallbacksUsed.push('Web Scrapers');
      
      console.log(`✅ Unified Service: Fetched ${articles.length} articles using: ${fallbacksUsed.join(' + ')}`);
      
      return {
        success: true,
        articles: articles.slice(0, limit),
        metadata: {
          source: primarySource,
          total: articles.length,
          fetchTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          fallbacksUsed,
        },
      };
    } catch (error) {
      console.error('❌ Unified News Service: Error fetching articles:', error);
      
      return {
        success: false,
        articles: [],
        metadata: {
          source: 'mixed',
          total: 0,
          fetchTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          fallbacksUsed: ['Error - no sources available'],
        },
      };
    }
  }
  
  /**
   * Fetch articles by category with priority-based fallback system.
   * 
   * Args:
   *   category: The news category to filter by.
   *   options: Additional fetch options.
   * 
   * Returns:
   *   Promise<NewsResponse>: Category-specific articles with metadata.
   */
  async fetchByCategory(
    category: 'BRICS' | 'Indonesia' | 'Bali', 
    options: FetchOptions = {}
  ): Promise<NewsResponse> {
    const startTime = Date.now();
    const fallbacksUsed: string[] = [];
    
    const { includeScrapers = true, limit = 50 } = options;
    
    try {
      console.log(`🎯 Unified News Service: Fetching ${category} articles with priority system...`);
      
      // Use the RSS aggregator's category method which implements priority system
      const articles = await rssAggregator.fetchByCategory(category, includeScrapers);
      
      // Determine sources used
      const sources = new Set(articles.map(article => {
        if (article.source.includes('NewsData.io')) return 'newsdata';
        if (article.source.includes('Scraper')) return 'scraper';
        return 'rss';
      }));
      
      const primarySource = sources.has('newsdata') ? 'newsdata' : 
                           sources.has('rss') ? 'rss' : 
                           sources.has('scraper') ? 'scraper' : 'mixed';

      if (sources.has('newsdata')) fallbacksUsed.push('NewsData.io API');
      if (sources.has('rss')) fallbacksUsed.push('RSS Feeds');
      if (sources.has('scraper')) fallbacksUsed.push('Web Scrapers');
      
      console.log(`✅ Unified Service (${category}): Fetched ${articles.length} articles using: ${fallbacksUsed.join(' + ')}`);
      
      return {
        success: true,
        articles: articles.slice(0, limit),
        metadata: {
          source: primarySource,
          total: articles.length,
          fetchTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          fallbacksUsed,
        },
      };
    } catch (error) {
      console.error(`❌ Unified News Service (${category}): Error:`, error);
      
      return {
        success: false,
        articles: [],
        metadata: {
          source: 'mixed',
          total: 0,
          fetchTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          fallbacksUsed: ['Error - no sources available'],
        },
      };
    }
  }
  
  /**
   * Get service status and available sources.
   * 
   * Returns:
   *   object: Service status information.
   */
  async getServiceStatus() {
    return {
      priorityOrder: ['NewsData.io API', 'RSS Feeds', 'Web Scrapers'],
      cacheStats: rssAggregator.getCacheStats(),
      activeSources: rssAggregator.getActiveSources().length,
    };
  }
}

// Export singleton instance
export const unifiedNewsService = new UnifiedNewsService();
export type { NewsResponse, FetchOptions };