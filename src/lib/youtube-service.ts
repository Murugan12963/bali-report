/**
 * YouTube API Service for Bali Reports Multimedia Section
 * 
 * Fetches content from curated YouTube channels for multipolar perspectives
 */

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  viewCount: string;
  likeCount?: string;
  channelTitle: string;
  channelId: string;
  videoUrl: string;
  embedUrl: string;
  category: 'podcasts' | 'videos' | 'analysis' | 'interviews';
  tags: string[];
}

export interface YouTubeChannel {
  channelId: string;
  name: string;
  category: 'podcasts' | 'videos' | 'analysis' | 'interviews';
  description: string;
  active: boolean;
}

/**
 * Curated YouTube Channels for Multipolar Content
 */
export const YOUTUBE_CHANNELS: YouTubeChannel[] = [
  // News Analysis Channels
  {
    channelId: 'UCJ6o36XL0CpYb6U5dNBiXHQ', // The New Atlas
    name: 'The New Atlas',
    category: 'analysis',
    description: 'Geopolitical analysis and current affairs',
    active: true
  },
  {
    channelId: 'UC1HmwNVE4udlOMFw4GHnhTQ', // The Grayzone
    name: 'The Grayzone',
    category: 'analysis',
    description: 'Independent journalism and analysis',
    active: true
  },
  {
    channelId: 'UCLwNagCGRzIfkIel_ClDhSg', // RT Documentary
    name: 'RT Documentary',
    category: 'videos',
    description: 'Documentary content from RT',
    active: true
  },
  {
    channelId: 'UCsT0YIqwnpJCM-mx7-gSA4Q', // TeleSUR English
    name: 'TeleSUR English',
    category: 'videos',
    description: 'Latin American perspective on global news',
    active: true
  },
  
  // Podcast Channels
  {
    channelId: 'UCuKbZh6hw4kcVBHp0ZNAQEg', // George Galloway
    name: 'George Galloway',
    category: 'podcasts',
    description: 'Political commentary and interviews',
    active: true
  },
  {
    channelId: 'UCEHsSWvrGdSWuypVnC9Hmbg', // Danny Haiphong
    name: 'Danny Haiphong',
    category: 'podcasts',
    description: 'Anti-imperialist analysis and interviews',
    active: true
  },
  
  // Interview/Talk Shows
  {
    channelId: 'UC0fLvdGn_9fCfVjzb3LDZYw', // Going Underground
    name: 'Going Underground',
    category: 'interviews',
    description: 'Interviews with global perspectives',
    active: true
  },
  {
    channelId: 'UCd6UBRkaoDLvSAjWJCQ9jvg', // Dialogue Works
    name: 'Dialogue Works',
    category: 'interviews',
    description: 'In-depth political discussions',
    active: true
  }
];

class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('⚠️ YouTube API key not found. Set YOUTUBE_API_KEY or NEXT_PUBLIC_YOUTUBE_API_KEY environment variable.');
    }
  }

  /**
   * Format duration from ISO 8601 to readable format
   */
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'N/A';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format view count to readable number
   */
  private formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  }

  /**
   * Get videos from a specific channel
   */
  async getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      // First, get the channel's uploads playlist
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=contentDetails&id=${channelId}&key=${this.apiKey}`
      );

      if (!channelResponse.ok) {
        throw new Error(`Failed to fetch channel info: ${channelResponse.status}`);
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error('No uploads playlist found for channel');
      }

      // Get videos from uploads playlist
      const playlistResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&order=date&key=${this.apiKey}`
      );

      if (!playlistResponse.ok) {
        throw new Error(`Failed to fetch playlist items: ${playlistResponse.status}`);
      }

      const playlistData = await playlistResponse.json();
      const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      // Get detailed video information
      const videosResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error(`Failed to fetch video details: ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();
      
      // Find channel info for categorization
      const channel = YOUTUBE_CHANNELS.find(ch => ch.channelId === channelId);

      return videosData.items.map((video: any): YouTubeVideo => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        publishedAt: video.snippet.publishedAt,
        duration: this.formatDuration(video.contentDetails.duration),
        viewCount: this.formatViewCount(video.statistics.viewCount),
        likeCount: video.statistics.likeCount ? this.formatViewCount(video.statistics.likeCount) : undefined,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        category: channel?.category || 'videos',
        tags: video.snippet.tags || []
      }));

    } catch (error) {
      console.error(`Error fetching videos from channel ${channelId}:`, error);
      return [];
    }
  }

  /**
   * Get videos from all active channels
   */
  async getAllVideos(maxPerChannel: number = 5): Promise<YouTubeVideo[]> {
    const activeChannels = YOUTUBE_CHANNELS.filter(channel => channel.active);
    const allVideos: YouTubeVideo[] = [];

    console.log(`📺 Fetching videos from ${activeChannels.length} YouTube channels...`);

    for (const channel of activeChannels) {
      try {
        console.log(`🎬 Fetching from ${channel.name}...`);
        const videos = await this.getChannelVideos(channel.channelId, maxPerChannel);
        allVideos.push(...videos);
        console.log(`✅ ${channel.name}: ${videos.length} videos`);
        
        // Add small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to fetch from ${channel.name}:`, error);
      }
    }

    // Sort by published date (newest first)
    allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    console.log(`🎥 Total videos fetched: ${allVideos.length}`);
    return allVideos;
  }

  /**
   * Search videos across channels
   */
  async searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new Error('YouTube API key not configured');
    }

    try {
      const channelIds = YOUTUBE_CHANNELS.filter(ch => ch.active).map(ch => ch.channelId).join(',');
      
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&channelId=${channelIds}&maxResults=${maxResults}&order=relevance&type=video&key=${this.apiKey}`
      );

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      if (!videoIds) return [];

      // Get detailed video information
      const videosResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      const videosData = await videosResponse.json();

      return videosData.items.map((video: any): YouTubeVideo => {
        const channel = YOUTUBE_CHANNELS.find(ch => ch.channelId === video.snippet.channelId);
        return {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
          publishedAt: video.snippet.publishedAt,
          duration: this.formatDuration(video.contentDetails.duration),
          viewCount: this.formatViewCount(video.statistics.viewCount),
          likeCount: video.statistics.likeCount ? this.formatViewCount(video.statistics.likeCount) : undefined,
          channelTitle: video.snippet.channelTitle,
          channelId: video.snippet.channelId,
          videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
          embedUrl: `https://www.youtube.com/embed/${video.id}`,
          category: channel?.category || 'videos',
          tags: video.snippet.tags || []
        };
      });

    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  /**
   * Get videos by category
   */
  async getVideosByCategory(category: 'podcasts' | 'videos' | 'analysis' | 'interviews', maxResults: number = 20): Promise<YouTubeVideo[]> {
    const channelsInCategory = YOUTUBE_CHANNELS.filter(ch => ch.active && ch.category === category);
    const allVideos: YouTubeVideo[] = [];

    for (const channel of channelsInCategory) {
      try {
        const videos = await this.getChannelVideos(channel.channelId, Math.ceil(maxResults / channelsInCategory.length));
        allVideos.push(...videos);
      } catch (error) {
        console.error(`Error fetching ${category} videos from ${channel.name}:`, error);
      }
    }

    // Sort and limit results
    return allVideos
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, maxResults);
  }
}

// Export singleton instance
export const youTubeService = new YouTubeService();
export default youTubeService;