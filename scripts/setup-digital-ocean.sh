#!/bin/bash

# 🌊 Bali Report - Digital Ocean Setup Script
# This script automates the setup of your Digital Ocean droplet for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="bali-report"
APP_USER="bali"
APP_DIR="/home/${APP_USER}/${APP_NAME}"
NODE_VERSION="18"

echo -e "${BLUE}🌊 Bali Report - Digital Ocean Setup Script${NC}"
echo -e "${BLUE}============================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    print_info "Running as root - will create user account"
    SETUP_AS_ROOT=true
else
    print_info "Running as non-root user"
    SETUP_AS_ROOT=false
fi

# Update system packages
print_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y
print_status "System packages updated"

# Create application user (if running as root)
if [[ $SETUP_AS_ROOT == true ]]; then
    print_info "Creating application user: ${APP_USER}"
    if id "$APP_USER" &>/dev/null; then
        print_warning "User ${APP_USER} already exists"
    else
        adduser --disabled-password --gecos "" ${APP_USER}
        usermod -aG sudo ${APP_USER}

        # Copy SSH keys to new user
        if [[ -d /root/.ssh ]]; then
            rsync --archive --chown=${APP_USER}:${APP_USER} /root/.ssh /home/${APP_USER}/
            print_status "SSH keys copied to ${APP_USER}"
        fi
    fi
fi

# Install Node.js
print_info "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt-get install -y nodejs
print_status "Node.js $(node --version) installed"
print_status "npm $(npm --version) installed"

# Install PM2
print_info "Installing PM2 process manager..."
sudo npm install -g pm2
print_status "PM2 installed"

# Install Nginx
print_info "Installing Nginx..."
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
print_status "Nginx installed and started"

# Install Certbot for SSL
print_info "Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y
print_status "Certbot installed"

# Install additional utilities
print_info "Installing additional utilities..."
sudo apt install -y htop curl wget git unzip fail2ban ufw
print_status "Additional utilities installed"

# Setup firewall
print_info "Configuring UFW firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
print_status "Firewall configured"

# Configure Fail2Ban
print_info "Configuring Fail2Ban..."
sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
bantime = 1800
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/*error.log
findtime = 600
bantime = 7200
maxretry = 10
EOF

sudo systemctl restart fail2ban
print_status "Fail2Ban configured"

# Switch to application user for the rest of the setup
if [[ $SETUP_AS_ROOT == true ]]; then
    print_info "Switching to user ${APP_USER} for application setup..."
    sudo -u ${APP_USER} bash << 'USERSCRIPT'
APP_USER="bali"
APP_NAME="bali-report"
APP_DIR="/home/${APP_USER}/${APP_NAME}"

# Colors for output (redefine in user context)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

cd /home/${APP_USER}

# Setup PM2 startup script
print_info "Setting up PM2 startup script..."
pm2 startup systemd -u ${APP_USER} --hp /home/${APP_USER}
print_status "PM2 startup configured"

# Create application directory structure
print_info "Creating application directory structure..."
mkdir -p ${APP_DIR}/logs
mkdir -p /home/${APP_USER}/backups

print_status "Directory structure created"

# Create PM2 ecosystem configuration
print_info "Creating PM2 ecosystem configuration..."
cat > ${APP_DIR}/ecosystem.config.js << 'EOFECO'
module.exports = {
  apps: [{
    name: 'bali-report',
    script: 'npm',
    args: 'start',
    cwd: '/home/bali/bali-report',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/bali/bali-report/logs/error.log',
    out_file: '/home/bali/bali-report/logs/access.log',
    log_file: '/home/bali/bali-report/logs/combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    kill_timeout: 5000
  }]
}
EOFECO

print_status "PM2 ecosystem configuration created"

USERSCRIPT
fi

# Configure Nginx (back as root/sudo)
print_info "Configuring Nginx virtual host..."
sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << 'EOF'
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/m;

# Upstream for Next.js app
upstream bali_report {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name bali.report www.bali.report _;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://bali_report;
    }

    # Health check endpoint (no rate limit)
    location /api/health {
        proxy_pass http://bali_report;
    }

    # Sitemap and robots
    location ~ ^/(sitemap\.xml|robots\.txt)$ {
        proxy_pass http://bali_report;
        expires 1d;
        add_header Cache-Control "public, must-revalidate";
    }

    # Main application
    location / {
        limit_req zone=general burst=50 nodelay;
        proxy_pass http://bali_report;
    }

    # Error handling
    error_page 404 /404;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
EOF

# Enable site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
print_status "Nginx configured and restarted"

# Create deployment script
print_info "Creating deployment script..."
sudo -u ${APP_USER} tee ${APP_DIR}/deploy.sh > /dev/null << 'EOF'
#!/bin/bash
cd /home/bali/bali-report

echo "🚀 Starting deployment..."

# Backup current version
pm2 dump

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Run tests
npm test

if [ $? -eq 0 ]; then
    echo "✅ Tests passed, restarting application..."
    # Restart application
    pm2 restart bali-report

    # Save PM2 configuration
    pm2 save

    echo "✅ Deployment completed successfully!"
else
    echo "❌ Tests failed, deployment aborted!"
    exit 1
fi
EOF

sudo chmod +x ${APP_DIR}/deploy.sh
print_status "Deployment script created"

# Create backup script
print_info "Creating backup script..."
sudo -u ${APP_USER} tee /home/${APP_USER}/backup.sh > /dev/null << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/bali/backups"
APP_DIR="/home/bali/bali-report"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/bali-report-$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 backups
find $BACKUP_DIR -name "bali-report-*.tar.gz" -mtime +7 -delete

echo "Backup completed: bali-report-$DATE.tar.gz"
EOF

sudo chmod +x /home/${APP_USER}/backup.sh
print_status "Backup script created"

# Setup log rotation
print_info "Setting up log rotation..."
sudo tee /etc/logrotate.d/${APP_NAME} > /dev/null << EOF
/home/${APP_USER}/${APP_NAME}/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 ${APP_USER} ${APP_USER}
    postrotate
        sudo -u ${APP_USER} pm2 reloadLogs
    endscript
}
EOF
print_status "Log rotation configured"

# Create environment template
print_info "Creating environment template..."
sudo -u ${APP_USER} tee ${APP_DIR}/.env.production.template > /dev/null << 'EOF'
# Production Environment Variables Template
# Copy this to .env.production and fill in your values

# Core Configuration
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://bali.report

# Google AdSense Integration
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-your-adsense-client-id
NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT=your-leaderboard-slot-id
NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT=your-sidebar-slot-id
NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT=your-native-slot-id
NEXT_PUBLIC_GOOGLE_ADSENSE_RESPONSIVE_SLOT=your-responsive-slot-id

# Optional: AI Enhancement (x.ai Grok)
# XAI_API_KEY=your-grok-api-key

# Optional: Analytics
# NEXT_PUBLIC_GA_TRACKING_ID=your-google-analytics-id

# Optional: Newsletter Integration
# MAILCHIMP_API_KEY=your-mailchimp-api-key
# MAILCHIMP_LIST_ID=your-mailchimp-list-id
EOF
print_status "Environment template created"

# Setup system monitoring
print_info "Setting up system monitoring..."
sudo tee /home/${APP_USER}/monitor.sh > /dev/null << 'EOF'
#!/bin/bash

echo "🖥️  System Status Report"
echo "======================"
echo "Date: $(date)"
echo ""

echo "📊 System Resources:"
echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | grep '^Mem' | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
echo ""

echo "🚀 Application Status:"
pm2 jlist | jq -r '.[] | "Name: \(.name) | Status: \(.pm2_env.status) | CPU: \(.monit.cpu)% | Memory: \(.monit.memory / 1024 / 1024 | floor)MB"'
echo ""

echo "🌐 Nginx Status:"
sudo systemctl is-active nginx
echo ""

echo "🔐 SSL Certificate Status:"
sudo certbot certificates 2>/dev/null | grep -A1 "Certificate Name" | tail -2 || echo "No certificates found"
EOF

sudo chmod +x /home/${APP_USER}/monitor.sh
print_status "System monitoring script created"

# Final system security hardening
print_info "Applying final security hardening..."

# Configure automatic security updates
sudo apt install -y unattended-upgrades
echo 'Unattended-Upgrade::Automatic-Reboot "false";' | sudo tee -a /etc/apt/apt.conf.d/50unattended-upgrades

# Optimize sysctl for web server
sudo tee -a /etc/sysctl.conf > /dev/null << 'EOF'

# Bali Report optimization
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 60
net.ipv4.tcp_keepalive_probes = 10
EOF

sudo sysctl -p
print_status "System optimization applied"

echo ""
echo -e "${GREEN}🎉 Digital Ocean Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. Configure DNS: Point bali.report to this server's IP"
echo -e "2. Clone your repository: cd ${APP_DIR} && git clone <your-repo-url> ."
echo -e "3. Copy environment: cp .env.production.template .env.production"
echo -e "4. Edit environment: nano .env.production"
echo -e "5. Install dependencies: npm install"
echo -e "6. Build application: npm run build"
echo -e "7. Start with PM2: pm2 start ecosystem.config.js"
echo -e "8. Setup SSL: sudo certbot --nginx -d bali.report -d www.bali.report"
echo -e "9. Test deployment: https://bali.report"
echo ""
echo -e "${BLUE}📊 Useful Commands:${NC}"
echo -e "• Monitor system: ./monitor.sh"
echo -e "• Deploy updates: ./deploy.sh"
echo -e "• Create backup: ./backup.sh"
echo -e "• PM2 status: pm2 status"
echo -e "• PM2 logs: pm2 logs bali-report"
echo -e "• Nginx status: sudo systemctl status nginx"
echo ""
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo -e "• Configure your environment variables"
echo -e "• Set up DNS records"
echo -e "• Run SSL certificate setup after DNS propagation"
echo ""
print_status "Server is ready for Bali Report deployment!"
