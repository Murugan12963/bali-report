#!/usr/bin/env node

/**
 * RSS Feed Refresh Cron Job
 *
 * This script runs every 2 hours via PM2 to refresh RSS feeds
 * and update the cache. It ensures fresh content without user requests.
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_ENDPOINT = '/api/feeds/aggregate';

console.log(`[RSS CRON] Starting RSS refresh at ${new Date().toISOString()}`);

// Make HTTP request to trigger RSS aggregation
const options = {
  hostname: new URL(BASE_URL).hostname,
  port: new URL(BASE_URL).port || 3000,
  path: API_ENDPOINT,
  method: 'GET',
  timeout: 60000, // 60 second timeout
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log(`[RSS CRON] ✅ Successfully refreshed RSS feeds`);
      try {
        const result = JSON.parse(data);
        console.log(`[RSS CRON] Articles fetched: ${result.totalArticles || 'unknown'}`);
      } catch (e) {
        console.log(`[RSS CRON] Response: ${data.substring(0, 200)}`);
      }
      process.exit(0);
    } else {
      console.error(`[RSS CRON] ❌ Failed with status ${res.statusCode}`);
      console.error(`[RSS CRON] Response: ${data}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`[RSS CRON] ❌ Request failed:`, error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error(`[RSS CRON] ❌ Request timeout after 60 seconds`);
  req.destroy();
  process.exit(1);
});

req.end();
