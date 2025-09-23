# 🚀 Bali Report Production Setup

## Environment Variables

### Core Application
- `NODE_ENV=production`
- `PORT=3000`
- `NEXT_PUBLIC_APP_URL=https://bali.report`

### Analytics (Already configured)
- `GOOGLE_ANALYTICS_ID=G-K0VX8HVYE5`
- `GOOGLE_ADSENSE_CLIENT=ca-pub-3235214437727397`

### AI Services (Optional)
- `XAI_API_KEY` - Get from x.ai console

### Newsletter Service (Optional)
- `MAILCHIMP_API_KEY` - Mailchimp API key
- `MAILCHIMP_AUDIENCE_ID` - List ID
- `MAILCHIMP_SERVER_PREFIX` - Server prefix

## Production Deployment

1. Install dependencies:
```bash
npm ci
```

2. Build the application:
```bash
NODE_ENV=production npm run build
```

3. Start the server:
```bash
npm start
```

## Docker Deployment

1. Build the container:
```bash
docker build -t bali-report .
```

2. Run in production:
```bash
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_APP_URL=https://bali.report \
  bali-report
```

## Health Checks

The `/api/health` endpoint provides system status.