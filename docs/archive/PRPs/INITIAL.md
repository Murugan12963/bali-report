# Initial Features Request for Bali Report News Aggregation Site

## Project Overview
- **Project Name**: Bali Report
- **Domain**: bali.report (Live site as of October 02, 2025: Displays title "Bali Report - Multi-polar News Perspectives" and loading message "🌊 Loading tropical paradise...". No content or features visible, indicating early MVP stage.)
- **Development Platform**: Warp.dev (AI-powered terminal for coding, version control, and deployment scripting).
- **Hosting**: Deployed on DigitalOcean (assumed App Platform or Droplet; confirm setup—current site suggests basic static/SSR deployment with loading fallback. Add monitoring via DigitalOcean Insights for uptime/performance.)
- **Core Goal**: Evolve the current minimal site into a full news aggregation platform aligned with BRICS (Brazil, Russia, India, China, South Africa) perspectives, emphasizing multipolarity, anti-imperialism, and criticism of Western hegemony, while featuring Indonesia/Bali-specific news and events for locals, expats, and tourists. The site will serve as the promotional arm for the BRICS Partnership for Development (BPD), focusing on the centralized, hierarchical model inspired by USAID’s architecture, tailored to BRICS values (mutual respect, equality, inclusiveness, multipolarity, sustainable development) and established in Indonesia. This structure avoids blockchain complexities, prioritizing legal clarity, scalability, and compliance with Indonesian regulations (e.g., Law No. 16/2001 on Foundations, Law No. 17/2013 on Societal Organizations). It consists of a core agency, funding mechanism, regional hubs, and an NGO network, all operating as traditional legal entities under Indonesian law, with mechanisms to expand globally. The site will fundraise for BPD initiatives (e.g., agri-tech, energy projects), allocating 20% of subscription revenue to scalable, equitable programs like Bali's renewable hubs.
- **Monetization**: Integrate Adsterra for display ads (banners, native ads) to generate revenue, with strategies to mitigate content moderation risks for BRICS-aligned content. Allocate 20% of subscription revenue to BPD initiatives.
- **Target Launch**: MVP already deployed (minimal state); prioritize content population and core features within 2-4 weeks for full rollout.
- **Tech Stack**:
  - **Frontend/Backend**: Next.js (React-based) for server-side rendering (SSR) and SEO optimization (current site hints at Next.js loading pattern).
  - **Aggregation**: RSS parsing (rss-parser npm) or Axios for API/web scraping.
  - **Database**: Stateless initially (direct feed pulls); optional SQLite for caching on DigitalOcean Droplet or Spaces.
  - **Hosting**: DigitalOcean App Platform (for Next.js auto-deploys) or Droplet (Node.js/Docker); domain pointed via registrar (e.g., Namecheap). Use DO Spaces for image caching to improve loading beyond current placeholder.
  - **Ads**: Adsterra JavaScript SDK for ad integration.
  - **Analytics**: Matomo (self-hosted on DigitalOcean for data sovereignty and GDPR compliance).

## Key Features

### 1. Content Aggregation
- **RSS/API Feed Integration** (Priority: High—Current site lacks content; implement to replace loading screen):
  - **Sources**:
    - Primary: 
      - https://journal-neo.su/
      - https://sputnikglobe.com/
      - https://landdestroyer.blogspot.com/
      - https://johnhelmer.net/
    - Additional: 
      - RT.com
      - GlobalTimes.cn
      - BaliPost.co.id
      - JakartaPost.com
      - BaliDiscovery.com
      - AntaraNews.com
  - **Functionality**:
    - Auto-fetch: Headlines, excerpts (150-200 words), images, publish dates, and source URLs.
    - Filtering: Keyword-based (e.g., "BRICS", "Russia", "Bali tourism", "anti-NATO") for political alignment.
    - Update Frequency: Cron job (e.g., DigitalOcean Functions or pm2 on Droplet) to refresh feeds every 1-2 hours.
    - Error Handling: Cache fallback for failed feeds (store in DigitalOcean Spaces or local Redis); log errors for debugging. If feeds fail, fallback to static multipolar welcome message.
  - **Bali/Indonesia Section**:
    - Dedicated feeds for local news (politics, economy, tourism) and events (e.g., Nyepi, Galungan festivals, conferences).
    - Manual curation queue: Admin can prioritize stories (e.g., "How Chinese Investment Boosts Bali Tourism").
  - **Content Display**:
    - **Homepage** (Update current loading screen):
      - Carousel: Top 5 BRICS stories (auto-rotating).
      - Sidebar: Bali events ticker (e.g., "Ubud Writers Festival 2025").
    - **Categories**:
      - BRICS Global (subsections: Russia, China, India, Brazil, South Africa, BRICS+).
      - Indonesia News (subsections: National, Bali Events, Economy/Tourism).
    - **Article Cards**: Title, excerpt, source credit, thumbnail, "Read More" link.
    - **Search**: Full-text search using Algolia (free tier) or Next.js built-in search for small scale.
  - **Features Inspired by Successful Aggregators**:
    - **Personalized Feed [From Google News/SmartNews]**:
      - Allow users to select preferred topics (e.g., "BRICS Economy", "Bali Events") on first visit or via profile settings.
      - Use basic AI (e.g., keyword-based recommendation in Next.js) to prioritize articles based on user clicks or location (e.g., Bali tourists see more local events).
      - Store preferences in localStorage or cookies (GDPR-compliant); upgrade to user accounts later for persistence.
    - **Real-Time Updates [From SmartNews]**:
      - Implement WebSocket or polling for near-real-time feed refreshes (e.g., breaking news from Sputnik on BRICS summits).
      - Display "New" badges on articles fetched within the last hour.
    - **Offline Access [From Pocket/SmartNews]**:
      - Add service workers (via Workbox in Next.js) to cache article cards and excerpts for offline reading, ideal for Bali’s spotty Wi-Fi.
      - Include a "Save for Later" button to store articles locally.
  - **Rebel News-Inspired Features**:
    - **Viral Content Hooks [Rebel News]**:
      - Curate provocative BRICS stories (e.g., "US Sanctions Fail: BRICS Trade Soars in Bali") with clickable thumbnails.
      - Embed short video snippets (e.g., 30-sec clips from RT or BPD project updates) for shareability on X/Telegram.
      - Add donation CTAs in high-traffic articles (e.g., "Support BPD’s Bali AgriTech Fund").

### 2. User Experience & Design
- **Responsive Design** (Priority: Medium—Enhance current tropical-themed loading to full multipolar branding):
  - Mobile-first: Optimized for Bali tourists/expats using smartphones.
  - Theme: Clean, modern with BRICS colors (red, gold) and subtle Bali motifs (e.g., tropical patterns, temple silhouettes; build on current "🌊" emoji).
  - Framework: Tailwind CSS within Next.js for rapid, responsive styling.
- **Multilingual Support**:
  - Default: English for global audience.
  - Secondary: Indonesian (Bahasa Indonesia) toggle using next-intl or i18n routing for local appeal.
- **Interactivity**:
  - **Navigation**: Sticky header with category dropdowns; footer with source links and disclaimer.
  - **Feed Loading**: Infinite scroll or pagination for seamless browsing (address current loading delay).
  - **Social Sharing**: Buttons for X (Twitter), Telegram, WhatsApp (popular in Indonesia), and VK (for BRICS audience).
  - **Comments**: Disqus integration with moderation to align with BRICS perspectives and prevent spam.
  - **Newsletter**: Mailchimp embed for daily/weekly digest signups (e.g., "BRICS Updates + Bali Events").
- **Accessibility**:
  - WCAG 2.1 basics: Alt text for images, keyboard navigation, high-contrast text.
- **Features Inspired by Successful Aggregators**:
  - **Magazine-Style Interface [From Flipboard]**:
    - Use swipeable, card-based layouts for articles (e.g., Tailwind CSS grid with hover effects).
    - Add a visual "flip" animation for article transitions on mobile to enhance engagement.
  - **Community Features [From Reddit/Hacker News]**:
    - Add a lightweight upvote/downvote system for articles (store in localStorage or SQLite) to surface popular BRICS or Bali stories.
    - Create a "Community Picks" section for user-voted top stories, fostering engagement.
  - **Customizable Layout [From Feedly]**:
    - Allow users to toggle between list, grid, or magazine views for feeds.
    - Save view preferences in localStorage for returning users.
- **Rebel News-Inspired Features**:
  - **Community Events [Rebel News]**:
    - Add a "BRICS Bali Events" page for virtual webinars (e.g., "BPD’s Role in Southeast Asia") or in-person meetups (e.g., Ubud panels during festivals).
    - Integrate ticket/donation forms (Stripe) to fund BPD (e.g., $20 entry for "Multipolar Bali Summit").

### 3. Monetization with Adsterra
- **Ad Integration** (Priority: Medium—Not visible on current site; add post-aggregation):
  - **Formats**:
    - Banners: Leaderboard (728x90) on homepage, sidebar (300x250) on article pages.
    - Responsive Ads: Auto-adjusting units for mobile/desktop.
    - Native Ads: In-feed ads blending with article cards for seamless UX.
  - **Setup**:
    - Create Adsterra account; obtain JS snippet.
    - Embed Adsterra script in `<head>` of `_document.js` (Next.js).
    - Ad Units: Configure separate zones for desktop/mobile; target geos (Indonesia, Russia, India, global BRICS audience).
    - Compliance: Adhere to Adsterra policies (flexible for multipolar content); ensure ads don’t overlap.
    - Risk Mitigation: Adsterra's lenient moderation suits BRICS narratives; include content policy page.
  - **Revenue Tracking**:
    - Monitor via Adsterra dashboard.
    - Integrate UTM parameters with Matomo for ad performance tracking.
  - **Fallback**:
    - If Adsterra ads fail, display affiliate links (e.g., Bali travel deals via Booking.com) or placeholder banners.
  - **Ad Policy**:
    - Prioritize non-intrusive ads to maintain UX; avoid auto-playing video ads.
    - Test placements (e.g., above vs. below fold) to optimize click-through rates.
- **Features Inspired by Successful Aggregators**:
  - **Non-Intrusive Ads [From Flipboard/Apple News]**:
    - Limit ad frequency (e.g., 1 banner per 5 articles) to avoid frustration.
    - Use native ads styled like article cards (e.g., "Sponsored: Bali Tourism Deals").
  - **Premium Tier Option [From Apple News+]**:
    - Offer $2-5/month ad-free subscription (via Stripe) with exclusive Bali guides or BRICS analyses; allocate 20% to BPD.
    - Promote via newsletter and banners.
- **Rebel News-Inspired Features**:
  - **Crowdfunding Campaigns [Rebel News]**:
    - Add "Multipolar Independence Fund" donation button (Stripe) for BPD (e.g., "Donate $10 for Bali Solar").
    - Run themed drives (e.g., "BRICS Harvest Challenge") with progress trackers.

### 4. Technical & Performance
- **SEO Optimization** (Priority: High—Current site has basic title; add dynamic meta for multipolar keywords):
  - **Meta Tags**: Dynamic titles/descriptions per article (e.g., "BRICS Summit 2025: Sputnik Insights | Bali Report").
  - **Sitemap**: Auto-generated sitemap.xml via Next.js; submit to Google Search Console.
  - **Schema Markup**: NewsArticle JSON-LD for Google News inclusion.
  - **Keywords**: Target "BRICS news", "Bali events 2025", "Indonesia geopolitics", "multipolar world".
- **Performance** (Address current loading screen delay):
  - **Image Optimization**: Use Next.js `<Image>` component for lazy loading and WebP format.
  - **Caching**: DigitalOcean Edge caching or App Platform CDN for feeds; stale-while-revalidate for fresh content.
  - **Analytics**: Integrate Matomo (self-hosted on DigitalOcean) for privacy-focused tracking of traffic and BPD funnels.
- **Security**:
  - HTTPS: Enforce via DigitalOcean (current site likely has it; confirm cert renewal).
  - Content Security Policy (CSP): Restrict scripts to trusted sources (Adsterra, Disqus).
  - Rate Limiting: Protect against scraping using middleware or DigitalOcean Firewall.
- **Warp.dev Workflow**:
  - **Setup**: Pull existing repo; install dependencies in Warp (e.g., `npm install` for rss-parser).
  - **AI Assistance**: Use Warp’s AI to generate boilerplate (e.g., RSS parser, Adsterra integration) or debug loading issues.
  - **Commands**:
    - `npm run dev` for local testing.
    - `git push` to GitHub; auto-deploy via DigitalOcean App Platform or manual Droplet restart (e.g., `pm2 restart ecosystem`).
    - Troubleshoot: Use Warp to check DO logs (`doctl compute droplet action get-console-output <droplet-id>` via CLI).
- **Features Inspired by Successful Aggregators**:
  - **High-Performance Loading [From Drudge Report]**:
    - Optimize for sub-2-second page loads using Next.js SSR and DigitalOcean CDN.
    - Minify CSS/JS with Tailwind’s built-in purge feature.
  - **Analytics-Driven Iteration [From Google News]**:
    - Track engagement (e.g., click-through rates on BRICS vs. Bali articles) via Matomo.
    - Use insights to refine feeds (e.g., prioritize Sputnik if it drives more clicks).
  - **SEO for Niche [From AllTop]**:
    - Create static landing pages for keywords (e.g., "/brics-news", "/bali-events").
- **Rebel News-Inspired Features**:
  - **Transparency Page [Rebel News]**:
    - Add "Sources & Fact-Check" page detailing aggregation and BPD fund allocation (e.g., "20% of subs fund Indonesian NGOs").

### 5. Admin & Maintenance
- **Admin Dashboard** (Priority: Medium—Add to enable curation on current empty site):
  - Protected Route: Next.js `/admin` page with NextAuth.js (email/password or Google login).
  - Features: Manual curation, approve/reject articles, add custom posts (e.g., Bali highlights), manage BPD trackers.
- **Error Handling**:
  - Fallback UI: Display cached content or “Feed updating” message (enhance current loading).
  - Logging: Console logs in Warp; Sentry or DigitalOcean Logs for production.
- **Scalability**:
  - Initial Capacity: Handle 50-100 articles/day.
  - Future: Add database (SQLite) for caching; scale Droplet as needed.
- **Features Inspired by Successful Aggregators**:
  - **Content Moderation [From Hacker News]**:
    - Add flagging system for misaligned articles, reviewed by admin.
- **Rebel News-Inspired Features**:
  - **Defiance Messaging [Rebel News]**:
    - Add "Censorship-Proof Media" banner, redirecting to Telegram/VK.
    - Publish annual BPD reports (e.g., "200 Farmers Trained in Bali").

## Non-Functional Requirements
- **Accessibility**: Alt text for images, ARIA labels; test with Lighthouse for WCAG 2.1.
- **Legal Compliance**:
  - **Copyright**: Short excerpts (fair use); credit originals.
  - **Disclaimer**: Footer: “Aggregated content; views of authors.”
  - **Indonesia**: Comply with UU ITE; BPD as traditional entity under Law No. 16/2001.
  - **Global**: GDPR cookie banner (next-consent).
  - **Adsterra Compliance**: Flexible policies; content policy page for multipolar topics.
- **Testing**:
  - **Unit Tests**: Jest for aggregation.
  - **E2E Tests**: Cypress for flows (e.g., ad loading, donations).
  - **Browser Support**: Chrome, Safari, Firefox.

## Development Plan (Adjusted for Live Minimal Site)
1. **Week 1** (Immediate Fixes): Access DO dashboard; pull code via Warp. Replace loading with static welcome. Implement RSS for 1-2 sources; deploy via DO App Platform.
2. **Week 2**: Add homepage carousel, categories, Adsterra test ads. Integrate personalization/SEO.
3. **Week 3**: Build Bali section, search, offline caching. Add social sharing/upvotes.
4. **Week 4**: Integrate Disqus, Mailchimp, Stripe for subs/donations, BPD CTAs. Test flows; monitor DO.
5. **Ongoing**: Expand sources; launch Rebel campaigns (e.g., first BPD drive).

## Estimated Effort & Costs
- **Effort**: 80-120 hours for enhancements (reduced due to existing deployment).
- **Costs (USD)**:
  - Domain: $20-50/year (already live).
  - Hosting: DigitalOcean ($5-20/month; leverage existing).
  - Tools: Free (Next.js, Tailwind); optional $50 for Algolia/Sentry; $30/month for Stripe; $9/month for Matomo hosting.
  - Total Additional: ~$50-100.
- **Fundraising Goal**: Seed $10K for BPD by Q4 2025; scale to $100M over 5 years via 20% sub revenue.

## Notes
- **Live Site Context**: Minimal state (loading only)—prioritize aggregation. Check DO console for errors.
- **Source Permissions**: Contact sources (e.g., Sputnik) for syndication.
- **Adsterra Risk Mitigation**: Lenient for BRICS; backup affiliates/BPD donations.
- **BPD Integration**: Transparency via annual reports; campaigns with progress bars.
- **Warp.dev Usage**: AI for boilerplate/debugging; `doctl` CLI for DO logs.
- **Example RSS Parser Code** (Populate Site):

```javascript
// pages/api/feed.js
import Parser from 'rss-parser';

export default async function handler(req, res) {
  const parser = new Parser();
  try {
    const feed = await parser.parseURL('https://sputnikglobe.com/rss');
    res.status(200).json(feed.items.slice(0, 10));
  } catch (error) {
    res.status(500).json({ error: 'Feed fetch failed' });
  }
}
```

- **Example Adsterra Integration**:

```javascript
// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script async src="https://c.adsterra.com/adsterra.js?pub=XXXXXXXXXXXXXXXX"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
```

- **Example Matomo Integration** (Self-Hosted):

```javascript
// pages/_document.js (Add to Head)
<Head>
  <script async defer src="https://your-matomo-domain.com/matomo.js"></script>
  <script>
    var _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="https://your-matomo-domain.com/matomo.php";
      _paq.push(['setTrackerUrl', u+'?id=1']);
      _paq.push(['setSiteId', '1']);
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.type='text/javascript'; g.async=true; g.src=u+'?id=1'; s.parentNode.insertBefore(g,s);
    })();
  </script>
  <noscript><p><img src="https://your-matomo-domain.com/matomo.php?idsite=1&amp;rec=1" style="border:0;" alt="" /></p></noscript>
</Head>
```

- **Example Stripe Donation CTA (for BPD)**:

```javascript
// components/DonationButton.js
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_XXXXXXXXXXXXXXXX');

export default function DonationButton() {
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: 'price_XXXXXXXXXXXXXXXX', quantity: 1 }],
      mode: 'payment',
      successUrl: 'https://bali.report/success',
      cancelUrl: 'https://bali.report/cancel',
    });
    if (error) console.error(error);
    setLoading(false);
  };

  return (
    <button onClick={handleDonate} disabled={loading}>
      Donate $10 to BPD AgriTech
    </button>
  );
}
```

- **Example Service Worker for Offline (Workbox)**:

```javascript
// pages/_app.js
import { Workbox } from 'workbox-window';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js');
  wb.register();
}
```
