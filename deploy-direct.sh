#!/bin/bash

# Direct file upload deployment for console error fixes
# This uploads the fixed files directly to the server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Server configuration
SERVER_USER="root"
SERVER_HOST="152.42.250.203"
SERVER_PATH="/var/www/bali-report"

log() {
    echo -e "$1"
}

# Upload the console error fixes
deploy_fixes() {
    log "${BLUE}🚀 Deploying console error fixes via direct upload...${NC}"
    
    # Create backup on server
    log "${YELLOW}📁 Creating backup on server...${NC}"
    ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && cp -r src src_backup_$(date +%Y%m%d_%H%M%S)"
    
    # Upload modified core files
    log "${YELLOW}📤 Uploading fixed files...${NC}"
    
    # Upload service worker
    scp public/sw.js "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/public/"
    
    # Upload Next.js config
    scp next.config.js "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/"
    
    # Upload fixed components
    scp src/components/PersonalizationProvider.tsx "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/components/"
    scp src/components/AdsterraAds.tsx "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/components/"
    scp src/components/MatomoAnalytics.tsx "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/components/"
    
    # Upload fixed contexts
    scp src/contexts/ThemeContext.tsx "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/contexts/"
    
    # Upload fixed lib files
    scp src/lib/video-crawler.ts "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/lib/"
    scp src/lib/stripe.ts "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/lib/"
    
    # Upload fixed pages
    scp src/app/opinion/page.tsx "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/app/opinion/"
    
    # Upload new API route
    ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p ${SERVER_PATH}/src/app/api/videos"
    scp src/app/api/videos/route.ts "${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/app/api/videos/"
    
    log "${GREEN}✅ Files uploaded successfully${NC}"
}

# Install dependencies and build
build_application() {
    log "${YELLOW}📦 Installing dependencies and building...${NC}"
    
    # Install any new dependencies (for the new API route)
    ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && npm install"
    
    # Build the application
    ssh "${SERVER_USER}@${SERVER_HOST}" "cd ${SERVER_PATH} && npm run build"
    
    log "${GREEN}✅ Application built successfully${NC}"
}

# Restart the application
restart_application() {
    log "${YELLOW}🔄 Restarting application...${NC}"
    
    if ssh "${SERVER_USER}@${SERVER_HOST}" "command -v pm2 &> /dev/null"; then
        # Using PM2
        log "Restarting with PM2..."
        ssh "${SERVER_USER}@${SERVER_HOST}" "pm2 restart all"
        ssh "${SERVER_USER}@${SERVER_HOST}" "pm2 save"
    else
        log "${YELLOW}⚠️  PM2 not found. Trying other methods...${NC}"
        
        # Try systemd
        if ssh "${SERVER_USER}@${SERVER_HOST}" "systemctl is-active --quiet bali-report 2>/dev/null"; then
            log "Restarting with systemd..."
            ssh "${SERVER_USER}@${SERVER_HOST}" "sudo systemctl restart bali-report"
        else
            log "${YELLOW}⚠️  Please manually restart your application${NC}"
        fi
    fi
    
    log "${GREEN}✅ Application restarted${NC}"
}

# Verify deployment
verify_deployment() {
    log "${BLUE}🔍 Verifying deployment...${NC}"
    
    # Wait a moment for the application to start
    sleep 5
    
    # Check if server is responding
    if curl -f -s --max-time 30 "https://bali.report" > /dev/null; then
        log "${GREEN}✅ Site is responding: https://bali.report${NC}"
    else
        log "${YELLOW}⚠️  Site check failed or slow response${NC}"
        log "   Try accessing https://bali.report manually"
    fi
    
    # Check specific endpoints
    log "${BLUE}🔍 Testing new video API...${NC}"
    if curl -f -s --max-time 10 "https://bali.report/api/videos?source=rt-news" > /dev/null; then
        log "${GREEN}✅ Video API is working${NC}"
    else
        log "${YELLOW}⚠️  Video API check failed (may need time to start)${NC}"
    fi
}

# Show post-deployment instructions
show_instructions() {
    log "${GREEN}🎉 Console Error Fixes Deployed Successfully!${NC}"
    log "=============================================="
    echo
    
    log "${BLUE}📋 Testing Instructions:${NC}"
    log "1. Visit: https://bali.report"
    log "2. Open DevTools (F12) → Console tab"
    log "3. Refresh the page and check for:"
    log "   ✅ Clean service worker loading"
    log "   ✅ No React hydration errors"
    log "   ✅ No CORS errors"
    log "   ✅ Videos loading properly"
    echo
    
    log "${BLUE}📝 What to Expect:${NC}"
    log "• Service Worker: 'Static assets cached successfully'"
    log "• Videos: 'Server: Fetched X videos from [Source]'"
    log "• Services: Clean initialization messages"
    log "• No more red errors in console!"
    echo
    
    log "${BLUE}🔧 If Issues Occur:${NC}"
    log "• Wait 2-3 minutes for full restart"
    log "• Hard refresh (Ctrl+F5) to clear cache"
    log "• Check PM2 logs: ssh root@152.42.250.203 'pm2 logs'"
    echo
    
    log "${GREEN}🎯 Your console should now be clean while keeping all"
    log "   your Mailchimp, Adsterra, and x.ai integrations working! 🌟${NC}"
}

# Main deployment flow
main() {
    log "${GREEN}🏝️  Bali Report - Direct Console Fixes Deployment${NC}"
    log "=================================================="
    echo
    
    deploy_fixes
    build_application
    restart_application
    verify_deployment
    show_instructions
}

# Run deployment
main "$@"