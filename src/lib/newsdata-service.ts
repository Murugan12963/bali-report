// Using native fetch instead of axios for better compatibility
import { newsdataCache } from './newsdata-cache';

/**
 * NewsData.io API service for Bali Report news aggregation.
 * Provides high-quality, real-time news articles before falling back to RSS/scraping.
 */

export interface NewsdataArticle {
  article_id: string;
  title: string;
  link: string;
  description: string;
  content?: string;
  pubDate: string;
  image_url?: string;
  source_id: string;
  source_name: string;
  source_url: string;
  source_icon: string;
  language: string;
  country: string[];
  category: string[];
  ai_tag?: string;
  sentiment?: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string;
  duplicate?: boolean;
}

export interface NewsdataResponse {
  status: string;
  totalResults: number;
  results: NewsdataArticle[];
  nextPage?: string;
}

export interface NewsdataError {
  code: string;
  message: string;
}

// Category mapping from Newsdata.io categories to our internal categories
const CATEGORY_MAPPING: Record<string, 'BRICS' | 'Indonesia' | 'Bali'> = {
  // Global/International categories -> BRICS
  'world': 'BRICS',
  'politics': 'BRICS',
  'business': 'BRICS',
  'economics': 'BRICS',
  'international': 'BRICS',
  'geopolitics': 'BRICS',
  
  // Indonesia-specific
  'indonesia': 'Indonesia',
  'jakarta': 'Indonesia',
  'java': 'Indonesia',
  
  // Bali-specific
  'bali': 'Bali',
  'denpasar': 'Bali',
  'tourism': 'Bali',
  'culture': 'Bali',
};

// Language preferences for different regions
const LANGUAGE_PREFERENCES = {
  BRICS: ['en', 'zh', 'ru', 'hi', 'pt', 'ar'],
  Indonesia: ['id', 'en'],
  Bali: ['id', 'en']
} as const;

// Country codes for regional filtering
const COUNTRY_FILTERS = {
  BRICS: ['us', 'cn', 'ru', 'in', 'br', 'za', 'ir', 'eg'],
  Indonesia: ['id'],
  Bali: ['id']
} as const;

class NewsdataService {
  private apiKey: string;
  private baseUrl = 'https://newsdata.io/api/1/news';
  private rateLimitDelay = 1000; // 1 second between requests for API stability
  private lastRequestTime = 0;
  // Note: Credit tracking is now handled by newsdataCache

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEWSDATA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  NEWSDATA_API_KEY not found. NewsData.io service will be disabled.');
    }
  }

  /**
   * Check if NewsData.io service is available.
   * 
   * Returns:
   *   boolean: True if API key is available and service is ready.
   */
  isAvailable(): boolean {
    return !!this.apiKey && !newsdataCache.hasExceededLimit();
  }

  /**
   * Enforce rate limiting for API stability.
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch news articles from NewsData.io API.
   * 
   * Args:
   *   category ('BRICS' | 'Indonesia' | 'Bali'): Target content category.
   *   limit (number): Maximum articles to fetch (default: 50).
   *   page (string): Pagination token for additional results.
   * 
   * Returns:
   *   Promise<NewsdataResponse>: API response with articles.
   */
  async fetchArticles(
    category: 'BRICS' | 'Indonesia' | 'Bali' = 'BRICS',
    limit: number = 50,
    page?: string
  ): Promise<NewsdataResponse> {
    // Check cache first
    const cachedArticles = await newsdataCache.get(category);
    if (cachedArticles) {
      return {
        status: 'success',
        totalResults: cachedArticles.length,
        results: cachedArticles.slice(0, limit) // Respect limit even from cache
      };
    }

    if (!this.isAvailable()) {
      throw new Error('NewsData.io service not available (missing API key or daily limit exceeded)');
    }

    // Check if we have enough credits for this request
    if (!newsdataCache.canMakeRequest(limit)) {
      const remaining = newsdataCache.getRemainingCredits();
      const maxArticles = newsdataCache.getRemainingArticles();
      throw new Error(`Not enough credits for ${limit} articles. Remaining: ${remaining} credits (${maxArticles} articles max)`);
    }

    await this.enforceRateLimit();

    // Use minimal parameters that work with free tier
    const params = new URLSearchParams({
      apikey: this.apiKey,
      size: Math.min(limit, 10).toString(), // Free tier max is 10
    });

    // Add basic filters that work
    if (category === 'Indonesia' || category === 'Bali') {
      params.append('country', 'id');
      params.append('language', 'id,en');
    } else if (category === 'BRICS') {
      // For BRICS, just use English without country restrictions
      params.append('language', 'en');
    }

    if (page) {
      params.append('page', page);
    }

    try {
      const stats = newsdataCache.getStats();
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DISABLE_NEWSDATA_CREDIT_TRACKING === 'true';
      
      if (isDevelopment) {
        console.log(`🔍 Fetching ${category} articles from NewsData.io (Development Mode - Credit tracking disabled)`);
      } else {
        console.log(`🔍 Fetching ${category} articles from NewsData.io (${stats.dailyCreditsUsed}/200 credits used)`);
      }
      
      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Bali-Report/1.0 (https://bali.report; News Aggregator)',
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
      }
      
      console.log(`✅ NewsData.io: ${data.results.length} ${category} articles received (${data.totalResults} total available)`);
      
      // Cache the results
      await newsdataCache.set(category, data.results, limit);
      
      return data;
      
    } catch (error: any) {
      console.error(`❌ NewsData.io API error for ${category}:`, error.message);
      
      // Handle specific API errors based on error message
      if (error.message.includes('429')) {
        console.warn('⚠️  NewsData.io rate limit exceeded');
      } else if (error.message.includes('401')) {
        console.error('🔑 Invalid NewsData.io API key');
      } else if (error.message.includes('422')) {
        console.warn('⚠️  NewsData.io parameter error');
      }
      
      throw error;
    }
  }

  /**
   * Convert NewsData.io article to our internal Article format.
   * 
   * Args:
   *   newsdataArticle (NewsdataArticle): Article from NewsData.io API.
   *   category ('BRICS' | 'Indonesia' | 'Bali'): Content category.
   * 
   * Returns:
   *   Article: Converted article in internal format.
   */
  convertToArticle(newsdataArticle: NewsdataArticle, category: 'BRICS' | 'Indonesia' | 'Bali'): {
    id: string;
    title: string;
    link: string;
    description: string;
    pubDate: string;
    author?: string;
    category?: string;
    source: string;
    sourceUrl: string;
    imageUrl?: string;
  } {
    return {
      id: newsdataArticle.article_id,
      title: newsdataArticle.title,
      link: newsdataArticle.link,
      description: newsdataArticle.description || '',
      pubDate: newsdataArticle.pubDate,
      author: newsdataArticle.creator?.[0],
      category: category,
      source: `${newsdataArticle.source_name} (NewsData.io)`,
      sourceUrl: newsdataArticle.source_url,
      imageUrl: newsdataArticle.image_url,
    };
  }

  /**
   * Batch fetch articles for all categories.
   * 
   * Args:
   *   articlesPerCategory (number): Articles to fetch per category (default: 30).
   * 
   * Returns:
   *   Promise<Article[]>: Combined articles from all categories.
   */
  async fetchAllCategories(articlesPerCategory: number = 30): Promise<any[]> {
    if (!this.isAvailable()) {
      console.log('📄 NewsData.io service not available, skipping');
      return [];
    }

    const allArticles: any[] = [];
    const categories: ('BRICS' | 'Indonesia' | 'Bali')[] = ['BRICS', 'Indonesia', 'Bali'];

    for (const category of categories) {
      try {
        const response = await this.fetchArticles(category, articlesPerCategory);
        
        const convertedArticles = response.results.map(article => 
          this.convertToArticle(article, category)
        );
        
        allArticles.push(...convertedArticles);
        console.log(`📰 Added ${convertedArticles.length} ${category} articles from NewsData.io`);
        
        // Small delay between category requests
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`❌ Failed to fetch ${category} from NewsData.io:`, error.message);
        // Continue with other categories
      }
    }

    console.log(`🎯 NewsData.io: Total ${allArticles.length} articles across all categories`);
    return allArticles;
  }

  /**
   * Search for articles with specific keywords.
   * 
   * Args:
   *   query (string): Search query.
   *   category ('BRICS' | 'Indonesia' | 'Bali'): Target category.
   *   limit (number): Maximum results.
   * 
   * Returns:
   *   Promise<NewsdataResponse>: Search results.
   */
  async searchArticles(
    query: string,
    category: 'BRICS' | 'Indonesia' | 'Bali' = 'BRICS',
    limit: number = 20
  ): Promise<NewsdataResponse> {
    if (!this.isAvailable()) {
      throw new Error('NewsData.io service not available');
    }

    await this.enforceRateLimit();

    const params = new URLSearchParams({
      apikey: this.apiKey,
      q: query,
      size: Math.min(limit, 50).toString(),
      language: LANGUAGE_PREFERENCES[category].join(','),
      country: COUNTRY_FILTERS[category].join(','),
      removeduplicate: '1',
    });

    try {
      console.log(`🔍 Searching NewsData.io for: "${query}" in ${category}`);
      
      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Bali-Report/1.0 (https://bali.report; News Aggregator)',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
      }

      console.log(`✅ NewsData.io search: ${data.totalResults} results for "${query}"`);
      return data;
      
    } catch (error: any) {
      console.error(`❌ NewsData.io search error:`, error.message);
      throw error;
    }
  }

  /**
   * Get current usage statistics.
   * 
   * Returns:
   *   object: Usage stats including credit count and availability.
   */
  getUsageStats() {
    const cacheStats = newsdataCache.getStats();
    return {
      creditsUsed: cacheStats.dailyCreditsUsed,
      creditsLimit: 200,
      remainingCredits: cacheStats.remainingCredits,
      maxArticlesRemaining: cacheStats.maxArticlesRemaining,
      isAvailable: this.isAvailable(),
      lastRequestTime: new Date(this.lastRequestTime).toISOString(),
      cacheHitRate: cacheStats.cacheHitRate,
      cachedArticles: cacheStats.totalArticles
    };
  }

  /**
   * Reset daily usage counter (for testing or new day).
   */
  resetUsageCounter() {
    newsdataCache.resetDailyCounter();
    console.log('🔄 NewsData.io usage counter reset');
  }
}

// Create singleton instance
export const newsdataService = new NewsdataService();

// Export for testing
export { NewsdataService };