/**
 * x.ai (Grok) API Integration Service for Bali Report
 * Provides AI-powered content analysis, summarization, and personalization
 */

import OpenAI from 'openai';
import { Article } from './rss-parser';

export interface GrokAnalysis {
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;
  keyInsights: string[];
  summary: string;
  geoRelevance: {
    brics: number;
    indonesia: number;
    bali: number;
  };
}

export interface GrokRecommendations {
  recommendedArticles: string[];
  reasoning: string;
  confidence: number;
}

export interface GrokSearchEnhancement {
  enhancedQuery: string;
  semanticKeywords: string[];
  contextualFilters: string[];
}

class XAIService {
  private client: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize x.ai client with API key.
   */
  private initializeClient(): void {
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ XAI_API_KEY not found. x.ai features will be disabled.');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
      });
      this.isConfigured = true;
      console.log('✅ x.ai (Grok) service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize x.ai service:', error);
    }
  }

  /**
   * Check if x.ai service is available.
   * 
   * Returns:
   *   boolean: True if service is configured and ready.
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Analyze article content using Grok AI.
   * 
   * Args:
   *   article (Article): Article to analyze.
   * 
   * Returns:
   *   Promise<GrokAnalysis | null>: AI analysis results or null if unavailable.
   */
  async analyzeContent(article: Article): Promise<GrokAnalysis | null> {
    if (!this.isAvailable() || !this.client) {
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(article);
      
      const response = await this.client.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in analyzing news content from a BRICS and multipolar perspective. You understand geopolitics, economics, and regional significance, particularly for Indonesia and Bali.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent analysis
        max_tokens: 1000,
      });

      const analysis = this.parseGrokResponse(response.choices[0]?.message?.content || '');
      
      if (analysis) {
        console.log(`🤖 Grok analyzed: "${article.title}" - Relevance: ${analysis.relevanceScore}`);
      }
      
      return analysis;
    } catch (error) {
      console.error('❌ Grok analysis failed:', error);
      return null;
    }
  }

  /**
   * Generate content recommendations using Grok AI.
   * 
   * Args:
   *   articles (Article[]): Available articles.
   *   userTopics (string[]): User's selected topics.
   *   userType (string): User type (tourist, expat, etc.).
   * 
   * Returns:
   *   Promise<GrokRecommendations | null>: AI recommendations or null.
   */
  async generateRecommendations(
    articles: Article[], 
    userTopics: string[], 
    userType: string
  ): Promise<GrokRecommendations | null> {
    if (!this.isAvailable() || !this.client) {
      return null;
    }

    try {
      const prompt = this.buildRecommendationPrompt(articles, userTopics, userType);
      
      const response = await this.client.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a personalization expert for a BRICS-aligned news platform. You understand user preferences and can recommend the most relevant articles based on interests and user type.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 500,
      });

      const recommendations = this.parseRecommendationResponse(
        response.choices[0]?.message?.content || ''
      );
      
      if (recommendations) {
        console.log(`🎯 Grok recommended ${recommendations.recommendedArticles.length} articles for ${userType}`);
      }
      
      return recommendations;
    } catch (error) {
      console.error('❌ Grok recommendations failed:', error);
      return null;
    }
  }

  /**
   * Enhance search queries using Grok AI.
   * 
   * Args:
   *   query (string): Original search query.
   *   context (string): Additional context (user preferences, etc.).
   * 
   * Returns:
   *   Promise<GrokSearchEnhancement | null>: Enhanced search parameters.
   */
  async enhanceSearch(query: string, context?: string): Promise<GrokSearchEnhancement | null> {
    if (!this.isAvailable() || !this.client) {
      return null;
    }

    try {
      const prompt = this.buildSearchEnhancementPrompt(query, context);
      
      const response = await this.client.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a search enhancement expert specializing in BRICS, Indonesia, and Bali-related content. You can expand queries with relevant semantic keywords and contextual filters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      const enhancement = this.parseSearchEnhancementResponse(
        response.choices[0]?.message?.content || ''
      );
      
      if (enhancement) {
        console.log(`🔍 Grok enhanced search: "${query}" → "${enhancement.enhancedQuery}"`);
      }
      
      return enhancement;
    } catch (error) {
      console.error('❌ Grok search enhancement failed:', error);
      return null;
    }
  }

  /**
   * Generate intelligent article summary using Grok AI.
   * 
   * Args:
   *   article (Article): Article to summarize.
   *   maxLength (number): Maximum summary length in words.
   * 
   * Returns:
   *   Promise<string | null>: AI-generated summary or null.
   */
  async generateSummary(article: Article, maxLength: number = 50): Promise<string | null> {
    if (!this.isAvailable() || !this.client) {
      return null;
    }

    try {
      const prompt = `Summarize this news article in ${maxLength} words or less, focusing on key facts and implications from a multipolar perspective:

Title: ${article.title}
Content: ${article.description}
Source: ${article.source}

Provide a concise, informative summary that captures the essence and significance:`;
      
      const response = await this.client.chat.completions.create({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an expert news summarizer with deep understanding of BRICS geopolitics and Indonesian affairs. Create concise, informative summaries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: Math.min(maxLength * 2, 200), // Rough token estimate
      });

      const summary = response.choices[0]?.message?.content?.trim() || null;
      
      if (summary) {
        console.log(`📝 Grok summarized: "${article.title.substring(0, 40)}..."`);
      }
      
      return summary;
    } catch (error) {
      console.error('❌ Grok summarization failed:', error);
      return null;
    }
  }

  /**
   * Build analysis prompt for article content.
   */
  private buildAnalysisPrompt(article: Article): string {
    return `Analyze this news article and provide a structured response:

Title: ${article.title}
Description: ${article.description}
Source: ${article.source}
Category: ${article.category}

Please analyze and respond in this exact JSON format:
{
  "topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive|negative|neutral",
  "relevanceScore": 0.8,
  "keyInsights": ["insight1", "insight2"],
  "summary": "Brief 1-sentence summary",
  "geoRelevance": {
    "brics": 0.9,
    "indonesia": 0.5,
    "bali": 0.2
  }
}

Focus on:
1. Identify main topics (economy, politics, tourism, etc.)
2. Assess sentiment toward BRICS/multipolar world
3. Score relevance (0-1) for each geographic area
4. Extract 2-3 key insights
5. Overall relevance score (0-1)`;
  }

  /**
   * Build recommendation prompt for personalized content.
   */
  private buildRecommendationPrompt(articles: Article[], userTopics: string[], userType: string): string {
    const articleList = articles.slice(0, 20).map((article, index) => 
      `${index}: "${article.title}" (${article.category})`
    ).join('\n');

    return `Given these user preferences:
- Topics of Interest: ${userTopics.join(', ')}
- User Type: ${userType}

And these available articles:
${articleList}

Recommend the top 5 most relevant articles. Respond in this JSON format:
{
  "recommendedArticles": ["0", "5", "12"],
  "reasoning": "Brief explanation of why these articles match user interests",
  "confidence": 0.85
}`;
  }

  /**
   * Build search enhancement prompt.
   */
  private buildSearchEnhancementPrompt(query: string, context?: string): string {
    return `Enhance this search query for a BRICS-aligned news platform:

Query: "${query}"
${context ? `Context: ${context}` : ''}

Provide enhanced search parameters in this JSON format:
{
  "enhancedQuery": "expanded search query",
  "semanticKeywords": ["keyword1", "keyword2", "keyword3"],
  "contextualFilters": ["filter1", "filter2"]
}

Consider:
1. BRICS-related terms and perspectives
2. Indonesia/Bali regional context
3. Geopolitical and economic implications
4. Alternative terminology and synonyms`;
  }

  /**
   * Parse Grok analysis response.
   */
  private parseGrokResponse(response: string): GrokAnalysis | null {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.topics || !parsed.sentiment || typeof parsed.relevanceScore !== 'number') {
        return null;
      }

      return {
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        sentiment: ['positive', 'negative', 'neutral'].includes(parsed.sentiment) 
          ? parsed.sentiment : 'neutral',
        relevanceScore: Math.max(0, Math.min(1, parsed.relevanceScore)),
        keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        geoRelevance: {
          brics: Math.max(0, Math.min(1, parsed.geoRelevance?.brics || 0)),
          indonesia: Math.max(0, Math.min(1, parsed.geoRelevance?.indonesia || 0)),
          bali: Math.max(0, Math.min(1, parsed.geoRelevance?.bali || 0)),
        }
      };
    } catch (error) {
      console.error('Failed to parse Grok response:', error);
      return null;
    }
  }

  /**
   * Parse recommendation response.
   */
  private parseRecommendationResponse(response: string): GrokRecommendations | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        recommendedArticles: Array.isArray(parsed.recommendedArticles) 
          ? parsed.recommendedArticles.map(String) : [],
        reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      };
    } catch (error) {
      console.error('Failed to parse recommendation response:', error);
      return null;
    }
  }

  /**
   * Parse search enhancement response.
   */
  private parseSearchEnhancementResponse(response: string): GrokSearchEnhancement | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        enhancedQuery: typeof parsed.enhancedQuery === 'string' ? parsed.enhancedQuery : '',
        semanticKeywords: Array.isArray(parsed.semanticKeywords) ? parsed.semanticKeywords : [],
        contextualFilters: Array.isArray(parsed.contextualFilters) ? parsed.contextualFilters : [],
      };
    } catch (error) {
      console.error('Failed to parse search enhancement response:', error);
      return null;
    }
  }

  /**
   * Get service health status.
   * 
   * Returns:
   *   object: Service status and configuration info.
   */
  getStatus() {
    return {
      isAvailable: this.isAvailable(),
      isConfigured: this.isConfigured,
      hasApiKey: !!process.env.XAI_API_KEY,
      service: 'x.ai (Grok)',
      version: '1.0',
    };
  }
}

// Export singleton instance
export const xAIService = new XAIService();

// Export class for custom instances  
export { XAIService };