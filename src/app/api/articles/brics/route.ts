import { NextResponse } from 'next/server';
import { unifiedNewsService } from '@/lib/unified-news-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache
let bricsCache: {
  articles: any[];
  metadata: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  const hasValidCache = bricsCache && (now - bricsCache.timestamp) < CACHE_TTL;
  
  if (hasValidCache && bricsCache) {
    console.log('⚡ Serving BRICS from cache');
    return NextResponse.json(
      {
        success: true,
        articles: bricsCache.articles,
        metadata: {
          ...bricsCache.metadata,
          servedFrom: 'cache',
          cacheAge: Math.round((now - bricsCache.timestamp) / 1000),
          responseTime: Date.now() - startTime,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache-Status': 'HIT',
        },
      }
    );
  }

  try {
    console.log('🌺 Fetching BRICS articles with priority system...');
    
    // Use unified news service with priority system: NewsData.io -> RSS -> Scrapers
    const newsResponse = await unifiedNewsService.fetchByCategory('BRICS', { 
      includeScrapers: true, 
      limit: 50 
    });
    
    console.log(`📊 BRICS API: ${newsResponse.success ? 'Success' : 'Failed'} - Fetched ${newsResponse.articles.length} articles`);
    console.log(`🎯 BRICS Sources used: ${newsResponse.metadata.fallbacksUsed.join(' + ')}`);
    
    if (!newsResponse.success) {
      throw new Error('Failed to fetch BRICS articles');
    }

    bricsCache = {
      articles: newsResponse.articles,
      metadata: {
        ...newsResponse.metadata,
        total: newsResponse.articles.length,
        fetchTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        articles: bricsCache.articles,
        metadata: {
          ...bricsCache.metadata,
          servedFrom: 'fresh',
          responseTime: Date.now() - startTime,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60',
          'X-Cache-Status': 'MISS',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error fetching BRICS articles:', error);
    
    if (bricsCache) {
      return NextResponse.json(
        {
          success: true,
          articles: bricsCache.articles,
          metadata: { ...bricsCache.metadata, servedFrom: 'stale-cache' },
        },
        { status: 200 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
