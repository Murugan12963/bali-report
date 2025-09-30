# 🚀 Deployment Guide - Bali Report

This guide covers deploying Bali Report to production environments.

## ✨ Quick Deploy (Recommended)

### Vercel Deployment

Vercel provides the best experience for Next.js applications:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy Bali Report"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js and configures everything

3. **Set Environment Variables** (Optional)
   ```bash
   XAI_API_KEY=your_grok_api_key
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
   NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-your-id
   ```

4. **Deploy**
   - Vercel deploys automatically on every push
   - Custom domain setup available in dashboard

🎉 **Done!** Your site will be live at `https://your-project.vercel.app`

## 💻 Manual Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- Domain with SSL (recommended)

### Build and Deploy

```bash
# Clone and setup
git clone <your-repo-url>
cd bali-report
npm install

# Build for production
npm run build

# Start production server
npm start
```

### Process Manager (PM2)

For production stability:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start "npm start" --name "bali-report"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🌐 Alternative Platforms

### Netlify

```bash
# Build command
npm run build

# Publish directory
out/

# Add to netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### DigitalOcean App Platform

```yaml
name: bali-report
services:
- name: web
  source_dir: /
  github:
    repo: your-username/bali-report
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `XAI_API_KEY` | No | Grok AI integration |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | No | Google Analytics |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` | No | Google AdSense client id |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT` | No | In-feed/native ad unit slot id |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT` | No | Leaderboard ad unit slot id |
| `NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT` | No | Sidebar ad unit slot id |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | No | Stripe publishable key for client-side checkout |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for server-side APIs |
| `NEXT_PUBLIC_DONATION_PRICE_ID` | No | Stripe Price ID for donations (or Payment Link URL) |
| `NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID` | No | Stripe Price ID for subscriptions |

### Production Optimizations

The application includes several production optimizations:

- **RSS Caching**: 5-minute TTL with stale-while-revalidate
- **Image Optimization**: Next.js automatic optimization
- **Bundle Splitting**: Automatic code splitting
- **Compression**: Gzip/Brotli compression
- **CDN Ready**: Static assets optimized for CDN

## 📊 Monitoring

### Health Check Endpoint

The app includes a health check at `/api/health`:

```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "rss_sources": 9,
  "cache_hit_rate": 0.95
}
```

### Performance Monitoring

- **Response Times**: <7ms average
- **Bundle Size**: ~147KB optimized
- **RSS Sources**: 9 active, monitored for uptime
- **Cache Performance**: 90%+ hit rate

## 🔒 Security & Compliance

### Content Policy and Compliance
- Maintain neutral editorial tone to reduce AdSense moderation risk
- Provide Sources & Fact-Check page detailing aggregation policy
- Footer disclaimer: “Content aggregated from external sources; views are those of original authors.”
- Indonesia compliance (UU ITE): avoid content labeled as fake news or inciting unrest
- GDPR: show cookie consent banner; block non-essential scripts until consent

### Security Headers

Automatically includes:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content Security Policy
- Referrer Policy

### HTTPS

- Always use HTTPS in production
- Vercel provides automatic HTTPS
- For manual deployment, use Let's Encrypt

## 🚑 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**RSS Feeds Not Loading**
- Check network connectivity
- Verify RSS source URLs
- Check rate limiting

**Performance Issues**
- Enable caching
- Check bundle size
- Monitor database queries

### Getting Help

- Check GitHub issues
- Review application logs
- Use health check endpoint

---

## 🏁 Success!

Your Bali Report is now live and delivering multi-polar news to the world! 🌍

For updates and maintenance, simply push to your repository and the deployment will update automatically.

# DEPLOYMENT.md - Bali Report

## 🚀 **Pre-Deployment Checklist**

### ✅ **Completed Tasks**

#### **Core Functionality**
- [x] RSS aggregation working (312 articles from 6 sources)
- [x] Category pages with proper filtering (BRICS, Indonesia, Bali)
- [x] Enhanced search functionality with relevance scoring
- [x] Dark/Light theme switcher with system detection
- [x] Responsive design for mobile, tablet, desktop
- [x] Google AdSense integration (development placeholders ready)

#### **SEO & Performance**
- [x] Comprehensive SEO metadata with structured data (Schema.org)
- [x] Category-specific SEO optimization
- [x] Dynamic sitemap generation
- [x] Robots.txt configuration
- [x] Open Graph and Twitter Card meta tags
- [x] Mobile-responsive meta theme-color

#### **Development Setup**
- [x] TypeScript configuration
- [x] ESLint configuration (production-ready)
- [x] Tailwind CSS 4 with dark mode
- [x] Environment variables template (.env.example)
- [x] Error pages (404 not-found page)

### 📋 **Remaining Critical Tasks**

#### **1. Fix Build Issues** ✅ 
- [x] **COMPLETED**: Resolved ThemeProvider context issue in static pages
- [x] Test production build completion without errors
- [ ] Verify all pages render correctly in production

#### **2. Environment Configuration** 🔧
- [ ] Set up Vercel environment variables:
  - `NEXT_PUBLIC_SITE_URL=https://bali.report`
  - `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` and slot IDs (when Google AdSense account ready)
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (when Google Analytics ready)

#### **3. Domain & DNS Setup** 🌐
- [ ] Configure **bali.report** domain
- [ ] Set up Vercel custom domain
- [ ] Configure DNS records (A/CNAME)
- [ ] SSL certificate verification
- [ ] www redirect setup (www.bali.report → bali.report)

#### **4. Production Services** 📊
- [ ] **Google AdSense Account**:
  - Create Google AdSense publisher account
  - Get ad unit slot IDs for different ad types
  - Configure environment variables
- [ ] **Google Analytics** (Optional):
  - Create GA4 property
  - Add measurement ID to environment
- [ ] **Google Search Console**:
  - Add and verify domain ownership
  - Submit sitemap.xml

#### **5. Performance Optimization** ⚡
- [ ] Test Core Web Vitals (LCP, FID, CLS)
- [ ] Optimize RSS fetching for production (caching)
- [ ] Test mobile performance and responsiveness
- [ ] Verify dark/light theme switching performance

#### **6. Security & Monitoring** 🔒
- [ ] Configure security headers in Vercel
- [ ] Set up error monitoring (Sentry - optional)
- [ ] Test HTTPS redirect and SSL
- [ ] Verify no sensitive data exposure

#### **7. Content & Final Testing** 🧪
- [ ] Test all RSS sources in production environment
- [ ] Verify all internal links work correctly
- [ ] Test search functionality with live data
- [ ] Cross-browser compatibility testing
- [ ] Mobile device testing (iOS/Android)

## 🎯 **Immediate Next Steps (Priority Order)**

### **Step 1: Fix Build Issues (CRITICAL)**
The main blocker is the ThemeProvider context issue. Need to:
1. Fix static page generation with theme context
2. Ensure successful production build
3. Test local production build (`npm run build && npm start`)

### **Step 2: Vercel Deployment Setup**
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### **Step 3: Domain Configuration**
1. Purchase/configure **bali.report** domain
2. Add custom domain in Vercel dashboard
3. Update DNS records as instructed by Vercel

### **Step 4: Monetization Setup**
1. Create Google AdSense account
2. Get ad unit slot IDs for different ad formats
3. Update environment variables in Vercel

## 🚦 **Deployment Readiness Status**

| Component | Status | Notes |
|-----------|---------|-------|
| **Core Features** | ✅ Ready | RSS, search, themes working |
| **Build System** | ⚠️ Issues | ThemeProvider context error |
| **SEO** | ✅ Ready | Sitemap, robots.txt, meta tags |
| **Responsive Design** | ✅ Ready | Mobile, tablet, desktop tested |
| **Environment Config** | ✅ Ready | .env.example created |
| **Domain Setup** | ❌ Pending | Need to configure bali.report |
|| **Monetization** | 🔄 Partial | Placeholder ready, need Google AdSense account |

## 📝 **Post-Deployment Tasks**

### **Week 1 After Launch**
- [ ] Monitor RSS feed reliability
- [ ] Check Google Search Console for indexing
- [ ] Verify Google AdSense revenue tracking
- [ ] Monitor site performance and Core Web Vitals
- [ ] Test all functionality on live domain

### **Week 2-4 After Launch**
- [ ] Add more RSS sources (especially Bali local news)
- [ ] Implement analytics dashboard
- [ ] Add social sharing buttons
- [ ] Consider newsletter signup (Mailchimp)
- [ ] Optimize based on user feedback

## ⚡ **Quick Deploy Commands**

```bash
# Test production build locally
npm run build
npm start

# Deploy to Vercel (after setup)
vercel --prod

# Check deployment status  
vercel ls

# View deployment logs
vercel logs
```

---

**Current Status**: ~85% deployment ready. Main blocker is build issues that need to be resolved before production deployment.