#!/usr/bin/env npx tsx

/**
 * Test script for web scraper functionality
 * Usage: npx tsx src/lib/test-scraper.ts [source-name]
 */

import { webScraper, SCRAPER_SOURCES } from './web-scraper';

async function testScrapers() {
  const args = process.argv.slice(2);
  const sourceName = args[0];

  if (sourceName) {
    // Test specific scraper
    await webScraper.testScraper(sourceName);
  } else {
    // List all available scrapers
    console.log('\n📋 Available Scraper Sources:\n');
    console.log('┌─────────────────────┬────────────┬──────────┐');
    console.log('│ Source Name         │ Category   │ Status   │');
    console.log('├─────────────────────┼────────────┼──────────┤');
    
    SCRAPER_SOURCES.forEach(source => {
      const name = source.name.padEnd(20);
      const category = source.category.padEnd(11);
      const status = source.active ? '✅ Active' : '⏸️  Inactive';
      console.log(`│ ${name}│ ${category}│ ${status} │`);
    });
    
    console.log('└─────────────────────┴────────────┴──────────┘');
    
    console.log('\n💡 Usage: npx tsx src/lib/test-scraper.ts "Source Name"');
    console.log('Example: npx tsx src/lib/test-scraper.ts "The Bali Sun"\n');

    // Test all active scrapers
    const activeSources = SCRAPER_SOURCES.filter(s => s.active);
    if (activeSources.length > 0) {
      console.log(`\n🧪 Testing ${activeSources.length} active scrapers...\n`);
      
      for (const source of activeSources) {
        await webScraper.testScraper(source.name);
        console.log('\n' + '─'.repeat(60) + '\n');
      }
    } else {
      console.log('ℹ️ No active scrapers to test. Enable scrapers in web-scraper.ts\n');
    }
  }
}

// Run the test
testScrapers().catch(console.error);