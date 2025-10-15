import { NextResponse } from 'next/server';
import { fetchAfricaArticles } from '@/lib/rss-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache
let africaCache: {
  articles: any[];
  metadata: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  const hasValidCache = africaCache && (now - africaCache.timestamp) < CACHE_TTL;
  
  if (hasValidCache && africaCache) {
    console.log('⚡ Serving Africa from cache');
    return NextResponse.json(
      {
        success: true,
        articles: africaCache.articles,
        metadata: {
          ...africaCache.metadata,
          servedFrom: 'cache',
          cacheAge: Math.round((now - africaCache.timestamp) / 1000),
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
    console.log('🌺 Fetching Africa articles from RSS.app feeds...');
    
    // Use RSS.app-only feeds for simplified, reliable news aggregation
    const articles = await fetchAfricaArticles();
    
    console.log(`📊 Africa API: Fetched ${articles.length} articles from RSS.app feeds`);
    
    if (articles.length === 0) {
      throw new Error('No Africa articles available from RSS.app feeds');
    }

    africaCache = {
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
        articles: africaCache.articles,
        metadata: {
          ...africaCache.metadata,
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
    console.error('❌ Error fetching Africa articles:', error);
    
    if (africaCache) {
      return NextResponse.json(
        {
          success: true,
          articles: africaCache.articles,
          metadata: { ...africaCache.metadata, servedFrom: 'stale-cache' },
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