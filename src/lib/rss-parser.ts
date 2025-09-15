import Parser from 'rss-parser';
import axios from 'axios';

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
  {
    name: 'Global Times',
    url: 'https://www.globaltimes.cn/rss/china.xml',
    category: 'BRICS',
    active: true,
  },
  // Indonesia/Bali sources - using working alternatives
  {
    name: 'Antara News',
    url: 'https://en.antaranews.com/rss/latest.xml',
    category: 'Indonesia',
    active: true,
  },
  {
    name: 'Jakarta Globe',
    url: 'https://jakartaglobe.id/feed',
    category: 'Indonesia',
    active: true,
  },
  // Backup BRICS source
  {
    name: 'TASS',
    url: 'https://tass.com/rss/v2.xml',
    category: 'BRICS',
    active: false, // Keep as backup for now
  },
  // Disabled sources that need fixing
  {
    name: 'Sputnik Globe',
    url: 'https://sputnikglobe.com/rss/',
    category: 'BRICS',
    active: false, // Disabled due to parsing issues
  },
  {
    name: 'Jakarta Post',
    url: 'https://www.thejakartapost.com/rss',
    category: 'Indonesia',
    active: false, // Disabled due to 404 error
  },
  {
    name: 'Bali Post',
    url: 'https://www.balipost.com/rss',
    category: 'Bali',
    active: false, // Disabled due to server error
  },
];

class RSSAggregator {
  private parser: Parser;
  private sources: NewsSource[];

  constructor(sources: NewsSource[] = NEWS_SOURCES) {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'Bali-Report/1.0 (+https://bali.report)',
      },
    });
    this.sources = sources;
  }

  /**
   * Fetch and parse RSS feed from a single source.
   * 
   * Args:
   *   source (NewsSource): The news source configuration.
   * 
   * Returns:
   *   Promise<Article[]>: Array of parsed articles.
   */
  async fetchFromSource(source: NewsSource): Promise<Article[]> {
    try {
      console.log(`Fetching RSS from ${source.name}...`);
      
      const feed = await this.parser.parseURL(source.url);
      
      const articles: Article[] = feed.items.map((item, index) => ({
        id: `${source.name.toLowerCase().replace(/\\s+/g, '-')}-${index}-${Date.now()}`,
        title: item.title || 'No title',
        link: item.link || '',
        description: this.extractDescription(item.contentSnippet || item.description || ''),
        pubDate: item.pubDate || new Date().toISOString(),
        author: item.creator || item.author,
        category: source.category,
        source: source.name,
        sourceUrl: source.url,
        imageUrl: this.extractImageUrl(item),
      }));

      console.log(`Successfully fetched ${articles.length} articles from ${source.name}`);
      return articles;
    } catch (error) {
      console.error(`Error fetching from ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Fetch articles from all active sources.
   * 
   * Returns:
   *   Promise<Article[]>: Combined array of articles from all sources.
   */
  async fetchAllSources(): Promise<Article[]> {
    const activeSources = this.sources.filter(source => source.active);
    const promises = activeSources.map(source => this.fetchFromSource(source));
    
    try {
      const results = await Promise.allSettled(promises);
      const articles: Article[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          articles.push(...result.value);
        } else {
          console.error(`Failed to fetch from ${activeSources[index].name}:`, result.reason);
        }
      });
      
      // Sort articles by publication date (newest first)
      return articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    } catch (error) {
      console.error('Error fetching from multiple sources:', error);
      return [];
    }
  }

  /**
   * Fetch articles from sources by category.
   * 
   * Args:
   *   category (string): The category to filter by.
   * 
   * Returns:
   *   Promise<Article[]>: Articles from the specified category.
   */
  async fetchByCategory(category: 'BRICS' | 'Indonesia' | 'Bali'): Promise<Article[]> {
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
          console.error(`Failed to fetch from ${categorySource[index].name}:`, result.reason);
        }
      });
      
      return articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    } catch (error) {
      console.error(`Error fetching ${category} sources:`, error);
      return [];
    }
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
    // Try multiple possible image fields
    if (item.enclosure?.url && item.enclosure?.type?.startsWith('image/')) {
      return item.enclosure.url;
    }
    
    if (item['media:thumbnail']?.['@_url']) {
      return item['media:thumbnail']['@_url'];
    }
    
    if (item['media:content']?.['@_url'] && item['media:content']?.['@_type']?.startsWith('image/')) {
      return item['media:content']['@_url'];
    }
    
    // Try to extract from description/content
    const content = item.content || item.description || '';
    const imgMatch = content.match(/<img[^>]+src="([^"]+)"/);
    if (imgMatch) {
      return imgMatch[1];
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