/**
 * Advanced Cache Management Service for Bali Report
 * Supports Redis, DigitalOcean Spaces, and localStorage with comprehensive analytics
 * Optimized for Grok AI responses and RSS feed data
 */

import { createHash } from 'crypto';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
  tags: string[];
  compressed?: boolean;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  topKeys: Array<{ key: string; hits: number; size: number }>;
  lastCleanup: number;
  storageBreakdown: {
    memory: number;
    localStorage: number;
    redis?: number;
    spaces?: number;
  };
}

interface CacheConfig {
  defaultTtl: number;
  maxMemorySize: number;
  compressionThreshold: number;
  enableRedis: boolean;
  enableSpaces: boolean;
  enableAnalytics: boolean;
  cleanupInterval: number;
  redisConfig?: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  spacesConfig?: {
    endpoint: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
  };
}

export class AdvancedCacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats;
  private config: CacheConfig;
  private redisClient: any = null;
  private spacesClient: any = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      maxMemorySize: 50 * 1024 * 1024, // 50MB
      compressionThreshold: 10 * 1024, // 10KB
      enableRedis: false,
      enableSpaces: false,
      enableAnalytics: true,
      cleanupInterval: 10 * 60 * 1000, // 10 minutes
      ...config
    };

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      totalHits: 0,
      totalMisses: 0,
      averageResponseTime: 0,
      topKeys: [],
      lastCleanup: Date.now(),
      storageBreakdown: {
        memory: 0,
        localStorage: 0
      }
    };

    this.initializeRedis();
    this.initializeSpaces();
    this.startCleanupTimer();
    this.loadStatsFromStorage();
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis() {
    if (!this.config.enableRedis || !this.config.redisConfig) {
      return;
    }

    try {
      // Import Redis dynamically to avoid bundling issues
      const { createClient } = await import('redis');
      
      this.redisClient = createClient({
        socket: {
          host: this.config.redisConfig.host,
          port: this.config.redisConfig.port
        },
        password: this.config.redisConfig.password,
        database: this.config.redisConfig.db
      });

      await this.redisClient.connect();
      console.log('✅ Redis cache connected successfully');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, falling back to memory cache:', error);
      this.config.enableRedis = false;
    }
  }

  /**
   * Initialize DigitalOcean Spaces connection
   */
  private async initializeSpaces() {
    if (!this.config.enableSpaces || !this.config.spacesConfig) {
      return;
    }

    try {
      // Import AWS SDK dynamically
      const { S3Client } = await import('@aws-sdk/client-s3');
      
      this.spacesClient = new S3Client({
        endpoint: this.config.spacesConfig.endpoint,
        region: this.config.spacesConfig.region,
        credentials: {
          accessKeyId: this.config.spacesConfig.accessKeyId,
          secretAccessKey: this.config.spacesConfig.secretAccessKey
        }
      });

      console.log('✅ DigitalOcean Spaces connected successfully');
    } catch (error) {
      console.warn('⚠️ DigitalOcean Spaces connection failed:', error);
      this.config.enableSpaces = false;
    }
  }

  /**
   * Generate cache key with hashing for consistency
   */
  private generateCacheKey(key: string, tags: string[] = []): string {
    const fullKey = `${key}:${tags.sort().join(':')}`;
    return createHash('sha256').update(fullKey).digest('hex').substring(0, 16);
  }

  /**
   * Compress data if above threshold
   */
  private async compressData(data: any): Promise<{ data: any; compressed: boolean }> {
    const dataString = JSON.stringify(data);
    
    if (dataString.length < this.config.compressionThreshold) {
      return { data: dataString, compressed: false };
    }

    try {
      // Use built-in compression if available
      const { gzip } = await import('zlib');
      const { promisify } = await import('util');
      const gzipAsync = promisify(gzip);
      
      const compressed = await gzipAsync(Buffer.from(dataString));
      return { 
        data: compressed.toString('base64'), 
        compressed: true 
      };
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return { data: dataString, compressed: false };
    }
  }

  /**
   * Decompress data if compressed
   */
  private async decompressData(entry: CacheEntry): Promise<any> {
    if (!entry.compressed) {
      return JSON.parse(entry.data);
    }

    try {
      const { gunzip } = await import('zlib');
      const { promisify } = await import('util');
      const gunzipAsync = promisify(gunzip);
      
      const buffer = Buffer.from(entry.data, 'base64');
      const decompressed = await gunzipAsync(buffer);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.error('Decompression failed:', error);
      throw new Error('Cache data corrupted');
    }
  }

  /**
   * Set cache entry with multi-tier storage
   */
  async set<T>(
    key: string, 
    data: T, 
    ttl: number = this.config.defaultTtl,
    tags: string[] = []
  ): Promise<void> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(key, tags);
    
    try {
      // Compress data if needed
      const { data: processedData, compressed } = await this.compressData(data);
      const dataSize = JSON.stringify(processedData).length;

      const entry: CacheEntry<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl,
        hits: 0,
        size: dataSize,
        tags,
        compressed
      };

      // Store in memory cache
      this.memoryCache.set(cacheKey, entry);
      this.updateStats('set', dataSize, Date.now() - startTime);

      // Store in Redis if available
      if (this.redisClient && this.config.enableRedis) {
        try {
          await this.redisClient.setEx(
            `bali:cache:${cacheKey}`,
            Math.floor(ttl / 1000),
            JSON.stringify(entry)
          );
        } catch (redisError) {
          console.warn('Redis set failed:', redisError);
        }
      }

      // Store in localStorage for client-side caching
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`cache:${cacheKey}`, JSON.stringify(entry));
        } catch (storageError) {
          // Storage full or unavailable
        }
      }

      // Store large items in DigitalOcean Spaces
      if (this.spacesClient && this.config.enableSpaces && dataSize > 100 * 1024) {
        try {
          const { PutObjectCommand } = await import('@aws-sdk/client-s3');
          await this.spacesClient.send(new PutObjectCommand({
            Bucket: this.config.spacesConfig!.bucket,
            Key: `cache/${cacheKey}.json`,
            Body: JSON.stringify(entry),
            ContentType: 'application/json',
            Metadata: {
              'cache-key': cacheKey,
              'created': entry.timestamp.toString(),
              'ttl': ttl.toString()
            }
          }));
        } catch (spacesError) {
          console.warn('Spaces storage failed:', spacesError);
        }
      }

      // Cleanup memory if over limit
      if (this.getCurrentMemorySize() > this.config.maxMemorySize) {
        await this.cleanupMemoryCache();
      }

    } catch (error) {
      console.error('Cache set error:', error);
      this.updateStats('error', 0, Date.now() - startTime);
    }
  }

  /**
   * Get cache entry from multi-tier storage
   */
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(key, tags);

    try {
      // Check memory cache first
      let entry = this.memoryCache.get(cacheKey);
      
      if (entry && this.isEntryValid(entry)) {
        entry.hits++;
        this.updateStats('hit', 0, Date.now() - startTime);
        return await this.decompressData(entry);
      }

      // Check Redis cache
      if (this.redisClient && this.config.enableRedis) {
        try {
          const redisData = await this.redisClient.get(`bali:cache:${cacheKey}`);
          if (redisData) {
            entry = JSON.parse(redisData);
            if (entry && this.isEntryValid(entry)) {
              // Restore to memory cache
              this.memoryCache.set(cacheKey, entry);
              entry.hits++;
              this.updateStats('hit', 0, Date.now() - startTime);
              return await this.decompressData(entry);
            }
          }
        } catch (redisError) {
          console.warn('Redis get failed:', redisError);
        }
      }

      // Check localStorage
      if (typeof window !== 'undefined') {
        try {
          const localData = localStorage.getItem(`cache:${cacheKey}`);
          if (localData) {
            entry = JSON.parse(localData);
            if (entry && this.isEntryValid(entry)) {
              // Restore to memory cache
              this.memoryCache.set(cacheKey, entry);
              entry.hits++;
              this.updateStats('hit', 0, Date.now() - startTime);
              return await this.decompressData(entry);
            }
          }
        } catch (storageError) {
          // Storage error, continue
        }
      }

      // Check DigitalOcean Spaces for large items
      if (this.spacesClient && this.config.enableSpaces) {
        try {
          const { GetObjectCommand } = await import('@aws-sdk/client-s3');
          const response = await this.spacesClient.send(new GetObjectCommand({
            Bucket: this.config.spacesConfig!.bucket,
            Key: `cache/${cacheKey}.json`
          }));

          if (response.Body) {
            const bodyText = await response.Body.transformToString();
            entry = JSON.parse(bodyText);
            if (entry && this.isEntryValid(entry)) {
              // Restore to memory cache
              this.memoryCache.set(cacheKey, entry);
              entry.hits++;
              this.updateStats('hit', 0, Date.now() - startTime);
              return await this.decompressData(entry);
            }
          }
        } catch (spacesError) {
          // Not found in Spaces, continue
        }
      }

      // Cache miss
      this.updateStats('miss', 0, Date.now() - startTime);
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.updateStats('error', 0, Date.now() - startTime);
      return null;
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isEntryValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Update cache statistics
   */
  private updateStats(operation: 'hit' | 'miss' | 'set' | 'error', size: number, responseTime: number) {
    if (!this.config.enableAnalytics) return;

    switch (operation) {
      case 'hit':
        this.stats.totalHits++;
        break;
      case 'miss':
        this.stats.totalMisses++;
        break;
      case 'set':
        this.stats.totalSize += size;
        break;
    }

    const total = this.stats.totalHits + this.stats.totalMisses;
    if (total > 0) {
      this.stats.hitRate = this.stats.totalHits / total;
      this.stats.missRate = this.stats.totalMisses / total;
    }

    // Update response time (moving average)
    if (this.stats.averageResponseTime === 0) {
      this.stats.averageResponseTime = responseTime;
    } else {
      this.stats.averageResponseTime = (this.stats.averageResponseTime * 0.9) + (responseTime * 0.1);
    }

    this.stats.totalEntries = this.memoryCache.size;
  }

  /**
   * Get current memory cache size
   */
  private getCurrentMemorySize(): number {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Cleanup memory cache using LRU strategy
   */
  private async cleanupMemoryCache() {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by last access time (oldest first) and hits (least used first)
    entries.sort((a, b) => {
      const timeScore = a[1].timestamp - b[1].timestamp;
      const hitScore = a[1].hits - b[1].hits;
      return timeScore + (hitScore * 0.1);
    });

    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }

    console.log(`🧹 Cache cleanup: removed ${toRemove} entries`);
  }

  /**
   * Clear cache by tags
   */
  async clearByTags(tags: string[]): Promise<number> {
    let cleared = 0;

    // Clear from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }

    // Clear from Redis if available
    if (this.redisClient && this.config.enableRedis) {
      try {
        const keys = await this.redisClient.keys('bali:cache:*');
        for (const redisKey of keys) {
          const data = await this.redisClient.get(redisKey);
          if (data) {
            const entry = JSON.parse(data);
            if (entry.tags && entry.tags.some((tag: string) => tags.includes(tag))) {
              await this.redisClient.del(redisKey);
            }
          }
        }
      } catch (redisError) {
        console.warn('Redis tag cleanup failed:', redisError);
      }
    }

    console.log(`🗑️ Cleared ${cleared} cache entries with tags: ${tags.join(', ')}`);
    return cleared;
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheStats {
    this.stats.storageBreakdown.memory = this.getCurrentMemorySize();
    
    // Update top keys
    const entries = Array.from(this.memoryCache.entries());
    this.stats.topKeys = entries
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 10)
      .map(([key, entry]) => ({
        key: key.substring(0, 8) + '...',
        hits: entry.hits,
        size: entry.size
      }));

    return { ...this.stats };
  }

  /**
   * Start periodic cleanup timer
   */
  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.performMaintenance();
    }, this.config.cleanupInterval);
  }

  /**
   * Perform cache maintenance
   */
  private async performMaintenance() {
    const startTime = Date.now();
    let cleaned = 0;

    // Remove expired entries
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isEntryValid(entry)) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    // Clean localStorage
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          if (key.startsWith('cache:')) {
            const data = localStorage.getItem(key);
            if (data) {
              const entry = JSON.parse(data);
              if (!this.isEntryValid(entry)) {
                localStorage.removeItem(key);
              }
            }
          }
        }
      } catch (error) {
        // Storage error
      }
    }

    this.stats.lastCleanup = Date.now();
    console.log(`🔧 Cache maintenance completed: ${cleaned} expired entries removed in ${Date.now() - startTime}ms`);
  }

  /**
   * Load stats from persistent storage
   */
  private loadStatsFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const savedStats = localStorage.getItem('cache-stats');
        if (savedStats) {
          const parsed = JSON.parse(savedStats);
          this.stats = { ...this.stats, ...parsed };
        }
      } catch (error) {
        // Ignore loading errors
      }
    }
  }

  /**
   * Save stats to persistent storage
   */
  private saveStatsToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cache-stats', JSON.stringify(this.stats));
      } catch (error) {
        // Storage full or unavailable
      }
    }
  }

  /**
   * Shutdown cache service
   */
  async shutdown() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    if (this.redisClient) {
      await this.redisClient.disconnect();
    }

    this.saveStatsToStorage();
    console.log('Cache service shutdown completed');
  }
}

// Export singleton instance
export const advancedCacheService = new AdvancedCacheService({
  enableRedis: process.env.REDIS_URL ? true : false,
  enableSpaces: process.env.DO_SPACES_ENDPOINT ? true : false,
  redisConfig: process.env.REDIS_URL ? {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  } : undefined,
  spacesConfig: process.env.DO_SPACES_ENDPOINT ? {
    endpoint: process.env.DO_SPACES_ENDPOINT,
    region: process.env.DO_SPACES_REGION || 'nyc3',
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
    bucket: process.env.DO_SPACES_BUCKET || 'bali-report-cache'
  } : undefined
});