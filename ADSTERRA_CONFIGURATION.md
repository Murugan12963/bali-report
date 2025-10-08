# Adsterra Native Ads Configuration
**Date:** October 8, 2025  
**Zone ID:** 5336445  
**Status:** ✅ CONFIGURED

## 🚀 Configuration Applied

### **Environment Variables Set**
```bash
# Multiple environment files for redundancy
.env:
ADSTERRA_NATIVE_ADS=5336445
NEXT_PUBLIC_ADSTERRA_NATIVE_ADS=5336445
NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID=5336445

.env.local:
NEXT_PUBLIC_ADSTERRA_NATIVE_ADS="5336445"
```

### **Component Updates**
1. **AdsterraAds Component** (`/src/components/AdsterraAds.tsx`)
   - ✅ Added automatic fallback to environment variable
   - ✅ Uses `process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ADS` as default

2. **Main Page** (`/src/app/page.tsx`)
   - ✅ Updated to use native ads type
   - ✅ Passes zone ID from environment variable
   - ✅ Component: `<AdsterraAds type="native" zoneId={process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_ADS} />`

3. **Layout** (`/src/app/layout.tsx`)
   - ✅ Adsterra script loaded conditionally
   - ✅ Uses environment variable for detection
   - ✅ Lazy loading strategy for performance

## 📊 Implementation Details

### **Ad Placement**
- **Location**: Homepage between featured articles and recent articles sections
- **Type**: Native ads (more integrated with content)
- **Zone ID**: 5336445
- **Loading**: Lazy loaded to optimize performance

### **Production Ready**
- ✅ **Environment**: Production mode active
- ✅ **Script Loading**: Conditional loading based on environment variable
- ✅ **Error Handling**: Component includes error states
- ✅ **Development Mode**: Shows placeholder in development

### **How It Works**
1. Environment variable `NEXT_PUBLIC_ADSTERRA_NATIVE_ADS=5336445` is loaded
2. AdsterraAds component receives the zone ID
3. In production, it loads the Adsterra script from `highperformancedformats.com`
4. Native ads are rendered in the designated container
5. Fallback handling for any loading errors

## 🎯 Next Steps

### **To Activate Ads**
1. **Verify Zone ID**: Ensure 5336445 is correct in your Adsterra dashboard
2. **Test Display**: Visit https://bali.report/ to see ads in production
3. **Monitor Performance**: Check ad impressions in Adsterra dashboard
4. **Optimize Placement**: Consider adding more ad slots if needed

### **Additional Ad Types Available**
- **Banner Ads**: Can use same zone ID with type="banner"
- **Social Bar**: type="social-bar" 
- **Popunder**: type="popunder" (use sparingly)

## 🔍 Verification

To verify the configuration is working:

```bash
# Check environment variables
grep ADSTERRA /home/deploy/bali-report/.env*

# Check component implementation
grep -A5 -B5 "ADSTERRA" /home/deploy/bali-report/src/app/page.tsx

# Test the website
curl -I https://bali.report/
```

**Status**: ✅ **READY FOR LIVE ADS** - Configuration complete and production server restarted with new settings.

---
*Configuration completed: October 8, 2025*
