#!/usr/bin/env node

/**
 * RSS Background Worker Script
 * Runs the RSS background job and can be executed by PM2 or cron
 */

const path = require('path');

// Add project root to require path
process.chdir(path.join(__dirname, '..'));

// Set up environment for Next.js
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import TypeScript modules after setting up environment
async function runWorker() {
  try {
    console.log(`[RSS Worker] Starting at ${new Date().toISOString()}`);
    console.log(`[RSS Worker] Node version: ${process.version}`);
    console.log(`[RSS Worker] Working directory: ${process.cwd()}`);
    
    // Dynamic import for ES modules
    const { rssBackgroundJob } = await import('../src/lib/rss-background-job.js');
    
    // Run the background job
    await rssBackgroundJob.runBackgroundJob();
    
    console.log(`[RSS Worker] Completed successfully at ${new Date().toISOString()}`);
    process.exit(0);
    
  } catch (error) {
    console.error(`[RSS Worker] Error:`, error);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGTERM', () => {
  console.log('[RSS Worker] Received SIGTERM, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[RSS Worker] Received SIGINT, shutting down...');
  process.exit(0);
});

// Run the worker
runWorker();
