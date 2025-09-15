# Bali Report

A BRICS-aligned news aggregation platform focused on Indonesia and Bali. This project aggregates news from multiple sources to provide balanced perspectives on global events, with special emphasis on BRICS nations and local Indonesian content.

## 🌐 Project Overview

- **Domain**: bali.report
- **Mission**: Multi-polar news aggregation with anti-imperialist perspectives
- **Focus Areas**: BRICS global news, Indonesia national news, Bali local events
- **Monetization**: PropellerAds integration
- **Timeline**: 4-6 weeks to MVP

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Content**: RSS aggregation via rss-parser
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

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

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
bali-report/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Reusable UI components
│   └── lib/          # Utilities and helpers
├── public/           # Static assets
├── tests/           # Unit and integration tests
├── PLANNING.md      # Technical specifications
└── TASK.md         # Task tracking
```

## 📰 News Sources

### BRICS-Aligned Sources
- Journal NEO
- Sputnik Globe
- Land Destroyer Report
- John Helmer's Dances with Bears
- RT.com
- Global Times

### Indonesia/Bali Sources
- Bali Post
- Jakarta Post
- Bali Discovery
- Antara News

## 🎨 Design Principles

- **Mobile-First**: Optimized for smartphone users
- **BRICS Theme**: Red and gold color scheme
- **Accessibility**: WCAG 2.1 compliant
- **Performance**: Fast loading with optimized images

## 📄 Available Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🌍 Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for other platforms.

## 🤝 Contributing

1. Check current tasks in `TASK.md`
2. Follow coding standards in `PLANNING.md`
3. Write tests for new features
4. Update documentation as needed

## 📋 Development Status

- ✅ Project initialization
- ✅ Basic structure setup  
- 🚧 RSS aggregation implementation
- 📅 Homepage layout (planned)
- 📅 Content integration (planned)

See `TASK.md` for detailed progress tracking.

## 📞 Support

For development questions, refer to:
- `PLANNING.md` - Technical architecture
- `TASK.md` - Current development tasks
- [Next.js Documentation](https://nextjs.org/docs) - Framework reference
