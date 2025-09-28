# 🌊 Bali Report - Digital Ocean Deployment Guide

## 🚀 Digital Ocean Droplet Setup

### Prerequisites
- Digital Ocean account
- Domain name (bali.report) with DNS control
- SSH key pair generated

### 1. Create Droplet
```bash
# Recommended specifications for Bali Report
CPU: 2 vCPUs (Regular Intel)
Memory: 2 GB RAM
Storage: 50 GB SSD
OS: Ubuntu 22.04 LTS x64
Region: Choose closest to your target audience
```

### 2. Initial Server Setup
```bash
# Connect to your droplet
ssh root@your_droplet_ip

# Update system packages
apt update && apt upgrade -y

# Create non-root user
adduser bali
usermod -aG sudo bali

# Copy SSH keys
rsync --archive --chown=bali:bali ~/.ssh /home/bali

# Switch to new user
su - bali
```

## 📦 Environment Setup

### 1. Install Node.js 18+
```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Install PM2 startup service
pm2 startup systemd
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u bali --hp /home/bali
```

### 3. Install Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 4. Install SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Note: Run this after DNS is configured
sudo certbot --nginx -d bali.report -d www.bali.report
```

## 🔧 Application Deployment

### 1. Clone Repository
```bash
# Clone your repository
cd /home/bali
git clone https://github.com/yourusername/bali-report.git
cd bali-report

# Install dependencies
npm install

# Build application
npm run build
```

### 2. Environment Configuration
```bash
# Create production environment file
nano .env.production

# Add environment variables:
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SITE_URL=https://bali.report

# Google AdSense
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-your-client-id
NEXT_PUBLIC_GOOGLE_ADSENSE_LEADERBOARD_SLOT=your-leaderboard-slot
NEXT_PUBLIC_GOOGLE_ADSENSE_SIDEBAR_SLOT=your-sidebar-slot
NEXT_PUBLIC_GOOGLE_ADSENSE_NATIVE_SLOT=your-native-slot
NEXT_PUBLIC_GOOGLE_ADSENSE_RESPONSIVE_SLOT=your-responsive-slot

# Optional: AI Enhancement
XAI_API_KEY=your-grok-api-key

# Optional: Analytics
NEXT_PUBLIC_GA_TRACKING_ID=your-google-analytics-id

# Save and exit (Ctrl+X, Y, Enter)
```

### 3. PM2 Configuration
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this configuration:
```javascript
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
    max_memory_restart: '1G'
  }]
}
```

### 4. Create Logs Directory
```bash
mkdir -p /home/bali/bali-report/logs
```

## 🌐 Nginx Configuration

### 1. Create Nginx Virtual Host
```bash
sudo nano /etc/nginx/sites-available/bali.report
```

Add this configuration:
```nginx
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
    server_name bali.report www.bali.report;
    
    # Redirect HTTP to HTTPS (will be configured by Certbot)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bali.report www.bali.report;
    
    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/bali.report/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bali.report/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;" always;
    
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
    
    # Client max body size
    client_max_body_size 10M;
    
    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Static file caching
    location /_next/static/ {
        alias /home/bali/bali-report/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
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
        
        # Cache static pages
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://bali_report;
        }
    }
    
    # Error pages
    error_page 404 /404;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
```

### 2. Enable Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/bali.report /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔗 DNS Configuration

### Configure your domain's DNS (at your domain registrar):
```
# A Records
@ (root domain) → your_droplet_ip
www → your_droplet_ip

# Optional: CNAME for subdomains
api → bali.report
```

## 🚀 Application Launch

### 1. Start Application with PM2
```bash
cd /home/bali/bali-report

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs bali-report
```

### 2. Configure SSL Certificate
```bash
# After DNS propagation (usually 5-10 minutes)
sudo certbot --nginx -d bali.report -d www.bali.report

# Auto-renewal test
sudo certbot renew --dry-run
```

## 🔥 Firewall Setup

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## 📊 Monitoring Setup

### 1. Application Monitoring
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Check application logs
pm2 logs bali-report

# Monitor system resources
htop
```

### 2. Log Rotation
```bash
sudo nano /etc/logrotate.d/bali-report
```

Add:
```
/home/bali/bali-report/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 bali bali
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Automated Backups
```bash
# Create backup script
nano /home/bali/backup.sh
```

Add:
```bash
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
```

```bash
# Make executable
chmod +x /home/bali/backup.sh

# Add to crontab for daily backups
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/bali/backup.sh
```

## 🔄 Deployment Updates

### 1. Create Deployment Script
```bash
nano /home/bali/deploy.sh
```

Add:
```bash
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
```

```bash
# Make executable
chmod +x /home/bali/deploy.sh
```

### 2. Deploy Updates
```bash
# Run deployment
./deploy.sh
```

## 🔍 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs bali-report

# Check system resources
free -h
df -h

# Restart application
pm2 restart bali-report
```

#### SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

#### High Memory Usage
```bash
# Monitor memory usage
pm2 monit

# Restart if needed
pm2 restart bali-report
```

#### RSS Feeds Not Loading
```bash
# Check API endpoint
curl https://bali.report/api/health

# Check application logs
pm2 logs bali-report --lines 50
```

## 📈 Performance Optimization

### 1. Enable Node.js Cluster Mode
PM2 ecosystem.config.js is already configured for cluster mode with `instances: 'max'`

### 2. Database Optimization (if needed)
Currently using in-memory caching. For persistence, consider Redis:
```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis
sudo nano /etc/redis/redis.conf
```

### 3. CDN Setup (Optional)
Consider using Digital Ocean Spaces + CDN for static assets.

## 🛡️ Security Hardening

### 1. SSH Security
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended changes:
# PermitRootLogin no
# PasswordAuthentication no
# Port 2200 (change default port)

# Restart SSH
sudo systemctl restart ssh
```

### 2. Fail2Ban
```bash
# Install Fail2Ban
sudo apt install fail2ban -y

# Configure
sudo nano /etc/fail2ban/jail.local

# Add:
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
```

### 3. Automatic Security Updates
```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Configure
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 💰 Cost Optimization

### Digital Ocean Pricing
- **2GB RAM, 2 vCPU, 50GB SSD**: ~$15/month
- **4GB RAM, 2 vCPU, 80GB SSD**: ~$24/month
- **Load Balancer** (if needed): ~$12/month
- **Spaces CDN**: ~$5/month + bandwidth

### Cost-Saving Tips
1. Start with 2GB droplet, scale up if needed
2. Use snapshot backups instead of daily backups
3. Monitor bandwidth usage
4. Consider reserved instances for long-term savings

## 🎯 Success Metrics

### Server Health
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 85%
- **Response Time**: < 2 seconds

### Application Health
- **Uptime**: > 99.9%
- **RSS Success Rate**: > 95%
- **Error Rate**: < 1%

---

## 🚀 Quick Commands Reference

```bash
# Application Management
pm2 status
pm2 logs bali-report
pm2 restart bali-report
pm2 monit

# System Management
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# SSL Management
sudo certbot renew
sudo certbot certificates

# Monitoring
htop
df -h
free -h

# Logs
tail -f /home/bali/bali-report/logs/combined.log
sudo tail -f /var/log/nginx/access.log
```

**Estimated Setup Time**: 30-45 minutes  
**Monthly Cost**: $15-30 USD  
**Performance**: Handles 10k+ concurrent users  

This setup provides enterprise-grade hosting for your Bali Report news platform with full control and optimization capabilities.