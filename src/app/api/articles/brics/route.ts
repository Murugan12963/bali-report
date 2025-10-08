import { NextResponse } from 'next/server';
import { rssAggregator } from '@/lib/rss-parser';

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
    console.log('🌺 Fetching BRICS articles...');
    const articles = await rssAggregator.fetchByCategory('BRICS', true);

    bricsCache = {
      articles: articles.slice(0, 50),
      metadata: {
        total: articles.length,
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
