# X.com API v2 Integration Guide
Complete implementation guide for X.com social insights integration in bali-report

## 🚀 Quick Start

### Prerequisites
- X.com Premium+ account with API access (10K pulls/month)
- DigitalOcean droplet or App Platform access
- Node.js 18+ and npm/yarn
- PM2 for process management

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Add your X API credentials
echo "X_BEARER_TOKEN=your_x_api_bearer_token" >> .env
echo "ADMIN_API_TOKEN=$(openssl rand -base64 32)" >> .env
```

### 2. Install Dependencies

```bash
# Install the twitter-api-v2 package (already done)
npm install twitter-api-v2 --legacy-peer-deps

# Verify installation
npm list twitter-api-v2
```

### 3. Local Development

```bash
# Start development server
npm run dev

# Test X API service (in another terminal)
curl "http://localhost:3000/api/x-news?category=BRICS&limit=5"

# Test social insights page
open http://localhost:3000/brics/social-insights
```

## 🧪 Testing Commands

### Unit Testing
```bash
# Run all tests
npm test

# Run specific X API tests (when created)
npm test -- x-api-service.test.ts

# Run tests in watch mode
npm test -- --watch
```

### API Testing
```bash
# Test X API endpoint
curl -X GET "http://localhost:3000/api/x-news" \
  -H "Accept: application/json" \
  -G \
  -d "category=BRICS" \
  -d "limit=10" \
  -d "images=true" \
  -d "min_engagement=5"

# Test admin endpoints (replace with your admin token)
curl -X POST "http://localhost:3000/api/x-news" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats", "auth_token": "your_admin_token"}'

# Clear X API cache
curl -X POST "http://localhost:3000/api/x-news" \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_cache", "auth_token": "your_admin_token"}'
```

### Performance Testing
```bash
# Load test X API endpoint
for i in {1..10}; do
  curl -s "http://localhost:3000/api/x-news?category=BRICS" > /dev/null && echo "Request $i: OK"
done

# Monitor response times
time curl "http://localhost:3000/api/x-news?category=BRICS&limit=20"
```

### End-to-End Testing
```bash
# Run Cypress E2E tests (if available)
npm run test:e2e

# Or run specific social insights tests
npx cypress run --spec "cypress/e2e/social-insights.cy.ts"
```

## 🏗️ Build & Deployment

### Local Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Verify social insights work in production
curl "http://localhost:3000/api/x-news?category=BRICS"
```

### DigitalOcean Droplet Deployment

#### Step 1: Prepare Server
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Clone your repository
git clone https://github.com/yourusername/bali-report.git
cd bali-report
```

#### Step 2: Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

Add these variables:
```env
# X.com API Configuration
X_BEARER_TOKEN=your_x_api_bearer_token_here
ADMIN_API_TOKEN=your_secure_admin_token_here

# DigitalOcean Production Settings
NODE_ENV=production
BASE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Matomo Analytics
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.com
NEXT_PUBLIC_MATOMO_SITE_ID=your_matomo_site_id
```

#### Step 3: Build and Start
```bash
# Install dependencies
npm install --production

# Build for production
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2 (includes X API cron job)
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup

# Check status
pm2 status
```

#### Step 4: Monitor Cron Jobs
```bash
# Check X API cron job logs
pm2 logs x-api-cron

# Monitor all processes
pm2 monit

# Restart X API cron if needed
pm2 restart x-api-cron
```

### DigitalOcean App Platform Deployment

#### Step 1: Create App Spec
Create `.do/app.yaml`:
```yaml
name: bali-report
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/bali-report
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: X_BEARER_TOKEN
    value: your_x_api_bearer_token
    type: SECRET
  - key: ADMIN_API_TOKEN
    value: your_admin_token
    type: SECRET
  - key: NEXT_PUBLIC_SITE_URL
    value: https://bali-report-xyz.ondigitalocean.app
jobs:
- name: x-api-cron
  source_dir: /
  run_command: node scripts/x-api-cron.js
  schedule: "0 * * * *"  # Every hour
```

#### Step 2: Deploy
```bash
# Install doctl CLI
# Follow: https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init

# Deploy app
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
doctl apps logs your-app-id
```

## 🔧 Configuration Options

### X API Service Configuration
Edit `src/lib/x-api-service.ts` to adjust:

```typescript
// Rate limiting (Premium+ Basic tier)
private readonly MAX_REQUESTS_PER_WINDOW = 15; // Requests per 15min

// Cache settings
private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Search queries per category
const queries = {
  BRICS: [
    'BRICS sustainable development lang:id filter:news min_faves:5',
    'BRICS multipolarity lang:en filter:news min_faves:5',
    // Add more queries
  ]
};
```

### Cron Job Schedule
Edit `ecosystem.config.js`:
```javascript
{
  name: 'x-api-cron',
  script: './scripts/x-api-cron.js',
  cron_restart: '0 * * * *', // Every hour (adjust as needed)
}
```

## 📊 Monitoring & Analytics

### Check X API Usage
```bash
# Get current usage stats
curl -X POST "http://localhost:3000/api/x-news" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats", "auth_token": "your_admin_token"}' | jq
```

### Monitor Matomo Analytics
- Visit your Matomo instance
- Check "X Social Insights" category for events
- Monitor custom dimensions for social insights

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs bali-report
pm2 logs x-api-cron

# Check process health
pm2 status
pm2 info bali-report
```

## 🐛 Troubleshooting

### X API Issues
```bash
# Check X API service status
curl "http://localhost:3000/api/x-news?category=BRICS" | jq '.success'

# Verify environment variables
echo $X_BEARER_TOKEN | cut -c1-10  # Should show first 10 chars

# Clear cache if stale data
curl -X POST "http://localhost:3000/api/x-news" \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_cache", "auth_token": "your_admin_token"}'
```

### Rate Limiting Issues
- X API Premium+ Basic: 10K requests/month ≈ 333/day ≈ 14/hour
- Adjust `MAX_REQUESTS_PER_WINDOW` in x-api-service.ts
- Monitor usage with admin endpoints

### Cron Job Issues
```bash
# Check cron job status
pm2 info x-api-cron

# View cron job logs
pm2 logs x-api-cron --lines 50

# Manual run
node scripts/x-api-cron.js
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript issues
npm run type-check
```

## 🔒 Security Considerations

### API Key Management
- Store X_BEARER_TOKEN as environment variable
- Use strong ADMIN_API_TOKEN (32+ random characters)
- Rotate tokens regularly
- Never commit tokens to version control

### Rate Limiting
- API route has built-in rate limiting (10 req/min)
- X API service has request counting
- Monitor usage to avoid hitting X API limits

### GDPR Compliance
- Matomo tracking respects user privacy settings
- No personal data collected from tweets
- Social insights are public content only

## 📈 Performance Optimization

### Caching Strategy
- X API responses cached for 30 minutes
- Server-side caching with proper headers
- Redis/DO Spaces integration available

### Load Optimization
- Lazy loading of social insights components
- Image optimization for tweet media
- Bundle analysis: `npm run analyze` (if configured)

## 🎯 Usage Examples

### Basic Integration Test
```javascript
// Test X API service
import { xApiService } from '@/lib/x-api-service';

const response = await xApiService.searchTweets({
  category: 'BRICS',
  limit: 10,
  includeImages: true,
  minEngagement: 5
});

console.log(`Retrieved ${response.tweets.length} tweets`);
```

### Enhanced News Aggregation
```javascript
// Combine RSS with social insights
import { enhancedNewsAggregator } from '@/lib/enhanced-news-aggregator';

const unified = await enhancedNewsAggregator.createUnifiedFeed(
  articles, 
  'BRICS',
  { enableEnhancement: true, minEngagement: 5 }
);

console.log(`Enhanced ${unified.metadata.enhancedArticles} articles`);
```

## 📚 Additional Resources

- [X API v2 Documentation](https://developer.x.com/en/docs/x-api)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Support

For issues specific to this integration:
1. Check the troubleshooting section above
2. Review logs: `pm2 logs x-api-cron`
3. Test API endpoints manually
4. Verify environment variables

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready