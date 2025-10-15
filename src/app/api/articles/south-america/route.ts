import { NextResponse } from 'next/server';
import { fetchSouthAmericaArticles } from '@/lib/rss-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache
let southAmericaCache: {
  articles: any[];
  metadata: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  const hasValidCache = southAmericaCache && (now - southAmericaCache.timestamp) < CACHE_TTL;
  
  if (hasValidCache && southAmericaCache) {
    console.log('⚡ Serving South America from cache');
    return NextResponse.json(
      {
        success: true,
        articles: southAmericaCache.articles,
        metadata: {
          ...southAmericaCache.metadata,
          servedFrom: 'cache',
          cacheAge: Math.round((now - southAmericaCache.timestamp) / 1000),
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
    console.log('🌺 Fetching South America articles from RSS.app feeds...');
    
    const articles = await fetchSouthAmericaArticles();
    
    console.log(`📊 South America API: Fetched ${articles.length} articles from RSS.app feeds`);
    
    if (articles.length === 0) {
      throw new Error('No South America articles available from RSS.app feeds');
    }

    southAmericaCache = {
      articles: articles,
      metadata: {
        source: 'RSS.app feeds',
        total: articles.length,
        fetchTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        articles: southAmericaCache.articles,
        metadata: {
          ...southAmericaCache.metadata,
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
    console.error('❌ Error fetching South America articles:', error);
    
    if (southAmericaCache) {
      return NextResponse.json(
        {
          success: true,
          articles: southAmericaCache.articles,
          metadata: { ...southAmericaCache.metadata, servedFrom: 'stale-cache' },
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