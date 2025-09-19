/**
 * Save for Later Service - Pocket-inspired offline reading system
 * Handles article bookmarking, offline caching, and reading queue management
 */

import { Article } from './rss-parser';

export interface SavedArticle extends Article {
  savedAt: string;
  readStatus: 'unread' | 'reading' | 'read';
  readingProgress: number; // Percentage (0-100)
  tags: string[];
  notes: string;
  estimatedReadTime: number; // Minutes
  priority: 'low' | 'normal' | 'high';
}

export interface ReadingStats {
  totalSaved: number;
  totalRead: number;
  totalUnread: number;
  averageReadTime: number;
  topTags: string[];
  readingStreak: number;
}

class SaveForLaterService {
  private static readonly STORAGE_KEY = 'bali-report-saved-articles';
  private static readonly STATS_KEY = 'bali-report-reading-stats';
  private static readonly VERSION = '1.0';

  /**
   * Save an article for later reading.
   * 
   * Args:
   *   article (Article): Article to save.
   *   tags (string[]): Optional tags for organization.
   *   priority ('low' | 'normal' | 'high'): Reading priority.
   * 
   * Returns:
   *   Promise<SavedArticle>: Saved article with metadata.
   */
  async saveArticle(
    article: Article, 
    tags: string[] = [], 
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<SavedArticle> {
    try {
      const savedArticles = this.getSavedArticles();
      
      // Check if article is already saved
      const existingIndex = savedArticles.findIndex(saved => saved.id === article.id);
      
      const savedArticle: SavedArticle = {
        ...article,
        savedAt: new Date().toISOString(),
        readStatus: 'unread',
        readingProgress: 0,
        tags,
        notes: '',
        estimatedReadTime: this.estimateReadTime(article.description),
        priority,
      };

      if (existingIndex >= 0) {
        // Update existing saved article
        savedArticles[existingIndex] = {
          ...savedArticles[existingIndex],
          ...savedArticle,
          savedAt: savedArticles[existingIndex].savedAt, // Keep original save date
        };
      } else {
        // Add new saved article
        savedArticles.unshift(savedArticle); // Add to beginning for recency
      }

      // Limit saved articles to 500 (storage management)
      if (savedArticles.length > 500) {
        const removed = savedArticles.splice(500);
        console.log(`🧹 Removed ${removed.length} old saved articles to manage storage`);
      }

      this.storeSavedArticles(savedArticles);
      this.updateReadingStats();
      
      // Cache article content for offline access
      await this.cacheArticleContent(savedArticle);
      
      console.log(`💾 Saved article: "${article.title}"`);
      return savedArticle;
      
    } catch (error) {
      console.error('❌ Failed to save article:', error);
      throw new Error('Failed to save article for later reading');
    }
  }

  /**
   * Remove an article from saved list.
   * 
   * Args:
   *   articleId (string): ID of article to remove.
   * 
   * Returns:
   *   boolean: True if article was removed.
   */
  removeArticle(articleId: string): boolean {
    try {
      const savedArticles = this.getSavedArticles();
      const initialLength = savedArticles.length;
      
      const filtered = savedArticles.filter(article => article.id !== articleId);
      
      if (filtered.length < initialLength) {
        this.storeSavedArticles(filtered);
        this.updateReadingStats();
        console.log(`🗑️ Removed saved article: ${articleId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to remove article:', error);
      return false;
    }
  }

  /**
   * Update article reading status and progress.
   * 
   * Args:
   *   articleId (string): Article ID.
   *   status ('unread' | 'reading' | 'read'): New reading status.
   *   progress (number): Reading progress percentage.
   */
  updateReadingProgress(
    articleId: string, 
    status: 'unread' | 'reading' | 'read', 
    progress: number = 0
  ): void {
    try {
      const savedArticles = this.getSavedArticles();
      const articleIndex = savedArticles.findIndex(article => article.id === articleId);
      
      if (articleIndex >= 0) {
        savedArticles[articleIndex].readStatus = status;
        savedArticles[articleIndex].readingProgress = Math.min(Math.max(progress, 0), 100);
        
        this.storeSavedArticles(savedArticles);
        this.updateReadingStats();
        
        console.log(`📖 Updated reading progress: ${articleId} - ${status} (${progress}%)`);
      }
    } catch (error) {
      console.error('❌ Failed to update reading progress:', error);
    }
  }

  /**
   * Add tags to a saved article.
   * 
   * Args:
   *   articleId (string): Article ID.
   *   newTags (string[]): Tags to add.
   */
  addTags(articleId: string, newTags: string[]): void {
    try {
      const savedArticles = this.getSavedArticles();
      const articleIndex = savedArticles.findIndex(article => article.id === articleId);
      
      if (articleIndex >= 0) {
        const existingTags = savedArticles[articleIndex].tags || [];
        const uniqueTags = [...new Set([...existingTags, ...newTags])];
        
        savedArticles[articleIndex].tags = uniqueTags;
        this.storeSavedArticles(savedArticles);
        
        console.log(`🏷️ Added tags to article: ${articleId}`, newTags);
      }
    } catch (error) {
      console.error('❌ Failed to add tags:', error);
    }
  }

  /**
   * Add notes to a saved article.
   * 
   * Args:
   *   articleId (string): Article ID.
   *   notes (string): Notes to add/update.
   */
  addNotes(articleId: string, notes: string): void {
    try {
      const savedArticles = this.getSavedArticles();
      const articleIndex = savedArticles.findIndex(article => article.id === articleId);
      
      if (articleIndex >= 0) {
        savedArticles[articleIndex].notes = notes;
        this.storeSavedArticles(savedArticles);
        
        console.log(`📝 Added notes to article: ${articleId}`);
      }
    } catch (error) {
      console.error('❌ Failed to add notes:', error);
    }
  }

  /**
   * Get all saved articles.
   * 
   * Returns:
   *   SavedArticle[]: Array of saved articles.
   */
  getSavedArticles(): SavedArticle[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(SaveForLaterService.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // Version check and migration if needed
      if (parsed.version !== SaveForLaterService.VERSION) {
        return this.migrateSavedArticles(parsed.articles || []);
      }

      return parsed.articles || [];
    } catch (error) {
      console.error('❌ Failed to load saved articles:', error);
      return [];
    }
  }

  /**
   * Get saved articles filtered by criteria.
   * 
   * Args:
   *   filters (object): Filter criteria.
   * 
   * Returns:
   *   SavedArticle[]: Filtered articles.
   */
  getFilteredArticles(filters: {
    status?: 'unread' | 'reading' | 'read';
    tags?: string[];
    category?: 'BRICS' | 'Indonesia' | 'Bali';
    priority?: 'low' | 'normal' | 'high';
    search?: string;
  }): SavedArticle[] {
    const allArticles = this.getSavedArticles();
    
    return allArticles.filter(article => {
      // Status filter
      if (filters.status && article.readStatus !== filters.status) {
        return false;
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          article.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      
      // Category filter
      if (filters.category && article.category !== filters.category) {
        return false;
      }
      
      // Priority filter
      if (filters.priority && article.priority !== filters.priority) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          article.title.toLowerCase().includes(searchLower) ||
          article.description.toLowerCase().includes(searchLower) ||
          article.notes.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }

  /**
   * Check if an article is saved.
   * 
   * Args:
   *   articleId (string): Article ID to check.
   * 
   * Returns:
   *   boolean: True if article is saved.
   */
  isArticleSaved(articleId: string): boolean {
    const savedArticles = this.getSavedArticles();
    return savedArticles.some(article => article.id === articleId);
  }

  /**
   * Get reading statistics.
   * 
   * Returns:
   *   ReadingStats: Reading statistics.
   */
  getReadingStats(): ReadingStats {
    if (typeof window === 'undefined') {
      return {
        totalSaved: 0,
        totalRead: 0,
        totalUnread: 0,
        averageReadTime: 0,
        topTags: [],
        readingStreak: 0
      };
    }

    try {
      const stored = localStorage.getItem(SaveForLaterService.STATS_KEY);
      if (!stored) return this.calculateStats();

      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ Failed to load reading stats:', error);
      return this.calculateStats();
    }
  }

  /**
   * Export saved articles for backup.
   * 
   * Returns:
   *   string: JSON string of saved articles.
   */
  exportSavedArticles(): string {
    const savedArticles = this.getSavedArticles();
    const exportData = {
      version: SaveForLaterService.VERSION,
      exportedAt: new Date().toISOString(),
      articles: savedArticles,
      stats: this.getReadingStats()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import saved articles from backup.
   * 
   * Args:
   *   importData (string): JSON string of saved articles.
   * 
   * Returns:
   *   boolean: True if import was successful.
   */
  importSavedArticles(importData: string): boolean {
    try {
      const parsed = JSON.parse(importData);
      
      if (!parsed.articles || !Array.isArray(parsed.articles)) {
        throw new Error('Invalid import data format');
      }
      
      const currentArticles = this.getSavedArticles();
      const importedArticles = parsed.articles as SavedArticle[];
      
      // Merge articles, avoiding duplicates
      const merged = [...currentArticles];
      
      for (const importedArticle of importedArticles) {
        const existingIndex = merged.findIndex(article => article.id === importedArticle.id);
        if (existingIndex >= 0) {
          // Keep the most recently saved version
          if (new Date(importedArticle.savedAt) > new Date(merged[existingIndex].savedAt)) {
            merged[existingIndex] = importedArticle;
          }
        } else {
          merged.push(importedArticle);
        }
      }
      
      this.storeSavedArticles(merged);
      this.updateReadingStats();
      
      console.log(`📥 Imported ${importedArticles.length} articles, merged with ${currentArticles.length} existing`);
      return true;
      
    } catch (error) {
      console.error('❌ Failed to import saved articles:', error);
      return false;
    }
  }

  /**
   * Clear all saved articles.
   */
  clearAllSavedArticles(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(SaveForLaterService.STORAGE_KEY);
      localStorage.removeItem(SaveForLaterService.STATS_KEY);
      
      console.log('🧹 Cleared all saved articles');
    } catch (error) {
      console.error('❌ Failed to clear saved articles:', error);
    }
  }

  // Private methods

  private storeSavedArticles(articles: SavedArticle[]): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        version: SaveForLaterService.VERSION,
        lastUpdated: new Date().toISOString(),
        articles
      };
      
      localStorage.setItem(SaveForLaterService.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Failed to store saved articles:', error);
    }
  }

  private calculateStats(): ReadingStats {
    const savedArticles = this.getSavedArticles();
    
    const totalSaved = savedArticles.length;
    const totalRead = savedArticles.filter(a => a.readStatus === 'read').length;
    const totalUnread = savedArticles.filter(a => a.readStatus === 'unread').length;
    
    const readTimes = savedArticles
      .filter(a => a.readStatus === 'read')
      .map(a => a.estimatedReadTime);
    
    const averageReadTime = readTimes.length > 0 
      ? readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length 
      : 0;
    
    // Calculate top tags
    const tagCounts: Record<string, number> = {};
    savedArticles.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const topTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
    
    return {
      totalSaved,
      totalRead,
      totalUnread,
      averageReadTime: Math.round(averageReadTime * 100) / 100,
      topTags,
      readingStreak: 0 // Calculate reading streak logic if needed
    };
  }

  private updateReadingStats(): void {
    if (typeof window === 'undefined') return;

    try {
      const stats = this.calculateStats();
      localStorage.setItem(SaveForLaterService.STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('❌ Failed to update reading stats:', error);
    }
  }

  private estimateReadTime(content: string): number {
    // Average reading speed: 200 words per minute
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }

  private async cacheArticleContent(article: SavedArticle): Promise<void> {
    try {
      // Send message to service worker to cache article
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        navigator.serviceWorker.controller.postMessage(
          {
            type: 'SAVE_ARTICLE',
            payload: article
          },
          [messageChannel.port2]
        );
        
        // Wait for response
        await new Promise<void>((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              console.log('📦 Article cached for offline access');
            }
            resolve();
          };
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to cache article content:', error);
      // Don't throw - caching failure shouldn't prevent saving
    }
  }

  private migrateSavedArticles(oldArticles: any[]): SavedArticle[] {
    // Migration logic for older versions
    return oldArticles.map(article => ({
      ...article,
      readStatus: article.readStatus || 'unread',
      readingProgress: article.readingProgress || 0,
      tags: article.tags || [],
      notes: article.notes || '',
      estimatedReadTime: article.estimatedReadTime || this.estimateReadTime(article.description || ''),
      priority: article.priority || 'normal'
    }));
  }
}

// Export singleton instance
export const saveForLaterService = new SaveForLaterService();

// Export class for custom instances
export { SaveForLaterService };