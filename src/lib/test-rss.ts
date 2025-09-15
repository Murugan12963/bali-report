#!/usr/bin/env tsx

/**
 * Test script for RSS aggregation functionality.
 * 
 * Usage:
 *   npx tsx src/lib/test-rss.ts
 */

import { rssAggregator, NEWS_SOURCES } from './rss-parser';

async function testRSSAggregation() {
  console.log('🚀 Testing RSS Aggregation for Bali Report\n');
  
  // Test individual sources
  console.log('📡 Testing individual sources...\n');
  
  for (const source of NEWS_SOURCES.slice(0, 2)) { // Test first 2 sources
    console.log(`Testing ${source.name} (${source.category})...`);
    const success = await rssAggregator.testSource(source.name);
    console.log(`Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}\n`);
  }
  
  // Test category-based fetching
  console.log('🏷️  Testing category-based fetching...\n');
  
  try {
    const bricsArticles = await rssAggregator.fetchByCategory('BRICS');
    console.log(`✅ BRICS category: ${bricsArticles.length} articles`);
    
    const indonesiaArticles = await rssAggregator.fetchByCategory('Indonesia');
    console.log(`✅ Indonesia category: ${indonesiaArticles.length} articles`);
    
    const baliArticles = await rssAggregator.fetchByCategory('Bali');
    console.log(`✅ Bali category: ${baliArticles.length} articles`);
    
  } catch (error) {
    console.error('❌ Category testing failed:', error);
  }
  
  console.log('\n🌍 Testing combined source fetching...\n');
  
  try {
    const allArticles = await rssAggregator.fetchAllSources();
    console.log(`✅ Total articles from all sources: ${allArticles.length}`);
    
    if (allArticles.length > 0) {
      console.log('\n📰 Sample articles:');
      allArticles.slice(0, 3).forEach((article, index) => {
        console.log(`\\n${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.source} (${article.category})`);
        console.log(`   Date: ${new Date(article.pubDate).toLocaleDateString()}`);
        console.log(`   Description: ${article.description.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Combined fetching failed:', error);
  }
  
  console.log('\n🎯 RSS Aggregation Test Complete!');
}

// Handle command line execution
if (require.main === module) {
  testRSSAggregation().catch(console.error);
}

export { testRSSAggregation };