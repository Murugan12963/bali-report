# PLANNING.md - Bali Report

## 📋 Project Overview

- **Project Name**: Bali Report
- **Domain**: bali.report 
- **Type**: News Aggregation Platform
- **Development Environment**: Warp.dev with AI assistance
- **Timeline**: 4-6 weeks MVP
- **Core Mission**: BRICS-aligned news aggregation with Indonesia/Bali focus

## 🏗️ Architecture & Tech Stack

### Frontend/Backend
- **Framework**: Next.js (React-based SSR/SSG)
- **Styling**: Tailwind CSS
- **Language**: TypeScript preferred for type safety
- **Deployment**: Vercel (optimized for Next.js)

### Data & Content
- **Aggregation**: RSS parsing via rss-parser npm package
- **HTTP Requests**: Axios for API calls and web scraping
- **Database**: Initially stateless; optional SQLite for caching
- **Update Frequency**: Serverless cron jobs every 1-2 hours

### Monetization & Analytics
- **Ads**: PropellerAds JavaScript SDK
- **Analytics**: Google Analytics 4 or Plausible
- **Newsletter**: Mailchimp integration
- **Comments**: Disqus with moderation

## 📚 Content Strategy

### Primary News Sources
- **BRICS-Aligned**:
  - https://journal-neo.su/
  - https://sputnikglobe.com/
  - https://landdestroyer.blogspot.com/
  - https://johnhelmer.net/
  - RT.com
  - GlobalTimes.cn

- **Indonesia/Bali Focused**:
  - BaliPost.co.id
  - JakartaPost.com
  - BaliDiscovery.com
  - AntaraNews.com

### Content Categories
1. **BRICS Global** (Russia, China, India, Brazil, South Africa, BRICS+)
2. **Indonesia News** (National, Bali Events, Economy/Tourism)
3. **Bali Events** (Festivals, Tourism, Local Politics)

## 🎨 Design Principles

- **Mobile-First**: Optimized for smartphone users (tourists/expats)
- **Color Scheme**: BRICS colors (red, gold) with Bali motifs
- **Accessibility**: WCAG 2.1 compliance, alt text, keyboard navigation

## 💰 Monetization Strategy

### PropellerAds Integration
- **Ad Formats**:
  - Leaderboard banners (728x90) on homepage
  - Sidebar banners (300x250) on articles
  - Pop-unders with exit intent
  - Optional native ads

## 🔧 Development Notes

### Key Commands
```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test

# Type check
npm run type-check
```

### Project Structure
```
/bali-report
├── /src
│   ├── /app          # Next.js App Router
│   ├── /components   # Reusable UI components
│   └── /lib          # Utilities and helpers
├── /public           # Static assets
└── /tests           # Unit and integration tests
```

---

*This document serves as the technical reference for the Bali Report project. All development should align with these specifications.*