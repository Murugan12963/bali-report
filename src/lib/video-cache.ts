/**
 * Video Caching System for Bali Report
 * Caches fetched videos to reduce API calls and improve performance
 * Similar to RSS cache implementation
 */

import { VideoContent } from './video-service';

interface VideoCacheEntry {
  videos: VideoContent[];
  timestamp: number;
  category?: 'BRICS' | 'Indonesia' | 'Bali' | 'all';
}

interface VideoCacheStats {
  totalEntries: number;
  totalVideos: number;
  cacheHits: number;
  cacheMisses: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

const CACHE_KEY = 'bali-report-video-cache';
const CACHE_VERSION = '1.0';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes (videos don't update as frequently as articles)
const MAX_CACHE_ENTRIES = 10; // Keep cache for 'all' and each category

class VideoCache {
  private stats = {
    cacheHits: 0,
    cacheMisses: 0,
  };

  /**
   * Get cache key for a specific category or 'all'
   */
  private getCacheKey(category?: 'BRICS' | 'Indonesia' | 'Bali'): string {
    return category || 'all';
  }

  /**
   * Get videos from cache
   */
  get(category?: 'BRICS' | 'Indonesia' | 'Bali'): VideoContent[] | null {
    try {
      const cacheData = this.loadCache();
      const cacheKey = this.getCacheKey(category);
      const entry = cacheData[cacheKey];

      if (!entry) {
        this.stats.cacheMisses++;
        return null;
      }

      const now = Date.now();
      const age = now - entry.timestamp;

      // Check if cache is still valid
      if (age > CACHE_TTL) {
        console.log(`🗑️ Video cache expired for ${cacheKey} (age: ${Math.round(age / 1000)}s)`);
        this.stats.cacheMisses++;
        return null;
      }

      console.log(`✅ Video cache hit for ${cacheKey} (${entry.videos.length} videos, age: ${Math.round(age / 1000)}s)`);
      this.stats.cacheHits++;
      return entry.videos;
    } catch (error) {
      console.error('Error reading video cache:', error);
      this.stats.cacheMisses++;
      return null;
    }
  }

  /**
   * Store videos in cache
   */
  set(videos: VideoContent[], category?: 'BRICS' | 'Indonesia' | 'Bali'): void {
    try {
      const cacheData = this.loadCache();
      const cacheKey = this.getCacheKey(category);

      const entry: VideoCacheEntry = {
        videos,
        timestamp: Date.now(),
        category: category || 'all',
      };

      cacheData[cacheKey] = entry;

      // Cleanup old entries if cache is too large
      this.cleanupCache(cacheData);

      this.saveCache(cacheData);
      console.log(`💾 Cached ${videos.length} videos for ${cacheKey}`);
    } catch (error) {
      console.error('Error writing video cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CACHE_KEY);
        console.log('🗑️ Video cache cleared');
      }
    } catch (error) {
      console.error('Error clearing video cache:', error);
    }
  }

  /**
   * Clear cache for specific category
   */
  clearCategory(category?: 'BRICS' | 'Indonesia' | 'Bali'): void {
    try {
      const cacheData = this.loadCache();
      const cacheKey = this.getCacheKey(category);
      
      if (cacheData[cacheKey]) {
        delete cacheData[cacheKey];
        this.saveCache(cacheData);
        console.log(`🗑️ Video cache cleared for ${cacheKey}`);
      }
    } catch (error) {
      console.error('Error clearing category cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): VideoCacheStats {
    try {
      const cacheData = this.loadCache();
      const entries = Object.values(cacheData);
      
      let totalVideos = 0;
      let oldestTimestamp: number | null = null;
      let newestTimestamp: number | null = null;

      entries.forEach(entry => {
        totalVideos += entry.videos.length;
        
        if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
          oldestTimestamp = entry.timestamp;
        }
        
        if (newestTimestamp === null || entry.timestamp > newestTimestamp) {
          newestTimestamp = entry.timestamp;
        }
      });

      return {
        totalEntries: entries.length,
        totalVideos,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        oldestEntry: oldestTimestamp,
        newestEntry: newestTimestamp,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalEntries: 0,
        totalVideos: 0,
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        oldestEntry: null,
        newestEntry: null,
      };
    }
  }

  /**
   * Check if cache exists and is valid for a category
   */
  isValid(category?: 'BRICS' | 'Indonesia' | 'Bali'): boolean {
    const cached = this.get(category);
    return cached !== null && cached.length > 0;
  }

  /**
   * Load cache from localStorage
   */
  private loadCache(): Record<string, VideoCacheEntry> {
    if (typeof localStorage === 'undefined') {
      return {};
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        return {};
      }

      const data = JSON.parse(cached);
      
      // Verify cache version
      if (data.version !== CACHE_VERSION) {
        console.log('🔄 Video cache version mismatch, clearing cache');
        this.clear();
        return {};
      }

      return data.cache || {};
    } catch (error) {
      console.error('Error loading video cache:', error);
      return {};
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCache(cacheData: Record<string, VideoCacheEntry>): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const data = {
        version: CACHE_VERSION,
        cache: cacheData,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving video cache:', error);
      
      // If localStorage is full, clear old entries and retry
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.log('📦 localStorage full, clearing old video cache entries');
        this.clearOldestEntries(cacheData, 2);
        
        try {
          const data = {
            version: CACHE_VERSION,
            cache: cacheData,
            lastUpdated: new Date().toISOString(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (retryError) {
          console.error('Failed to save cache after cleanup:', retryError);
        }
      }
    }
  }

  /**
   * Cleanup cache to prevent unlimited growth
   */
  private cleanupCache(cacheData: Record<string, VideoCacheEntry>): void {
    const entries = Object.entries(cacheData);
    
    if (entries.length > MAX_CACHE_ENTRIES) {
      this.clearOldestEntries(cacheData, entries.length - MAX_CACHE_ENTRIES);
    }
  }

  /**
   * Clear oldest cache entries
   */
  private clearOldestEntries(cacheData: Record<string, VideoCacheEntry>, count: number): void {
    const entries = Object.entries(cacheData).sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    for (let i = 0; i < count && i < entries.length; i++) {
      delete cacheData[entries[i][0]];
      console.log(`🗑️ Removed old video cache entry: ${entries[i][0]}`);
    }
  }
}

// Export singleton instance
export const videoCache = new VideoCache();
export default videoCache;
