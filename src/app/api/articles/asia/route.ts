import { NextResponse } from 'next/server';
import { fetchIndonesiaArticles, fetchBaliArticles } from '@/lib/rss-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory cache
let asiaCache: {
  articles: any[];
  metadata: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  const hasValidCache = asiaCache && (now - asiaCache.timestamp) < CACHE_TTL;
  
  if (hasValidCache && asiaCache) {
    console.log('⚡ Serving Asia from cache');
    return NextResponse.json(
      {
        success: true,
        articles: asiaCache.articles,
        metadata: {
          ...asiaCache.metadata,
          servedFrom: 'cache',
          cacheAge: Math.round((now - asiaCache.timestamp) / 1000),
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
    console.log('🌺 Fetching Asia articles from RSS.app feeds...');
    
    // Fetch Indonesia and Bali articles for Asia region
    const [indonesiaArticles, baliArticles] = await Promise.all([
      fetchIndonesiaArticles(),
      fetchBaliArticles()
    ]);
    
    const articles = [...indonesiaArticles, ...baliArticles];
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    console.log(`📊 Asia API: Fetched ${articles.length} articles from RSS.app feeds (Indonesia: ${indonesiaArticles.length}, Bali: ${baliArticles.length})`);
    
    if (articles.length === 0) {
      throw new Error('No Asia articles available from RSS.app feeds');
    }

    asiaCache = {
      articles: articles,
      metadata: {
        source: 'RSS.app feeds (Indonesia + Bali)',
        total: articles.length,
        fetchTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      timestamp: now,
    };

    return NextResponse.json(
      {
        success: true,
        articles: asiaCache.articles,
        metadata: {
          ...asiaCache.metadata,
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
    console.error('❌ Error fetching Asia articles:', error);
    
    if (asiaCache) {
      return NextResponse.json(
        {
          success: true,
          articles: asiaCache.articles,
          metadata: { ...asiaCache.metadata, servedFrom: 'stale-cache' },
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