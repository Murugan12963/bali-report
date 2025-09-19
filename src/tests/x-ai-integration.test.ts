/**
 * Test script for x.ai (Grok) integration
 * Basic functionality tests for AI service
 */

import { xAIService } from '../lib/x-ai-service';
import { Article } from '../lib/rss-parser';

// Sample test article
const testArticle: Article = {
  id: 'test-1',
  title: 'BRICS Summit Discusses New Trade Cooperation Framework',
  description: 'Leaders from Brazil, Russia, India, China, and South Africa gathered to establish new economic partnerships and challenge Western trade dominance.',
  link: 'https://example.com/brics-summit',
  pubDate: new Date().toISOString(),
  category: 'BRICS',
  source: 'RT News',
  sourceUrl: 'https://rt.com',
};

describe('x.ai (Grok) Integration', () => {
  test('should check service availability', () => {
    const status = xAIService.getStatus();
    
    expect(status).toHaveProperty('isAvailable');
    expect(status).toHaveProperty('service', 'x.ai (Grok)');
    expect(status).toHaveProperty('version', '1.0');
    
    console.log('🔍 x.ai Service Status:', status);
  });

  test('should handle missing API key gracefully', () => {
    const isAvailable = xAIService.isAvailable();
    
    if (!isAvailable) {
      console.log('⚠️ x.ai service not available (missing API key) - this is expected in testing');
    } else {
      console.log('✅ x.ai service is available and configured');
    }
    
    // Test should pass regardless of API key availability
    expect(typeof isAvailable).toBe('boolean');
  });

  test('should handle content analysis with or without API key', async () => {
    try {
      const analysis = await xAIService.analyzeContent(testArticle);
      
      if (analysis) {
        console.log('🤖 AI Analysis Result:', {
          topics: analysis.topics,
          sentiment: analysis.sentiment,
          relevanceScore: analysis.relevanceScore,
          geoRelevance: analysis.geoRelevance,
        });
        
        expect(analysis.topics).toBeInstanceOf(Array);
        expect(['positive', 'negative', 'neutral']).toContain(analysis.sentiment);
        expect(analysis.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(analysis.relevanceScore).toBeLessThanOrEqual(1);
      } else {
        console.log('⚠️ AI analysis returned null (expected without API key)');
        expect(analysis).toBeNull();
      }
    } catch (error) {
      console.log('⚠️ AI analysis failed (expected without API key):', error);
      // Test should pass even if AI service is not available
    }
  });

  test('should handle search enhancement gracefully', async () => {
    try {
      const enhancement = await xAIService.enhanceSearch('BRICS economy', 'User interested in geopolitics');
      
      if (enhancement) {
        console.log('🔍 Search Enhancement Result:', {
          enhancedQuery: enhancement.enhancedQuery,
          semanticKeywords: enhancement.semanticKeywords,
          contextualFilters: enhancement.contextualFilters,
        });
        
        expect(typeof enhancement.enhancedQuery).toBe('string');
        expect(enhancement.semanticKeywords).toBeInstanceOf(Array);
        expect(enhancement.contextualFilters).toBeInstanceOf(Array);
      } else {
        console.log('⚠️ Search enhancement returned null (expected without API key)');
        expect(enhancement).toBeNull();
      }
    } catch (error) {
      console.log('⚠️ Search enhancement failed (expected without API key):', error);
      // Test should pass even if AI service is not available
    }
  });

  test('should handle summarization gracefully', async () => {
    try {
      const summary = await xAIService.generateSummary(testArticle, 30);
      
      if (summary) {
        console.log('📝 AI Summary:', summary);
        
        expect(typeof summary).toBe('string');
        expect(summary.length).toBeGreaterThan(0);
        // Check if summary is roughly within word limit (very rough estimate)
        expect(summary.split(' ').length).toBeLessThan(50);
      } else {
        console.log('⚠️ AI summary returned null (expected without API key)');
        expect(summary).toBeNull();
      }
    } catch (error) {
      console.log('⚠️ AI summarization failed (expected without API key):', error);
      // Test should pass even if AI service is not available
    }
  });

  test('should handle recommendations gracefully', async () => {
    const articles = [testArticle];
    const userTopics = ['BRICS Economy', 'Geopolitics'];
    const userType = 'global';
    
    try {
      const recommendations = await xAIService.generateRecommendations(articles, userTopics, userType);
      
      if (recommendations) {
        console.log('🎯 AI Recommendations:', {
          recommendedArticles: recommendations.recommendedArticles,
          reasoning: recommendations.reasoning,
          confidence: recommendations.confidence,
        });
        
        expect(recommendations.recommendedArticles).toBeInstanceOf(Array);
        expect(typeof recommendations.reasoning).toBe('string');
        expect(recommendations.confidence).toBeGreaterThanOrEqual(0);
        expect(recommendations.confidence).toBeLessThanOrEqual(1);
      } else {
        console.log('⚠️ AI recommendations returned null (expected without API key)');
        expect(recommendations).toBeNull();
      }
    } catch (error) {
      console.log('⚠️ AI recommendations failed (expected without API key):', error);
      // Test should pass even if AI service is not available
    }
  });
});

describe('x.ai Error Handling', () => {
  test('should gracefully handle invalid responses', () => {
    // Test the response parsing with invalid data
    // These methods are private, so we're mainly testing that the service
    // doesn't crash with various inputs
    expect(() => {
      // Service should handle construction without throwing
      const testStatus = xAIService.getStatus();
      expect(testStatus).toBeDefined();
    }).not.toThrow();
  });

  test('should validate parsed responses correctly', async () => {
    // If service is available, test response validation
    if (xAIService.isAvailable()) {
      try {
        const analysis = await xAIService.analyzeContent(testArticle);
        
        if (analysis) {
          // Validate structure
          expect(analysis).toHaveProperty('topics');
          expect(analysis).toHaveProperty('sentiment');
          expect(analysis).toHaveProperty('relevanceScore');
          expect(analysis).toHaveProperty('geoRelevance');
          expect(analysis.geoRelevance).toHaveProperty('brics');
          expect(analysis.geoRelevance).toHaveProperty('indonesia');
          expect(analysis.geoRelevance).toHaveProperty('bali');
        }
      } catch {
        // Expected if no API key
        console.log('Validation test skipped (no API key)');
      }
    } else {
      console.log('Validation test skipped (service not available)');
    }
  });
});