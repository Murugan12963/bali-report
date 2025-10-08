module.exports = {
  apps: [
    {
      name: 'rss-background-worker',
      script: './scripts/rss-background-worker.js',
      cwd: '/home/deploy/bali-report',
      instances: 1,
      exec_mode: 'cluster',
      
      // Run every 20 minutes
      cron_restart: '*/20 * * * *',
      
      // Auto restart settings
      autorestart: false, // Don't auto-restart since this is a scheduled job
      max_restarts: 3,
      restart_delay: 5000,
      
      // Memory and resource limits
      max_memory_restart: '200M',
      
      // Logging
      log_file: '/var/log/pm2/rss-worker-combined.log',
      out_file: '/var/log/pm2/rss-worker-out.log',
      error_file: '/var/log/pm2/rss-worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        RSS_WORKER: 'true',
      },
      
      // Process management
      kill_timeout: 30000,
      listen_timeout: 10000,
      
      // Node.js options for low memory usage
      node_args: [
        '--max-old-space-size=256',
        '--optimize-for-size'
      ],
    }
  ]
};
