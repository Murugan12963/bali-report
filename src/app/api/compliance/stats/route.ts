import { NextRequest, NextResponse } from 'next/server';
import { complianceService } from '@/lib/compliance-service';
import { advancedCacheService } from '@/lib/advanced-cache-service';

/**
 * GET /api/compliance/stats
 * Returns comprehensive compliance statistics
 */
export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'compliance:stats:daily';
    
    // Try to get from cache first
    const cached = await advancedCacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Mock data - in production, this would fetch from database
    const mockStats = {
      overallScore: 87.3,
      contentChecks: 15432,
      gdprCompliance: 92.1,
      uuiteCompliance: 84.7,
      criticalIssues: 2,
      warnings: 7,
      lastUpdated: new Date().toISOString(),
      dailyStats: {
        approved: 1847,
        rejected: 23,
        flagged: 45
      },
      categories: {
        content: { score: 89.2, issues: 3 },
        privacy: { score: 94.8, issues: 1 },
        cultural: { score: 82.1, issues: 4 },
        legal: { score: 88.9, issues: 1 }
      }
    };

    // Generate real compliance report for sample content
    const sampleContent = [
      {
        content: "BRICS nations continue to strengthen south-south cooperation for sustainable development",
        type: 'article' as const
      },
      {
        content: "Multipolar world order promotes mutual respect and cultural exchange",
        type: 'ai_generated' as const
      },
      {
        content: "Indonesia's cultural diversity represents peaceful coexistence",
        type: 'editorial' as const
      }
    ];

    const complianceResults = await Promise.all(
      sampleContent.map(item => 
        complianceService.checkContentCompliance(item.content, item.type)
      )
    );

    const report = complianceService.generateComplianceReport(complianceResults);

    // Update mock stats with real data
    const enhancedStats = {
      ...mockStats,
      overallScore: report.overallScore,
      criticalIssues: report.criticalIssues.length,
      warnings: complianceResults.reduce((sum, result) => sum + result.warnings.length, 0)
    };

    // Cache for 5 minutes
    await advancedCacheService.set(
      cacheKey, 
      enhancedStats, 
      300, 
      ['compliance', 'stats']
    );

    return NextResponse.json(enhancedStats);

  } catch (error) {
    console.error('Compliance stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance statistics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/stats/refresh
 * Refresh compliance statistics (clear cache and recalculate)
 */
export async function POST(request: NextRequest) {
  try {
    // Clear related cache
    await advancedCacheService.invalidateByTags(['compliance', 'stats']);

    // Force recalculation
    const response = await GET(request);
    
    return NextResponse.json({ 
      message: 'Compliance statistics refreshed',
      data: await response.json()
    });

  } catch (error) {
    console.error('Compliance refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh compliance statistics' },
      { status: 500 }
    );
  }
}