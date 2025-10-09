/**
 * Video Crawler Service for Bali Report
 * Fetches video content from various platforms (Rumble, YouTube, etc.)
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { VideoContent } from './video-service';

export interface VideoSourceConfig {
  name: string;
  platform: 'rumble' | 'youtube' | 'vimeo' | 'direct';
  category: 'BRICS' | 'Indonesia' | 'Bali';
  rssUrl?: string;          // RSS feed URL for the channel/user
  channelUrl?: string;      // Channel page URL (for scraping)
  maxVideos?: number;       // Max videos to fetch
  active: boolean;
}

/**
 * Video source configurations for crawling
 */
export const VIDEO_SOURCES: VideoSourceConfig[] = [
  // Rumble BRICS Sources
  {
    name: 'RT News on Rumble',
    platform: 'rumble',
    category: 'BRICS',
    rssUrl: 'https://rumble.com/c/RT/rss',
    channelUrl: 'https://rumble.com/c/RT',
    maxVideos: 20,
    active: true
  },
  {
    name: 'CGTN on Rumble',
    platform: 'rumble',
    category: 'BRICS',
    rssUrl: 'https://rumble.com/c/CGTN/rss',
    channelUrl: 'https://rumble.com/c/CGTN',
    maxVideos: 20,
    active: true
  },
  {
    name: 'Press TV on Rumble',
    platform: 'rumble',
    category: 'BRICS',
    rssUrl: 'https://rumble.com/c/PressTV/rss',
    channelUrl: 'https://rumble.com/c/PressTV',
    maxVideos: 20,
    active: true
  },
  {
    name: 'Geopolitical Economy Report',
    platform: 'rumble',
    category: 'BRICS',
    rssUrl: 'https://rumble.com/c/GeopoliticalEconomyReport/rss',
    channelUrl: 'https://rumble.com/c/GeopoliticalEconomyReport',
    maxVideos: 15,
    active: true
  },
  {
    name: 'Redacted News',
    platform: 'rumble',
    category: 'BRICS',
    rssUrl: 'https://rumble.com/c/Redacted/rss',
    channelUrl: 'https://rumble.com/c/Redacted',
    maxVideos: 15,
    active: true
  },
  {
    name: 'The Duran',
    platform: 'rumble',
    category: 'BRICS',
    rssUrl: 'https://rumble.com/c/theduran/rss',
    channelUrl: 'https://rumble.com/c/theduran',
    maxVideos: 15,
    active: true
  },
  // Indonesian/Bali sources can be added when available on Rumble
  {
    name: 'Indonesia Today Rumble',
    platform: 'rumble',
    category: 'Indonesia',
    channelUrl: 'https://rumble.com/c/IndonesiaToday',
    rssUrl: 'https://rumble.com/c/IndonesiaToday/rss',
    maxVideos: 15,
    active: false // Set to true when channel is confirmed
  }
];

/**
 * Video Crawler class for fetching videos from multiple platforms
 */
export class VideoCrawler {
  private userAgent: string;

  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Fetch videos from a Rumble source via server-side API (avoids CORS)
   */
  async fetchRumbleRSS(config: VideoSourceConfig): Promise<VideoContent[]> {
    try {
      console.log(`📹 Fetching Rumble RSS: ${config.name}`);
      
      // Map source name to API endpoint key
      const sourceKeyMap: Record<string, string> = {
        'RT News on Rumble': 'rt-news',
        'CGTN on Rumble': 'cgtn',
        'Press TV on Rumble': 'press-tv',
        'Geopolitical Economy Report': 'geopolitical-economy',
        'Redacted News': 'redacted-news',
        'The Duran': 'the-duran'
      };
      
      const sourceKey = sourceKeyMap[config.name];
      if (!sourceKey) {
        console.warn(`No API key mapping for ${config.name}`);
        return this.getMockVideos(config.name, 'unknown');
      }

      // Use our server-side API to avoid CORS issues
      const apiUrl = `/api/videos?source=${sourceKey}&type=rss`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.videos && data.videos.length > 0) {
        console.log(`✅ Fetched ${data.videos.length} videos from ${config.name}`);
        return data.videos;
      } else {
        console.warn(`⚠️ No videos fetched from API for ${config.name}, using mock data`);
        return this.getMockVideos(config.name, sourceKey);
      }

    } catch (error: any) {
      console.error(`❌ Failed to fetch videos for ${config.name}:`, error.message);
      
      // Return mock data as fallback
      const sourceKey = config.name.toLowerCase().replace(/\s+/g, '-');
      return this.getMockVideos(config.name, sourceKey);
    }
  }

  /**
   * Scrape videos from a Rumble channel page (fallback method)
   */
  async scrapeRumbleChannel(config: VideoSourceConfig): Promise<VideoContent[]> {
    if (!config.channelUrl) {
      return [];
    }

    try {
      console.log(`🕷️ Scraping Rumble channel: ${config.name}`);
      
      const response = await axios.get(config.channelUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const videos: VideoContent[] = [];

      // Rumble uses specific HTML structure for video listings
      $('.video-item, .video-listing-entry, article.video-item').each((index, element) => {
        if (config.maxVideos && index >= config.maxVideos) {
          return false;
        }

        const $video = $(element);
        
        const title = $video.find('h3, .video-item--title, .video-item__title').text().trim();
        const link = $video.find('a').first().attr('href') || '';
        const fullLink = link.startsWith('http') ? link : `https://rumble.com${link}`;
        const thumbnailUrl = $video.find('img').first().attr('src') || '';
        const description = $video.find('.video-item--description, .video-item__description').text().trim();

        // Extract video ID from link
        const videoIdMatch = fullLink.match(/rumble\.com\/([a-zA-Z0-9]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : '';
        const embedUrl = videoId ? `https://rumble.com/embed/${videoId}/` : fullLink;

        if (title && fullLink) {
          videos.push({
            id: `rumble-${config.name.toLowerCase().replace(/\s+/g, '-')}-${videoId || index}`,
            title: this.cleanText(title),
            description: this.cleanText(description) || title,
            embedUrl,
            thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
            source: config.name,
            sourceUrl: fullLink,
            category: config.category,
            duration: 'N/A',
            publishDate: new Date().toISOString(),
            tags: this.extractTags(title, description),
            videoType: 'rumble'
          });
        }
      });

      console.log(`✅ Scraped ${videos.length} videos from ${config.name}`);
      return videos;

    } catch (error: any) {
      console.error(`❌ Failed to scrape Rumble channel ${config.name}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch videos from all active sources
   */
  async fetchAllVideos(): Promise<VideoContent[]> {
    const activeSources = VIDEO_SOURCES.filter(source => source.active);
    
    if (activeSources.length === 0) {
      console.log('ℹ️ No active video sources configured');
      return [];
    }

    console.log(`📹 Fetching videos from ${activeSources.length} sources...`);

    const promises = activeSources.map(async (source) => {
      if (source.platform === 'rumble') {
        return await this.fetchRumbleRSS(source);
      }
      // Add support for other platforms here (YouTube, Vimeo, etc.)
      return [];
    });

    const results = await Promise.allSettled(promises);
    
    const allVideos: VideoContent[] = [];
    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allVideos.push(...result.value);
        if (result.value.length > 0) {
          successCount++;
        }
      } else {
        failureCount++;
        console.error(`Failed to fetch videos from ${activeSources[index].name}:`, result.reason);
      }
    });

    console.log(`📊 Video crawling complete: ${successCount} succeeded, ${failureCount} failed, ${allVideos.length} total videos`);

    // Sort by publication date (newest first)
    return allVideos.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  /**
   * Fetch videos by category
   */
  async fetchVideosByCategory(category: 'BRICS' | 'Indonesia' | 'Bali'): Promise<VideoContent[]> {
    const categorySources = VIDEO_SOURCES.filter(
      source => source.category === category && source.active
    );

    if (categorySources.length === 0) {
      console.log(`ℹ️ No active video sources for category: ${category}`);
      return [];
    }

    const promises = categorySources.map(async (source) => {
      if (source.platform === 'rumble') {
        return await this.fetchRumbleRSS(source);
      }
      return [];
    });

    const results = await Promise.allSettled(promises);
    
    const videos: VideoContent[] = [];
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        videos.push(...result.value);
      }
    });

    return videos.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .replace(/\t+/g, ' ')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }

  /**
   * Extract relevant tags from title and description
   */
  private extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const tags: string[] = [];

    // BRICS keywords
    const bricsKeywords = ['brics', 'russia', 'china', 'india', 'brazil', 'south africa', 'multipolar', 'global south'];
    // Indonesia keywords
    const indonesiaKeywords = ['indonesia', 'jakarta', 'bali', 'java', 'sumatra'];
    // Topic keywords
    const topicKeywords = ['economy', 'trade', 'politics', 'energy', 'technology', 'cooperation', 'summit', 'partnership'];

    [...bricsKeywords, ...indonesiaKeywords, ...topicKeywords].forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)]; // Remove duplicates
  }

  /**
   * Generate mock videos as fallback when real data is unavailable
   */
  private getMockVideos(sourceName: string, sourceKey: string): VideoContent[] {
    return [
      {
        id: `mock-${sourceKey}-1`,
        title: `Latest Analysis from ${sourceName}`,
        description: 'Latest geopolitical analysis and news coverage from multipolar perspectives',
        embedUrl: 'https://rumble.com/embed/mock1/',
        thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
        source: sourceName,
        sourceUrl: 'https://rumble.com/mock1',
        category: 'BRICS' as const,
        duration: '15:30',
        publishDate: new Date().toISOString(),
        tags: ['geopolitics', 'analysis', 'multipolar'],
        videoType: 'rumble'
      },
      {
        id: `mock-${sourceKey}-2`,
        title: `Breaking News - ${sourceName}`,
        description: 'Breaking news and current events from alternative media perspectives',
        embedUrl: 'https://rumble.com/embed/mock2/',
        thumbnailUrl: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800',
        source: sourceName,
        sourceUrl: 'https://rumble.com/mock2',
        category: 'BRICS' as const,
        duration: '22:15',
        publishDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tags: ['news', 'current-events', 'brics'],
        videoType: 'rumble'
      }
    ];
  }
}

export default VideoCrawler;
