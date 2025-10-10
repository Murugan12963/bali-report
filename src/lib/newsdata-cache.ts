/**
 * Aggressive caching system for NewsData.io to stay under 100 API calls per day.
 * Uses long-term caching with intelligent cache management.
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface NewsdataCacheEntry {
  category: 'BRICS' | 'Indonesia' | 'Bali';
  articles: any[];
  timestamp: number;
  creditsUsed: number;
  articlesRequested: number;
  expiresAt: number;
}

interface NewsdataCacheStats {
  totalEntries: number;
  totalArticles: number;
  oldestEntry: number;
  newestEntry: number;
  cacheHitRate: number;
  dailyCreditsUsed: number;
  remainingCredits: number;
  maxArticlesRemaining: number;
}

class NewsdataCache {
  private cache = new Map<string, NewsdataCacheEntry>();
  private cacheDir: string;
  private cacheFile: string;
  private hitCount = 0;
  private missCount = 0;
  private dailyCreditsUsed = 0;
  private lastResetDate: string;
  
  // Development mode - disable credit tracking
  private readonly DISABLE_CREDIT_TRACKING = process.env.NODE_ENV === 'development' || process.env.DISABLE_NEWSDATA_CREDIT_TRACKING === 'true';
  
  // Cache settings optimized for 200 credits per day (10 articles per credit = 2000 articles/day)
  private readonly CACHE_DURATION = {
    // Balanced cache times for good freshness while staying under 200 credits
    BRICS: 2 * 60 * 60 * 1000,      // 2 hours for BRICS (updated 12x/day = ~60 credits)
    Indonesia: 3 * 60 * 60 * 1000,   // 3 hours for Indonesia (updated 8x/day = ~40 credits)
    Bali: 6 * 60 * 60 * 1000,       // 6 hours for Bali (updated 4x/day = ~20 credits)
  };
  
  private readonly MAX_DAILY_CREDITS = 200; // 200 credits per day
  private readonly ARTICLES_PER_CREDIT = 10; // 10 articles per credit
  private readonly MAX_DAILY_ARTICLES = this.MAX_DAILY_CREDITS * this.ARTICLES_PER_CREDIT; // 2000 articles
  private readonly EMERGENCY_CACHE_DURATION = 8 * 60 * 60 * 1000; // 8 hours emergency cache

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'cache');
    this.cacheFile = path.join(this.cacheDir, 'newsdata-cache.json');
    this.lastResetDate = new Date().toDateString();
    this.initCache();
  }

  /**
   * Initialize cache from persistent storage.
   */
  private async initCache(): Promise<void> {
    try {
      // Ensure cache directory exists
      await fs.mkdir(this.cacheDir, { recursive: true });
      
      // Load existing cache
      try {
        const cacheData = await fs.readFile(this.cacheFile, 'utf-8');
        const parsedData = JSON.parse(cacheData);
        
        // Restore cache entries
        if (parsedData.entries) {
          for (const [key, entry] of Object.entries(parsedData.entries)) {
            this.cache.set(key, entry as NewsdataCacheEntry);
          }
        }
        
        // Check if we need to reset daily counter
        const currentDate = new Date().toDateString();
        if (parsedData.lastResetDate !== currentDate) {
          console.log('📅 New day detected, resetting NewsData.io credit counter');
          this.dailyCreditsUsed = 0;
          this.lastResetDate = currentDate;
        } else {
          this.dailyCreditsUsed = parsedData.dailyCreditsUsed || 0;
        }
        
        this.hitCount = parsedData.hitCount || 0;
        this.missCount = parsedData.missCount || 0;
        
        if (this.DISABLE_CREDIT_TRACKING) {
          console.log(`💾 NewsData.io cache loaded: ${this.cache.size} entries (Development Mode - Credit tracking disabled)`);
        } else {
          console.log(`💾 NewsData.io cache loaded: ${this.cache.size} entries, ${this.dailyCreditsUsed}/${this.MAX_DAILY_CREDITS} credits used today (${this.dailyCreditsUsed * this.ARTICLES_PER_CREDIT}/${this.MAX_DAILY_ARTICLES} articles)`);
        }
        
      } catch (error) {
        console.log('📂 No existing NewsData.io cache found, starting fresh');
      }
    } catch (error) {
      console.error('❌ Failed to initialize NewsData.io cache:', error);
    }
  }

  /**
   * Persist cache to disk.
   */
  private async persistCache(): Promise<void> {
    try {
      const cacheData = {
        lastResetDate: this.lastResetDate,
        dailyCreditsUsed: this.dailyCreditsUsed,
        hitCount: this.hitCount,
        missCount: this.missCount,
        entries: Object.fromEntries(this.cache.entries()),
        savedAt: new Date().toISOString()
      };
      
      await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      console.error('❌ Failed to persist NewsData.io cache:', error);
    }
  }

  /**
   * Get cache key for a category.
   */
  private getCacheKey(category: 'BRICS' | 'Indonesia' | 'Bali'): string {
    return `newsdata_${category.toLowerCase()}`;
  }

  /**
   * Check if we're approaching the daily credit limit.
   */
  isNearLimit(): boolean {
    if (this.DISABLE_CREDIT_TRACKING) {
      return false; // Never near limit in development
    }
    return this.dailyCreditsUsed >= this.MAX_DAILY_CREDITS * 0.85; // 85% of limit (170 credits)
  }

  /**
   * Check if we've exceeded the daily credit limit.
   */
  hasExceededLimit(): boolean {
    if (this.DISABLE_CREDIT_TRACKING) {
      return false; // Never exceeded in development
    }
    return this.dailyCreditsUsed >= this.MAX_DAILY_CREDITS;
  }

  /**
   * Calculate credits needed for a request.
   */
  private calculateCreditsNeeded(articlesRequested: number): number {
    return Math.ceil(articlesRequested / this.ARTICLES_PER_CREDIT);
  }

  /**
   * Get articles from cache if available and fresh.
   */
  async get(category: 'BRICS' | 'Indonesia' | 'Bali'): Promise<any[] | null> {
    const key = this.getCacheKey(category);
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }
    
    const now = Date.now();
    const isExpired = now > entry.expiresAt;
    
    // If we're near the limit, extend cache time even if expired
    if (isExpired && !this.isNearLimit()) {
      this.missCount++;
      return null;
    }
    
    // Use cached data
    this.hitCount++;
    
    const age = Math.round((now - entry.timestamp) / (60 * 1000)); // minutes
    console.log(`💾 NewsData.io cache HIT for ${category} (${entry.articles.length} articles, ${age}min old)`);
    
    return entry.articles;
  }

  /**
   * Store articles in cache.
   */
  async set(category: 'BRICS' | 'Indonesia' | 'Bali', articles: any[], articlesRequested: number): Promise<void> {
    const key = this.getCacheKey(category);
    const now = Date.now();
    const creditsUsed = this.calculateCreditsNeeded(articlesRequested);
    
    // Use emergency long cache if we're near limit
    const cacheDuration = this.isNearLimit() ? 
      this.EMERGENCY_CACHE_DURATION : 
      this.CACHE_DURATION[category];
    
    const entry: NewsdataCacheEntry = {
      category,
      articles,
      timestamp: now,
      creditsUsed,
      articlesRequested,
      expiresAt: now + cacheDuration,
    };
    
    this.cache.set(key, entry);
    
    if (!this.DISABLE_CREDIT_TRACKING) {
      this.dailyCreditsUsed += creditsUsed;
    }
    
    const hoursUntilExpiry = Math.round(cacheDuration / (60 * 60 * 1000));
    console.log(`💾 NewsData.io cache SET for ${category} (${articles.length} articles received, ${articlesRequested} requested, expires in ${hoursUntilExpiry}h)`);
    
    if (this.DISABLE_CREDIT_TRACKING) {
      console.log(`📊 Development Mode: Credit tracking disabled`);
    } else {
      console.log(`📊 Credit usage: ${this.dailyCreditsUsed}/${this.MAX_DAILY_CREDITS} credits (${this.dailyCreditsUsed * this.ARTICLES_PER_CREDIT}/${this.MAX_DAILY_ARTICLES} max articles)`);
    }
    
    // Persist to disk
    await this.persistCache();
    
    if (!this.DISABLE_CREDIT_TRACKING) {
      // Warn if approaching limit
      if (this.isNearLimit() && !this.hasExceededLimit()) {
        console.warn(`⚠️  NewsData.io approaching daily limit: ${this.dailyCreditsUsed}/${this.MAX_DAILY_CREDITS} credits used`);
      }
      
      // Error if exceeded
      if (this.hasExceededLimit()) {
        console.error(`🚨 NewsData.io daily limit exceeded: ${this.dailyCreditsUsed}/${this.MAX_DAILY_CREDITS} credits used`);
      }
    }
  }

  /**
   * Get cache statistics.
   */
  getStats(): NewsdataCacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.hitCount + this.missCount;
    
    return {
      totalEntries: this.cache.size,
      totalArticles: entries.reduce((sum, entry) => sum + entry.articles.length, 0),
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0,
      cacheHitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      dailyCreditsUsed: this.dailyCreditsUsed,
      remainingCredits: Math.max(0, this.MAX_DAILY_CREDITS - this.dailyCreditsUsed),
      maxArticlesRemaining: Math.max(0, (this.MAX_DAILY_CREDITS - this.dailyCreditsUsed) * this.ARTICLES_PER_CREDIT),
    };
  }

  /**
   * Get remaining credits for today.
   */
  getRemainingCredits(): number {
    return Math.max(0, this.MAX_DAILY_CREDITS - this.dailyCreditsUsed);
  }

  /**
   * Get maximum articles that can still be fetched today.
   */
  getRemainingArticles(): number {
    return this.getRemainingCredits() * this.ARTICLES_PER_CREDIT;
  }

  /**
   * Check if we have enough credits for a request.
   */
  canMakeRequest(articlesRequested: number): boolean {
    if (this.DISABLE_CREDIT_TRACKING) {
      return true; // Always allow requests in development
    }
    const creditsNeeded = this.calculateCreditsNeeded(articlesRequested);
    return (this.dailyCreditsUsed + creditsNeeded) <= this.MAX_DAILY_CREDITS;
  }

  /**
   * Force clear cache (for testing/emergency).
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    await this.persistCache();
    console.log('🧹 NewsData.io cache cleared');
  }

  /**
   * Reset daily counter (for testing).
   */
  resetDailyCounter(): void {
    this.dailyCreditsUsed = 0;
    this.lastResetDate = new Date().toDateString();
    console.log('🔄 NewsData.io daily credit counter reset');
  }

  /**
   * Get cache age for a category in minutes.
   */
  getCacheAge(category: 'BRICS' | 'Indonesia' | 'Bali'): number | null {
    const key = this.getCacheKey(category);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    return Math.round((Date.now() - entry.timestamp) / (60 * 1000));
  }
}

// Create singleton instance
export const newsdataCache = new NewsdataCache();