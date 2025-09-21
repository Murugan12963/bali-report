/**
 * Content Personalization System for Bali Report
 * Handles intelligent article ranking and filtering based on user preferences
 */

import { Article } from './rss-parser';
import { userPreferencesManager, ContentScore } from './user-preferences';
import { xAIService, GrokAnalysis } from './x-ai-service';

export interface PersonalizedArticle extends Article {
  score: ContentScore;
  personalizedRank: number;
  grokAnalysis?: GrokAnalysis;
  aiSummary?: string;
}

export interface PersonalizationStats {
  totalArticles: number;
  personalizedArticles: number;
  topicMatchCount: number;
  locationRelevantCount: number;
  averageRelevanceScore: number;
  topTopics: string[];
}

class ContentPersonalizationEngine {
  /**
   * Personalize and rank articles based on user preferences with optional AI enhancement.
   * 
   * Args:
   *   articles (Article[]): Raw articles from RSS sources.
   *   maxResults (number): Maximum number of articles to return.
   *   useAI (boolean): Whether to enhance with Grok AI analysis.
   * 
   * Returns:
   *   Promise<PersonalizedArticle[]>: Sorted and scored articles.
   */
  async personalizeContent(
    articles: Article[], 
    maxResults?: number, 
    useAI: boolean = false
  ): Promise<PersonalizedArticle[]> {
    // Check if we should disable AI (during build phase or if explicitly disabled)
    const disableAI = process.env.DISABLE_AI_AT_BUILD === 'true';
    const shouldUseAI = useAI && !disableAI;
    
    // Calculate relevance scores for each article
    const scoredArticles: PersonalizedArticle[] = await Promise.all(
      articles.map(async (article, index) => {
        const score = userPreferencesManager.calculateContentScore(article);
        let grokAnalysis: GrokAnalysis | undefined;
        let aiSummary: string | undefined;
        
        // Enhance with Grok AI if available and requested (but not during build)
        if (shouldUseAI && xAIService.isAvailable()) {
          try {
            // Only analyze high-scoring articles to save API calls
            if (score.relevanceScore > 0.4) {
              const analysis = await xAIService.analyzeContent(article);
              grokAnalysis = analysis || undefined;
              
              // If Grok analysis is available, enhance the score
              if (grokAnalysis) {
                // Boost score based on Grok's relevance assessment
                score.relevanceScore = Math.min(
                  score.relevanceScore * 0.7 + grokAnalysis.relevanceScore * 0.3,
                  1.0
                );
                
                // Use Grok's geo-relevance for location scoring
                const preferences = userPreferencesManager.loadPreferences();
                if (preferences.location.type === 'tourist' && grokAnalysis.geoRelevance.bali > 0.5) {
                  score.relevanceScore += 0.1;
                } else if (preferences.location.type === 'expat' && grokAnalysis.geoRelevance.indonesia > 0.5) {
                  score.relevanceScore += 0.1;
                } else if (preferences.location.type === 'global' && grokAnalysis.geoRelevance.brics > 0.5) {
                  score.relevanceScore += 0.1;
                }
                
                score.relevanceScore = Math.min(score.relevanceScore, 1.0);
              }
            }
          } catch (error) {
            console.error('Grok enhancement failed:', error);
            // Continue without AI enhancement
          }
        }
        
        return {
          ...article,
          score,
          personalizedRank: index, // Will be updated after sorting
          grokAnalysis,
          aiSummary,
        };
      })
    );

    // Sort by relevance score (highest first)
    scoredArticles.sort((a, b) => b.score.relevanceScore - a.score.relevanceScore);

    // Update personalized rank after sorting
    scoredArticles.forEach((article, index) => {
      article.personalizedRank = index + 1;
    });

    // Apply max results limit if specified
    if (maxResults && maxResults > 0) {
      return scoredArticles.slice(0, maxResults);
    }

    return scoredArticles;
  }

  /**
   * Get personalization statistics for analytics and debugging.
   * 
   * Args:
   *   personalizedArticles (PersonalizedArticle[]): Personalized article array.
   * 
   * Returns:
   *   PersonalizationStats: Statistics about personalization effectiveness.
   */
  getPersonalizationStats(personalizedArticles: PersonalizedArticle[]): PersonalizationStats {
    if (personalizedArticles.length === 0) {
      return {
        totalArticles: 0,
        personalizedArticles: 0,
        topicMatchCount: 0,
        locationRelevantCount: 0,
        averageRelevanceScore: 0,
        topTopics: [],
      };
    }

    const preferences = userPreferencesManager.loadPreferences();
    const selectedTopics = userPreferencesManager.getSelectedTopics();

    const topicMatchCount = personalizedArticles.filter(
      article => article.score.topicMatch > 0.3
    ).length;

    const locationRelevantCount = personalizedArticles.filter(
      article => article.score.locationRelevance > 0.6
    ).length;

    const totalRelevanceScore = personalizedArticles.reduce(
      (sum, article) => sum + article.score.relevanceScore, 0
    );

    const averageRelevanceScore = totalRelevanceScore / personalizedArticles.length;

    return {
      totalArticles: personalizedArticles.length,
      personalizedArticles: personalizedArticles.filter(
        article => article.score.relevanceScore > 0.5
      ).length,
      topicMatchCount,
      locationRelevantCount,
      averageRelevanceScore: Math.round(averageRelevanceScore * 100) / 100,
      topTopics: selectedTopics.slice(0, 5),
    };
  }

  /**
   * Get featured articles based on personalization and recency with AI enhancement.
   * 
   * Args:
   *   articles (Article[]): Raw articles from RSS sources.
   *   count (number): Number of featured articles to return.
   * 
   * Returns:
   *   Promise<PersonalizedArticle[]>: Top featured articles.
   */
  async getFeaturedArticles(articles: Article[], count: number = 3): Promise<PersonalizedArticle[]> {
    // Disable AI if flag is set (during build phase to prevent excessive API calls)
    const disableAI = process.env.DISABLE_AI_AT_BUILD === 'true';
    const useAI = !disableAI && process.env.XAI_API_KEY ? true : false;
    
    // Use AI enhancement for featured articles only in runtime, not build time
    const personalizedArticles = await this.personalizeContent(articles, undefined, useAI);
    
    // Boost articles from last 6 hours for featured section
    const featuredArticles = personalizedArticles.map(article => {
      const pubDate = new Date(article.pubDate);
      const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 6) {
        // Boost recent articles for featured section
        article.score.relevanceScore += 0.2;
      }
      
      // Additional boost for AI-analyzed content with high sentiment
      if (article.grokAnalysis && article.grokAnalysis.sentiment === 'positive') {
        article.score.relevanceScore += 0.05;
      }
      
      return article;
    });

    // Re-sort with featured boost
    featuredArticles.sort((a, b) => b.score.relevanceScore - a.score.relevanceScore);

    return featuredArticles.slice(0, count);
  }

  /**
   * Filter articles by category with personalization.
   * 
   * Args:
   *   articles (Article[]): Raw articles from RSS sources.
   *   category ('BRICS' | 'Indonesia' | 'Bali'): Category to filter by.
   * 
   * Returns:
   *   Promise<PersonalizedArticle[]>: Filtered and personalized articles.
   */
  async getPersonalizedByCategory(
    articles: Article[], 
    category: 'BRICS' | 'Indonesia' | 'Bali'
  ): Promise<PersonalizedArticle[]> {
    // Filter by category first
    const categoryArticles = articles.filter(article => article.category === category);
    
    // Apply personalization
    const personalizedArticles = await this.personalizeContent(categoryArticles);
    
    // If user has strong preference for this category, boost all articles
    const isInterestedInCategory = userPreferencesManager.isInterestedInCategory(category);
    if (isInterestedInCategory) {
      personalizedArticles.forEach(article => {
        article.score.relevanceScore = Math.min(article.score.relevanceScore + 0.1, 1.0);
      });
      
      // Re-sort after boosting
      personalizedArticles.sort((a, b) => b.score.relevanceScore - a.score.relevanceScore);
    }
    
    return personalizedArticles;
  }

  /**
   * Get AI-enhanced personalized search results with intelligent ranking.
   * 
   * Args:
   *   articles (Article[]): Raw articles from RSS sources.
   *   query (string): Search query.
   * 
   * Returns:
   *   Promise<PersonalizedArticle[]>: Search results with AI-enhanced ranking.
   */
  async getPersonalizedSearchResults(articles: Article[], query: string): Promise<PersonalizedArticle[]> {
    const queryLower = query.toLowerCase().trim();
    if (!queryLower) return [];

    let enhancedKeywords = [queryLower];
    let searchContext = '';
    
    // Try AI-powered search enhancement first
    if (xAIService.isAvailable()) {
      try {
        const preferences = userPreferencesManager.loadPreferences();
        const userTopics = userPreferencesManager.getSelectedTopics();
        const context = `User type: ${preferences.location.type}, Interests: ${userTopics.join(', ')}`;
        
        const enhancement = await xAIService.enhanceSearch(query, context);
        
        if (enhancement) {
          enhancedKeywords = [queryLower, enhancement.enhancedQuery.toLowerCase(), ...enhancement.semanticKeywords.map(k => k.toLowerCase())];
          searchContext = enhancement.enhancedQuery;
          console.log(`🔍 Grok enhanced search: "${query}" → "${enhancement.enhancedQuery}" + ${enhancement.semanticKeywords.length} keywords`);
        }
      } catch (error) {
        console.error('AI search enhancement failed, using standard search:', error);
      }
    }

    // Enhanced search filtering with AI keywords
    const searchResults = articles.filter(article => {
      const titleLower = article.title.toLowerCase();
      const descLower = article.description.toLowerCase();
      const sourceLower = article.source.toLowerCase();
      
      return enhancedKeywords.some(keyword => 
        titleLower.includes(keyword) || 
        descLower.includes(keyword) || 
        sourceLower.includes(keyword)
      );
    });

    // Apply personalization to search results with AI enhancement
    const personalizedResults = await this.personalizeContent(searchResults, undefined, true);

    // Additional search relevance scoring with AI keywords
    personalizedResults.forEach(article => {
      let searchRelevance = 0;
      const titleLower = article.title.toLowerCase();
      const descLower = article.description.toLowerCase();

      // Exact phrase match gets highest boost
      if (titleLower.includes(queryLower)) {
        searchRelevance += 0.3;
      }
      
      // Enhanced keywords matching
      enhancedKeywords.forEach((keyword, index) => {
        const weight = index === 0 ? 0.3 : index === 1 ? 0.2 : 0.1; // Original query gets highest weight
        if (titleLower.includes(keyword)) searchRelevance += weight;
        if (descLower.includes(keyword)) searchRelevance += weight * 0.5;
      });
      
      // Boost AI-analyzed articles that match search intent
      if (article.grokAnalysis) {
        const grokTopics = article.grokAnalysis.topics.map(t => t.toLowerCase());
        if (grokTopics.some(topic => enhancedKeywords.some(keyword => topic.includes(keyword)))) {
          searchRelevance += 0.15;
        }
      }

      // Apply search relevance to personalization score
      article.score.relevanceScore = Math.min(
        article.score.relevanceScore + searchRelevance, 
        1.0
      );
    });

    // Re-sort with enhanced search boost
    personalizedResults.sort((a, b) => b.score.relevanceScore - a.score.relevanceScore);

    return personalizedResults;
  }

  /**
   * Export personalization metrics for analytics.
   * 
   * Returns:
   *   object: User preferences and personalization settings.
   */
  exportPersonalizationMetrics() {
    const preferences = userPreferencesManager.loadPreferences();
    const selectedTopics = userPreferencesManager.getSelectedTopics();
    
    return {
      hasPersonalization: preferences.hasCompletedSetup,
      userType: preferences.location.type,
      selectedTopicsCount: selectedTopics.length,
      topTopics: selectedTopics.slice(0, 3),
      lastUpdated: preferences.lastUpdated,
      version: preferences.version,
    };
  }

  /**
   * Check if personalization is enabled and configured.
   * 
   * Returns:
   *   boolean: True if user has completed personalization setup.
   */
  isPersonalizationEnabled(): boolean {
    const preferences = userPreferencesManager.loadPreferences();
    return preferences.hasCompletedSetup && 
           userPreferencesManager.getSelectedTopics().length > 0;
  }

  /**
   * Get AI-powered recommended articles for "You might like" section.
   * 
   * Args:
   *   articles (Article[]): All available articles.
   *   excludeArticleIds (string[]): Article IDs to exclude.
   *   count (number): Number of recommendations to return.
   * 
   * Returns:
   *   Promise<PersonalizedArticle[]>: Recommended articles.
   */
  async getRecommendedArticles(
    articles: Article[], 
    excludeArticleIds: string[] = [], 
    count: number = 5
  ): Promise<PersonalizedArticle[]> {
    // Filter out excluded articles
    const availableArticles = articles.filter(
      article => !excludeArticleIds.includes(article.id)
    );

    // Get user preferences for AI recommendations
    const userTopics = userPreferencesManager.getSelectedTopics();
    const preferences = userPreferencesManager.loadPreferences();
    
    // Try AI-powered recommendations first
    if (xAIService.isAvailable() && userTopics.length > 0) {
      try {
        const grokRecommendations = await xAIService.generateRecommendations(
          availableArticles.slice(0, 50), // Limit for API efficiency
          userTopics,
          preferences.location.type
        );
        
        if (grokRecommendations && grokRecommendations.recommendedArticles.length > 0) {
          const recommendedArticles = grokRecommendations.recommendedArticles
            .map(index => availableArticles[parseInt(index)])
            .filter(Boolean)
            .slice(0, count);
          
          // Convert to PersonalizedArticle format
          const personalizedRecommendations = await Promise.all(
            recommendedArticles.map(async (article, index) => {
              const score = userPreferencesManager.calculateContentScore(article);
              return {
                ...article,
                score,
                personalizedRank: index + 1,
              } as PersonalizedArticle;
            })
          );
          
          console.log(`🤖 Grok recommended ${personalizedRecommendations.length} articles: ${grokRecommendations.reasoning}`);
          return personalizedRecommendations;
        }
      } catch (error) {
        console.error('AI recommendations failed, falling back to standard:', error);
      }
    }

    // Fallback to standard personalization
    const personalizedArticles = await this.personalizeContent(availableArticles);

    // Focus on high-scoring, topic-relevant articles
    const recommendations = personalizedArticles
      .filter(article => 
        article.score.topicMatch > 0.4 || 
        article.score.locationRelevance > 0.7
      )
      .slice(0, count);

    return recommendations;
  }
}

// Export singleton instance
export const contentPersonalizationEngine = new ContentPersonalizationEngine();

// Export class for custom instances
export { ContentPersonalizationEngine };