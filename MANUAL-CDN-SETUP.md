# 🌐 Manual CDN Setup Guide for Bali Report

Since the `doctl` CLI doesn't support Spaces commands, we'll set up the CDN manually through the Digital Ocean web interface.

## 🎯 **Step 1: Create Digital Ocean Spaces Bucket**

### **Via Web Interface:**
1. **Go to**: https://cloud.digitalocean.com/spaces
2. **Click**: "Create a Space"
3. **Configure**:
   - **Name**: `bali-report-assets`
   - **Region**: `Singapore (sgp1)` (same as your droplet)
   - **CDN**: ✅ **Enable CDN** (important!)
   - **File Listing**: Make it **Private**
   - **CORS**: We'll configure this later

4. **Click**: "Create a Space"

## 🔑 **Step 2: Generate API Keys**

1. **In the Spaces dashboard**, click **"Settings"**
2. **Scroll to**: "Spaces access keys"
3. **Click**: "Generate new key"
4. **Name**: `bali-report-cdn-key`
5. **Save both keys** (Access Key & Secret Key)

## ⚙️ **Step 3: Configure CORS (Cross-Origin Resource Sharing)**

1. **In your Space settings**, find "CORS"
2. **Add this configuration**:
```json
[
  {
    "AllowedOrigins": ["https://bali.report", "http://localhost:3000", "*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 86400
  }
]
```

## 📤 **Step 4: Upload Static Assets**

### **Manual Upload (via web interface):**
1. **Create these folders** in your Space:
   - `public/`
   - `_next/static/`

2. **Upload files**:
   - From your local `public/` folder → Space `public/` folder
   - Icons, images, robots.txt, etc.

### **Automatic Upload (recommended):**

We'll create a script to sync your assets automatically.

## 🛠️ **Step 5: Configure Application for CDN**

Once you have your CDN URL (it will look like `https://bali-report-assets.sgp1.cdn.digitaloceanspaces.com`), we'll update your application.

## 💡 **Alternative: Use Basic Static File Optimization**

If Spaces setup is complex, we can optimize your static file delivery using Nginx directly. This gives you many of the same benefits:

### **Nginx Static File Optimization:**
```nginx
# Add this to your nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_types
        text/css
        application/javascript
        text/javascript
        image/svg+xml;
    
    # Optional: serve from local cache
    try_files $uri =404;
}
```

This will:
- ✅ Cache static files for 1 year
- ✅ Enable compression
- ✅ Add proper headers
- ✅ Serve files directly from your droplet (fast since it's local)

Would you like to:
1. **Continue with Spaces setup** (manual through web interface)
2. **Use Nginx optimization** (simpler, still very effective)
3. **Try both approaches**

Let me know which approach you prefer!