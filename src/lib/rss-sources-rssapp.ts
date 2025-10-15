/**
 * RSS.app-only News Sources Configuration for Bali Report
 * 
 * This configuration replaces the complex RSS + web scraping system
 * with reliable RSS.app generated feeds only.
 */

export interface NewsSource {
  name: string;
  url: string;
  category: 'BRICS' | 'Indonesia' | 'Bali' | 'AFRICA' | 'EURASIA' | 'SOUTH_AMERICA';
  active: boolean;
  rssAppId?: string; // RSS.app feed identifier
  description?: string;
}

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

/**
 * RSS.app Generated Feeds Configuration
 * 
 * These feeds are generated and managed by RSS.app for maximum reliability.
 * Each feed aggregates multiple sources or provides enhanced content from single sources.
 */
export const RSS_APP_SOURCES: NewsSource[] = [
  // BRICS Global News Feeds (RSS.app generated)
  {
    name: 'BRICS Global News',
    url: 'https://rss.app/feeds/v1.1/_example_brics_global.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_global',
    description: 'Aggregated BRICS news from RT, TASS, Xinhua, CGTN, Sputnik, Press TV'
  },
  {
    name: 'BRICS India Perspective',
    url: 'https://rss.app/feeds/v1.1/_example_brics_india.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_india',
    description: 'Indian perspective on global affairs from NDTV, Times of India, etc.'
  },
  {
    name: 'BRICS China Focus',
    url: 'https://rss.app/feeds/v1.1/_example_brics_china.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_china',
    description: 'Chinese perspective from CGTN, China Daily, Global Times, SCMP'
  },
  {
    name: 'BRICS Russia Coverage',
    url: 'https://rss.app/feeds/v1.1/_example_brics_russia.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_russia',
    description: 'Russian perspective from RT, TASS, Sputnik Global'
  },
  {
    name: 'BRICS Middle East',
    url: 'https://rss.app/feeds/v1.1/_example_brics_mideast.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_mideast',
    description: 'Middle Eastern perspective from Al Jazeera, Press TV'
  },

  // Indonesia News Feeds (RSS.app generated)
  {
    name: 'Indonesia National News',
    url: 'https://rss.app/feeds/v1.1/_example_indonesia_national.xml', // Replace with actual RSS.app URL
    category: 'Indonesia',
    active: true,
    rssAppId: 'indonesia_national',
    description: 'Indonesian national news from Antara, Jakarta Post, Jakarta Globe, Tempo'
  },
  {
    name: 'Indonesia Business & Economy',
    url: 'https://rss.app/feeds/v1.1/_example_indonesia_business.xml', // Replace with actual RSS.app URL
    category: 'Indonesia',
    active: true,
    rssAppId: 'indonesia_business',
    description: 'Indonesian business news from Indonesia Business Post, Detik Finance'
  },
  {
    name: 'Southeast Asia Regional',
    url: 'https://rss.app/feeds/v1.1/_example_sea_regional.xml', // Replace with actual RSS.app URL
    category: 'Indonesia',
    active: true,
    rssAppId: 'sea_regional',
    description: 'Southeast Asian regional news including Indonesia coverage'
  },

  // Bali Specific News Feeds (RSS.app generated)
  {
    name: 'Bali Tourism & Events',
    url: 'https://rss.app/feeds/v1.1/_example_bali_tourism.xml', // Replace with actual RSS.app URL
    category: 'Bali',
    active: true,
    rssAppId: 'bali_tourism',
    description: 'Bali tourism, events, and local news from Bali Post, Bali Discovery'
  },
  {
    name: 'Bali Local News',
    url: 'https://rss.app/feeds/v1.1/_example_bali_local.xml', // Replace with actual RSS.app URL
    category: 'Bali',
    active: true,
    rssAppId: 'bali_local',
    description: 'Local Bali news, politics, and community updates'
  },

  // Regional News Feeds (RSS.app generated)
  {
    name: 'Africa Regional News',
    url: 'https://rss.app/feeds/v1.1/_example_africa.xml', // Replace with actual RSS.app URL
    category: 'AFRICA',
    active: true,
    rssAppId: 'africa_regional',
    description: 'African continental news and South Africa BRICS perspective'
  },
  {
    name: 'Eurasia Regional News',
    url: 'https://rss.app/feeds/v1.1/_example_eurasia.xml', // Replace with actual RSS.app URL
    category: 'EURASIA',
    active: true,
    rssAppId: 'eurasia_regional',
    description: 'Eurasian news focusing on Russia and Central Asian BRICS partners'
  },
  {
    name: 'South America Regional News',
    url: 'https://rss.app/feeds/v1.1/_example_south_america.xml', // Replace with actual RSS.app URL
    category: 'SOUTH_AMERICA',
    active: true,
    rssAppId: 'south_america_regional',
    description: 'South American news with focus on Brazil BRICS perspective'
  },

  // Geopolitical Analysis Feeds (RSS.app generated)
  {
    name: 'Global Geopolitics Analysis',
    url: 'https://rss.app/feeds/v1.1/_example_geopolitics.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'geopolitics',
    description: 'Geopolitical analysis from The Diplomat, UN News, Foreign Affairs'
  },
  {
    name: 'BRICS Organizations Official',
    url: 'https://rss.app/feeds/v1.1/_example_brics_orgs.xml', // Replace with actual RSS.app URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_orgs',
    description: 'Official BRICS organization news and updates'
  }
];

/**
 * RSS.app Feed Categories for organized content management
 */
export const RSS_APP_CATEGORIES = {
  BRICS: RSS_APP_SOURCES.filter(source => source.category === 'BRICS'),
  Indonesia: RSS_APP_SOURCES.filter(source => source.category === 'Indonesia'),
  Bali: RSS_APP_SOURCES.filter(source => source.category === 'Bali')
};

/**
 * RSS.app Configuration Settings
 */
export const RSS_APP_CONFIG = {
  // Base URL for RSS.app feeds
  baseUrl: 'https://rss.app/feeds/v1.1/',
  
  // Update frequency (RSS.app handles caching)
  updateFrequency: '1 hour',
  
  // Feed format preferences
  format: 'rss2.0',
  
  // Content filters
  filters: {
    minContentLength: 100,
    excludeKeywords: ['advertisement', 'sponsored', 'casino', 'gambling'],
    requireKeywords: [] // Can add required keywords per category
  },
  
  // RSS.app specific settings
  settings: {
    maxArticlesPerFeed: 50,
    includeThumbnails: true,
    includeFullContent: true,
    deduplication: true,
    contentModeration: true
  }
};

/**
 * Helper function to get RSS.app feed URL by ID
 */
export function getRssAppFeedUrl(feedId: string): string {
  const source = RSS_APP_SOURCES.find(s => s.rssAppId === feedId);
  return source?.url || '';
}

/**
 * Helper function to get all active RSS.app sources
 */
export function getActiveRssAppSources(): NewsSource[] {
  return RSS_APP_SOURCES.filter(source => source.active);
}

/**
 * Helper function to get sources by category
 */
export function getRssAppSourcesByCategory(category: 'BRICS' | 'Indonesia' | 'Bali' | 'AFRICA' | 'EURASIA' | 'SOUTH_AMERICA'): NewsSource[] {
  return RSS_APP_SOURCES.filter(source => source.category === category && source.active);
}

export default RSS_APP_SOURCES;