# Advanced Analytics Dashboard

## Overview

The Bali Report Advanced Analytics Dashboard provides comprehensive, real-time insights into your platform's performance, user engagement, content popularity, and system health.

## Features

### 📊 Dashboard Sections

1. **Summary Statistics**
   - Total events tracked
   - Page views
   - Article views
   - User engagement metrics

2. **Page Analytics**
   - Top 10 most viewed pages
   - Unique page tracking
   - Page performance metrics

3. **Article Performance**
   - Top performing articles
   - Views by category (BRICS, Indonesia, Bali)
   - Views by source (RT News, TASS, etc.)

4. **User Engagement**
   - Vote tracking (upvotes/downvotes)
   - Social shares
   - Search queries
   - Newsletter signups

5. **Conversions & Revenue**
   - Donation tracking with amounts
   - Subscription revenue
   - Conversion rates
   - Campaign attribution

6. **System Health**
   - RSS fetch reliability
   - Articles aggregated
   - Error tracking
   - Performance metrics

7. **Activity Timeline**
   - Interactive time series chart
   - Daily activity breakdown
   - Configurable time ranges (7, 30, 90 days)

## Access

Navigate to: **http://localhost:3000/admin/analytics**

## Usage

### Tracking Events

The analytics system automatically tracks events throughout your application. You can also manually track events:

```typescript
import {
  trackAnalyticsPageView,
  trackAnalyticsArticleView,
  trackAnalyticsSearch,
  trackAnalyticsVote,
  trackAnalyticsShare,
  trackAnalyticsDonation,
  trackAnalyticsSubscription,
} from '@/lib/analytics/analytics-service';

// Track page view
trackAnalyticsPageView('/brics', 'BRICS News');

// Track article view
trackAnalyticsArticleView(
  'Putin Announces New BRICS Initiative',
  'BRICS',
  'RT News',
  'https://example.com/article'
);

// Track search
trackAnalyticsSearch('BRICS summit', 42);

// Track vote
trackAnalyticsVote('article-123', 'upvote');

// Track donation
trackAnalyticsDonation(50, 'BRICS Harvest Challenge');
```

### Fetching Analytics Data

```typescript
import { 
  getAnalyticsDashboardData,
  getAnalyticsSummary 
} from '@/lib/analytics/analytics-service';

// Get full dashboard data for 30 days
const data = getAnalyticsDashboardData(30);

// Get quick 7-day summary
const summary = getAnalyticsSummary();
```

### API Endpoints

#### Get Analytics Data

```bash
# Get full dashboard data for 30 days
GET /api/analytics?days=30&format=full

# Get quick summary
GET /api/analytics?format=summary
```

#### Response Example

```json
{
  "summary": {
    "totalEvents": 1234,
    "dateRange": {
      "start": 1704067200000,
      "end": 1706745600000
    },
    "lastUpdated": 1706745600000
  },
  "pageViews": {
    "totalViews": 5678,
    "uniquePages": 45,
    "topPages": [
      { "path": "/", "views": 1234 },
      { "path": "/brics", "views": 890 }
    ]
  },
  "articles": {
    "totalViews": 3456,
    "topArticles": [...],
    "viewsByCategory": {
      "BRICS": 2000,
      "Indonesia": 1000,
      "Bali": 456
    }
  },
  // ... more metrics
}
```

## Data Storage

### localStorage-Based

- **Storage Key**: `bali_report_analytics`
- **Max Events**: 10,000 (automatic cleanup)
- **Retention**: 90 days (automatic deletion of old events)
- **Format**: JSON array of event objects

### Event Structure

```typescript
interface AnalyticsEvent {
  id: string;                    // Unique event ID
  timestamp: number;             // Unix timestamp
  type: EventType;              // Event category
  category: string;             // Event category
  action: string;               // Event action
  label?: string;               // Event label
  value?: number;               // Numeric value
  metadata?: Record<string, any>; // Additional data
}
```

### Event Types

1. `pageview` - Page navigation
2. `article_view` - Article reads
3. `search` - Search queries
4. `vote` - Upvotes/downvotes
5. `share` - Social media shares
6. `newsletter_signup` - Newsletter conversions
7. `donation` - Donation events
8. `subscription` - Subscription conversions
9. `campaign_view` - Campaign views
10. `rss_fetch` - RSS aggregation
11. `error` - System errors

## Export/Import

### Export Data

Click the **Export Data** button in the dashboard to download all analytics data as JSON.

### Import Data

```typescript
import { analyticsStorage } from '@/lib/analytics/analytics-service';

const jsonData = '...'; // Your JSON data
const success = analyticsStorage.importData(jsonData);
```

## Performance

- **Dashboard Load**: <100ms (empty state)
- **Data Aggregation**: <50ms for 10K events
- **Time Series Generation**: <20ms
- **Export**: <10ms (instant)

## Security

- **Client-side only**: No backend required
- **localStorage**: Data stays in user's browser
- **No authentication**: Add if needed for production
- **Privacy-focused**: Can be cleared at any time

## Integration with Matomo

All tracking functions also send data to Matomo for:
- Cross-validation of metrics
- Server-side analytics
- External reporting
- Long-term data retention

## Testing

Run the analytics test suite:

```bash
npm test -- src/lib/analytics/__tests__/analytics-service.test.ts
```

**Test Coverage**: 23/23 tests passing
- Event storage and retrieval
- Tracking functions
- Analytics aggregation
- Data retention
- Export/import

## Troubleshooting

### Dashboard Shows No Data

1. Ensure you've navigated to pages that trigger tracking
2. Check browser console for errors
3. Verify localStorage is enabled
4. Check that events are being stored:
   ```javascript
   localStorage.getItem('bali_report_analytics')
   ```

### Data Not Persisting

- Check localStorage quota (usually 5-10MB)
- Ensure browser allows localStorage
- Verify no private browsing mode

### Performance Issues

- Clear old data: Click "Clear Data" button
- Reduce time range: Use 7-day view instead of 90-day
- Export and clear: Download data, then clear storage

## Future Enhancements

- [ ] Authentication and authorization
- [ ] Server-side data persistence
- [ ] More visualization types (pie charts, line charts)
- [ ] Real-time updates via WebSocket
- [ ] Custom date range picker
- [ ] Comparison views (week-over-week, month-over-month)
- [ ] Goal tracking and conversion funnels
- [ ] User segmentation
- [ ] Automated reports and email digests

## Support

For issues or questions:
- Check documentation in `/docs`
- Review test suite for usage examples
- Consult `TASK.md` for implementation details

## License

Part of the Bali Report project. See main LICENSE file.
