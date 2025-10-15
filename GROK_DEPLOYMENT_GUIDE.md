# 🚀 Enhanced Grok/X.AI Integration Deployment Guide

## Overview

This guide covers the complete deployment of the enhanced Grok/X.AI integration for bali.report, including API setup, component deployment, social media automation, and compliance with Indonesian regulations.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development Setup](#local-development-setup)
4. [Testing the Integration](#testing-the-integration)
5. [DigitalOcean Deployment](#digitalocean-deployment)
6. [Social Media Automation Setup](#social-media-automation-setup)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Compliance & Legal](#compliance--legal)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### 1. API Keys Required
- ✅ **Grok/X.AI API Key** - Sign up at https://x.ai/
- ✅ **X/Twitter Bearer Token** - Get from https://developer.x.com/ (Premium+ recommended)
- ✅ **YouTube Data API v3 Key** - From Google Cloud Console
- ✅ **Matomo Analytics** - For GDPR-compliant tracking

### 2. System Requirements
- Node.js 18+ with npm
- DigitalOcean account with App Platform access
- PM2 for process management
- Git for version control

## Environment Configuration

### 1. Update .env.example and Create .env

```bash
# Copy the enhanced environment template
cp .env.example .env

# Add your API keys to .env
nano .env
```

### 2. Enhanced Environment Variables

Add these to your `.env` file:

```bash
# Enhanced Grok/X.AI Integration
XAI_API_KEY=xai-your_actual_grok_api_key_here
X_BEARER_TOKEN=your_x_api_bearer_token_here

# YouTube API for video enhancement
YOUTUBE_API_KEY=your_youtube_api_key_here

# Base URL for API calls (update for production)
BASE_URL=https://bali.report

# Social Media Automation
SOCIAL_AUTOMATION_TOKEN=your_secure_automation_token

# Rate Limiting & Caching
REDIS_URL=redis://localhost:6379
GROK_RATE_LIMIT=100
CACHE_TTL=3600

# Indonesian Compliance
UU_ITE_COMPLIANCE=true
BPD_VALUES_ENFORCEMENT=true

# DigitalOcean Spaces (for caching)
DO_SPACES_KEY=your_do_spaces_key
DO_SPACES_SECRET=your_do_spaces_secret
DO_SPACES_BUCKET=bali-report-cache
DO_SPACES_REGION=sgp1
```

## Local Development Setup

### 1. Warp Commands for Setup

```bash
# Install dependencies
npm install

# Install additional dependencies for Grok integration
npm install openai node-fetch @types/node-fetch

# Install PM2 globally for process management
npm install -g pm2

# Create required directories
mkdir -p logs generated-content public/cache
```

### 2. Initialize the Enhanced Services

```bash
# Test environment configuration
npm run test:env

# Validate Grok API connection
npm run test:grok

# Start development server with enhanced features
npm run dev:enhanced
```

### 3. Warp Command Aliases (add to your shell profile)

```bash
# Add these to ~/.bashrc, ~/.zshrc, or fish config
alias br-dev="cd ~/projects/bali-report && npm run dev"
alias br-build="cd ~/projects/bali-report && npm run build"
alias br-test="cd ~/projects/bali-report && npm test"
alias br-grok="cd ~/projects/bali-report && node scripts/test-grok-integration.js"
alias br-social="cd ~/projects/bali-report && node scripts/social-media-automation.js"
alias br-deploy="cd ~/projects/bali-report && ./scripts/deploy-to-do.sh"
```

## Testing the Integration

### 1. Test Grok API Connection

```bash
# Test basic Grok API connectivity
curl -X GET "http://localhost:3000/api/grok-enhanced?action=status"

# Test social insights for BRICS
curl -X GET "http://localhost:3000/api/grok-enhanced?action=social-insights&category=brics"

# Test personalized feed (replace with actual preferences)
curl -X GET "http://localhost:3000/api/grok-enhanced?action=personalized-feed&preferences=%7B%22topics%22%3A%5B%22brics%22%2C%22sustainability%22%5D%7D"
```

### 2. Test Video Enrichment

```bash
# Test video enrichment endpoint
curl -X POST "http://localhost:3000/api/grok-enhanced" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "enrich-video",
    "data": {
      "title": "Sustainable Tourism in Bali",
      "description": "Exploring eco-friendly tourism practices in Bali",
      "thumbnailUrl": "https://example.com/thumbnail.jpg"
    }
  }'
```

### 3. Test Social Media Automation

```bash
# Test social thread generation
node scripts/social-media-automation.js MultipolarBali test

# Check automation status
node scripts/social-media-automation.js status

# Run full automation (test mode)
node scripts/social-media-automation.js test
```

### 4. Component Testing

```bash
# Test React components with Jest
npm run test:components

# Test API routes
npm run test:api

# Run E2E tests with Cypress
npm run test:e2e:grok
```

## DigitalOcean Deployment

### 1. App Platform Configuration

Create `app.yaml` for DO App Platform:

```yaml
name: bali-report-enhanced
services:
- name: web
  source_dir: /
  github:
    repo: your-username/bali-report
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: XAI_API_KEY
    value: ${XAI_API_KEY}
    type: SECRET
  - key: X_BEARER_TOKEN
    value: ${X_BEARER_TOKEN}
    type: SECRET
  - key: YOUTUBE_API_KEY
    value: ${YOUTUBE_API_KEY}
    type: SECRET
  - key: BASE_URL
    value: https://bali.report
  - key: NODE_ENV
    value: production
  - key: UU_ITE_COMPLIANCE
    value: "true"
  - key: BPD_VALUES_ENFORCEMENT
    value: "true"

# Optional: Redis for caching
- name: redis
  image:
    registry_type: DOCR
    repository: redis
    tag: 7-alpine
  instance_count: 1
  instance_size_slug: basic-xxs

# Optional: Worker for social automation
- name: social-worker
  source_dir: /
  run_command: pm2-runtime start ecosystem.config.js --only social-automation
  instance_count: 1
  instance_size_slug: basic-xxs
```

### 2. Deploy to DigitalOcean

```bash
# Install DO CLI
curl -sL https://github.com/digitalocean/doctl/releases/download/v1.98.0/doctl-1.98.0-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Authenticate with DO
doctl auth init

# Deploy the app
doctl apps create --spec app.yaml

# Update environment variables
doctl apps update YOUR_APP_ID --spec app.yaml
```

### 3. Custom Domain Setup

```bash
# Add custom domain
doctl apps create-domain YOUR_APP_ID --domain bali.report

# Verify DNS configuration
dig bali.report
```

## Social Media Automation Setup

### 1. PM2 Configuration for Automation

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'bali-report',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'social-automation',
      script: 'scripts/social-media-automation.js',
      cron_restart: '0 */6 * * *', // Every 6 hours
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'grok-cache-cleaner',
      script: 'scripts/cache-cleaner.js',
      cron_restart: '0 2 * * *', // Daily at 2 AM
      autorestart: false
    }
  ]
};
```

### 2. Start Automation Services

```bash
# Start all services
pm2 start ecosystem.config.js

# Start only social automation
pm2 start ecosystem.config.js --only social-automation

# Monitor processes
pm2 monit

# View logs
pm2 logs social-automation

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Cron Job Alternative (if not using PM2)

```bash
# Edit crontab
crontab -e

# Add these entries
# Social media automation every 6 hours
0 */6 * * * cd /home/user/bali-report && node scripts/social-media-automation.js >> logs/social-cron.log 2>&1

# Cache cleanup daily at 2 AM
0 2 * * * cd /home/user/bali-report && node scripts/cache-cleaner.js >> logs/cache-cron.log 2>&1

# Health check every 30 minutes
*/30 * * * * curl -f http://localhost:3000/api/health || echo "Health check failed" >> logs/health.log
```

## Monitoring & Analytics

### 1. Matomo Integration

```javascript
// Add to your layout.tsx or analytics component
<script
  dangerouslySetInnerHTML={{
    __html: `
      var _paq = window._paq = window._paq || [];
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      _paq.push(['setCustomDimension', 1, 'GrokEnabled']);
      _paq.push(['setCustomDimension', 2, 'BPDCompliant']);
      (function() {
        var u="${process.env.NEXT_PUBLIC_MATOMO_URL}";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '${process.env.NEXT_PUBLIC_MATOMO_SITE_ID}']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    `
  }}
/>
```

### 2. Custom Events Tracking

```javascript
// Track Grok API usage
function trackGrokUsage(feature, result, metadata) {
  if (typeof window !== 'undefined' && window._paq) {
    window._paq.push([
      'trackEvent',
      'Grok Integration',
      feature,
      result,
      metadata
    ]);
  }
}

// Usage examples
trackGrokUsage('Social Insights', 'Success', insightCount);
trackGrokUsage('Video Enrichment', 'Fallback', 0);
trackGrokUsage('Opinion Generation', 'Success', wordCount);
```

### 3. Health Monitoring

```bash
# Create health check endpoint monitoring
curl -X GET "https://bali.report/api/health" \
  -H "Authorization: Bearer ${ADMIN_API_TOKEN}"

# Monitor Grok service status
curl -X GET "https://bali.report/api/grok-enhanced?action=status"

# Check social automation status
node scripts/social-media-automation.js status
```

## Compliance & Legal

### 1. Indonesian Regulation Compliance (UU ITE)

The integration includes built-in compliance checks:

```javascript
// Content moderation for Indonesian regulations
import { GrokUtils } from '@/lib/grok-enhanced-service';

// Check content compliance
const compliance = GrokUtils.checkIndonesianCompliance(content);
if (!compliance.isCompliant) {
  console.warn('Content failed Indonesian compliance check:', compliance.warnings);
}

// Add compliance disclaimer
const disclaimer = GrokUtils.generateComplianceDisclaimer();
```

### 2. GDPR Compliance

```javascript
// GDPR-compliant data handling
const userData = {
  preferences: userPreferences,
  location: userLocation, // Optional, with consent
  // No personal identifiers stored
};

// Data retention policy (auto-cleanup after 90 days)
const retentionPolicy = {
  personalizedFeed: '90 days',
  socialInsights: '30 days',
  videoEnrichments: '1 year'
};
```

### 3. BPD Values Enforcement

All AI-generated content is validated against BPD core values:

- ✅ **Mutual Respect** - Equal treatment of all nations
- ✅ **Equality** - Fair representation across viewpoints  
- ✅ **Inclusiveness** - Diverse voices from Global South
- ✅ **Multipolarity** - Multiple centers of power
- ✅ **Sustainable Development** - Long-term environmental goals

## Troubleshooting

### 1. Common Issues

**Grok API Rate Limits:**
```bash
# Check current usage
curl -X GET "http://localhost:3000/api/grok-enhanced?action=status"

# Clear cache to reset rate limiting
curl -X POST "http://localhost:3000/api/grok-enhanced" -d '{"action":"clear-cache"}'
```

**Social Automation Failures:**
```bash
# Check logs
pm2 logs social-automation

# Test single theme
node scripts/social-media-automation.js MultipolarBali test

# Restart automation service
pm2 restart social-automation
```

**Component Rendering Issues:**
```bash
# Check component props
npm run test:components -- --verbose

# Validate TypeScript
npm run type-check

# Check for missing imports
npm run lint
```

### 2. Debug Mode

Enable debug logging:

```bash
# Set debug environment
export DEBUG=grok:*,social:*,video:*

# Run with debug output
DEBUG=grok:* npm run dev

# Check debug logs
tail -f logs/debug.log
```

### 3. Fallback Testing

Test fallback mechanisms:

```bash
# Disable Grok API temporarily
export XAI_API_KEY=""

# Test fallback behavior
curl -X GET "http://localhost:3000/api/grok-enhanced?action=social-insights&category=brics"

# Verify fallback UI works
npm run test:e2e:fallback
```

### 4. Performance Optimization

```bash
# Monitor API response times
curl -w "@curl-format.txt" -X GET "http://localhost:3000/api/grok-enhanced?action=status"

# Check cache hit rates
redis-cli info stats

# Monitor memory usage
pm2 monit

# Optimize images and assets
npm run optimize:assets
```

## 🚀 Quick Start Commands Summary

```bash
# Complete setup from scratch
git clone YOUR_REPO
cd bali-report
npm install
cp .env.example .env
# Edit .env with your API keys
npm run build
npm run test:grok
pm2 start ecosystem.config.js

# Daily maintenance
npm run health:check
node scripts/social-media-automation.js status
pm2 logs social-automation --lines 50

# Deploy updates
git pull origin main
npm install
npm run build
pm2 reload all
```

## 📞 Support

For deployment issues:
- Check logs: `pm2 logs --lines 100`
- Health status: `curl https://bali.report/api/health`
- Component testing: `npm run test:components`
- Grok integration: `npm run test:grok`

---

*This integration ensures bali.report leverages cutting-edge AI while maintaining Indonesian legal compliance and promoting BRICS Partnership for Development values.*