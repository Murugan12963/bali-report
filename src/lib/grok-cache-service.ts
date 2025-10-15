/**
 * Grok API Caching Service
 * Implements DigitalOcean Spaces and Redis caching for Grok API responses
 * Optimizes performance and manages rate limits effectively
 */

import Redis from 'ioredis';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getEnv, getBooleanEnv, getNumberEnv } from './env';

interface CacheConfig {
  redis: {
    enabled: boolean;
    url: string;
    ttl: number; // seconds
  };
  spaces: {
    enabled: boolean;
    key: string;
    secret: string;
    bucket: string;
    region: string;
    endpoint: string;
    ttl: number; // seconds
  };
  fallback: {
    enabled: boolean;
    maxSize: number; // MB
  };
}

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  source: 'redis' | 'spaces' | 'memory';
  size: number; // bytes
}

interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
  totalSize: number;
  redisConnected: boolean;
  spacesConnected: boolean;
  lastCleanup: number;
}

export class GrokCacheService {
  private redis: Redis | null = null;
  private s3Client: S3Client | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  private stats: CacheStats;

  constructor() {
    this.config = this.loadConfig();
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalSize: 0,
      redisConnected: false,
      spacesConnected: false,
      lastCleanup: Date.now()
    };

    this.initializeServices();
  }

  /**
   * Load caching configuration from environment
   */
  private loadConfig(): CacheConfig {
    return {
      redis: {
        enabled: getBooleanEnv('REDIS_ENABLED', true),
        url: getEnv('REDIS_URL', 'redis://localhost:6379'),
        ttl: getNumberEnv('REDIS_TTL', 3600) // 1 hour
      },
      spaces: {
        enabled: getBooleanEnv('DO_SPACES_ENABLED', true),
        key: getEnv('DO_SPACES_KEY'),
        secret: getEnv('DO_SPACES_SECRET'),
        bucket: getEnv('DO_SPACES_BUCKET', 'bali-report-cache'),
        region: getEnv('DO_SPACES_REGION', 'sgp1'),
        endpoint: `https://${getEnv('DO_SPACES_REGION', 'sgp1')}.digitaloceanspaces.com`,
        ttl: getNumberEnv('DO_SPACES_TTL', 86400) // 24 hours
      },
      fallback: {
        enabled: true,
        maxSize: getNumberEnv('MEMORY_CACHE_MAX_MB', 50) // 50MB
      }
    };
  }

  /**
   * Initialize Redis and DigitalOcean Spaces connections
   */
  private async initializeServices(): Promise<void> {
    // Initialize Redis
    if (this.config.redis.enabled && this.config.redis.url) {
      try {
        this.redis = new Redis(this.config.redis.url, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });

        await this.redis.connect();
        this.stats.redisConnected = true;
        console.log('✅ Redis cache connected successfully');

        this.redis.on('error', (error) => {
          console.error('❌ Redis connection error:', error);
          this.stats.redisConnected = false;
        });

        this.redis.on('connect', () => {
          this.stats.redisConnected = true;
          console.log('🔄 Redis cache reconnected');
        });
      } catch (error) {
        console.warn('⚠️ Redis cache initialization failed:', error);
        this.stats.redisConnected = false;
      }
    }

    // Initialize DigitalOcean Spaces (S3-compatible)
    if (this.config.spaces.enabled && this.config.spaces.key && this.config.spaces.secret) {
      try {
        this.s3Client = new S3Client({
          region: this.config.spaces.region,
          endpoint: this.config.spaces.endpoint,
          credentials: {
            accessKeyId: this.config.spaces.key,
            secretAccessKey: this.config.spaces.secret
          },
          forcePathStyle: false
        });

        // Test connection with a simple operation
        await this.testSpacesConnection();
        this.stats.spacesConnected = true;
        console.log('✅ DigitalOcean Spaces connected successfully');
      } catch (error) {
        console.warn('⚠️ DigitalOcean Spaces initialization failed:', error);
        this.stats.spacesConnected = false;
      }
    }

    // Start periodic cleanup
    this.startCleanupInterval();
  }

  /**
   * Test DigitalOcean Spaces connection
   */
  private async testSpacesConnection(): Promise<void> {
    if (!this.s3Client) return;

    try {
      // Try to get an object that likely doesn't exist to test connectivity
      await this.s3Client.send(new GetObjectCommand({
        Bucket: this.config.spaces.bucket,
        Key: 'connection-test'
      }));
    } catch (error) {
      // If it's a 404, the connection works
      if ((error as any)?.name === 'NoSuchKey' || (error as any)?.$metadata?.httpStatusCode === 404) {
        return; // Connection is working
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Get cached data with multi-tier fallback
   */
  async get<T = any>(key: string): Promise<T | null> {
    const cacheKey = this.generateCacheKey(key);

    try {
      // Try Redis first (fastest)
      if (this.redis && this.stats.redisConnected) {
        const redisData = await this.getFromRedis<T>(cacheKey);
        if (redisData) {
          this.stats.hits++;
          return redisData;
        }
      }

      // Try DigitalOcean Spaces (persistent, longer TTL)
      if (this.s3Client && this.stats.spacesConnected) {
        const spacesData = await this.getFromSpaces<T>(cacheKey);
        if (spacesData) {
          // Store in Redis for faster future access
          if (this.redis && this.stats.redisConnected) {
            await this.setToRedis(cacheKey, spacesData, this.config.redis.ttl);
          }
          this.stats.hits++;
          return spacesData;
        }
      }

      // Try memory cache (fallback)
      const memoryData = this.getFromMemory<T>(cacheKey);
      if (memoryData) {
        this.stats.hits++;
        return memoryData;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set data in cache with multi-tier storage
   */
  async set<T = any>(key: string, data: T, customTtl?: number): Promise<void> {
    const cacheKey = this.generateCacheKey(key);
    const dataSize = this.estimateSize(data);

    try {
      // Store in Redis (fast access)
      if (this.redis && this.stats.redisConnected) {
        const redisTtl = customTtl || this.config.redis.ttl;
        await this.setToRedis(cacheKey, data, redisTtl);
      }

      // Store in DigitalOcean Spaces (persistent)
      if (this.s3Client && this.stats.spacesConnected) {
        const spacesTtl = customTtl || this.config.spaces.ttl;
        await this.setToSpaces(cacheKey, data, spacesTtl);
      }

      // Store in memory (fallback)
      this.setToMemory(cacheKey, data, customTtl || this.config.redis.ttl);

      this.stats.totalSize += dataSize;
    } catch (error) {
      console.error('Cache set error:', error);
      this.stats.errors++;
    }
  }

  /**
   * Delete from all cache tiers
   */
  async delete(key: string): Promise<void> {
    const cacheKey = this.generateCacheKey(key);

    try {
      // Delete from Redis
      if (this.redis && this.stats.redisConnected) {
        await this.redis.del(cacheKey);
      }

      // Delete from DigitalOcean Spaces
      if (this.s3Client && this.stats.spacesConnected) {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.config.spaces.bucket,
          Key: cacheKey
        }));
      }

      // Delete from memory
      const entry = this.memoryCache.get(cacheKey);
      if (entry) {
        this.stats.totalSize -= entry.size;
      }
      this.memoryCache.delete(cacheKey);
    } catch (error) {
      console.error('Cache delete error:', error);
      this.stats.errors++;
    }
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    try {
      // Clear Redis
      if (this.redis && this.stats.redisConnected) {
        const grokKeys = await this.redis.keys('grok:*');
        if (grokKeys.length > 0) {
          await this.redis.del(...grokKeys);
        }
      }

      // Clear DigitalOcean Spaces (list and delete objects)
      if (this.s3Client && this.stats.spacesConnected) {
        // Note: This is a simplified approach. In production, you might want to
        // implement proper pagination for large numbers of objects
        console.warn('⚠️ Spaces cache clearing not fully implemented. Manual cleanup may be required.');
      }

      // Clear memory cache
      this.memoryCache.clear();
      this.stats.totalSize = 0;

      console.log('🧹 All caches cleared');
    } catch (error) {
      console.error('Cache clear error:', error);
      this.stats.errors++;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; config: CacheConfig } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      config: this.config
    };
  }

  /**
   * Health check for all cache services
   */
  async healthCheck(): Promise<{
    redis: { connected: boolean; latency?: number };
    spaces: { connected: boolean; latency?: number };
    memory: { size: number; entries: number };
  }> {
    const health = {
      redis: { connected: this.stats.redisConnected, latency: undefined as number | undefined },
      spaces: { connected: this.stats.spacesConnected, latency: undefined as number | undefined },
      memory: { size: this.stats.totalSize, entries: this.memoryCache.size }
    };

    // Test Redis latency
    if (this.redis && this.stats.redisConnected) {
      try {
        const start = Date.now();
        await this.redis.ping();
        health.redis.latency = Date.now() - start;
      } catch (error) {
        health.redis.connected = false;
        this.stats.redisConnected = false;
      }
    }

    // Test Spaces latency (basic connectivity test)
    if (this.s3Client && this.stats.spacesConnected) {
      try {
        const start = Date.now();
        await this.testSpacesConnection();
        health.spaces.latency = Date.now() - start;
      } catch (error) {
        health.spaces.connected = false;
        this.stats.spacesConnected = false;
      }
    }

    return health;
  }

  // Private helper methods

  private generateCacheKey(key: string): string {
    return `grok:${key}`;
  }

  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;
    
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  private async setToRedis<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.redis) return;
    
    try {
      const serialized = JSON.stringify(data);
      await this.redis.setex(key, ttl, serialized);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  private async getFromSpaces<T>(key: string): Promise<T | null> {
    if (!this.s3Client) return null;
    
    try {
      const response = await this.s3Client.send(new GetObjectCommand({
        Bucket: this.config.spaces.bucket,
        Key: key
      }));

      if (!response.Body) return null;

      // Check if object has expired
      const lastModified = response.LastModified;
      if (lastModified) {
        const age = Date.now() - lastModified.getTime();
        if (age > this.config.spaces.ttl * 1000) {
          // Object has expired, delete it
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.config.spaces.bucket,
            Key: key
          }));
          return null;
        }
      }

      const bodyContents = await response.Body.transformToString();
      return JSON.parse(bodyContents) as T;
    } catch (error) {
      if ((error as any)?.name === 'NoSuchKey') {
        return null; // Key doesn't exist
      }
      console.error('Spaces get error:', error);
      return null;
    }
  }

  private async setToSpaces<T>(key: string, data: T, ttl: number): Promise<void> {
    if (!this.s3Client) return;
    
    try {
      const serialized = JSON.stringify(data);
      const expiryDate = new Date(Date.now() + ttl * 1000);
      
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.config.spaces.bucket,
        Key: key,
        Body: serialized,
        ContentType: 'application/json',
        Expires: expiryDate,
        Metadata: {
          'cache-ttl': ttl.toString(),
          'created-at': Date.now().toString()
        }
      }));
    } catch (error) {
      console.error('Spaces set error:', error);
    }
  }

  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(key);
      this.stats.totalSize -= entry.size;
      return null;
    }

    return entry.data as T;
  }

  private setToMemory<T>(key: string, data: T, ttl: number): void {
    const size = this.estimateSize(data);
    const maxSize = this.config.fallback.maxSize * 1024 * 1024; // Convert MB to bytes

    // Clean up if we're approaching memory limit
    if (this.stats.totalSize + size > maxSize) {
      this.cleanupMemoryCache();
    }

    // If still too large, don't store in memory
    if (this.stats.totalSize + size > maxSize) {
      return;
    }

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      source: 'memory',
      size
    };

    // Remove existing entry if it exists
    const existing = this.memoryCache.get(key);
    if (existing) {
      this.stats.totalSize -= existing.size;
    }

    this.memoryCache.set(key, entry);
    this.stats.totalSize += size;
  }

  private estimateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    }
  }

  private cleanupMemoryCache(): void {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.floor(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      const [key, entry] = entries[i];
      this.memoryCache.delete(key);
      this.stats.totalSize -= entry.size;
    }
  }

  private startCleanupInterval(): void {
    // Run cleanup every 30 minutes
    setInterval(() => {
      this.cleanupMemoryCache();
      this.stats.lastCleanup = Date.now();
    }, 30 * 60 * 1000);
  }

  /**
   * Destroy connections and cleanup
   */
  async destroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
    this.memoryCache.clear();
    this.stats.totalSize = 0;
  }
}

// Create singleton instance
export const grokCacheService = new GrokCacheService();

// Export for testing and custom instances
export { GrokCacheService };