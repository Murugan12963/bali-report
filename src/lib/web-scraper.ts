/**
 * Web Scraper for sites without RSS feeds
 * Extracts articles from news websites and blogs
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Article } from './rss-parser';

export interface ScraperConfig {
  name: string;
  url: string;
  category: 'BRICS' | 'Indonesia' | 'Bali';
  selectors: {
    articleList: string;        // Selector for article container
    articleLink: string;        // Selector for article URL
    articleTitle: string;       // Selector for article title
    articleDescription?: string; // Selector for article summary
    articleDate?: string;       // Selector for publication date
    articleAuthor?: string;     // Selector for author
    articleImage?: string;      // Selector for featured image
  };
  baseUrl?: string;            // Base URL if links are relative
  maxArticles?: number;        // Max articles to scrape
  active: boolean;
}

// Configuration for sites to scrape
export const SCRAPER_SOURCES: ScraperConfig[] = [
  {
    name: 'Bali Post',
    url: 'https://www.balipost.com/',
    category: 'Bali',
    selectors: {
      articleList: '.post-item, article.post',
      articleLink: 'h2 a, .post-title a',
      articleTitle: 'h2, .post-title',
      articleDescription: '.post-excerpt, .entry-summary',
      articleDate: '.post-date, time',
      articleImage: 'img'
    },
    baseUrl: 'https://www.balipost.com',
    maxArticles: 20,
    active: false // Set to true when ready to use
  },
  {
    name: 'The Bali Sun',
    url: 'https://thebalisun.com/',
    category: 'Bali',
    selectors: {
      articleList: 'article',
      articleLink: 'h2 a, h3 a',
      articleTitle: 'h2, h3',
      articleDescription: '.entry-content p:first-of-type',
      articleDate: '.entry-date',
      articleImage: '.wp-post-image'
    },
    baseUrl: 'https://thebalisun.com',
    maxArticles: 20,
    active: true  // Enabled - tested and working
  },
  {
    name: 'Coconuts Bali',
    url: 'https://coconuts.co/bali/',
    category: 'Bali',
    selectors: {
      articleList: '.post-item',
      articleLink: 'a',
      articleTitle: 'h3',
      articleDescription: '.excerpt',
      articleDate: '.date',
      articleImage: 'img'
    },
    baseUrl: 'https://coconuts.co',
    maxArticles: 20,
    active: false
  },
  {
    name: 'Bali Discovery',
    url: 'https://www.balidiscovery.com/news',
    category: 'Bali',
    selectors: {
      articleList: '.news-item, .article-item',
      articleLink: 'a',
      articleTitle: 'h3, .title',
      articleDescription: '.summary, .excerpt',
      articleDate: '.date',
      articleImage: 'img'
    },
    baseUrl: 'https://www.balidiscovery.com',
    maxArticles: 20,
    active: false
  },
  {
    name: 'NOW! Bali',
    url: 'https://nowbali.co.id/category/news/',
    category: 'Bali',
    selectors: {
      articleList: 'article',
      articleLink: 'h2 a',
      articleTitle: 'h2',
      articleDescription: '.entry-summary',
      articleDate: 'time',
      articleImage: '.post-thumbnail img'
    },
    baseUrl: 'https://nowbali.co.id',
    maxArticles: 20,
    active: true  // Enabled - tested and working
  },
  {
    name: 'Seminyak Times',
    url: 'https://www.seminyaktimes.com/',
    category: 'Bali',
    selectors: {
      articleList: '.post',
      articleLink: 'h2 a',
      articleTitle: 'h2',
      articleDescription: '.entry-summary',
      articleDate: '.published',
      articleImage: '.wp-post-image'
    },
    baseUrl: 'https://www.seminyaktimes.com',
    maxArticles: 15,
    active: false
  },
  // New geopolitical sources added
  {
    name: 'Bali Post (Main)',
    url: 'https://www.balipost.com/news/bali/',
    category: 'Bali',
    selectors: {
      articleList: 'article, .post-item, .news-item, .article-box',
      articleLink: 'a[href*="/news/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .post-title',
      articleDescription: '.excerpt, .summary, .post-excerpt, p:first-of-type',
      articleDate: '.date, .post-date, time, .published',
      articleImage: 'img:first-of-type, .featured-image img, .post-thumbnail img'
    },
    baseUrl: 'https://www.balipost.com',
    maxArticles: 20,
    active: true  // Enabled - works but may need more tuning
  },
  {
    name: 'Eurasia Review',
    url: 'https://www.eurasiareview.com/',
    category: 'BRICS',
    selectors: {
      articleList: '.first-post, .following-post .single-article',
      articleLink: 'h3 a, .entry-title a',
      articleTitle: 'h3.entry-title, .entry-title',
      articleDescription: '.entry-content p, .entry-summary',
      articleDate: '.posted-on a time, .entry-date',
      articleAuthor: '.byline a',
      articleImage: 'img:first-of-type'
    },
    baseUrl: 'https://www.eurasiareview.com',
    maxArticles: 25,
    active: false  // Needs more testing with updated selectors
  },
  {
    name: 'Katehon',
    url: 'https://katehon.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .news-item, .post-item, .article-preview',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .article-title',
      articleDescription: '.excerpt, .summary, .preview-text, p:first-of-type',
      articleDate: '.date, .publish-date, time',
      articleAuthor: '.author, .by',
      articleImage: 'img:first-of-type, .featured img, .thumb img'
    },
    baseUrl: 'https://katehon.com',
    maxArticles: 20,
    active: false
  },
  {
    name: 'The Geopolitics',
    url: 'https://thegeopolitics.com/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .article-card, .news-item',
      articleLink: 'h2 a, h3 a, .entry-title a, a[href*="/article/"]',
      articleTitle: 'h2, h3, .entry-title, .article-title',
      articleDescription: '.entry-summary, .excerpt, .article-excerpt, p:first-of-type',
      articleDate: '.entry-date, .date, time, .published',
      articleAuthor: '.author-name, .by-author, .author',
      articleImage: '.wp-post-image, .featured-image img, .post-thumbnail img'
    },
    baseUrl: 'https://thegeopolitics.com',
    maxArticles: 20,
    active: false
  },
  {
    name: 'Modern Diplomacy',
    url: 'https://moderndiplomacy.eu/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .td-module-container, .td_module_wrap',
      articleLink: 'h3 a, .entry-title a, .td-module-title a',
      articleTitle: 'h3, .entry-title, .td-module-title',
      articleDescription: '.td-excerpt, .entry-summary, .excerpt',
      articleDate: '.td-post-date, .entry-date, time',
      articleAuthor: '.td-post-author-name, .author',
      articleImage: '.td-module-thumb img, .entry-thumb img, img:first-of-type'
    },
    baseUrl: 'https://moderndiplomacy.eu',
    maxArticles: 25,
    active: true  // Enabled - 25 articles scraped successfully
  },
  {
    name: 'SIT Journal',
    url: 'https://sitjournal.com/',
    category: 'Indonesia',
    selectors: {
      articleList: '.article-item, .journal-article, .paper, article',
      articleLink: 'a[href*="/article/"], h3 a, .title a',
      articleTitle: 'h3, .title, .article-title',
      articleDescription: '.abstract, .summary, .excerpt, p:first-of-type',
      articleDate: '.published-date, .date, time',
      articleAuthor: '.authors, .author-name',
      articleImage: 'img:first-of-type'
    },
    baseUrl: 'https://sitjournal.com',
    maxArticles: 15,
    active: false
  },
  {
    name: 'Indonesia Business Post',
    url: 'https://indonesiabusinesspost.com/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .article-box',
      articleLink: 'h2 a, h3 a, .title a, a[href*="/news/"]',
      articleTitle: 'h2, h3, .title, .post-title',
      articleDescription: '.excerpt, .summary, .post-excerpt, p:first-of-type',
      articleDate: '.date, .post-date, time',
      articleAuthor: '.author, .by-author',
      articleImage: '.featured-image img, .post-thumbnail img, img:first-of-type'
    },
    baseUrl: 'https://indonesiabusinesspost.com',
    maxArticles: 20,
    active: true  // Enabled - 18 articles scraped successfully
  },
  {
    name: 'Geopolstratindo',
    url: 'https://geopolstratindo.com/',
    category: 'Indonesia',
    selectors: {
      articleList: 'article, .post, .news-item, .article-preview',
      articleLink: 'a[href*="/article/"], h2 a, h3 a, .title a',
      articleTitle: 'h2, h3, .title, .article-title',
      articleDescription: '.excerpt, .summary, .content-preview, p:first-of-type',
      articleDate: '.date, .publish-date, time',
      articleAuthor: '.author, .writer',
      articleImage: 'img:first-of-type, .featured img, .thumbnail img'
    },
    baseUrl: 'https://geopolstratindo.com',
    maxArticles: 15,
    active: false
  },
  {
    name: 'Journal NEO',
    url: 'https://journal-neo.su/',
    category: 'BRICS',
    selectors: {
      articleList: '.category-posts-container',
      articleLink: 'a',
      articleTitle: 'h3, .category-posts-title',
      articleDescription: '.category-posts-excerpt, p:first-of-type',
      articleDate: '.category-posts-date, time',
      articleAuthor: '.category-posts-author',
      articleImage: '.category-posts-thumbnail img'
    },
    baseUrl: 'https://journal-neo.su',
    maxArticles: 20,
    active: false  // Needs testing with new selectors
  },
  {
    name: 'John Helmer',
    url: 'https://johnhelmer.net/',
    category: 'BRICS',
    selectors: {
      articleList: 'article, .post, .entry',
      articleLink: 'h2 a, .entry-title a',
      articleTitle: 'h2, .entry-title',
      articleDescription: '.entry-content p:first-of-type, .excerpt',
      articleDate: '.entry-date, .published, time',
      articleAuthor: '.author, .by-author',
      articleImage: '.wp-post-image, img:first-of-type'
    },
    baseUrl: 'https://johnhelmer.net',
    maxArticles: 15,
    active: true  // Enabled - 8 articles scraped successfully
  }
];

class WebScraper {
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  /**
   * Scrape articles from a single source
   */
  async scrapeSource(config: ScraperConfig): Promise<Article[]> {
    if (!config.active) {
      console.log(`⏭️ Skipping inactive scraper: ${config.name}`);
      return [];
    }

    try {
      console.log(`🕷️ Scraping ${config.name}...`);
      
      // Fetch the webpage
      const response = await axios.get(config.url, {
        headers: this.headers,
        timeout: 15000,
        maxRedirects: 5,
      });

      // Parse HTML with Cheerio
      const $ = cheerio.load(response.data);
      const articles: Article[] = [];

      // Find all article containers
      const articleElements = $(config.selectors.articleList).slice(0, config.maxArticles || 20);

      articleElements.each((index, element) => {
        try {
          const $article = $(element);
          
          // Extract article link
          const linkElement = $article.find(config.selectors.articleLink).first();
          let link = linkElement.attr('href') || '';
          
          // Make relative URLs absolute
          if (link && !link.startsWith('http')) {
            link = new URL(link, config.baseUrl || config.url).toString();
          }

          // Extract title
          const title = $article.find(config.selectors.articleTitle).first().text().trim() || 
                       linkElement.text().trim() || 
                       'No title';

          // Extract description
          let description = '';
          if (config.selectors.articleDescription) {
            description = $article.find(config.selectors.articleDescription).first().text().trim();
          }
          
          // Clean up description
          description = this.cleanText(description).substring(0, 200);
          if (!description) {
            description = title; // Fallback to title if no description
          }

          // Extract date
          let pubDate = new Date().toISOString();
          if (config.selectors.articleDate) {
            const dateText = $article.find(config.selectors.articleDate).first().text().trim();
            const dateAttr = $article.find(config.selectors.articleDate).first().attr('datetime');
            
            if (dateAttr) {
              pubDate = new Date(dateAttr).toISOString();
            } else if (dateText) {
              const parsedDate = this.parseDate(dateText);
              if (parsedDate) {
                pubDate = parsedDate.toISOString();
              }
            }
          }

          // Extract author
          let author = undefined;
          if (config.selectors.articleAuthor) {
            author = $article.find(config.selectors.articleAuthor).first().text().trim();
          }

          // Extract image
          let imageUrl = undefined;
          if (config.selectors.articleImage) {
            const imgElement = $article.find(config.selectors.articleImage).first();
            imageUrl = imgElement.attr('src') || imgElement.attr('data-src');
            
            // Make relative image URLs absolute
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = new URL(imageUrl, config.baseUrl || config.url).toString();
            }
          }

          // Only add if we have at least a link and title
          if (link && title && title !== 'No title') {
            const article: Article = {
              id: `${config.name.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
              title: this.cleanText(title),
              link,
              description,
              pubDate,
              author,
              category: config.category,
              source: config.name,
              sourceUrl: config.url,
              imageUrl,
            };

            articles.push(article);
          }
        } catch (error) {
          console.error(`Failed to parse article ${index} from ${config.name}:`, error);
        }
      });

      console.log(`✅ Scraped ${articles.length} articles from ${config.name}`);
      return articles;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(`❌ HTTP ${error.response.status} from ${config.name}: ${error.response.statusText}`);
        } else if (error.request) {
          console.error(`❌ No response from ${config.name} - site may be down`);
        } else {
          console.error(`❌ Request setup error for ${config.name}:`, error.message);
        }
      } else {
        console.error(`❌ Failed to scrape ${config.name}:`, error);
      }
      return [];
    }
  }

  /**
   * Scrape all active sources
   */
  async scrapeAllSources(): Promise<Article[]> {
    const activeSources = SCRAPER_SOURCES.filter(source => source.active);
    
    if (activeSources.length === 0) {
      console.log('ℹ️ No active scraper sources configured');
      return [];
    }

    console.log(`🕷️ Scraping ${activeSources.length} websites...`);
    
    const promises = activeSources.map(source => this.scrapeSource(source));
    const results = await Promise.allSettled(promises);
    
    const allArticles: Article[] = [];
    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
        if (result.value.length > 0) {
          successCount++;
        }
      } else {
        failureCount++;
        console.error(`Failed to scrape ${activeSources[index].name}:`, result.reason);
      }
    });

    console.log(`📊 Scraping complete: ${successCount} succeeded, ${failureCount} failed, ${allArticles.length} total articles`);
    
    // Sort by publication date (newest first)
    return allArticles.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  /**
   * Scrape articles by category
   */
  async scrapeByCategory(category: 'BRICS' | 'Indonesia' | 'Bali'): Promise<Article[]> {
    const categorySources = SCRAPER_SOURCES.filter(
      source => source.category === category && source.active
    );
    
    if (categorySources.length === 0) {
      console.log(`ℹ️ No active scraper sources for category: ${category}`);
      return [];
    }

    const promises = categorySources.map(source => this.scrapeSource(source));
    const results = await Promise.allSettled(promises);
    
    const articles: Article[] = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      }
    });

    return articles.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\n+/g, ' ')           // Remove newlines
      .replace(/\t+/g, ' ')           // Remove tabs
      .replace(/[^\S\r\n]+/g, ' ')    // Remove extra spaces
      .trim();
  }

  /**
   * Parse various date formats
   */
  private parseDate(dateStr: string): Date | null {
    // Try to parse the date string
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try parsing relative dates like "2 hours ago", "yesterday"
    const lowerDate = dateStr.toLowerCase();
    const now = new Date();

    if (lowerDate.includes('ago')) {
      const match = lowerDate.match(/(\d+)\s*(minute|hour|day|week|month)s?\s*ago/);
      if (match) {
        const [, amount, unit] = match;
        const value = parseInt(amount);
        
        switch (unit) {
          case 'minute':
            now.setMinutes(now.getMinutes() - value);
            break;
          case 'hour':
            now.setHours(now.getHours() - value);
            break;
          case 'day':
            now.setDate(now.getDate() - value);
            break;
          case 'week':
            now.setDate(now.getDate() - (value * 7));
            break;
          case 'month':
            now.setMonth(now.getMonth() - value);
            break;
        }
        
        return now;
      }
    }

    if (lowerDate === 'today') {
      return now;
    }

    if (lowerDate === 'yesterday') {
      now.setDate(now.getDate() - 1);
      return now;
    }

    return null;
  }

  /**
   * Test a scraper configuration
   */
  async testScraper(sourceName: string): Promise<void> {
    const source = SCRAPER_SOURCES.find(s => s.name === sourceName);
    
    if (!source) {
      console.error(`❌ Scraper source not found: ${sourceName}`);
      return;
    }

    // Temporarily enable for testing
    const originalActive = source.active;
    source.active = true;

    console.log(`\n🧪 Testing scraper: ${sourceName}`);
    console.log(`📍 URL: ${source.url}`);
    console.log(`🏷️ Category: ${source.category}`);
    console.log(`🔍 Selectors:`, source.selectors);

    const articles = await this.scrapeSource(source);
    
    if (articles.length > 0) {
      console.log(`\n✅ Successfully scraped ${articles.length} articles!`);
      console.log('\n📰 Sample article:');
      console.log('  Title:', articles[0].title);
      console.log('  Link:', articles[0].link);
      console.log('  Description:', articles[0].description.substring(0, 100) + '...');
      console.log('  Date:', articles[0].pubDate);
      console.log('  Image:', articles[0].imageUrl || 'None');
    } else {
      console.log('\n❌ No articles scraped. Check selectors and site structure.');
    }

    // Restore original state
    source.active = originalActive;
  }
}

// Export singleton instance
export const webScraper = new WebScraper();

// Export class for custom instances
export { WebScraper };