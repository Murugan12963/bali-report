#!/usr/bin/env node

/**
 * RSS Cache Warming Script for Bali Report
 * Pre-fetches all active RSS sources to warm up the cache
 */

const { rssAggregator } = require('../src/lib/rss-parser');
const { rssCache } = require('../src/lib/rss-cache');

async function warmCache() {
  console.log('🔥 Starting RSS cache warming...');
  
  try {
    // Get all active sources
    const activeSources = rssAggregator.getActiveSources();
    console.log(`📊 Found ${activeSources.length} active RSS sources`);
    
    // Warm cache for each source
    let successCount = 0;
    let errorCount = 0;
    
    for (const source of activeSources) {
      try {
        console.log(`🌐 Fetching ${source.name}...`);
        const articles = await rssAggregator.fetchFromSource(source);
        
        if (articles.length > 0) {
          rssCache.set(source.url, source, articles);
          successCount++;
          console.log(`✅ ${source.name}: ${articles.length} articles cached`);
        } else {
          console.log(`⚠️  ${source.name}: No articles found`);
        }
        
        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error fetching ${source.name}:`, error.message);
      }
    }
    
    // Report results
    const stats = rssCache.getStats();
    console.log('\n📈 Cache warming completed!');
    console.log(`✅ Successfully cached: ${successCount} sources`);
    console.log(`❌ Failed to cache: ${errorCount} sources`);
    console.log(`💾 Cache size: ${stats.cacheSize}KB`);
    console.log(`📊 Cached sources: ${stats.cachedSources}`);
    
  } catch (error) {
    console.error('💥 Cache warming failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  warmCache()
    .then(() => {
      console.log('🎉 Cache warming completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cache warming failed:', error);
      process.exit(1);
    });
}

module.exports = { warmCache };
