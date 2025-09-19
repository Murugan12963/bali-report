/**
 * User Preferences Management System for Bali Report
 * Handles topic selection, location preferences, and personalized content scoring
 */

export interface UserTopics {
  'BRICS Economy': boolean;
  'BRICS Politics': boolean;
  'Indonesia Politics': boolean;
  'Indonesia Economy': boolean;
  'Bali Tourism': boolean;
  'Bali Events': boolean;
  'Bali Culture': boolean;
  'Southeast Asia': boolean;
  'Geopolitics': boolean;
  'Trade & Business': boolean;
}

export interface UserLocation {
  type: 'tourist' | 'expat' | 'local' | 'global' | 'unknown';
  country?: string;
  region?: 'bali' | 'indonesia' | 'asia' | 'global';
  detected?: boolean;
}

export interface UserPreferences {
  topics: UserTopics;
  location: UserLocation;
  isFirstVisit: boolean;
  hasCompletedSetup: boolean;
  lastUpdated: string;
  version: string;
}

export interface ContentScore {
  relevanceScore: number;
  topicMatch: number;
  locationRelevance: number;
  recencyBoost: number;
  sourceReliability: number;
}

class UserPreferencesManager {
  private static readonly STORAGE_KEY = 'bali-report-preferences';
  private static readonly VERSION = '1.0';
  
  private defaultPreferences: UserPreferences = {
    topics: {
      'BRICS Economy': false,
      'BRICS Politics': false,
      'Indonesia Politics': false,
      'Indonesia Economy': false,
      'Bali Tourism': false,
      'Bali Events': false,
      'Bali Culture': false,
      'Southeast Asia': false,
      'Geopolitics': false,
      'Trade & Business': false,
    },
    location: {
      type: 'unknown',
    },
    isFirstVisit: true,
    hasCompletedSetup: false,
    lastUpdated: new Date().toISOString(),
    version: UserPreferencesManager.VERSION,
  };

  /**
   * Load user preferences from localStorage.
   * 
   * Returns:
   *   UserPreferences: User preferences or defaults if none exist.
   */
  loadPreferences(): UserPreferences {
    if (typeof window === 'undefined') {
      return this.defaultPreferences;
    }

    try {
      const stored = localStorage.getItem(UserPreferencesManager.STORAGE_KEY);
      if (!stored) {
        return this.defaultPreferences;
      }

      const parsed: UserPreferences = JSON.parse(stored);
      
      // Version check and migration if needed
      if (parsed.version !== UserPreferencesManager.VERSION) {
        console.log('🔄 Migrating user preferences to new version');
        return this.migratePreferences(parsed);
      }

      return parsed;
    } catch (error) {
      console.error('❌ Error loading user preferences:', error);
      return this.defaultPreferences;
    }
  }

  /**
   * Save user preferences to localStorage.
   * 
   * Args:
   *   preferences (UserPreferences): Preferences to save.
   */
  savePreferences(preferences: UserPreferences): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      preferences.lastUpdated = new Date().toISOString();
      preferences.version = UserPreferencesManager.VERSION;
      
      localStorage.setItem(
        UserPreferencesManager.STORAGE_KEY,
        JSON.stringify(preferences)
      );
      
      console.log('✅ User preferences saved successfully');
    } catch (error) {
      console.error('❌ Error saving user preferences:', error);
    }
  }

  /**
   * Update specific topic preferences.
   * 
   * Args:
   *   topics (Partial<UserTopics>): Topics to update.
   */
  updateTopics(topics: Partial<UserTopics>): void {
    const preferences = this.loadPreferences();
    preferences.topics = { ...preferences.topics, ...topics };
    this.savePreferences(preferences);
  }

  /**
   * Update location preferences.
   * 
   * Args:
   *   location (Partial<UserLocation>): Location data to update.
   */
  updateLocation(location: Partial<UserLocation>): void {
    const preferences = this.loadPreferences();
    preferences.location = { ...preferences.location, ...location };
    this.savePreferences(preferences);
  }

  /**
   * Mark setup as completed.
   */
  completeSetup(): void {
    const preferences = this.loadPreferences();
    preferences.hasCompletedSetup = true;
    preferences.isFirstVisit = false;
    this.savePreferences(preferences);
  }

  /**
   * Get selected topic categories for content filtering.
   * 
   * Returns:
   *   string[]: Array of selected topic keys.
   */
  getSelectedTopics(): string[] {
    const preferences = this.loadPreferences();
    return Object.entries(preferences.topics)
      .filter(([_, selected]) => selected)
      .map(([topic, _]) => topic);
  }

  /**
   * Check if user prefers content from a specific category.
   * 
   * Args:
   *   category ('BRICS' | 'Indonesia' | 'Bali'): Content category.
   * 
   * Returns:
   *   boolean: True if user is interested in this category.
   */
  isInterestedInCategory(category: 'BRICS' | 'Indonesia' | 'Bali'): boolean {
    const selectedTopics = this.getSelectedTopics();
    
    switch (category) {
      case 'BRICS':
        return selectedTopics.some(topic => 
          topic.includes('BRICS') || topic === 'Geopolitics' || topic === 'Trade & Business'
        );
      case 'Indonesia':
        return selectedTopics.some(topic => 
          topic.includes('Indonesia') || topic === 'Southeast Asia'
        );
      case 'Bali':
        return selectedTopics.some(topic => topic.includes('Bali'));
      default:
        return false;
    }
  }

  /**
   * Calculate content relevance score for personalized ranking.
   * 
   * Args:
   *   article (any): Article object with title, description, category, etc.
   * 
   * Returns:
   *   ContentScore: Detailed scoring breakdown.
   */
  calculateContentScore(article: any): ContentScore {
    const preferences = this.loadPreferences();
    const selectedTopics = this.getSelectedTopics();
    
    // Base scores
    let topicMatch = 0;
    let locationRelevance = 0.5; // Default neutral
    let recencyBoost = 0;
    let sourceReliability = 0.7; // Default reliability
    
    // Topic matching (0-1 score)
    if (selectedTopics.length > 0) {
      const titleLower = article.title?.toLowerCase() || '';
      const descLower = article.description?.toLowerCase() || '';
      
      for (const topic of selectedTopics) {
        const keywords = this.getTopicKeywords(topic);
        const matches = keywords.filter(keyword => 
          titleLower.includes(keyword.toLowerCase()) || 
          descLower.includes(keyword.toLowerCase())
        );
        
        topicMatch += matches.length / keywords.length;
      }
      topicMatch = Math.min(topicMatch / selectedTopics.length, 1);
    } else {
      // No preferences set, give equal weight to all
      topicMatch = 0.5;
    }
    
    // Location-based relevance
    const userLocation = preferences.location;
    if (userLocation.type === 'tourist' && article.category === 'Bali') {
      locationRelevance = 1.0;
    } else if (userLocation.type === 'expat' && 
               (article.category === 'Indonesia' || article.category === 'Bali')) {
      locationRelevance = 0.9;
    } else if (userLocation.type === 'local' && article.category === 'Indonesia') {
      locationRelevance = 0.8;
    } else if (userLocation.type === 'global' && article.category === 'BRICS') {
      locationRelevance = 0.9;
    }
    
    // Recency boost (articles from last 24 hours get bonus)
    const pubDate = new Date(article.pubDate);
    const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 24) {
      recencyBoost = Math.max(0, 1 - hoursAgo / 24) * 0.3;
    }
    
    // Source reliability based on our trusted sources
    const trustedSources = ['RT News', 'TASS', 'Xinhua News', 'Antara News', 'Al Jazeera'];
    if (trustedSources.includes(article.source)) {
      sourceReliability = 0.9;
    }
    
    // Calculate final relevance score
    const relevanceScore = (
      topicMatch * 0.4 +
      locationRelevance * 0.3 +
      sourceReliability * 0.2 +
      recencyBoost * 0.1
    );
    
    return {
      relevanceScore,
      topicMatch,
      locationRelevance,
      recencyBoost,
      sourceReliability,
    };
  }

  /**
   * Get keywords associated with a topic for content matching.
   * 
   * Args:
   *   topic (string): Topic name.
   * 
   * Returns:
   *   string[]: Array of relevant keywords.
   */
  private getTopicKeywords(topic: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'BRICS Economy': ['brics', 'economy', 'trade', 'economic', 'gdp', 'growth', 'investment'],
      'BRICS Politics': ['brics', 'politics', 'diplomatic', 'summit', 'alliance', 'cooperation'],
      'Indonesia Politics': ['indonesia', 'jakarta', 'politics', 'government', 'president', 'parliament'],
      'Indonesia Economy': ['indonesia', 'economy', 'economic', 'rupiah', 'trade', 'business'],
      'Bali Tourism': ['bali', 'tourism', 'tourist', 'travel', 'visit', 'vacation', 'ubud', 'denpasar'],
      'Bali Events': ['bali', 'event', 'festival', 'nyepi', 'galungan', 'ceremony', 'culture'],
      'Bali Culture': ['bali', 'culture', 'hindu', 'temple', 'tradition', 'art', 'balinese'],
      'Southeast Asia': ['asean', 'southeast asia', 'regional', 'asia pacific'],
      'Geopolitics': ['geopolitic', 'international', 'foreign policy', 'diplomatic', 'global'],
      'Trade & Business': ['trade', 'business', 'commerce', 'market', 'export', 'import'],
    };
    
    return keywordMap[topic] || [];
  }

  /**
   * Migrate preferences from older version.
   * 
   * Args:
   *   oldPreferences (any): Old preference structure.
   * 
   * Returns:
   *   UserPreferences: Migrated preferences.
   */
  private migratePreferences(oldPreferences: any): UserPreferences {
    // For now, reset to defaults and keep location if it exists
    const migrated = { ...this.defaultPreferences };
    
    if (oldPreferences.location) {
      migrated.location = oldPreferences.location;
    }
    
    if (oldPreferences.hasCompletedSetup) {
      migrated.hasCompletedSetup = oldPreferences.hasCompletedSetup;
      migrated.isFirstVisit = false;
    }
    
    this.savePreferences(migrated);
    return migrated;
  }

  /**
   * Reset all preferences to defaults.
   */
  resetPreferences(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(UserPreferencesManager.STORAGE_KEY);
    }
  }

  /**
   * Export preferences for backup/debugging.
   * 
   * Returns:
   *   string: JSON string of current preferences.
   */
  exportPreferences(): string {
    return JSON.stringify(this.loadPreferences(), null, 2);
  }
}

// Export singleton instance
export const userPreferencesManager = new UserPreferencesManager();

// Export class for custom instances
export { UserPreferencesManager };