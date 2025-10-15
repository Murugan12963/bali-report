/**
 * Enhanced Grok/X.AI API Integration Service for Bali Report
 * Comprehensive implementation with real-time search, tool calling, and BPD-aligned features
 * Compliant with Indonesian regulations and BRICS Partnership for Development values
 */

import OpenAI from 'openai';
import { Article } from './rss-parser';
import { getEnv, getBooleanEnv } from './env';

type GrokModel = 'grok-4' | 'grok-4-fast-non-reasoning' | 'grok-vision-4-preview';

// Enhanced interfaces for comprehensive functionality
export interface GrokXInsight {
  query: string;
  tweets: XTweet[];
  analysis: string;
  bricsRelevance: number;
  sustainabilityScore: number;
  multipolarPerspective: string;
}

export interface XTweet {
  id: string;
  text: string;
  author: string;
  engagement: number;
  timestamp: string;
  url: string;
}

export interface PersonalizedRecommendation {
  articles: Article[];
  reasoning: string;
  inclusivityScore: number; // BPD inclusiveness metric
  multipolarBalance: number; // Balanced perspective score
  bpdAlignment: {
    mutualRespect: number;
    equality: number;
    inclusiveness: number;
    multipolarity: number;
    sustainability: number;
  };
}

export interface OpinionEssay {
  title: string;
  content: string;
  perspective: 'contrarian' | 'balanced' | 'analysis';
  wordCount: number;
  sources: string[];
  bpdValues: {
    mutualRespect: boolean;
    challengesHegemony: boolean;
    promotesSouthSouth: boolean;
  };
  readingTime: number;
}

export interface VideoEnrichment {
  title: string;
  description: string;
  altText: string;
  sustainabilityTags: string[];
  baliConnection: string;
  accessibilityDescription: string;
  keyMoments: {
    timestamp: string;
    description: string;
  }[];
}

export interface SocialThreads {
  threads: TwitterThread[];
  scheduledTimes: string[];
  hashtags: string[];
  engagementPrediction: number;
}

export interface TwitterThread {
  id: string;
  tweets: string[];
  totalCharacters: number;
  hashtagSet: string[];
  bpdPromoting: boolean;
}

export interface GrokToolCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

class EnhancedGrokService {
  private client: OpenAI | null = null;
  private isConfigured: boolean = false;
  private rateLimiter: Map<string, number> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour
  private readonly RATE_LIMIT = 100; // requests per hour

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize enhanced Grok client with comprehensive configuration
   */
  private initializeClient(): void {
    const apiKey = getEnv('XAI_API_KEY');
    const xBearerToken = getEnv('X_BEARER_TOKEN');
    
    if (!apiKey) {
      console.warn('⚠️ XAI_API_KEY not found. Enhanced Grok features disabled.');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey,
        baseURL: 'https://api.x.ai/v1',
        defaultHeaders: {
          'User-Agent': 'BaliReport/1.0 (+https://bali.report)',
          ...(xBearerToken && { 'X-Bearer-Token': xBearerToken })
        }
      });
      this.isConfigured = true;
      console.log('✅ Enhanced Grok service initialized with X.AI and Twitter API access');
    } catch (error) {
      console.error('❌ Failed to initialize enhanced Grok service:', error);
    }
  }

  /**
   * Check rate limits and cache for efficient API usage
   */
  private async checkRateLimitAndCache<T>(
    cacheKey: string,
    operation: () => Promise<T>
  ): Promise<T | null> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`📋 Using cached result for: ${cacheKey}`);
      return cached.data as T;
    }

    // Check rate limits
    const hourKey = Math.floor(Date.now() / 3600000).toString();
    const currentCount = this.rateLimiter.get(hourKey) || 0;
    
    if (currentCount >= this.RATE_LIMIT) {
      console.warn('⚠️ Grok API rate limit reached. Using cached data or fallback.');
      return cached?.data as T || null;
    }

    try {
      const result = await operation();
      
      // Update rate limiter
      this.rateLimiter.set(hourKey, currentCount + 1);
      
      // Cache result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('❌ Grok API operation failed:', error);
      return cached?.data as T || null;
    }
  }

  /**
   * Enhanced Content Aggregation with Social Insights
   * Pulls X insights with BRICS queries and blends with RSS feeds
   */
  async getSocialInsights(category: 'brics' | 'indonesia' | 'bali'): Promise<GrokXInsight[]> {
    if (!this.isAvailable()) {
      return [];
    }

    const queries = this.getBricsQueries(category);
    const insights: GrokXInsight[] = [];

    for (const query of queries) {
      const cacheKey = `social_insights_${category}_${query}`;
      
      const insight = await this.checkRateLimitAndCache(cacheKey, async () => {
        return await this.fetchXInsightsWithGrok(query);
      });

      if (insight) {
        insights.push(insight);
      }
    }

    console.log(`🌐 Retrieved ${insights.length} social insights for ${category}`);
    return insights;
  }

  /**
   * Generate BRICS-aligned queries for different categories
   */
  private getBricsQueries(category: string): string[] {
    const baseQueries = {
      brics: [
        'BRICS sustainable development lang:id min_faves:5',
        'China Belt Road Initiative Indonesia min_faves:10',
        'Russia multipolar world order min_faves:5',
        'India South-South cooperation min_faves:5',
        'Brazil BRICS partnership lang:en min_faves:5'
      ],
      indonesia: [
        'Indonesia BRICS membership lang:id min_faves:5',
        'Jakarta multipolar diplomacy min_faves:5',
        'Indonesia China partnership min_faves:10',
        'Indonesian sovereignty lang:id min_faves:5'
      ],
      bali: [
        'Bali sustainable tourism min_faves:5',
        'Bali G20 summit results min_faves:10',
        'Bali cultural preservation lang:id min_faves:5',
        'Denpasar development projects min_faves:5'
      ]
    };

    return baseQueries[category as keyof typeof baseQueries] || baseQueries.brics;
  }

  /**
   * Fetch X insights using Grok with real-time search capabilities
   */
  private async fetchXInsightsWithGrok(query: string): Promise<GrokXInsight> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are an AI assistant with access to real-time X/Twitter data. 
    Analyze social media insights for BRICS-aligned news platform focusing on:
    1. Mutual respect and equality among nations
    2. Multipolar world order perspectives  
    3. Sustainable development goals
    4. South-South cooperation initiatives
    
    Provide analysis that challenges Western media monopoly while maintaining journalistic integrity.`;

    const userPrompt = `Search X/Twitter for: "${query}"
    
    Analyze the social media conversation and provide:
    1. Key tweets that represent diverse multipolar perspectives
    2. Analysis of sentiment toward BRICS values
    3. Sustainability-focused discussions
    4. Emerging themes that support South-South cooperation
    
    Format response as JSON with tweets array and analysis.`;

    const response = await this.client.chat.completions.create({
      model: 'grok-4' as GrokModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'search_twitter',
            description: 'Search Twitter/X for real-time insights',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string' },
                count: { type: 'integer', default: 10 },
                lang: { type: 'string', default: 'en' }
              }
            }
          }
        }
      ],
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 2000
    });

    return this.parseXInsightResponse(response, query);
  }

  /**
   * Parse X insight response from Grok
   */
  private parseXInsightResponse(response: any, originalQuery: string): GrokXInsight {
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      
      return {
        query: originalQuery,
        tweets: parsed.tweets || [],
        analysis: parsed.analysis || 'No analysis available',
        bricsRelevance: parsed.bricsRelevance || 0.5,
        sustainabilityScore: parsed.sustainabilityScore || 0.5,
        multipolarPerspective: parsed.multipolarPerspective || 'Balanced perspective on global cooperation'
      };
    } catch (error) {
      console.error('Failed to parse X insight response:', error);
      return {
        query: originalQuery,
        tweets: [],
        analysis: 'Analysis unavailable',
        bricsRelevance: 0.5,
        sustainabilityScore: 0.5,
        multipolarPerspective: 'Multipolar cooperation promotes mutual understanding'
      };
    }
  }

  /**
   * Generate Personalized Feeds with BPD Values
   * Analyzes user preferences to recommend inclusive, multipolar content
   */
  async generatePersonalizedFeed(
    articles: Article[],
    userPreferences: any,
    userLocation?: string
  ): Promise<PersonalizedRecommendation> {
    if (!this.isAvailable()) {
      return this.getFallbackRecommendations(articles);
    }

    const cacheKey = `personalized_feed_${JSON.stringify(userPreferences)}`;

    const recommendation = await this.checkRateLimitAndCache(cacheKey, async () => {
      return await this.generateBpdAlignedRecommendations(articles, userPreferences, userLocation);
    });

    return recommendation || this.getFallbackRecommendations(articles);
  }

  /**
   * Generate BPD-aligned recommendations using Grok
   */
  private async generateBpdAlignedRecommendations(
    articles: Article[],
    userPreferences: any,
    userLocation?: string
  ): Promise<PersonalizedRecommendation> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are a personalization AI for a BRICS Partnership for Development (BPD) aligned news platform.
    
    BPD Core Values:
    1. Mutual Respect: Equal treatment of all nations and perspectives
    2. Equality: Fair representation across different viewpoints
    3. Inclusiveness: Diverse voices from Global South
    4. Multipolarity: Multiple centers of power and influence
    5. Sustainable Development: Long-term environmental and social goals
    
    Recommend articles that promote understanding between different cultures and challenge Western media hegemony while maintaining journalistic integrity.`;

    const articlesText = articles.slice(0, 20).map((article, idx) => 
      `${idx}: "${article.title}" - ${article.source} (${article.category})`
    ).join('\n');

    const userPrompt = `User Preferences: ${JSON.stringify(userPreferences)}
    User Location: ${userLocation || 'Global'}
    
    Available Articles:
    ${articlesText}
    
    Recommend top 10 articles that:
    1. Promote mutual respect and equality
    2. Provide multipolar perspectives
    3. Support inclusive global dialogue
    4. Advance sustainable development
    5. Match user interests while expanding their worldview
    
    Return JSON with recommended article indices and BPD alignment scores.`;

    const response = await this.client.chat.completions.create({
      model: 'grok-4' as GrokModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 1500
    });

    return this.parsePersonalizedRecommendation(response, articles);
  }

  /**
   * Parse personalized recommendation response
   */
  private parsePersonalizedRecommendation(response: any, articles: Article[]): PersonalizedRecommendation {
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      const recommendedIndices = parsed.recommendedArticles || [];
      const recommendedArticles = recommendedIndices
        .map((idx: number) => articles[idx])
        .filter(Boolean);

      return {
        articles: recommendedArticles,
        reasoning: parsed.reasoning || 'Curated for multipolar perspective and user interests',
        inclusivityScore: parsed.inclusivityScore || 0.8,
        multipolarBalance: parsed.multipolarBalance || 0.8,
        bpdAlignment: {
          mutualRespect: parsed.bpdAlignment?.mutualRespect || 0.8,
          equality: parsed.bpdAlignment?.equality || 0.8,
          inclusiveness: parsed.bpdAlignment?.inclusiveness || 0.8,
          multipolarity: parsed.bpdAlignment?.multipolarity || 0.8,
          sustainability: parsed.bpdAlignment?.sustainability || 0.7
        }
      };
    } catch (error) {
      console.error('Failed to parse personalized recommendation:', error);
      return this.getFallbackRecommendations(articles);
    }
  }

  /**
   * Extract topics for opinion generation from articles
   */
  async extractTopicsForOpinion(
    articles: Article[],
    maxTopics: number,
    category: string
  ): Promise<string[]> {
    if (!this.isAvailable() || !this.client) {
      return this.getFallbackTopics(category, maxTopics);
    }

    const systemPrompt = `You are a topic extraction AI for a BRICS-aligned news platform. 
    Extract controversial, discussion-worthy topics that would benefit from multipolar analysis and challenge Western media narratives.`;

    const articlesText = articles.slice(0, 15).map(article => 
      `"${article.title}" - ${article.description?.substring(0, 150)}...`
    ).join('\n');

    const userPrompt = `Articles from ${category} category:
${articlesText}

Extract ${maxTopics} topics that:
1. Challenge mainstream narratives
2. Promote multipolar perspectives
3. Support BRICS values
4. Generate meaningful debate

Return JSON array of topic strings.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'grok-4' as GrokModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content || '[]';
      const topics = JSON.parse(content);
      return Array.isArray(topics) ? topics.slice(0, maxTopics) : this.getFallbackTopics(category, maxTopics);
    } catch (error) {
      console.error('Error extracting topics:', error);
      return this.getFallbackTopics(category, maxTopics);
    }
  }

  /**
   * Generate fallback topics when AI is unavailable
   */
  private getFallbackTopics(category: string, maxTopics: number): string[] {
    const topicSets = {
      brics: [
        'BRICS Economic Integration vs Western Sanctions',
        'Multipolar World Order: Beyond US Hegemony',
        'South-South Cooperation: Alternative Development Models',
        'Digital Sovereignty in the BRICS Era',
        'Energy Independence and Sustainable Development'
      ],
      indonesia: [
        'Indonesia\'s Non-Aligned Foreign Policy in Practice',
        'Sustainable Palm Oil: Balancing Economy and Environment',
        'Digital Indonesia: Tech Sovereignty vs Global Integration',
        'Religious Harmony as a Model for Global Coexistence',
        'ASEAN Leadership in Multipolar Asia'
      ],
      bali: [
        'Sustainable Tourism: Balancing Growth and Conservation',
        'Cultural Preservation in a Globalized World',
        'Island Nations and Climate Change Leadership',
        'Hindu-Buddhist Values in Modern Governance',
        'Bali as a Bridge Between East and West'
      ],
      global: [
        'Media Monopolies and Information Warfare',
        'Climate Action Beyond Western Green Colonialism',
        'Digital Currencies: Freedom or Control?',
        'Migration: Human Rights vs National Sovereignty',
        'Technology Transfer and Development Justice'
      ]
    };

    const topics = topicSets[category as keyof typeof topicSets] || topicSets.global;
    return topics.slice(0, maxTopics);
  }

  /**
   * Generate comprehensive opinion essay with enhanced options
   */
  async generateOpinionEssay(
    topic: string,
    sourceArticles: Article[],
    options: {
      type: 'contrarian' | 'balanced' | 'analysis';
      depth: string;
      includeCounterArguments: boolean;
      bpdFocus: boolean;
      category: string;
    }
  ): Promise<OpinionEssay | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const cacheKey = `opinion_essay_v2_${topic}_${JSON.stringify(options)}`;

    return await this.checkRateLimitAndCache(cacheKey, async () => {
      return await this.generateEnhancedBpdOpinionEssay(topic, sourceArticles, options);
    });
  }

  /**
   * Generate enhanced BPD-aligned opinion essay
   */
  private async generateEnhancedBpdOpinionEssay(
    topic: string,
    sourceArticles: Article[],
    options: any
  ): Promise<OpinionEssay> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are an expert opinion writer for a BRICS Partnership for Development (BPD) aligned platform.
    
    BPD Values:
    - Mutual Respect: Equal treatment of all nations and cultures
    - Equality: Fair representation across different viewpoints  
    - Inclusiveness: Diverse voices from Global South
    - Multipolarity: Multiple centers of power and influence
    - Sustainable Development: Long-term environmental and social goals
    
    Write essays that challenge Western hegemony while maintaining journalistic integrity and promoting constructive dialogue.`;

    const sourcesText = sourceArticles.slice(0, 12).map(article => 
      `- "${article.title}" (${article.source}, ${article.category}): ${article.description?.substring(0, 200)}...`
    ).join('\n');

    const essayTypePrompts = {
      contrarian: 'Write a thoughtful contrarian analysis that challenges mainstream Western narratives while proposing alternative multipolar perspectives',
      balanced: 'Write a balanced analysis presenting multiple perspectives with emphasis on Global South viewpoints',
      analysis: 'Write a deep analytical piece examining underlying patterns, power structures, and implications for multipolar world development'
    };

    const userPrompt = `Topic: "${topic}"
Category: ${options.category}
Analysis Depth: ${options.depth}

Source Materials:
${sourcesText}

${essayTypePrompts[options.type as keyof typeof essayTypePrompts]}

Requirements:
1. 1000-1500 word comprehensive essay
2. Clear thesis with evidence-based arguments
3. ${options.includeCounterArguments ? 'Include and address counter-arguments' : 'Focus on main argument development'}
4. ${options.bpdFocus ? 'Emphasize BPD values and multipolar perspectives' : 'Maintain balanced global perspective'}
5. Indonesian context awareness and cultural sensitivity
6. Constructive conclusions promoting dialogue

Structure: Title, Summary, Main Argument, ${options.includeCounterArguments ? 'Counter-Arguments, ' : ''}Analysis, Conclusion

Return structured JSON with title, summary, content, mainArgument, counterArguments array, topics array, and confidence score (0-100).`;

    const response = await this.client.chat.completions.create({
      model: 'grok-4' as GrokModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6,
      max_tokens: 4000
    });

    return this.parseEnhancedOpinionEssay(response, topic, sourceArticles, options);
  }

  /**
   * Parse enhanced opinion essay response
   */
  private parseEnhancedOpinionEssay(response: any, topic: string, sources: Article[], options: any): OpinionEssay {
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      const wordCount = (parsed.content || '').split(/\s+/).length;
      
      return {
        title: parsed.title || `Beyond Hegemony: ${topic}`,
        summary: parsed.summary || `A ${options.type} analysis of ${topic} from a multipolar perspective.`,
        content: parsed.content || `This essay examines ${topic} through the lens of multipolar cooperation and BPD values.`,
        mainArgument: parsed.mainArgument || `${topic} requires multipolar analysis beyond Western narratives.`,
        counterArguments: parsed.counterArguments || [],
        sources: sources.slice(0, 8).map(article => ({
          title: article.title,
          url: article.link,
          type: 'rss' as const
        })),
        generatedAt: new Date().toISOString(),
        readingTime: Math.ceil(wordCount / 200),
        topics: parsed.topics || [topic],
        confidence: parsed.confidence || 75
      };
    } catch (error) {
      console.error('Failed to parse enhanced opinion essay:', error);
      const fallbackContent = this.generateFallbackEssay(topic, options);
      return {
        title: `Beyond Hegemony: ${topic}`,
        summary: `A ${options.type} analysis examining ${topic} from multipolar perspectives.`,
        content: fallbackContent,
        mainArgument: `${topic} requires examination through multipolar lens, challenging Western-centric narratives.`,
        counterArguments: ['Traditional Western perspective maintains different approach', 'Established institutions argue for current frameworks'],
        sources: sources.slice(0, 5).map(article => ({
          title: article.title,
          url: article.link,
          type: 'rss' as const
        })),
        generatedAt: new Date().toISOString(),
        readingTime: 8,
        topics: [topic],
        confidence: 60
      };
    }
  }

  /**
   * Generate fallback essay content
   */
  private generateFallbackEssay(topic: string, options: any): string {
    return `This analysis of "${topic}" examines the issue through a multipolar lens, challenging conventional Western narratives while promoting constructive dialogue.

The current discourse around ${topic} often reflects hegemonic perspectives that overlook diverse Global South experiences and alternative development models. A BPD-aligned approach emphasizes mutual respect, equality, and inclusive dialogue among nations.

From a multipolar perspective, ${topic} requires understanding different cultural, economic, and political contexts rather than imposing singular solutions. This approach promotes sustainable development while respecting national sovereignty and cultural diversity.

The path forward involves strengthening South-South cooperation, promoting technology transfer, and building institutions that serve all nations equitably. By embracing multipolar dialogue, we can develop more inclusive and sustainable solutions.

In conclusion, addressing ${topic} effectively requires moving beyond hegemonic frameworks toward cooperative, multipolar approaches that honor the dignity and sovereignty of all nations while promoting shared prosperity and sustainable development.`;
  }

  /**
   * Analyze BPD alignment of content
   */
  async analyzeBpdAlignment(content: string, options: any): Promise<any> {
    if (!this.isAvailable() || !this.client) {
      return this.getFallbackBpdAlignment();
    }

    const systemPrompt = `You are a BPD (BRICS Partnership for Development) alignment analyzer. 
    Evaluate content for alignment with BPD core values: Mutual Respect, Equality, Inclusiveness, Multipolarity, and Sustainability.`;

    const userPrompt = `Analyze this content for BPD alignment:

"${content.substring(0, 2000)}..."

Evaluate (0-100 scale):
1. Multipolarity: Support for multiple centers of power
2. Sustainability: Environmental and social sustainability focus
3. Inclusiveness: Diverse voices and perspectives included
4. Overall BPD Score: Combined alignment score

Return JSON with scores and reasoning.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'grok-4' as GrokModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      return {
        score: result.overallScore || 75,
        reasoning: result.reasoning || 'Content demonstrates alignment with BPD values through multipolar perspective and inclusive approach.',
        multipolarity: result.multipolarity || 75,
        sustainability: result.sustainability || 70,
        inclusiveness: result.inclusiveness || 80
      };
    } catch (error) {
      console.error('Error analyzing BPD alignment:', error);
      return this.getFallbackBpdAlignment();
    }
  }

  /**
   * Generate fallback BPD alignment scores
   */
  private getFallbackBpdAlignment(): any {
    return {
      score: 75,
      reasoning: 'Content promotes multipolar understanding and challenges hegemonic narratives while maintaining respectful dialogue.',
      multipolarity: 75,
      sustainability: 70,
      inclusiveness: 80
    };
  }

  /**
   * Generate Event Content
   * Creates BRICS/Bali focused events with social media content
   */
  async generateEventContent(
    category: string,
    maxEvents: number,
    options: any
  ): Promise<any[]> {
    if (!this.isAvailable() || !this.client) {
      return [];
    }

    const cacheKey = `event_content_${category}_${maxEvents}`;

    return await this.checkRateLimitAndCache(cacheKey, async () => {
      return await this.generateBpdEventContent(category, maxEvents, options);
    }) || [];
  }

  /**
   * Generate BPD-aligned event content using Grok
   */
  private async generateBpdEventContent(
    category: string,
    maxEvents: number,
    options: any
  ): Promise<any[]> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are an event content generator for BRICS-aligned platforms.
    
    Create engaging events that promote:
    1. South-South cooperation and multipolar dialogue
    2. Sustainable development and environmental awareness
    3. Cultural exchange between BRICS nations
    4. Digital sovereignty and technology sharing
    5. Economic cooperation beyond Western frameworks
    
    All content must respect Indonesian cultural values and promote peaceful cooperation.`;

    const userPrompt = `Generate ${maxEvents} events for ${category} category.
    
    Each event should include:
    1. Compelling title and description
    2. Event type (conference, webinar, workshop, cultural, networking)
    3. Date (future dates in 2025)
    4. Social media posts (announcement, reminder, live, recap)
    5. Relevant hashtags including #MultipolarBali and BRICS-focused tags
    6. BRICS relevance score (0-100)
    
    Focus on events that would appeal to:
    - BRICS diplomats and officials
    - Sustainable development practitioners
    - Cultural exchange enthusiasts
    - Digital sovereignty advocates
    - South-South cooperation supporters
    
    Return structured JSON array with complete event details.`;

    try {
      const response = await this.client.chat.completions.create({
        model: 'grok-4' as GrokModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      });

      const content = response.choices[0]?.message?.content || '[]';
      const events = JSON.parse(content);
      
      return Array.isArray(events) ? events.map((event, index) => ({
        ...event,
        id: `event-${category}-${Date.now()}-${index}`,
        category,
        generatedAt: new Date().toISOString()
      })) : [];
    } catch (error) {
      console.error('Error generating event content:', error);
      return [];
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  async generateOpinionEssayLegacy(
    topic: string,
    sourceArticles: Article[],
    essayType: 'contrarian' | 'balanced' | 'analysis' = 'contrarian'
  ): Promise<OpinionEssay | null> {
    return this.generateOpinionEssay(topic, sourceArticles, {
      type: essayType,
      depth: 'comprehensive',
      includeCounterArguments: true,
      bpdFocus: true,
      category: 'global'
    });
  }

  /**
   * Generate BPD-aligned opinion essay using Grok
   */
  private async generateBpdOpinionEssay(
    topic: string,
    sourceArticles: Article[],
    essayType: 'contrarian' | 'balanced' | 'analysis'
  ): Promise<OpinionEssay> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are an expert opinion writer for a BRICS-aligned platform that challenges Western media monopoly.
    
    Writing Guidelines:
    1. Maintain journalistic integrity and factual accuracy
    2. Promote mutual respect between all nations and cultures
    3. Challenge hegemonic narratives while being constructive
    4. Support South-South cooperation and multipolar world order
    5. Advance sustainable development and environmental consciousness
    6. Use respectful language that builds bridges, not walls
    
    Write in Indonesian context with global perspective, suitable for educated international audience.`;

    const sourcesText = sourceArticles.slice(0, 10).map(article => 
      `- "${article.title}" (${article.source}): ${article.description?.substring(0, 200)}...`
    ).join('\n');

    const essayPrompts = {
      contrarian: `Write a thoughtful contrarian analysis challenging mainstream Western narratives`,
      balanced: `Write a balanced analysis presenting multiple perspectives`,
      analysis: `Write a deep analytical piece examining underlying patterns and implications`
    };

    const userPrompt = `Topic: ${topic}
    Essay Type: ${essayType}
    
    Source Articles:
    ${sourcesText}
    
    ${essayPrompts[essayType]} on this topic. The essay should:
    1. Be 800-1200 words
    2. Present evidence-based arguments
    3. Challenge hegemonic thinking respectfully
    4. Promote multipolar understanding
    5. Support sustainable development
    6. End with constructive conclusions
    
    Title the essay "Beyond Hegemony:" followed by your subtitle. Use clear structure with introduction, main arguments, and conclusion.`;

    const response = await this.client.chat.completions.create({
      model: 'grok-4' as GrokModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.6, // Higher creativity for opinion pieces
      max_tokens: 3000
    });

    const content = response.choices[0]?.message?.content || '';
    const lines = content.split('\n');
    const title = lines[0]?.replace(/^#+\s*/, '') || `Beyond Hegemony: ${topic}`;
    const essay = lines.slice(1).join('\n').trim();
    const wordCount = essay.split(/\s+/).length;
    
    return {
      title,
      content: essay,
      perspective: essayType,
      wordCount,
      sources: sourceArticles.slice(0, 10).map(a => a.source),
      bpdValues: {
        mutualRespect: true,
        challengesHegemony: essayType === 'contrarian',
        promotesSouthSouth: true
      },
      readingTime: Math.ceil(wordCount / 200) // 200 words per minute
    };
  }

  /**
   * Enhance YouTube Videos with AI Analysis
   * Generates descriptions and alt text connecting to sustainable development
   */
  async enrichVideoContent(
    videoTitle: string,
    videoDescription: string,
    thumbnailUrl?: string
  ): Promise<VideoEnrichment | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const cacheKey = `video_enrichment_${videoTitle}`;

    return await this.checkRateLimitAndCache(cacheKey, async () => {
      return await this.analyzeVideoWithGrok(videoTitle, videoDescription, thumbnailUrl);
    });
  }

  /**
   * Analyze video content using Grok vision capabilities
   */
  private async analyzeVideoWithGrok(
    title: string,
    description: string,
    thumbnailUrl?: string
  ): Promise<VideoEnrichment> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are a multimedia content analyst specializing in sustainable development and Indonesian/Bali context.
    
    Generate enhanced content that:
    1. Connects to UN Sustainable Development Goals
    2. Highlights Bali/Indonesian cultural and environmental aspects
    3. Creates accessibility-friendly descriptions
    4. Identifies key educational moments
    5. Promotes environmental consciousness`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Video Title: ${title}
        Video Description: ${description}
        
        Enhance this video content with:
        1. Improved accessibility description
        2. Connection to sustainable development themes
        3. Bali/Indonesian cultural context
        4. Key moments identification
        5. SEO-friendly alt text
        
        Return structured JSON response.`
      }
    ];

    // Add image analysis if thumbnail available
    if (thumbnailUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this video thumbnail for visual elements:'
          },
          {
            type: 'image_url',
            image_url: { url: thumbnailUrl }
          }
        ]
      });
    }

    const response = await this.client.chat.completions.create({
      model: thumbnailUrl ? 'grok-vision-4-preview' : 'grok-4',
      messages,
      temperature: 0.4,
      max_tokens: 1500
    });

    return this.parseVideoEnrichmentResponse(response, title);
  }

  /**
   * Parse video enrichment response
   */
  private parseVideoEnrichmentResponse(response: any, originalTitle: string): VideoEnrichment {
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      
      return {
        title: parsed.title || originalTitle,
        description: parsed.description || 'Enhanced video content focusing on sustainable development and multicultural understanding.',
        altText: parsed.altText || `Video about ${originalTitle} with focus on sustainability and cultural exchange.`,
        sustainabilityTags: parsed.sustainabilityTags || ['sustainable-development', 'cultural-exchange'],
        baliConnection: parsed.baliConnection || 'Connects to Bali\'s commitment to sustainable tourism and cultural preservation.',
        accessibilityDescription: parsed.accessibilityDescription || `Accessible video content about ${originalTitle}`,
        keyMoments: parsed.keyMoments || []
      };
    } catch (error) {
      console.error('Failed to parse video enrichment response:', error);
      return {
        title: originalTitle,
        description: 'Enhanced video content promoting sustainable development and multicultural understanding.',
        altText: `Video: ${originalTitle}`,
        sustainabilityTags: ['sustainability', 'development'],
        baliConnection: 'Promotes sustainable development values aligned with Bali\'s environmental commitments.',
        accessibilityDescription: `Video content: ${originalTitle}`,
        keyMoments: []
      };
    }
  }

  /**
   * Generate Social Media Threads
   * Creates X threads from RSS feeds with #MultipolarBali promotion
   */
  async generateSocialThreads(
    articles: Article[],
    theme: string = 'MultipolarBali'
  ): Promise<SocialThreads | null> {
    if (!this.isAvailable()) {
      return null;
    }

    const cacheKey = `social_threads_${theme}_${articles.length}`;

    return await this.checkRateLimitAndCache(cacheKey, async () => {
      return await this.createBpdSocialThreads(articles, theme);
    });
  }

  /**
   * Create BPD-aligned social media threads
   */
  private async createBpdSocialThreads(articles: Article[], theme: string): Promise<SocialThreads> {
    if (!this.client) {
      throw new Error('Grok client not initialized');
    }

    const systemPrompt = `You are a social media strategist for a BRICS-aligned platform promoting multipolar world understanding.
    
    Create engaging Twitter/X threads that:
    1. Promote #MultipolarBali and BPD values
    2. Challenge Western media monopoly respectfully
    3. Highlight South-South cooperation
    4. Support sustainable development
    5. Build bridges between cultures
    6. Use engaging, shareable content
    
    Each tweet must be under 280 characters. Use relevant hashtags strategically.`;

    const articlesText = articles.slice(0, 5).map(article => 
      `"${article.title}" - ${article.source} (${article.category})`
    ).join('\n');

    const userPrompt = `Theme: ${theme}
    Recent Articles:
    ${articlesText}
    
    Create 3 engaging Twitter threads (3-5 tweets each) that:
    1. Thread 1: Highlight multipolar cooperation success stories
    2. Thread 2: Challenge Western narratives respectfully with facts
    3. Thread 3: Promote Bali as center for sustainable development
    
    Include strategic hashtags: #MultipolarBali #BRICS #SustainableDevelopment #SouthSouthCooperation
    
    Return JSON format with threads array.`;

    const response = await this.client.chat.completions.create({
      model: 'grok-4' as GrokModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7, // Higher creativity for social content
      max_tokens: 2000
    });

    return this.parseSocialThreadsResponse(response);
  }

  /**
   * Parse social threads response
   */
  private parseSocialThreadsResponse(response: any): SocialThreads {
    const content = response.choices[0]?.message?.content || '{}';
    
    try {
      const parsed = JSON.parse(content);
      const threads = parsed.threads || [];
      
      return {
        threads: threads.map((thread: any, index: number) => ({
          id: `thread_${index}_${Date.now()}`,
          tweets: Array.isArray(thread.tweets) ? thread.tweets : ['Promoting multipolar understanding 🌍 #MultipolarBali'],
          totalCharacters: (thread.tweets || []).join('').length,
          hashtagSet: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment'],
          bpdPromoting: true
        })),
        scheduledTimes: this.generateScheduledTimes(),
        hashtags: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment', '#SouthSouthCooperation', '#Indonesia', '#Bali'],
        engagementPrediction: parsed.engagementPrediction || 0.75
      };
    } catch (error) {
      console.error('Failed to parse social threads response:', error);
      return {
        threads: [{
          id: `fallback_${Date.now()}`,
          tweets: [
            '🌍 Building bridges across cultures and continents. #MultipolarBali represents the future of cooperative journalism. 🤝',
            '📰 Real news from diverse perspectives. Breaking free from media monopolies, one story at a time. #BRICS #SustainableDevelopment',
            '🏝️ From Bali to the world: promoting mutual respect, equality, and sustainable development. Join our multipolar community! 🌱'
          ],
          totalCharacters: 420,
          hashtagSet: ['#MultipolarBali', '#BRICS'],
          bpdPromoting: true
        }],
        scheduledTimes: this.generateScheduledTimes(),
        hashtags: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment'],
        engagementPrediction: 0.6
      };
    }
  }

  /**
   * Generate optimal posting times for Indonesian/BRICS audience
   */
  private generateScheduledTimes(): string[] {
    const now = new Date();
    const times = [];
    
    // Optimal times for Indonesian audience (UTC+7)
    const optimalHours = [7, 12, 18, 21]; // 2PM, 7PM, 1AM, 4AM UTC
    
    for (let i = 0; i < 3; i++) {
      const scheduleDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
      const hour = optimalHours[i % optimalHours.length];
      scheduleDate.setHours(hour, 0, 0, 0);
      times.push(scheduleDate.toISOString());
    }
    
    return times;
  }

  /**
   * Fallback recommendations when Grok is unavailable
   */
  private getFallbackRecommendations(articles: Article[]): PersonalizedRecommendation {
    const fallbackArticles = articles
      .filter(article => 
        article.category.toLowerCase().includes('brics') ||
        article.title.toLowerCase().includes('indonesia') ||
        article.source.toLowerCase().includes('rt') ||
        article.source.toLowerCase().includes('tass')
      )
      .slice(0, 10);

    return {
      articles: fallbackArticles,
      reasoning: 'Curated selection focusing on BRICS and Indonesian perspectives (Grok AI unavailable)',
      inclusivityScore: 0.7,
      multipolarBalance: 0.8,
      bpdAlignment: {
        mutualRespect: 0.7,
        equality: 0.7,
        inclusiveness: 0.8,
        multipolarity: 0.9,
        sustainability: 0.6
      }
    };
  }

  /**
   * Service availability check
   */
  isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  /**
   * Get comprehensive service status
   */
  getStatus() {
    const hourKey = Math.floor(Date.now() / 3600000).toString();
    const currentUsage = this.rateLimiter.get(hourKey) || 0;
    const cacheSize = this.cache.size;
    
    return {
      isAvailable: this.isAvailable(),
      isConfigured: this.isConfigured,
      hasXaiApiKey: !!getEnv('XAI_API_KEY'),
      hasXBearerToken: !!getEnv('X_BEARER_TOKEN'),
      currentUsage,
      rateLimit: this.RATE_LIMIT,
      remainingCalls: Math.max(0, this.RATE_LIMIT - currentUsage),
      cacheSize,
      service: 'Enhanced Grok/X.AI Integration',
      version: '2.0',
      features: [
        'Real-time X/Twitter insights',
        'BPD-aligned personalization',
        'Opinion essay generation',
        'Video content enhancement',
        'Social media automation',
        'Indonesian regulation compliance'
      ]
    };
  }

  /**
   * Clear cache for fresh data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Grok service cache cleared');
  }

  /**
   * Export cached data for backup
   */
  exportCacheData(): any {
    const data: any = {};
    for (const [key, value] of this.cache.entries()) {
      data[key] = value;
    }
    return data;
  }
}

// Export singleton instance
export const enhancedGrokService = new EnhancedGrokService();

// Export class for custom instances
export { EnhancedGrokService };

// Export utility functions
export const GrokUtils = {
  /**
   * Validate BPD alignment score
   */
  validateBpdAlignment(score: number): boolean {
    return score >= 0.6; // Minimum 60% alignment with BPD values
  },

  /**
   * Generate Indonesian regulation-compliant content disclaimer
   */
  generateComplianceDisclaimer(): string {
    return 'Konten ini dibuat dengan bantuan AI dan mematuhi UU ITE Indonesia serta nilai-nilai BPD (BRICS Partnership for Development) yang mengutamakan rasa hormat, kesetaraan, inklusivitas, multipolaritas, dan pembangunan berkelanjutan.';
  },

  /**
   * Check content for Indonesian regulation compliance
   */
  checkIndonesianCompliance(content: string): {
    isCompliant: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    
    // Basic checks for Indonesian content regulations
    const prohibited = [
      'hate speech', 'SARA', 'pornografi', 'radikalisme',
      'separatisme', 'terorisme', 'narkoba'
    ];
    
    const lowerContent = content.toLowerCase();
    for (const term of prohibited) {
      if (lowerContent.includes(term.toLowerCase())) {
        warnings.push(`Content may contain prohibited term: ${term}`);
      }
    }
    
    return {
      isCompliant: warnings.length === 0,
      warnings
    };
  }
};