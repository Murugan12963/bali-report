# Web Scraper Documentation

## Overview
The Bali Report project now includes web scraping capabilities to fetch articles from news websites that don't provide RSS feeds. This significantly expands our content coverage beyond traditional RSS sources.

## Enabled Scrapers

### BRICS Category (2 active)
- **Modern Diplomacy** (https://moderndiplomacy.eu/)
  - Status: ✅ Active
  - Articles fetched: ~25 per scrape
  - Focus: Geopolitical analysis, international relations
  
- **John Helmer** (https://johnhelmer.net/)
  - Status: ✅ Active
  - Articles fetched: ~8 per scrape
  - Focus: Russian politics, investigative journalism

### Indonesia Category (1 active)
- **Indonesia Business Post** (https://indonesiabusinesspost.com/)
  - Status: ✅ Active
  - Articles fetched: ~18 per scrape
  - Focus: Indonesian business, economy, politics

### Bali Category (3 active)
- **The Bali Sun** (https://thebalisun.com/)
  - Status: ✅ Active
  - Articles fetched: ~12 per scrape
  - Focus: Local Bali news, tourism
  
- **NOW! Bali** (https://nowbali.co.id/)
  - Status: ✅ Active
  - Articles fetched: Variable
  - Focus: Bali lifestyle, events, culture
  
- **Bali Post** (https://www.balipost.com/)
  - Status: ✅ Active (needs optimization)
  - Articles fetched: ~1 per scrape
  - Focus: Local Indonesian language news

## Pending/Disabled Scrapers
The following scrapers are configured but need selector refinement:

### BRICS
- Eurasia Review
- Katehon
- The Geopolitics
- Journal NEO (New Eastern Outlook)

### Indonesia
- SIT Journal (Security Intelligence Terrorism)
- Geopolstratindo

### Bali
- Coconuts Bali
- Bali Discovery
- Seminyak Times

## Usage

### Test Individual Scraper
```bash
npx tsx src/lib/test-scraper.ts "Scraper Name"
```

### Test All New Scrapers
```bash
npx tsx src/lib/test-new-scrapers.ts
```

### Check Scraper Status
```bash
npx tsx src/lib/check-scrapers-status.ts
```

### List All Available Sources
```bash
npx tsx src/lib/test-scraper.ts --list
```

## Configuration
Scrapers are configured in `/src/lib/web-scraper.ts` in the `SCRAPER_SOURCES` array. Each scraper configuration includes:

- **name**: Display name of the source
- **url**: URL to scrape
- **category**: 'BRICS' | 'Indonesia' | 'Bali'
- **selectors**: CSS selectors for extracting article data
- **baseUrl**: Base URL for resolving relative links
- **maxArticles**: Maximum articles to fetch per scrape
- **active**: Enable/disable the scraper

## Integration
Scrapers are automatically integrated with the RSS aggregator. Pages can enable scraping by passing `true` as the second parameter to `fetchByCategory()`:

```typescript
const articles = await rssAggregator.fetchByCategory('Bali', true);  // Enable scrapers
```

## Adding New Scrapers
1. Add configuration to `SCRAPER_SOURCES` array
2. Test with `npx tsx src/lib/test-scraper.ts "Source Name"`
3. Adjust selectors as needed
4. Set `active: true` when ready

## Performance Notes
- Scrapers run in parallel for better performance
- Failed scrapers don't block others
- Results are cached client-side
- Rate limiting is respected (1 second delay between tests)

## Troubleshooting
If a scraper stops working:
1. Check if the website structure has changed
2. Update CSS selectors accordingly
3. Test with the test scripts
4. Check for rate limiting or blocking

## Total Coverage
- **Active Scrapers**: 6
- **Additional Articles**: ~80+ per full scrape
- **Categories Covered**: All (BRICS, Indonesia, Bali)