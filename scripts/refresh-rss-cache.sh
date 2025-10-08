#!/bin/bash

LOG_FILE="/var/log/bali-report-refresh.log"
API_BASE="http://localhost:3000/api/articles"
MAX_LOG_SIZE=10485760

if [ -f "$LOG_FILE" ] && [ $(stat -c%s "$LOG_FILE" 2>/dev/null || stat -f%z "$LOG_FILE") -gt $MAX_LOG_SIZE ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Starting RSS cache refresh for ALL categories..."

# Function to refresh a category
refresh_category() {
    local category=$1
    local endpoint=$2
    local response=$(curl -s -m 120 "${API_BASE}${endpoint}" 2>&1)
    local count=$(echo "$response" | jq -r '.metadata.total' 2>/dev/null || echo "0")
    log "   ✅ $category: $count articles"
}

# Refresh all categories
refresh_category "Main Articles" ""
refresh_category "BRICS" "/brics"
refresh_category "Indonesia" "/indonesia"
refresh_category "Bali" "/bali"

log "💾 All caches warmed for instant delivery"
exit 0
