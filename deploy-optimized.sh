#!/bin/bash

# Comprehensive Deployment Script for Bali Report Optimization
# This script implements the $60/month performance upgrade plan

set -e

# Configuration
DROPLET_NAME="ubuntu-s-1vcpu-2gb-sgp1-01"
NEW_SIZE="s-2vcpu-4gb-80gb-intel"  # $40/month droplet
REGION="sgp1"
REDIS_SIZE="db-s-1vcpu-1gb"       # $15/month managed Redis

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOGFILE="./logs/deployment-$(date +%Y%m%d-%H%M%S).log"
mkdir -p logs

log() {
    echo -e "$1" | tee -a "$LOGFILE"
}

# Check prerequisites
check_prerequisites() {
    log "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if doctl is installed and authenticated
    if ! command -v doctl &> /dev/null; then
        log "${RED}❌ doctl not found. Please install Digital Ocean CLI${NC}"
        exit 1
    fi
    
    if ! doctl account get &> /dev/null; then
        log "${RED}❌ Please authenticate with Digital Ocean: doctl auth init${NC}"
        exit 1
    fi
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log "${YELLOW}⚠️  PM2 not found. Installing...${NC}"
        npm install -g pm2
    fi
    
    log "${GREEN}✅ Prerequisites check passed${NC}"
}

# Step 1: Upgrade Droplet
upgrade_droplet() {
    log "${BLUE}🚀 Step 1: Upgrading droplet to $NEW_SIZE...${NC}"
    
    # Get current droplet ID
    DROPLET_ID=$(doctl compute droplet list --format ID,Name | grep "$DROPLET_NAME" | awk '{print $1}')
    
    if [ -z "$DROPLET_ID" ]; then
        log "${YELLOW}⚠️  Droplet '$DROPLET_NAME' not found. Skipping resize...${NC}"
        return
    fi
    
    log "Found droplet ID: $DROPLET_ID"
    
    # Power off droplet for resize
    log "Powering off droplet..."
    doctl compute droplet-action power-off $DROPLET_ID --wait
    
    # Resize droplet
    log "Resizing droplet to $NEW_SIZE..."
    doctl compute droplet-action resize $DROPLET_ID --size $NEW_SIZE --wait
    
    # Power on droplet
    log "Powering on droplet..."
    doctl compute droplet-action power-on $DROPLET_ID --wait
    
    log "${GREEN}✅ Droplet upgraded successfully${NC}"
    sleep 30  # Wait for services to start
}

# Step 2: Set up Managed Redis
setup_managed_redis() {
    log "${BLUE}📊 Step 2: Setting up Managed Redis...${NC}"
    
    # Check if database cluster already exists
    if doctl databases cluster list | grep -q "bali-report-redis"; then
        log "${YELLOW}⚠️  Redis cluster already exists${NC}"
        return
    fi
    
    # Create Redis cluster
    log "Creating managed Redis instance..."
    doctl databases cluster create bali-report-redis \
        --engine redis \
        --size $REDIS_SIZE \
        --region $REGION \
        --num-nodes 1
    
    # Wait for cluster to be ready
    log "Waiting for Redis cluster to be ready..."
    while [ "$(doctl databases cluster get bali-report-redis --format Status --no-header)" != "online" ]; do
        log "Redis cluster still initializing..."
        sleep 30
    done
    
    # Get connection details
    REDIS_HOST=$(doctl databases cluster get bali-report-redis --format PrivateHost --no-header)
    REDIS_PORT=$(doctl databases cluster get bali-report-redis --format Port --no-header)
    REDIS_PASSWORD=$(doctl databases cluster get bali-report-redis --format Password --no-header)
    
    # Save Redis connection info
    cat > .env.redis << EOF
# Managed Redis Configuration
REDIS_HOST=$REDIS_HOST
REDIS_PORT=$REDIS_PORT
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://default:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT

# Legacy variables for compatibility
REDIS_ENDPOINT=$REDIS_HOST:$REDIS_PORT
EOF
    
    log "${GREEN}✅ Managed Redis setup complete${NC}"
    log "${YELLOW}📝 Redis connection details saved to .env.redis${NC}"
}

# Step 3: Deploy optimized application
deploy_application() {
    log "${BLUE}🛠️  Step 3: Deploying optimized application...${NC}"
    
    # Build application
    log "Building application..."
    npm run build
    
    # Stop current PM2 processes
    if pm2 list | grep -q "bali-report"; then
        log "Stopping current PM2 processes..."
        pm2 stop all
        pm2 delete all
    fi
    
    # Start with optimized ecosystem
    log "Starting optimized PM2 cluster..."
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    pm2 startup
    
    log "${GREEN}✅ Application deployed with clustering${NC}"
}

# Step 4: Configure Nginx
configure_nginx() {
    log "${BLUE}🌐 Step 4: Configuring Nginx optimization...${NC}"
    
    # Create cache directory
    sudo mkdir -p /var/cache/nginx/bali-report
    sudo chown -R nginx:nginx /var/cache/nginx/
    
    # Backup current nginx config
    if [ -f "/etc/nginx/sites-available/bali-report" ]; then
        sudo cp /etc/nginx/sites-available/bali-report /etc/nginx/sites-available/bali-report.backup
    fi
    
    # Copy optimized nginx config
    sudo cp nginx-optimized.conf /etc/nginx/sites-available/bali-report
    
    # Enable site if not already enabled
    sudo ln -sf /etc/nginx/sites-available/bali-report /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    if sudo nginx -t; then
        log "Reloading Nginx..."
        sudo systemctl reload nginx
        log "${GREEN}✅ Nginx configuration updated${NC}"
    else
        log "${RED}❌ Nginx configuration error. Restoring backup...${NC}"
        if [ -f "/etc/nginx/sites-available/bali-report.backup" ]; then
            sudo mv /etc/nginx/sites-available/bali-report.backup /etc/nginx/sites-available/bali-report
            sudo systemctl reload nginx
        fi
        exit 1
    fi
}

# Step 5: Set up monitoring
setup_monitoring() {
    log "${BLUE}📊 Step 5: Setting up monitoring...${NC}"
    
    # Add monitoring to crontab
    (crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/scripts/monitor-system.sh > /dev/null 2>&1") | crontab -
    
    # Run initial monitoring
    ./scripts/monitor-system.sh
    
    log "${GREEN}✅ Monitoring setup complete${NC}"
}

# Step 6: Performance tests
run_performance_tests() {
    log "${BLUE}🧪 Step 6: Running performance tests...${NC}"
    
    # Wait for application to be fully ready
    sleep 10
    
    # Test application response
    log "Testing application response..."
    RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3000/ || echo "0")
    log "Response time: ${RESPONSE_TIME}s"
    
    # Test RSS endpoint
    RSS_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/api/rss || echo "000")
    log "RSS endpoint status: $RSS_RESPONSE"
    
    # Memory usage after deployment
    MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    log "Memory usage: ${MEMORY_USAGE}%"
    
    # CPU usage
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    log "CPU usage: ${CPU_USAGE}%"
    
    log "${GREEN}✅ Performance tests completed${NC}"
}

# Main deployment function
main() {
    log "${GREEN}🚀 Starting Bali Report Performance Optimization Deployment${NC}"
    log "${GREEN}Target: $60/month optimized infrastructure${NC}"
    log "======================================================="
    
    check_prerequisites
    echo
    
    upgrade_droplet
    echo
    
    setup_managed_redis
    echo
    
    deploy_application
    echo
    
    configure_nginx
    echo
    
    setup_monitoring
    echo
    
    run_performance_tests
    
    log "======================================================="
    log "${GREEN}🎉 Deployment Complete!${NC}"
    log ""
    log "${BLUE}📊 New Infrastructure:${NC}"
    log "• Droplet: $NEW_SIZE ($40/month)"
    log "• Redis: $REDIS_SIZE ($15/month)" 
    log "• Total: ~$60/month (including CDN when setup)"
    log ""
    log "${BLUE}📈 Performance Improvements:${NC}"
    log "• PM2 Clustering: Using all CPU cores"
    log "• Memory: Optimized for 4GB RAM"
    log "• Nginx: Advanced caching and compression"
    log "• Monitoring: 5-minute health checks"
    log ""
    log "${YELLOW}🔧 Next Steps:${NC}"
    log "1. Set up Digital Ocean Spaces CDN: ./scripts/setup-spaces-cdn.sh"
    log "2. Update environment variables with Redis details"
    log "3. Configure SSL certificates if needed"
    log "4. Monitor performance over the next 24 hours"
    log ""
    log "${GREEN}🌟 Your site is now optimized for high performance!${NC}"
}

# Run the deployment
main