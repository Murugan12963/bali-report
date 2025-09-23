#!/bin/bash

# Bali Report Restore Script
# Run this on your server to restore from backup

# Configuration
BACKUP_DIR="/home/backups/bali-report"
APP_DIR="/home/deploy/bali-report"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: ./restore.sh <backup-file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh $BACKUP_DIR/*.tar.gz 2>/dev/null || echo "No backups found in $BACKUP_DIR"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    # Try in backup directory
    if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "Error: Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

echo "Restoring from: $BACKUP_FILE"
echo "WARNING: This will replace the current application!"
read -p "Are you sure? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Create temporary directory for extraction
TMP_DIR="/tmp/restore-$(date +%Y%m%d_%H%M%S)"
mkdir -p $TMP_DIR

echo "Extracting backup..."
tar -xzf $BACKUP_FILE -C $TMP_DIR

# Get the backup folder name
BACKUP_NAME=$(ls $TMP_DIR)

# Stop the application
echo "Stopping application..."
pm2 stop bali-report

# Backup current state (just in case)
echo "Creating safety backup of current state..."
SAFETY_BACKUP="/tmp/safety-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf $SAFETY_BACKUP $APP_DIR 2>/dev/null

# Restore application files
echo "Restoring application files..."
rsync -av --delete --exclude='node_modules' --exclude='.next' \
      $TMP_DIR/$BACKUP_NAME/app/ $APP_DIR/

# Restore environment variables
if [ -f "$TMP_DIR/$BACKUP_NAME/env.backup" ]; then
    echo "Restoring environment variables..."
    cp $TMP_DIR/$BACKUP_NAME/env.backup $APP_DIR/.env.local
fi

# Restore Nginx configuration
if [ -f "$TMP_DIR/$BACKUP_NAME/nginx.backup" ]; then
    echo "Restoring Nginx configuration..."
    sudo cp $TMP_DIR/$BACKUP_NAME/nginx.backup /etc/nginx/sites-available/bali.report
    sudo nginx -t && sudo systemctl reload nginx
fi

# Restore PM2 configuration
if [ -f "$TMP_DIR/$BACKUP_NAME/pm2.backup" ]; then
    echo "Restoring PM2 configuration..."
    cp $TMP_DIR/$BACKUP_NAME/pm2.backup ~/.pm2/dump.pm2
    pm2 resurrect
fi

# Rebuild application
echo "Installing dependencies..."
cd $APP_DIR
npm install

echo "Building application..."
npm run build

# Restart application
echo "Starting application..."
pm2 restart bali-report

# Clean up
rm -rf $TMP_DIR

echo ""
echo "Restore completed successfully!"
echo "Safety backup created at: $SAFETY_BACKUP"
echo ""
echo "Please verify the application is working correctly:"
echo "  - Check site: https://bali.report"
echo "  - Check PM2: pm2 status"
echo "  - Check logs: pm2 logs bali-report"