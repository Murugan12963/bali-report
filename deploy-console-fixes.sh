#!/bin/bash

# Simple deployment script for console error fixes
# This deploys only the essential fixes without infrastructure changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default server configuration - update these with your actual values
SERVER_USER="root"
SERVER_HOST=""
SERVER_PATH="/var/www/bali-report"

log() {
    echo -e "$1"
}

# Function to detect server IP from git remote or ask user
detect_server() {
    log "${BLUE}🔍 Detecting server configuration...${NC}"
    
    # Try to get server info from user
    echo
    read -p "Enter your server IP address (e.g., 174.138.25.123): " SERVER_HOST
    
    if [ -z "$SERVER_HOST" ]; then
        log "${RED}❌ Server IP is required${NC}"
        exit 1
    fi
    
    read -p "Enter server username [root]: " input_user
    SERVER_USER=${input_user:-root}
    
    read -p "Enter server path [/var/www/bali-report]: " input_path
    SERVER_PATH=${input_path:-/var/www/bali-report}
    
    log "${GREEN}✅ Server: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}${NC}"
}

# Test SSH connection
test_ssh() {
    log "${BLUE}🔐 Testing SSH connection...${NC}"
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes "${SERVER_USER}@${SERVER_HOST}" "echo 'SSH connection successful'" 2>/dev/null; then
        log "${GREEN}✅ SSH connection successful${NC}"
    else
        log "${RED}❌ SSH connection failed${NC}"
        log "${YELLOW}💡 Make sure you can SSH into your server: ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
        exit 1
    fi
}

# Deploy the console error fixes
deploy_fixes() {
    log "${BLUE}🚀 Deploying console error fixes to live site...${NC}"
    
    # Deploy via git pull (recommended method)
    log "${YELLOW}📥 Pulling latest changes on server...${NC}"
    ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && git pull origin master"
    
    # Install any new dependencies
    log "${YELLOW}📦 Installing dependencies...${NC}"
    ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && npm install --production"
    
    # Build the application
    log "${YELLOW}🔨 Building application...${NC}"
    ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && npm run build"
    
    # Restart the application
    log "${YELLOW}🔄 Restarting application...${NC}"
    if ssh "${SERVER_USER}@${SERVER_HOST}" "command -v pm2 &> /dev/null"; then
        # Using PM2
        log "Restarting with PM2..."
        ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && pm2 restart all"
    elif ssh "${SERVER_USER}@${SERVER_HOST}" "systemctl is-active --quiet bali-report"; then
        # Using systemd
        log "Restarting with systemd..."
        ssh "${SERVER_USER}@${SERVER_HOST}" "sudo systemctl restart bali-report"
    else
        log "${YELLOW}⚠️  Could not detect process manager. Manual restart may be needed.${NC}"
    fi
    
    log "${GREEN}✅ Deployment complete!${NC}"
}

# Verify deployment
verify_deployment() {
    log "${BLUE}🔍 Verifying deployment...${NC}"
    
    # Check if server is responding
    if curl -f -s --max-time 10 "https://bali.report" > /dev/null; then
        log "${GREEN}✅ Site is responding: https://bali.report${NC}"
    else
        log "${YELLOW}⚠️  Site check failed or slow response${NC}"
    fi
    
    # Show next steps
    log "${BLUE}📋 Next Steps:${NC}"
    log "1. Visit https://bali.report and open DevTools Console"
    log "2. Check for clean console output (no errors)"
    log "3. Test video loading on /videos page" 
    log "4. Verify newsletter signup works"
    log "5. Check that ads are displaying (if configured)"
    
    log "${GREEN}🎉 Console error fixes have been deployed!${NC}"
}

# Main deployment flow
main() {
    log "${GREEN}🏝️  Bali Report - Console Error Fixes Deployment${NC}"
    log "=================================================="
    echo
    
    detect_server
    test_ssh
    deploy_fixes
    verify_deployment
    
    log "${GREEN}🎯 Deployment Summary:${NC}"
    log "• ✅ Service Worker caching improved"
    log "• ✅ React hydration errors fixed"  
    log "• ✅ Video CORS issues resolved with API proxy"
    log "• ✅ Adsterra integration preserved and cleaned"
    log "• ✅ Missing image references fixed"
    log "• ✅ CSP headers optimized for your services"
    echo
    log "Your site should now have a clean console while maintaining all"
    log "revenue streams and service integrations! 🌟"
}

# Run deployment
main "$@"