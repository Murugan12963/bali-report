import { NewsdataService, newsdataService } from '../newsdata-service';

/**
 * Unit tests for NewsData.io API service integration.
 */

// Mock axios for testing
jest.mock('axios');
const mockedAxios = jest.mocked(require('axios'));

// Mock environment variables
const originalEnv = process.env;

// Mock NewsData.io API responses
const mockNewsdataResponse = {
  status: 'success',
  totalResults: 3,
  results: [
    {
      article_id: 'newsdata-article-1',
      title: 'BRICS Summit Discusses Multipolar World Order',
      link: 'https://example.com/brics-summit',
      description: 'Leaders from BRICS nations gather to discuss economic cooperation',
      content: 'Full article content here...',
      pubDate: '2025-01-09 12:00:00',
      image_url: 'https://example.com/image1.jpg',
      source_id: 'rt',
      source_name: 'RT News',
      source_url: 'https://rt.com',
      source_icon: 'https://rt.com/favicon.ico',
      language: 'en',
      country: ['ru'],
      category: ['world', 'politics'],
      keywords: ['BRICS', 'summit', 'cooperation'],
      creator: ['John Doe'],
      sentiment: 'neutral',
      ai_tag: 'politics',
      duplicate: false
    },
    {
      article_id: 'newsdata-article-2',
      title: 'Indonesia Economy Shows Strong Growth',
      link: 'https://example.com/indonesia-economy',
      description: 'Indonesian economy demonstrates resilience',
      pubDate: '2025-01-09 11:30:00',
      source_name: 'Jakarta Post',
      source_url: 'https://thejakartapost.com',
      language: 'en',
      country: ['id'],
      category: ['business'],
      keywords: ['Indonesia', 'economy', 'growth']
    },
    {
      article_id: 'newsdata-article-3',
      title: 'Bali Tourism Recovery Accelerates',
      link: 'https://example.com/bali-tourism',
      description: 'Bali sees increased tourist arrivals',
      pubDate: '2025-01-09 10:00:00',
      source_name: 'Bali Post',
      source_url: 'https://balipost.com',
      language: 'id',
      country: ['id'],
      category: ['tourism'],
      keywords: ['Bali', 'tourism', 'recovery']
    }
  ],
  nextPage: null
};

const mockErrorResponse = {
  code: 'RateLimitExceeded',
  message: 'You have exceeded your daily request limit'
};

describe('NewsdataService', () => {
  let testService: NewsdataService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.NEWSDATA_API_KEY = 'test-api-key';
    
    // Create fresh service instance for each test
    testService = new NewsdataService('test-api-key');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with API key from constructor', () => {
      const service = new NewsdataService('constructor-key');
      expect(service.isAvailable()).toBe(true);
    });

    it('should initialize with API key from environment variable', () => {
      process.env.NEWSDATA_API_KEY = 'env-key';
      const service = new NewsdataService();
      expect(service.isAvailable()).toBe(true);
    });

    it('should be unavailable without API key', () => {
      delete process.env.NEWSDATA_API_KEY;
      const service = new NewsdataService();
      expect(service.isAvailable()).toBe(false);
    });

    it('should warn when API key is missing', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      delete process.env.NEWSDATA_API_KEY;
      new NewsdataService();
      expect(consoleSpy).toHaveBeenCalledWith('⚠️  NEWSDATA_API_KEY not found. NewsData.io service will be disabled.');
      consoleSpy.mockRestore();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting between requests', async () => {
      const startTime = Date.now();
      
      // Mock successful API responses
      mockedAxios.get.mockResolvedValue({ data: mockNewsdataResponse });
      
      // Make two requests
      await testService.fetchArticles('BRICS', 10);
      await testService.fetchArticles('Indonesia', 10);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should take at least 1 second due to rate limiting
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('should become unavailable when rate limit is exceeded', () => {
      // Reset request count and set to limit
      testService.resetUsageCounter();
      for (let i = 0; i < 200; i++) {
        (testService as any).requestCount++;
      }
      
      expect(testService.isAvailable()).toBe(false);
    });

    it('should provide usage statistics', () => {
      const stats = testService.getUsageStats();
      expect(stats).toHaveProperty('requestCount');
      expect(stats).toHaveProperty('dailyLimit');
      expect(stats).toHaveProperty('remainingRequests');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('lastRequestTime');
      expect(stats.dailyLimit).toBe(200);
    });

    it('should reset usage counter', () => {
      // Make some requests
      (testService as any).requestCount = 50;
      
      testService.resetUsageCounter();
      const stats = testService.getUsageStats();
      expect(stats.requestCount).toBe(0);
    });
  });

  describe('API Request Methods', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockNewsdataResponse });
    });

    it('should fetch BRICS articles successfully', async () => {
      const response = await testService.fetchArticles('BRICS', 10);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(response.status).toBe('success');
      expect(response.results).toHaveLength(3);
      
      // Verify API call parameters
      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('apikey=test-api-key');
      expect(url).toContain('size=10');
      expect(url).toContain('language=en,zh,ru,hi,pt,ar');
      expect(url).toContain('country=us,cn,ru,in,br,za,ir,eg');
      expect(url).toContain('category=world,politics,business');
      expect(url).toContain('qInTitle=BRICS');
    });

    it('should fetch Indonesia articles successfully', async () => {
      const response = await testService.fetchArticles('Indonesia', 25);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(response.status).toBe('success');
      
      // Verify Indonesia-specific parameters
      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('size=25');
      expect(url).toContain('language=id,en');
      expect(url).toContain('country=id');
      expect(url).toContain('qInTitle=Indonesia');
    });

    it('should fetch Bali articles successfully', async () => {
      const response = await testService.fetchArticles('Bali', 15);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      
      // Verify Bali-specific parameters
      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('size=15');
      expect(url).toContain('language=id,en');
      expect(url).toContain('country=id');
      expect(url).toContain('category=general,tourism');
      expect(url).toContain('qInTitle=Bali');
    });

    it('should handle pagination with nextPage token', async () => {
      const responseWithPagination = { 
        ...mockNewsdataResponse, 
        nextPage: 'next-page-token' 
      };
      mockedAxios.get.mockResolvedValue({ data: responseWithPagination });
      
      const response = await testService.fetchArticles('BRICS', 10, 'next-page-token');
      
      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('page=next-page-token');
    });

    it('should enforce maximum article limit of 50', async () => {
      await testService.fetchArticles('BRICS', 100); // Request 100
      
      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('size=50'); // Should be capped at 50
    });
  });

  describe('Article Conversion', () => {
    it('should convert NewsData.io article to internal format', () => {
      const newsdataArticle = mockNewsdataResponse.results[0];
      const converted = testService.convertToArticle(newsdataArticle, 'BRICS');
      
      expect(converted).toEqual({
        id: 'newsdata-article-1',
        title: 'BRICS Summit Discusses Multipolar World Order',
        link: 'https://example.com/brics-summit',
        description: 'Leaders from BRICS nations gather to discuss economic cooperation',
        pubDate: '2025-01-09 12:00:00',
        author: 'John Doe',
        category: 'BRICS',
        source: 'RT News (NewsData.io)',
        sourceUrl: 'https://rt.com',
        imageUrl: 'https://example.com/image1.jpg'
      });
    });

    it('should handle articles with missing optional fields', () => {
      const minimalArticle = {
        article_id: 'minimal-1',
        title: 'Test Title',
        link: 'https://example.com/test',
        description: '',
        pubDate: '2025-01-09 12:00:00',
        source_name: 'Test Source',
        source_url: 'https://testsource.com'
      };
      
      const converted = testService.convertToArticle(minimalArticle as any, 'Indonesia');
      
      expect(converted.id).toBe('minimal-1');
      expect(converted.description).toBe('');
      expect(converted.author).toBeUndefined();
      expect(converted.imageUrl).toBeUndefined();
      expect(converted.source).toBe('Test Source (NewsData.io)');
    });
  });

  describe('Batch Operations', () => {
    it('should fetch articles from all categories', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockNewsdataResponse });
      
      const articles = await testService.fetchAllCategories(20);
      
      // Should make 3 requests (BRICS, Indonesia, Bali)
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(articles.length).toBe(9); // 3 articles × 3 categories
      
      // Verify delay between requests (should take at least 1 second total)
      const stats = testService.getUsageStats();
      expect(stats.requestCount).toBe(3);
    });

    it('should handle failures gracefully in batch operations', async () => {
      // Mock first request to succeed, second to fail, third to succeed
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockNewsdataResponse })
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({ data: mockNewsdataResponse });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const articles = await testService.fetchAllCategories(10);
      
      // Should continue with other categories despite one failure
      expect(articles.length).toBe(6); // 2 successful categories × 3 articles
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to fetch Indonesia from NewsData.io:'),
        'API Error'
      );
      
      consoleSpy.mockRestore();
    });

    it('should return empty array when service is unavailable', async () => {
      const service = new NewsdataService(); // No API key
      
      const articles = await service.fetchAllCategories();
      expect(articles).toEqual([]);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe('Search Functionality', () => {
    it('should search articles with query', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockNewsdataResponse });
      
      const response = await testService.searchArticles('multipolar', 'BRICS', 15);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      
      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      expect(url).toContain('q=multipolar');
      expect(url).toContain('size=15');
      expect(url).toContain('language=en,zh,ru,hi,pt,ar');
    });

    it('should throw error when service unavailable for search', async () => {
      const service = new NewsdataService(); // No API key
      
      await expect(service.searchArticles('test')).rejects.toThrow('NewsData.io service not available');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 Unauthorized error', async () => {
      const error = { response: { status: 401 } };
      mockedAxios.get.mockRejectedValue(error);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(testService.fetchArticles('BRICS')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('🔑 Invalid NewsData.io API key');
      
      consoleSpy.mockRestore();
    });

    it('should handle 429 Rate Limit error', async () => {
      const error = { response: { status: 429 } };
      mockedAxios.get.mockRejectedValue(error);
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await expect(testService.fetchArticles('BRICS')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('⚠️  NewsData.io rate limit exceeded');
      expect(testService.isAvailable()).toBe(false); // Should disable service
      
      consoleSpy.mockRestore();
    });

    it('should handle 422 Parameter error', async () => {
      const error = { 
        response: { 
          status: 422,
          data: { message: 'Invalid parameter: category' }
        }
      };
      mockedAxios.get.mockRejectedValue(error);
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await expect(testService.fetchArticles('BRICS')).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️  NewsData.io parameter error:',
        'Invalid parameter: category'
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockedAxios.get.mockRejectedValue(error);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await expect(testService.fetchArticles('BRICS')).rejects.toThrow('Network Error');
      expect(consoleSpy).toHaveBeenCalledWith(
        '❌ NewsData.io API error for BRICS:',
        'Network Error'
      );
      
      consoleSpy.mockRestore();
    });

    it('should throw error when service unavailable', async () => {
      (testService as any).requestCount = 200; // Exceed limit
      
      await expect(testService.fetchArticles('BRICS')).rejects.toThrow(
        'NewsData.io service not available (missing API key or rate limit exceeded)'
      );
    });
  });

  describe('Logging and Console Output', () => {
    it('should log successful fetch operations', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockNewsdataResponse });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await testService.fetchArticles('BRICS', 10);
      
      expect(consoleSpy).toHaveBeenCalledWith('🔍 Fetching BRICS articles from NewsData.io (Request 1/200)');
      expect(consoleSpy).toHaveBeenCalledWith('✅ NewsData.io: 3 BRICS articles found');
      
      consoleSpy.mockRestore();
    });

    it('should log usage counter reset', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      testService.resetUsageCounter();
      
      expect(consoleSpy).toHaveBeenCalledWith('🔄 NewsData.io usage counter reset');
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Singleton Instance', () => {
  it('should export singleton instance', () => {
    expect(newsdataService).toBeDefined();
    expect(newsdataService).toBeInstanceOf(NewsdataService);
  });

  it('should maintain state across imports', () => {
    // Reset counter
    newsdataService.resetUsageCounter();
    
    // Simulate usage
    (newsdataService as any).requestCount = 5;
    
    const stats = newsdataService.getUsageStats();
    expect(stats.requestCount).toBe(5);
  });
});