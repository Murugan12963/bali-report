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
  ],
};
