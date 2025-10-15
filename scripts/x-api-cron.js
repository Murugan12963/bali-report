#!/usr/bin/env node

/**
 * X API Social Insights Cron Job
 * Pulls social insights data hourly and warms up cache
 * Designed for PM2 with cron restart: "0 */1 * * *"
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration from environment variables
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN;

// Categories to refresh
const categories = ['BRICS', 'Indonesia', 'Bali'];

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'BaliReport-XCron/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 30000 // 30 second timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: json,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            error: 'Parse error'
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }

    req.end();
  });
}

// Pre-warm cache for all categories
async function preWarmCache() {
  console.log(`🚀 [${new Date().toISOString()}] Starting X API cache pre-warming...`);
  
  const results = [];
  
  for (const category of categories) {
    try {
      console.log(`📱 Fetching ${category} social insights...`);
      
      const url = `${BASE_URL}/api/x-news?category=${category}&limit=20&images=true&min_engagement=5`;
      const response = await makeRequest(url);
      
      if (response.status === 200) {
        const tweetsCount = response.data?.data?.tweets?.length || 0;
        const cached = response.data?.data?.metadata?.cached;
        const processingTime = response.data?.data?.metadata?.processing_time_ms;
        
        console.log(`✅ ${category}: ${tweetsCount} insights ${cached ? '(cached)' : '(fresh)'} - ${processingTime}ms`);
        
        results.push({
          category,
          success: true,
          tweets: tweetsCount,
          cached,
          processing_time: processingTime
        });
      } else {
        console.log(`⚠️  ${category}: HTTP ${response.status} - ${response.data?.message || 'Unknown error'}`);
        results.push({
          category,
          success: false,
          error: `HTTP ${response.status}`,
          message: response.data?.message
        });
      }
      
      // Delay between requests to avoid rate limiting
      if (categories.indexOf(category) < categories.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Error fetching ${category}:`, error.message);
      results.push({
        category,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary report
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const totalTweets = successful.reduce((sum, r) => sum + (r.tweets || 0), 0);
  
  console.log(`\n📊 Cache Pre-warming Summary:`);
  console.log(`   ✅ Successful: ${successful.length}/${results.length} categories`);
  console.log(`   📱 Total tweets cached: ${totalTweets}`);
  console.log(`   ⏱️  Average processing time: ${Math.round(successful.reduce((sum, r) => sum + (r.processing_time || 0), 0) / successful.length)}ms`);
  
  if (failed.length > 0) {
    console.log(`   ❌ Failed categories: ${failed.map(r => r.category).join(', ')}`);
  }
  
  return results;
}

// Get API usage statistics
async function getUsageStats() {
  if (!ADMIN_TOKEN) {
    console.log('⚠️  No admin token provided, skipping usage stats');
    return null;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/x-news`, {
      method: 'POST',
      body: {
        action: 'get_stats',
        auth_token: ADMIN_TOKEN
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const stats = response.data.data;
      console.log(`\n📈 X API Usage Stats:`);
      console.log(`   🔄 Requests made: ${stats.requests_made}`);
      console.log(`   ⏳ Requests remaining: ${stats.requests_remaining}`);
      console.log(`   💾 Cache entries: ${stats.cache_entries}`);
      console.log(`   🔄 Next reset: ${stats.next_reset}`);
      
      return stats;
    } else {
      console.log(`⚠️  Failed to get usage stats: ${response.data?.message}`);
    }
  } catch (error) {
    console.log(`⚠️  Error getting usage stats: ${error.message}`);
  }
  
  return null;
}

// Health check
async function healthCheck() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.status === 200) {
      console.log(`✅ Health check passed`);
      return true;
    } else {
      console.log(`⚠️  Health check failed: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log(`🌟 X API Cron Job started at ${new Date().toISOString()}`);
  console.log(`🔗 Target: ${BASE_URL}`);
  
  const startTime = Date.now();
  
  try {
    // Health check first
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      console.log('❌ Health check failed, aborting cron job');
      process.exit(1);
    }
    
    // Pre-warm cache
    const results = await preWarmCache();
    
    // Get usage statistics
    await getUsageStats();
    
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    
    console.log(`\n🎉 Cron job completed in ${duration}ms`);
    console.log(`📊 Success rate: ${successCount}/${results.length} categories`);
    
    // Exit with appropriate code
    if (successCount === results.length) {
      console.log('✅ All categories successful');
      process.exit(0);
    } else if (successCount > 0) {
      console.log('⚠️  Partial success');
      process.exit(0); // Still exit successfully for partial success
    } else {
      console.log('❌ All categories failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Cron job failed:', error);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Run the job
if (require.main === module) {
  main();
}