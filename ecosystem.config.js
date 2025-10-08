module.exports = {
  apps: [
    {
      name: 'bali-report',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G', // Increased from 1G
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--max-old-space-size=2048', // Memory optimization
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      merge_logs: true,
    },
    {
      name: 'rss-refresh-cron',
      script: './scripts/refresh-rss.js',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 */2 * * *', // Every 2 hours
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'newsletter-daily-morning',
      script: './scripts/newsletter-automation.js',
      args: 'daily-morning',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 8 * * *', // Daily at 8:00 AM
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'newsletter-weekly-friday',
      script: './scripts/newsletter-automation.js',
      args: 'weekly-roundup',
      instances: 1,
      autorestart: false,
      watch: false,
      cron_restart: '0 17 * * 5', // Friday at 5:00 PM
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

// Add cache warming job
module.exports.apps.push({
  name: 'cache-warmer',
  script: './scripts/warm-cache.js',
  instances: 1,
  autorestart: false,
  watch: false,
  cron_restart: '*/30 * * * *', // Every 30 minutes
  env: {
    NODE_ENV: 'production',
  },
});
