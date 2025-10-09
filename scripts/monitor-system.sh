#!/bin/bash

# System Monitoring Script for Bali Report
# Monitors CPU, Memory, Disk, Network, and Application Performance

LOGFILE="/home/murugan/projects/bali-report/logs/system-monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEM=80
ALERT_THRESHOLD_DISK=80
WEBHOOK_URL=""  # Add your Slack/Discord webhook here

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOGFILE")"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGFILE"
}

# Function to send alert (if webhook configured)
send_alert() {
    local message="$1"
    local severity="$2"
    
    if [ ! -z "$WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Bali Report Alert [$severity]: $message\"}" \
            "$WEBHOOK_URL" > /dev/null 2>&1
    fi
    
    log "ALERT [$severity]: $message"
}

# Function to get system metrics
get_system_metrics() {
    echo -e "${BLUE}📊 System Performance Metrics${NC}"
    echo "----------------------------------------"
    
    # CPU Usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    echo -e "💻 CPU Usage: ${GREEN}${CPU_USAGE}%${NC}"
    
    # Memory Usage
    MEM_INFO=$(free | grep Mem)
    MEM_TOTAL=$(echo $MEM_INFO | awk '{print $2}')
    MEM_USED=$(echo $MEM_INFO | awk '{print $3}')
    MEM_USAGE=$(( MEM_USED * 100 / MEM_TOTAL ))
    echo -e "🧠 Memory Usage: ${GREEN}${MEM_USAGE}%${NC} ($(( MEM_USED / 1024 ))MB / $(( MEM_TOTAL / 1024 ))MB)"
    
    # Disk Usage
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    echo -e "💾 Disk Usage: ${GREEN}${DISK_USAGE}%${NC} ($(df -h / | awk 'NR==2 {print $3 " used of " $2}'))"
    
    # Load Average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
    echo -e "⚖️  Load Average:${GREEN}$LOAD_AVG${NC}"
    
    # Network connections
    CONNECTIONS=$(netstat -an | grep :3000 | grep ESTABLISHED | wc -l)
    echo -e "🌐 Active Connections: ${GREEN}${CONNECTIONS}${NC}"
    
    # Process memory for Node.js
    NODE_MEM=$(ps aux | grep -E 'node.*bali-report' | grep -v grep | awk '{sum += $6} END {print sum/1024}')
    if [ ! -z "$NODE_MEM" ]; then
        echo -e "🚀 Node.js Memory: ${GREEN}${NODE_MEM}MB${NC}"
    fi
    
    # Check alerts
    if (( $(echo "$CPU_USAGE > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        send_alert "High CPU usage: ${CPU_USAGE}%" "HIGH"
    fi
    
    if [ $MEM_USAGE -gt $ALERT_THRESHOLD_MEM ]; then
        send_alert "High memory usage: ${MEM_USAGE}%" "HIGH"
    fi
    
    if [ $DISK_USAGE -gt $ALERT_THRESHOLD_DISK ]; then
        send_alert "High disk usage: ${DISK_USAGE}%" "HIGH"
    fi
    
    echo "----------------------------------------"
}

# Function to check application health
check_app_health() {
    echo -e "${BLUE}🏥 Application Health Check${NC}"
    echo "----------------------------------------"
    
    # Check if PM2 is running
    PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[0].pm2_env.status' 2>/dev/null || echo "not_running")
    
    if [ "$PM2_STATUS" = "online" ]; then
        echo -e "✅ PM2 Status: ${GREEN}Online${NC}"
        
        # Get PM2 process info
        PM2_INFO=$(pm2 jlist | jq -r '.[] | "CPU: \(.monit.cpu)% | Memory: \(.monit.memory/1024/1024 | floor)MB"' 2>/dev/null)
        echo -e "📈 PM2 Processes:\n$PM2_INFO"
    else
        echo -e "❌ PM2 Status: ${RED}Offline${NC}"
        send_alert "PM2 is not running!" "CRITICAL"
    fi
    
    # Check application response
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "🌐 HTTP Health: ${GREEN}OK (200)${NC}"
        
        # Get response time
        RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3000/ || echo "timeout")
        echo -e "⚡ Response Time: ${GREEN}${RESPONSE_TIME}s${NC}"
        
        if (( $(echo "$RESPONSE_TIME > 2" | bc -l) )); then
            send_alert "Slow response time: ${RESPONSE_TIME}s" "MEDIUM"
        fi
    else
        echo -e "🌐 HTTP Health: ${RED}Failed ($HTTP_STATUS)${NC}"
        send_alert "Application not responding! HTTP: $HTTP_STATUS" "CRITICAL"
    fi
    
    echo "----------------------------------------"
}

# Function to check services
check_services() {
    echo -e "${BLUE}🔧 Service Status${NC}"
    echo "----------------------------------------"
    
    # Nginx status
    if systemctl is-active --quiet nginx; then
        echo -e "🌐 Nginx: ${GREEN}Running${NC}"
    else
        echo -e "🌐 Nginx: ${RED}Stopped${NC}"
        send_alert "Nginx service is down!" "CRITICAL"
    fi
    
    # Redis status (if running locally)
    if systemctl is-active --quiet redis > /dev/null 2>&1; then
        echo -e "📊 Redis: ${GREEN}Running${NC}"
    else
        echo -e "📊 Redis: ${YELLOW}Not running locally (using managed?)${NC}"
    fi
    
    # Check SSL certificate expiry
    if command -v openssl &> /dev/null; then
        SSL_EXPIRY=$(echo | openssl s_client -servername bali.report -connect bali.report:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
        if [ ! -z "$SSL_EXPIRY" ]; then
            SSL_DAYS=$(( ($(date -d "$SSL_EXPIRY" +%s) - $(date +%s)) / 86400 ))
            if [ $SSL_DAYS -gt 0 ]; then
                echo -e "🔒 SSL Certificate: ${GREEN}Valid (${SSL_DAYS} days remaining)${NC}"
                if [ $SSL_DAYS -lt 30 ]; then
                    send_alert "SSL certificate expires in $SSL_DAYS days!" "MEDIUM"
                fi
            else
                echo -e "🔒 SSL Certificate: ${RED}Expired${NC}"
                send_alert "SSL certificate has expired!" "CRITICAL"
            fi
        fi
    fi
    
    echo "----------------------------------------"
}

# Main monitoring function
main() {
    echo -e "${GREEN}🔍 Bali Report System Monitor$(NC)"
    echo -e "${GREEN}$(date)${NC}"
    echo "========================================"
    
    get_system_metrics
    echo
    check_app_health
    echo
    check_services
    
    echo -e "\n${GREEN}📝 Log saved to: $LOGFILE${NC}"
    echo "========================================"
}

# Run the monitoring
main

# Optional: Add to cron for regular monitoring
# Add this line to crontab (crontab -e):
# */5 * * * * /path/to/this/script.sh > /dev/null 2>&1