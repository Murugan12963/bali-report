/**
 * X.com API v2 Service
 * Handles Twitter API v2 integration for bali.report news aggregation
 * Premium+ account with 10K pulls/month Basic tier limits
 */

import { TwitterApi, TweetV2 } from 'twitter-api-v2';

interface XTweet {
  id: string;
  text: string;
  author_id?: string;
  author_name?: string;
  author_username?: string;
  author_verified?: boolean;
  created_at: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  entities?: {
    urls?: Array<{
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
    media?: Array<{
      type: string;
      url: string;
      media_key: string;
    }>;
  };
  attachments?: {
    media_keys?: string[];
  };
  media?: Array<{
    media_key: string;
    type: string;
    url?: string;
    preview_image_url?: string;
  }>;
  category: 'BRICS' | 'Indonesia' | 'Bali';
  relevance_score: number;
}

interface XApiResponse {
  tweets: XTweet[];
  cached: boolean;
  remaining_requests: number;
  reset_time?: number;
}

class XApiService {
  private client: TwitterApi | null = null;
  private cache: Map<string, { data: XTweet[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private requestCount = 0;
  private windowStart = Date.now();
  
  // Premium+ Basic tier limits: 10K requests/month ≈ 333/day ≈ 14/hour ≈ 1/4min
  private readonly MAX_REQUESTS_PER_WINDOW = 15; // Conservative limit per 15min window

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    const bearerToken = process.env.X_BEARER_TOKEN;
    
    if (!bearerToken) {
      console.warn('❌ X_BEARER_TOKEN not provided. X API features will be disabled.');
      return;
    }

    try {
      this.client = new TwitterApi(bearerToken);
      console.log('✅ X API client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize X API client:', error);
    }
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart > this.RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    return this.requestCount < this.MAX_REQUESTS_PER_WINDOW;
  }

  private getCacheKey(query: string, category: string): string {
    return `x-api:${category}:${query}`;
  }

  private getFromCache(cacheKey: string): XTweet[] | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCache(cacheKey: string, data: XTweet[]): void {
    this.cache.set(cacheKey, {
      data: [...data],
      timestamp: Date.now()
    });

    // Cleanup old cache entries (keep last 50)
    if (this.cache.size > 50) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      this.cache.clear();
      entries.slice(0, 50).forEach(([key, value]) => {
        this.cache.set(key, value);
      });
    }
  }

  private calculateRelevanceScore(tweet: TweetV2, keywords: string[]): number {
    let score = 0;
    const text = tweet.text.toLowerCase();

    // Keyword matching (0-50 points)
    keywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });

    // Engagement metrics (0-30 points)
    if (tweet.public_metrics) {
      const { like_count = 0, retweet_count = 0, reply_count = 0 } = tweet.public_metrics;
      const engagement = like_count + (retweet_count * 2) + reply_count;
      score += Math.min(engagement / 10, 30);
    }

    // Verified account bonus (10 points)
    if (tweet.author_id) {
      // Note: Would need to fetch user data separately to check verification
      // For now, assume verified if retweet_count > like_count (professional accounts)
      if (tweet.public_metrics?.retweet_count && tweet.public_metrics?.like_count) {
        if (tweet.public_metrics.retweet_count > tweet.public_metrics.like_count) {
          score += 10;
        }
      }
    }

    // Recency bonus (0-10 points)
    const tweetAge = Date.now() - new Date(tweet.created_at || '').getTime();
    const hoursAge = tweetAge / (1000 * 60 * 60);
    if (hoursAge < 1) score += 10;
    else if (hoursAge < 6) score += 5;
    else if (hoursAge < 24) score += 2;

    return Math.min(score, 100);
  }

  private transformTweet(tweet: TweetV2, category: 'BRICS' | 'Indonesia' | 'Bali', keywords: string[]): XTweet {
    return {
      id: tweet.id,
      text: tweet.text,
      author_id: tweet.author_id,
      created_at: tweet.created_at || new Date().toISOString(),
      public_metrics: tweet.public_metrics,
      entities: tweet.entities,
      attachments: tweet.attachments,
      category,
      relevance_score: this.calculateRelevanceScore(tweet, keywords)
    };
  }

  /**
   * Search for tweets related to BRICS, multipolarity, and sustainable development
   */
  async searchTweets(params: {
    category: 'BRICS' | 'Indonesia' | 'Bali';
    limit?: number;
    includeImages?: boolean;
    minEngagement?: number;
  }): Promise<XApiResponse> {
    const { category, limit = 20, includeImages = true, minEngagement = 5 } = params;

    // Define search queries for each category
    const queries = {
      BRICS: [
        'BRICS sustainable development lang:id filter:news min_faves:5',
        'BRICS multipolarity lang:en filter:news min_faves:5',
        'BRICS partnership development lang:en filter:verified min_faves:10',
        'China Russia India Brazil South Africa cooperation filter:news'
      ],
      Indonesia: [
        'Indonesia sustainable development lang:id filter:news min_faves:3',
        'Indonesia BRICS partnership lang:id filter:news',
        'Indonesia economy development lang:en filter:news min_faves:5',
        'Southeast Asia cooperation lang:en filter:news'
      ],
      Bali: [
        'Bali sustainable tourism lang:id filter:news',
        'Bali environment development lang:en filter:news min_faves:3',
        'Bali cultural events lang:id filter:news',
        'Bali Indonesia tourism lang:en filter:news'
      ]
    };

    const searchQueries = queries[category];
    const cacheKey = this.getCacheKey(JSON.stringify(searchQueries), category);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        tweets: cached.slice(0, limit),
        cached: true,
        remaining_requests: this.MAX_REQUESTS_PER_WINDOW - this.requestCount
      };
    }

    // Check if API client is available
    if (!this.client) {
      console.warn('⚠️ X API client not available, returning empty results');
      return {
        tweets: [],
        cached: false,
        remaining_requests: 0
      };
    }

    // Check rate limits
    if (!this.checkRateLimit()) {
      const resetTime = this.windowStart + this.RATE_LIMIT_WINDOW;
      console.warn(`⚠️ X API rate limit reached. Reset at: ${new Date(resetTime).toISOString()}`);
      
      return {
        tweets: cached || [],
        cached: true,
        remaining_requests: 0,
        reset_time: resetTime
      };
    }

    try {
      const allTweets: XTweet[] = [];
      const keywords = this.extractKeywords(searchQueries);

      // Execute searches with delays between requests
      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        
        if (i > 0) {
          // Add delay between requests to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
          this.requestCount++;
          
          const response = await this.client.v2.search(query, {
            max_results: Math.min(100, limit), // API max is 100
            'tweet.fields': ['created_at', 'public_metrics', 'author_id', 'entities', 'attachments'],
            'user.fields': ['name', 'username', 'verified'],
            'media.fields': ['type', 'url', 'preview_image_url'],
            expansions: ['author_id', 'attachments.media_keys']
          });

          if (response.data && Array.isArray(response.data)) {
            const tweets = response.data.map(tweet => 
              this.transformTweet(tweet, category, keywords)
            );
            
            // Filter by engagement if specified
            const filteredTweets = tweets.filter(tweet => {
              if (minEngagement <= 0) return true;
              const engagement = (tweet.public_metrics?.like_count || 0) + 
                               (tweet.public_metrics?.retweet_count || 0);
              return engagement >= minEngagement;
            });

            // Filter by images if specified
            const finalTweets = includeImages ? 
              filteredTweets.filter(tweet => 
                tweet.attachments?.media_keys?.length || 
                tweet.entities?.media?.length
              ) : filteredTweets;

            allTweets.push(...finalTweets);
          }
        } catch (searchError) {
          console.error(`❌ Error searching X API with query "${query}":`, searchError);
          // Continue with other queries
        }
      }

      // Remove duplicates and sort by relevance
      const uniqueTweets = allTweets
        .filter((tweet, index, self) => 
          self.findIndex(t => t.id === tweet.id) === index
        )
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, limit * 2); // Get extra for cache

      // Cache results
      this.setCache(cacheKey, uniqueTweets);

      console.log(`✅ Retrieved ${uniqueTweets.length} tweets for ${category} from X API`);

      return {
        tweets: uniqueTweets.slice(0, limit),
        cached: false,
        remaining_requests: this.MAX_REQUESTS_PER_WINDOW - this.requestCount
      };

    } catch (error) {
      console.error('❌ X API search failed:', error);
      
      return {
        tweets: [],
        cached: false,
        remaining_requests: this.MAX_REQUESTS_PER_WINDOW - this.requestCount
      };
    }
  }

  private extractKeywords(queries: string[]): string[] {
    const keywords = new Set<string>();
    
    queries.forEach(query => {
      // Extract meaningful keywords, excluding operators
      const words = query
        .replace(/\b(lang:|filter:|min_faves:)\w+/g, '') // Remove operators
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && 
          !['and', 'the', 'for', 'with', 'from'].includes(word.toLowerCase())
        );
      
      words.forEach(word => keywords.add(word));
    });

    return Array.from(keywords);
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      requests_made: this.requestCount,
      window_start: new Date(this.windowStart).toISOString(),
      requests_remaining: this.MAX_REQUESTS_PER_WINDOW - this.requestCount,
      cache_entries: this.cache.size,
      next_reset: new Date(this.windowStart + this.RATE_LIMIT_WINDOW).toISOString()
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('✅ X API cache cleared');
  }
}

// Export singleton instance
export const xApiService = new XApiService();
export type { XTweet, XApiResponse };