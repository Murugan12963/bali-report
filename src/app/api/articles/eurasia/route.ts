import { NextResponse } from 'next/server';
import { fetchEurasiaArticles } from '@/lib/rss-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache
let eurasiaCache: {
  articles: any[];
  metadata: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  const hasValidCache = eurasiaCache && (now - eurasiaCache.timestamp) < CACHE_TTL;
  
  if (hasValidCache && eurasiaCache) {
    console.log('⚡ Serving Eurasia from cache');
    return NextResponse.json(
      {
        success: true,
        articles: eurasiaCache.articles,
        metadata: {
          ...eurasiaCache.metadata,
          servedFrom: 'cache',
          cacheAge: Math.round((now - eurasiaCache.timestamp) / 1000),
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
    console.log('🌺 Fetching Eurasia articles from RSS.app feeds...');
    
    const articles = await fetchEurasiaArticles();
    
    console.log(`📊 Eurasia API: Fetched ${articles.length} articles from RSS.app feeds`);
    
    if (articles.length === 0) {
      throw new Error('No Eurasia articles available from RSS.app feeds');
    }

    eurasiaCache = {
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
        articles: eurasiaCache.articles,
        metadata: {
          ...eurasiaCache.metadata,
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
    console.error('❌ Error fetching Eurasia articles:', error);
    
    if (eurasiaCache) {
      return NextResponse.json(
        {
          success: true,
          articles: eurasiaCache.articles,
          metadata: { ...eurasiaCache.metadata, servedFrom: 'stale-cache' },
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