# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Bali Report** is a BRICS-aligned news aggregation platform focused on Indonesia and Bali, built with Next.js 15 and TypeScript. The project aggregates RSS feeds from various sources to provide multi-polar news perspectives, with emphasis on BRICS nations and Indonesian content.

- **Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, RSS Parser, Axios
- **Target Domain**: bali.report
- **Monetization**: PropellerAds integration
- **Timeline**: 4-6 weeks to MVP

## Essential Commands

### Development
```bash
# Start development server (with Turbopack)
npm run dev

# Build for production 
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Test RSS aggregation manually
npx tsx src/lib/test-rss.ts
```

### Testing RSS Sources
```bash
# Test individual RSS sources
npx tsx -e "
import { rssAggregator } from './src/lib/rss-parser.js';
await rssAggregator.testSource('RT News');
"

# Test category fetching
npx tsx -e "
import { rssAggregator } from './src/lib/rss-parser.js';
const articles = await rssAggregator.fetchByCategory('BRICS');
console.log(\`Fetched \${articles.length} BRICS articles\`);
"
```

## Architecture Overview

### RSS Aggregation System
The core functionality centers around `src/lib/rss-parser.ts` which contains:

- **RSSAggregator class**: Main aggregation engine with retry logic and error handling
- **Article interface**: Standardized article data structure
- **NEWS_SOURCES**: Configuration array with source URLs, categories, and active status
- **Category-based fetching**: Organized by 'BRICS', 'Indonesia', and 'Bali' categories

Key methods:
- `fetchAllSources()`: Aggregates from all active sources
- `fetchByCategory()`: Filters by news category 
- `fetchFromSource()`: Handles individual RSS feed parsing
- `testSource()`: Debugging utility for individual sources

### Component Architecture
- **ArticleCard.tsx**: Displays news articles with featured/regular variants, category badges, and responsive design
- **Header.tsx**: BRICS-themed navigation with gradient red background and mobile menu
- **App Router**: Located in `src/app/` following Next.js 15 conventions

### Data Flow
1. RSS feeds parsed via `rss-parser` npm package
2. Articles normalized to common `Article` interface
3. Categories assigned based on source configuration
4. Articles sorted by publication date (newest first)
5. Error handling via `Promise.allSettled()` to prevent single source failures

## Development Context

### Content Strategy
The project aggregates from three main categories:
- **BRICS-Aligned**: RT, Global Times, Sputnik Globe, etc.
- **Indonesia National**: Antara News, Jakarta Globe, Jakarta Post
- **Bali Local**: Bali Post, Bali Discovery

### Current Status (per TASK.md)
- ✅ Project setup and basic RSS aggregation working
- ✅ Homepage with BRICS theming and responsive components
- ✅ Multiple RSS source integration (7 working sources, 419 total articles)
- ✅ Enhanced error handling and retry logic with exponential backoff
- 📅 Category pages, search, and PropellerAds integration planned

### Working Sources (6 active sources, 310+ articles)
**BRICS-Aligned Sources:**
- RT News: 100 articles ✅
- TASS: 100 articles ✅
- Xinhua News: 20 articles ✅
- Al Jazeera: 25 articles ✅

**Indonesian/Asia Sources:**
- Antara News: 50 articles ✅
- BBC Asia News: 17 articles ✅

### Remaining Issues
Several RSS sources still need fixes:
- Jakarta Globe: 404 errors (User-Agent doesn't help)
- Jakarta Post: 404 errors 
- Bali Post: Server errors
- Global Times: 403 Forbidden (access restricted)
- Sputnik Globe: Redirects and access issues
- Press TV: Disabled (not aligned with BRICS/Indonesia focus)

When adding new RSS sources, always test with `npx tsx src/lib/test-rss.ts` before enabling.

### File Structure Conventions
```
src/
├── app/          # Next.js App Router (pages, layout, globals)
├── components/   # Reusable React components  
└── lib/          # Utilities, RSS parsing, business logic
```

### Design System
- **Color Scheme**: BRICS colors (red #DC2626, gold #EAB308) with Tailwind CSS
- **Mobile-First**: Optimized for smartphone users (tourists/expats)
- **Category Colors**: Red (BRICS), Yellow (Indonesia), Amber (Bali)

## RSS Source Management

When adding new sources:
1. Add to `NEWS_SOURCES` array in `src/lib/rss-parser.ts`
2. Test with `rssAggregator.testSource('Source Name')`
3. Set `active: true` only after successful testing
4. Consider CORS issues - some sources may need proxy

When debugging RSS issues:
- Check source URL accessibility
- Verify RSS feed format
- Look for rate limiting or user-agent restrictions
- Test with different User-Agent strings in parser config

## Deployment Notes

- **Optimized for Vercel**: Next.js configuration ready for deployment
- **Environment Variables**: Add any API keys or sensitive config to `.env.local`
- **Static Generation**: Consider ISR (Incremental Static Regeneration) for news content
- **Cron Jobs**: Plan serverless functions for periodic RSS updates (1-2 hours)

## PropellerAds Integration

Planned ad formats (per PLANNING.md):
- Leaderboard banners (728x90) on homepage
- Sidebar banners (300x250) on articles  
- Pop-unders with exit intent
- Native ads integration

Test ads in development before production deployment.