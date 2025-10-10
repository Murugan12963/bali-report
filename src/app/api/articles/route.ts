import { NextRequest, NextResponse } from 'next/server';
import { unifiedNewsService } from '@/lib/unified-news-service';
import { contentPersonalizationEngine } from '@/lib/content-personalization';

// Cache configuration for instant delivery
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache for instant article delivery
let articleCache: {
  articles: any[];
  metadata: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/articles
 * Returns cached articles instantly, refreshes in background if needed
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const now = Date.now();
  
  // Check if we have valid cache
  const hasValidCache = articleCache && (now - articleCache.timestamp) < CACHE_TTL;
  
  // Return cached data immediately if available
  if (hasValidCache && articleCache) {
    console.log('⚡ Serving from in-memory cache (instant!)');
    
    return NextResponse.json(
      {
        success: true,
        articles: articleCache.articles,
        metadata: {
          ...articleCache.metadata,
          servedFrom: 'cache',
          cacheAge: Math.round((now - articleCache.timestamp) / 1000),
          responseTime: Date.now() - startTime,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Content-Type': 'application/json',
          'X-Cache-Status': 'HIT',
        },
      }
    );
  }

  // If no valid cache, fetch fresh data
  try {
    console.log('🌺 API: Fetching fresh articles with priority system...');

    // Use unified news service with priority system: NewsData.io -> RSS -> Scrapers
    const newsResponse = await unifiedNewsService.fetchAllArticles({ 
      includeScrapers: true, 
      limit: 100 
    });
    console.log(`📊 API: ${newsResponse.success ? 'Success' : 'Failed'} - Fetched ${newsResponse.articles.length} articles`);
    console.log(`🎯 Sources used: ${newsResponse.metadata.fallbacksUsed.join(' + ')}`);

    if (!newsResponse.success) {
      throw new Error('Unified news service failed to fetch articles');
    }

    // Get personalization preferences
    const searchParams = request.nextUrl.searchParams;
    const interests = searchParams.get('interests')?.split(',') || [];

    // Apply personalization if interests provided
    let articles = newsResponse.articles;
    if (interests.length > 0) {
      const personalizedArticles = await contentPersonalizationEngine.personalizeContent(
        newsResponse.articles,
        100
      );
      articles = personalizedArticles.slice(0, 100);
    }


    // Update in-memory cache
    articleCache = {
      articles,
      metadata: {
        total: articles.length,
        fetchTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      timestamp: now,
    };

    console.log('💾 Updated in-memory cache for instant delivery');

    return NextResponse.json(
      {
        success: true,
        articles: articleCache.articles,
        metadata: {
          ...articleCache.metadata,
          ...newsResponse.metadata,
          servedFrom: 'fresh',
          responseTime: Date.now() - startTime,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'Content-Type': 'application/json',
          'X-Cache-Status': 'MISS',
        },
      }
    );
  } catch (error) {
    console.error('❌ API: Error fetching articles:', error);
    
    // If we have stale cache, serve it with warning
    if (articleCache) {
      console.log('⚠️  Serving stale cache due to error');
      return NextResponse.json(
        {
          success: true,
          articles: articleCache.articles,
          metadata: {
            ...articleCache.metadata,
            servedFrom: 'stale-cache',
            cacheAge: Math.round((now - articleCache.timestamp) / 1000),
            warning: 'Serving cached data due to fetch error',
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=30',
            'X-Cache-Status': 'STALE',
          },
        }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch articles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}
