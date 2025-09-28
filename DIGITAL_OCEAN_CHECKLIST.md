# 🚀 Bali Report - Digital Ocean Deployment Checklist

## 📋 Pre-Deployment Requirements

### Domain & DNS
- [ ] Domain purchased: `bali.report`
- [ ] DNS access available (registrar control panel)
- [ ] A records ready to configure

### Digital Ocean Account
- [ ] Digital Ocean account created
- [ ] Payment method added
- [ ] SSH key pair generated locally (`ssh-keygen -t rsa -b 4096`)
- [ ] SSH public key added to Digital Ocean account

### Local Development
- [ ] Git repository ready and pushed to GitHub/GitLab
- [ ] All tests passing locally (`npm test`)
- [ ] Production build working (`npm run build`)
- [ ] Environment variables documented

## 🌊 Digital Ocean Droplet Setup

### 1. Create Droplet (5 minutes)
- [ ] **Region**: Choose closest to target audience
  - Singapore (Asia-Pacific)
  - New York/San Francisco (Americas)  
  - Amsterdam/London (Europe)
- [ ] **Image**: Ubuntu 22.04 LTS x64
- [ ] **Size**: 
  - Basic: $15/month (2GB RAM, 2 vCPU, 50GB SSD) ✅ Recommended
  - Performance: $24/month (4GB RAM, 2 vCPU, 80GB SSD)
- [ ] **Authentication**: SSH Key (select your uploaded key)
- [ ] **Hostname**: `bali-report-prod`
- [ ] **Tags**: `production`, `news`, `bali-report`
- [ ] Copy droplet IP address: `____________`

### 2. Initial Server Access (2 minutes)
```bash
ssh root@YOUR_DROPLET_IP
```
- [ ] SSH connection successful
- [ ] Server responds and shows Ubuntu welcome

## 🔧 Automated Setup Script

### 3. Run Setup Script (15-20 minutes)
```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/bali-report/main/scripts/setup-digital-ocean.sh -o setup.sh
chmod +x setup.sh
./setup.sh
```

**What the script does automatically:**
- [ ] Updates system packages
- [ ] Creates `bali` user account
- [ ] Installs Node.js 18, PM2, Nginx
- [ ] Configures firewall (UFW)
- [ ] Sets up Fail2Ban security
- [ ] Creates application directories
- [ ] Configures Nginx virtual host
- [ ] Sets up log rotation
- [ ] Creates deployment scripts

**Expected output:**
- [ ] Script completes without errors
- [ ] "🎉 Digital Ocean Setup Complete!" message appears
- [ ] All services show as active/running

## 🌐 DNS Configuration

### 4. Point Domain to Server (5 minutes)
In your domain registrar's DNS settings:
- [ ] **A Record**: `@` (root) → `YOUR_DROPLET_IP`
- [ ] **A Record**: `www` → `YOUR_DROPLET_IP`
- [ ] **TTL**: 300 seconds (5 minutes) for faster propagation

**Test DNS propagation:**
```bash
dig bali.report
dig www.bali.report
```
- [ ] Both return your droplet IP
- [ ] No errors in dig output

## 📦 Application Deployment

### 5. Clone Repository (3 minutes)
```bash
ssh bali@YOUR_DROPLET_IP
cd /home/bali/bali-report
git clone https://github.com/yourusername/bali-report.git .
```
- [ ] Repository cloned successfully
- [ ] All files present in `/home/bali/bali-report/`

### 6. Environment Configuration (5 minutes)
```bash
cp .env.production.template .env.production
nano .env.production
```

**Required environment variables:**
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `NEXT_PUBLIC_SITE_URL=https://bali.report`
- [ ] Google AdSense client ID (if available)
- [ ] Other optional variables as needed

### 7. Install and Build (5 minutes)
```bash
npm install
npm run build
npm test
```
- [ ] Dependencies installed without errors
- [ ] Build completes successfully
- [ ] All tests pass (33/33)

### 8. Start Application (2 minutes)
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 status
```
- [ ] Application starts successfully
- [ ] PM2 shows status as "online"
- [ ] No errors in `pm2 logs bali-report`

## 🔐 SSL Certificate Setup

### 9. Configure SSL (5 minutes)
**Wait for DNS propagation first (5-10 minutes after DNS changes)**

```bash
sudo certbot --nginx -d bali.report -d www.bali.report
```
- [ ] DNS propagation completed (test with `nslookup bali.report`)
- [ ] SSL certificates obtained successfully
- [ ] Nginx configuration updated automatically
- [ ] HTTPS redirect working

**Test SSL:**
- [ ] `https://bali.report` loads correctly
- [ ] `http://bali.report` redirects to HTTPS
- [ ] SSL certificate shows as valid (green lock)

## ✅ Post-Deployment Verification

### 10. Functionality Tests (10 minutes)
**Homepage Tests:**
- [ ] `https://bali.report` loads within 3 seconds
- [ ] RSS feeds loading (check article count)
- [ ] Dark/light theme switching works
- [ ] Mobile responsive design

**API Tests:**
- [ ] Health check: `https://bali.report/api/health` returns 200
- [ ] RSS data loading properly
- [ ] Search functionality working

**SEO Tests:**
- [ ] Sitemap: `https://bali.report/sitemap.xml` accessible
- [ ] Robots: `https://bali.report/robots.txt` accessible
- [ ] Meta tags present (view page source)

### 11. Performance Verification (5 minutes)
```bash
# Server performance
./monitor.sh

# Web performance
# Test with Google PageSpeed Insights: https://pagespeed.web.dev/
```
- [ ] Server CPU < 50%, Memory < 70%
- [ ] Page load time < 3 seconds
- [ ] Core Web Vitals passing
- [ ] RSS cache working (5-minute TTL)

### 12. Monitoring Setup (5 minutes)
```bash
# Setup daily backup cron job
crontab -e
# Add: 0 2 * * * /home/bali/backup.sh

# Test monitoring
pm2 monit
htop
```
- [ ] PM2 monitoring accessible
- [ ] System resources within normal range
- [ ] Backup script scheduled
- [ ] Log rotation configured

## 🎯 Go-Live Checklist

### 13. Final Verification (10 minutes)
**Content Verification:**
- [ ] All 9 RSS sources active and loading
- [ ] Articles appearing in correct categories (BRICS, Indonesia, Bali)
- [ ] Search returns relevant results
- [ ] Save for Later functionality working

**User Experience:**
- [ ] Site loads fast on mobile
- [ ] Navigation works smoothly
- [ ] Theme switching responsive
- [ ] No JavaScript errors in browser console

**SEO & Social:**
- [ ] Meta descriptions present
- [ ] Open Graph tags working (test with Facebook debugger)
- [ ] Twitter Cards working
- [ ] Structured data valid (Google Rich Results Test)

### 14. Launch Monitoring (First 24 hours)
**Immediate monitoring:**
- [ ] Server uptime stable
- [ ] RSS feeds updating properly
- [ ] No critical errors in logs
- [ ] SSL certificate stable

**Performance tracking:**
- [ ] Response times < 2 seconds
- [ ] Error rate < 1%
- [ ] Memory usage stable
- [ ] No PM2 restarts due to crashes

## 🚨 Troubleshooting Quick Fixes

### Common Issues & Solutions

**Application won't start:**
```bash
pm2 logs bali-report
pm2 restart bali-report
```

**High memory usage:**
```bash
pm2 monit
pm2 restart bali-report
```

**SSL certificate issues:**
```bash
sudo certbot renew
sudo systemctl restart nginx
```

**RSS feeds not loading:**
```bash
curl https://bali.report/api/health
pm2 logs bali-report --lines 50
```

**Nginx errors:**
```bash
sudo nginx -t
sudo systemctl restart nginx
tail -f /var/log/nginx/error.log
```

## 📈 Success Metrics

### Technical KPIs (Monitor First Week)
- [ ] **Uptime**: >99.5% (aim for 99.9%)
- [ ] **Response Time**: <3 seconds average
- [ ] **RSS Success Rate**: >95% of feeds loading
- [ ] **Error Rate**: <2% of requests
- [ ] **Memory Usage**: <80% consistently

### Business KPIs (Monitor First Month)
- [ ] **Daily Articles**: 500+ from RSS feeds
- [ ] **Page Load Speed**: Google PageSpeed >85
- [ ] **Search Indexing**: Site appears in Google search
- [ ] **Social Sharing**: Open Graph previews working
- [ ] **Mobile Performance**: Core Web Vitals passing

## 💰 Cost Estimate

### Monthly Costs
- **Droplet (2GB)**: $15/month
- **Bandwidth**: ~$1-5/month (included: 2TB)
- **Backups**: $3/month (optional)
- **Load Balancer**: $12/month (if needed for scaling)

**Total**: ~$15-35/month depending on features

### Cost Optimization
- [ ] Monitor bandwidth usage first month
- [ ] Scale droplet size based on actual load
- [ ] Consider CDN if traffic grows significantly

## 🎉 Launch Complete!

### Post-Launch Tasks (First Week)
- [ ] Submit to Google Search Console
- [ ] Set up Google Analytics
- [ ] Monitor RSS source reliability
- [ ] Create Google AdSense account (if monetizing)
- [ ] Social media accounts setup
- [ ] Content strategy review

### Growth Planning (First Month)
- [ ] Add more RSS sources if available
- [ ] Optimize based on user feedback
- [ ] SEO improvements based on search console data
- [ ] Consider newsletter signup integration
- [ ] Plan mobile app if traffic justifies

---

## 📞 Support Resources

- **Digital Ocean Docs**: https://docs.digitalocean.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Configuration**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

**Emergency Commands:**
```bash
# Restart everything
sudo systemctl restart nginx
pm2 restart all

# Check all services
sudo systemctl status nginx
pm2 status

# Monitor in real-time
pm2 monit
htop
```

**Estimated Total Setup Time**: 60-90 minutes  
**Recommended Launch Window**: Low-traffic hours for your audience  
**Success Criteria**: All checklist items ✅, site loading fast, RSS feeds active