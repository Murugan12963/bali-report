import { NextResponse } from 'next/server';
import { unifiedNewsService } from '@/lib/unified-news-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let baliCache: { articles: any[]; metadata: any; timestamp: number; } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  const startTime = Date.now();
  const now = Date.now();
  
  if (baliCache && (now - baliCache.timestamp) < CACHE_TTL) {
    return NextResponse.json({
      success: true,
      articles: baliCache.articles,
      metadata: { ...baliCache.metadata, servedFrom: 'cache', responseTime: Date.now() - startTime },
    }, { status: 200, headers: { 'X-Cache-Status': 'HIT' }});
  }

  try {
    console.log('🌺 Fetching Bali articles with priority system...');
    
    const newsResponse = await unifiedNewsService.fetchByCategory('Bali', { 
      includeScrapers: true, 
      limit: 50 
    });
    
    console.log(`📊 Bali API: ${newsResponse.success ? 'Success' : 'Failed'} - Fetched ${newsResponse.articles.length} articles`);
    console.log(`🎯 Bali Sources used: ${newsResponse.metadata.fallbacksUsed.join(' + ')}`);
    
    if (!newsResponse.success) {
      throw new Error('Failed to fetch Bali articles');
    }
    
    baliCache = {
      articles: newsResponse.articles,
      metadata: { 
        ...newsResponse.metadata,
        total: newsResponse.articles.length, 
        fetchTime: Date.now() - startTime, 
        timestamp: new Date().toISOString() 
      },
      timestamp: now,
    };
    return NextResponse.json({
      success: true,
      articles: baliCache.articles,
      metadata: { ...baliCache.metadata, servedFrom: 'fresh', responseTime: Date.now() - startTime },
    }, { status: 200, headers: { 'X-Cache-Status': 'MISS' }});
  } catch (error) {
    if (baliCache) {
      return NextResponse.json({ success: true, articles: baliCache.articles, metadata: { ...baliCache.metadata, servedFrom: 'stale-cache' }}, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}
