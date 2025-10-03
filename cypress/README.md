# Cypress E2E Testing Suite - Bali Report

## Overview

This directory contains comprehensive end-to-end (E2E) tests for the Bali Report project using Cypress. The test suite covers critical user flows, RSS aggregation, search functionality, community features, and BPD fundraising campaigns.

## Test Structure

```
cypress/
├── e2e/                          # E2E test specs
│   ├── 01-homepage.cy.ts         # Homepage and navigation tests
│   ├── 02-rss-aggregation.cy.ts  # RSS feed and category page tests
│   ├── 03-search-community.cy.ts # Search, voting, and saved articles
│   └── 04-fundraising.cy.ts      # BPD campaigns and donations
├── support/                      # Custom commands and utilities
│   ├── commands.ts               # Custom Cypress commands
│   └── e2e.ts                    # E2E support file
├── fixtures/                     # Test data (if needed)
└── README.md                     # This file
```

## Running Tests

### Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Server should be available at `http://localhost:3000`

### Run All E2E Tests (Headless)

```bash
npm run test:e2e
```

### Open Cypress Test Runner (Interactive)

```bash
npm run test:e2e:open
```

### Run All Tests (Unit + E2E)

```bash
npm run test:all
```

## Test Coverage

### 1. Homepage Tests (`01-homepage.cy.ts`)
- ✅ Page loads successfully
- ✅ RSS articles display
- ✅ Navigation links work
- ✅ Search functionality
- ✅ Theme toggle
- ✅ Article metadata validation

### 2. RSS Aggregation Tests (`02-rss-aggregation.cy.ts`)
- ✅ BRICS category page
- ✅ Indonesia category page
- ✅ Bali category page
- ✅ Article loading performance
- ✅ Source-specific validation
- ✅ Breadcrumb navigation

### 3. Search & Community Tests (`03-search-community.cy.ts`)
- ✅ Search page functionality
- ✅ Article search with results
- ✅ Empty query handling
- ✅ Relevance-based search
- ✅ Community voting system
- ✅ Community picks page
- ✅ Saved articles feature

### 4. Fundraising Tests (`04-fundraising.cy.ts`)
- ✅ Campaigns page
- ✅ Campaign statistics
- ✅ Donation buttons
- ✅ Progress visualization
- ✅ Impact dashboard
- ✅ Fund allocation display
- ✅ Subscription page

## Custom Commands

### `cy.visitAndWait(url)`
Visits a page and waits for it to stabilize.

```typescript
cy.visitAndWait('/');
```

### `cy.checkArticlesLoaded()`
Verifies that RSS articles have loaded on the page.

```typescript
cy.checkArticlesLoaded();
```

### `cy.searchArticles(query)`
Performs a search using the search bar.

```typescript
cy.searchArticles('BRICS');
```

## Configuration

Cypress configuration is in `cypress.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Viewport**: 1280x720
- **Video Recording**: Disabled (can be enabled)
- **Screenshots**: Enabled on failure
- **Retries**: 2 retries in CI mode

## Best Practices

1. **Use Custom Commands**: Leverage custom commands for common operations
2. **Wait Appropriately**: Use explicit waits when necessary
3. **Avoid Hardcoded Waits**: Use `cy.wait()` sparingly
4. **Test Real User Flows**: Focus on actual user journeys
5. **Keep Tests Isolated**: Each test should be independent

## Debugging Tips

### View Test Run Videos
Videos are disabled by default. To enable:
```typescript
// In cypress.config.ts
video: true
```

### Interactive Mode
Use `npm run test:e2e:open` to see tests run in real-time and debug issues.

### Screenshots
Failed tests automatically capture screenshots in `cypress/screenshots/`

### Console Logs
Check browser console in Cypress Test Runner for application logs.

## CI/CD Integration

To run Cypress tests in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: |
    npm run build
    npm start &
    npx wait-on http://localhost:3000
    npm run test:e2e
```

## Performance Metrics

Tests validate:
- Page load time < 15 seconds
- Article rendering < 10 seconds
- Search response < 5 seconds

## Maintenance

### Adding New Tests

1. Create a new `.cy.ts` file in `cypress/e2e/`
2. Follow naming convention: `NN-feature-name.cy.ts`
3. Use descriptive `describe` and `it` blocks
4. Add custom commands to `support/commands.ts` if needed

### Updating Tests

When adding new features:
1. Add corresponding E2E tests
2. Update this README with new test coverage
3. Ensure tests pass before merging

## Troubleshooting

### Tests Fail Locally
- Ensure dev server is running
- Clear browser cache
- Check for port conflicts
- Verify environment variables

### Timeout Errors
- Increase timeout in specific test
- Check network connectivity
- Verify RSS feeds are accessible

### Element Not Found
- Use more flexible selectors
- Add appropriate wait conditions
- Check for dynamic content loading

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [API Reference](https://docs.cypress.io/api/table-of-contents)

---

**Last Updated**: October 3, 2025  
**Test Suite Version**: 1.0.0  
**Cypress Version**: 15.3.0