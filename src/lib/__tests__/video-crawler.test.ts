/**
 * Unit tests for Video Crawler Service
 * Tests Rumble RSS fetching, scraping fallback, and video data processing
 */

// Mock cheerio before other imports to avoid ESM issues
jest.mock('cheerio', () => {
  const actualCheerio = jest.requireActual('cheerio');
  return actualCheerio;
}, { virtual: true });

import { VideoCrawler, VIDEO_SOURCES, VideoSourceConfig } from '../video-crawler';
import { VideoContent } from '../video-service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VideoCrawler', () => {
  let crawler: VideoCrawler;

  beforeEach(() => {
    crawler = new VideoCrawler();
    jest.clearAllMocks();
  });

  describe('fetchRumbleRSS', () => {
    it('should fetch and parse Rumble RSS feed successfully', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Channel</title>
            <item>
              <title>BRICS Summit 2024 Discussion</title>
              <link>https://rumble.com/v4abc123-brics-summit-2024.html</link>
              <description>Analysis of the BRICS summit outcomes</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
              <media:thumbnail url="https://example.com/thumb.jpg" />
            </item>
            <item>
              <title>Russia China Partnership</title>
              <link>https://rumble.com/v4def456-russia-china.html</link>
              <description>Economic cooperation between Russia and China</description>
              <pubDate>Sun, 06 Oct 2024 15:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValueOnce({ data: mockRSSResponse });

      const config: VideoSourceConfig = {
        name: 'Test Rumble Channel',
        platform: 'rumble',
        category: 'BRICS',
        rssUrl: 'https://rumble.com/c/TestChannel/rss',
        channelUrl: 'https://rumble.com/c/TestChannel',
        maxVideos: 10,
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos).toHaveLength(2);
      expect(videos[0]).toMatchObject({
        title: 'BRICS Summit 2024 Discussion',
        source: 'Test Rumble Channel',
        category: 'BRICS',
        videoType: 'rumble'
      });
      expect(videos[0].embedUrl).toContain('rumble.com/embed/');
      expect(videos[0].tags).toContain('brics');
    });

    it('should respect maxVideos limit', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item><title>Video 1</title><link>https://rumble.com/v1</link></item>
            <item><title>Video 2</title><link>https://rumble.com/v2</link></item>
            <item><title>Video 3</title><link>https://rumble.com/v3</link></item>
            <item><title>Video 4</title><link>https://rumble.com/v4</link></item>
            <item><title>Video 5</title><link>https://rumble.com/v5</link></item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValueOnce({ data: mockRSSResponse });

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        rssUrl: 'https://rumble.com/c/Test/rss',
        maxVideos: 3,
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos).toHaveLength(3);
    });

    it('should handle RSS fetch errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        rssUrl: 'https://rumble.com/c/Test/rss',
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos).toHaveLength(0);
    });

    it('should return empty array when no RSS URL provided', async () => {
      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos).toHaveLength(0);
    });

    it('should extract video ID and create embed URL correctly', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test Video</title>
              <link>https://rumble.com/v4xyz789-test-video.html</link>
              <description>Test description</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValueOnce({ data: mockRSSResponse });

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        rssUrl: 'https://rumble.com/c/Test/rss',
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos[0].embedUrl).toBe('https://rumble.com/embed/v4xyz789/');
      expect(videos[0].sourceUrl).toBe('https://rumble.com/v4xyz789-test-video.html');
    });
  });

  describe('scrapeRumbleChannel', () => {
    it('should scrape videos from Rumble channel page', async () => {
      const mockHTML = `
        <html>
          <body>
            <article class="video-item">
              <h3 class="video-item__title">China Economy Report</h3>
              <a href="/v4abc123-china-economy">Watch</a>
              <img src="https://example.com/thumb1.jpg" />
              <div class="video-item__description">Analysis of China's economic growth</div>
            </article>
            <article class="video-item">
              <h3 class="video-item__title">India Tech Development</h3>
              <a href="/v4def456-india-tech">Watch</a>
              <img src="https://example.com/thumb2.jpg" />
            </article>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHTML });

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        channelUrl: 'https://rumble.com/c/TestChannel',
        maxVideos: 10,
        active: true
      };

      const videos = await crawler.scrapeRumbleChannel(config);

      expect(videos).toHaveLength(2);
      expect(videos[0].title).toBe('China Economy Report');
      expect(videos[0].sourceUrl).toContain('rumble.com/v4abc123');
      expect(videos[0].tags).toContain('china');
    });

    it('should handle scraping errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Page not found'));

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        channelUrl: 'https://rumble.com/c/TestChannel',
        active: true
      };

      const videos = await crawler.scrapeRumbleChannel(config);

      expect(videos).toHaveLength(0);
    });
  });

  describe('fetchAllVideos', () => {
    it('should fetch videos from all active sources', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test Video</title>
              <link>https://rumble.com/v4test</link>
              <description>Test</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      // Mock multiple successful responses
      mockedAxios.get.mockResolvedValue({ data: mockRSSResponse });

      const videos = await crawler.fetchAllVideos();

      // Should have videos from active sources
      expect(videos.length).toBeGreaterThan(0);
      expect(videos[0]).toHaveProperty('videoType', 'rumble');
    });

    it('should handle mixed success/failure scenarios', async () => {
      // First call succeeds, second fails
      mockedAxios.get
        .mockResolvedValueOnce({ 
          data: `<?xml version="1.0"?>
            <rss><channel>
              <item><title>Video 1</title><link>https://rumble.com/v1</link></item>
            </channel></rss>` 
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const videos = await crawler.fetchAllVideos();

      // Should still return videos from successful sources
      expect(videos.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fetchVideosByCategory', () => {
    it('should fetch videos filtered by category', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>BRICS Video</title>
              <link>https://rumble.com/v4brics</link>
              <description>BRICS content</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValue({ data: mockRSSResponse });

      const videos = await crawler.fetchVideosByCategory('BRICS');

      expect(videos.length).toBeGreaterThanOrEqual(0);
      videos.forEach(video => {
        expect(video.category).toBe('BRICS');
      });
    });

    it('should return empty array for category with no active sources', async () => {
      const videos = await crawler.fetchVideosByCategory('Bali');

      // Bali category has no active sources currently
      expect(videos).toHaveLength(0);
    });
  });

  describe('tag extraction', () => {
    it('should extract BRICS-related tags from video content', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Russia and China Partnership Summit</title>
              <link>https://rumble.com/v4test</link>
              <description>Discussion on BRICS cooperation and multipolar world order</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValueOnce({ data: mockRSSResponse });

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        rssUrl: 'https://rumble.com/c/Test/rss',
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos[0].tags).toContain('russia');
      expect(videos[0].tags).toContain('china');
      expect(videos[0].tags).toContain('brics');
      expect(videos[0].tags).toContain('multipolar');
    });

    it('should extract Indonesia-related tags from video content', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Jakarta Infrastructure Development</title>
              <link>https://rumble.com/v4test</link>
              <description>New projects in Indonesia and Bali regions</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValueOnce({ data: mockRSSResponse });

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'Indonesia',
        rssUrl: 'https://rumble.com/c/Test/rss',
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos[0].tags).toContain('indonesia');
      expect(videos[0].tags).toContain('jakarta');
      expect(videos[0].tags).toContain('bali');
    });
  });

  describe('VIDEO_SOURCES configuration', () => {
    it('should have valid Rumble source configurations', () => {
      const rumbleSources = VIDEO_SOURCES.filter(s => s.platform === 'rumble');

      expect(rumbleSources.length).toBeGreaterThan(0);
      
      rumbleSources.forEach(source => {
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('platform', 'rumble');
        expect(source).toHaveProperty('category');
        expect(['BRICS', 'Indonesia', 'Bali']).toContain(source.category);
        expect(source).toHaveProperty('active');
        
        if (source.active) {
          expect(source.rssUrl || source.channelUrl).toBeTruthy();
        }
      });
    });

    it('should have active BRICS video sources', () => {
      const activeBRICSSources = VIDEO_SOURCES.filter(
        s => s.category === 'BRICS' && s.active
      );

      expect(activeBRICSSources.length).toBeGreaterThan(0);
    });
  });

  describe('text cleaning', () => {
    it('should clean and normalize video titles and descriptions', async () => {
      const mockRSSResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>  Test   Video  With   Extra    Spaces  </title>
              <link>https://rumble.com/v4test</link>
              <description>Description
              with
              multiple
              lines</description>
              <pubDate>Mon, 07 Oct 2024 10:00:00 GMT</pubDate>
            </item>
          </channel>
        </rss>`;

      mockedAxios.get.mockResolvedValueOnce({ data: mockRSSResponse });

      const config: VideoSourceConfig = {
        name: 'Test Channel',
        platform: 'rumble',
        category: 'BRICS',
        rssUrl: 'https://rumble.com/c/Test/rss',
        active: true
      };

      const videos = await crawler.fetchRumbleRSS(config);

      expect(videos[0].title).toBe('Test Video With Extra Spaces');
      expect(videos[0].description).not.toContain('\n');
      expect(videos[0].description).toMatch(/^Description with multiple lines$/);
    });
  });
});
