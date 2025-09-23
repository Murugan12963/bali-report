#!/bin/bash

# Bali Report Production Deployment Script
# Run this script on your DigitalOcean server

set -e  # Exit on error

echo "🚀 Bali Report Production Deployment"
echo "====================================="

# Configuration
APP_DIR="/home/deploy/bali-report"
BACKUP_DIR="/home/backups/bali-report"
USER="deploy"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or deploy user
if [[ $EUID -eq 0 ]]; then
    print_status "Running as root user"
    APP_DIR="/root/bali-report"
elif [[ $(whoami) == "deploy" ]]; then
    print_status "Running as deploy user"
    APP_DIR="/home/deploy/bali-report"
else
    print_error "Please run as root or deploy user"
    exit 1
fi

print_status "Application directory: $APP_DIR"

# Create backup directory
mkdir -p $BACKUP_DIR

# Step 1: Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory $APP_DIR not found!"
    print_status "Please clone the repository first:"
    echo "  git clone https://github.com/Murugan12963/bali-report.git $APP_DIR"
    exit 1
fi

# Step 2: Navigate to app directory
print_status "Navigating to $APP_DIR"
cd $APP_DIR

# Step 3: Create backup of current state
print_status "Creating backup before deployment..."
BACKUP_NAME="pre-deploy-$(date +%Y%m%d-%H%M%S)"
tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz . --exclude=node_modules --exclude=.next 2>/dev/null || true
print_success "Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Step 4: Check for environment file
if [ ! -f ".env.local" ]; then
    print_warning "No .env.local file found!"
    print_status "Creating template from .env.production.ready..."
    
    if [ -f ".env.production.ready" ]; then
        cp .env.production.ready .env.local
        print_success "Template created! Please edit .env.local with your actual values:"
        print_status "nano .env.local"
        print_warning "Don't forget to add your Google Analytics ID!"
        echo ""
        echo "Press Enter when you've configured .env.local..."
        read -r
    else
        print_error ".env.production.ready template not found!"
        print_status "Please create .env.local manually with required variables"
        exit 1
    fi
fi

# Step 5: Check Node.js and npm
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" == "not found" ]; then
    print_error "Node.js not installed! Please install Node.js 20.x first"
    exit 1
fi
print_success "Node.js version: $NODE_VERSION"

# Step 6: Check PM2
print_status "Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 not installed! Installing PM2..."
    npm install -g pm2
fi
print_success "PM2 is available"

# Step 7: Pull latest changes
print_status "Pulling latest changes from GitHub..."
git pull origin master || {
    print_error "Failed to pull from GitHub"
    print_status "Continuing with local files..."
}

# Step 8: Install dependencies
print_status "Installing dependencies..."
npm ci --production

# Step 9: Build the application
print_status "Building production application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed!"
    print_status "Check the error messages above"
    print_status "Common issues:"
    echo "  - Missing environment variables"
    echo "  - TypeScript errors"
    echo "  - Missing dependencies"
    exit 1
fi

# Step 10: Start/Restart with PM2
print_status "Starting application with PM2..."

# Check if app is already running
if pm2 list | grep -q "bali-report"; then
    print_status "Restarting existing PM2 process..."
    pm2 restart bali-report --update-env
else
    print_status "Starting new PM2 process..."
    pm2 start npm --name "bali-report" -- start
fi

# Save PM2 configuration
pm2 save

# Step 11: Health check
print_status "Performing health check..."
sleep 5

if pm2 list | grep "bali-report" | grep -q "online"; then
    print_success "Application is running!"
else
    print_error "Application failed to start"
    print_status "Checking PM2 logs..."
    pm2 logs bali-report --lines 20
    exit 1
fi

# Step 12: Test HTTP response
print_status "Testing HTTP response..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    print_success "HTTP test passed!"
else
    print_warning "HTTP test failed - check application logs"
fi

# Step 13: Final status
echo ""
echo "======================================"
print_success "Deployment completed successfully!"
echo "======================================"
print_status "Application status:"
pm2 list | grep bali-report

print_status "Next steps:"
echo "  1. Test your site at: https://bali.report"
echo "  2. Check logs with: pm2 logs bali-report" 
echo "  3. Monitor with: pm2 monit"
echo "  4. View environment: pm2 env bali-report"
echo ""
echo "🎉 Your Bali Report is now live!"

# Optional: Run health check script if available
if [ -f "scripts/monitor.sh" ]; then
    print_status "Running health check..."
    chmod +x scripts/monitor.sh
    ./scripts/monitor.sh
fi