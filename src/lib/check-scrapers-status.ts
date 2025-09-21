#!/usr/bin/env tsx
/**
 * Check status of all configured scrapers
 */

import { webScraper, SCRAPER_SOURCES } from './web-scraper';

async function checkScraperStatus() {
  console.log('📊 Scraper Status Summary:');
  console.log('========================\n');

  const categories = ['BRICS', 'Indonesia', 'Bali'] as const;

  for (const category of categories) {
    const sources = SCRAPER_SOURCES.filter(s => s.category === category);
    const active = sources.filter(s => s.active);
    
    console.log(`${category}:`);
    console.log(`  Total: ${sources.length} scrapers`);
    console.log(`  Active: ${active.length} scrapers`);
    
    if (active.length > 0) {
      console.log('  Enabled:');
      active.forEach(s => console.log(`    ✅ ${s.name}`));
    }
    
    const inactive = sources.filter(s => !s.active);
    if (inactive.length > 0) {
      console.log('  Disabled:');
      inactive.forEach(s => console.log(`    ⚪ ${s.name}`));
    }
    
    console.log();
  }

  console.log('\n🌐 Testing active scrapers by category...\n');
  
  for (const category of categories) {
    const active = SCRAPER_SOURCES.filter(s => s.category === category && s.active);
    if (active.length > 0) {
      console.log(`Fetching from ${category} sources...`);
      const articles = await webScraper.scrapeByCategory(category);
      console.log(`  ✓ Fetched ${articles.length} articles from ${active.length} ${category} sources`);
      
      if (articles.length > 0) {
        console.log(`  📰 Latest: "${articles[0].title.substring(0, 60)}..."`);
      }
    }
  }
  
  console.log('\n✨ Scraper setup complete!');
  console.log('The enabled scrapers will now fetch articles alongside RSS feeds.');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkScraperStatus().catch(console.error);
}