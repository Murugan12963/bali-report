/**
 * RSS Feed Caching System for Bali Report
 * Reduces API calls and improves performance by caching RSS feed data
 */

import { Article, NEWS_SOURCES, NewsSource } from './rss-parser';

export interface CachedFeed {
  source: NewsSource;
  articles: Article[];
  timestamp: number;
  expiresAt: number;
  etag?: string;
  lastModified?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  averageResponseTime: number;
  cachedSources: number;
  cacheSize: number;
}

export interface CacheConfig {
  maxAge: number; // Max age in milliseconds
  maxSize: number; // Max number of cached items
  staleWhileRevalidate: boolean; // Serve stale content while fetching new
  enablePersistence: boolean; // Enable localStorage persistence
}

class RSSCacheService {
  private cache: Map<string, CachedFeed> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    averageResponseTime: 0,
    cachedSources: 0,
    cacheSize: 0,
  };
  
  private config: CacheConfig = {
    maxAge: 5 * 60 * 1000, // 5 minutes default
    maxSize: 50, // Max 50 cached feeds
    staleWhileRevalidate: true,
    enablePersistence: true,
  };

  private readonly STORAGE_KEY = 'bali-report-rss-cache';
  private readonly STATS_KEY = 'bali-report-cache-stats';

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Load persisted cache if available
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      this.loadPersistedCache();
    }
  }

  /**
   * Get cached articles for a specific source.
   * 
   * Args:
   *   sourceUrl (string): RSS feed URL.
   * 
   * Returns:
   *   CachedFeed | null: Cached feed data or null if not found/expired.
   */
  get(sourceUrl: string): CachedFeed | null {
    this.stats.totalRequests++;
    
    const cached = this.cache.get(sourceUrl);
    
    if (!cached) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    const isExpired = now > cached.expiresAt;
    
    // If expired but stale-while-revalidate is enabled, still return it
    if (isExpired && !this.config.staleWhileRevalidate) {
      this.cache.delete(sourceUrl);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    this.updateStats();
    
    return cached;
  }

  /**
   * Set cached articles for a specific source.
   * 
   * Args:
   *   sourceUrl (string): RSS feed URL.
   *   source (NewsSource): News source configuration.
   *   articles (Article[]): Articles to cache.
   *   headers (object): Optional HTTP headers for etag/last-modified.
   */
  set(
    sourceUrl: string, 
    source: NewsSource, 
    articles: Article[], 
    headers?: { etag?: string; lastModified?: string }
  ): void {
    const now = Date.now();
    
    // Apply cache size limit
    if (this.cache.size >= this.config.maxSize) {
      // Remove oldest entry
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    const cachedFeed: CachedFeed = {
      source,
      articles,
      timestamp: now,
      expiresAt: now + this.config.maxAge,
      etag: headers?.etag,
      lastModified: headers?.lastModified,
    };
    
    this.cache.set(sourceUrl, cachedFeed);
    this.updateStats();
    
    // Persist to localStorage if enabled
    if (this.config.enablePersistence) {
      this.persistCache();
    }
    
    console.log(`📦 Cached ${articles.length} articles from ${source.name} (expires in ${this.config.maxAge / 1000}s)`);
  }

  /**
   * Check if a source has valid cached data.
   * 
   * Args:
   *   sourceUrl (string): RSS feed URL.
   * 
   * Returns:
   *   boolean: True if cached and not expired.
   */
  has(sourceUrl: string): boolean {
    const cached = this.cache.get(sourceUrl);
    if (!cached) return false;
    
    const now = Date.now();
    return now <= cached.expiresAt;
  }

  /**
   * Check if cached data is stale but can be used.
   * 
   * Args:
   *   sourceUrl (string): RSS feed URL.
   * 
   * Returns:
   *   boolean: True if stale but usable.
   */
  isStale(sourceUrl: string): boolean {
    const cached = this.cache.get(sourceUrl);
    if (!cached) return false;
    
    const now = Date.now();
    return now > cached.expiresAt;
  }

  /**
   * Get cache headers for conditional requests.
   * 
   * Args:
   *   sourceUrl (string): RSS feed URL.
   * 
   * Returns:
   *   object: Headers for conditional requests.
   */
  getConditionalHeaders(sourceUrl: string): Record<string, string> {
    const cached = this.cache.get(sourceUrl);
    const headers: Record<string, string> = {};
    
    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag;
    }
    
    if (cached?.lastModified) {
      headers['If-Modified-Since'] = cached.lastModified;
    }
    
    return headers;
  }

  /**
   * Clear all cached data.
   */
  clear(): void {
    this.cache.clear();
    this.updateStats();
    
    if (this.config.enablePersistence && typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    
    console.log('🧹 RSS cache cleared');
  }

  /**
   * Clear expired entries from cache.
   * 
   * Returns:
   *   number: Number of entries removed.
   */
  clearExpired(): number {
    const now = Date.now();
    let removed = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    
    if (removed > 0) {
      this.updateStats();
      if (this.config.enablePersistence) {
        this.persistCache();
      }
      console.log(`🧹 Cleared ${removed} expired cache entries`);
    }
    
    return removed;
  }

  /**
   * Get cache statistics.
   * 
   * Returns:
   *   CacheStats: Current cache statistics.
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics.
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      cachedSources: this.cache.size,
      cacheSize: this.calculateCacheSize(),
    };
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STATS_KEY);
    }
  }

  /**
   * Get cache hit rate percentage.
   * 
   * Returns:
   *   number: Hit rate as percentage (0-100).
   */
  getHitRate(): number {
    if (this.stats.totalRequests === 0) return 0;
    return Math.round((this.stats.hits / this.stats.totalRequests) * 100);
  }

  /**
   * Update cache configuration.
   * 
   * Args:
   *   config (Partial<CacheConfig>): New configuration options.
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ RSS cache config updated:', this.config);
  }

  /**
   * Private helper methods
   */
  
  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }

  private updateStats(): void {
    this.stats.cachedSources = this.cache.size;
    this.stats.cacheSize = this.calculateCacheSize();
  }

  private calculateCacheSize(): number {
    let size = 0;
    
    for (const cached of this.cache.values()) {
      // Rough estimate of memory usage
      size += JSON.stringify(cached.articles).length;
    }
    
    return Math.round(size / 1024); // Size in KB
  }

  private persistCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Convert Map to array for serialization
      const cacheArray = Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        value: {
          ...value,
          // Only persist essential data to save space
          articles: value.articles.slice(0, 20), // Keep only 20 most recent
        },
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheArray));
      localStorage.setItem(this.STATS_KEY, JSON.stringify(this.stats));
    } catch (error) {
      console.warn('⚠️ Failed to persist RSS cache:', error);
    }
  }

  private loadPersistedCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cachedData = localStorage.getItem(this.STORAGE_KEY);
      const statsData = localStorage.getItem(this.STATS_KEY);
      
      if (cachedData) {
        const cacheArray = JSON.parse(cachedData);
        const now = Date.now();
        
        for (const { key, value } of cacheArray) {
          // Only restore if not expired
          if (value.expiresAt > now) {
            this.cache.set(key, value as CachedFeed);
          }
        }
        
        console.log(`📦 Restored ${this.cache.size} cached RSS feeds`);
      }
      
      if (statsData) {
        this.stats = JSON.parse(statsData);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load persisted RSS cache:', error);
    }
  }

  /**
   * Get all cached sources info.
   * 
   * Returns:
   *   Array of cached source information.
   */
  getCachedSources(): Array<{
    name: string;
    url: string;
    articleCount: number;
    cachedAt: Date;
    expiresAt: Date;
    isStale: boolean;
  }> {
    const sources = [];
    const now = Date.now();
    
    for (const [url, cached] of this.cache.entries()) {
      sources.push({
        name: cached.source.name,
        url,
        articleCount: cached.articles.length,
        cachedAt: new Date(cached.timestamp),
        expiresAt: new Date(cached.expiresAt),
        isStale: now > cached.expiresAt,
      });
    }
    
    return sources;
  }

  /**
   * Warm up cache by pre-fetching all active sources.
   * Note: This should be called sparingly to avoid rate limiting.
   */
  async warmUp(fetchFunction: (source: NewsSource) => Promise<Article[]>): Promise<void> {
    console.log('🔥 Warming up RSS cache...');
    
    const activeSources = NEWS_SOURCES.filter(s => s.active);
    const promises = activeSources.map(async (source) => {
      if (!this.has(source.url)) {
        try {
          const articles = await fetchFunction(source);
          this.set(source.url, source, articles);
        } catch (error) {
          console.warn(`⚠️ Failed to warm cache for ${source.name}:`, error);
        }
      }
    });
    
    await Promise.all(promises);
    console.log(`✅ Cache warmed with ${this.cache.size} sources`);
  }
}

// Export singleton instance
export const rssCache = new RSSCacheService();

// Export class for custom instances
export { RSSCacheService };