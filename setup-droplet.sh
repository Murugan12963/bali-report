#!/bin/bash

# Complete Droplet Setup Script for Bali Report Performance Upgrade
# Run this script ON THE DROPLET after SSH access is established

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🚀 Starting Bali Report Droplet Setup..."
log "📊 System Info: $(uname -a)"
log "💾 Memory: $(free -h | grep Mem | awk '{print $2}')"
log "💻 CPUs: $(nproc)"

# Step 1: Update system
log "📦 Updating system packages..."
apt update
apt upgrade -y

# Step 2: Install Node.js 20 (latest LTS)
log "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
log "✅ Node.js installed: $NODE_VERSION"
log "✅ npm installed: $NPM_VERSION"

# Step 3: Install PM2 globally
log "🔄 Installing PM2 process manager..."
npm install -g pm2

# Step 4: Install and configure Redis
log "📊 Installing Redis server..."
apt install -y redis-server

# Stop Redis to apply configuration
systemctl stop redis-server

# Backup original config
cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

log "⚙️  Applying optimized Redis configuration..."
# Redis config will be uploaded from local machine

# Create Redis log directory
mkdir -p /var/log/redis
chown redis:redis /var/log/redis

# Step 5: Install Nginx
log "🌐 Installing and configuring Nginx..."
apt install -y nginx

# Create cache directories
mkdir -p /var/cache/nginx/bali-report
chown -R www-data:www-data /var/cache/nginx/

# Step 6: Install additional tools
log "🛠️  Installing additional tools..."
apt install -y htop iotop curl wget git unzip

# Install Redis CLI tools
apt install -y redis-tools

# Step 7: Create application directory
log "📁 Setting up application directory..."
mkdir -p /var/www/bali-report
cd /var/www/bali-report

# Set proper ownership
chown -R root:root /var/www/bali-report

# Step 8: Configure firewall
log "🔥 Configuring firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

# Step 9: System optimizations for 4GB RAM
log "⚡ Applying system optimizations..."

# Increase file descriptor limits
cat >> /etc/security/limits.conf << 'EOF'
# Increased limits for Node.js application
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Optimize kernel parameters
cat > /etc/sysctl.d/99-bali-report.conf << 'EOF'
# Network optimizations
net.core.somaxconn = 32768
net.core.netdev_max_backlog = 5000
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216

# Memory management
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5

# File system
fs.file-max = 2097152
EOF

# Apply kernel parameters
sysctl -p /etc/sysctl.d/99-bali-report.conf

# Step 10: Create swap file (2GB for 4GB RAM system)
log "💾 Creating swap file..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
    log "✅ 2GB swap file created and activated"
fi

# Step 11: Set up log rotation
log "📝 Configuring log rotation..."
cat > /etc/logrotate.d/bali-report << 'EOF'
/var/www/bali-report/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 root root
    postrotate
        pm2 reload all
    endscript
}
EOF

# Step 12: Configure automatic security updates
log "🔒 Setting up automatic security updates..."
apt install -y unattended-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' > /etc/apt/apt.conf.d/20auto-upgrades

# Step 13: Install monitoring tools
log "📊 Installing monitoring tools..."
apt install -y nethogs iftop ncdu

# Step 14: Create environment file template
log "📄 Creating environment template..."
cat > /var/www/bali-report/.env.template << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=3000

# Redis Configuration (local Redis)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=bali-report-redis-2024
REDIS_URL=redis://:bali-report-redis-2024@127.0.0.1:6379

# Add your other environment variables here
# XAI_API_KEY=your_key_here
# NEXT_PUBLIC_MATOMO_URL=your_matomo_url
# etc...
EOF

# Step 15: Final system status check
log "🔍 Final system status check..."
log "Memory usage: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
log "Disk usage: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
log "Redis status: $(systemctl is-active redis-server)"
log "Nginx status: $(systemctl is-active nginx)"

# Step 16: Display next steps
log "🎉 Droplet setup complete!"
echo
log "📋 Next steps:"
echo "1. Upload your application files to /var/www/bali-report/"
echo "2. Copy optimized configurations (Redis, Nginx, PM2)"
echo "3. Install npm dependencies and build the application"
echo "4. Start PM2 with clustering configuration"
echo "5. Configure domain and SSL certificate"
echo
log "💰 Current resource usage:"
echo "   - Memory: $(free -h | grep Mem | awk '{print $2}') total"
echo "   - CPUs: $(nproc) cores"
echo "   - Disk: $(df -h / | tail -1 | awk '{print $2}') total"
echo
log "🌟 Your droplet is now optimized and ready for high-performance deployment!"