/**
 * Unit tests for personalization system
 * Testing user preferences management and content scoring
 */

import { UserPreferencesManager } from '../lib/user-preferences';
import { ContentPersonalizationEngine } from '../lib/content-personalization';
import { Article } from '../lib/rss-parser';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// @ts-expect-error - Mock localStorage for testing
global.localStorage = localStorageMock;

// Sample articles for testing
const sampleArticles: Article[] = [
  {
    id: '1',
    title: 'BRICS Summit Discusses Economic Cooperation',
    description: 'Leaders discuss new trade agreements and economic partnerships',
    link: 'https://example.com/1',
    pubDate: new Date().toISOString(),
    category: 'BRICS',
    source: 'RT News',
    sourceUrl: 'https://rt.com',
  },
  {
    id: '2', 
    title: 'Bali Tourism Industry Shows Strong Recovery',
    description: 'Tourist arrivals in Bali increase by 40% this quarter',
    link: 'https://example.com/2',
    pubDate: new Date().toISOString(),
    category: 'Bali',
    source: 'Antara News',
    sourceUrl: 'https://antaranews.com',
  },
  {
    id: '3',
    title: 'Indonesia Announces New Infrastructure Projects',
    description: 'Government unveils plans for sustainable development across archipelago',
    link: 'https://example.com/3',
    pubDate: new Date().toISOString(),
    category: 'Indonesia',
    source: 'Antara News', 
    sourceUrl: 'https://antaranews.com',
  },
];

describe('UserPreferencesManager', () => {
  let preferencesManager: UserPreferencesManager;

  beforeEach(() => {
    preferencesManager = new UserPreferencesManager();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test('should load default preferences for first-time user', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const preferences = preferencesManager.loadPreferences();
    
    expect(preferences.isFirstVisit).toBe(true);
    expect(preferences.hasCompletedSetup).toBe(false);
    expect(preferences.location.type).toBe('unknown');
  });

  test('should save and load user preferences', () => {
    const testPreferences = {
      topics: {
        'BRICS Economy': true,
        'Bali Tourism': true,
        'BRICS Politics': false,
        'Indonesia Politics': false,
        'Indonesia Economy': false,
        'Bali Events': false,
        'Bali Culture': false,
        'Southeast Asia': false,
        'Geopolitics': false,
        'Trade & Business': false,
      },
      location: {
        type: 'tourist' as const,
        region: 'bali' as const,
      },
      isFirstVisit: false,
      hasCompletedSetup: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    preferencesManager.savePreferences(testPreferences);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'bali-report-preferences',
      expect.stringContaining('BRICS Economy')
    );
  });

  test('should get selected topics correctly', () => {
    const preferences = {
      topics: {
        'BRICS Economy': true,
        'Bali Tourism': true,
        'BRICS Politics': false,
        'Indonesia Politics': false,
        'Indonesia Economy': false,
        'Bali Events': false,
        'Bali Culture': false,
        'Southeast Asia': false,
        'Geopolitics': false,
        'Trade & Business': false,
      },
      location: { type: 'tourist' as const },
      isFirstVisit: false,
      hasCompletedSetup: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(preferences));
    
    const selectedTopics = preferencesManager.getSelectedTopics();
    
    expect(selectedTopics).toEqual(['BRICS Economy', 'Bali Tourism']);
  });

  test('should calculate content score correctly', () => {
    const preferences = {
      topics: {
        'BRICS Economy': true,
        'BRICS Politics': false,
        'Indonesia Politics': false,
        'Indonesia Economy': false,
        'Bali Tourism': true,
        'Bali Events': false,
        'Bali Culture': false,
        'Southeast Asia': false,
        'Geopolitics': false,
        'Trade & Business': false,
      },
      location: { type: 'tourist' as const },
      isFirstVisit: false,
      hasCompletedSetup: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(preferences));

    const bricsArticle = sampleArticles[0]; // BRICS economy article
    const baliArticle = sampleArticles[1]; // Bali tourism article

    const bricsScore = preferencesManager.calculateContentScore(bricsArticle);
    const baliScore = preferencesManager.calculateContentScore(baliArticle);

    // Bali article should score higher for a tourist
    expect(baliScore.locationRelevance).toBeGreaterThan(bricsScore.locationRelevance);
    expect(baliScore.relevanceScore).toBeGreaterThan(0.5);
  });
});

describe('ContentPersonalizationEngine', () => {
  let personalizationEngine: ContentPersonalizationEngine;

  beforeEach(() => {
    personalizationEngine = new ContentPersonalizationEngine();
    localStorageMock.getItem.mockClear();
  });

  test('should personalize content based on user preferences', () => {
    // Mock user with BRICS interests
    const preferences = {
      topics: {
        'BRICS Economy': true,
        'BRICS Politics': true,
        'Indonesia Politics': false,
        'Indonesia Economy': false,
        'Bali Tourism': false,
        'Bali Events': false,
        'Bali Culture': false,
        'Southeast Asia': false,
        'Geopolitics': true,
        'Trade & Business': false,
      },
      location: { type: 'global' as const },
      isFirstVisit: false,
      hasCompletedSetup: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(preferences));

    const personalizedArticles = personalizationEngine.personalizeContent(sampleArticles);

    // BRICS article should be ranked higher
    expect(personalizedArticles[0].category).toBe('BRICS');
    expect(personalizedArticles[0].score.relevanceScore).toBeGreaterThan(0.5);
  });

  test('should get featured articles correctly', () => {
    const featuredArticles = personalizationEngine.getFeaturedArticles(sampleArticles, 2);

    expect(featuredArticles).toHaveLength(2);
    expect(featuredArticles[0].score).toBeDefined();
  });

  test('should filter by category with personalization', () => {
    const bricsArticles = personalizationEngine.getPersonalizedByCategory(sampleArticles, 'BRICS');
    const baliArticles = personalizationEngine.getPersonalizedByCategory(sampleArticles, 'Bali');

    expect(bricsArticles.every(article => article.category === 'BRICS')).toBe(true);
    expect(baliArticles.every(article => article.category === 'Bali')).toBe(true);
  });

  test('should handle empty articles array', () => {
    const result = personalizationEngine.personalizeContent([]);
    expect(result).toEqual([]);

    const stats = personalizationEngine.getPersonalizationStats([]);
    expect(stats.totalArticles).toBe(0);
  });

  test('should generate personalization statistics', () => {
    const personalizedArticles = personalizationEngine.personalizeContent(sampleArticles);
    const stats = personalizationEngine.getPersonalizationStats(personalizedArticles);

    expect(stats.totalArticles).toBe(sampleArticles.length);
    expect(stats.averageRelevanceScore).toBeGreaterThanOrEqual(0);
    expect(stats.averageRelevanceScore).toBeLessThanOrEqual(1);
  });

  test('should check if personalization is enabled', () => {
    // Mock no preferences
    localStorageMock.getItem.mockReturnValue(null);
    expect(personalizationEngine.isPersonalizationEnabled()).toBe(false);

    // Mock user with completed setup
    const preferences = {
      topics: {
        'BRICS Economy': true,
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
      location: { type: 'global' as const },
      isFirstVisit: false,
      hasCompletedSetup: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(preferences));
    expect(personalizationEngine.isPersonalizationEnabled()).toBe(true);
  });
});

describe('Content Scoring Algorithm', () => {
  let preferencesManager: UserPreferencesManager;

  beforeEach(() => {
    preferencesManager = new UserPreferencesManager();
  });

  test('should give higher scores to matching topics', () => {
    const preferences = {
      topics: {
        'BRICS Economy': true,
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
      location: { type: 'global' as const },
      isFirstVisit: false,
      hasCompletedSetup: true,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(preferences));

    const bricsEconomyArticle = {
      ...sampleArticles[0],
      title: 'BRICS Economic Summit Announces New Trade Policies',
      description: 'Economic cooperation and trade agreements discussed by BRICS leaders',
    };

    const score = preferencesManager.calculateContentScore(bricsEconomyArticle);

    expect(score.topicMatch).toBeGreaterThan(0);
    expect(score.sourceReliability).toBe(0.9); // RT News is trusted source
  });

  test('should apply recency boost correctly', () => {
    const recentArticle = {
      ...sampleArticles[0],
      pubDate: new Date().toISOString(), // Very recent
    };

    const oldArticle = {
      ...sampleArticles[0],
      pubDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
    };

    const recentScore = preferencesManager.calculateContentScore(recentArticle);
    const oldScore = preferencesManager.calculateContentScore(oldArticle);

    expect(recentScore.recencyBoost).toBeGreaterThan(oldScore.recencyBoost);
  });
});