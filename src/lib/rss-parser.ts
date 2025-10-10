import Parser from 'rss-parser';
import { rssCache } from './rss-cache';
import { webScraper } from './web-scraper';
import { contentModerationService } from './content-moderation';
import { newsdataService } from './newsdata-service';

/**
 * RSS Parser configuration and types for Bali Report news aggregation.
 */

export interface Article {
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
}

export interface NewsSource {
  name: string;
  url: string;
  category: 'BRICS' | 'Indonesia' | 'Bali';
  active: boolean;
}

// News sources configuration based on PRP requirements
export const NEWS_SOURCES: NewsSource[] = [
  // BRICS-aligned sources
  {
    name: 'RT News',
    url: 'https://www.rt.com/rss/',
    category: 'BRICS',
    active: true,
  },
  // Global Times has RSS issues - replaced with TASS
  {
    name: 'TASS',
    url: 'https://tass.com/rss/v2.xml',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Xinhua News',
    url: 'http://www.xinhuanet.com/english/rss/worldrss.xml',
    category: 'BRICS',
    active: true,
  },
  // Indonesia/Bali sources - using working alternatives
  {
    name: 'Antara News',
    url: 'https://www.antaranews.com/rss/terkini.xml',
    category: 'Indonesia',
    active: true,
  },
  {
    name: 'BBC Asia News',
    url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml',
    category: 'Indonesia',
    active: true,
  },
  {
    name: 'Press TV',
    url: 'https://www.presstv.ir/rss.xml',
    category: 'BRICS',
    active: false, // Temporarily disabled - often slow
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'BRICS',
    active: true,
  },
  // Disabled sources that need fixing
  {
    name: 'Global Times',
    url: 'https://www.globaltimes.cn/rss/china.xml',
    category: 'BRICS',
    active: false, // Temporarily disabled - RSS feed issues
  },
  {
    name: 'CGTN News',
    url: 'https://www.cgtn.com/subscribe/rss/section/world.xml',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'China Daily',
    url: 'https://www.chinadaily.com.cn/rss/world_rss.xml',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Sputnik Globe',
    url: 'https://sputnikglobe.com/export/rss2/archive/index.xml',
    category: 'BRICS',
    active: true, // Fixed with correct RSS URL
  },
  {
    name: 'Jakarta Globe',
    url: 'https://jakartaglobe.id/feed',
    category: 'Indonesia',
    active: true, // Re-enabled with backup scraper
  },
  {
    name: 'Jakarta Post',
    url: 'https://www.thejakartapost.com/rss',
    category: 'Indonesia',
    active: false, // Temporarily disabled - often slow
  },
  {
    name: 'Bali Post',
    url: 'https://www.balipost.com/rss',
    category: 'Bali',
    active: true, // Re-enabled with backup scraper
  },
  // Indonesian business and news sources
  {
    name: 'Indonesia Business Post',
    url: 'https://indonesiabusinesspost.com/feed/',
    category: 'Indonesia',
    active: true, // Re-enabled with backup scraper (already working in scraper)
  },
  {
    name: 'Tempo News',
    url: 'https://www.tempo.co/rss',
    category: 'Indonesia',
    active: false, // Temporarily disabled - 403 Forbidden errors
  },
  // BRICS-aligned Indian sources
  {
    name: 'NDTV News',
    url: 'https://feeds.feedburner.com/ndtvnews-latest',
    category: 'BRICS',
    active: true, // Indian perspective on global affairs
  },
  {
    name: 'NDTV World',
    url: 'https://feeds.feedburner.com/ndtvnews-world',
    category: 'BRICS',
    active: true, // Re-enabled with backup scraper
  },
  {
    name: 'NDTV Business',
    url: 'https://feeds.feedburner.com/ndtvnews-business',
    category: 'BRICS',
    active: true, // Re-enabled with backup scraper
  },
  // Asian news sources
  {
    name: 'South China Morning Post - China',
    url: 'https://www.scmp.com/rss/91/feed',
    category: 'BRICS',
    active: true, // Re-enabled with backup scraper
  },
  {
    name: 'South China Morning Post - Asia',
    url: 'https://www.scmp.com/rss/5/feed',
    category: 'BRICS',
    active: true, // Re-enabled with backup scraper
  },
  {
    name: 'South China Morning Post - Business',
    url: 'https://www.scmp.com/rss/92/feed',
    category: 'BRICS',
    active: true, // Re-enabled with backup scraper
  },
  // Note: Detik RSS feeds appear to be broken based on external context
  // Note: Kompas RSS feeds return 404 errors
  // Note: Tempo RSS feeds return 403 Forbidden
  // Geopolitical analysis sources
  {
    name: 'UN News',
    url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'The Diplomat',
    url: 'https://thediplomat.com/feed/',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Global Issues',
    url: 'https://www.globalissues.org/news/feed',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'E-International Relations',
    url: 'https://www.e-ir.info/feed/',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Foreign Affairs Geopolitics',
    url: 'https://www.foreignaffairs.com/feeds/topic/Geopolitics/rss.xml',
    category: 'BRICS',
    active: false, // Temporarily disabled - paywall issues
  },
  {
    name: 'Geopolitical Economy',
    url: 'https://geopoliticaleconomy.com/feed/',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Financial Times Geopolitics',
    url: 'https://www.ft.com/geopolitics?format=rss',
    category: 'BRICS',
    active: false, // Temporarily disabled - paywall issues
  },
  {
    name: 'RAND International Affairs',
    url: 'https://www.rand.org/topics/international-affairs.xml/feed',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Geopolitical Futures',
    url: 'https://geopoliticalfutures.com/feed/',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Fifty Year Perspective',
    url: 'https://fiftyyearperspective.com/feed/',
    category: 'BRICS',
    active: true,
  },
  {
    name: 'Eclinik WordPress',
    url: 'https://eclinik.wordpress.com/feed/',
    category: 'BRICS',
    active: true
  },
  // BRICS Organizations RSS Feeds
  {
    name: 'InfoBRICS',
    url: 'https://infobrics.org/rss/',
    category: 'BRICS',
    active: true
  },
  {
    name: 'BRICS Policy Center',
    url: 'https://bricspolicycenter.org/en/feed/',
    category: 'BRICS',
    active: false // Temporarily disabled - often slow
  },
  {
    name: 'TV BRICS',
    url: 'https://tvbrics.com/en/feed/',
    category: 'BRICS',
    active: false // Temporarily disabled - often slow
  },
  {
    name: 'BRICS Business Council India',
    url: 'https://bricsbusinesscouncil.co.in/feed/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'SA BRICS Business Council',
    url: 'https://sabricsbusinesscouncil.co.za/feed/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'BRICS Chamber of Commerce',
    url: 'https://bricscci.com/feed/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'Shanghai Cooperation Organisation',
    url: 'https://eng.sectsco.org/rss/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'Valdai Discussion Club',
    url: 'https://valdaiclub.com/feed/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'BRICS Universities Association',
    url: 'https://brics.world/feed/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'BRICS Brasil',
    url: 'https://brics.br/feed/',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'BRICS University of Toronto',
    url: 'http://brics.utoronto.ca/rss.xml',
    category: 'BRICS',
    active: true // Will fallback to scraper if RSS fails
  },
  {
    name: 'SouthFront',
    url: 'https://southfront.press/feed/',
    category: 'BRICS',
    active: true
  },
];

// Enhanced User-Agent rotation to bypass bot detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36',
  'NewsAggregator/1.0 (https://bali.report; RSS Reader)',
];

class RSSAggregator {
  private parser: Parser;
  private sources: NewsSource[];
  private userAgentIndex: number = 0;

  constructor(sources: NewsSource[] = NEWS_SOURCES) {
    this.parser = new Parser({
      timeout: 15000, // Increased timeout for better reliability
      headers: {
        'User-Agent': this.getNextUserAgent(),
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'DNT': '1',
      },
      customFields: {
        item: [
          ['media:content', 'media:content'],
          ['media:thumbnail', 'media:thumbnail'],
          ['enclosure', 'enclosure'],
          ['image', 'image'],
        ],
      },
    });
    this.sources = sources;
  }

  /**
   * Get next User-Agent in rotation to bypass bot detection.
   * 
   * Returns:
   *   string: Next User-Agent string.
   */
  private getNextUserAgent(): string {
    const userAgent = USER_AGENTS[this.userAgentIndex];
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
    return userAgent;
  }

  /**
   * Fetch RSS with enhanced error handling and User-Agent rotation.
   * 
   * Args:
   *   url (string): RSS feed URL.
   *   retryCount (number): Current retry attempt.
   * 
   * Returns:
   *   Promise<Parser.Output>: Parsed RSS feed.
   */
  private async fetchWithRetry(url: string, retryCount: number = 0): Promise<any> {
    const maxRetries = 3;
    
    try {
      // Rotate User-Agent for each retry attempt
      const parser = new Parser({
        timeout: 15000,
        headers: {
          'User-Agent': this.getNextUserAgent(),
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'DNT': '1',
          'Referer': 'https://google.com/', // Some sites require referer
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'cross-site',
        },
        customFields: {
          item: [
            ['media:content', 'media:content'],
            ['media:thumbnail', 'media:thumbnail'], 
            ['enclosure', 'enclosure'],
            ['image', 'image'],
          ],
        },
      });
      
      const feed = await parser.parseURL(url);
      
      // Validate that we got actual RSS content
      if (!feed || !feed.items || feed.items.length === 0) {
        throw new Error(`No valid RSS content found at ${url}`);
      }
      
      return feed;
    } catch (error: any) {
      // Log specific error details for debugging
      const errorType = error.message?.includes('timeout') ? 'TIMEOUT' :
                       error.message?.includes('Non-whitespace before first tag') ? 'HTML_RESPONSE' :
                       error.message?.includes('Status code') ? 'HTTP_ERROR' :
                       error.message?.includes('ENOTFOUND') ? 'DNS_ERROR' : 'PARSE_ERROR';
      
      if (retryCount < maxRetries && errorType !== 'HTML_RESPONSE') {
        console.log(`🔄 Retry ${retryCount + 1}/${maxRetries} for ${url} (${errorType}) with different User-Agent`);
        // Wait with exponential backoff before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount + 1) * 1000));
        return this.fetchWithRetry(url, retryCount + 1);
      }
      
      // Don't retry HTML responses - they won't become RSS feeds
      if (errorType === 'HTML_RESPONSE') {
        console.log(`⚠️  ${url} returned HTML instead of RSS - skipping retries`);
      }
      
      throw error;
    }
  }

  /**
   * Fetch and parse RSS feed from a single source with caching.
   * 
   * Args:
   *   source (NewsSource): The news source configuration.
   *   skipCache (boolean): Skip cache and force fresh fetch.
   * 
   * Returns:
   *   Promise<Article[]>: Array of parsed articles.
   */
  async fetchFromSource(source: NewsSource, skipCache: boolean = false): Promise<Article[]> {
    // Check cache first unless explicitly skipped
    if (!skipCache) {
      const cached = rssCache.get(source.url);
      
      if (cached && !rssCache.isStale(source.url)) {
        console.log(`📦 Using cached data for ${source.name} (${cached.articles.length} articles)`);
        return cached.articles;
      }
      
      // If stale but available, use it while fetching new data
      if (cached && rssCache.isStale(source.url)) {
        console.log(`♻️ Using stale cache for ${source.name} while fetching new data`);
        // Fetch new data in background
        this.fetchFromSource(source, true).catch(err => 
          console.warn(`⚠️ Background refresh failed for ${source.name}:`, err)
        );
        return cached.articles;
      }
    }
    const maxRetries = 1; // Reduced retries for faster response
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching RSS from ${source.name}... (attempt ${attempt}/${maxRetries})`);
        
        // Use enhanced fetch with User-Agent rotation
        const feed = await this.fetchWithRetry(source.url);
        
        if (!feed.items || feed.items.length === 0) {
          throw new Error(`No articles found in RSS feed for ${source.name}`);
        }
        
        const articles: Article[] = feed.items.map((item: any, index: number) => {
          const imageUrl = this.extractImageUrl(item);
          if (imageUrl && index === 0) {
            console.log(`📸 Found image for ${source.name}: ${imageUrl.substring(0, 60)}...`);
          }
          return {
            id: `${source.name.toLowerCase().replace(/\\s+/g, '-')}-${index}-${Date.now()}`,
            title: item.title || 'No title',
            link: item.link || '',
            description: this.extractDescription(item.contentSnippet || item.description || ''),
            pubDate: item.pubDate || new Date().toISOString(),
            author: item.creator || item.author,
            category: source.category,
            source: source.name,
            sourceUrl: source.url,
            imageUrl,
          };
        });

        console.log(`✅ Successfully fetched ${articles.length} articles from ${source.name}`);
        
        // Apply content moderation before caching
        const moderatedResult = await contentModerationService.moderateArticles(articles);
        const moderatedArticles = moderatedResult.approved;
        
        if (moderatedResult.rejected.length > 0) {
          console.log(`🛡️ Content moderation: ${moderatedResult.approved.length} approved, ${moderatedResult.rejected.length} rejected from ${source.name}`);
          console.log(`📋 Quality score: ${Math.round((moderatedResult.approved.length / articles.length) * 100)}%`);
        }
        
        // Cache the moderated articles
        if (!skipCache) {
          rssCache.set(source.url, source, moderatedArticles);
        }
        
        return moderatedArticles;
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof Error) {
          const errorType = error.message.includes('Status code 404') ? '404 Not Found' :
                           error.message.includes('Status code 403') ? '403 Forbidden' :
                           error.message.includes('ENOTFOUND') ? 'DNS Resolution Failed' :
                           error.message.includes('timeout') ? 'Timeout' :
                           'Parse Error';
          
          console.warn(`⚠️  Attempt ${attempt}/${maxRetries} failed for ${source.name} (${errorType}): ${error.message}`);
        }
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, etc.
          console.log(`   Retrying in ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If RSS fetch fails, try web scraping as fallback (this is expected for some sources)
    console.log(`🕷️ Attempting web scraping fallback for ${source.name}...`);
    
    try {
      const scrapedArticles = await webScraper.scrapeBySourceName(source.name);
      if (scrapedArticles.length > 0) {
        console.log(`✅ Scraped ${scrapedArticles.length} articles from ${source.name} as RSS fallback`);
        
        // Apply content moderation to scraped articles too
        const moderatedResult = await contentModerationService.moderateArticles(scrapedArticles);
        const moderatedScrapedArticles = moderatedResult.approved;
        
        if (moderatedResult.rejected.length > 0) {
          console.log(`🛡️ Scraped content moderation: ${moderatedResult.approved.length} approved, ${moderatedResult.rejected.length} rejected`);
        }
        
        // Cache the moderated scraped results
        if (!skipCache) {
          rssCache.set(source.url, source, moderatedScrapedArticles);
        }
        
        return moderatedScrapedArticles;
      }
    } catch (scrapeError) {
      // Silently handle - some sources may not have scraping fallback configured
    }
    
    return [];
  }


  /**
   * Fetch articles from sources by category (RSS + scraped).
   * 
   * Args:
   *   category (string): The category to filter by.
   *   includeScrapers (boolean): Include scraped sources.
   * 
   * Returns:
   *   Promise<Article[]>: Articles from the specified category.
   */
  async fetchByCategory(category: 'BRICS' | 'Indonesia' | 'Bali', includeScrapers: boolean = false): Promise<Article[]> {
    const categorySource = this.sources.filter(
      source => source.category === category && source.active
    );
    
    const promises = categorySource.map(source => this.fetchFromSource(source));
    
    try {
      const results = await Promise.allSettled(promises);
      const articles: Article[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          articles.push(...result.value);
        } else {
          // Silently skip failed sources - fallback mechanisms are in place
        }
      });
      
      // Add scraped articles for this category if requested
      if (includeScrapers) {
        try {
          console.log(`🕷️ Attempting to scrape ${category} sources...`);
          const scrapedArticles = await webScraper.scrapeByCategory(category);
          if (scrapedArticles.length > 0) {
            articles.push(...scrapedArticles);
            console.log(`🕷️ Added ${scrapedArticles.length} scraped ${category} articles`);
          }
        } catch (error) {
          // Silently handle scraping errors
        }
      }
      
      return articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    } catch (error) {
      console.error(`Error fetching ${category} sources:`, error);
      return [];
    }
  }

  /**
   * Fetch articles from NewsData.io as primary source.
   * 
   * Returns:
   *   Promise<Article[]>: Articles from NewsData.io API.
   */
  async fetchFromNewsdata(): Promise<Article[]> {
    if (!newsdataService.isAvailable()) {
      const stats = newsdataService.getUsageStats();
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DISABLE_NEWSDATA_CREDIT_TRACKING === 'true';
      
      if (isDevelopment) {
        console.log(`📄 NewsData.io not available (Development Mode - Credit tracking disabled)`);
      } else {
        console.log(`📄 NewsData.io not available: ${stats.creditsUsed}/${stats.creditsLimit} credits used`);
      }
      return [];
    }

    try {
      console.log('🌐 Fetching articles from NewsData.io (primary source with aggressive caching)...');
      
      // Optimize article requests for credit efficiency  
      // Request 10 articles per category (free tier max) = 1 credit per category = 3 total credits for all 3 categories
      const newsdataArticles = await newsdataService.fetchAllCategories(10);
      
      if (newsdataArticles.length > 0) {
        const stats = newsdataService.getUsageStats();
        const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DISABLE_NEWSDATA_CREDIT_TRACKING === 'true';
        
        console.log(`✅ NewsData.io: ${newsdataArticles.length} high-quality articles fetched`);
        
        if (isDevelopment) {
          console.log(`📊 NewsData.io usage: Development Mode - Credit tracking disabled`);
        } else {
          console.log(`📊 NewsData.io usage: ${stats.creditsUsed}/${stats.creditsLimit} credits used (${stats.remainingCredits} credits remaining)`);
        }
        
        console.log(`💾 Cache efficiency: ${(stats.cacheHitRate * 100).toFixed(1)}% hit rate, ${stats.cachedArticles} cached articles`);
        
        // Apply content moderation to NewsData.io articles
        const moderatedResult = await contentModerationService.moderateArticles(newsdataArticles);
        
        if (moderatedResult.rejected.length > 0) {
          console.log(`🛡️ NewsData.io moderation: ${moderatedResult.approved.length} approved, ${moderatedResult.rejected.length} rejected`);
        }
        
        return moderatedResult.approved;
      }
      
      return [];
      
    } catch (error: any) {
      console.warn('⚠️  NewsData.io fetch failed:', error.message);
      return [];
    }
  }

  /**
   * Prioritize sources based on reliability and speed.
   * 
   * Args:
   *   sources (NewsSource[]): Sources to prioritize.
   * 
   * Returns:
   *   NewsSource[]: Prioritized sources array.
   */
  private prioritizeSources(sources: NewsSource[]): NewsSource[] {
    // High priority sources (known to be fast and reliable)
    const highPriority = [
      'Al Jazeera', 'BBC Indonesia', 'RT News', 'TASS', 'Xinhua News', 
      'Jakarta Globe', 'Antara News', 'Tempo News', 'CGTN', 'China Daily'
    ];
    
    // Medium priority sources 
    const mediumPriority = [
      'Indonesia Business Post', 'Bali Post', 'NDTV News', 'Sputnik Globe',
      'South China Morning Post', 'Global Times', 'Press TV Iran'
    ];
    
    const high = sources.filter(s => highPriority.includes(s.name));
    const medium = sources.filter(s => mediumPriority.includes(s.name) && !highPriority.includes(s.name));
    const others = sources.filter(s => !highPriority.includes(s.name) && !mediumPriority.includes(s.name));
    
    return [...high, ...medium, ...others];
  }

  /**
   * Process RSS sources in batches with concurrency control.
   * 
   * Args:
   *   sources (NewsSource[]): Sources to process.
   *   batchSize (number): Number of sources per batch.
   * 
   * Returns:
   *   Promise<Article[]>: Articles from processed sources.
   */
  private async processBatchedSources(sources: NewsSource[], batchSize: number = 8): Promise<Article[]> {
    const allArticles: Article[] = [];
    const targetArticleCount = 100;
    let successCount = 0;
    let failureCount = 0;

    // Process sources in batches to avoid overwhelming servers
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sources.length/batchSize)} (${batch.length} sources)`);
      
      const batchPromises = batch.map(source => this.fetchFromSource(source));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            allArticles.push(...result.value);
            if (result.value.length > 0) {
              successCount++;
            }
          } else {
            failureCount++;
          }
        });
        
        // Early return if we have enough articles for good user experience
        if (allArticles.length >= targetArticleCount) {
          console.log(`🎯 Early return: ${allArticles.length} articles collected (target: ${targetArticleCount})`);
          break;
        }
        
      } catch (error) {
        console.error(`❌ Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    console.log(`📊 RSS Summary: ${successCount} sources succeeded, ${failureCount} failed, ${allArticles.length} articles`);
    return allArticles;
  }

  /**
   * Fetch articles from all sources with NewsData.io prioritized.
   * Tries NewsData.io first, then falls back to RSS + scraping as needed.
   * 
   * Returns:
   *   Promise<Article[]>: Combined array of articles from all sources.
   */
  async fetchAllSources(includeScrapers: boolean = false): Promise<Article[]> {
    const allArticles: Article[] = [];
    
    // STEP 1: Try NewsData.io as primary source
    const newsdataArticles = await this.fetchFromNewsdata();
    allArticles.push(...newsdataArticles);
    
    // STEP 2: Fallback to RSS sources (only if NewsData.io didn't provide enough content)
    const targetArticleCount = 100; // Target minimum articles
    const needMoreArticles = allArticles.length < targetArticleCount;
    
    if (needMoreArticles || !newsdataService.isAvailable()) {
      console.log(`📡 Fetching RSS sources (${needMoreArticles ? 'supplementing NewsData.io' : 'NewsData.io unavailable'})...`);
      
      const activeSources = this.sources.filter(source => source.active);
      console.log(`🌍 Processing ${activeSources.length} RSS sources in batches...`);
      
      // Prioritize high-quality sources first
      const prioritizedSources = this.prioritizeSources(activeSources);
      
      // Process sources in batches with early return
      const rssArticles = await this.processBatchedSources(prioritizedSources, 4);
      allArticles.push(...rssArticles);
      
      console.log(`🛡️ All articles have been processed through content moderation`);
    }
    
    // STEP 3: Add scraped articles if requested
    if (includeScrapers) {
      try {
        console.log('🕷️ Attempting to scrape additional sources...');
        const scrapedArticles = await webScraper.scrapeAllSources();
        if (scrapedArticles.length > 0) {
          allArticles.push(...scrapedArticles);
          console.log(`🕷️ Added ${scrapedArticles.length} scraped articles`);
        }
      } catch (error) {
        console.error('Failed to scrape additional sources:', error);
      }
    }
    
    // Final summary
    console.log(`🎯 Final Summary: ${allArticles.length} total articles (NewsData.io: ${newsdataArticles.length}, RSS: ${allArticles.length - newsdataArticles.length})`);
    
    // Sort articles by publication date (newest first)
    return allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }

  /**
   * Get cache statistics for monitoring.
   * 
   * Returns:
   *   object: Cache statistics and information.
   */
  getCacheStats() {
    const stats = rssCache.getStats();
    const cachedSources = rssCache.getCachedSources();
    const hitRate = rssCache.getHitRate();
    
    return {
      ...stats,
      hitRate,
      cachedSources,
    };
  }

  /**
   * Clear RSS cache.
   * 
   * Args:
   *   expiredOnly (boolean): Only clear expired entries.
   */
  clearCache(expiredOnly: boolean = false): void {
    if (expiredOnly) {
      const removed = rssCache.clearExpired();
      console.log(`🧹 Cleared ${removed} expired cache entries`);
    } else {
      rssCache.clear();
    }
  }

  /**
   * Warm up cache by pre-fetching all active sources.
   */
  async warmCache(): Promise<void> {
    await rssCache.warmUp((source) => this.fetchFromSource(source, true));
  }

  /**
   * Get list of active news sources.
   * 
   * Returns:
   *   NewsSource[]: Array of active news sources.
   */
  getActiveSources(): NewsSource[] {
    return this.sources.filter(source => source.active);
  }

  /**
   * Extract and truncate description to specified length.
   * 
   * Args:
   *   description (string): Raw description text.
   *   maxLength (number): Maximum character length.
   * 
   * Returns:
   *   string: Cleaned and truncated description.
   */
  private extractDescription(description: string, maxLength: number = 200): string {
    // Remove HTML tags and clean up
    const cleaned = description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (cleaned.length <= maxLength) return cleaned;
    
    // Truncate at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  }

  /**
   * Extract image URL from RSS item.
   * 
   * Args:
   *   item (any): RSS item object.
   * 
   * Returns:
   *   string | undefined: Image URL if found.
   */
  private extractImageUrl(item: any): string | undefined {
    // Try enclosure
    if (item.enclosure?.url) {
      const url = item.enclosure.url;
      if (typeof url === 'string' && (item.enclosure?.type?.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i))) {
        return url;
      }
    }
    
    // Try media:thumbnail
    if (item['media:thumbnail']) {
      const thumb = item['media:thumbnail'];
      if (typeof thumb === 'object' && thumb['$']?.url) {
        return thumb['$'].url;
      }
      if (typeof thumb === 'object' && thumb.url) {
        return thumb.url;
      }
      if (typeof thumb === 'string') {
        return thumb;
      }
    }
    
    // Try media:content
    if (item['media:content']) {
      const media = item['media:content'];
      if (Array.isArray(media)) {
        const imageMedia = media.find((m: any) => 
          m['$']?.type?.startsWith('image/') || m['$']?.medium === 'image'
        );
        if (imageMedia?.['$']?.url) {
          return imageMedia['$'].url;
        }
      } else if (typeof media === 'object') {
        if (media['$']?.url && (media['$']?.type?.startsWith('image/') || media['$']?.medium === 'image')) {
          return media['$'].url;
        }
      }
    }
    
    // Try item.image
    if (item.image) {
      if (typeof item.image === 'string') {
        return item.image;
      }
      if (typeof item.image === 'object' && item.image.url) {
        return item.image.url;
      }
    }
    
    // Try to extract from content/description HTML
    const content = item.content || item['content:encoded'] || item.description || '';
    if (typeof content === 'string') {
      // Try img src
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        const url = imgMatch[1];
        // Skip tracking pixels and small images
        if (!url.includes('1x1') && !url.includes('pixel')) {
          return url;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Test RSS parser with a single source.
   * 
   * Args:
   *   sourceName (string): Name of the source to test.
   * 
   * Returns:
   *   Promise<boolean>: Success status of the test.
   */
  async testSource(sourceName: string): Promise<boolean> {
    const source = this.sources.find(s => s.name === sourceName);
    if (!source) {
      console.error(`Source ${sourceName} not found`);
      return false;
    }
    
    try {
      const articles = await this.fetchFromSource(source);
      console.log(`Test successful! Fetched ${articles.length} articles from ${sourceName}`);
      if (articles.length > 0) {
        console.log('Sample article:', {
          title: articles[0].title,
          description: articles[0].description.substring(0, 100) + '...',
          pubDate: articles[0].pubDate,
        });
      }
      return true;
    } catch (error) {
      console.error(`Test failed for ${sourceName}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const rssAggregator = new RSSAggregator();

// Export class for custom instances
export { RSSAggregator };