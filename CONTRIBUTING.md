# 🤝 Contributing to Bali Report

## Overview

Thank you for your interest in contributing to Bali Report! This document provides guidelines for contributing to our BRICS-aligned news aggregation platform.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup
```bash
# Clone the repository
git clone <repository-url>
cd bali-report

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
bali-report/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities and helpers
│   └── tests/        # Unit and integration tests
├── public/           # Static assets
├── docs/            # Documentation
└── CONTRIBUTING.md  # This file
```

## 📋 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Follow Google TypeScript Style Guide
- Use TypeScript strict mode
- Write JSDoc comments

### Component Guidelines
- Use functional components
- Implement proper TypeScript types
- Add unit tests for new components
- Follow mobile-first approach
- Maintain accessibility standards

### Testing Requirements
- Write unit tests for new features
- Maintain 90%+ test coverage
- Test edge cases and failures
- Add integration tests when needed
- Document test scenarios

## 🔍 Content Guidelines

### RSS Source Integration
- Follow source verification process
- Implement proper error handling
- Add source to documentation
- Test feed reliability
- Monitor performance impact

### BPD-Related Code
- Clear documentation of BPD features
- Proper fund allocation tracking
- Transparent impact reporting
- Secure donation handling
- Privacy-focused design

### Content Moderation
- Implement content filtering
- Follow BRICS-aligned guidelines
- Maintain professional tone
- Clear source attribution
- Regular content review

## 🛠️ Pull Request Process

1. **Branch Naming**
   ```
   feature/descriptive-name
   fix/issue-description
   docs/update-type
   ```

2. **Commit Messages**
   ```
   feat: Add new RSS source integration
   fix: Resolve caching issue in feed parser
   docs: Update BPD integration guide
   ```

3. **Pull Request Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Documentation
   - [ ] Performance improvement

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Documentation updated
   - [ ] Tests passing
   - [ ] Performance verified
   ```

## 🔒 Content Moderation

### Source Review Process
1. Check source alignment
2. Verify reliability
3. Test feed stability
4. Document metadata
5. Monitor performance

### Content Standards
- Professional tone
- Factual reporting
- Clear attribution
- BRICS alignment
- No hate speech

### Compliance Requirements
- Follow AdSense guidelines
- Respect GDPR rules
- Follow UU ITE law
- Maintain transparency
- Protect user privacy

## 💰 Monetization Guidelines

### AdSense Integration
- Follow placement guidelines
- Maintain content standards
- Implement proper tracking
- Monitor performance
- Regular compliance check

### BPD Fundraising
- Secure payment handling
- Clear fund allocation
- Impact tracking
- Transparent reporting
- Privacy protection

## 🧪 Testing Guidelines

### Unit Tests
```typescript
// Example test structure
describe('RSS Parser', () => {
  it('should parse feed successfully', async () => {
    const feed = await parseRSSFeed(testUrl);
    expect(feed).toHaveProperty('items');
    expect(feed.items.length).toBeGreaterThan(0);
  });

  it('should handle feed errors', async () => {
    const feed = await parseRSSFeed(invalidUrl);
    expect(feed.error).toBeDefined();
    expect(feed.items).toHaveLength(0);
  });
});
```

### Integration Tests
```typescript
// Example integration test
describe('Feed Integration', () => {
  it('should aggregate multiple sources', async () => {
    const sources = ['rt.com', 'tass.com'];
    const feeds = await aggregateFeeds(sources);
    expect(feeds).toHaveLength(sources.length);
    expect(feeds[0].status).toBe('success');
  });
});
```

## 📝 Documentation Guidelines

### Code Comments
```typescript
/**
 * Fetches and parses RSS feed from given source
 * @param {string} url - The RSS feed URL
 * @param {FeedOptions} options - Parser options
 * @returns {Promise<Feed>} Parsed feed data
 * @throws {FeedError} When feed cannot be fetched/parsed
 */
async function parseRSSFeed(url: string, options?: FeedOptions): Promise<Feed> {
  // Implementation
}
```

### Component Documentation
```typescript
/**
 * ArticleCard Component
 * 
 * Displays an article preview with title, excerpt, and metadata.
 * Implements save-for-later and social sharing functionality.
 *
 * @component
 * @example
 * ```tsx
 * <ArticleCard
 *   article={articleData}
 *   onSave={handleSave}
 *   onShare={handleShare}
 * />
 * ```
 */
```

## 🎯 Quality Standards

### Performance Targets
- Page load: <3s
- Time to interactive: <5s
- Bundle size: <150KB
- Cache hit rate: >90%
- API response: <100ms

### Code Quality
- TypeScript strict mode
- No any types
- Full test coverage
- Clean code principles
- Regular audits

### Accessibility
- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Proper ARIA labels

## 🚀 Deployment

### Production Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Performance verified
- [ ] Security checked
- [ ] Analytics configured

### Monitoring
- Performance metrics
- Error tracking
- User analytics
- Feed reliability
- System health

## 🤝 Community Guidelines

### Communication
- Be respectful
- Stay professional
- Follow code of conduct
- Provide constructive feedback
- Help others learn

### Support
- Use issue templates
- Provide context
- Share solutions
- Document workarounds
- Update documentation

## 📈 Success Metrics

### Code Quality
- Test coverage >90%
- Zero TypeScript errors
- ESLint compliance
- Performance targets met
- Accessibility score >90

### Content Quality
- Source reliability
- Content accuracy
- Update frequency
- User engagement
- Feedback metrics

## 🔄 Review Process

### Code Review
1. Style compliance
2. Test coverage
3. Performance impact
4. Security check
5. Documentation

### Content Review
1. Source verification
2. Content standards
3. Moderation rules
4. Legal compliance
5. Impact assessment