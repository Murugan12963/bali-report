# 🚀 Adsterra Setup Guide

## Current Status
- ✅ Adsterra integration code is ready and enabled
- ⚠️  Zone IDs are not configured (currently using placeholder values)
- 🎯 Need to set actual zone IDs from your Adsterra dashboard

## Quick Setup

### 1. Get Your Zone IDs from Adsterra Dashboard

1. **Login to Adsterra Publishers**: https://publishers.adsterra.com/
2. **Create Ad Units** for each type you want:
   - **Banner Ads** (728x90 or responsive)
   - **Native Ads** (300x250 or similar)
   - **Social Bar** (floating social bar)
   - **Popunder** (full-page popunder)
3. **Copy the Zone IDs** (they look like: `4372228`, `5849205`, etc.)

### 2. Update Environment Variables

**For Local Development** (`.env.local`):
```bash
# Replace with your actual Zone IDs from Adsterra dashboard
NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID=4372228
NEXT_PUBLIC_ADSTERRA_NATIVE_ZONE_ID=5849205  
NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_ZONE_ID=3847291
NEXT_PUBLIC_ADSTERRA_POPUNDER_ZONE_ID=2938475
```

**For Production Server** (`.env.production`):
```bash
# Add these to your production environment
NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID=4372228
NEXT_PUBLIC_ADSTERRA_NATIVE_ZONE_ID=5849205  
NEXT_PUBLIC_ADSTERRA_POPUNDER_ZONE_ID=2938475
```

### 3. Deploy to Production

```bash
# On your server
ssh root@your-server
cd /var/www/bali-report

# Edit production environment
nano .env.production
# Add the zone IDs above

# Rebuild and restart
npm run build
pm2 restart all
```

## Testing

### Console Output (What to Expect)

**Before Setup** (current state):
```
📢 Adsterra: No valid zone ID provided. Current zone ID: 5336445
📢 Adsterra: Set your actual zone IDs from Adsterra dashboard
```

**After Setup** (with real zone IDs):
```
Loading Adsterra ads - Method 1: Primary script
✅ Adsterra script loaded successfully
```

### Where Ads Will Appear

- **Banner Ads**: Homepage header, article pages
- **Native Ads**: Between article listings, in sidebars  
- **Social Bar**: Floating social media bar
- **Popunder**: On page visits (use carefully)

## Current Integration Points

The ads are already integrated in these components:
- `HomePage` - Banner ads in header
- `ArticleListing` - Native ads between articles
- `SidebarAds` - Native ads in sidebar
- `GlobalAds` - Popunder ads site-wide

## Troubleshooting

### Ads Not Showing
1. **Check Zone IDs**: Make sure they're real numbers, not placeholder text
2. **Check Console**: Look for Adsterra loading messages
3. **Check CSP**: Content Security Policy allows Adsterra domains (already configured)
4. **Ad Blockers**: Test with ad blockers disabled

### Console Errors
- `script failed` - Zone ID might be wrong or inactive
- `CORS errors` - CSP headers need updating (already done)
- `404 errors` - Invalid zone ID or malformed URL

## Revenue Optimization

### Best Practices
- **Banner Ads**: 1-2 per page maximum
- **Native Ads**: Every 3-5 articles in listings  
- **Social Bar**: Enable if social engagement is important
- **Popunder**: Use sparingly (1-2 per session max)

### Performance Tips
- Ads load asynchronously (won't block page rendering)
- Failed ads fall back gracefully  
- Placeholder content shows during loading

## Next Steps

1. **Sign up/Login to Adsterra** if you haven't already
2. **Create ad units** for each format you want
3. **Copy the zone IDs** and update environment variables
4. **Test locally** first, then deploy to production
5. **Monitor performance** in Adsterra dashboard

Once configured, your site will have professional ad integration without the console errors!