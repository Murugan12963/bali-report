# 🐛 Console Error Fixes

## Summary of Console Errors

You're seeing these errors:
1. **ThemeProvider hydration mismatch** - Server/client rendering mismatch
2. **Matomo Analytics not configured** - Missing environment variables
3. **Adsterra ads failing to load** - Missing zone IDs and trying multiple fallbacks
4. **Stripe integration error** - Missing API key

## Quick Fix: Update Environment Variables

SSH to your droplet and update the `.env` file:

```bash
ssh root@152.42.250.203
cd /var/www/bali-report
nano .env
```

Add these lines to disable services that aren't configured:

```bash
# Disable external services to prevent console errors
DISABLE_MATOMO=true
DISABLE_ADSTERRA=true
DISABLE_STRIPE=true

# Set empty values for unconfigured services
NEXT_PUBLIC_MATOMO_URL=
NEXT_PUBLIC_MATOMO_SITE_ID=
NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID=
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
```

Then rebuild and restart:

```bash
npm run build
pm2 restart all
```

## Code Fixes Already Made (Locally)

I've updated these files locally - they need to be uploaded to your server:

### 1. `src/contexts/ThemeContext.tsx`
Changed `useTheme()` to return a fallback instead of throwing an error:

```typescript
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return fallback instead of throwing error during SSR
    console.warn("ThemeProvider not available, using fallback theme");
    return {
      theme: "system" as Theme,
      effectiveTheme: "light" as const,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
```

### 2. `src/components/MatomoAnalytics.tsx`
Added disable check:

```typescript
export default function MatomoAnalytics() {
  useEffect(() => {
    // Check if Matomo is disabled
    if (process.env.DISABLE_MATOMO === 'true') {
      return;
    }
    // ... rest of the code
  }, []);
}
```

### 3. `src/components/AdsterraAds.tsx`
Added early return if disabled:

```typescript
const AdsterraAds: React.FC<AdsterraAdsProps> = ({ type, className = "", zoneId }) => {
  // ... state declarations
  
  // Check if Adsterra is disabled
  const isDisabled = process.env.DISABLE_ADSTERRA === 'true' || !zoneId || zoneId === '5336445';
  
  if (isDisabled) {
    return (
      <div className={className} style={{display: 'none'}}>
        {/* Adsterra disabled */}
      </div>
    );
  }
  // ... rest of the code
}
```

### 4. `src/lib/stripe.ts`
Made Stripe optional:

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && process.env.DISABLE_STRIPE !== 'true' ? loadStripe(stripeKey) : null;

export default stripePromise;
```

## Manual Upload Steps

When SSH is working again, upload the fixed files:

```bash
# From your local machine
cd /home/murugan/projects/bali-report

# Upload the fixed files
scp src/contexts/ThemeContext.tsx root@152.42.250.203:/var/www/bali-report/src/contexts/
scp src/components/MatomoAnalytics.tsx root@152.42.250.203:/var/www/bali-report/src/components/
scp src/components/AdsterraAds.tsx root@152.42.250.203:/var/www/bali-report/src/components/
scp src/lib/stripe.ts root@152.42.250.203:/var/www/bali-report/src/lib/

# Then rebuild on the server
ssh root@152.42.250.203 "cd /var/www/bali-report && npm run build && pm2 restart all"
```

## Alternative: Apply Fixes Manually

If file upload is problematic, you can edit the files directly on the server:

```bash
ssh root@152.42.250.203
cd /var/www/bali-report

# Edit each file with nano or vi
nano src/contexts/ThemeContext.tsx
# Apply the changes shown above

nano src/components/MatomoAnalytics.tsx
# Apply the changes shown above

nano src/components/AdsterraAds.tsx
# Apply the changes shown above

nano src/lib/stripe.ts
# Apply the changes shown above

# Then rebuild
npm run build
pm2 restart all
```

## Expected Result

After applying these fixes, you should see:
- ✅ No more ThemeProvider warnings
- ✅ No more Matomo loading errors
- ✅ No more Adsterra script loading attempts
- ✅ No more Stripe integration errors
- ✅ Clean console with minimal warnings

## When to Configure These Services

### Matomo Analytics
When you're ready to add analytics:
1. Set up a Matomo instance (self-hosted or cloud)
2. Get your site ID
3. Update `.env`:
   ```
   NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.com
   NEXT_PUBLIC_MATOMO_SITE_ID=1
   DISABLE_MATOMO=false
   ```

### Adsterra Ads
When you're ready to monetize:
1. Sign up at https://www.adsterra.com
2. Get your zone IDs
3. Update `.env`:
   ```
   NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID=your_zone_id
   NEXT_PUBLIC_ADSTERRA_NATIVE_ZONE_ID=your_zone_id
   DISABLE_ADSTERRA=false
   ```

### Stripe Payments
When you're ready for donations/subscriptions:
1. Sign up at https://stripe.com
2. Get your publishable key
3. Update `.env`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxx
   DISABLE_STRIPE=false
   ```

## Current Status

All fixes have been made locally in your codebase. The files are ready to be deployed to your server when SSH connectivity is restored.

Your application will work fine without these third-party services - they're all optional features for analytics, monetization, and payments.