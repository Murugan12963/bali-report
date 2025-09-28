# 🚀 Bali Report - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Code Quality Status
- [x] Build successful (npm run build ✅)
- [x] All tests passing (33/33 tests ✅)
- [x] TypeScript warnings reduced to non-critical
- [x] Performance optimized (<7ms response, 129KB bundle)
- [x] RSS feeds active (563+ articles from 9 sources)

## 🔐 Environment Variables Setup

### Required Production Variables
Create these environment variables in your Vercel dashboard:

```bash
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://bali.report

# Google AdSense Integration
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-your-adsense-client-id
NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT=your-leaderboard-slot-id
NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT=your-sidebar-slot-id
NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT=your-native-slot-id
NEXT_PUBLIC_GOOGLE_ADSENSE_RESPONSIVE_SLOT=your-responsive-slot-id

# Optional: AI Enhancement (x.ai Grok)
XAI_API_KEY=your-grok-api-key

# Optional: Analytics
NEXT_PUBLIC_GA_TRACKING_ID=your-google-analytics-id

# Optional: Newsletter Integration
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-mailchimp-list-id
```

### Environment Variable Priorities
1. **Required for Basic Function**: `NODE_ENV`, `NEXT_PUBLIC_SITE_URL`
2. **Required for Monetization**: Google AdSense variables
3. **Optional Enhancements**: AI, Analytics, Newsletter

## 🌐 Vercel Deployment Steps

### 1. Connect GitHub Repository
1. Login to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "bali-report" project

### 2. Configure Build Settings
Vercel will auto-detect Next.js. Verify these settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Add Environment Variables
In Vercel Project Settings → Environment Variables, add all production variables listed above.

### 4. Custom Domain Setup
1. Go to Project Settings → Domains
2. Add `bali.report` as custom domain
3. Update your domain's DNS settings:
   - Add CNAME record: `bali.report` → `cname.vercel-dns.com`
   - Add CNAME record: `www.bali.report` → `cname.vercel-dns.com`

### 5. Deploy
- Push to `main` branch triggers automatic deployment
- Or click "Deploy" button in Vercel dashboard

## 📈 Post-Deployment Setup

### 1. Google AdSense Account Setup
1. Visit [Google AdSense](https://www.google.com/adsense/)
2. Add your site: `https://bali.report`
3. Get your Publisher ID (ca-pub-XXXXXXXXX)
4. Create ad units:
   - Leaderboard (728x90)
   - Medium Rectangle (300x250)
   - Native In-feed
   - Responsive Display
5. Update environment variables with slot IDs

### 2. Google Search Console
1. Visit [Google Search Console](https://search.google.com/search-console/)
2. Add property: `https://bali.report`
3. Verify ownership (DNS or HTML file)
4. Submit sitemap: `https://bali.report/sitemap.xml`

### 3. Google Analytics (Optional)
1. Create Google Analytics 4 property
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to `NEXT_PUBLIC_GA_TRACKING_ID` environment variable

### 4. Performance Monitoring
The project includes a health check endpoint:
- **Health Check**: `https://bali.report/api/health`
- **Monitor**: RSS feed status, cache performance, system health

## 🔍 Post-Deployment Verification

### 1. Functionality Tests
- [ ] Homepage loads with articles
- [ ] RSS feeds are working (check /api/health)
- [ ] Dark/light theme switching
- [ ] Search functionality
- [ ] Mobile responsiveness
- [ ] Category pages (BRICS, Indonesia, Bali)

### 2. SEO Verification
- [ ] Sitemap accessible: `/sitemap.xml`
- [ ] Robots.txt accessible: `/robots.txt`
- [ ] Meta tags present (view source)
- [ ] Open Graph tags for social sharing
- [ ] Schema.org structured data

### 3. Performance Check
- [ ] Page speed < 3 seconds (use PageSpeed Insights)
- [ ] Core Web Vitals passing
- [ ] RSS caching working (5-minute cache)
- [ ] Ad placeholders showing in development

### 4. Content Verification
- [ ] Articles from all 9 RSS sources
- [ ] Proper categorization (BRICS, Indonesia, Bali)
- [ ] Search results relevant
- [ ] Save for Later functionality

## 🚨 Troubleshooting

### Common Issues

#### RSS Feeds Not Loading
- Check network connectivity to RSS sources
- Verify RSS parser is working: `/api/health`
- RSS sources may be temporarily down (retry logic included)

#### Ads Not Displaying
- Ensure AdSense account is approved
- Check environment variables are set correctly
- Ads may take 24-48 hours to appear after approval

#### Build Failures
- Check TypeScript errors: `npm run type-check`
- Verify all dependencies: `npm install`
- Check build logs in Vercel dashboard

#### Performance Issues
- Monitor bundle size (should be ~129KB)
- Check RSS cache hit rate
- Verify CDN is working (Vercel Edge Network)

## 📊 Monitoring & Maintenance

### Daily Monitoring
- RSS feed availability (9 sources)
- Site uptime and response times
- Error rates in Vercel dashboard

### Weekly Tasks
- Review Google Analytics traffic
- Check AdSense earnings and performance
- Monitor RSS source reliability

### Monthly Tasks
- Update dependencies: `npm update`
- Review and optimize bundle size
- Add new RSS sources if available
- Content strategy review

## 🔐 Security Considerations

### Environment Variables
- Never commit API keys to repository
- Use Vercel environment variables only
- Rotate API keys periodically

### Content Security
- RSS content is parsed and sanitized
- No user-generated content stored
- All external links are properly handled

### Performance Security
- Rate limiting on API endpoints
- Caching prevents excessive RSS requests
- Error handling prevents crashes

## 📈 Growth & Scaling

### Phase 1: Launch (Current)
- Basic RSS aggregation
- Google AdSense monetization
- SEO optimization

### Phase 2: Enhancement
- User accounts and personalization
- Newsletter integration
- Social media integration

### Phase 3: Scale
- Additional content sources
- Advanced personalization with AI
- Mobile app development

## 🎯 Success Metrics

### Technical KPIs
- **Uptime**: >99.9%
- **Response Time**: <3 seconds
- **RSS Success Rate**: >95%
- **Core Web Vitals**: All green

### Business KPIs
- **Daily Active Users**: Track via Analytics
- **Page Views**: Monitor content engagement
- **Ad Revenue**: Google AdSense performance
- **Search Rankings**: Monitor SERP positions

## 🆘 Emergency Contacts

### Critical Issues
- Vercel Status: https://vercel-status.com
- RSS Source Status: Check individual source websites
- DNS Issues: Check domain registrar

### Support Resources
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Google AdSense Support: https://support.google.com/adsense

---

## 🚀 Quick Deploy Commands

```bash
# Final pre-deployment check
npm run build
npm test
npm run type-check

# Deploy to Vercel (if using CLI)
npx vercel --prod

# Monitor deployment
npx vercel logs --follow
```

**Last Updated**: 2024-12-20  
**Status**: ✅ Production Ready  
**Deployment Target**: Vercel + bali.report domain