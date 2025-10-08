import { NextResponse } from 'next/server';
import { rssAggregator } from '@/lib/rss-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let indonesiaCache: { articles: any[]; metadata: any; timestamp: number; } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  if (indonesiaCache && (now - indonesiaCache.timestamp) < CACHE_TTL) {
    return NextResponse.json({
      success: true,
      articles: indonesiaCache.articles,
      metadata: { ...indonesiaCache.metadata, servedFrom: 'cache', responseTime: Date.now() - startTime },
    }, { status: 200, headers: { 'Cache-Control': 'public, s-maxage=60', 'X-Cache-Status': 'HIT' }});
  }

  try {
    const articles = await rssAggregator.fetchByCategory('Indonesia', true);
    indonesiaCache = {
      articles: articles.slice(0, 50),
      metadata: { total: articles.length, fetchTime: Date.now() - startTime, timestamp: new Date().toISOString() },
      timestamp: now,
    };
    return NextResponse.json({
      success: true,
      articles: indonesiaCache.articles,
      metadata: { ...indonesiaCache.metadata, servedFrom: 'fresh', responseTime: Date.now() - startTime },
    }, { status: 200, headers: { 'X-Cache-Status': 'MISS' }});
  } catch (error) {
    if (indonesiaCache) {
      return NextResponse.json({ success: true, articles: indonesiaCache.articles, metadata: { ...indonesiaCache.metadata, servedFrom: 'stale-cache' }}, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
