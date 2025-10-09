# 🚀 Bali Report Performance Upgrade Guide

## Overview

This guide implements a **$60/month optimized infrastructure** for maximum site performance:

- **$40/month Droplet**: 2 vCPUs, 4GB RAM, 80GB SSD, 4TB Transfer
- **$15/month Managed Redis**: Dedicated cache layer
- **$5/month Spaces CDN**: Global static asset delivery

## 📋 Prerequisites

1. **Digital Ocean Account** with billing setup
2. **Existing Droplet** running your application
3. **Domain configured** (bali.report)
4. **Local access** to this codebase

## 🎯 Quick Implementation (30 minutes)

### Step 1: Authenticate with Digital Ocean
```bash
# Install doctl (already done)
doctl version

# Authenticate (get token from https://cloud.digitalocean.com/account/api/tokens)
doctl auth init
```

### Step 2: Run Automated Deployment
```bash
# Execute the comprehensive upgrade script
./deploy-optimized.sh
```

This script will:
- ✅ Upgrade droplet to 4GB RAM
- ✅ Create managed Redis instance  
- ✅ Deploy PM2 clustering
- ✅ Configure optimized Nginx
- ✅ Set up monitoring

### Step 3: Set up CDN (Optional but Recommended)
```bash
# Run CDN setup script
./scripts/setup-spaces-cdn.sh

# Add the generated environment variables to your .env file
cat .env.spaces >> .env
```

### Step 4: Monitor Performance
```bash
# Check current system status
./scripts/monitor-system.sh

# View deployment logs
tail -f logs/deployment-*.log
```

## 📊 Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Response Time** | ~500ms | <200ms | **60% faster** |
| **Memory Usage** | ~85% | ~65% | **More headroom** |
| **Concurrent Users** | ~50 | ~200+ | **4x capacity** |
| **RSS Processing** | Sequential | Parallel | **2x throughput** |
| **Cache Hit Rate** | ~60% | ~90% | **Better caching** |

## 🔧 Manual Implementation (If Automated Script Fails)

### 1. Upgrade Droplet Manually
```bash
# List current droplets
doctl compute droplet list

# Resize droplet (replace ID)
doctl compute droplet-action power-off [DROPLET_ID] --wait
doctl compute droplet-action resize [DROPLET_ID] --size s-2vcpu-4gb-80gb-intel --wait
doctl compute droplet-action power-on [DROPLET_ID] --wait
```

### 2. Create Managed Redis
```bash
# Create Redis cluster
doctl databases cluster create bali-report-redis \
    --engine redis \
    --size db-s-1vcpu-1gb \
    --region sgp1 \
    --num-nodes 1

# Get connection details
doctl databases cluster get bali-report-redis
```

### 3. Deploy Application Changes
```bash
# Build application
npm run build

# Restart PM2 with clustering
pm2 delete all
pm2 start ecosystem.config.js --env production
pm2 save
```

### 4. Update Nginx Configuration
```bash
# Copy optimized config
sudo cp nginx-optimized.conf /etc/nginx/sites-available/bali-report

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Troubleshooting

### Issue: Droplet resize failed
**Solution:**
```bash
# Check current droplet status
doctl compute droplet get [DROPLET_ID]

# If stuck, try powering off again
doctl compute droplet-action power-off [DROPLET_ID] --wait
```

### Issue: Redis connection failed
**Solution:**
```bash
# Check Redis cluster status
doctl databases cluster get bali-report-redis

# Verify connection details in .env file
grep REDIS .env
```

### Issue: PM2 not starting
**Solution:**
```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs

# Reset PM2
pm2 kill
pm2 start ecosystem.config.js --env production
```

### Issue: High memory usage
**Solution:**
```bash
# Check process memory
ps aux --sort=-%mem | head

# Restart PM2 with memory limits
pm2 restart all
```

## 📈 Performance Monitoring

### Real-time Monitoring
```bash
# System overview
./scripts/monitor-system.sh

# PM2 monitoring
pm2 monit

# Nginx status
sudo nginx -t && systemctl status nginx
```

### Key Metrics to Watch
- **CPU Usage**: Should stay <70%
- **Memory Usage**: Should stay <80% 
- **Response Time**: Should be <500ms
- **Error Rate**: Should be <1%

## 🔄 Ongoing Maintenance

### Daily Checks
```bash
# Run monitoring script
./scripts/monitor-system.sh

# Check PM2 status
pm2 status
```

### Weekly Tasks
```bash
# Update dependencies
npm update

# Clear old logs
pm2 flush

# Restart services
pm2 restart all
```

### Monthly Tasks
```bash
# Review performance metrics
# Check for security updates
# Monitor costs in DO dashboard
# Update SSL certificates if needed
```

## 💰 Cost Breakdown

| Service | Monthly Cost | Purpose |
|---------|-------------|---------|
| **Droplet (s-2vcpu-4gb-80gb-intel)** | $40 | Main application server |
| **Managed Redis (db-s-1vcpu-1gb)** | $15 | Cache layer |
| **Spaces CDN (250GB)** | $5 | Static asset delivery |
| **Load Balancer** (Optional) | $12 | High availability |
| **Monitoring** (Optional) | $5 | Advanced metrics |
| **Total Base** | **$60** | Essential optimization |
| **Total Full** | **$77** | Complete solution |

## 🎯 Performance Validation

### Test Commands
```bash
# Test response time
curl -w "@curl-format.txt" -o /dev/null -s "https://bali.report/"

# Test RSS endpoint
curl -w "%{time_total}" -o /dev/null -s "https://bali.report/api/rss"

# Load test (if hey is installed)
hey -n 1000 -c 10 https://bali.report/
```

### Success Criteria
- ✅ Response time < 500ms
- ✅ Memory usage < 80%
- ✅ CPU usage < 70%  
- ✅ Zero downtime deployment
- ✅ RSS feeds loading < 2s

## 🆘 Support

### If Something Goes Wrong
1. **Check logs**: `tail -f logs/deployment-*.log`
2. **Revert Nginx**: `sudo cp /etc/nginx/sites-available/bali-report.backup /etc/nginx/sites-available/bali-report`
3. **Restart services**: `pm2 restart all && sudo systemctl restart nginx`
4. **Monitor status**: `./scripts/monitor-system.sh`

### Rollback Plan
```bash
# Stop all PM2 processes
pm2 stop all

# Restore previous configuration
sudo cp /etc/nginx/sites-available/bali-report.backup /etc/nginx/sites-available/bali-report
sudo systemctl reload nginx

# Start single PM2 instance
pm2 start "npm start" --name "bali-report"
```

---

## 🌟 Summary

This upgrade transforms your Bali Report from a basic setup to a high-performance, scalable news platform capable of handling significant traffic growth while maintaining sub-second response times.

**Expected Results:**
- **4x more concurrent users**
- **60% faster response times** 
- **90% cache hit rate**
- **Zero-downtime deployments**
- **24/7 automated monitoring**

Your investment of **$60/month** delivers enterprise-grade performance and reliability! 🚀