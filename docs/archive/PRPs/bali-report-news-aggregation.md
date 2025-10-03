name: "Bali Report News Aggregation Platform – Context-Rich PRP"
description: |

## Purpose
Transform the minimal Bali Report site (bali.report) into a fully functional BRICS-aligned news aggregation platform with multilingual support, ad monetization, and promotional features for the BRICS Partnership for Development (BPD). Built to deliver multipolarity-focused news alongside Bali/Indonesia content for locals, expats, and tourists, with revenue generation via Adsterra ads and Stripe subscriptions/donations.

## Core Principles
1. **Context is King**: Encode all requirements from INITIAL.md with complete integration examples
2. **Validation Loops**: Provide executable Lighthouse, a11y, SEO, and functional tests
3. **Information Dense**: Explicit tech stack, library quirks, and deployment patterns
4. **Progressive Success**: MVP in 2-4 weeks; iterate with BPD fundraising features
5. **Global rules**: Follow all rules in CLAUDE.md

---

## Goal
Launch a fast, accessible, bilingual (EN/ID) news aggregation platform at **bali.report** that:
- Aggregates BRICS-aligned news from 10+ RSS feeds (Sputnik, RT, New Eastern Outlook, etc.)
- Provides dedicated Bali/Indonesia news and events sections
- Implements Adsterra display ads and Stripe-based subscriptions/donations for BPD
- Delivers SEO-optimized, mobile-first UX with offline caching
- Supports social sharing, search, personalized feeds, and community engagement
- Deploys on DigitalOcean with privacy-focused Matomo analytics

## Why
- **Business value**: Establish credibility for BRICS multipolarity advocacy; fundraise 20% of subscription revenue for BPD initiatives (agri-tech, renewable energy in Bali/Indonesia)
- **User impact**: Provide alternative news perspectives to counter Western media hegemony; serve Bali community with local events and tourism news
- **Integration**: Promotional arm for BPD; foundation for future features (member portal, donation tracking, event ticketing)
- **Problems solved**: Content discovery for BRICS audience; revenue generation without platform censorship risks

## What
User-visible and technical requirements derived from INITIAL.md.

### User-visible
- **Homepage**: Carousel of top 5 BRICS stories, sidebar with Bali events ticker, category navigation
- **Content Categories**: BRICS Global (Russia, China, India, Brazil, South Africa, BRICS+), Indonesia News (National, Bali Events, Economy/Tourism)
- **Article Display**: Cards with title, excerpt (150-200 words), thumbnail, source credit, "Read More" link
- **Search**: Full-text search across aggregated articles
- **Personalization**: User preference selection for topics (e.g., "BRICS Economy", "Bali Tourism"); localStorage-based recommendations
- **Bali Events**: Dedicated page with festivals (Nyepi, Galungan), conferences, tourism highlights
- **Interactivity**: Infinite scroll, social sharing (X, Telegram, WhatsApp, VK), upvote/downvote for community picks, Disqus comments
- **Ads**: Adsterra banners (leaderboard, sidebar, native in-feed ads)
- **Monetization**: $2-5/month ad-free subscription; one-time donations to BPD; progress trackers for fundraising campaigns
- **Multilingual**: English/Indonesian toggle with localized metadata
- **Offline**: Service worker for cached articles; "Save for Later" feature

### Technical
- **Stack**: Next.js 15 (App Router) + TypeScript, Tailwind CSS, next-intl for i18n
- **Aggregation**: rss-parser for RSS feeds; cron job (DigitalOcean Functions or pm2) every 1-2 hours
- **Database**: Redis/SQLite on DigitalOcean Spaces for feed caching and article metadata
- **Ads**: Adsterra JavaScript SDK with Next.js Script components (afterInteractive strategy)
- **Payments**: Stripe Checkout for subscriptions/donations; webhook for event handling
- **Analytics**: Self-hosted Matomo on DigitalOcean for GDPR compliance
- **Hosting**: DigitalOcean App Platform (auto-deploy from GitHub) with CDN; domain via registrar
- **Performance**: LCP < 2.5s, FID < 100ms, CLS < 0.1; Next/Image optimization, code splitting
- **Accessibility**: WCAG 2.1 AA (focus states, alt text, contrast, semantic HTML)
- **Security**: HTTPS, CSP, rate limiting on POST endpoints, CAPTCHA for forms, sanitized user inputs
- **SEO**: Dynamic meta tags, Open Graph/Twitter cards, sitemap.xml, robots.txt, NewsArticle schema

### Success Criteria
- [ ] RSS aggregation from 10+ sources with 1-2 hour refresh cycle
- [ ] Homepage displays top BRICS stories carousel and Bali events sidebar
- [ ] Category pages (BRICS Global, Indonesia News) with filters and search
- [ ] Article detail view with social sharing, comments, and related articles
- [ ] Adsterra ads (banners, native) render correctly without blocking page load
- [ ] Stripe subscriptions ($2-5/month) and donations functional with webhooks
- [ ] Bilingual (EN/ID) with locale switcher and localized metadata
- [ ] Matomo analytics tracking pageviews, CTA clicks, and ad performance
- [ ] Lighthouse scores ≥ 90 (desktop), ≥ 80 (mobile) for performance
- [ ] No critical a11y violations (axe); color contrast passes
- [ ] Deployed to bali.report on DigitalOcean with SSL and CDN
- [ ] Offline caching via service worker; "Save for Later" works

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include in context window
- file: /home/murugan/Context-Engineering-Intro/INITIAL.md
  why: Canonical requirements, source list, tech stack, BPD integration details
  
- doc: https://nextjs.org/docs/app
  section: App Router, Image Optimization, Metadata API, Route Handlers
  critical: Use App Router for SSR/SSG; next/image for lazy loading; Metadata API for dynamic SEO

- doc: https://github.com/rbren/rss-parser
  section: parseURL, parseString, custom fields, TypeScript
  critical: >
    rss-parser usage:
    - const parser = new Parser(); await parser.parseURL('https://feed.url')
    - Returns { title, description, items: [{ title, link, pubDate, content }] }
    - Custom fields: customFields: { item: ['media:content', 'dc:creator'] }
    - Error handling: Wrap in try/catch; fallback to cached content

- doc: https://next-intl.dev/docs/getting-started/app-router
  section: Routing, Metadata, Server/Client Components
  critical: >
    next-intl setup:
    - Install: npm install next-intl
    - Create messages/en.json, messages/id.json
    - Use getRequestConfig() in src/i18n/request.ts
    - Wrap app with NextIntlClientProvider in app/[locale]/layout.tsx
    - Server: getTranslations(); Client: useTranslations()

- doc: https://docs.stripe.com/payments/checkout
  section: Checkout Session, Webhooks, Subscriptions
  critical: >
    Stripe integration:
    - Backend: /api/stripe/checkout creates session with line_items
    - Frontend: Redirects to Stripe hosted checkout
    - Webhooks: /api/webhooks/stripe verifies signature with stripe.webhooks.constructEvent()
    - Subscription events: checkout.session.completed, invoice.payment_succeeded

- doc: https://docs.digitalocean.com/products/app-platform/getting-started/sample-apps/next.js/
  section: Deploy from GitHub, Build settings, Environment variables
  critical: >
    DigitalOcean deployment:
    - Auto-detects package.json and builds with npm run build
    - Environment: Set NEXT_PUBLIC_* for client-side vars
    - Region: Select Indonesia (Jakarta) for low latency
    - CDN: Auto-enabled for static assets

- doc: https://developer.matomo.org/guides/tracking-javascript-guide
  section: JavaScript Tracking Client, Custom Dimensions, Events
  critical: >
    Matomo self-hosted:
    - Add tracking code to app/layout.tsx (defer script)
    - Track events: _paq.push(['trackEvent', 'Category', 'Action', 'Name'])
    - Privacy: Enable anonymizeIp for GDPR; no cookies mode

- doc: https://stackoverflow.com/questions/75563064/how-to-implement-adsterra-in-next-js-react-js-project
  section: Next.js Script component, avoiding document.write
  critical: >
    Adsterra in Next.js:
    - Use <Script strategy="afterInteractive" src="adsterra-url" />
    - Create separate components for each ad zone
    - Avoid document.write() which breaks Next.js rendering
    - Dynamic import with ssr: false for ad components if needed

- doc: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
  section: Dynamic metadata, Open Graph, Twitter cards
  critical: Use generateMetadata() in page.tsx for per-article SEO

- doc: https://web.dev/articles/vitals
  section: LCP, FID, CLS thresholds
  critical: Target LCP < 2.5s, FID < 100ms, CLS < 0.1 for good UX

- doc: https://nextjs.org/docs/app/getting-started/sitemap
  section: sitemap.ts for dynamic sitemap generation
  critical: Export sitemap() function returning MetadataRoute.Sitemap array
```

### Current Codebase (Assumed Live Site Structure)
```bash
# Current bali.report site shows minimal loading screen; no visible code structure
# Assumed starting point: Next.js 15 App Router with basic setup
# Files to reference: app/page.tsx (loading screen), app/layout.tsx (title/meta)
```

### Desired Project Structure (Next.js 15 App Router)
```bash
bali-report/
├── app/
│   ├── [locale]/                          # i18n routing
│   │   ├── layout.tsx                     # Locale layout with nav/footer
│   │   ├── page.tsx                       # Homepage: carousel + events
│   │   ├── brics-global/
│   │   │   ├── page.tsx                   # BRICS category with filters
│   │   │   └── [slug]/page.tsx            # Article detail
│   │   ├── indonesia-news/
│   │   │   ├── page.tsx                   # Indonesia category
│   │   │   └── [slug]/page.tsx
│   │   ├── bali-events/page.tsx           # Dedicated events page
│   │   ├── search/page.tsx                # Search results
│   │   └── subscribe/page.tsx             # Subscription/donation page
│   ├── api/
│   │   ├── feeds/
│   │   │   ├── aggregate/route.ts         # Fetch all RSS feeds
│   │   │   └── cache/route.ts             # Retrieve cached articles
│   │   ├── stripe/
│   │   │   └── checkout/route.ts          # Create Stripe session
│   │   ├── webhooks/
│   │   │   └── stripe/route.ts            # Handle Stripe events
│   │   └── search/route.ts                # Full-text search API
│   ├── sitemap.ts                         # Dynamic sitemap
│   ├── robots.ts                          # Robots.txt
│   └── layout.tsx                         # Root layout with providers
├── components/
│   ├── feed/
│   │   ├── ArticleCard.tsx                # Article card with excerpt/thumbnail
│   │   ├── FeedCarousel.tsx               # Top 5 BRICS stories
│   │   ├── FeedGrid.tsx                   # Grid/list view toggle
│   │   └── FeedFilters.tsx                # Category/source filters
│   ├── ads/
│   │   ├── AdsterraLeaderboard.tsx        # 728x90 banner
│   │   ├── AdsterraSidebar.tsx            # 300x250 sidebar
│   │   └── AdsterraNative.tsx             # In-feed native ad
│   ├── layout/
│   │   ├── Header.tsx                     # Sticky nav with locale switcher
│   │   ├── Footer.tsx                     # Source links, legal, social
│   │   └── Sidebar.tsx                    # Bali events ticker
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── SearchBar.tsx
│   │   └── ShareButtons.tsx               # X, Telegram, WhatsApp, VK
│   └── providers/
│       ├── MatomoProvider.tsx             # Matomo tracking context
│       └── ThemeProvider.tsx              # Dark mode toggle (future)
├── lib/
│   ├── rss/
│   │   ├── parser.ts                      # rss-parser wrapper
│   │   ├── sources.ts                     # Feed URLs and metadata
│   │   └── cache.ts                       # Redis/SQLite cache logic
│   ├── stripe/
│   │   ├── checkout.ts                    # Create sessions
│   │   └── webhooks.ts                    # Verify and handle events
│   ├── analytics/
│   │   └── matomo.ts                      # Matomo helpers
│   ├── i18n/
│   │   ├── request.ts                     # getRequestConfig
│   │   └── config.ts                      # Supported locales
│   ├── seo/
│   │   └── metadata.ts                    # generateMetadata helpers
│   └── utils/
│       ├── date.ts                        # Date formatting
│       └── sanitize.ts                    # Input sanitization
├── messages/
│   ├── en.json                            # English translations
│   └── id.json                            # Indonesian translations
├── public/
│   ├── images/
│   │   ├── placeholder-article.webp       # Fallback thumbnail
│   │   └── brics-logo.svg
│   └── sw.js                              # Service worker for offline
├── styles/
│   └── globals.css                        # Tailwind + custom styles
├── .env.example
├── next.config.ts                         # next-intl plugin
├── package.json
├── tsconfig.json
└── README.md
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: rss-parser may fail on malformed XML; wrap in try/catch with fallback
// Example: Some BRICS sources (e.g., RT.com) may have rate limits; implement exponential backoff

// CRITICAL: Adsterra script uses document.write() which breaks Next.js
// Solution: Use <Script strategy="afterInteractive" /> and dynamic import with ssr: false

// CRITICAL: Stripe webhooks require signature verification to prevent spoofing
// Use: stripe.webhooks.constructEvent(body, signature, webhookSecret)

// CRITICAL: next-intl requires locale in routing; use middleware or [locale] folder
// Ensure generateMetadata() returns locale-specific title/description

// CRITICAL: DigitalOcean App Platform auto-detects build commands
// If custom build needed, specify in app spec: buildCommand: "npm run build:custom"

// CRITICAL: Matomo tracking script should load with defer to avoid blocking render
// Add to app/layout.tsx: <Script defer src="matomo-url" />

// CRITICAL: Service worker must be registered in _app.tsx (if pages) or layout.tsx (if app)
// Use workbox for Next.js: npx workbox generateSW workbox-config.js

// CRITICAL: RSS feeds from BRICS sources may have inconsistent date formats
// Normalize with date-fns or dayjs: parseISO() then format()

// CRITICAL: Next.js Image requires domains to be whitelisted in next.config.ts
// Add: images: { remotePatterns: [{ hostname: 'sputnikglobe.com' }] }

// CRITICAL: Infinite scroll requires intersection observer; use react-intersection-observer
// Trigger fetch when last article card enters viewport

// CRITICAL: Stripe requires HTTPS for webhooks in production
// DigitalOcean App Platform auto-provisions SSL; ensure webhook URL is https://

// CRITICAL: Disqus embed may block render; use dynamic import
// const DisqusEmbed = dynamic(() => import('disqus-react'), { ssr: false })
```

## Implementation Blueprint

### Data Models and Structure
```typescript
// Article from RSS feed
export interface Article {
  id: string                    // Generated hash of link + pubDate
  title: string
  excerpt: string               // First 150-200 chars of content
  content: string               // Full HTML content from feed
  link: string                  // Original article URL
  source: {
    name: string                // e.g., "Sputnik Global"
    feed: string                // Feed URL
    logo?: string
  }
  thumbnail?: string            // Extract from media:content or enclosure
  pubDate: Date
  author?: string
  categories: string[]          // e.g., ["brics", "russia", "economy"]
  locale: 'en' | 'id'           // Auto-detected or default to 'en'
}

// Feed source configuration
export interface FeedSource {
  id: string
  name: string
  url: string
  category: 'brics' | 'indonesia' | 'bali-events'
  subcategory?: string          // e.g., "russia", "tourism"
  locale: 'en' | 'id'
  refreshInterval: number       // Minutes between fetches
  keywords?: string[]           // Filter articles by keywords
}

// User preferences (localStorage)
export interface UserPreferences {
  topics: string[]              // e.g., ["BRICS Economy", "Bali Tourism"]
  viewMode: 'grid' | 'list' | 'magazine'
  savedArticles: string[]       // Article IDs
}

// BPD donation campaign
export interface Campaign {
  id: string
  title: string
  description: string
  goal: number                  // USD
  raised: number                // USD
  endDate: Date
}
```

### List of Tasks (Ordered for Implementation)
```yaml
Task 1: Project Initialization & Core Setup
DESCRIPTION: >
  Bootstrap Next.js 15 with TypeScript, Tailwind CSS, ESLint, Prettier.
  Install dependencies: rss-parser, next-intl, stripe, @matomo/tracker.
  Configure next.config.ts with next-intl plugin and image domains.
  Setup .env.example with STRIPE_SECRET_KEY, MATOMO_URL, ADSTERRA_PUBLISHER_ID.
VALIDATION: >
  npm run dev succeeds; TypeScript compiles without errors.

Task 2: i18n Foundation with next-intl
CREATE messages/en.json and messages/id.json with base translations.
CREATE src/i18n/request.ts with getRequestConfig loading messages by locale.
MODIFY app/layout.tsx to wrap with NextIntlClientProvider.
CREATE app/[locale]/layout.tsx for locale-aware routing.
MODIFY next.config.ts to add createNextIntlPlugin().
VALIDATION: >
  Visit /en and /id routes; locale switcher toggles translations.

Task 3: RSS Feed Aggregation Module
CREATE lib/rss/sources.ts with FeedSource[] array of 10+ BRICS/Indonesia feeds.
CREATE lib/rss/parser.ts with fetchFeed(source: FeedSource) function.
  - Use rss-parser to parseURL()
  - Map items to Article model
  - Extract thumbnail from media:content or enclosure
  - Handle errors with try/catch and log to console
CREATE lib/rss/cache.ts with Redis/SQLite integration.
  - cacheArticles(articles: Article[])
  - getCachedArticles(category?: string): Article[]
CREATE app/api/feeds/aggregate/route.ts (POST) to trigger manual fetch.
VALIDATION: >
  curl -X POST /api/feeds/aggregate returns { success: true, count: N }
  Check logs for fetched articles; inspect cached data.

Task 4: Cron Job for Feed Refresh
SETUP DigitalOcean Functions or pm2 cron job to call /api/feeds/aggregate every 1-2 hours.
  - Option A: DigitalOcean Functions (serverless) triggered by scheduler
  - Option B: pm2 ecosystem.config.js with cron_restart
CREATE lib/cron/refresh-feeds.ts (if using Functions) that POSTs to /api/feeds/aggregate.
VALIDATION: >
  Check DigitalOcean Functions logs or pm2 logs after 2 hours; verify new articles cached.

Task 5: Homepage with Carousel & Events Sidebar
CREATE app/[locale]/page.tsx (Homepage).
  - Fetch top 5 BRICS articles (most recent or highest engagement)
  - Fetch Bali events from cached articles with category="bali-events"
CREATE components/feed/FeedCarousel.tsx with auto-rotating carousel (Swiper.js or Embla).
CREATE components/layout/Sidebar.tsx with Bali events ticker.
ADD dynamic metadata with generateMetadata() for SEO.
VALIDATION: >
  Visit /en and /id; carousel auto-rotates; sidebar displays events.
  Lighthouse performance ≥ 80 for homepage.

Task 6: Category Pages with Filters & Search
CREATE app/[locale]/brics-global/page.tsx.
  - Fetch articles with category="brics"
  - Render components/feed/FeedGrid.tsx
CREATE components/feed/FeedFilters.tsx with dropdowns for subcategory and source.
CREATE app/[locale]/indonesia-news/page.tsx similarly.
CREATE app/api/search/route.ts with full-text search on cached articles.
  - Use simple .filter() for MVP; upgrade to Algolia later
CREATE app/[locale]/search/page.tsx with SearchBar and results.
VALIDATION: >
  Filter by subcategory (e.g., "Russia"); search for "BRICS summit"; results accurate.

Task 7: Article Detail Page
CREATE app/[locale]/brics-global/[slug]/page.tsx.
  - Fetch article by ID from cache
  - Render title, content, thumbnail, source credit, pubDate
  - Add components/ui/ShareButtons.tsx for X, Telegram, WhatsApp, VK
  - Add Disqus comments (dynamic import with ssr: false)
COPY pattern for app/[locale]/indonesia-news/[slug]/page.tsx.
ADD generateMetadata() with Open Graph and Twitter cards.
VALIDATION: >
  Visit article detail; share buttons work; Disqus loads; metadata preview in Facebook Debugger.

Task 8: Adsterra Ad Integration
CREATE components/ads/AdsterraLeaderboard.tsx.
  - Use Next.js <Script strategy="afterInteractive" src="adsterra-banner-url" />
  - Wrap in dynamic import if needed: const AdBanner = dynamic(() => import('./AdBanner'), { ssr: false })
CREATE components/ads/AdsterraSidebar.tsx and AdsterraNative.tsx similarly.
ADD ad components to app/[locale]/page.tsx (leaderboard above fold, sidebar on right).
ADD native ads in components/feed/FeedGrid.tsx every 5 articles.
CONFIGURE .env.example with NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID.
VALIDATION: >
  Ads render without blocking page load; no white screen; check Network tab for adsterra scripts.

Task 9: Personalization with localStorage
CREATE lib/utils/preferences.ts with savePreferences() and loadPreferences().
CREATE components/ui/TopicSelector.tsx for first-time visitors.
  - Modal with checkboxes for topics: BRICS Economy, Bali Tourism, etc.
  - Save to localStorage
MODIFY app/[locale]/page.tsx to prioritize articles matching user topics.
VALIDATION: >
  Select topics; reload page; top articles match preferences.

Task 10: Community Features (Upvote/Downvote)
CREATE lib/utils/votes.ts with upvote(articleId) and downvote(articleId).
  - Store in localStorage: { articleId: 'up' | 'down' }
  - Aggregate counts in cache (optional for MVP)
ADD upvote/downvote buttons to components/feed/ArticleCard.tsx.
CREATE app/[locale]/community-picks/page.tsx with top-voted articles.
VALIDATION: >
  Upvote article; visit /community-picks; article appears if votes ≥ threshold.

Task 11: Stripe Subscriptions & Donations
CREATE app/api/stripe/checkout/route.ts.
  - Accept { priceId, mode: 'subscription' | 'payment' }
  - Create Stripe Checkout session with successUrl and cancelUrl
  - Return sessionId
CREATE app/[locale]/subscribe/page.tsx.
  - Display pricing tiers: $2/month, $5/month, $10 one-time
  - Fetch sessionId from /api/stripe/checkout
  - Redirect to Stripe hosted checkout with loadStripe()
CREATE app/api/webhooks/stripe/route.ts.
  - Verify signature with stripe.webhooks.constructEvent()
  - Handle checkout.session.completed and invoice.payment_succeeded
  - Log subscription to database; send email confirmation
VALIDATION: >
  Complete test payment with Stripe test card; webhook logs event; subscription recorded.

Task 12: BPD Fundraising Features
CREATE components/ui/CampaignCard.tsx with progress bar.
ADD campaigns to app/[locale]/subscribe/page.tsx.
  - Fetch from static JSON or CMS (e.g., campaigns.json)
  - Display goal, raised, endDate
CREATE components/ui/DonationButton.tsx.
  - Link to Stripe checkout with one-time payment
  - Pass campaign ID for attribution
VALIDATION: >
  Donate $10; webhook logs campaign ID; progress bar updates (manual for MVP).

Task 13: Matomo Analytics Integration
CREATE lib/analytics/matomo.ts with initMatomo() and trackEvent().
ADD Matomo tracking script to app/layout.tsx.
  - Use <Script defer src={matomoUrl} />
  - Initialize _paq with siteId and trackerUrl
TRACK events:
  - Pageview (auto)
  - CTA clicks (Subscribe, Donate)
  - Article views
  - Ad impressions (custom dimension)
VALIDATION: >
  Visit pages; check Matomo dashboard for pageviews and events.

Task 14: SEO & Metadata Optimization
CREATE lib/seo/metadata.ts with generateArticleMetadata(article).
MODIFY all page.tsx files to export generateMetadata() with dynamic title/description.
CREATE app/sitemap.ts.
  - Fetch all articles from cache
  - Return MetadataRoute.Sitemap with url, lastModified, priority
CREATE app/robots.ts returning MetadataRoute.Robots.
ADD NewsArticle JSON-LD schema to article detail pages.
VALIDATION: >
  Visit /sitemap.xml; validate schema with Google Rich Results Test; submit to Search Console.

Task 15: Offline Support with Service Worker
CREATE public/sw.js using Workbox.
  - Cache article cards and static assets
  - Stale-while-revalidate for API calls
REGISTER service worker in app/layout.tsx.
  - if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')
ADD "Save for Later" button to components/feed/ArticleCard.tsx.
  - Cache article content in IndexedDB
VALIDATION: >
  Go offline; cached articles load; "Save for Later" persists after reload.

Task 16: UI Polish & Accessibility
ADD components/layout/Header.tsx with sticky nav and locale switcher.
ADD components/layout/Footer.tsx with source links, legal, social icons.
APPLY Tailwind CSS theming: BRICS colors (red, gold), tropical motifs (🌊).
RUN axe accessibility checks.
  - Fix missing alt text, focus states, contrast issues
  - Add ARIA labels to interactive elements
VALIDATION: >
  npx @axe-core/cli http://localhost:3000 --exit 1 passes; keyboard navigation works.

Task 17: Performance Optimization
OPTIMIZE images with Next/Image and remotePatterns in next.config.ts.
ENABLE code splitting: dynamic imports for heavy components (Disqus, ads).
ADD caching headers in next.config.ts.
  - Cache-Control: public, max-age=3600 for /api/feeds
RUN Lighthouse CI.
  - Target LCP < 2.5s, FID < 100ms, CLS < 0.1
MINIFY CSS/JS with Tailwind purge.
VALIDATION: >
  lhci autorun --collect.url=http://localhost:3000; scores ≥ 90 (desktop), ≥ 80 (mobile).

Task 18: Security Hardening
ENABLE HTTPS on DigitalOcean App Platform (auto-provisioned).
ADD CSP headers in next.config.ts.
  - script-src 'self' adsterra.com matomo-domain.com
  - img-src * data:
ADD rate limiting to /api/feeds/aggregate with next-rate-limit.
SANITIZE user inputs in search API with lib/utils/sanitize.ts.
VALIDATE Stripe webhook signatures.
VALIDATION: >
  Check Content-Security-Policy in Network tab; rate limit triggers at 10 req/min.

Task 19: DigitalOcean Deployment
PUSH code to GitHub repo.
CREATE DigitalOcean App Platform app.
  - Connect GitHub repo
  - Select Indonesia (Jakarta) region
  - Set environment variables: STRIPE_SECRET_KEY, MATOMO_URL, ADSTERRA_PUBLISHER_ID
  - Auto-detect build: npm run build
  - Deploy
CONFIGURE domain bali.report via registrar DNS.
  - Add A/CNAME records pointing to DigitalOcean App Platform
ENABLE CDN caching for /images and /api/feeds.
VALIDATION: >
  Visit https://bali.report; site loads; check DO Insights for uptime.

Task 20: Final Testing & Launch
RUN end-to-end tests with Cypress.
  - Homepage loads carousel and sidebar
  - Category pages filter articles
  - Search returns results
  - Article detail renders with share buttons
  - Adsterra ads display
  - Stripe checkout completes
  - Matomo tracks events
FIX any regressions.
SUBMIT sitemap to Google Search Console.
ANNOUNCE launch on X, Telegram, and BPD channels.
VALIDATION: >
  All E2E tests pass; 0 critical bugs; Google indexes homepage within 48 hours.
```

### Pseudocode for Critical Tasks

#### Task 3: RSS Feed Aggregation
```typescript
// lib/rss/parser.ts
import Parser from 'rss-parser'
import { Article, FeedSource } from '@/types'
import { generateArticleId, extractThumbnail, sanitizeHtml } from '@/lib/utils'

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['dc:creator', 'creator']
    ]
  }
})

export async function fetchFeed(source: FeedSource): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(source.url)
    
    return feed.items
      .filter(item => {
        // Filter by keywords if specified
        if (!source.keywords || source.keywords.length === 0) return true
        const text = `${item.title} ${item.contentSnippet}`.toLowerCase()
        return source.keywords.some(kw => text.includes(kw.toLowerCase()))
      })
      .slice(0, 20) // Limit to 20 most recent
      .map(item => ({
        id: generateArticleId(item.link!, item.pubDate!),
        title: item.title || 'Untitled',
        excerpt: item.contentSnippet?.slice(0, 200) || '',
        content: sanitizeHtml(item.content || item.contentSnippet || ''),
        link: item.link!,
        source: {
          name: source.name,
          feed: source.url,
          logo: `/logos/${source.id}.svg`
        },
        thumbnail: extractThumbnail(item.media, item.enclosure),
        pubDate: new Date(item.pubDate!),
        author: item.creator || item.creator || undefined,
        categories: [source.category, source.subcategory].filter(Boolean) as string[],
        locale: source.locale
      }))
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${source.name}:`, error)
    // CRITICAL: Return empty array instead of throwing; use cached fallback
    return []
  }
}

// app/api/feeds/aggregate/route.ts
import { NextResponse } from 'next/server'
import { FEED_SOURCES } from '@/lib/rss/sources'
import { fetchFeed } from '@/lib/rss/parser'
import { cacheArticles } from '@/lib/rss/cache'

export async function POST() {
  // PATTERN: Fetch all feeds in parallel with Promise.allSettled
  const results = await Promise.allSettled(
    FEED_SOURCES.map(source => fetchFeed(source))
  )
  
  const articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<Article[]>).value)
  
  // CRITICAL: Cache articles in Redis/SQLite with TTL
  await cacheArticles(articles)
  
  console.log(`[RSS] Aggregated ${articles.length} articles from ${FEED_SOURCES.length} sources`)
  
  return NextResponse.json({ success: true, count: articles.length })
}
```

#### Task 8: Adsterra Ad Integration
```typescript
// components/ads/AdsterraLeaderboard.tsx
'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function AdsterraLeaderboard() {
  // CRITICAL: Adsterra uses document.write() which breaks Next.js
  // Solution: Load script with afterInteractive and create div container
  
  useEffect(() => {
    // Fallback: If ad fails to load after 5s, show placeholder
    const timer = setTimeout(() => {
      const adContainer = document.getElementById('adsterra-leaderboard')
      if (adContainer && adContainer.children.length === 0) {
        console.warn('[Adsterra] Leaderboard ad failed to load')
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="ad-container mb-6" aria-label="Advertisement">
      <div id="adsterra-leaderboard" className="mx-auto" style={{ width: 728, height: 90 }}>
        {/* Adsterra script will inject ad here */}
      </div>
      <Script
        strategy="afterInteractive"
        src={`//a.adtng.com/${process.env.NEXT_PUBLIC_ADSTERRA_LEADERBOARD_ID}/invoke.js`}
        onError={(e) => console.error('[Adsterra] Script failed:', e)}
      />
    </div>
  )
}

// CRITICAL: If document.write still causes issues, use dynamic import
// const AdsterraLeaderboard = dynamic(() => import('./AdsterraLeaderboard'), { ssr: false })
```

#### Task 11: Stripe Checkout
```typescript
// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(req: NextRequest) {
  try {
    const { priceId, mode, campaignId } = await req.json()
    
    // CRITICAL: Validate inputs
    if (!priceId || !['subscription', 'payment'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode as 'subscription' | 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
      metadata: {
        campaignId: campaignId || ''
      }
    })
    
    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('[Stripe] Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!
  
  // CRITICAL: Verify webhook signature to prevent spoofing
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
  
  // PATTERN: Handle events
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      // TODO: Log subscription to database
      console.log(`[Stripe] Subscription created: ${session.id}`)
      // TODO: Send confirmation email
      break
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice
      console.log(`[Stripe] Payment succeeded: ${invoice.id}`)
      break
    default:
      console.log(`[Stripe] Unhandled event: ${event.type}`)
  }
  
  return NextResponse.json({ received: true })
}
```

#### Task 14: Dynamic Sitemap
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getCachedArticles } from '@/lib/rss/cache'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getCachedArticles()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bali.report'
  
  // PATTERN: Static pages
  const routes = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/brics-global`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/indonesia-news`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/bali-events`, lastModified: new Date(), priority: 0.7 }
  ]
  
  // PATTERN: Dynamic article pages
  const articleRoutes = articles.map(article => ({
    url: `${baseUrl}/${article.categories[0]}/${article.id}`,
    lastModified: article.pubDate,
    priority: 0.6
  }))
  
  return [...routes, ...articleRoutes]
}
```

### Integration Points
```yaml
ENVIRONMENT VARIABLES (.env.example):
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  NEXT_PUBLIC_ADSTERRA_PUBLISHER_ID=...
  NEXT_PUBLIC_ADSTERRA_LEADERBOARD_ID=...
  NEXT_PUBLIC_MATOMO_URL=https://matomo.example.com
  NEXT_PUBLIC_MATOMO_SITE_ID=1
  NEXT_PUBLIC_BASE_URL=https://bali.report
  REDIS_URL=redis://localhost:6379 (or DigitalOcean Managed Redis)

DIGITALOCEAN APP PLATFORM:
  - Region: Indonesia (Jakarta)
  - Build Command: npm run build (auto-detected)
  - Run Command: npm start (auto-detected)
  - Environment: Add all NEXT_PUBLIC_* and secret variables
  - Domain: bali.report via CNAME to DigitalOcean App Platform URL
  - CDN: Auto-enabled for static assets
  - Functions: Optional for cron job (alternative to pm2)

NEXT.CONFIG.TS:
  - next-intl plugin: createNextIntlPlugin()
  - Image domains: remotePatterns for sputnikglobe.com, rt.com, etc.
  - Headers: CSP with script-src for adsterra and matomo
  - Redirects: HTTP -> HTTPS

REDIS/SQLITE SCHEMA:
  - Key: articles:{category} -> JSON array of Article[]
  - Key: campaigns -> JSON array of Campaign[]
  - TTL: 2 hours for articles

STRIPE PRODUCTS:
  - $2/month subscription: price_xxx
  - $5/month subscription: price_yyy
  - $10 one-time donation: price_zzz
```

## Validation Loop

### Level 1: Syntax, Type, Build
```bash
# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Expected: No errors; build succeeds with static/dynamic routes
```

### Level 2: Unit Tests
```typescript
// tests/rss/parser.test.ts
import { fetchFeed } from '@/lib/rss/parser'
import { FEED_SOURCES } from '@/lib/rss/sources'

describe('RSS Parser', () => {
  it('fetches articles from Sputnik feed', async () => {
    const source = FEED_SOURCES.find(s => s.id === 'sputnik-global')!
    const articles = await fetchFeed(source)
    expect(articles.length).toBeGreaterThan(0)
    expect(articles[0]).toHaveProperty('title')
    expect(articles[0]).toHaveProperty('link')
  })
  
  it('handles malformed feed gracefully', async () => {
    const badSource = { ...FEED_SOURCES[0], url: 'https://invalid-feed.com/rss' }
    const articles = await fetchFeed(badSource)
    expect(articles).toEqual([]) // Should return empty array, not throw
  })
})

// tests/stripe/checkout.test.ts
import { POST } from '@/app/api/stripe/checkout/route'

describe('Stripe Checkout', () => {
  it('creates subscription session', async () => {
    const req = new Request('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_test', mode: 'subscription' })
    })
    const res = await POST(req as any)
    const data = await res.json()
    expect(data).toHaveProperty('sessionId')
  })
  
  it('rejects invalid mode', async () => {
    const req = new Request('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_test', mode: 'invalid' })
    })
    const res = await POST(req as any)
    expect(res.status).toBe(400)
  })
})
```

```bash
npm test
# Expected: All tests pass
```

### Level 3: E2E Tests
```bash
# Start dev server
npm run dev

# Run Cypress E2E tests
npx cypress run
```

```typescript
// cypress/e2e/homepage.cy.ts
describe('Homepage', () => {
  it('displays carousel and events sidebar', () => {
    cy.visit('/en')
    cy.get('[data-testid="carousel"]').should('be.visible')
    cy.get('[data-testid="events-sidebar"]').should('be.visible')
  })
  
  it('filters BRICS articles by subcategory', () => {
    cy.visit('/en/brics-global')
    cy.get('[data-testid="filter-subcategory"]').select('russia')
    cy.get('[data-testid="article-card"]').should('have.length.greaterThan', 0)
  })
})

// cypress/e2e/stripe.cy.ts
describe('Stripe Checkout', () => {
  it('redirects to Stripe for subscription', () => {
    cy.visit('/en/subscribe')
    cy.get('[data-testid="subscribe-btn-5"]').click()
    cy.origin('https://checkout.stripe.com', () => {
      cy.url().should('include', 'checkout.stripe.com')
    })
  })
})
```

### Level 4: Performance & Accessibility
```bash
# Lighthouse CI
lhci autorun --collect.url=http://localhost:3000/en --collect.url=http://localhost:3000/en/brics-global/test-article
# Expected: Performance ≥ 80, Accessibility ≥ 90, SEO ≥ 90

# Accessibility
npx @axe-core/cli http://localhost:3000/en --exit 1
# Expected: 0 critical violations
```

## Final Validation Checklist
- [ ] RSS feeds aggregate from 10+ sources; articles cached and refreshed every 1-2 hours
- [ ] Homepage displays top 5 BRICS carousel and Bali events sidebar
- [ ] Category pages (BRICS Global, Indonesia News) filter by subcategory and search works
- [ ] Article detail pages render with social sharing, Disqus comments, and NewsArticle schema
- [ ] Adsterra ads (leaderboard, sidebar, native) display without blocking render
- [ ] Stripe checkout completes for subscription ($2, $5/month) and donation ($10)
- [ ] Stripe webhooks log events; subscriptions recorded
- [ ] Bilingual (EN/ID) with locale switcher; metadata localized
- [ ] Matomo tracks pageviews, CTA clicks, and ad impressions
- [ ] Lighthouse scores: Performance ≥ 80 (mobile), ≥ 90 (desktop); Accessibility ≥ 90; SEO ≥ 90
- [ ] Axe accessibility: 0 critical violations; keyboard navigation works
- [ ] Offline caching with service worker; "Save for Later" persists
- [ ] Deployed to bali.report on DigitalOcean with SSL and CDN
- [ ] Sitemap submitted to Google Search Console; homepage indexed
- [ ] Security: CSP headers, rate limiting, webhook signature verification

---

## Anti-Patterns to Avoid
- ❌ Using document.write() for Adsterra (breaks Next.js rendering)
- ❌ Exposing Stripe secret keys or webhook secrets client-side
- ❌ Ignoring RSS feed errors (wrap in try/catch and fallback to cache)
- ❌ Hardcoding feed URLs (use lib/rss/sources.ts for maintainability)
- ❌ Blocking render on third-party scripts (use defer/afterInteractive)
- ❌ Skipping webhook signature verification (security risk)
- ❌ Missing locale in metadata (next-intl requires locale-specific generateMetadata)
- ❌ Over-fetching RSS feeds (limit to 20 articles per source)
- ❌ Ignoring image optimization (use Next/Image with remotePatterns)
- ❌ Deploying without HTTPS (required for Stripe webhooks and service workers)
- ❌ Missing fallback UI for failed feeds (show "Feed updating..." message)
- ❌ Not rate-limiting /api/feeds/aggregate (could be abused)

---

## Additional Resources & Examples

### RSS Feed Sources List
```typescript
// lib/rss/sources.ts
export const FEED_SOURCES: FeedSource[] = [
  {
    id: 'sputnik-global',
    name: 'Sputnik Global',
    url: 'https://sputnikglobe.com/rss',
    category: 'brics',
    subcategory: 'global',
    locale: 'en',
    refreshInterval: 60,
    keywords: ['BRICS', 'Russia', 'China', 'multipolarity']
  },
  {
    id: 'rt-world',
    name: 'RT World News',
    url: 'https://www.rt.com/rss/',
    category: 'brics',
    subcategory: 'global',
    locale: 'en',
    refreshInterval: 60
  },
  {
    id: 'new-eastern-outlook',
    name: 'New Eastern Outlook',
    url: 'https://journal-neo.su/feed/',
    category: 'brics',
    subcategory: 'analysis',
    locale: 'en',
    refreshInterval: 120
  },
  {
    id: 'global-times',
    name: 'Global Times',
    url: 'https://www.globaltimes.cn/rss/outbrain.xml',
    category: 'brics',
    subcategory: 'china',
    locale: 'en',
    refreshInterval: 60
  },
  {
    id: 'jakarta-post',
    name: 'Jakarta Post',
    url: 'https://www.thejakartapost.com/rss',
    category: 'indonesia',
    subcategory: 'national',
    locale: 'en',
    refreshInterval: 60
  },
  {
    id: 'bali-post',
    name: 'Bali Post',
    url: 'https://www.balipost.com/feed/',
    category: 'indonesia',
    subcategory: 'bali',
    locale: 'id',
    refreshInterval: 60,
    keywords: ['Bali', 'tourism', 'events']
  },
  {
    id: 'antara-bali',
    name: 'Antara News Bali',
    url: 'https://www.antaranews.com/rss/bali',
    category: 'bali-events',
    locale: 'id',
    refreshInterval: 120
  },
  {
    id: 'bali-discovery',
    name: 'Bali Discovery',
    url: 'https://balidiscovery.com/feed/',
    category: 'bali-events',
    locale: 'en',
    refreshInterval: 120,
    keywords: ['events', 'festivals', 'tourism']
  }
  // Add 2+ more sources to reach 10+
]
```

### Example next-intl Messages
```json
// messages/en.json
{
  "common": {
    "siteName": "Bali Report - Multi-polar News Perspectives",
    "loading": "Loading tropical paradise...",
    "readMore": "Read More",
    "share": "Share",
    "saveForLater": "Save for Later"
  },
  "nav": {
    "home": "Home",
    "bricsGlobal": "BRICS Global",
    "indonesiaNews": "Indonesia News",
    "baliEvents": "Bali Events",
    "subscribe": "Subscribe"
  },
  "homepage": {
    "topStories": "Top BRICS Stories",
    "baliEvents": "Upcoming in Bali",
    "featuredCategories": "Explore News"
  },
  "subscribe": {
    "title": "Support Independent Multipolar Media",
    "adFree": "Ad-Free Experience",
    "supportBPD": "20% of revenue funds BPD initiatives",
    "tier1": "$2/month - Basic",
    "tier2": "$5/month - Supporter",
    "donate": "One-Time Donation"
  }
}

// messages/id.json
{
  "common": {
    "siteName": "Bali Report - Perspektif Berita Multi-polar",
    "loading": "Memuat surga tropis...",
    "readMore": "Baca Selengkapnya",
    "share": "Bagikan",
    "saveForLater": "Simpan untuk Nanti"
  },
  "nav": {
    "home": "Beranda",
    "bricsGlobal": "BRICS Global",
    "indonesiaNews": "Berita Indonesia",
    "baliEvents": "Acara Bali",
    "subscribe": "Berlangganan"
  }
  // ... translate all keys
}
```

### Example Matomo Tracking
```typescript
// lib/analytics/matomo.ts
export function trackEvent(category: string, action: string, name?: string, value?: number) {
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push(['trackEvent', category, action, name, value])
  }
}

// Usage in components:
// trackEvent('CTA', 'Click', 'Subscribe Button')
// trackEvent('Article', 'View', article.title)
```

---

## Confidence Score: 8.5/10

### Reasoning:
**Strengths:**
- Comprehensive context including RSS parser, Adsterra workarounds, Stripe webhooks, and DigitalOcean deployment
- Executable validation gates at each level (type checks, unit tests, E2E, Lighthouse)
- Real-world patterns from Stack Overflow for Adsterra/Next.js integration
- Detailed pseudocode for critical tasks with error handling
- Clear anti-patterns to avoid common pitfalls
- 20 ordered tasks covering MVP to deployment

**Risks:**
- Adsterra integration may still have edge cases (document.write behavior varies by ad zone)
- RSS feed sources may change URLs or formats; monitoring required
- Stripe webhook testing requires ngrok or deployed endpoint
- BRICS news sources may have rate limits or geo-blocking (mitigate with VPN or proxies)
- Initial caching layer (Redis/SQLite) requires setup; option to start with in-memory cache

**Mitigation:**
- Fallback to cached articles if RSS fetch fails
- Dynamic import with ssr:false for Adsterra ads to isolate rendering issues
- Comprehensive error logging for debugging in production
- Test Stripe webhooks with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Why 8.5 and not 9+:**
- Adsterra's unpredictable behavior in Next.js (community reports mixed results)
- BPD fundraising features require backend database (not fully spec'd for MVP)
- Matomo self-hosted setup not detailed (assumes existing instance or separate guide)

**One-Pass Implementation Viability:**
With this PRP, an AI agent or developer can implement the MVP in one pass with high confidence, provided they:
1. Test Adsterra ads incrementally (start with one zone, verify, then scale)
2. Use Stripe test mode for all payment flows before going live
3. Deploy early to DigitalOcean staging to validate cron jobs and caching

The PRP provides sufficient context, executable validation, and clear error handling patterns to succeed without multiple rounds of rework.
