#!/usr/bin/env node

/**
 * Simple RSS Cache Population Script
 * Uses curl to trigger RSS refresh via the API
 */

const http = require('http');

console.log(`[RSS Cache] Starting population at ${new Date().toISOString()}`);

// Trigger RSS refresh via API
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/feeds',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minute timeout
};

const data = JSON.stringify({ action: 'refresh' });

const req = http.request(options, (res) => {
  let response = '';

  res.on('data', (chunk) => {
    response += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`[RSS Cache] ✅ RSS refresh started successfully`);
      console.log(`[RSS Cache] Response: ${response}`);
      
      // Wait a bit then check status
      setTimeout(() => {
        checkStatus();
      }, 30000);
    } else {
      console.error(`[RSS Cache] ❌ Failed with status ${res.statusCode}`);
      console.error(`[RSS Cache] Response: ${response}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`[RSS Cache] ❌ Request error:`, error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error(`[RSS Cache] ❌ Request timeout`);
  req.destroy();
  process.exit(1);
});

req.write(data);
req.end();

function checkStatus() {
  const statusOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/feeds?action=status',
    method: 'GET',
    timeout: 10000,
  };

  const statusReq = http.request(statusOptions, (res) => {
    let response = '';

    res.on('data', (chunk) => {
      response += chunk;
    });

    res.on('end', () => {
      try {
        const status = JSON.parse(response);
        const cache = status.data?.cache;
        const backgroundJob = status.data?.backgroundJob;
        
        console.log(`[RSS Cache] Cache status:`);
        console.log(`  - Cached sources: ${cache?.cachedSources || 0}`);
        console.log(`  - Cache size: ${cache?.cacheSize || 0} bytes`);
        console.log(`  - Last update: ${cache?.lastUpdate ? new Date(cache.lastUpdate).toISOString() : 'never'}`);
        console.log(`  - Background job running: ${backgroundJob?.isRunning || false}`);
        console.log(`  - Articles fetched: ${backgroundJob?.totalArticlesFetched || 0}`);
        
        if (cache?.cachedSources > 0) {
          console.log(`[RSS Cache] ✅ Cache population successful!`);
          process.exit(0);
        } else if (backgroundJob?.isRunning) {
          console.log(`[RSS Cache] 🔄 Background job still running, check again later`);
          process.exit(0);
        } else {
          console.log(`[RSS Cache] ⚠️ No cached sources found`);
          process.exit(1);
        }
        
      } catch (error) {
        console.error(`[RSS Cache] ❌ Error parsing status:`, error.message);
        process.exit(1);
      }
    });
  });

  statusReq.on('error', (error) => {
    console.error(`[RSS Cache] ❌ Status check error:`, error.message);
    process.exit(1);
  });

  statusReq.end();
}
