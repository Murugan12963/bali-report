# 🤖 x.ai (Grok) API Setup Guide

## Quick Setup (3 minutes)

### Step 1: Get Your API Key

1. **Visit x.ai**: Go to https://x.ai
2. **Sign In**: Use your X (Twitter) account or create a new account
3. **Navigate to API**:
   - Click on your profile icon
   - Select "API Keys" or "Developer Settings"
4. **Create API Key**:
   - Click "Create New API Key"
   - Give it a name (e.g., "Bali Report")
   - Copy the key (starts with `xai-...`)
   - **IMPORTANT**: Save this key immediately - you won't see it again!

### Step 2: Add to Your Project

1. **Open the file** `/home/murugan/projects/bali-report/.env.local`
2. **Replace** `your-xai-api-key-here` with your actual API key:
   ```
   XAI_API_KEY=xai-YOUR-ACTUAL-KEY-HERE
   ```

### Step 3: Verify Setup

Run the test command:
```bash
cd /home/murugan/projects/bali-report
npx tsx src/lib/test-xai.ts
```

If successful, you'll see:
```
✅ API key format looks valid
✅ Content analysis successful!
✅ Search enhancement successful!
✅ Summary generation successful!
🎉 x.ai integration is working correctly!
```

### Step 4: Restart Development Server

Stop the current server (Ctrl+C) and restart:
```bash
npm run dev
```

## 🎯 What This Enables

Once configured, your Bali Report site will have:

### 1. **AI-Powered Content Analysis**
- Articles are analyzed for relevance to BRICS, Indonesia, and Bali
- Sentiment analysis from a multipolar perspective
- Topic extraction and categorization
- Key insights identification

### 2. **Smart Personalization**
- AI-enhanced article recommendations
- User preference learning
- Context-aware content ranking
- Geographic relevance scoring

### 3. **Semantic Search**
- Query expansion with related terms
- BRICS-aware keyword suggestions
- Contextual understanding of search intent
- Alternative terminology recognition

### 4. **Intelligent Summaries**
- Concise article summaries
- Key fact extraction
- Multipolar perspective focus
- Geopolitical context awareness

## 💰 Pricing & Limits

x.ai API pricing (as of 2025):
- **Free Tier**: Limited requests per month
- **Pay-as-you-go**: $X per 1M tokens
- **Monthly Plans**: Starting at $XX/month

The Bali Report implementation is optimized for cost:
- Only analyzes high-relevance articles
- Caches AI responses
- Graceful fallback when limits reached
- Smart batching of requests

## 🔧 Troubleshooting

### "API key not configured"
- Make sure you've added the key to `.env.local`
- Verify the key starts with `xai-`
- Check for typos or extra spaces

### "API request failed"
- Verify your API key is active at https://x.ai
- Check your API usage/limits
- Ensure you have internet connectivity

### "Features not appearing"
- Restart the development server after adding the key
- Clear Next.js cache: `rm -rf .next/cache`
- Check browser console for errors

## 📊 Performance Impact

With x.ai enabled:
- Initial page load: +0-200ms (cached after first load)
- Article analysis: ~500ms per article (background process)
- Search enhancement: ~200ms
- No impact if API is unavailable (graceful fallback)

## 🚀 Advanced Features

### Custom Analysis Parameters

Edit `/src/lib/x-ai-service.ts` to adjust:
```typescript
temperature: 0.3, // Lower = more consistent, Higher = more creative
max_tokens: 1000, // Response length limit
```

### Selective Enhancement

Control which content gets AI analysis:
```typescript
// Only featured articles
const featured = await getFeaturedArticles(articles, 2, true); // AI enabled

// Regular articles without AI
const regular = await personalizeContent(articles, prefs, false); // AI disabled
```

### Cost Optimization

Limit AI usage to specific categories:
```typescript
// Only use AI for BRICS content
const useAI = article.category === 'BRICS';
const analysis = useAI ? await xAIService.analyzeContent(article) : null;
```

## 🔐 Security Notes

- **Never commit** your API key to git
- `.env.local` is automatically gitignored
- For production, use environment variables in your hosting platform
- Rotate keys periodically for security

## 📚 Resources

- [x.ai Documentation](https://docs.x.ai)
- [API Reference](https://docs.x.ai/api)
- [Pricing Details](https://x.ai/pricing)
- [Support](https://x.ai/support)

---

## Need Help?

If you encounter issues:
1. Run the test script: `npx tsx src/lib/test-xai.ts`
2. Check the console output for specific errors
3. Verify your API key at https://x.ai
4. Ensure you have available API credits