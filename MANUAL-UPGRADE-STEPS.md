# 🔧 Manual Digital Ocean Upgrade Steps

Since SSH automation isn't working, here's how to manually implement the $60/month performance upgrade.

## 🎯 **Prerequisites Status**
- ✅ doctl CLI authenticated
- ✅ PM2 installed locally  
- ✅ Your droplet exists: `ubuntu-s-1vcpu-2gb-sgp1-01` (152.42.250.203)
- ❌ SSH access needs fixing

## 🚀 **Step 1: Upgrade Your Droplet (From Local Machine)**

```bash
# Power off droplet
doctl compute droplet-action power-off 519872409 --wait

# Resize to 4GB RAM, 2 vCPUs, 80GB disk
doctl compute droplet-action resize 519872409 --size s-2vcpu-4gb-80gb-intel --wait

# Power back on
doctl compute droplet-action power-on 519872409 --wait
```

## 📊 **Step 2: Create Managed Redis (From Local Machine)**

```bash
# Create Redis instance
doctl databases cluster create bali-report-redis \
    --engine redis \
    --size db-s-1vcpu-1gb \
    --region sgp1 \
    --num-nodes 1

# Wait for it to be ready (5-10 minutes)
doctl databases cluster get bali-report-redis

# Get connection details
doctl databases cluster get bali-report-redis --format PrivateHost,Port,Password --no-header
```

## 🔐 **Step 3: Fix SSH Access to Your Droplet**

### Method 1: Through Digital Ocean Console
1. Go to https://cloud.digitalocean.com/droplets/519872409
2. Click "Console" to get terminal access
3. Run these commands in the console:

```bash
# Add your SSH key to the droplet
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILm5AYxmBAeSJbGKuvsb+1CRUsqGOOr9KS9zQbfsiEco murugan12963@gmail.com" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Method 2: Rebuild Droplet with SSH Key
```bash
# Create a snapshot first
doctl compute droplet-action snapshot 519872409 --snapshot-name "bali-report-backup"

# Rebuild with your SSH key included
doctl compute droplet create new-bali-report \
    --image ubuntu-25-04-x64 \
    --size s-2vcpu-4gb-80gb-intel \
    --region sgp1 \
    --ssh-keys 50872968
```

## 🛠️ **Step 4: Configure the Droplet (SSH Required)**

Once SSH is working, connect to your droplet:

```bash
ssh root@152.42.250.203
```

Then run these commands ON THE DROPLET:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js and npm (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Install and configure Nginx
apt install -y nginx

# Create cache directories
mkdir -p /var/cache/nginx/bali-report
chown -R www-data:www-data /var/cache/nginx/

# Install Redis CLI (for testing)
apt install -y redis-tools
```

## 📁 **Step 5: Upload Your Application Files**

From your local machine:

```bash
# Copy optimized files to the droplet
scp ecosystem.config.js root@152.42.250.203:/var/www/bali-report/
scp nginx-optimized.conf root@152.42.250.203:/etc/nginx/sites-available/bali-report
scp scripts/monitor-system.sh root@152.42.250.203:/var/www/bali-report/scripts/

# Copy your entire application
rsync -avz --exclude node_modules --exclude .git . root@152.42.250.203:/var/www/bali-report/
```

## ⚙️ **Step 6: Configure Services on Droplet**

SSH to droplet and run:

```bash
cd /var/www/bali-report

# Install dependencies
npm install

# Build application  
npm run build

# Configure Nginx
ln -s /etc/nginx/sites-available/bali-report /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Start PM2 with clustering
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Set up monitoring cron
chmod +x scripts/monitor-system.sh
(crontab -l; echo "*/5 * * * * /var/www/bali-report/scripts/monitor-system.sh") | crontab -
```

## 🧪 **Step 7: Test Everything**

```bash
# Test application response
curl -I http://localhost:3000

# Check PM2 status
pm2 status

# Test Nginx
systemctl status nginx

# Check Redis connection (get details from step 2)
redis-cli -h [REDIS_HOST] -p [REDIS_PORT] -a [REDIS_PASSWORD] ping
```

## 📊 **Step 8: Update Environment Variables**

Add Redis connection details to your `.env` file on the droplet:

```bash
# From the Redis creation in step 2, add these:
REDIS_HOST=[your-redis-host]
REDIS_PORT=[your-redis-port]  
REDIS_PASSWORD=[your-redis-password]
REDIS_URL=redis://default:[password]@[host]:[port]
```

## ✅ **Verification**

Your upgrade is complete when:
- ✅ Droplet shows 4GB RAM, 2 vCPUs in DO dashboard
- ✅ Redis cluster shows "online" status
- ✅ PM2 shows multiple clustered processes
- ✅ Nginx serves your site with caching headers
- ✅ Monitoring script runs without errors

## 💰 **Cost Verification**

Check your DO billing dashboard for:
- $40/month for the upgraded droplet
- $15/month for managed Redis
- Total: $55/month (+ $5 if you add Spaces CDN)

## 🆘 **If Something Goes Wrong**

1. **Droplet won't start after resize**:
   ```bash
   doctl compute droplet-action power-cycle 519872409 --wait
   ```

2. **Can't connect via SSH**:
   Use Digital Ocean console access from the web dashboard

3. **PM2 not starting**:
   ```bash
   pm2 kill
   pm2 start ecosystem.config.js --env production
   ```

4. **Need to rollback droplet size**:
   ```bash
   doctl compute droplet-action power-off 519872409 --wait
   doctl compute droplet-action resize 519872409 --size s-1vcpu-2gb-intel --wait  
   doctl compute droplet-action power-on 519872409 --wait
   ```

This manual approach gives you full control and avoids the SSH automation issues!