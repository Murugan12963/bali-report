/**
 * Video Service for Bali Report
 * Handles video content aggregation and management from RSS sources
 */

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  thumbnailUrl: string;
  source: string;
  sourceUrl: string;
  category: 'BRICS' | 'Indonesia' | 'Bali';
  duration: string;
  publishDate: string;
  views?: number;
  tags: string[];
  videoType: 'youtube' | 'vimeo' | 'direct' | 'rt' | 'cgtn' | 'press_tv' | 'rumble';
}

export interface VideoCollection {
  title: string;
  description: string;
  videos: VideoContent[];
  category: 'BRICS' | 'Indonesia' | 'Bali';
}

/**
 * Mock video data representing content from our RSS sources
 * In production, this would be populated from actual RSS feeds with video content
 */
export const MOCK_VIDEOS: VideoContent[] = [
  // RT News Videos
  {
    id: 'rt-1',
    title: 'BRICS Summit 2024: Key Outcomes and Future Cooperation',
    description: 'Comprehensive coverage of the BRICS Summit discussing economic cooperation, trade partnerships, and multipolar world order initiatives.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=800',
    source: 'RT News',
    sourceUrl: 'https://www.rt.com',
    category: 'BRICS',
    duration: '12:45',
    publishDate: '2024-10-06T10:00:00Z',
    views: 125000,
    tags: ['BRICS', 'summit', 'cooperation', 'economy', 'russia'],
    videoType: 'youtube'
  },
  {
    id: 'rt-2',
    title: 'Russia-China Partnership: New Silk Road Economic Impacts',
    description: 'Analysis of the Belt and Road Initiative and its role in strengthening BRICS economic integration.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    source: 'RT News',
    sourceUrl: 'https://www.rt.com',
    category: 'BRICS',
    duration: '15:30',
    publishDate: '2024-10-05T14:20:00Z',
    views: 89000,
    tags: ['russia', 'china', 'belt-road', 'trade', 'partnership'],
    videoType: 'youtube'
  },
  
  // CGTN Videos
  {
    id: 'cgtn-1',
    title: 'Global South Unity: BRICS Expansion and New Members',
    description: 'Exploring the recent expansion of BRICS and what it means for Global South cooperation and development.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    source: 'CGTN News',
    sourceUrl: 'https://www.cgtn.com',
    category: 'BRICS',
    duration: '18:15',
    publishDate: '2024-10-04T16:45:00Z',
    views: 156000,
    tags: ['global-south', 'brics', 'expansion', 'cooperation', 'development'],
    videoType: 'youtube'
  },
  {
    id: 'cgtn-2',
    title: 'China-Indonesia Strategic Partnership: Infrastructure Development',
    description: 'Documentary on major infrastructure projects strengthening ties between China and Indonesia.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    source: 'CGTN News',
    sourceUrl: 'https://www.cgtn.com',
    category: 'Indonesia',
    duration: '22:10',
    publishDate: '2024-10-03T11:30:00Z',
    views: 78000,
    tags: ['china', 'indonesia', 'infrastructure', 'development', 'partnership'],
    videoType: 'youtube'
  },

  // TV BRICS Content
  {
    id: 'tvbrics-1',
    title: 'BRICS Media Cooperation: Breaking Western Media Monopoly',
    description: 'Discussion on how BRICS media outlets collaborate to provide alternative perspectives on global events.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586339949216-35cc36baaaa8?w=800',
    source: 'TV BRICS',
    sourceUrl: 'https://tvbrics.com',
    category: 'BRICS',
    duration: '25:40',
    publishDate: '2024-10-02T09:15:00Z',
    views: 92000,
    tags: ['media', 'cooperation', 'journalism', 'alternative', 'multipolar'],
    videoType: 'youtube'
  },

  // Press TV Content
  {
    id: 'presstv-1',
    title: 'Iran-Indonesia Energy Cooperation: Oil and Gas Partnerships',
    description: 'Analysis of energy cooperation between Iran and Indonesia within the broader BRICS framework.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
    source: 'Press TV',
    sourceUrl: 'https://www.presstv.ir',
    category: 'BRICS',
    duration: '16:20',
    publishDate: '2024-10-01T13:45:00Z',
    views: 67000,
    tags: ['iran', 'indonesia', 'energy', 'oil', 'gas', 'cooperation'],
    videoType: 'youtube'
  },

  // Indonesian Content
  {
    id: 'indonesia-1',
    title: 'Jakarta-Bandung High-Speed Railway: Game Changer for Indonesia',
    description: 'Documentary on Indonesia\'s first high-speed railway built with Chinese technology and investment.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    source: 'Jakarta Globe',
    sourceUrl: 'https://jakartaglobe.id',
    category: 'Indonesia',
    duration: '14:30',
    publishDate: '2024-09-30T08:20:00Z',
    views: 145000,
    tags: ['jakarta', 'bandung', 'railway', 'infrastructure', 'transport'],
    videoType: 'youtube'
  },
  {
    id: 'indonesia-2',
    title: 'Indonesian Palm Oil Industry: Sustainable Development Goals',
    description: 'Exploring how Indonesia is balancing palm oil production with environmental sustainability.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?w=800',
    source: 'Tempo News',
    sourceUrl: 'https://www.tempo.co',
    category: 'Indonesia',
    duration: '19:45',
    publishDate: '2024-09-29T15:10:00Z',
    views: 58000,
    tags: ['palm-oil', 'sustainability', 'environment', 'agriculture', 'economy'],
    videoType: 'youtube'
  },

  // Bali Content
  {
    id: 'bali-1',
    title: 'G20 Bali Legacy: Tourism Recovery and Sustainable Development',
    description: 'How the G20 summit in Bali has impacted tourism recovery and sustainable development initiatives.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
    source: 'Bali Post',
    sourceUrl: 'https://www.balipost.com',
    category: 'Bali',
    duration: '13:25',
    publishDate: '2024-09-28T12:00:00Z',
    views: 73000,
    tags: ['g20', 'bali', 'tourism', 'recovery', 'sustainability'],
    videoType: 'youtube'
  },
  {
    id: 'bali-2',
    title: 'Bali Cultural Preservation in Modern Indonesia',
    description: 'Documentary on how Balinese culture is being preserved while embracing modern development.',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800',
    source: 'Bali Discovery',
    sourceUrl: 'https://balidiscovery.com',
    category: 'Bali',
    duration: '20:15',
    publishDate: '2024-09-27T10:30:00Z',
    views: 41000,
    tags: ['bali', 'culture', 'preservation', 'tradition', 'modern'],
    videoType: 'youtube'
  }
];

/**
 * Video collections organized by theme
 */
export const VIDEO_COLLECTIONS: VideoCollection[] = [
  {
    title: 'BRICS Cooperation & Partnership',
    description: 'Videos exploring BRICS cooperation, summits, and multilateral partnerships',
    category: 'BRICS',
    videos: MOCK_VIDEOS.filter(video => video.category === 'BRICS').slice(0, 4)
  },
  {
    title: 'Indonesia Development Stories',
    description: 'Infrastructure, economy, and development initiatives in Indonesia',
    category: 'Indonesia', 
    videos: MOCK_VIDEOS.filter(video => video.category === 'Indonesia')
  },
  {
    title: 'Bali: Culture & Sustainability',
    description: 'Balinese culture, tourism, and sustainable development initiatives',
    category: 'Bali',
    videos: MOCK_VIDEOS.filter(video => video.category === 'Bali')
  }
];

/**
 * Video service class for managing video content
 */
export class VideoService {
  /**
   * Get all videos
   */
  static getAllVideos(): VideoContent[] {
    return MOCK_VIDEOS.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  /**
   * Get videos by category
   */
  static getVideosByCategory(category: 'BRICS' | 'Indonesia' | 'Bali'): VideoContent[] {
    return MOCK_VIDEOS
      .filter(video => video.category === category)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  /**
   * Get featured videos (most viewed)
   */
  static getFeaturedVideos(limit: number = 6): VideoContent[] {
    return MOCK_VIDEOS
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  /**
   * Search videos by title and description
   */
  static searchVideos(query: string): VideoContent[] {
    const searchTerm = query.toLowerCase();
    return MOCK_VIDEOS.filter(video => 
      video.title.toLowerCase().includes(searchTerm) ||
      video.description.toLowerCase().includes(searchTerm) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get videos by source
   */
  static getVideosBySource(source: string): VideoContent[] {
    return MOCK_VIDEOS
      .filter(video => video.source.toLowerCase().includes(source.toLowerCase()))
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  }

  /**
   * Get video statistics
   */
  static getVideoStats() {
    const totalVideos = MOCK_VIDEOS.length;
    const totalViews = MOCK_VIDEOS.reduce((sum, video) => sum + (video.views || 0), 0);
    const categoryCounts = MOCK_VIDEOS.reduce((counts, video) => {
      counts[video.category] = (counts[video.category] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const sourceCounts = MOCK_VIDEOS.reduce((counts, video) => {
      counts[video.source] = (counts[video.source] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalVideos,
      totalViews,
      averageViews: Math.round(totalViews / totalVideos),
      categoryCounts,
      sourceCounts
    };
  }

  /**
   * Format duration from seconds to MM:SS or HH:MM:SS
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get video embed URL based on video type
   */
  static getEmbedUrl(video: VideoContent): string {
    // For now, return the embedUrl as-is
    // In production, you might want to add additional processing
    return video.embedUrl;
  }

  /**
   * Format view count for display
   */
  static formatViews(views: number): string {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }
}

export default VideoService;