/**
 * Unit tests for Save for Later functionality
 */

import { SaveForLaterService } from '@/lib/save-for-later';
import { Article } from '@/lib/rss-parser';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window object for Node.js environment
if (typeof window === 'undefined') {
  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: mockLocalStorage,
    },
    writable: true,
  });
} else {
  // Replace localStorage if window exists
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
}

// Mock navigator for service worker tests
Object.defineProperty(globalThis, 'navigator', {
  value: {
    serviceWorker: {
      controller: null,
    },
  },
  writable: true,
});

describe('SaveForLaterService', () => {
  let service: SaveForLaterService;
  let mockArticle: Article;

  beforeEach(() => {
    service = new SaveForLaterService();
    mockLocalStorage.clear();
    
    mockArticle = {
      id: 'test-article-1',
      title: 'Test Article Title',
      description: 'This is a test article description with some content to test reading time estimation.',
      link: 'https://example.com/test-article',
      pubDate: '2024-01-01T00:00:00Z',
      source: 'Test Source',
      category: 'BRICS' as const,
    };
  });

  describe('saveArticle', () => {
    it('should save an article successfully', async () => {
      const savedArticle = await service.saveArticle(mockArticle);
      
      expect(savedArticle.id).toBe(mockArticle.id);
      expect(savedArticle.title).toBe(mockArticle.title);
      expect(savedArticle.readStatus).toBe('unread');
      expect(savedArticle.readingProgress).toBe(0);
      expect(savedArticle.priority).toBe('normal');
      expect(savedArticle.tags).toEqual([]);
      expect(savedArticle.notes).toBe('');
      expect(typeof savedArticle.estimatedReadTime).toBe('number');
      expect(savedArticle.estimatedReadTime).toBeGreaterThan(0);
    });

    it('should save article with custom tags and priority', async () => {
      const tags = ['Important', 'Investment'];
      const priority = 'high';
      
      const savedArticle = await service.saveArticle(mockArticle, tags, priority);
      
      expect(savedArticle.tags).toEqual(tags);
      expect(savedArticle.priority).toBe(priority);
    });

    it('should estimate reading time correctly', async () => {
      const shortArticle = {
        ...mockArticle,
        description: 'Short content.',
      };
      
      const longArticle = {
        ...mockArticle,
        id: 'long-article',
        description: 'This is a much longer article description. '.repeat(100),
      };
      
      const shortSaved = await service.saveArticle(shortArticle);
      const longSaved = await service.saveArticle(longArticle);
      
      expect(shortSaved.estimatedReadTime).toBeLessThan(longSaved.estimatedReadTime);
      expect(shortSaved.estimatedReadTime).toBeGreaterThanOrEqual(1);
    });
  });

  describe('removeArticle', () => {
    it('should remove an existing article', async () => {
      await service.saveArticle(mockArticle);
      expect(service.getSavedArticles()).toHaveLength(1);
      
      const removed = service.removeArticle(mockArticle.id);
      expect(removed).toBe(true);
      expect(service.getSavedArticles()).toHaveLength(0);
    });

    it('should return false for non-existent article', () => {
      const removed = service.removeArticle('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('updateReadingProgress', () => {
    it('should update reading status and progress', async () => {
      await service.saveArticle(mockArticle);
      
      service.updateReadingProgress(mockArticle.id, 'reading', 50);
      
      const savedArticles = service.getSavedArticles();
      const article = savedArticles.find(a => a.id === mockArticle.id);
      
      expect(article?.readStatus).toBe('reading');
      expect(article?.readingProgress).toBe(50);
    });

    it('should clamp progress between 0 and 100', async () => {
      await service.saveArticle(mockArticle);
      
      service.updateReadingProgress(mockArticle.id, 'reading', 150);
      let article = service.getSavedArticles().find(a => a.id === mockArticle.id);
      expect(article?.readingProgress).toBe(100);
      
      service.updateReadingProgress(mockArticle.id, 'reading', -10);
      article = service.getSavedArticles().find(a => a.id === mockArticle.id);
      expect(article?.readingProgress).toBe(0);
    });
  });

  describe('isArticleSaved', () => {
    it('should return true for saved articles', async () => {
      expect(service.isArticleSaved(mockArticle.id)).toBe(false);
      
      await service.saveArticle(mockArticle);
      expect(service.isArticleSaved(mockArticle.id)).toBe(true);
    });

    it('should return false for non-existent articles', () => {
      expect(service.isArticleSaved('non-existent-id')).toBe(false);
    });
  });

  describe('getReadingStats', () => {
    it('should calculate reading statistics correctly', async () => {
      await service.saveArticle(mockArticle, ['Tag1']);
      await service.saveArticle({ ...mockArticle, id: 'article-2' }, ['Tag1', 'Tag2']);
      
      service.updateReadingProgress('article-2', 'read', 100);
      
      const stats = service.getReadingStats();
      
      expect(stats.totalSaved).toBe(2);
      expect(stats.totalRead).toBe(1);
      expect(stats.totalUnread).toBe(1);
      expect(stats.topTags).toContain('Tag1');
      expect(typeof stats.averageReadTime).toBe('number');
    });

    it('should return empty stats for no articles', () => {
      const stats = service.getReadingStats();
      
      expect(stats.totalSaved).toBe(0);
      expect(stats.totalRead).toBe(0);
      expect(stats.totalUnread).toBe(0);
      expect(stats.averageReadTime).toBe(0);
      expect(stats.topTags).toEqual([]);
    });
  });

  describe('exportSavedArticles', () => {
    it('should export articles in correct format', async () => {
      await service.saveArticle(mockArticle, ['Test'], 'high');
      
      const exportData = service.exportSavedArticles();
      const parsed = JSON.parse(exportData);
      
      expect(parsed.version).toBe('1.0');
      expect(parsed.articles).toHaveLength(1);
      expect(parsed.articles[0].id).toBe(mockArticle.id);
      expect(parsed.stats).toBeDefined();
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe('clearAllSavedArticles', () => {
    it('should clear all saved articles', async () => {
      await service.saveArticle(mockArticle);
      expect(service.getSavedArticles()).toHaveLength(1);
      
      service.clearAllSavedArticles();
      expect(service.getSavedArticles()).toHaveLength(0);
      
      const stats = service.getReadingStats();
      expect(stats.totalSaved).toBe(0);
    });
  });
});