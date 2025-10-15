# RSS.app Setup Guide for Bali Report

This guide walks you through setting up RSS.app feeds to replace the current complex RSS + web scraping system.

## Step 1: Create RSS.app Account

1. Go to [rss.app](https://rss.app)
2. Sign up for a free account 
3. The free tier includes:
   - Up to 20 feeds
   - 1,000 articles per month
   - Basic customization

## Step 2: Create RSS.app Feeds

### BRICS Global News Feeds

#### Feed 1: BRICS Global News
1. **RSS Generator**: Use "RSS Generator" to create feed from multiple sources
2. **Sources to combine**:
   - https://www.rt.com/rss/
   - https://tass.com/rss/v2.xml
   - http://www.xinhuanet.com/english/rss/worldrss.xml
   - https://www.cgtn.com/subscribe/rss/section/world.xml
3. **Feed name**: "BRICS Global News"
4. **Keywords**: "BRICS", "Russia", "China", "multipolar", "geopolitics"
5. **Copy the generated RSS.app URL**

#### Feed 2: BRICS India Perspective  
1. **RSS Generator**: Combine Indian sources
2. **Sources**:
   - https://feeds.feedburner.com/ndtvnews-latest
   - https://feeds.feedburner.com/ndtvnews-world
   - https://feeds.feedburner.com/ndtvnews-business
3. **Keywords**: "India", "BRICS", "Modi", "geopolitics", "economy"

#### Feed 3: BRICS China Focus
1. **RSS Generator**: Chinese perspective
2. **Sources**:
   - https://www.cgtn.com/subscribe/rss/section/world.xml
   - https://www.chinadaily.com.cn/rss/world_rss.xml
3. **Keywords**: "China", "Beijing", "Belt Road", "BRICS", "Xi Jinping"

#### Feed 4: BRICS Russia Coverage
1. **RSS Generator**: Russian sources
2. **Sources**:
   - https://www.rt.com/rss/
   - https://tass.com/rss/v2.xml
   - https://sputnikglobe.com/export/rss2/archive/index.xml
3. **Keywords**: "Russia", "Putin", "Moscow", "BRICS", "multipolar"

#### Feed 5: BRICS Middle East
1. **RSS Generator**: Middle Eastern perspective
2. **Sources**:
   - https://www.aljazeera.com/xml/rss/all.xml
   - https://www.presstv.ir/rss.xml
3. **Keywords**: "Middle East", "Iran", "Palestine", "BRICS", "resistance"

### Indonesia News Feeds

#### Feed 6: Indonesia National News
1. **RSS Generator**: Indonesian sources
2. **Sources**:
   - https://www.antaranews.com/rss/terkini.xml
   - https://jakartaglobe.id/feed
   - https://indonesiabusinesspost.com/feed/
3. **Keywords**: "Indonesia", "Jakarta", "Jokowi", "ASEAN"

#### Feed 7: Indonesia Business & Economy
1. **RSS Generator**: Business focus
2. **Sources**:
   - https://indonesiabusinesspost.com/feed/
   - Filter for business/economy articles
3. **Keywords**: "Indonesia", "economy", "business", "investment", "trade"

#### Feed 8: Southeast Asia Regional
1. **RSS Generator**: Regional coverage
2. **Sources**:
   - https://feeds.bbci.co.uk/news/world/asia/rss.xml
   - Filter for Indonesia/SE Asia content
3. **Keywords**: "Southeast Asia", "ASEAN", "Indonesia", "regional"

### Bali Specific Feeds

#### Feed 9: Bali Tourism & Events
1. **RSS Generator**: Bali tourism focus
2. **Sources**:
   - https://www.balipost.com/rss
   - Filter for tourism/events
3. **Keywords**: "Bali", "tourism", "events", "festival", "travel"

#### Feed 10: Bali Local News
1. **RSS Generator**: Local Bali news
2. **Sources**:
   - https://www.balipost.com/rss
   - Filter for local news
3. **Keywords**: "Bali", "Denpasar", "local", "government", "community"

### Geopolitical Analysis Feeds

#### Feed 11: Global Geopolitics Analysis
1. **RSS Generator**: Analysis sources
2. **Sources**:
   - https://thediplomat.com/feed/
   - https://news.un.org/feed/subscribe/en/news/all/rss.xml
   - https://www.globalissues.org/news/feed
3. **Keywords**: "geopolitics", "international", "analysis", "diplomacy"

#### Feed 12: BRICS Organizations Official
1. **RSS Generator**: BRICS organizations
2. **Sources**:
   - https://infobrics.org/rss/
   - https://geopoliticaleconomy.com/feed/
3. **Keywords**: "BRICS", "organization", "official", "summit", "cooperation"

## Step 3: Update Configuration File

Once you have all RSS.app feed URLs, update `src/lib/rss-sources-rssapp.ts`:

```typescript
export const RSS_APP_SOURCES: NewsSource[] = [
  {
    name: 'BRICS Global News',
    url: 'https://rss.app/feeds/v1.1/YOUR_ACTUAL_FEED_ID_1.xml', // Replace with real URL
    category: 'BRICS',
    active: true,
    rssAppId: 'brics_global',
    description: 'Aggregated BRICS news from RT, TASS, Xinhua, CGTN, Sputnik'
  },
  // ... update all URLs with real RSS.app feed URLs
];
```

## Step 4: Test RSS.app Feeds

Test each feed URL individually:

```bash
# Test a feed URL
curl "https://rss.app/feeds/v1.1/YOUR_FEED_ID.xml"
```

## Step 5: Replace Current RSS Parser

Replace the current RSS parser imports in your pages:

```typescript
// Old import
import { fetchAllArticles } from '@/lib/rss-parser';

// New import  
import { fetchAllArticles } from '@/lib/rss-parser-rssapp';
```

## Step 6: Update Main Pages

Update these files to use the new RSS.app parser:

1. `src/app/page.tsx` - Homepage
2. `src/app/brics/page.tsx` - BRICS page  
3. `src/app/indonesia/page.tsx` - Indonesia page
4. `src/app/bali/page.tsx` - Bali page

## RSS.app Feed URLs Template

Here's the template structure for RSS.app URLs:

```
https://rss.app/feeds/v1.1/FEED_ID_HERE.xml
```

### Example RSS.app Feed Configuration

For each RSS.app feed you create, you'll get a unique URL like:
- `https://rss.app/feeds/v1.1/abc123def456.xml`

## Benefits of RSS.app Approach

### ✅ Advantages
- **Reliability**: RSS.app handles uptime and caching
- **Simplicity**: No complex web scraping fallbacks needed  
- **Deduplication**: RSS.app removes duplicate articles automatically
- **Filtering**: Built-in keyword filtering and content moderation
- **Performance**: Optimized feeds with proper caching headers
- **Maintenance**: No need to maintain scraper configurations

### 📊 Expected Performance
- **Startup Time**: Much faster (no web scraping delays)
- **Reliability**: 99.9% uptime via RSS.app infrastructure  
- **Article Quality**: Higher quality due to RSS.app filtering
- **Maintenance**: Minimal - just RSS.app feed management

## Next Steps

1. ✅ Create RSS.app account
2. ✅ Set up 12 RSS feeds as described above  
3. ✅ Get real RSS.app feed URLs
4. ✅ Update `rss-sources-rssapp.ts` with real URLs
5. ✅ Test RSS.app integration
6. ✅ Switch to RSS.app-only system
7. ✅ Remove old RSS + scraping code
8. ✅ Update documentation

## Troubleshooting

### Feed Not Working
1. Check RSS.app dashboard for feed status
2. Verify source URLs are still active
3. Check RSS.app feed settings (keywords, filters)

### Low Article Count  
1. Reduce keyword filtering in RSS.app
2. Add more source URLs to the feed
3. Check RSS.app article limits

### Content Quality Issues
1. Adjust RSS.app content filters
2. Enable RSS.app deduplication
3. Review keyword configuration

This RSS.app approach will significantly simplify your news feed system while improving reliability and performance!