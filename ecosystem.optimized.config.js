module.exports = {
  apps: [{
    name: 'bali-report-optimized',
    script: 'npm',
    args: 'run dev',
    instances: 1, // Single instance for low memory
    autorestart: true,
    watch: false,
    max_memory_restart: '400M', // Restart if using more than 400MB
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      NODE_OPTIONS: '--max-old-space-size=512', // Limit memory usage
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.outerr.log',
    time: true,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Resource optimization
    node_args: [
      '--max-old-space-size=512',
      '--optimize-for-size',
    ]
  }]
};
