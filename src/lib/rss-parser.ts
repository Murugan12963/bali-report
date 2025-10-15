import Parser from 'rss-parser';
import { rssCache } from './rss-cache';
import { contentModerationService } from './content-moderation';
import { RSS_APP_SOURCES, type NewsSource, type Article, getRssAppSourcesByCategory } from './rss-sources-rssapp';

/**
 * Simplified RSS Parser using only RSS.app feeds for Bali Report.
 * 
 * This replaces the complex RSS + web scraping system with reliable RSS.app feeds.
 * RSS.app handles feed generation, caching, and reliability automatically.
 */

// Simple User-Agent for RSS.app compatibility
const USER_AGENT = 'BaliReport/2.0 (https://bali.report; RSS Reader)';

class RSSAppAggregator {
  private parser: Parser;
  private sources: NewsSource[];

  constructor(sources: NewsSource[] = RSS_APP_SOURCES) {
    this.parser = new Parser({
      timeout: 10000, // RSS.app feeds are reliable, shorter timeout
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, text/xml',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });
    this.sources = sources.filter(source => source.active);
  }

  /**
   * Fetch RSS feed from RSS.app with simple error handling.
   * RSS.app handles most reliability issues automatically.
   */
  private async fetchRssFeed(source: NewsSource): Promise<Article[]> {
    try {
      console.log(`📡 Fetching RSS.app feed: ${source.name}`);
      
      const feed = await this.parser.parseURL(source.url);
      
      if (!feed.items || feed.items.length === 0) {
        console.warn(`⚠️ No articles found in RSS.app feed: ${source.name}`);
        return [];
      }

      const articles: Article[] = feed.items.map((item, index) => ({
        id: `${source.rssAppId || source.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${index}`,
        title: item.title || 'No title',
        link: item.link || '',
        description: item.contentSnippet || item.content || item.summary || 'No description available',
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.creator || item.author || source.name,
        category: source.category,
        source: source.name,
        sourceUrl: source.url,
        imageUrl: this.extractImageUrl(item)
      }));

      console.log(`✅ Successfully fetched ${articles.length} articles from RSS.app: ${source.name}`);
      return articles;

    } catch (error) {
      console.error(`❌ Error fetching RSS.app feed ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Extract image URL from RSS item.
   */
  private extractImageUrl(item: any): string | undefined {
    // Try various image fields
    if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
      return item.enclosure.url;
    }
    
    if (item['media:content']?.url) {
      return item['media:content'].url;
    }
    
    if (item['media:thumbnail']?.url) {
      return item['media:thumbnail'].url;
    }

    if (item.image?.url) {
      return item.image.url;
    }

    // Try to extract from content
    const content = item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) {
      return imgMatch[1];
    }

    return undefined;
  }

  /**
   * Fetch articles from all active RSS.app feeds.
   * 
   * Returns:
   *   Promise<Article[]>: Array of articles from all sources.
   */
  async fetchAllArticles(): Promise<Article[]> {
    console.log('🚀 Starting RSS.app feed aggregation...');
    console.log(`📊 Active RSS.app sources: ${this.sources.length}`);

    // Check cache first
    const cacheKey = 'rssapp_all_articles';
    const cachedData = rssCache.get(cacheKey);
    if (cachedData && cachedData.articles) {
      console.log('📦 Using cached RSS.app articles');
      return cachedData.articles;
    }

    // Fetch from all RSS.app sources in parallel
    const fetchPromises = this.sources.map(source => this.fetchRssFeed(source));
    const articleArrays = await Promise.all(fetchPromises);
    
    // Flatten and combine all articles
    let allArticles = articleArrays.flat();
    
    console.log(`📊 Raw articles from RSS.app: ${allArticles.length}`);

    // Apply content moderation (duplicate removal, quality check)
    if (allArticles.length > 0) {
      try {
        const moderationResult = await contentModerationService.moderateArticles(allArticles);
        allArticles = moderationResult.approved;
        console.log(`🛡️ Content moderation: ${moderationResult.approved.length} approved, ${moderationResult.rejected.length} rejected`);
      } catch (error) {
        console.error('❌ Content moderation failed, using all articles:', error);
      }
    }

    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Cache the results (RSS cache expects source, but we'll use a dummy for aggregated data)
    const dummySource = { name: 'RSS.app All Articles', url: cacheKey, category: 'BRICS' as const, active: true };
    rssCache.set(cacheKey, dummySource, allArticles);

    console.log(`✅ RSS.app aggregation complete: ${allArticles.length} articles`);
    
    // Log summary by category
    const brics = allArticles.filter(a => a.category === 'BRICS').length;
    const indonesia = allArticles.filter(a => a.category === 'Indonesia').length;
    const bali = allArticles.filter(a => a.category === 'Bali').length;
    console.log(`📊 RSS.app Summary - BRICS: ${brics}, Indonesia: ${indonesia}, Bali: ${bali}`);

    return allArticles;
  }

  /**
   * Fetch articles for a specific category using RSS.app feeds.
   */
  async fetchArticlesByCategory(category: 'BRICS' | 'Indonesia' | 'Bali' | 'AFRICA' | 'EURASIA' | 'SOUTH_AMERICA'): Promise<Article[]> {
    console.log(`🎯 Fetching RSS.app articles for category: ${category}`);
    
    // Check cache first
    const cacheKey = `rssapp_${category.toLowerCase()}`;
    const cachedData = rssCache.get(cacheKey);
    if (cachedData && cachedData.articles) {
      console.log(`📦 Using cached RSS.app ${category} articles`);
      return cachedData.articles;
    }

    // Get sources for this category
    const categorySources = getRssAppSourcesByCategory(category);
    console.log(`📊 RSS.app sources for ${category}: ${categorySources.length}`);

    // Fetch from category sources
    const fetchPromises = categorySources.map(source => this.fetchRssFeed(source));
    const articleArrays = await Promise.all(fetchPromises);
    
    let articles = articleArrays.flat();

    // Apply content moderation
    if (articles.length > 0) {
      try {
        const moderationResult = await contentModerationService.moderateArticles(articles);
        articles = moderationResult.approved;
        console.log(`🛡️ ${category} moderation: ${moderationResult.approved.length} approved, ${moderationResult.rejected.length} rejected`);
      } catch (error) {
        console.error(`❌ ${category} content moderation failed:`, error);
      }
    }

    // Sort by date
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    // Cache results
    const dummySource = { name: `RSS.app ${category} Articles`, url: cacheKey, category: category, active: true };
    rssCache.set(cacheKey, dummySource, articles);

    console.log(`✅ RSS.app ${category} fetch complete: ${articles.length} articles`);
    return articles;
  }

  /**
   * Get RSS.app feed statistics.
   */
  async getFeedStatistics() {
    const stats = {
      totalSources: this.sources.length,
      activeFeeds: this.sources.filter(s => s.active).length,
      categories: {
        BRICS: this.sources.filter(s => s.category === 'BRICS').length,
        Indonesia: this.sources.filter(s => s.category === 'Indonesia').length,
        Bali: this.sources.filter(s => s.category === 'Bali').length
      },
      cacheStats: rssCache.getStats(),
      rssAppFeeds: this.sources.map(s => ({
        name: s.name,
        rssAppId: s.rssAppId,
        category: s.category,
        description: s.description
      }))
    };

    return stats;
  }

  /**
   * Clear RSS.app cache (useful for development/testing).
   */
  clearCache(): void {
    rssCache.clear();
    console.log('🗺️ RSS.app cache cleared');
  }

  /**
   * Get active sources (for backward compatibility).
   */
  getActiveSources(): NewsSource[] {
    return this.sources.filter(s => s.active);
  }

  /**
   * Fetch single feed (for backward compatibility).
   */
  async fetchFeed(source: NewsSource): Promise<Article[]> {
    return this.fetchRssFeed(source);
  }

  /**
   * Fetch from source (for backward compatibility).
   */
  async fetchFromSource(source: NewsSource): Promise<Article[]> {
    return this.fetchRssFeed(source);
  }

  /**
   * Fetch all sources (for backward compatibility).
   */
  async fetchAllSources(): Promise<Article[]> {
    return this.fetchAllArticles();
  }
}

// Export singleton instance
export const rssAppAggregator = new RSSAppAggregator();

// Export main functions for compatibility with existing code
export const fetchAllArticles = () => rssAppAggregator.fetchAllArticles();
export const fetchBRICSArticles = () => rssAppAggregator.fetchArticlesByCategory('BRICS');
export const fetchIndonesiaArticles = () => rssAppAggregator.fetchArticlesByCategory('Indonesia');
export const fetchBaliArticles = () => rssAppAggregator.fetchArticlesByCategory('Bali');
export const fetchAfricaArticles = () => rssAppAggregator.fetchArticlesByCategory('AFRICA');
export const fetchEurasiaArticles = () => rssAppAggregator.fetchArticlesByCategory('EURASIA');
export const fetchSouthAmericaArticles = () => rssAppAggregator.fetchArticlesByCategory('SOUTH_AMERICA');

// Backward compatibility exports
export const rssAggregator = rssAppAggregator; // For existing code that uses rssAggregator
export { RSS_APP_SOURCES as NEWS_SOURCES }; // For existing code that uses NEWS_SOURCES

// Export types for compatibility
export type { Article, NewsSource };

export default rssAppAggregator;
