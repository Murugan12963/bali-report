#!/bin/bash

# Bali Report Backup Script
# Run this on your server to backup application files

# Configuration
BACKUP_DIR="/home/backups/bali-report"
APP_DIR="/home/deploy/bali-report"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="bali-report-backup-$DATE"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Starting backup: $BACKUP_NAME"

# Create temporary backup directory
TMP_DIR="/tmp/$BACKUP_NAME"
mkdir -p $TMP_DIR

# Backup application files (excluding node_modules and .next)
echo "Backing up application files..."
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' \
      $APP_DIR/ $TMP_DIR/app/

# Backup environment variables
echo "Backing up environment variables..."
cp $APP_DIR/.env.local $TMP_DIR/env.backup 2>/dev/null || echo "No .env.local found"

# Backup PM2 configuration
echo "Backing up PM2 configuration..."
pm2 save
cp ~/.pm2/dump.pm2 $TMP_DIR/pm2.backup 2>/dev/null || echo "No PM2 dump found"

# Backup Nginx configuration
echo "Backing up Nginx configuration..."
cp /etc/nginx/sites-available/bali.report $TMP_DIR/nginx.backup

# Create archive
echo "Creating archive..."
tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C /tmp $BACKUP_NAME

# Clean up temporary directory
rm -rf $TMP_DIR

# Remove old backups
echo "Removing backups older than $RETENTION_DAYS days..."
find $BACKUP_DIR -name "bali-report-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Optional: Upload to external storage (DigitalOcean Spaces, S3, etc.)
# Uncomment and configure if you want offsite backups
# echo "Uploading to cloud storage..."
# aws s3 cp $BACKUP_DIR/$BACKUP_NAME.tar.gz s3://your-bucket/backups/
# or
# doctl compute droplet-action snapshot create YOUR_DROPLET_ID --snapshot-name "$BACKUP_NAME"

# Display backup size
BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_NAME.tar.gz | cut -f1)
echo "Backup size: $BACKUP_SIZE"