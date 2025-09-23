#!/bin/bash

# Bali Report Monitoring Script
# Checks application health and sends alerts if needed

# Configuration
APP_URL="https://bali.report"
SLACK_WEBHOOK=""  # Optional: Add Slack webhook for alerts
EMAIL=""  # Optional: Add email for alerts
LOG_FILE="/var/log/bali-monitor.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> $LOG_FILE
    echo -e "$1"
}

# Function to send alert (customize based on your needs)
send_alert() {
    local message=$1
    local severity=$2  # INFO, WARNING, ERROR
    
    log_message "${severity}: ${message}"
    
    # Send to Slack if configured
    if [ ! -z "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\":warning: Bali Report Alert (${severity}): ${message}\"}" \
            $SLACK_WEBHOOK 2>/dev/null
    fi
    
    # Send email if configured
    if [ ! -z "$EMAIL" ]; then
        echo "$message" | mail -s "Bali Report Alert: $severity" $EMAIL
    fi
}

echo "======================================"
echo "Bali Report Health Check"
echo "Time: $(date)"
echo "======================================"

# 1. Check if website is accessible
echo -n "Checking website availability... "
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 $APP_URL)
if [ $HTTP_STATUS -eq 200 ] || [ $HTTP_STATUS -eq 301 ] || [ $HTTP_STATUS -eq 302 ]; then
    echo -e "${GREEN}✓ OK${NC} (HTTP $HTTP_STATUS)"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_STATUS)"
    send_alert "Website is not accessible! HTTP Status: $HTTP_STATUS" "ERROR"
fi

# 2. Check response time
echo -n "Checking response time... "
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" -m 10 $APP_URL)
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)
if [ $RESPONSE_MS -lt 3000 ]; then
    echo -e "${GREEN}✓ OK${NC} (${RESPONSE_MS}ms)"
elif [ $RESPONSE_MS -lt 5000 ]; then
    echo -e "${YELLOW}⚠ SLOW${NC} (${RESPONSE_MS}ms)"
    send_alert "Website response time is slow: ${RESPONSE_MS}ms" "WARNING"
else
    echo -e "${RED}✗ VERY SLOW${NC} (${RESPONSE_MS}ms)"
    send_alert "Website response time is very slow: ${RESPONSE_MS}ms" "ERROR"
fi

# 3. Check PM2 process
echo -n "Checking PM2 process... "
PM2_STATUS=$(pm2 list | grep "bali-report" | grep "online")
if [ ! -z "$PM2_STATUS" ]; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    send_alert "PM2 process 'bali-report' is not running!" "ERROR"
    
    # Try to restart
    echo "Attempting to restart..."
    pm2 restart bali-report
    sleep 5
    PM2_STATUS=$(pm2 list | grep "bali-report" | grep "online")
    if [ ! -z "$PM2_STATUS" ]; then
        echo -e "${GREEN}✓ RESTARTED SUCCESSFULLY${NC}"
        send_alert "PM2 process 'bali-report' was restarted successfully" "INFO"
    else
        echo -e "${RED}✗ RESTART FAILED${NC}"
        send_alert "Failed to restart PM2 process 'bali-report'" "ERROR"
    fi
fi

# 4. Check Nginx
echo -n "Checking Nginx... "
NGINX_STATUS=$(systemctl is-active nginx)
if [ "$NGINX_STATUS" = "active" ]; then
    echo -e "${GREEN}✓ ACTIVE${NC}"
else
    echo -e "${RED}✗ INACTIVE${NC}"
    send_alert "Nginx is not running!" "ERROR"
fi

# 5. Check disk space
echo -n "Checking disk space... "
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓ OK${NC} (${DISK_USAGE}% used)"
elif [ $DISK_USAGE -lt 90 ]; then
    echo -e "${YELLOW}⚠ WARNING${NC} (${DISK_USAGE}% used)"
    send_alert "Disk space is running low: ${DISK_USAGE}% used" "WARNING"
else
    echo -e "${RED}✗ CRITICAL${NC} (${DISK_USAGE}% used)"
    send_alert "Disk space is critically low: ${DISK_USAGE}% used" "ERROR"
fi

# 6. Check memory usage
echo -n "Checking memory usage... "
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $MEMORY_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓ OK${NC} (${MEMORY_USAGE}% used)"
elif [ $MEMORY_USAGE -lt 90 ]; then
    echo -e "${YELLOW}⚠ WARNING${NC} (${MEMORY_USAGE}% used)"
    send_alert "Memory usage is high: ${MEMORY_USAGE}%" "WARNING"
else
    echo -e "${RED}✗ CRITICAL${NC} (${MEMORY_USAGE}% used)"
    send_alert "Memory usage is critical: ${MEMORY_USAGE}%" "ERROR"
fi

# 7. Check CPU load
echo -n "Checking CPU load... "
CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
CPU_CORES=$(nproc)
CPU_THRESHOLD=$(echo "$CPU_CORES * 2" | bc)
if (( $(echo "$CPU_LOAD < $CPU_THRESHOLD" | bc -l) )); then
    echo -e "${GREEN}✓ OK${NC} (load: $CPU_LOAD)"
else
    echo -e "${YELLOW}⚠ HIGH${NC} (load: $CPU_LOAD)"
    send_alert "CPU load is high: $CPU_LOAD (threshold: $CPU_THRESHOLD)" "WARNING"
fi

# 8. Check SSL certificate expiry
echo -n "Checking SSL certificate... "
SSL_EXPIRY=$(echo | openssl s_client -servername bali.report -connect bali.report:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ ! -z "$SSL_EXPIRY" ]; then
    EXPIRY_EPOCH=$(date -d "$SSL_EXPIRY" +%s)
    CURRENT_EPOCH=$(date +%s)
    DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
    
    if [ $DAYS_LEFT -gt 30 ]; then
        echo -e "${GREEN}✓ OK${NC} (expires in $DAYS_LEFT days)"
    elif [ $DAYS_LEFT -gt 7 ]; then
        echo -e "${YELLOW}⚠ WARNING${NC} (expires in $DAYS_LEFT days)"
        send_alert "SSL certificate expires in $DAYS_LEFT days" "WARNING"
    else
        echo -e "${RED}✗ CRITICAL${NC} (expires in $DAYS_LEFT days)"
        send_alert "SSL certificate expires in $DAYS_LEFT days!" "ERROR"
    fi
else
    echo -e "${RED}✗ FAILED${NC} (Could not check)"
fi

# 9. Check RSS feeds (application specific)
echo -n "Checking RSS feed endpoints... "
RSS_CHECK=$(curl -s -m 5 "$APP_URL/api/rss" | grep -c "article")
if [ $RSS_CHECK -gt 0 ]; then
    echo -e "${GREEN}✓ OK${NC} ($RSS_CHECK articles found)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (No articles found)"
    send_alert "RSS feed check returned no articles" "WARNING"
fi

echo "======================================"
echo "Health check completed"
echo "======================================" 