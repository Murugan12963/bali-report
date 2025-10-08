#!/bin/bash

# Setup cron job for RSS background worker
# This serves as a fallback if PM2 cron doesn't work

CRON_JOB="*/20 * * * * cd /home/deploy/bali-report && /usr/bin/node scripts/rss-background-worker.js >> /var/log/rss-worker-cron.log 2>&1"

# Check if cron job already exists
if ! crontab -l 2>/dev/null | grep -q "rss-background-worker.js"; then
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ RSS background worker cron job added"
    echo "📅 Will run every 20 minutes"
else
    echo "ℹ️ RSS background worker cron job already exists"
fi

# Show current crontab
echo "📋 Current cron jobs:"
crontab -l 2>/dev/null | grep -E "(rss|RSS)" || echo "No RSS-related cron jobs found"
