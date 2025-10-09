# 🌺 Bali Report - Multi-polar News Platform

**Break free from Western media monopoly with real stories from where 85% of humanity actually lives.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🎨 Modern Clean Design System
- **Professional Interface**: Clean, readable design optimized for news consumption
- **Dark/Light Themes**: Seamless theme switching with system detection
- **Teal & Orange Colors**: Modern color palette with brand consistency
- **Responsive Layout**: Mobile-first design with optimized breakpoints
- **Subtle Animations**: Performance-optimized transitions and hover effects
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Typography**: Inter for body text, clean font hierarchy
- **Card Design**: Clean article cards with subtle shadows and borders

### Content & User Experience
- **📡 Advanced RSS Aggregation**: 662+ daily articles from 33+ sources with web scraping fallback
- **🌍 Multi-polar Perspective**: RT, TASS, Xinhua, Al Jazeera, CGTN, Press TV, and more
- **🎯 AI-Powered Features**: x.ai (Grok) integration for content analysis and personalization
- **💾 Save for Later**: Complete reading system with tags, progress tracking, and offline support
- **🗺️ Community Voting**: Upvote/downvote system with community picks page
- **📹 Video Content**: Rumble video crawler with 6 active BRICS channels
- **🌙 Themes**: Modern dark/light theme system with smooth transitions

### Community & Fundraising
- **📧 Newsletter Automation**: Daily/weekly automated newsletters with AI content curation
- **🗺️ Community Features**: Voting system, community picks, user preferences
- **💰 BPD Fundraising**: Complete campaign system with Stripe integration and progress tracking
- **📈 Analytics Dashboard**: Advanced analytics with 11 event types and real-time insights

### Technical Excellence
- **📱 Mobile-First**: Responsive design optimized for all devices
- **⚡ High Performance**: <7ms response times with intelligent caching (147KB bundle)
- **🔍 Smart Search**: AI-enhanced search with semantic understanding
- **📈 Real-time Updates**: WebSocket integration with new content indicators
- **🌐 Multi-lingual**: 7 languages supported with next-intl
- **🛪 Offline Support**: Service worker with advanced caching strategies
- **🔒 Security**: Rate limiting, CSP headers, content moderation
- **🧪 Testing**: 103 unit tests + 52 E2E tests with Cypress

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bali-report

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm test         # Run test suite
npm run lint     # Run ESLint
npm run type-check # Run TypeScript checks
```

## 📋 Documentation

### Essential Documentation
- **[PLANNING.md](PLANNING.md)** - Project architecture and overview
- **[TASK.md](TASK.md)** - Complete development task tracking
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment guide for production

### Specialized Documentation
- **[docs/](docs/)** - Feature-specific documentation
- **[PRPs/](PRPs/)** - Product Requirements Packages

## 📚 Tech Stack

### Core Technologies
- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Fonts**: Inter (body), JetBrains Mono (terminal/data), Orbitron (display)
- **AI Integration**: x.ai (Grok) for content analysis
- **Real-time**: Socket.IO for live updates
- **Animations**: Pure CSS with Canvas API for particle effects

### Monetization & Payments ✅
- **Advertising**: Adsterra with native ad support
- **Payments**: Stripe integration for donations and subscriptions
- **Premium**: Multiple subscription tiers with BPD allocation
- **Events**: Stripe Checkout for event ticketing
- **Newsletter**: Mailchimp API with advanced features

### Testing & Deployment
- **Testing**: Jest with React Testing Library
- **Deployment**: Vercel (optimized)
- **Analytics**: Matomo Analytics
- **Monitoring**: Health checks and performance tracking

## 📈 Content Sources

### RSS News Sources (33+ Active)
- **BRICS Sources**: RT News, TASS, Xinhua, Al Jazeera, CGTN, Press TV, Global Times, NDTV News
- **Indonesian Sources**: Antara News, Tempo News, Jakarta Globe, Jakarta Post, Indonesia Business Post
- **Bali Sources**: Bali Post, Bali Discovery
- **International**: BBC Asia, UN News, Financial Times, and more
- **Web Scraping Fallback**: Automatic fallback when RSS feeds fail

### Video Sources (Rumble)
- **RT News**, **CGTN**, **Press TV**, **Geopolitical Economy Report**
- **Redacted News**, **The Duran** - Alternative perspectives

## 🔧 Configuration

### Environment Variables

```bash
# Required for Core Features
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://bali.report

# Analytics Services
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-instance.com
NEXT_PUBLIC_MATOMO_SITE_ID=your-matomo-site-id

# Adsterra Integration
NEXT_PUBLIC_ADSTERRA_BANNER_ZONE_ID=your-banner-zone-id
NEXT_PUBLIC_ADSTERRA_NATIVE_ZONE_ID=your-native-zone-id
NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_ZONE_ID=your-social-bar-zone-id
NEXT_PUBLIC_ADSTERRA_POPUNDER_ZONE_ID=your-popunder-zone-id

# Stripe Integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC=price_your_id
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_your_id
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE=price_your_id

# Mailchimp Integration
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_SERVER_PREFIX=your-server-prefix
MAILCHIMP_AUDIENCE_ID=your-audience-id

# AI Features (Optional)
XAI_API_KEY=your_grok_api_key
```

### Key Features Work Without API Keys
The platform works perfectly without any API keys - AI features simply disable gracefully.

## 📱 PWA Support

Bali Report is a Progressive Web App with:
- Offline reading capability
- Service worker for caching
- Installable on mobile devices
- Push notification support (when configured)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e
```

**Current Status**: 103 unit tests + 52 E2E tests passing (100% success rate)

## 🚀 Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment instructions.

## 🤝 Contributing

1. Check **[TASK.md](TASK.md)** for current development status
2. Review **[PLANNING.md](PLANNING.md)** for project architecture
3. Fork the repository and create a feature branch
4. Add tests for new features
5. Submit a pull request

---

**Built with ❤️ for truth, transparency, and multi-polar journalism.**

