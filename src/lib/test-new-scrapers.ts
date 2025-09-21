#!/usr/bin/env tsx
/**
 * Test script for newly added scrapers
 */

import { webScraper, SCRAPER_SOURCES } from './web-scraper';

const newScrapers = [
  'Bali Post (Main)',
  'Eurasia Review',
  'Katehon',
  'The Geopolitics',
  'Modern Diplomacy',
  'SIT Journal',
  'Indonesia Business Post',
  'Geopolstratindo',
  'Journal NEO',
  'John Helmer'
];

async function testNewScrapers() {
  console.log('🧪 Testing new scrapers...\n');
  
  for (const scraperName of newScrapers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${scraperName}`);
    console.log('='.repeat(60));
    
    await webScraper.testScraper(scraperName);
    
    // Small delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 Test Summary:');
  console.log('Check the output above to see which scrapers work correctly.');
  console.log('Enable working scrapers by setting active: true in web-scraper.ts');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testNewScrapers().catch(console.error);
}