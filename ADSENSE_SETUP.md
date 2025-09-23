# Google AdSense Setup Guide for Bali Report

## 📋 Overview

This guide explains how to properly set up Google AdSense for the Bali Report website.

## 🔑 What You Need from AdSense Dashboard

When setting up AdSense, you'll be asked for different verification methods. Here's what to choose:

### 1. **Meta Tag** (Choose this for initial verification)
- ✅ **USE THIS FIRST** for site ownership verification
- Already implemented in `src/app/layout.tsx`
- AdSense will provide something like:
  ```html
  <meta name="google-adsense-account" content="ca-pub-XXXXXXXXXXXXXXXX">
  ```
- We automatically use your `NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT` env variable

### 2. **ads.txt File** (Required after approval)
- ✅ **REQUIRED** for monetization to work
- Already created at `public/ads.txt`
- Update it with your publisher ID after approval:
  ```
  google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
  ```
- This file will be accessible at: https://bali.report/ads.txt

### 3. **AdSense Code Snippet** (For displaying ads)
- ✅ **USE AFTER APPROVAL** to display actual ads
- Components already created in `src/components/GoogleAdSense.tsx`
- Just need to add your ad unit IDs to environment variables

## 🚀 Step-by-Step Setup Process

### Phase 1: Initial Application (Before Approval)

1. **Go to [Google AdSense](https://www.google.com/adsense/)**

2. **Sign up and add your site:**
   - URL: `https://bali.report`
   - Language: English
   - Country: Your country

3. **When asked for verification method:**
   - Choose **"HTML tag"** or **"Meta tag"**
   - Copy your publisher ID (looks like `ca-pub-1234567890123456`)

4. **Update your environment variables:**
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
   ```

5. **Deploy your changes:**
   ```bash
   git add .
   git commit -m "Add AdSense verification"
   git push origin main
   ```

6. **Verify in AdSense:**
   - Click "Verify" in AdSense dashboard
   - Wait for approval (24 hours to 14 days)

### Phase 2: After Approval

1. **Create Ad Units in AdSense:**
   - Go to Ads → By ad unit
   - Create these units:
     - **Leaderboard**: Display ads → Horizontal banner
     - **Sidebar**: Display ads → Square
     - **In-feed**: Native ads → In-feed
     - **Responsive**: Display ads → Responsive

2. **Get your ad unit IDs:**
   Each ad unit will have a `data-ad-slot` number like `1234567890`

3. **Update ads.txt file:**
   ```bash
   # Edit public/ads.txt
   # Replace pub-XXXXXXXXXXXXXXXX with your actual publisher ID
   google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
   ```

4. **Update environment variables with ad slots:**
   ```bash
   NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-1234567890123456
   NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT=1234567890
   NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT=0987654321
   NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT=1122334455
   NEXT_PUBLIC_GOOGLE_ADSENSE_RESPONSIVE_SLOT=5544332211
   ```

5. **Deploy to production:**
   ```bash
   git add .
   git commit -m "Add AdSense ad units"
   git push origin main
   ```

## 📍 Where to Place Ads in Your App

### Example Usage in Components:

```tsx
// In your homepage or article list
import { LeaderboardAd, InFeedAd } from '@/components/GoogleAdSense';

export default function HomePage() {
  return (
    <div>
      {/* Top of page */}
      <LeaderboardAd />
      
      {/* Between articles */}
      <ArticleList />
      <InFeedAd />
      <ArticleList />
    </div>
  );
}
```

```tsx
// In your sidebar
import { SidebarAd } from '@/components/GoogleAdSense';

export default function Sidebar() {
  return (
    <aside>
      <Categories />
      <SidebarAd />
      <PopularPosts />
    </aside>
  );
}
```

## ✅ Verification Checklist

### Before Applying:
- [ ] Site has substantial content (10+ articles)
- [ ] Privacy Policy page exists
- [ ] Terms of Service page exists
- [ ] Contact/About page exists
- [ ] Site is live at https://bali.report

### For Verification:
- [ ] Meta tag added to layout.tsx
- [ ] Environment variable set for ADSENSE_CLIENT
- [ ] Site deployed with changes
- [ ] ads.txt file accessible at /ads.txt

### After Approval:
- [ ] Ad units created in AdSense
- [ ] Environment variables updated with slot IDs
- [ ] ads.txt updated with correct publisher ID
- [ ] Ad components placed in app
- [ ] Changes deployed to production

## 🚨 Common Issues & Solutions

### "Site not found" during verification
- Ensure meta tag is in production
- Check that site is accessible
- Try verification after 24 hours

### Ads not showing after approval
- Check browser console for errors
- Ensure ad blocker is disabled
- Verify environment variables are set
- Wait 30-60 minutes after first implementation

### ads.txt errors
- Ensure file is at exactly `/public/ads.txt`
- Check format is exactly as specified
- Verify at: https://bali.report/ads.txt

### Low ad revenue
- Improve content quality
- Increase traffic
- Optimize ad placements
- Consider ad density (3-4 ads per page max)

## 📞 Support Resources

- [AdSense Help Center](https://support.google.com/adsense)
- [AdSense Community](https://support.google.com/adsense/community)
- [ads.txt Specification](https://iabtechlab.com/ads-txt/)

## 💡 Best Practices

1. **Don't click your own ads** (will result in ban)
2. **Follow content policies** (no copyrighted content)
3. **Maintain good user experience** (don't overload with ads)
4. **Monitor performance** in AdSense dashboard
5. **Optimize for Core Web Vitals** (affects ad rates)

---

Last updated: $(date)
Ready for: Initial verification phase