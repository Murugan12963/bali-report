#!/bin/bash

# Digital Ocean Spaces CDN Setup Script
# Run this script on your droplet after authentication

set -e

echo "🌐 Setting up Digital Ocean Spaces CDN for Bali Report..."

# Configuration variables
SPACE_NAME="bali-report-assets"
REGION="sgp1"  # Singapore region for better performance in Asia
CDN_ENDPOINT=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if doctl is authenticated
if ! doctl account get > /dev/null 2>&1; then
    echo -e "${RED}❌ Please authenticate with Digital Ocean first: doctl auth init${NC}"
    exit 1
fi

# Create Spaces bucket
echo -e "${YELLOW}📦 Creating Spaces bucket: $SPACE_NAME${NC}"
if doctl spaces bucket create $SPACE_NAME --region $REGION; then
    echo -e "${GREEN}✅ Spaces bucket created successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Bucket might already exist, continuing...${NC}"
fi

# Set CORS policy for the bucket
echo -e "${YELLOW}🔧 Setting CORS policy for browser access${NC}"
cat > cors-policy.json << 'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://bali.report", "http://localhost:3000"],
      "AllowedMethods": ["GET", "HEAD"],
      "MaxAgeSeconds": 86400,
      "AllowedHeaders": ["*"]
    }
  ]
}
EOF

# Apply CORS policy (using AWS CLI syntax as Spaces is S3-compatible)
if command -v aws &> /dev/null; then
    aws --endpoint-url=https://$REGION.digitaloceanspaces.com s3api put-bucket-cors --bucket $SPACE_NAME --cors-configuration file://cors-policy.json
    echo -e "${GREEN}✅ CORS policy applied${NC}"
else
    echo -e "${YELLOW}⚠️  AWS CLI not installed, you may need to set CORS manually in the Spaces dashboard${NC}"
fi

# Get CDN endpoint
CDN_ENDPOINT=$(doctl spaces bucket list | grep $SPACE_NAME | awk '{print $3}')
if [ ! -z "$CDN_ENDPOINT" ]; then
    echo -e "${GREEN}📡 CDN Endpoint: $CDN_ENDPOINT${NC}"
fi

# Create access keys for programmatic access
echo -e "${YELLOW}🔑 Creating Spaces access keys...${NC}"
KEY_OUTPUT=$(doctl spaces keys create bali-report-cdn-key)
ACCESS_KEY=$(echo "$KEY_OUTPUT" | grep -o 'Access Key: [^[:space:]]*' | cut -d' ' -f3)
SECRET_KEY=$(echo "$KEY_OUTPUT" | grep -o 'Secret Key: [^[:space:]]*' | cut -d' ' -f3)

# Create environment file
cat > ../.env.spaces << EOF
# Digital Ocean Spaces CDN Configuration
# Add these to your main .env file

SPACES_REGION=$REGION
SPACES_BUCKET=$SPACE_NAME
SPACES_ACCESS_KEY=$ACCESS_KEY
SPACES_SECRET_KEY=$SECRET_KEY
SPACES_ENDPOINT=https://$REGION.digitaloceanspaces.com
SPACES_CDN_ENDPOINT=https://$SPACE_NAME.$REGION.cdn.digitaloceanspaces.com
NEXT_PUBLIC_CDN_URL=https://$SPACE_NAME.$REGION.cdn.digitaloceanspaces.com

# For AWS SDK compatibility
AWS_ACCESS_KEY_ID=$ACCESS_KEY
AWS_SECRET_ACCESS_KEY=$SECRET_KEY
AWS_S3_ENDPOINT=https://$REGION.digitaloceanspaces.com
AWS_S3_REGION=$REGION
EOF

echo -e "${GREEN}✅ Environment variables saved to .env.spaces${NC}"
echo -e "${YELLOW}📝 Please add these variables to your main .env file${NC}"

# Upload sample assets
echo -e "${YELLOW}📤 Uploading sample static assets...${NC}"
if [ -d "../public" ]; then
    # Using s3cmd if available
    if command -v s3cmd &> /dev/null; then
        s3cmd sync ../public/ s3://$SPACE_NAME/public/ --host=$REGION.digitaloceanspaces.com --host-bucket='%(bucket)s.'$REGION.digitaloceanspaces.com
        echo -e "${GREEN}✅ Static assets uploaded${NC}"
    else
        echo -e "${YELLOW}⚠️  s3cmd not installed. You can manually upload files or install s3cmd${NC}"
    fi
fi

# Create upload script
cat > upload-to-spaces.sh << 'EOF'
#!/bin/bash
# Upload assets to Digital Ocean Spaces

BUCKET="bali-report-assets"
REGION="sgp1"

# Upload public directory
if [ -d "./public" ]; then
    echo "Uploading public assets..."
    s3cmd sync ./public/ s3://$BUCKET/public/ \
        --host=$REGION.digitaloceanspaces.com \
        --host-bucket='%(bucket)s.'$REGION.digitaloceanspaces.com \
        --delete-removed \
        --acl-public \
        --guess-mime-type \
        --no-preserve
fi

# Upload Next.js build assets  
if [ -d "./.next/static" ]; then
    echo "Uploading Next.js static assets..."
    s3cmd sync ./.next/static/ s3://$BUCKET/_next/static/ \
        --host=$REGION.digitaloceanspaces.com \
        --host-bucket='%(bucket)s.'$REGION.digitaloceanspaces.com \
        --acl-public \
        --add-header="Cache-Control: public, max-age=31536000, immutable"
fi

echo "✅ Upload complete!"
EOF

chmod +x upload-to-spaces.sh

# Clean up
rm -f cors-policy.json

echo -e "${GREEN}🎉 Digital Ocean Spaces CDN setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Add the environment variables from .env.spaces to your main .env file"
echo "2. Install s3cmd: sudo apt-get install s3cmd (for easy uploads)"
echo "3. Update your Next.js configuration to use CDN URLs"
echo "4. Run ./upload-to-spaces.sh to upload your assets"
echo ""
echo -e "${GREEN}CDN URL: https://$SPACE_NAME.$REGION.cdn.digitaloceanspaces.com${NC}"