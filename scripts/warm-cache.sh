#!/bin/bash
# Cache Warmer - Keeps Nginx cache fresh so visitors never wait

LOG_FILE="/var/log/bali-report-cache-warmer.log"
SITE_URL="https://bali.report"

echo "[$(date)] Starting cache warmer..." >> "$LOG_FILE"

# Warm the homepage cache
curl -s -o /dev/null -w "Cache warm: %{http_code} in %{time_total}s\n" "$SITE_URL" >> "$LOG_FILE" 2>&1

# You can add more URLs to warm here:
# curl -s -o /dev/null "$SITE_URL/brics" >> "$LOG_FILE" 2>&1
# curl -s -o /dev/null "$SITE_URL/indonesia" >> "$LOG_FILE" 2>&1
# curl -s -o /dev/null "$SITE_URL/bali" >> "$LOG_FILE" 2>&1

echo "[$(date)] Cache warmer completed" >> "$LOG_FILE"
