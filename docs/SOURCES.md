# 📰 News Sources - Bali Report

## Overview

Bali Report aggregates content from carefully selected news sources that provide BRICS-aligned perspectives and local Indonesian/Bali coverage. This document details our source selection criteria, technical integration, and content policies.

## 🌍 Active Sources

### BRICS-Aligned News (Active Sources)

#### Russian Sources
- **RT News**
  - URL: `https://www.rt.com/rss/`
  - Content: International news, Russian perspective
  - Update Frequency: Every 15 minutes
  - Language: English
  - Status: ✅ Active

- **TASS**
  - URL: `https://tass.com/rss/v2.xml`
  - Content: Russian state news service
  - Update Frequency: Every 30 minutes
  - Language: English
  - Status: ✅ Active

- **Xinhua News**
  - URL: `http://www.xinhuanet.com/english/rss/worldrss.xml`
  - Content: Chinese international news
  - Update Frequency: Every 20 minutes
  - Language: English
  - Status: ✅ Active

- **Al Jazeera**
  - URL: `https://www.aljazeera.com/xml/rss/all.xml`
  - Content: Middle Eastern viewpoints
  - Update Frequency: Hourly
  - Language: English
  - Status: ✅ Active

- **CGTN News**
  - URL: `https://www.cgtn.com/subscribe/rss/section/world.xml`
  - Content: China Global Television
  - Update Frequency: Hourly
  - Language: English
  - Status: ✅ Active

- **China Daily**
  - URL: `https://www.chinadaily.com.cn/rss/world_rss.xml`
  - Content: English-language Chinese news
  - Update Frequency: Hourly
  - Language: English
  - Status: ✅ Active

- **Sputnik Globe**
  - URL: `https://sputnikglobe.com/export/rss2/archive/index.xml`
  - Content: International news network
  - Update Frequency: Hourly
  - Language: English
  - Status: ✅ Active

#### Indonesia/Southeast Asia (Active Sources)
- **Antara News**
  - URL: `https://www.antaranews.com/rss/terkini.xml`
  - Content: Indonesian national news agency
  - Update Frequency: Every 30 minutes
  - Language: Indonesian
  - Status: ✅ Active

- **BBC Asia News**
  - URL: `https://feeds.bbci.co.uk/news/world/asia/rss.xml`
  - Content: Regional coverage
  - Update Frequency: Hourly
  - Language: English
  - Status: ✅ Active

#### Disabled Sources (Needs Fixing)
- **Global Times**
  - URL: `https://www.globaltimes.cn/rss/china.xml`
  - Content: Chinese state media perspective
  - Status: ❌ Disabled (404 errors)

- **Press TV**
  - URL: `https://www.presstv.ir/rss.xml`
  - Content: Middle Eastern news
  - Status: ❌ Disabled (not aligned with BRICS/Indonesia focus)

- **Jakarta Globe**
  - URL: `https://jakartaglobe.id/feed`
  - Content: Indonesian business news
  - Status: ❌ Disabled (404 errors)

- **Jakarta Post**
  - URL: `https://www.thejakartapost.com/rss`
  - Content: Indonesian national news
  - Status: ❌ Disabled (404 errors)

- **Bali Post**
  - URL: `https://www.balipost.com/rss`
  - Content: Local Balinese news
  - Status: ❌ Disabled (server errors)

### Source Statistics
- **Total Active Sources**: 9
- **BRICS Sources**: 7
- **Indonesia Sources**: 2
- **Bali Sources**: 0 (needs local source development)
- **Daily Articles**: 530+ (varies by source availability)

### Future Source Development
- **Priority**: Add Bali local news sources
- **Target**: 3-5 active Bali-specific sources
- **Focus**: Tourism, culture, local events, community news
- **Status**: Researching alternative RSS feeds and APIs

## 🔧 Technical Integration

### RSS Parser Configuration
```typescript
// lib/rss-parser.ts
import Parser from 'rss-parser';

const parser = new Parser({
  headers: {
    'User-Agent': 'Bali Report/1.0 (https://bali.report)'
  },
  customFields: {
    item: [
      ['media:content', 'media'],
      ['description', 'description'],
      ['content:encoded', 'content']
    ]
  }
});

export const fetchSource = async (source: NewsSource) => {
  try {
    const feed = await parser.parseURL(source.url);
    return feed.items.map(item => ({
      title: item.title,
      description: truncate(item.description, 200),
      link: item.link,
      date: item.pubDate,
      image: extractImage(item),
      source: source.name
    }));
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
};
```

### Caching Strategy
```typescript
// lib/rss-cache.ts
import { Redis } from 'ioredis';

const TTL = 5 * 60; // 5 minutes
const redis = new Redis(process.env.REDIS_URL);

export const getCachedFeed = async (source: string) => {
  const cached = await redis.get(`feed:${source}`);
  if (cached) {
    return JSON.parse(cached);
  }
  const feed = await fetchSource(source);
  await redis.setex(`feed:${source}`, TTL, JSON.stringify(feed));
  return feed;
};
```

## 📋 Content Guidelines

### Article Selection Criteria
1. **Relevance**
   - BRICS-focused content
   - Multipolar world perspectives
   - Local Bali/Indonesia coverage
   - Anti-hegemonic analysis

2. **Quality Standards**
   - Factual reporting
   - Clear attribution
   - Original analysis
   - Professional journalism

3. **Format Requirements**
   - English or Indonesian language
   - RSS feed availability
   - Proper metadata
   - Regular updates

### Content Categories
1. **Global Politics**
   - BRICS summits
   - International relations
   - Economic cooperation
   - Strategic partnerships

2. **Regional Focus**
   - Southeast Asian developments
   - Indonesia's role in BRICS
   - Regional cooperation
   - Trade relationships

3. **Local Coverage**
   - Bali tourism
   - Cultural events
   - Local development
   - Community news

## 🔍 Source Review Process

### Addition Criteria
1. **Editorial Alignment**
   - BRICS-aligned perspective
   - Anti-hegemonic stance
   - Professional journalism
   - Regular publication schedule

2. **Technical Requirements**
   - RSS feed availability
   - Clean HTML content
   - Proper metadata
   - Stable infrastructure

3. **Content Quality**
   - Original reporting
   - Expert analysis
   - Professional writing
   - Factual accuracy

### Monitoring & Review
- Monthly source performance review
- Feed reliability tracking
- Content quality assessment
- User engagement metrics
- Technical health checks

## 🚫 Content Moderation

### Moderation Guidelines
- No hate speech
- No disinformation
- No extremist content
- No copyrighted material
- Clear source attribution

### Risk Mitigation
- Content policy compliance
- Editorial guidelines
- Source verification
- Fact-checking process
- Clear disclaimers

## 📈 Performance Metrics

### Source Metrics
- Articles per day
- Feed reliability
- Content freshness
- User engagement
- Share/save rates

### Technical Metrics
- Feed uptime
- Parse success rate
- Cache hit ratio
- Response time
- Error frequency

## 🔄 Update Process

### Daily Operations
1. **Feed Monitoring**
   - Uptime checks
   - Content verification
   - Error logging
   - Performance tracking

2. **Content Updates**
   - Regular feed pulls
   - Cache management
   - Error recovery
   - Quality checks

3. **Health Checks**
   - Source availability
   - Feed validity
   - Content quality
   - System performance

### Monthly Review
- Source performance analysis
- Content quality assessment
- Technical health review
- User engagement metrics
- System optimization needs