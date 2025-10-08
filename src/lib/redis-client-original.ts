/**
 * Redis client configuration for Bali Report RSS caching
 * Optimized for low-memory environments
 */

import { createClient } from 'redis';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  maxReconnectTime: number;
}

class RedisService {
  private client: any;
  private isConnected: boolean = false;
  
  private config: RedisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 1000,
    enableReadyCheck: true,
    maxReconnectTime: 30000,
  };

  constructor() {
    this.initializeClient();
  }

  private async initializeClient() {
    try {
      this.client = createClient({
        socket: {
          host: this.config.host,
          port: this.config.port,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              return new Error('Redis connection failed after 10 retries');
            }
            return Math.min(retries * 100, 3000);
          }
        },
        password: this.config.password,
        database: this.config.db,
      });

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        console.log('Redis connection closed');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
    }
  }

  async connect(): Promise<void> {
    if (!this.client) {
      await this.initializeClient();
    }
    
    if (!this.isConnected) {
      try {
        await this.client.connect();
        this.isConnected = true;
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.disconnect();
        this.isConnected = false;
      } catch (error) {
        console.error('Error disconnecting from Redis:', error);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnection();
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, expireInSeconds?: number): Promise<boolean> {
    await this.ensureConnection();
    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    await this.ensureConnection();
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    await this.ensureConnection();
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    await this.ensureConnection();
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flushDb(): Promise<boolean> {
    await this.ensureConnection();
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      console.error('Redis FLUSHDB error:', error);
      return false;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }

  async getStats(): Promise<any> {
    await this.ensureConnection();
    try {
      const info = await this.client.info('memory');
      return {
        connected: this.isConnected,
        memory: info,
      };
    } catch (error) {
      console.error('Redis stats error:', error);
      return { connected: false, error: (error as Error).message || String(error) };
    }
  }
}

// Export singleton instance
export const redisClient = new RedisService();
