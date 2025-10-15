/**
 * Enhanced Grok API Endpoint for Bali Report
 * Handles social insights, personalized feeds, and AI-powered content generation
 * Compliant with Indonesian regulations and BPD values
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedGrokService } from '@/lib/grok-enhanced-service';
import { getRSSFeeds } from '@/lib/rss-parser';
import { GrokUtils } from '@/lib/grok-enhanced-service';
import { trackAnalyticsEvent } from '@/lib/analytics-service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const category = searchParams.get('category') as 'brics' | 'indonesia' | 'bali';
  const userId = searchParams.get('userId');

  try {
    // Track API usage for Matomo analytics
    await trackAnalyticsEvent({
      type: 'grok_api_call',
      data: { action, category, userId, timestamp: Date.now() }
    });

    switch (action) {
      case 'social-insights':
        return await handleSocialInsights(category || 'brics');
      
      case 'personalized-feed':
        return await handlePersonalizedFeed(request);
      
      case 'status':
        return handleServiceStatus();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: social-insights, personalized-feed, status' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Grok API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', fallback: true },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    await trackAnalyticsEvent({
      type: 'grok_api_post',
      data: { action, timestamp: Date.now() }
    });

    switch (action) {
      case 'generateOpinion':
        return await handleOpinionGeneration(data);
      
      case 'enrich-video':
        return await handleVideoEnrichment(data);
      
      case 'generate-social-threads':
        return await handleSocialThreadGeneration(data);
      
      case 'generate-events':
        return await handleEventGeneration(data);
      
      case 'clear-cache':
        return handleCacheClear();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Grok API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle social insights requests
 */
async function handleSocialInsights(category: 'brics' | 'indonesia' | 'bali') {
  if (!enhancedGrokService.isAvailable()) {
    return NextResponse.json({
      insights: [],
      fallback: true,
      message: 'Grok service unavailable. Using RSS feeds only.',
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  }

  try {
    const insights = await enhancedGrokService.getSocialInsights(category);
    
    // Validate content compliance for Indonesian regulations
    const complianceCheck = insights.every(insight => 
      GrokUtils.checkIndonesianCompliance(insight.analysis).isCompliant
    );

    if (!complianceCheck) {
      console.warn('🚨 Social insights failed compliance check');
    }

    return NextResponse.json({
      insights: complianceCheck ? insights : [],
      category,
      timestamp: new Date().toISOString(),
      compliance: complianceCheck,
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  } catch (error) {
    console.error('Social insights error:', error);
    return NextResponse.json({
      insights: [],
      fallback: true,
      error: 'Failed to fetch social insights'
    });
  }
}

/**
 * Handle personalized feed generation
 */
async function handlePersonalizedFeed(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const preferencesParam = searchParams.get('preferences');
  const location = searchParams.get('location');

  if (!preferencesParam) {
    return NextResponse.json(
      { error: 'Missing user preferences' },
      { status: 400 }
    );
  }

  try {
    // Get current RSS articles
    const articles = await getRSSFeeds();
    
    // Parse user preferences
    const preferences = JSON.parse(decodeURIComponent(preferencesParam));
    
    // Generate personalized recommendations
    const recommendation = await enhancedGrokService.generatePersonalizedFeed(
      articles,
      preferences,
      location || undefined
    );

    // Validate BPD alignment
    const bpdCompliant = GrokUtils.validateBpdAlignment(
      recommendation.inclusivityScore
    );

    return NextResponse.json({
      recommendation: bpdCompliant ? recommendation : null,
      fallback: !bpdCompliant || !enhancedGrokService.isAvailable(),
      bpdAlignment: recommendation.bpdAlignment,
      totalArticles: articles.length,
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  } catch (error) {
    console.error('Personalized feed error:', error);
    
    // Fallback to RSS-based recommendations
    const articles = await getRSSFeeds();
    const fallback = articles
      .filter(article => 
        article.category.toLowerCase().includes('brics') ||
        article.title.toLowerCase().includes('indonesia')
      )
      .slice(0, 10);

    return NextResponse.json({
      recommendation: {
        articles: fallback,
        reasoning: 'Fallback selection based on BRICS and Indonesian content',
        inclusivityScore: 0.7,
        multipolarBalance: 0.8
      },
      fallback: true,
      error: 'AI personalization unavailable'
    });
  }
}

/**
 * Handle opinion essay generation
 */
async function handleOpinionGeneration(data: any) {
  const { 
    category = 'global', 
    maxEssays = 3, 
    forceRefresh = false,
    analysisDepth = 'comprehensive',
    includeCounterArguments = true,
    bpdFocus = true
  } = data;

  if (!enhancedGrokService.isAvailable()) {
    return NextResponse.json({
      success: false,
      error: 'Grok service unavailable',
      data: { essays: [] }
    });
  }

  try {
    // Get source articles filtered by category
    const sourceArticles = await getRSSFeeds();
    const filteredArticles = sourceArticles.filter(article => {
      if (category === 'global') return true;
      return article.category.toLowerCase().includes(category.toLowerCase()) ||
             article.title.toLowerCase().includes(category.toLowerCase()) ||
             article.description.toLowerCase().includes(category.toLowerCase());
    }).slice(0, 20); // Use more source material

    if (filteredArticles.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No articles found for ${category} category`,
        data: { essays: [] }
      });
    }

    // Generate multiple opinion essays
    const essays = [];
    const topics = await enhancedGrokService.extractTopicsForOpinion(
      filteredArticles, 
      maxEssays,
      category
    );

    for (let i = 0; i < Math.min(topics.length, maxEssays); i++) {
      try {
        const topic = topics[i];
        const essay = await enhancedGrokService.generateOpinionEssay(
          topic,
          filteredArticles,
          {
            type: 'contrarian',
            depth: analysisDepth,
            includeCounterArguments,
            bpdFocus,
            category
          }
        );

        if (essay) {
          // Check compliance
          const compliance = GrokUtils.checkIndonesianCompliance(essay.content);
          
          if (compliance.isCompliant) {
            // Generate BPD alignment analysis
            const bpdAlignment = await enhancedGrokService.analyzeBpdAlignment(essay.content, {
              multipolarity: true,
              sustainability: true,
              inclusiveness: true,
              culturalSensitivity: true
            });

            essays.push({
              ...essay,
              id: `opinion-${category}-${Date.now()}-${i}`,
              bpdAlignment,
              compliance,
              category,
              topics: [topic, ...essay.topics || []],
              sources: essay.sources.map(source => ({
                ...source,
                type: source.url.includes('twitter.com') || source.url.includes('x.com') ? 'x' : 'rss'
              }))
            });
          }
        }
      } catch (essayError) {
        console.error(`Error generating essay ${i + 1}:`, essayError);
        // Continue with other essays
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        essays,
        category,
        totalSourceArticles: filteredArticles.length,
        generatedAt: new Date().toISOString(),
        analysisDepth,
        bpdFocused: bpdFocus
      },
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  } catch (error) {
    console.error('Opinion generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate opinion essays',
      data: { essays: [] }
    });
  }
}

/**
 * Handle video content enrichment
 */
async function handleVideoEnrichment(data: any) {
  const { title, description, thumbnailUrl } = data;

  if (!title || !description) {
    return NextResponse.json(
      { error: 'Missing video title or description' },
      { status: 400 }
    );
  }

  try {
    const enrichment = await enhancedGrokService.enrichVideoContent(
      title,
      description,
      thumbnailUrl
    );

    return NextResponse.json({
      enrichment,
      timestamp: new Date().toISOString(),
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  } catch (error) {
    console.error('Video enrichment error:', error);
    return NextResponse.json({
      enrichment: {
        title,
        description: 'Enhanced video content promoting sustainable development.',
        altText: `Video: ${title}`,
        sustainabilityTags: ['sustainability', 'development'],
        baliConnection: 'Promotes sustainable development values.',
        accessibilityDescription: `Video content: ${title}`,
        keyMoments: []
      },
      fallback: true,
      error: 'AI enhancement unavailable'
    });
  }
}

/**
 * Handle social thread generation
 */
async function handleSocialThreadGeneration(data: any) {
  const { theme = 'MultipolarBali' } = data;

  try {
    // Get recent articles for thread context
    const articles = await getRSSFeeds();
    
    // Generate social threads
    const socialThreads = await enhancedGrokService.generateSocialThreads(
      articles.slice(0, 5),
      theme
    );

    if (!socialThreads) {
      return NextResponse.json({
        threads: {
          threads: [{
            id: `fallback_${Date.now()}`,
            tweets: [
              '🌍 Building bridges across cultures with #MultipolarBali 🤝',
              '📰 Independent journalism from diverse perspectives #BRICS',
              '🏝️ Bali leads sustainable development in Southeast Asia 🌱'
            ],
            totalCharacters: 180,
            hashtagSet: ['#MultipolarBali', '#BRICS'],
            bpdPromoting: true
          }],
          scheduledTimes: [],
          hashtags: ['#MultipolarBali', '#BRICS', '#SustainableDevelopment'],
          engagementPrediction: 0.6
        },
        fallback: true,
        message: 'Using fallback social content'
      });
    }

    return NextResponse.json({
      threads: socialThreads,
      timestamp: new Date().toISOString(),
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  } catch (error) {
    console.error('Social thread generation error:', error);
    return NextResponse.json({
      threads: null,
      fallback: true,
      error: 'Failed to generate social threads'
    });
  }
}

/**
 * Handle service status requests
 */
function handleServiceStatus() {
  const status = enhancedGrokService.getStatus();
  
  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    disclaimer: GrokUtils.generateComplianceDisclaimer()
  });
}

/**
 * Handle event content generation
 */
async function handleEventGeneration(data: any) {
  const { 
    category = 'brics-bali',
    maxEvents = 3,
    forceRefresh = false,
    includeMultipolarFocus = true
  } = data;

  if (!enhancedGrokService.isAvailable()) {
    return NextResponse.json({
      success: false,
      error: 'Grok service unavailable',
      events: []
    });
  }

  try {
    // Generate event content using Grok
    const events = await enhancedGrokService.generateEventContent(
      category,
      maxEvents,
      {
        includeMultipolarFocus,
        includeSocialPosts: true,
        includeBricsRelevance: true,
        culturalSensitivity: true
      }
    );

    return NextResponse.json({
      success: true,
      events,
      category,
      timestamp: new Date().toISOString(),
      disclaimer: GrokUtils.generateComplianceDisclaimer()
    });
  } catch (error) {
    console.error('Event generation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate events',
      events: []
    });
  }
}

/**
 * Handle cache clearing
 */
function handleCacheClear() {
  try {
    enhancedGrokService.clearCache();
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    }, { status: 500 });
  }
}

// Helper function to track analytics events (placeholder)
async function trackAnalyticsEvent(event: any) {
  try {
    // This would integrate with your Matomo analytics
    console.log('📊 Analytics event:', event);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}