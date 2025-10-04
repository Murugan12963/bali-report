import { NextRequest, NextResponse } from 'next/server';
import { contentModerationService } from '@/lib/content-moderation';
import { rssAggregator, Article } from '@/lib/rss-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles, action } = body;

    if (action === 'moderate_batch') {
      // Validate articles array
      if (!articles || !Array.isArray(articles)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Missing or invalid articles array' 
          },
          { status: 400 }
        );
      }

      // Validate each article has required fields
      for (const article of articles) {
        if (!article.title || !article.description || !article.url) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Each article must have title, description, and url' 
            },
            { status: 400 }
          );
        }
      }

      // Moderate the articles
      const result = await contentModerationService.moderateArticles(articles);

      return NextResponse.json({
        success: true,
        message: `Moderated ${articles.length} articles`,
        results: {
          totalProcessed: articles.length,
          approved: result.approved.length,
          rejected: result.rejected.length,
          approvalRate: Math.round((result.approved.length / articles.length) * 100),
          approvedArticles: result.approved.map(article => ({
            title: article.title,
            source: article.source,
            url: article.link
          })),
          rejectedArticles: result.rejected.map((article, index) => ({
            title: article.title,
            source: article.source,
            reason: result.results[result.approved.length + index]?.reason
          }))
        }
      });
    }

    if (action === 'moderate_single') {
      const { article, existingArticles = [] } = body;

      if (!article || !article.title || !article.description || !article.url) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Article must have title, description, and url' 
          },
          { status: 400 }
        );
      }

      // Moderate single article
      const result = await contentModerationService.moderateArticle(article, existingArticles);

      return NextResponse.json({
        success: true,
        approved: result.approved,
        score: result.score,
        flags: result.flags.map(flag => ({
          type: flag.type,
          severity: flag.severity,
          description: flag.description,
          confidence: flag.confidence
        })),
        reason: result.reason
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid action. Must be "moderate_batch" or "moderate_single"' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error moderating content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while moderating content' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for content quality metrics and RSS testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      // Get quality metrics
      const metrics = contentModerationService.getQualityMetrics();
      
      return NextResponse.json({
        success: true,
        metrics: {
          totalArticlesProcessed: metrics.totalArticlesProcessed,
          approvedArticles: metrics.approvedArticles,
          rejectedArticles: metrics.rejectedArticles,
          duplicatesRemoved: metrics.duplicatesRemoved,
          qualityIssues: metrics.qualityIssues,
          sourceReliabilityUpdates: metrics.sourceReliabilityUpdates,
          approvalRate: metrics.totalArticlesProcessed > 0 
            ? Math.round((metrics.approvedArticles / metrics.totalArticlesProcessed) * 100)
            : 100
        }
      });
    }

    if (action === 'test_rss') {
      // Test RSS feeds with moderation
      console.log('🔍 Testing RSS feeds with content moderation...');
      
      const allArticles = await rssAggregator.fetchAllSources();
      
      // Take first 20 articles for testing
      const testArticles = allArticles.slice(0, 20);
      
      if (testArticles.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No articles found from RSS sources',
          results: {
            totalProcessed: 0,
            approved: 0,
            rejected: 0,
            approvalRate: 0
          }
        });
      }

      // Moderate the test articles
      const result = await contentModerationService.moderateArticles(testArticles);

      return NextResponse.json({
        success: true,
        message: `Tested ${testArticles.length} articles from RSS feeds`,
        results: {
          totalProcessed: testArticles.length,
          approved: result.approved.length,
          rejected: result.rejected.length,
          approvalRate: Math.round((result.approved.length / testArticles.length) * 100),
          sampleApproved: result.approved.slice(0, 5).map(article => ({
            title: article.title.slice(0, 80) + '...',
            source: article.source,
            category: article.category
          })),
          sampleRejected: result.rejected.slice(0, 3).map((article, index) => ({
            title: article.title.slice(0, 80) + '...',
            source: article.source,
            reason: result.results.find(r => !r.approved && r.reason)?.reason || 'Quality issues'
          }))
        }
      });
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid action. Must be "metrics" or "test_rss"' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error getting content quality data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while getting content quality data' 
      },
      { status: 500 }
    );
  }
}