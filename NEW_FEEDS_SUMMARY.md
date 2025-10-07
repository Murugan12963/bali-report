# New RSS Feeds and Scrapers - Added 2025-10-06

## Summary
Successfully added 11 new geopolitical RSS feeds and configured scraper fallbacks for all of them.

## New RSS Feeds Added

All feeds have been added to `/src/lib/rss-parser.ts` as BRICS category sources (active: true):

1. **UN News** - `https://news.un.org/feed/subscribe/en/news/all/rss.xml`
   - Global perspective on international affairs and human stories
   
2. **The Diplomat** - `https://thediplomat.com/feed/`
   - Asia-Pacific current affairs and international relations
   
3. **Global Issues** - `https://www.globalissues.org/news/feed`
   - International development and global policy issues
   
4. **E-International Relations** - `https://www.e-ir.info/feed/`
   - Academic perspectives on international relations
   
5. **Foreign Affairs Geopolitics** - `https://www.foreignaffairs.com/feeds/topic/Geopolitics/rss.xml`
   - Analysis of geopolitical developments
   
6. **Geopolitical Economy** - `https://geopoliticaleconomy.com/feed/`
   - News and analysis on global political economy
   
7. **Financial Times Geopolitics** - `https://www.ft.com/geopolitics?format=rss`
   - FT's geopolitical coverage
   
8. **RAND International Affairs** - `https://www.rand.org/topics/international-affairs.xml/feed`
   - Research and analysis on international affairs
   
9. **Geopolitical Futures** - `https://geopoliticalfutures.com/feed/`
   - Geopolitical forecasting and analysis
   
10. **Fifty Year Perspective** - `https://fiftyyearperspective.com/feed/`
    - Long-term geopolitical analysis
    
11. **Eclinik WordPress** - `https://eclinik.wordpress.com/feed/`
    - Healthcare and international perspectives

## Scraper Configurations Added

All scrapers have been added to `/src/lib/web-scraper.ts` with comprehensive CSS selectors:

Each scraper includes:
- **articleList**: Primary container selector for articles
- **articleLink**: Link to full article
- **articleTitle**: Article headline
- **articleDescription**: Article summary/excerpt
- **articleDate**: Publication date/time
- **articleAuthor**: Author byline
- **articleImage**: Featured/thumbnail image
- **baseUrl**: Base domain for resolving relative URLs
- **maxArticles**: 20-25 articles per source
- **active**: true (all enabled)

## RSS to Scraper Mapping

Updated the source name mapping in `web-scraper.ts` to enable automatic fallback from RSS to scraping when RSS feeds fail. The mapping ensures:

1. If an RSS feed fails to parse or times out
2. The system automatically attempts web scraping
3. Using the corresponding scraper configuration
4. Seamlessly providing content without errors

## Features

### Robust Fallback System
- RSS feeds are tried first (faster, less resource-intensive)
- If RSS fails, web scraping is automatically attempted
- Content moderation is applied to all sources (RSS and scraped)
- Duplicate detection prevents repeated articles
- Articles are cached for 5 minutes (300s) to reduce load

### Content Quality
- All sources focus on geopolitical analysis and international affairs
- Aligns with the BRICS/multipolar world news focus of the site
- Mix of mainstream (UN, FT, Foreign Affairs) and alternative perspectives (Geopolitical Economy, Fifty Year)
- Academic sources (E-IR) provide scholarly depth

### Error Handling
- All errors are logged as warnings rather than errors
- Fallback mechanisms ensure continuous operation
- No single source failure affects the entire system

## Testing Recommendations

1. **Restart the development server** to load new configurations
2. **Monitor the console** for RSS fetch attempts and scraper fallbacks
3. **Check article counts** - should see increase from new sources
4. **Verify scraping** - some feeds may fail RSS parsing and use scrapers
5. **Test BRICS page** - new articles should appear in the BRICS category

## Expected Behavior

On server start, you should see:
```
🌍 Fetching articles from 21 active sources...  (was 10, now 21)
Fetching RSS from UN News... (attempt 1/2)
Fetching RSS from The Diplomat... (attempt 1/2)
...
```

If RSS fails:
```
🕷️ Attempting web scraping fallback for [Source Name]...
🕷️ Scraping fallback for [Source Name] using config: [Scraper Name]
✅ Scraped X articles from [Source Name] as RSS fallback
```

## Files Modified

1. `/src/lib/rss-parser.ts` - Added 11 new RSS sources
2. `/src/lib/web-scraper.ts` - Added 11 new scraper configurations and updated source name mapping

## Notes

- All scrapers use multiple CSS selector fallbacks for robustness
- Selectors are based on common WordPress, article, and news site patterns
- May need fine-tuning based on actual site structures
- Some sites (especially FT, Foreign Affairs) may have paywalls affecting scraping
- UN News and official sources should be most reliable
