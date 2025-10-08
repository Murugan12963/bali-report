import { NextResponse } from 'next/server';
import { rssAggregator } from '@/lib/rss-parser';
import { rssCache } from '@/lib/rss-cache';

/**
 * Cache warming API endpoint
 * Manually trigger RSS cache warming for all active sources
 */
export async function POST() {
  try {
    console.log('🔥 Starting RSS cache warming via API...');
    
    // Get all active sources
    const activeSources = rssAggregator.getActiveSources();
    console.log(`📊 Found ${activeSources.length} active RSS sources`);
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const source of activeSources) {
      try {
        console.log(`🌐 Fetching ${source.name}...`);
        const articles = await rssAggregator.fetchFromSource(source);
        
        if (articles.length > 0) {
          rssCache.set(source.url, source, articles);
          successCount++;
          results.push({
            source: source.name,
            status: 'success',
            articles: articles.length
          });
          console.log(`✅ ${source.name}: ${articles.length} articles cached`);
        } else {
          results.push({
            source: source.name,
            status: 'warning',
            message: 'No articles found'
          });
          console.log(`⚠️  ${source.name}: No articles found`);
        }
        
        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        errorCount++;
        results.push({
          source: source.name,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Error fetching ${source.name}:`, error);
      }
    }
    
    // Get final cache stats
    const stats = rssCache.getStats();
    
    const response = {
      success: true,
      message: 'Cache warming completed',
      results: {
        successCount,
        errorCount,
        totalSources: activeSources.length,
        cacheStats: stats,
        sourceResults: results
      }
    };
    
    console.log('📈 Cache warming completed via API!');
    console.log(`✅ Successfully cached: ${successCount} sources`);
    console.log(`❌ Failed to cache: ${errorCount} sources`);
    console.log(`💾 Cache size: ${stats.cacheSize}KB`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Cache warming failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Get current cache stats
  const stats = rssCache.getStats();
  const cachedSources = rssCache.getCachedSources();
  
  return NextResponse.json({
    success: true,
    cacheStats: stats,
    cachedSources: cachedSources.map(source => ({
      name: source.name,
      articleCount: source.articleCount,
      cachedAt: source.cachedAt,
      isStale: source.isStale
    }))
  });
}
