#!/bin/bash
set -e

# Configuration
DEPLOY_USER="deploy"
DEPLOY_PATH="/home/deploy/bali-report"
BACKUP_PATH="/home/deploy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Check if we are root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_PATH

# Backup current deployment if it exists
if [ -d "$DEPLOY_PATH" ]; then
  echo "📦 Backing up current deployment..."
  tar -czf "$BACKUP_PATH/bali-report_$TIMESTAMP.tar.gz" -C "$DEPLOY_PATH" .
fi

# Update deployment
echo "🚀 Deploying new version..."

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Stop current PM2 process if exists
pm2 stop bali-report 2>/dev/null || true

# Update code
cd $DEPLOY_PATH
git fetch origin
git reset --hard origin/master

# Install dependencies and build
echo "📦 Installing dependencies..."
npm ci

echo "🏗️ Building application..."
NODE_ENV=production npm run build

# Update permissions
chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH

# Start with PM2
echo "🚀 Starting application..."
sudo -u $DEPLOY_USER pm2 start npm --name "bali-report" -- start

# Save PM2 process list
sudo -u $DEPLOY_USER pm2 save

echo "✅ Deployment complete!"
echo "🌐 Site should be live at https://bali.report"