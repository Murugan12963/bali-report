#!/usr/bin/env node

/**
 * Newsletter Automation Cron Script
 * 
 * This script runs automated newsletter generation and sending.
 * It's designed to be called by PM2 cron or system cron jobs.
 * 
 * Usage:
 *   node scripts/newsletter-automation.js [type] [scheduleId] [preview]
 * 
 * Examples:
 *   node scripts/newsletter-automation.js                    # Run all scheduled newsletters
 *   node scripts/newsletter-automation.js daily             # Run all daily newsletters
 *   node scripts/newsletter-automation.js daily-morning     # Run specific schedule
 *   node scripts/newsletter-automation.js daily true        # Preview daily newsletters
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const AUTOMATION_TOKEN = process.env.NEWSLETTER_AUTOMATION_TOKEN;
const TIMEOUT_MS = 120000; // 2 minutes timeout

// Parse command line arguments
const args = process.argv.slice(2);
const [type, scheduleIdOrPreview, preview] = args;

// Determine request parameters
let requestBody = {};
if (type && type !== 'true' && type !== 'false') {
  if (type.includes('-')) {
    // It's a specific schedule ID
    requestBody.scheduleId = type;
  } else {
    // It's a newsletter type
    requestBody.type = type;
  }
}

// Check for preview mode
if (scheduleIdOrPreview === 'true' || preview === 'true') {
  requestBody.preview = true;
}

/**
 * Make HTTP request to newsletter automation API.
 * 
 * @param {Object} body - Request body
 * @returns {Promise<Object>} - API response
 */
async function callNewsletterAPI(body) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/newsletter/run', BASE_URL);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const postData = JSON.stringify(body);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${AUTOMATION_TOKEN}`,
        'User-Agent': 'Bali-Report-Newsletter-Automation/1.0'
      },
      timeout: TIMEOUT_MS
    };

    const req = httpModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Log message with timestamp and emoji.
 */
function log(message, emoji = '📧') {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${emoji} ${message}`);
}

/**
 * Main automation function.
 */
async function runNewsletterAutomation() {
  try {
    // Validate configuration
    if (!AUTOMATION_TOKEN) {
      log('❌ NEWSLETTER_AUTOMATION_TOKEN not configured', '🚨');
      process.exit(1);
    }

    log(`Starting newsletter automation`, '🤖');
    log(`Base URL: ${BASE_URL}`);
    log(`Request body: ${JSON.stringify(requestBody)}`);

    // Call newsletter API
    const response = await callNewsletterAPI(requestBody);
    
    // Log response
    log(`API Response (${response.statusCode}):`, '📊');
    console.log(JSON.stringify(response.body, null, 2));

    // Handle response
    if (response.statusCode === 200 && response.body.success) {
      const { schedulesRun, successfulRuns, results, preview } = response.body;
      
      if (preview) {
        log(`✅ Generated ${successfulRuns} newsletter previews`, '🔍');
      } else {
        log(`✅ Successfully sent ${successfulRuns}/${schedulesRun} newsletters`, '🚀');
        
        // Log details about each newsletter sent
        results.forEach(result => {
          if (result.success) {
            log(`  📬 ${result.scheduleName}: ${result.articlesCount} articles (Campaign: ${result.campaignId || 'N/A'})`);
          } else {
            log(`  ❌ ${result.scheduleName}: Failed - ${result.error}`, '🚨');
          }
        });
      }
      
      process.exit(0);
    } else {
      log(`❌ Newsletter automation failed: ${response.body.message}`, '🚨');
      if (response.body.error) {
        log(`Error details: ${response.body.error}`);
      }
      process.exit(1);
    }

  } catch (error) {
    log(`💥 Critical error: ${error.message}`, '🚨');
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Handle process signals for graceful shutdown.
 */
process.on('SIGINT', () => {
  log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`💥 Unhandled rejection at Promise: ${promise}, reason: ${reason}`, '🚨');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, '🚨');
  console.error(error.stack);
  process.exit(1);
});

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Newsletter Automation Cron Script

Usage:
  node scripts/newsletter-automation.js [type|scheduleId] [preview]

Examples:
  node scripts/newsletter-automation.js                    # Run scheduled newsletters
  node scripts/newsletter-automation.js daily             # Run daily newsletters
  node scripts/newsletter-automation.js weekly            # Run weekly newsletters
  node scripts/newsletter-automation.js daily-morning     # Run specific schedule
  node scripts/newsletter-automation.js daily true        # Preview daily newsletters

Environment Variables:
  BASE_URL                      - API base URL (default: http://localhost:3000)
  NEWSLETTER_AUTOMATION_TOKEN   - Authentication token (required)

Exit Codes:
  0 - Success
  1 - Error or failure
`);
  process.exit(0);
}

// Run the automation
log('🚀 Newsletter automation script starting...');
runNewsletterAutomation();