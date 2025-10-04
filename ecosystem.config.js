module.exports = {
  apps: [
    {
      name: 'bali-report',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
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
